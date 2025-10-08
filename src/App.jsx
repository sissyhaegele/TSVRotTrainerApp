import React, { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, Settings, Menu, X } from 'lucide-react';
import Courses from './components/Courses';
import Trainers from './components/Trainers';
import StaffingOverview from './components/StaffingOverview';
import WeeklyView from './components/WeeklyView';
import Login from './components/Login';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8181/api'
  : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api';

export default function App() {
  // ========== 1. ALLE useState HOOKS ZUERST ==========
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  
  // ✅ KORRIGIERT: Keine localStorage-Initialisierung mehr, laden von DB
  const [trainers, setTrainers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ GEÄNDERT: Standard-Tab ist jetzt 'weekly-plan' statt 'trainers'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('tsvrot-activeTab') || 'weekly-plan';
  });
  
  const [adminMode, setAdminMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ========== 2. ALLE useEffect HOOKS ==========
  
  // Login Check
  useEffect(() => {
    const loggedIn = localStorage.getItem('tsvrot-isLoggedIn');
    const role = localStorage.getItem('tsvrot-role');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      setUserRole(role || 'trainer');
      setAdminMode(role === 'admin');
    }
  }, []);

  // Lade Daten von Azure DB beim Start
  useEffect(() => {
    const loadData = async () => {
      if (!isLoggedIn) return;
      
      try {
        setLoading(true);
        
        // Parallel laden für bessere Performance
        const [trainersRes, coursesRes] = await Promise.all([
          fetch(`${API_URL}/trainers`),
          fetch(`${API_URL}/courses`)
        ]);

        if (trainersRes.ok) {
          const trainersData = await trainersRes.json();
          setTrainers(trainersData);
        } else {
          console.error('Failed to load trainers');
        }

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
        } else {
          console.error('Failed to load courses');
        }

        // Sessions werden von TrainingSessions-Komponente geladen (Hybrid-System)
        const localSessions = JSON.parse(localStorage.getItem('tsvrot-sessions') || '[]');
        setSessions(localSessions);
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoggedIn]);

  // Active Tab speichern
  useEffect(() => {
    localStorage.setItem('tsvrot-activeTab', activeTab);
  }, [activeTab]);

  // ========== 3. FUNKTIONEN ==========
  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setAdminMode(role === 'admin');
    localStorage.setItem('tsvrot-isLoggedIn', 'true');
    localStorage.setItem('tsvrot-role', role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setAdminMode(false);
    localStorage.removeItem('tsvrot-isLoggedIn');
    localStorage.removeItem('tsvrot-role');
  };

  // ========== 4. LOGIN CHECK ==========
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // ========== 5. BERECHTIGUNGEN ==========
  const canEdit = userRole === 'admin';
  const canAssignTrainers = userRole === 'admin' || userRole === 'trainer';

  // ========== 6. LOADING STATE ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Daten...</p>
        </div>
      </div>
    );
  }

  // ========== 7. RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mit Logout */}
      <div className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-red-600">TSV Rot Trainer-Verwaltung</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {userRole === 'admin' ? 'Administrator' : 'Trainer'}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Abmelden
          </button>
        </div>
      </div>
      
      <div className="flex h-screen pt-14">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-red-600 text-white rounded-md shadow-lg"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        
        {/* Sidebar - ✅ WOCHENPLAN AN ERSTER STELLE */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block w-64 bg-white shadow-lg absolute lg:relative h-full z-40`}>
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
            
            {canEdit && (
              <>
                <button
                  onClick={() => {
                    setActiveTab('overview');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-1 ${
                    activeTab === 'overview' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Übersicht
                </button>
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-8 ${
                    activeTab === 'admin' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Admin
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Main Content - ✅ WOCHENPLAN AN ERSTER STELLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeTab === 'weekly-plan' && (
            <WeeklyView
              courses={courses}
              trainers={trainers}
              setCourses={setCourses}
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
          {activeTab === 'courses' && (
            <Courses
              courses={courses}
              setCourses={setCourses}
              trainers={trainers}
              deleteMode={deleteMode}
              adminMode={adminMode}
            />
          )}
          {activeTab === 'overview' && canEdit && (
            <StaffingOverview courses={courses} />
          )}
          
          {activeTab === 'admin' && canEdit && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Admin Einstellungen</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={deleteMode}
                    onChange={(e) => setDeleteMode(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Löschmodus aktivieren</span>
                </label>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-2">System-Info</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Trainer: {trainers.length}</p>
                    <p>Kurse: {courses.length}</p>
                    <p>Backend: Azure Cloud Database</p>
                    <p>Version: 2.0 (Cloud-Sync)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
