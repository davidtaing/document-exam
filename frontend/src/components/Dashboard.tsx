import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, MessageCircle, Upload, Activity } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    processingDocuments: 0,
    completedDocuments: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/documents/list`)
      const data = await response.json()
      
      const totalDocuments = data.documents.length
      const processingDocuments = data.documents.filter((doc: any) => 
        doc.status === 'processing' || doc.status === 'uploading'
      ).length
      const completedDocuments = data.documents.filter((doc: any) => 
        doc.status === 'completed'
      ).length
      const totalPages = data.documents.reduce((sum: number, doc: any) => 
        sum + (doc.total_pages || 0), 0
      )
      
      setStats({
        totalDocuments,
        processingDocuments,
        completedDocuments,
        totalPages
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Processing',
      value: stats.processingDocuments,
      icon: Activity,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'Completed',
      value: stats.completedDocuments,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Total Pages',
      value: stats.totalPages,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  const quickActions = [
    {
      name: 'Upload Documents',
      description: 'Add new PDF documents to your collection',
      href: '/documents',
      icon: Upload,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Browse Documents',
      description: 'View and manage your document library',
      href: '/documents',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Start Chat',
      description: 'Ask questions about your documents',
      href: '/chat',
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your document examination workspace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {loading ? '-' : stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 ${action.bgColor} group-hover:bg-opacity-80`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {action.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Welcome Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Get Started with Document Examination
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Upload PDF documents to get started. Once processed, you can chat with your documents
                to extract insights, ask questions, and analyze content efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}