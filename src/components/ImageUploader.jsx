import { ImageUp, Upload, X } from 'lucide-react'
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
    return (
      <div className="rounded-xl border-2 border-brand-green bg-brand-green-light p-3">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-white">
            <img
              src={image.previewUrl}
              alt="Uploaded prescription or report preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="truncate text-base font-medium text-brand-ink">{image.file.name}</p>
            <p className="text-sm text-brand-ink/70">
              {isProcessing ? `Reading document... ${ocrProgress}%` : 'Shared with Sahayak'}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove uploaded image"
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
      className={`flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
        isDragActive ? 'border-brand-blue bg-brand-blue-light' : 'border-brand-blue-dark/40 bg-white'
      }`}
    >
      <ImageUp className="h-6 w-6 text-brand-blue" aria-hidden="true" />
      <span className="text-base font-medium text-brand-ink">
        Upload prescription or medical report (JPG, JPEG, PNG)
      </span>
      <span className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
        <Upload className="h-4 w-4" aria-hidden="true" />
        Browse
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={(event) => validateAndSelect(event.target.files?.[0])}
      />
    </button>
  )
}
