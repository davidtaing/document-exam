import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

interface Collection {
  id: string
  collection_name: string
  filename: string
  created_at: string
  embeddings: number
  file_size: number | null
  filepath: string | null
  pages_processed: number
  status: string
  total_pages: number
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Chat() {
  const [searchParams] = useSearchParams()
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCollections()
  }, [])

  useEffect(() => {
    const collectionParam = searchParams.get('collection')
    if (collectionParam) {
      setSelectedCollection(collectionParam)
    }
  }, [searchParams])

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/documents/list`)
      const data = await response.json()
      setCollections(data.documents || [])
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !selectedCollection || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          collection_name: selectedCollection
        })
      })

      const data = await response.json()

      if (response.ok) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.answer,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
        <p className="mt-2 text-gray-600">
          {selectedCollection && searchParams.get('collection') 
            ? `Chatting with: ${collections.find(c => c.collection_name === selectedCollection)?.filename || selectedCollection}`
            : 'Chat with your documents'
          }
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        {/* Collection Selector */}
        <div className="p-6 border-b">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Document Collection
          </label>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a document...</option>
            {collections.map((collection) => (
              <option key={collection.collection_name} value={collection.collection_name}>
                {collection.filename} ({collection.total_pages} pages)
              </option>
            ))}
          </select>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 border-b">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">
              {selectedCollection ? 'Start chatting with your document!' : 'Select a document to start chatting'}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 max-w-xs md:max-w-md px-4 py-2 rounded-lg">
                    <p>Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedCollection ? "Ask a question about your document..." : "Select a document first"}
              disabled={!selectedCollection || isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !selectedCollection || isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}