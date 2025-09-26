import React, { useState } from 'react'
import { Users, BookOpen, Calendar, CalendarCheck } from 'lucide-react'
import TrainersPage from './components/trainers/TrainersPage'
import CoursesPage from './components/courses/CoursesPage'
import WeeklyPlanPage from './components/weekly-plan/WeeklyPlanPage'
import Dashboard from './components/Dashboard'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const handleLogin = (password: string) => {
    if (password === 'TSVAdmin2024') {
      setIsLoggedIn(true)
      setIsAdmin(true)
    } else if (password === 'TSVRot2024') {
      setIsLoggedIn(true)
      setIsAdmin(false)
    }
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/tsv-logo.jpg" 
                  alt="TSV 1905 Rot" 
                  className="tsv-logo"
                />
                <h1 className="text-xl font-bold text-red-600">TSV Rot Trainer-App</h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <TabButton
                  active={activeTab === 'dashboard'}
                  onClick={() => setActiveTab('dashboard')}
                  icon={Calendar}
                  label="Dashboard"
                />
                <TabButton
                  active={activeTab === 'weekly-plan'}
                  onClick={() => setActiveTab('weekly-plan')}
                  icon={CalendarCheck}
                  label="Wochenplan"
                />
                <TabButton
                  active={activeTab === 'trainers'}
                  onClick={() => setActiveTab('trainers')}
                  icon={Users}
                  label="Trainer"
                />
                <TabButton
                  active={activeTab === 'courses'}
                  onClick={() => setActiveTab('courses')}
                  icon={BookOpen}
                  label="Kurse"
                />
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                {isAdmin ? 'Admin' : 'Trainer'}
              </span>
              <button
                onClick={() => setIsLoggedIn(false)}
                className="btn btn-secondary"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {activeTab === 'dashboard' && <Dashboard isAdmin={isAdmin} onTabChange={setActiveTab} />}
        {activeTab === 'weekly-plan' && <WeeklyPlanPage isAdmin={isAdmin} />}
        {activeTab === 'trainers' && <TrainersPage isAdmin={isAdmin} />}
        {activeTab === 'courses' && <CoursesPage isAdmin={isAdmin} />}
      </main>
    </div>
  )
}

function LoginForm({ onLogin }: { onLogin: (password: string) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password === 'TSVAdmin2024') {
      onLogin(password)
    } else if (password === 'TSVRot2024') {
      onLogin(password)
    } else {
      setError('Ungültiges Passwort')
      setPassword('')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img
            src="/tsv-logo.jpg"
            alt="TSV 1905 Rot"
            className="login-logo"
          />
          <h1 className="login-title">TSV 1905 Rot</h1>
          <p className="login-subtitle">Trainer-Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="login-input-group">
            <label className="login-label">Passwort</label>
            <input
              type="password"
              placeholder="Passwort eingeben"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Anmelden
          </button>
        </form>
      </div>
    </div>
  )
}

function TabButton({
  active, onClick, icon: Icon, label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{className?: string}>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
        active
          ? 'border-red-500 text-red-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  )
}

export default App





