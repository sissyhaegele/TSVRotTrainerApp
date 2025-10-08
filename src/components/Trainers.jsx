import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Calendar,
  Award,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8181/api'
  : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api';

export default function Trainers({ trainers, setTrainers, deleteMode, adminMode }) {
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [trainerHours, setTrainerHours] = useState({});
  const [newTrainer, setNewTrainer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    availability: [],
    qualifications: []
  });
  const [trainerStats, setTrainerStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lade Trainer beim Start
  useEffect(() => {
    loadTrainers();
  }, []);

  // Berechne Trainer-Statistiken beim Laden und bei Änderungen
  useEffect(() => {
    calculateTrainerStats();
  }, [trainers]);

  const loadTrainers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/trainers`);
      if (!response.ok) throw new Error('Fehler beim Laden der Trainer');
      const data = await response.json();
      setTrainers(data);
      setError(null);
    } catch (err) {
      console.error('Error loading trainers:', err);
      setError('Trainer konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const calculateTrainerStats = () => {
    const sessions = JSON.parse(localStorage.getItem('tsvrot-sessions') || '[]');
    const stats = {};
    const currentYear = new Date().getFullYear();
    
    trainers.forEach(trainer => {
      stats[trainer.id] = {
        totalSessions: 0,
        presentCount: 0,
        hoursCompleted: 0,
        hoursThisMonth: 0,
        lastSession: null
      };
    });

    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const sessionYear = sessionDate.getFullYear();
      const isCurrentMonth = sessionDate.getMonth() === new Date().getMonth() && 
                            sessionYear === currentYear;
      
      if (session.attendance) {
        session.attendance.forEach(att => {
          if (stats[att.trainerId]) {
            if (sessionYear === currentYear) {
              stats[att.trainerId].totalSessions++;
              
              if (att.isPresent) {
                stats[att.trainerId].presentCount++;
                stats[att.trainerId].hoursCompleted++;
                
                if (isCurrentMonth) {
                  stats[att.trainerId].hoursThisMonth++;
                }
                
                if (!stats[att.trainerId].lastSession || 
                    sessionDate > new Date(stats[att.trainerId].lastSession)) {
                  stats[att.trainerId].lastSession = session.date;
                }
              }
            }
          }
        });
      }
    });

    setTrainerStats(stats);
  };

  const daysOfWeek = [
    'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 
    'Freitag', 'Samstag', 'Sonntag'
  ];

  const qualificationOptions = [
    'Kinderturnen', 'Fitness', 'Yoga', 'Pilates', 
    'Gymnastik', 'Seniorensport', 'Geräteturnen'
  ];

  const addTrainer = async () => {
    if (newTrainer.firstName && newTrainer.lastName) {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/trainers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: newTrainer.firstName,
            lastName: newTrainer.lastName,
            email: newTrainer.email || null,
            phone: newTrainer.phone || null
          })
        });
        
        if (!response.ok) throw new Error('Fehler beim Hinzufügen');
        
        const savedTrainer = await response.json();
        setTrainers([...trainers, savedTrainer]);
        setNewTrainer({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          availability: [],
          qualifications: []
        });
        setError(null);
      } catch (err) {
        console.error('Error adding trainer:', err);
        setError('Trainer konnte nicht hinzugefügt werden');
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteTrainer = async (id) => {
    if (!window.confirm('Trainer wirklich löschen?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/trainers/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Fehler beim Löschen');
      
      setTrainers(trainers.filter(t => t.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting trainer:', err);
      setError('Trainer konnte nicht gelöscht werden');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (trainer) => {
    setEditingTrainer({...trainer});
  };

  const saveEdit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/trainers/${editingTrainer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editingTrainer.firstName || editingTrainer.first_name,
          lastName: editingTrainer.lastName || editingTrainer.last_name,
          email: editingTrainer.email || null,
          phone: editingTrainer.phone || null
        })
      });
      
      if (!response.ok) throw new Error('Fehler beim Speichern');
      
      const updatedTrainer = await response.json();
      setTrainers(trainers.map(t => 
        t.id === updatedTrainer.id ? updatedTrainer : t
      ));
      setEditingTrainer(null);
      setError(null);
    } catch (err) {
      console.error('Error updating trainer:', err);
      setError('Änderungen konnten nicht gespeichert werden');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingTrainer(null);
  };

  const toggleDay = (trainer, day) => {
    const updated = trainer.availability?.includes(day)
      ? trainer.availability.filter(d => d !== day)
      : [...(trainer.availability || []), day];
    
    if (editingTrainer && editingTrainer.id === trainer.id) {
      setEditingTrainer({...editingTrainer, availability: updated});
    } else {
      setNewTrainer({...newTrainer, availability: updated});
    }
  };

  const toggleQualification = (trainer, qual) => {
    const updated = trainer.qualifications?.includes(qual)
      ? trainer.qualifications.filter(q => q !== qual)
      : [...(trainer.qualifications || []), qual];
    
    if (editingTrainer && editingTrainer.id === trainer.id) {
      setEditingTrainer({...editingTrainer, qualifications: updated});
    } else {
      setNewTrainer({...newTrainer, qualifications: updated});
    }
  };

  const getTrainerName = (trainer) => {
    return `${trainer.firstName || trainer.first_name} ${trainer.lastName || trainer.last_name}`;
  };

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
          <h2 className="text-xl font-semibold mb-4">Trainer hinzufügen</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Vorname"
              className="px-3 py-2 border rounded-lg"
              value={newTrainer.firstName}
              onChange={(e) => setNewTrainer({...newTrainer, firstName: e.target.value})}
              disabled={loading}
            />
            
            <input
              type="text"
              placeholder="Nachname"
              className="px-3 py-2 border rounded-lg"
              value={newTrainer.lastName}
              onChange={(e) => setNewTrainer({...newTrainer, lastName: e.target.value})}
              disabled={loading}
            />
            
            <input
              type="email"
              placeholder="E-Mail"
              className="px-3 py-2 border rounded-lg"
              value={newTrainer.email}
              onChange={(e) => setNewTrainer({...newTrainer, email: e.target.value})}
              disabled={loading}
            />
            
            <input
              type="tel"
              placeholder="Telefon"
              className="px-3 py-2 border rounded-lg"
              value={newTrainer.phone}
              onChange={(e) => setNewTrainer({...newTrainer, phone: e.target.value})}
              disabled={loading}
            />
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Verfügbarkeit:</h3>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newTrainer.availability?.includes(day) || false}
                    onChange={() => toggleDay(newTrainer, day)}
                    className="mr-1"
                    disabled={loading}
                  />
                  <span className="text-sm">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Qualifikationen:</h3>
            <div className="flex flex-wrap gap-2">
              {qualificationOptions.map(qual => (
                <label key={qual} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newTrainer.qualifications?.includes(qual) || false}
                    onChange={() => toggleQualification(newTrainer, qual)}
                    className="mr-1"
                    disabled={loading}
                  />
                  <span className="text-sm">{qual}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button
            onClick={addTrainer}
            disabled={loading || !newTrainer.firstName || !newTrainer.lastName}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Trainer hinzufügen
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainers.map(trainer => (
          <div key={trainer.id} className="bg-white rounded-lg shadow p-6">
            {editingTrainer?.id === trainer.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    className="px-3 py-2 border rounded-lg"
                    value={editingTrainer.firstName || editingTrainer.first_name}
                    onChange={(e) => setEditingTrainer({...editingTrainer, firstName: e.target.value})}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    className="px-3 py-2 border rounded-lg"
                    value={editingTrainer.lastName || editingTrainer.last_name}
                    onChange={(e) => setEditingTrainer({...editingTrainer, lastName: e.target.value})}
                    disabled={loading}
                  />
                  <input
                    type="email"
                    className="px-3 py-2 border rounded-lg"
                    value={editingTrainer.email || ''}
                    onChange={(e) => setEditingTrainer({...editingTrainer, email: e.target.value})}
                    disabled={loading}
                  />
                  <input
                    type="tel"
                    className="px-3 py-2 border rounded-lg"
                    value={editingTrainer.phone || ''}
                    onChange={(e) => setEditingTrainer({...editingTrainer, phone: e.target.value})}
                    disabled={loading}
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-2">Verfügbarkeit:</h4>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingTrainer.availability?.includes(day) || false}
                          onChange={() => toggleDay(editingTrainer, day)}
                          className="mr-1"
                          disabled={loading}
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Qualifikationen:</h4>
                  <div className="flex flex-wrap gap-2">
                    {qualificationOptions.map(qual => (
                      <label key={qual} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingTrainer.qualifications?.includes(qual) || false}
                          onChange={() => toggleQualification(editingTrainer, qual)}
                          className="mr-1"
                          disabled={loading}
                        />
                        <span className="text-sm">{qual}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={saveEdit}
                    disabled={loading}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={loading}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {getTrainerName(trainer)}
                    </h3>
                    <div className="space-y-1 mt-2">
                      {trainer.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {trainer.email}
                        </div>
                      )}
                      {trainer.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {trainer.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {adminMode && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(trainer)}
                        disabled={loading}
                        className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {deleteMode && (
                        <button
                          onClick={() => deleteTrainer(trainer.id)}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Stunden-Statistik */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3 mb-3 border border-blue-100">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {trainerHours[trainer.id] || 0}
                      </div>
                      <div className="text-xs text-gray-600 flex items-center justify-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Stunden
                      </div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-green-600">
                        {trainerStats[trainer.id]?.presentCount || 0}
                      </div>
                      <div className="text-xs text-gray-600 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Einheiten
                      </div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-600">
                        {trainerStats[trainer.id]?.totalSessions > 0 
                          ? Math.round((trainerStats[trainer.id].presentCount / trainerStats[trainer.id].totalSessions) * 100)
                          : 100}%
                      </div>
                      <div className="text-xs text-gray-600">Quote</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-100">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        Diesen Monat: {trainerStats[trainer.id]?.hoursThisMonth || 0} Std.
                      </span>
                      <span>{new Date().getFullYear()}</span>
                    </div>
                  </div>
                </div>

                {trainer.availability && trainer.availability.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Verfügbarkeit:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {trainer.availability.map(day => (
                        <span key={day} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {trainer.qualifications && trainer.qualifications.length > 0 && (
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <Award className="w-4 h-4 mr-1" />
                      Qualifikationen:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {trainer.qualifications.map(qual => (
                        <span key={qual} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {trainers.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          Noch keine Trainer angelegt. Fügen Sie oben Ihren ersten Trainer hinzu!
        </div>
      )}
    </div>
  );
}
