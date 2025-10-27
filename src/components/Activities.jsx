import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Plus, 
  Trash2,
  Clock,
  FileText,
  Tag
} from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8181/api'
  : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api';

export default function Activities({ 
  trainers, 
  deleteMode, 
  adminMode 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [selectedTrainers, setSelectedTrainers] = useState([]);
  
  const [newActivity, setNewActivity] = useState({
    date: new Date().toISOString().split('T')[0],
    activityType: '',
    customType: '',
    title: '',
    hours: '',
    notes: ''
  });

  const activityTypes = [
    { value: 'ferienspass', label: 'Ferienspaß' },
    { value: 'vereinsfest', label: 'Vereinsfest' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'fortbildung', label: 'Fortbildung' },
    { value: 'sonstiges', label: 'Sonstiges' }
  ];

  // Lade Aktivitäten beim Start
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/special-activities`);
      if (!response.ok) throw new Error('Fehler beim Laden der Aktivitäten');
      const data = await response.json();
      setActivities(data);
      setError(null);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Aktivitäten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const addActivity = async () => {
    // Validierung
    if (!newActivity.date) {
      setError('Bitte Datum angeben');
      return;
    }
    if (!newActivity.activityType) {
      setError('Bitte Aktivitätstyp wählen');
      return;
    }
    if (newActivity.activityType === 'sonstiges' && !newActivity.customType) {
      setError('Bitte Beschreibung für "Sonstiges" angeben');
      return;
    }
    if (!newActivity.title) {
      setError('Bitte Titel angeben');
      return;
    }
    if (!newActivity.hours || parseFloat(newActivity.hours) <= 0) {
      setError('Bitte gültige Stundenzahl angeben');
      return;
    }
    if (selectedTrainers.length === 0) {
      setError('Bitte mindestens einen Trainer auswählen');
      return;
    }

    const activityData = {
      date: newActivity.date,
      weekNumber: getWeekNumber(new Date(newActivity.date)),
      year: new Date(newActivity.date).getFullYear(),
      activityType: newActivity.activityType,
      customType: newActivity.activityType === 'sonstiges' ? newActivity.customType : null,
      title: newActivity.title,
      hours: parseFloat(newActivity.hours),
      notes: newActivity.notes || null,
      trainerIds: selectedTrainers
    };

    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/special-activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Speichern');
      }

      // Formular zurücksetzen
      setNewActivity({
        date: new Date().toISOString().split('T')[0],
        activityType: '',
        customType: '',
        title: '',
        hours: '',
        notes: ''
      });
      setSelectedTrainers([]);
      
      // Aktivitäten neu laden
      await loadActivities();
      setError(null);
      
    } catch (err) {
      console.error('Error adding activity:', err);
      setError(err.message || 'Aktivität konnte nicht gespeichert werden');
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (activityId, date) => {
    if (!window.confirm('Möchten Sie diese Aktivität wirklich löschen? Alle Stunden werden von den beteiligten Trainern abgezogen.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/special-activities/${activityId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Fehler beim Löschen');
      
      await loadActivities();
      setError(null);
    } catch (err) {
      console.error('Error deleting activity:', err);
      setError('Aktivität konnte nicht gelöscht werden');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrainerSelection = (trainerId) => {
    setSelectedTrainers(prev => {
      if (prev.includes(trainerId)) {
        return prev.filter(id => id !== trainerId);
      } else {
        return [...prev, trainerId];
      }
    });
  };

  const getActivityTypeLabel = (type) => {
    const found = activityTypes.find(at => at.value === type);
    return found ? found.label : type;
  };

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId);
    if (!trainer) return 'Unbekannter Trainer';
    return `${trainer.firstName || trainer.first_name} ${trainer.lastName || trainer.last_name}`;
  };

  // Gruppiere Aktivitäten nach Datum und Titel (gleiche Aktivität = mehrere Trainer)
  const groupedActivities = activities.reduce((acc, activity) => {
    const key = `${activity.date}_${activity.title}`;
    if (!acc[key]) {
      acc[key] = {
        ...activity,
        trainers: []
      };
    }
    acc[key].trainers.push({
      id: activity.trainer_id,
      name: getTrainerName(activity.trainer_id),
      hours: activity.hours
    });
    return acc;
  }, {});

  const sortedActivities = Object.values(groupedActivities).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <button
            onClick={() => setError(null)}
            className="absolute top-2 right-2 text-red-700"
          >
            ×
          </button>
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          Laden...
        </div>
      )}

      {/* Erfassungs-Formular */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Außerplanmäßige Aktivität erfassen
        </h2>
        
        <div className="space-y-4">
          {/* Zeile 1: Datum, Aktivitätstyp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum *
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newActivity.date}
                onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aktivitätstyp *
              </label>
              <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newActivity.activityType}
                onChange={(e) => setNewActivity({...newActivity, activityType: e.target.value, customType: ''})}
                disabled={loading}
              >
                <option value="">-- Bitte wählen --</option>
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Freitext bei Sonstiges */}
          {newActivity.activityType === 'sonstiges' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung (bei Sonstiges) *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newActivity.customType}
                onChange={(e) => setNewActivity({...newActivity, customType: e.target.value})}
                placeholder="z.B. Sommerfest Vorbereitung"
                disabled={loading}
              />
            </div>
          )}

          {/* Zeile 2: Titel, Stunden */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel / Beschreibung *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newActivity.title}
                onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                placeholder="z.B. Ferienspaß Herbst 2025"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dauer in Stunden *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newActivity.hours}
                onChange={(e) => setNewActivity({...newActivity, hours: e.target.value})}
                placeholder="z.B. 4.0"
                disabled={loading}
              />
            </div>
          </div>

          {/* Trainer Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beteiligte Trainer * ({selectedTrainers.length} ausgewählt)
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trainers
                  .filter(t => t.isActive || t.is_active)
                  .sort((a, b) => {
                    const lastNameA = a.lastName || a.last_name || '';
                    const lastNameB = b.lastName || b.last_name || '';
                    return lastNameA.localeCompare(lastNameB);
                  })
                  .map(trainer => (
                    <label 
                      key={trainer.id} 
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedTrainers.includes(trainer.id)
                          ? 'bg-blue-50 border border-blue-300'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTrainers.includes(trainer.id)}
                        onChange={() => toggleTrainerSelection(trainer.id)}
                        disabled={loading}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                      />
                      <span className={selectedTrainers.includes(trainer.id) ? 'font-medium' : ''}>
                        {trainer.firstName || trainer.first_name} {trainer.lastName || trainer.last_name}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notizen (optional)
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newActivity.notes}
              onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
              placeholder="Zusätzliche Informationen..."
              disabled={loading}
            />
          </div>
        </div>
        
        <button
          onClick={addActivity}
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Aktivität speichern
        </button>
      </div>

      {/* Liste der Aktivitäten */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Erfasste Aktivitäten</h2>
        
        {sortedActivities.map((activity, index) => {
          const activityTypeLabel = activity.activity_type === 'sonstiges' && activity.custom_type
            ? activity.custom_type
            : getActivityTypeLabel(activity.activity_type);
          
          return (
            <div key={`${activity.date}_${activity.title}_${index}`} className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(activity.date).toLocaleDateString('de-DE', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      {activityTypeLabel}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activity.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-gray-600 text-sm">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {activity.hours} Stunden
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {activity.trainers.length} Trainer
                    </span>
                  </div>
                </div>
                
                {adminMode && deleteMode && (
                  <button
                    onClick={() => deleteActivity(activity.id, activity.date)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {activity.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-700">{activity.notes}</p>
                  </div>
                </div>
              )}
              
              {/* Beteiligte Trainer */}
              <div>
                <h4 className="font-medium mb-2 text-sm text-gray-700">Beteiligte Trainer:</h4>
                <div className="flex flex-wrap gap-2">
                  {activity.trainers.map((trainer, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {trainer.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedActivities.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Noch keine Aktivitäten erfasst.</p>
          <p className="text-sm mt-1">Fügen Sie oben Ihre erste außerplanmäßige Aktivität hinzu!</p>
        </div>
      )}
    </div>
  );
}
