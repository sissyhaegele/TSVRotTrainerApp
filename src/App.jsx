import React, { useState, useEffect } from 'react';
import { Calendar, Users, X, Menu, LogOut } from 'lucide-react';
import WeeklyView from './components/WeeklyView';
import Courses from './components/Courses';
import Trainers from './components/Trainers';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8181/api'
  : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api';

function App() {
  const [activeTab, setActiveTab] = useState('weekly-plan');
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('tsvrot-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setAdminMode(userData.role === 'admin');
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, trainersRes] = await Promise.all([
        fetch(`${API_URL}/courses`),
        fetch(`${API_URL}/trainers`)
      ]);
      
      if (!coursesRes.ok || !trainersRes.ok) {
        throw new Error('Fehler beim Laden der Daten');
      }
      
      const coursesData = await coursesRes.json();
      const trainersData = await trainersRes.json();
      
      setCourses(coursesData);
      setTrainers(trainersData);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Daten konnten nicht geladen werden. Bitte Seite neu laden.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'TSVRot2024') {
      const userData = { name: 'Trainer', role: 'trainer' };
      localStorage.setItem('tsvrot-user', JSON.stringify(userData));
      setUser(userData);
      setAdminMode(false);
      setLoginError('');
      loadData();
    } else if (password === 'TSVAdmin2024') {
      const userData = { name: 'Admin', role: 'admin' };
      localStorage.setItem('tsvrot-user', JSON.stringify(userData));
      setUser(userData);
      setAdminMode(true);
      setLoginError('');
      loadData();
    } else {
      setLoginError('Falsches Passwort');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tsvrot-user');
    setUser(null);
    setAdminMode(false);
    setPassword('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-600 mb-2">TSV Rot</h1>
            <p className="text-gray-600">Trainer-Verwaltung</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Passwort eingeben"
                autoFocus
              />
            </div>
            
            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-600 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button - IM HEADER */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-red-700 rounded-md transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <h1 className="text-xl font-bold">TSV Rot Turnen</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-1.5 bg-red-700 rounded-lg hover:bg-red-800 transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex h-screen pt-14">
        {/* Backdrop für Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar - ✅ HIDDEN auf Mobile wenn geschlossen, FIXED als Overlay wenn offen */}
        <div className={`
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative 
          w-64 bg-white shadow-lg h-full z-40 
          transition-transform duration-300 ease-in-out
        `}>
          <nav className="mt-5 px-2">
            <button
              onClick={() => {
                setActiveTab('weekly-plan');
                setMobileMenuOpen(false);
              }}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeTab === 'weekly-plan' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="mr-3 h-5 w-5" />
              Wochenplan
            </button>
            <button
              onClick={() => {
                setActiveTab('courses');
                setMobileMenuOpen(false);
              }}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-1 ${
                activeTab === 'courses' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="mr-3 h-5 w-5" />
              Kurse
            </button>
            <button
              onClick={() => {
                setActiveTab('trainers');
                setMobileMenuOpen(false);
              }}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-1 ${
                activeTab === 'trainers' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Trainer
            </button>
          </nav>
          
          {adminMode && (
            <div className="mt-8 px-4">
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Admin-Funktionen
                </p>
                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:text-red-600">
                  <input
                    type="checkbox"
                    checked={deleteMode}
                    onChange={(e) => setDeleteMode(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>Lösch-Modus</span>
                </label>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-500">
              <p>Angemeldet als: <span className="font-medium">{user.name}</span></p>
              <p className="mt-1">Rolle: <span className="font-medium">{adminMode ? 'Admin' : 'Trainer'}</span></p>
            </div>
          </div>
        </div>

        {/* Content Area - Nimmt auf Desktop Platz NEBEN Sidebar, auf Mobile VOLLE Breite */}
        <div className="flex-1 overflow-auto w-full">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {loading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative mb-4">
                Lade Daten...
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}

            {activeTab === 'weekly-plan' && (
              <WeeklyView 
                courses={courses} 
                trainers={trainers}
                setCourses={setCourses}
              />
            )}
            {activeTab === 'courses' && (
              <Courses 
                courses={courses} 
                setCourses={setCourses} 
                trainers={trainers}
                deleteMode={deleteMode}
                adminMode={adminMode}
              />
            )}
            {activeTab === 'trainers' && (
              <Trainers 
                trainers={trainers} 
                setTrainers={setTrainers}
                deleteMode={deleteMode}
                adminMode={adminMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
