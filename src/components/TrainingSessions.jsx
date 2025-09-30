import React, { useState } from 'react';
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

export default function TrainingSessions({ 
  sessions, 
  setSessions, 
  courses, 
  trainers, 
  deleteMode, 
  adminMode 
}) {
  const [newSession, setNewSession] = useState({
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    attendance: [],
    notes: ''
  });

  const addSession = () => {
    if (newSession.courseId && newSession.date) {
      const course = courses.find(c => c.id === parseInt(newSession.courseId));
      const attendance = course?.assignedTrainerIds?.map(trainerId => ({
        trainerId,
        isPresent: false
      })) || [];
      
      setSessions([...sessions, { 
        ...newSession,
        id: Date.now(),
        courseId: parseInt(newSession.courseId),
        attendance
      }]);
      
      setNewSession({
        courseId: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        attendance: [],
        notes: ''
      });
    }
  };

  const deleteSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const toggleAttendance = (sessionId, trainerId) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        const attendance = session.attendance.map(a => 
          a.trainerId === trainerId 
            ? { ...a, isPresent: !a.isPresent }
            : a
        );
        return { ...session, attendance };
      }
      return session;
    }));
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unbekannter Kurs';
  };

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId);
    return trainer ? `${trainer.firstName} ${trainer.lastName}` : 'Unbekannter Trainer';
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
      {adminMode && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Trainingseinheit erfassen</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              className="px-3 py-2 border rounded-lg"
              value={newSession.courseId}
              onChange={(e) => setNewSession({...newSession, courseId: e.target.value})}
            >
              <option value="">Kurs wählen</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.dayOfWeek})
                </option>
              ))}
            </select>
            
            <input
              type="date"
              className="px-3 py-2 border rounded-lg"
              value={newSession.date}
              onChange={(e) => setNewSession({...newSession, date: e.target.value})}
            />
            
            <input
              type="time"
              className="px-3 py-2 border rounded-lg"
              value={newSession.time}
              onChange={(e) => setNewSession({...newSession, time: e.target.value})}
              placeholder="Zeit (optional)"
            />
            
            <input
              type="text"
              className="px-3 py-2 border rounded-lg"
              value={newSession.notes}
              onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
              placeholder="Notizen (optional)"
            />
          </div>
          
          <button
            onClick={addSession}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
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
                      className="text-red-500 hover:text-red-700"
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

      {sortedSessions.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          Noch keine Trainingseinheiten erfasst. Fügen Sie oben Ihre erste Einheit hinzu!
        </div>
      )}
    </div>
  );
}
