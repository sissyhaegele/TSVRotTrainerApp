import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Plus, 
  Trash2, 
  Check, 
  X,
  UserCheck,
  UserX,
  Clock,
  FileText
} from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8181/api'
  : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api';

export default function TrainingSessions({ 
  sessions, 
  setSessions, 
  courses, 
  trainers, 
  deleteMode, 
  adminMode 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newSession, setNewSession] = useState({
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    attendance: [],
    notes: ''
  });

  // Lade Sessions beim Start
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/training-sessions`);
      if (!response.ok) throw new Error('Fehler beim Laden der Sessions');
      const data = await response.json();
      setSessions(data);
      setError(null);
    } catch (err) {
      console.error('Error loading sessions:', err);
      // Falls Backend-Endpunkt nicht existiert, localStorage als Fallback
      const localSessions = JSON.parse(localStorage.getItem('tsvrot-sessions') || '[]');
      setSessions(localSessions);
    } finally {
      setLoading(false);
    }
  };

  const addSession = async () => {
    if (newSession.courseId && newSession.date) {
      const course = courses.find(c => c.id === parseInt(newSession.courseId));
      const attendance = course?.assignedTrainerIds?.map(trainerId => ({
        trainerId,
        isPresent: false
      })) || [];
      
      const sessionData = {
        courseId: parseInt(newSession.courseId),
        date: newSession.date,
        time: newSession.time || null,
        notes: newSession.notes || null,
        attendance
      };

      try {
        setLoading(true);
        
        // Versuche mit Backend zu speichern
        try {
          const response = await fetch(`${API_URL}/training-sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              week_number: getWeekNumber(new Date(newSession.date)),
              year: new Date(newSession.date).getFullYear(),
              course_id: parseInt(newSession.courseId),
              trainer_id: attendance.length > 0 ? attendance[0].trainerId : null,
              hours: 1.0,
              status: 'done'
            })
          });
          
          if (!response.ok) throw new Error('Backend nicht verfügbar');
        } catch (backendError) {
          console.log('Backend nicht verfügbar, nutze localStorage');
        }

        // Immer auch lokal speichern für Kompatibilität
        const newSessionWithId = {
          ...sessionData,
          id: Date.now(),
          attendance
        };
        
        const updatedSessions = [...sessions, newSessionWithId];
        setSessions(updatedSessions);
        localStorage.setItem('tsvrot-sessions', JSON.stringify(updatedSessions));
        
        setNewSession({
          courseId: '',
          date: new Date().toISOString().split('T')[0],
          time: '',
          attendance: [],
          notes: ''
        });
        setError(null);
      } catch (err) {
        console.error('Error adding session:', err);
        setError('Session konnte nicht hinzugefügt werden');
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Möchten Sie diese Trainingseinheit wirklich löschen?')) return;
    
    try {
      setLoading(true);
      
      // Versuche mit Backend zu löschen
      try {
        const response = await fetch(`${API_URL}/training-sessions/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Backend nicht verfügbar');
      } catch (backendError) {
        console.log('Backend nicht verfügbar, nutze localStorage');
      }

      // Lokal löschen
      const updatedSessions = sessions.filter(s => s.id !== id);
      setSessions(updatedSessions);
      localStorage.setItem('tsvrot-sessions', JSON.stringify(updatedSessions));
      setError(null);
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Session konnte nicht gelöscht werden');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (sessionId, trainerId) => {
    const updatedSessions = sessions.map(session => {
      if (session.id === sessionId) {
        const attendance = session.attendance.map(a => 
          a.trainerId === trainerId 
            ? { ...a, isPresent: !a.isPresent }
            : a
        );
        return { ...session, attendance };
      }
      return session;
    });
    
    setSessions(updatedSessions);
    localStorage.setItem('tsvrot-sessions', JSON.stringify(updatedSessions));

    // Optional: Sync zu Backend
    try {
      const session = updatedSessions.find(s => s.id === sessionId);
      if (session) {
        const attendanceEntry = session.attendance.find(a => a.trainerId === trainerId);
        
        await fetch(`${API_URL}/training-sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            week_number: getWeekNumber(new Date(session.date)),
            year: new Date(session.date).getFullYear(),
            course_id: session.courseId,
            trainer_id: trainerId,
            hours: 1.0,
            status: attendanceEntry?.isPresent ? 'done' : 'absent'
          })
        });
      }
    } catch (err) {
      console.log('Backend sync failed, using localStorage only');
    }
  };

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? (course.name) : 'Unbekannter Kurs';
  };

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId);
    if (!trainer) return 'Unbekannter Trainer';
    return `${trainer.firstName || trainer.first_name} ${trainer.lastName || trainer.last_name}`;
  };

  const getAttendanceRate = (session) => {
    if (!session.attendance || session.attendance.length === 0) return 0;
    const present = session.attendance.filter(a => a.isPresent).length;
    return Math.round((present / session.attendance.length) * 100);
  };

  // Sortiere Sessions nach Datum (neueste zuerst)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Laden...
        </div>
      )}

      {adminMode && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Trainingseinheit erfassen</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              className="px-3 py-2 border rounded-lg"
              value={newSession.courseId}
              onChange={(e) => setNewSession({...newSession, courseId: e.target.value})}
              disabled={loading}
            >
              <option value="">Kurs wählen</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.dayOfWeek || course.day_of_week})
                </option>
              ))}
            </select>
            
            <input
              type="date"
              className="px-3 py-2 border rounded-lg"
              value={newSession.date}
              onChange={(e) => setNewSession({...newSession, date: e.target.value})}
              disabled={loading}
            />
            
            <input
              type="time"
              className="px-3 py-2 border rounded-lg"
              value={newSession.time}
              onChange={(e) => setNewSession({...newSession, time: e.target.value})}
              placeholder="Zeit (optional)"
              disabled={loading}
            />
            
            <input
              type="text"
              className="px-3 py-2 border rounded-lg"
              value={newSession.notes}
              onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
              placeholder="Notizen (optional)"
              disabled={loading}
            />
          </div>
          
          <button
            onClick={addSession}
            disabled={loading || !newSession.courseId || !newSession.date}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Einheit hinzufügen
          </button>
        </div>
      )}

      <div className="space-y-4">
        {sortedSessions.map(session => {
          const course = courses.find(c => c.id === session.courseId);
          const attendanceRate = getAttendanceRate(session);
          
          return (
            <div key={session.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{getCourseName(session.courseId)}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(session.date).toLocaleDateString('de-DE', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    {session.time && (
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {session.time}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    attendanceRate === 100 ? 'bg-green-100 text-green-800' :
                    attendanceRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {attendanceRate}% Anwesenheit
                  </div>
                  
                  {adminMode && deleteMode && (
                    <button
                      onClick={() => deleteSession(session.id)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {session.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-700">{session.notes}</p>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Anwesenheit der Trainer:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {session.attendance.map(({ trainerId, isPresent }) => (
                    <label 
                      key={trainerId} 
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                        isPresent 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <span className="flex items-center">
                        {isPresent ? (
                          <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                        ) : (
                          <UserX className="w-4 h-4 mr-2 text-gray-400" />
                        )}
                        <span className={isPresent ? 'font-medium' : 'text-gray-500'}>
                          {getTrainerName(trainerId)}
                        </span>
                      </span>
                      {adminMode && (
                        <input
                          type="checkbox"
                          checked={isPresent}
                          onChange={() => toggleAttendance(session.id, trainerId)}
                          disabled={loading}
                          className="ml-2"
                        />
                      )}
                    </label>
                  ))}
                  {(!session.attendance || session.attendance.length === 0) && (
                    <p className="text-sm text-gray-500 italic col-span-2">
                      Keine Trainer zugewiesen für diesen Kurs
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedSessions.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          Noch keine Trainingseinheiten erfasst. Fügen Sie oben Ihre erste Einheit hinzu!
        </div>
      )}
    </div>
  );
}
