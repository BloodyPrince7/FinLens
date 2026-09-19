import { AlertTriangle, Bot, BrainCircuit, Download, FileText, Image as ImageIcon, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DOCUMENT_TYPES, documentTypeLabel } from '../constants/documentTypes'
import { analyzeDocument, deleteDocument, downloadDocument, getDocument, listDocuments } from '../services/financeService'

const FILTERS = [{ value: 'all', label: 'All' }, ...DOCUMENT_TYPES]

const MEMORY_STATUS = {
  added: { label: 'In financial memory', className: 'bg-brand-blue-light text-brand-blue-dark' },
  pending: { label: 'Adding to memory...', className: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Memory unavailable', className: 'bg-red-50 text-red-600' },
  disabled: { label: 'Memory disabled', className: 'bg-gray-100 text-gray-500' },
}

export default function DocumentHistory({ geminiModel }) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError('')
    listDocuments(filter)
      .then((data) => {
        if (!cancelled) setDocuments(data.documents || [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load your documents.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filter])

  async function handleDelete(id) {
    if (!window.confirm('Delete this document? This cannot be undone.')) return
    setBusyId(id)
    setError('')
    try {
      await deleteDocument(id)
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    } catch (err) {
      setError(err.message || 'Unable to delete this document.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleReanalyze(id) {
    setBusyId(id)
    setError('')
    try {
      const result = await analyzeDocument(id, geminiModel)
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id
            ? { ...doc, summary: result.summary, processing_status: 'analyzed', memory_status: 'pending' }
            : doc,
        ),
      )
    } catch (err) {
      setError(err.message || 'Unable to re-analyze this document right now.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleAsk(id, filename, documentType) {
    setBusyId(id)
    setError('')
    try {
      const doc = await getDocument(id)
      navigate('/assistant', {
        state: {
          document: {
            filename: doc.filename || filename,
            documentType: doc.document_type || documentType,
            summary: doc.summary,
            fields: doc.fields || {},
            risks: doc.risks || [],
          },
        },
      })
    } catch (err) {
      setError(err.message || 'Unable to open this document for chat right now.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              filter === item.value
                ? 'bg-brand-blue-dark text-white'
                : 'bg-brand-beige text-brand-ink/70 hover:bg-brand-blue-light'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-800" role="alert">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-base">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-brand-blue-light bg-white p-8 text-brand-ink/60">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading your documents...
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-brand-blue-light bg-white p-8 text-center text-brand-ink/60">
          No documents in this category yet. Upload one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-2xl border-2 border-brand-blue-light bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-beige text-brand-blue-dark">
                    {doc.content_type === 'application/pdf' ? (
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <ImageIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-ink">{doc.filename}</p>
                    <p className="text-sm text-brand-ink/60">{documentTypeLabel(doc.document_type)}</p>
                    <p className="text-xs text-brand-ink/45">Uploaded {new Date(doc.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      doc.processing_status === 'analyzed'
                        ? 'bg-brand-green-light text-brand-green'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {doc.processing_status === 'analyzed' ? 'Analyzed' : 'Uploaded'}
                  </span>
                  {doc.processing_status === 'analyzed' && MEMORY_STATUS[doc.memory_status] && (
                    <span
                      title={doc.memory_status === 'failed' ? 'Cognee could not process this document, but it stays saved and downloadable.' : undefined}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${MEMORY_STATUS[doc.memory_status].className}`}
                    >
                      <BrainCircuit className="h-3 w-3" aria-hidden="true" />
                      {MEMORY_STATUS[doc.memory_status].label}
                    </span>
                  )}
                </div>
              </div>

              {doc.summary && <p className="mt-2 text-sm text-brand-ink/75">{doc.summary}</p>}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAsk(doc.id, doc.filename, doc.document_type)}
                  disabled={busyId === doc.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue-dark px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"
                >
                  <Bot className="h-3.5 w-3.5" aria-hidden="true" /> Ask about this
                </button>
                {doc.has_file && (
                  <button
                    type="button"
                    onClick={() => downloadDocument(doc.id, doc.filename).catch((err) => setError(err.message))}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-blue-dark/20 px-3 py-1.5 text-xs font-semibold text-brand-blue-dark hover:bg-brand-blue-light"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleReanalyze(doc.id)}
                  disabled={busyId === doc.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-blue-dark/20 px-3 py-1.5 text-xs font-semibold text-brand-blue-dark hover:bg-brand-blue-light disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Re-analyze
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  disabled={busyId === doc.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
