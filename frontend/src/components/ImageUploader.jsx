import { FileText, ImageUp, Upload, X } from 'lucide-react'
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
      <div className="rounded-xl border-2 border-brand-green bg-brand-green-light p-3">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
            {isPdf ? (
              <FileText className="h-7 w-7 text-brand-blue-dark" aria-hidden="true" />
            ) : (
              <img
                src={image.previewUrl}
                alt="Uploaded document preview"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <p className="truncate text-base font-medium text-brand-ink">{image.file.name}</p>
            <p className="text-sm text-brand-ink/70">
              {isProcessing ? statusLabel || `Reading document... ${ocrProgress}%` : 'Shared with FinLens AI'}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove uploaded document"
            className="rounded-full p-2 text-brand-ink/70 hover:bg-white hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isProcessing && (
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-brand-blue transition-all"
              style={{ width: `${ocrProgress}%` }}
            />
          </div>
        )}

        {!isProcessing && extractedText && (
          <div className="mt-3 rounded-lg bg-white p-3">
            <p className="mb-1 text-sm font-semibold text-brand-ink">Extracted text</p>
            <p className="max-h-32 overflow-y-auto whitespace-pre-wrap text-sm text-brand-ink/80">
              {extractedText}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragActive(true)
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
      className={`flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive ? 'border-brand-blue bg-brand-blue-light' : 'border-brand-blue-dark/40 bg-white'
      }`}
    >
      <ImageUp className="h-10 w-10 text-brand-blue" aria-hidden="true" />
      <span className="text-base font-medium text-brand-ink">
        Upload ITR, bank statements, loan agreements, or financial documents
      </span>
      <span className="text-sm text-brand-ink/60">Supported formats: PDF, JPG, JPEG, PNG</span>
      <span className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
        <Upload className="h-4 w-4" aria-hidden="true" />
        Upload Document
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        className="hidden"
        onChange={(event) => validateAndSelect(event.target.files?.[0])}
      />
    </button>
  )
}
