import Dashboard from './components/Dashboard'
import Documents from './components/Documents'
import Chat from './components/Chat'
import Sidebar from './components/Sidebar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        
        <div className="lg:pl-72">
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
