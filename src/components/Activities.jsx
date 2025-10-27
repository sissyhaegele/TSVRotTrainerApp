import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Plus, 
  Trash2,
  Clock,
  FileText,
  Tag,
  Edit2,
  X
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
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState(null);
  
  const [activityForm, setActivityForm] = useState({
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

  const resetForm = () => {
    setActivityForm({
      date: new Date().toISOString().split('T')[0],
      activityType: '',
      customType: '',
      title: '',
      hours: '',
      notes: ''
    });
    setSelectedTrainers([]);
    setEditMode(false);
    setEditingActivityId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (activity) => {
    // Finde alle Trainer-IDs für diese Aktivität
    const activityTrainers = activities
      .filter(a => a.date === activity.date && a.title === activity.title)
      .map(a => a.trainer_id);

    setActivityForm({
      date: activity.date.split('T')[0],
      activityType: activity.activity_type,
      customType: activity.custom_type || '',
      title: activity.title,
      hours: activity.hours.toString(),
      notes: activity.notes || ''
    });
    setSelectedTrainers(activityTrainers);
    setEditMode(true);
    setEditingActivityId(activity.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const saveActivity = async () => {
    // Validierung
    if (!activityForm.date) {
      setError('Bitte Datum angeben');
      return;
    }
    if (!activityForm.activityType) {
      setError('Bitte Aktivitätstyp wählen');
      return;
    }
    if (activityForm.activityType === 'sonstiges' && !activityForm.customType) {
      setError('Bitte Beschreibung für "Sonstiges" angeben');
      return;
    }
    if (!activityForm.title) {
      setError('Bitte Titel angeben');
      return;
    }
    if (!activityForm.hours || parseFloat(activityForm.hours) <= 0) {
      setError('Bitte gültige Stundenzahl angeben');
      return;
    }
    if (selectedTrainers.length === 0) {
      setError('Bitte mindestens einen Trainer auswählen');
      return;
    }

    const activityData = {
      date: activityForm.date,
      weekNumber: getWeekNumber(new Date(activityForm.date)),
      year: new Date(activityForm.date).getFullYear(),
      activityType: activityForm.activityType,
      customType: activityForm.activityType === 'sonstiges' ? activityForm.customType : null,
      title: activityForm.title,
      hours: parseFloat(activityForm.hours),
      notes: activityForm.notes || null,
      trainerIds: selectedTrainers
    };

    try {
      setLoading(true);
      
      if (editMode) {
        const response = await fetch(`${API_URL}/special-activities/${editingActivityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activityData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Fehler beim Aktualisieren');
        }
      } else {
        const response = await fetch(`${API_URL}/special-activities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activityData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Fehler beim Speichern');
        }
      }

      await loadActivities();
      setError(null);
      closeModal();
      
    } catch (err) {
      console.error('Error saving activity:', err);
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

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Außerplanmäßige Aktivitäten</h2>
        {adminMode && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            <Plus size={20} />
            Aktivität erfassen
          </button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editMode ? 'Aktivität bearbeiten' : 'Außerplanmäßige Aktivität erfassen'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datum *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={activityForm.date}
                    onChange={(e) => setActivityForm({...activityForm, date: e.target.value})}
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aktivitätstyp *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={activityForm.activityType}
                    onChange={(e) => setActivityForm({...activityForm, activityType: e.target.value, customType: ''})}
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

              {activityForm.activityType === 'sonstiges' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschreibung (bei Sonstiges) *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={activityForm.customType}
                    onChange={(e) => setActivityForm({...activityForm, customType: e.target.value})}
                    placeholder="z.B. Sommerfest Vorbereitung"
                    disabled={loading}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titel / Beschreibung *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({...activityForm, title: e.target.value})}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={activityForm.hours}
                    onChange={(e) => setActivityForm({...activityForm, hours: e.target.value})}
                    placeholder="z.B. 4.0"
                    disabled={loading}
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notizen (optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={activityForm.notes}
                  onChange={(e) => setActivityForm({...activityForm, notes: e.target.value})}
                  placeholder="Zusätzliche Informationen..."
                  disabled={loading}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                disabled={loading}
              >
                Abbrechen
              </button>
              <button
                onClick={saveActivity}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                disabled={loading}
              >
                {editMode ? 'Aktualisieren' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste der Aktivitäten */}
      <div className="space-y-4">
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
                
                {adminMode && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(activity)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {deleteMode && (
                      <button
                        onClick={() => deleteActivity(activity.id, activity.date)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        title="Löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
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
