/**
 * Document text extraction for uploaded financial documents.
 *
 * Images (JPG/JPEG/PNG): real, local, browser-based OCR via Tesseract.js -
 * unchanged from the original implementation, no server round-trip.
 *
 * PDFs: Tesseract.js doesn't handle text-layer PDFs well, so these are sent
 * to the FastAPI backend's PyMuPDF-based extractor instead (see
 * backend/services/pdf_service.py via financeService.uploadDocument).
 *
 * `extractTextFromDocument` is the contract the rest of the app depends on -
 * callers only need the returned shape, not which path produced it.
 */

import { createWorker } from 'tesseract.js'
import { uploadDocument } from './financeService'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
export const ALLOWED_DOCUMENT_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf']
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export function validateImageFile(file) {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return 'Please upload a JPG, JPEG, PNG, or PDF file.'
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'File is too large. Please upload a file smaller than 10 MB.'
  }
  return null
}

/**
 * Runs real OCR on the given image file using Tesseract.js (English model,
 * loaded on demand in the browser).
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
      error: 'We could not extract readable text. Please upload a clearer document.',
    }
  } finally {
    await worker?.terminate()
  }
}

/**
 * @param {File} file
 * @param {string} documentType - one of the backend's DocumentType values
 * @param {(percent: number) => void} [onProgress]
 * @returns {Promise<{ status: 'success' | 'error', text?: string, documentId?: string, error?: string }>}
 */
export async function extractTextFromDocument(file, documentType, onProgress) {
  const validationError = validateImageFile(file)
  if (validationError) {
    return { status: 'error', error: validationError }
  }

  if (file.type === 'application/pdf') {
    try {
      onProgress?.(30)
      const result = await uploadDocument({ documentType, file })
      onProgress?.(100)
      return { status: 'success', text: result.summary || 'Document uploaded.', documentId: result.id }
    } catch (error) {
      return {
        status: 'error',
        error: error.message || 'Unable to process this document. Please try another file.',
      }
    }
  }

  const ocrResult = await extractTextFromImage(file, onProgress)
  if (ocrResult.status === 'error') return ocrResult

  try {
    const result = await uploadDocument({ documentType, extractedText: ocrResult.text })
    return { status: 'success', text: ocrResult.text, documentId: result.id }
  } catch (error) {
    return {
      status: 'error',
      error: error.message || 'Unable to process this document. Please try another file.',
    }
  }
}
