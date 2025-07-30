import { useState, useEffect } from 'react'
import FileUpload from './FileUpload'
import FileList from './FileList'

export interface PDFDocument {
  id: string
  filename: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  uploadProgress?: number
  processingProgress?: number
  createdAt: Date
  embeddings?: number
  pages?: number
  total_pages?: number
  pages_processed?: number
  file_size?: number
  collection_name?: string
  error_message?: string
}

export default function Documents() {
  const [documents, setDocuments] = useState<PDFDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/documents/list`)
      const data = await response.json()
      
      const mappedDocs = data.documents.map((doc: any) => ({
        id: doc.id,
        filename: doc.filename,
        status: doc.status,
        createdAt: new Date(doc.created_at),
        file_size: doc.file_size,
        collection_name: doc.collection_name,
        total_pages: doc.total_pages,
        pages_processed: doc.pages_processed,
        embeddings: doc.embeddings,
        error_message: doc.error_message
      }))
      
      setDocuments(mappedDocs)
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadStart = (file: File) => {
    const newDoc: PDFDocument = {
      id: Date.now().toString(),
      filename: file.name,
      status: 'uploading',
      uploadProgress: 0,
      createdAt: new Date()
    }
    setDocuments(prev => [newDoc, ...prev])
    return newDoc.id
  }

  const handleUploadProgress = (id: string, progress: number) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, uploadProgress: progress } : doc
    ))
  }

  const handleUploadComplete = (id: string, response: any) => {
    const backendDoc = response.document
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { 
        ...doc,
        id: backendDoc.id,
        status: backendDoc.status,
        uploadProgress: 100,
        file_size: backendDoc.file_size,
        collection_name: backendDoc.collection_name,
        total_pages: backendDoc.total_pages,
        pages_processed: backendDoc.pages_processed,
        embeddings: backendDoc.embeddings,
        error_message: backendDoc.error_message
      } : doc
    ))
  }

  const handleUploadError = (id: string, error: string) => {
    console.error('Upload error:', error)
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, status: 'error' } : doc
    ))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="mt-2 text-gray-600">Upload and manage your PDF documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <FileUpload
            onUploadStart={handleUploadStart}
            onUploadProgress={handleUploadProgress}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </div>

        <div className="lg:col-span-2">
          <FileList
            documents={documents}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}