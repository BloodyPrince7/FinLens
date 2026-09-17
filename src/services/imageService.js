/**
 * Real, local, browser-based OCR via Tesseract.js.
 *
 * `extractTextFromImage` is the contract the rest of the app depends on.
 * Swap its body for a call to a backend endpoint backed by Amazon Textract
 * later - callers only need the returned { text, confidence, status } shape,
 * not how it was produced.
 */

import { createWorker } from 'tesseract.js'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Please upload a JPG, JPEG, or PNG image.'
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image is too large. Please upload a file smaller than 5 MB.'
  }
  return null
}

/**
 * Runs real OCR on the given image file using Tesseract.js (English model,
 * loaded on demand in the browser - no server, no AWS Textract yet).
 *
 * @param {File} imageFile
 * @param {(percent: number) => void} [onProgress] - 0-100 while recognizing.
 * @returns {Promise<{ text: string, confidence?: number, status: 'success' | 'error', error?: string }>}
 */
export async function extractTextFromImage(imageFile, onProgress) {
  let worker
  try {
    worker = await createWorker('eng', undefined, {
      logger: (message) => {
        if (message.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(message.progress * 100))
        }
      },
    })

    const result = await worker.recognize(imageFile)
    const text = result.data.text.trim()

    return {
      text: text || 'No readable text was found in this image.',
      confidence: result.data.confidence,
      status: 'success',
    }
  } catch (error) {
    console.error('[OCR] Tesseract.js failed', error)
    return {
      text: '',
      status: 'error',
      error: error.message || 'Could not read text from this image. Please try a clearer photo.',
    }
  } finally {
    await worker?.terminate()
  }
}
