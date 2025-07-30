import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, FileText, MessageCircle, Menu, X } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Chat', href: '/chat', icon: MessageCircle },
]

export default function Sidebar() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                <div className="flex h-16 shrink-0 items-center">
                  <h1 className="text-xl font-bold text-gray-900">Document Exam</h1>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = location.pathname === item.href
                          return (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                className={`group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${
                                  isActive
                                    ? 'bg-gray-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <item.icon className="h-6 w-6 shrink-0" />
                                {item.name}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-gray-900">Document Exam</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 ${
                            isActive
                              ? 'bg-gray-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
          Document Exam
        </div>
      </div>
    </>
  )
}