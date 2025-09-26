import React, { useState } from 'react'
import { Users, BookOpen, Calendar, CalendarCheck } from 'lucide-react'
import TrainersPage from './components/trainers/TrainersPage'
import CoursesPage from './components/courses/CoursesPage'
import WeeklyPlanPage from './components/weekly-plan/WeeklyPlanPage'

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
                <h1 className="text-xl font-bold text-blue-600">TSV Rot Trainer-App</h1>
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
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'weekly-plan' && <WeeklyPlanPage isAdmin={isAdmin} />}
        {activeTab === 'trainers' && <TrainersPage isAdmin={isAdmin} />}
        {activeTab === 'courses' && <CoursesPage isAdmin={isAdmin} />}
      </main>
    </div>
  )
}

function LoginForm({ onLogin }: { onLogin: (password: string) => void }) {
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">TSV Rot Login</h2>
          <p className="mt-2 text-gray-600">Trainer-Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Passwort eingeben"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button type="submit" className="w-full btn btn-primary">
            Anmelden
          </button>
        </form>
        <div className="text-center text-sm text-gray-500">
          <p>Admin: TSVAdmin2024</p>
          <p>Trainer: TSVRot2024</p>
        </div>
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
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  )
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Akute Probleme diese Woche */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Akute Trainer-Engpässe diese Woche!</h3>
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Mittwoch:</strong> Seniorengymnastik (10:00-11:00) - Kein Trainer!</li>
                <li><strong>Dienstag nächste Woche:</strong> Turnzwerge (15:30-16:30) - 1 Trainer fehlt!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Trainer</h3>
          <p className="text-3xl font-bold text-blue-600">3</p>
          <p className="text-sm text-gray-500">Aktive Trainer</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Kurse</h3>
          <p className="text-3xl font-bold text-green-600">5</p>
          <p className="text-sm text-gray-500">Aktive Kurse</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Diese Woche</h3>
          <p className="text-3xl font-bold text-red-600">2</p>
          <p className="text-sm text-gray-500">Trainer fehlen</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Vertretungen</h3>
          <p className="text-3xl font-bold text-orange-600">1</p>
          <p className="text-sm text-gray-500">Nächste Woche</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">🎉 Neue Funktion: Wochenplan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800">📅 Wochenplan & Vertretungen</h3>
            <p className="text-sm text-blue-600">Pro Woche sehen wo Trainer fehlen - nächste 8 Wochen</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800">🚨 Akute Engpässe</h3>
            <p className="text-sm text-green-600">Sofortiger Überblick über fehlende Trainer</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h3 className="font-medium text-orange-800">📞 Trainer-Kontakte</h3>
            <p className="text-sm text-orange-600">Telefon & E-Mail direkt verfügbar</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800">🔄 Vertretungsmanagement</h3>
            <p className="text-sm text-purple-600">Wer vertritt wen und warum?</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
