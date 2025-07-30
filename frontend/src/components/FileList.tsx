import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import type { PDFDocument } from './Documents'

interface FileListProps {
  documents: PDFDocument[]
  loading?: boolean
}

export default function FileList({ documents, loading }: FileListProps) {
  const navigate = useNavigate()
  const getStatusColor = (status: PDFDocument['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600 bg-blue-100'
      case 'processing':
        return 'text-yellow-600 bg-yellow-100'
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: PDFDocument['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading'
      case 'processing':
        return 'Processing'
      case 'completed':
        return 'Completed'
      case 'error':
        return 'Error'
      default:
        return 'Unknown'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleChatClick = (document: PDFDocument) => {
    if (document.status === 'completed' && document.collection_name) {
      navigate(`/chat?collection=${encodeURIComponent(document.collection_name)}`)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Documents</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading documents...</p>
        </div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Documents</h2>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading a PDF file.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <div key={doc.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.filename}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(doc.createdAt)} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {getStatusText(doc.status)}
                    </span>
                    {doc.collection_name && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Collection: {doc.collection_name}
                      </span>
                    )}
                  </div>

                  {doc.status === 'completed' && doc.total_pages && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600">
                        <span>📄 {doc.total_pages} pages • </span>
                        <span>🧠 {doc.embeddings || doc.pages_processed} embeddings</span>
                      </div>
                    </div>
                  )}

                  {doc.status === 'error' && doc.error_message && (
                    <div className="mt-2">
                      <div className="text-xs text-red-600">
                        Error: {doc.error_message}
                      </div>
                    </div>
                  )}

                  {(doc.status === 'uploading' && doc.uploadProgress !== undefined) && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Uploading...</span>
                        <span>{Math.round(doc.uploadProgress)}%</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${doc.uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {doc.status === 'processing' && (
                    <div className="mt-2">
                      <div className="flex items-center text-xs text-yellow-600">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-yellow-600 mr-2"></div>
                        <span>Processing PDF and generating embeddings...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Button */}
              {doc.status === 'completed' && doc.collection_name && (
                <div className="flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleChatClick(doc)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}