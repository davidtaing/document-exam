import { useState, useRef } from 'react'

interface FileUploadProps {
  onUploadStart: (file: File) => string
  onUploadProgress: (id: string, progress: number) => void
  onUploadComplete: (id: string, response: any) => void
  onUploadError: (id: string, error: string) => void
}

export default function FileUpload({
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed')
        return
      }

      const id = onUploadStart(file)
      uploadFile(file, id)
    })
  }

  const uploadFile = async (file: File, id: string) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          onUploadProgress(id, progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          onUploadComplete(id, response)
        } else {
          const error = JSON.parse(xhr.responseText)
          onUploadError(id, error.error || 'Upload failed')
        }
      })

      xhr.addEventListener('error', () => {
        onUploadError(id, 'Network error')
      })

      xhr.open('POST', `${import.meta.env.VITE_BACKEND_URL}/api/documents/upload`)
      xhr.send(formData)
    } catch (error) {
      onUploadError(id, 'Upload failed')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload PDF</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        <div className="text-gray-600">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-lg font-medium">
            Drop PDF files here, or click to select
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Maximum file size: 100MB
          </p>
        </div>
      </div>
    </div>
  )
}