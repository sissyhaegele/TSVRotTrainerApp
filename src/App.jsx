import React, { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, Settings, Menu, X } from 'lucide-react';
import Courses from './components/Courses';
import Trainers from './components/Trainers';
import StaffingOverview from './components/StaffingOverview';
import WeeklyView from './components/WeeklyView';
import Login from './components/Login';

export default function App() {
  // ========== 1. ALLE useState HOOKS ZUERST ==========
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [trainers, setTrainers] = useState(() => {
    const saved = localStorage.getItem('tsvrot-trainers');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) return parsed;
    }
    return [
      { id: 1, firstName: "Irmgard", lastName: "Stegmueller", email: "irmgard.stegmueller@tsvrot.de", phone: "" },
      { id: 2, firstName: "Ulrike", lastName: "Kessler", email: "ulrike.kessler@tsvrot.de", phone: "" },
      { id: 3, firstName: "Sarah", lastName: "Winkler", email: "sarah.winkler@tsvrot.de", phone: "" },
      { id: 4, firstName: "Desiree", lastName: "Knopf", email: "desiree.knopf@tsvrot.de", phone: "" },
      { id: 5, firstName: "Julia", lastName: "Miller", email: "julia.miller@tsvrot.de", phone: "" },
      { id: 6, firstName: "Sabrina", lastName: "Gund", email: "sabrina.gund@tsvrot.de", phone: "" },
      { id: 7, firstName: "Josef", lastName: "Kahlenberg", email: "josef.kahlenberg@tsvrot.de", phone: "" },
      { id: 8, firstName: "Jasmin", lastName: "Ittensohn", email: "jasmin.ittensohn@tsvrot.de", phone: "" },
      { id: 9, firstName: "Marvin", lastName: "Voegeli", email: "marvin.voegeli@tsvrot.de", phone: "" }
    ];
  });
  
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('tsvrot-courses');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) return parsed;
    }
    return [
      { id: 1, name: "Frauengymnastik", dayOfWeek: "Montag", startTime: "20:00", endTime: "21:00", location: "Multifunktionshalle Rot", category: "Gymnastik", requiredTrainers: 1, assignedTrainerIds: [1] },
      { id: 2, name: "Aerobic / Dance & mehr", dayOfWeek: "Montag", startTime: "21:00", endTime: "22:00", location: "Multifunktionshalle Rot", category: "Fitness", requiredTrainers: 1, assignedTrainerIds: [2] },
      { id: 3, name: "Seniorengymnastik", dayOfWeek: "Dienstag", startTime: "15:00", endTime: "16:00", location: "Multifunktionshalle Rot", category: "Senioren", requiredTrainers: 1, assignedTrainerIds: [1] },
      { id: 4, name: "Turnwichtel (4-6 Jahre)", dayOfWeek: "Dienstag", startTime: "15:00", endTime: "16:00", location: "Schulturnhalle Rot", category: "Kinderturnen", requiredTrainers: 2, assignedTrainerIds: [3, 4] },
      { id: 5, name: "Turnzwerge (2-4 Jahre)", dayOfWeek: "Dienstag", startTime: "16:00", endTime: "17:00", location: "Schulturnhalle Rot", category: "Kinderturnen", requiredTrainers: 2, assignedTrainerIds: [3, 4] },
      { id: 6, name: "Kinderturnen ab 5 Jahre", dayOfWeek: "Freitag", startTime: "15:30", endTime: "16:30", location: "Schulturnhalle Rot", category: "Kinderturnen", requiredTrainers: 2, assignedTrainerIds: [5, 6] },
      { id: 7, name: "Kinderturnen ab 8 Jahre", dayOfWeek: "Freitag", startTime: "16:30", endTime: "17:30", location: "Schulturnhalle Rot", category: "Kinderturnen", requiredTrainers: 2, assignedTrainerIds: [5, 6] }
    ];
  });
  
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('tsvrot-activeTab') || 'trainers';
  });
  
  const [adminMode, setAdminMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ========== 2. ALLE useEffect HOOKS ==========
  useEffect(() => {
    const loggedIn = localStorage.getItem('tsvrot-isLoggedIn');
    const role = localStorage.getItem('tsvrot-role');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      setUserRole(role || 'trainer');
      setAdminMode(role === 'admin');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tsvrot-trainers', JSON.stringify(trainers));
  }, [trainers]);

  useEffect(() => {
    localStorage.setItem('tsvrot-courses', JSON.stringify(courses));
  }, [courses]);

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

  // ========== 6. RENDER ==========
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
        
        {/* Sidebar */}
                {/* Sidebar */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block w-64 bg-white shadow-lg absolute lg:relative h-full z-40`}>
          <nav className="mt-5 px-2">
            <button
              onClick={() => setActiveTab('trainers')}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeTab === 'trainers' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Trainer
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-1 ${
                activeTab === 'courses' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="mr-3 h-5 w-5" />
              Kurse
            </button>
            <button
              onClick={() => setActiveTab('weekly-plan')}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-1 ${
                activeTab === 'weekly-plan' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="mr-3 h-5 w-5" />
              Wochenplan
            </button>
            <button
              onClick={() => setActiveTab('staffing')}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-1 ${
                activeTab === 'staffing' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              Besetzung
            </button>
            {canEdit && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-8 ${
                  activeTab === 'admin' ? 'bg-red-100 text-red-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Admin
              </button>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'trainers' && (
            <Trainers
              trainers={trainers}
              setTrainers={setTrainers}
              deleteMode={deleteMode}
              adminMode={adminMode}
              canEdit={canEdit}
            />
          )}
          {activeTab === 'courses' && (
            <Courses
              courses={courses}
              setCourses={setCourses}
              trainers={trainers}
              deleteMode={deleteMode}
              adminMode={adminMode}
              canEdit={canEdit}
              canAssignTrainers={canAssignTrainers}
            />
          )}
          {activeTab === 'weekly-plan' && (
            <WeeklyView
              courses={courses}
              trainers={trainers}
              canAssignTrainers={canAssignTrainers}
              setCourses={setCourses}
            />
          )}
          {activeTab === 'staffing' && (
            <StaffingOverview
              courses={courses}
              />
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
                  <span>LÃ¶schmodus aktivieren</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



