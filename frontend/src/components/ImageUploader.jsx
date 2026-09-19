import { motion } from 'framer-motion'
import { FileText, ImageUp, Sparkles, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { validateImageFile } from '../services/imageService'

export default function ImageUploader({
  image,
  onSelect,
  onRemove,
  onError,
  isProcessing,
  ocrProgress = 0,
  extractedText = '',
  statusLabel,
}) {
  const inputRef = useRef(null)
  const [isDragActive, setIsDragActive] = useState(false)

  function validateAndSelect(file) {
    if (!file) return
    const validationError = validateImageFile(file)
    if (validationError) {
      onError(validationError)
      return
    }
    onSelect(file)
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragActive(false)
    validateAndSelect(event.dataTransfer.files?.[0])
  }

  if (image) {
    const isPdf = image.file.type === 'application/pdf'
    return (
      <div className="relative overflow-hidden rounded-3xl border border-[#00baf2]/50 bg-gradient-to-br from-white to-[#f0f7fd] p-5 shadow-sm">
        {/* Animated scanning laser line when processing */}
        {isProcessing && <div className="animate-laser-scan" />}

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#e3edf7] bg-white shadow-xs">
            {isPdf ? (
              <FileText className="h-8 w-8 text-[#002970]" aria-hidden="true" />
            ) : (
              <img
                src={image.previewUrl}
                alt="Uploaded document preview"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-base font-extrabold text-[#002970]">{image.file.name}</p>
            <p className="text-xs font-semibold text-[#64748b]">
              {isProcessing ? statusLabel || `Reading document... ${ocrProgress}%` : 'Uploaded to FinLens AI Engine'}
            </p>
            {isProcessing && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e3edf7]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#002970] to-[#00baf2]"
                    initial={{ width: '15%' }}
                    animate={{ width: `${Math.max(20, ocrProgress)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#00baf2]">Processing</span>
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={onRemove}
            aria-label="Remove uploaded document"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#64748b] shadow-xs transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {!isProcessing && extractedText && (
          <div className="mt-3.5 rounded-2xl border border-[#e3edf7] bg-white p-3.5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#002970]">Extracted Text Preview</p>
            <p className="max-h-28 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-[#334155]">
              {extractedText}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragActive(true)
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      className={`group flex w-full flex-col items-center justify-center gap-3.5 rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
        isDragActive
          ? 'border-[#00baf2] bg-[#e7f6fd]'
          : 'border-[#00baf2]/40 bg-white hover:border-[#00baf2] hover:bg-[#f8fbfe] hover:shadow-md hover:shadow-[#00baf2]/10'
      }`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#002970] to-[#00baf2] text-white shadow-md shadow-[#002970]/20 transition-transform group-hover:scale-110">
        <Upload className="h-8 w-8" />
      </div>
      <div>
        <p className="text-base font-black text-[#002970]">
          Drag &amp; drop document, or <span className="text-[#00baf2] underline underline-offset-4">browse files</span>
        </p>
        <p className="mt-1 text-xs font-semibold text-[#64748b]">
          Supports PDF agreements, ITR receipts, salary slips, and JPEG / PNG images up to 10 MB
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-[#f0f7fd] px-3.5 py-1 text-[11px] font-bold text-[#002970]">
        <Sparkles className="h-3 w-3 text-[#00baf2]" />
        <span>PyMuPDF Text Extraction &amp; Gemini Multimodal Vision</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={(event) => validateAndSelect(event.target.files?.[0])}
      />
    </motion.button>
  )
}
