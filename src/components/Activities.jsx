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
  X,
  MessageSquare
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
  
  // NEU v2.12.5: Activity Notes State
  const [activityNotes, setActivityNotes] = useState({});  // { "date_title": [notes] }
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteModalActivity, setNoteModalActivity] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({ note_type: 'internal', note_text: '' });
  
  const [activityForm, setActivityForm] = useState({
    date: new Date().toISOString().split('T')[0],
    activityType: '',
    customType: '',
    title: '',
    hours: '',
    notes: '',
    visibility: 'internal'  // NEU: Default 'internal'
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
      
      // NEU v2.12.5: Lade Notizen für alle Aktivitäten
      await loadAllActivityNotes(data);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Aktivitäten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  // NEU v2.12.5: Lade alle Notizen für Aktivitäten
  const loadAllActivityNotes = async (activitiesList) => {
    const notesMap = {};
    
    // Sammle alle einzigartigen date+title Kombinationen
    const uniqueActivities = new Map();
    activitiesList.forEach(activity => {
      const dateStr = activity.date.split('T')[0];
      const key = `${dateStr}_${activity.title}`;
      if (!uniqueActivities.has(key)) {
        uniqueActivities.set(key, { date: dateStr, title: activity.title });
      }
    });
    
    // Lade Notizen für jede Aktivität
    for (const [key, { date, title }] of uniqueActivities) {
      try {
        const response = await fetch(`${API_URL}/activity-notes?date=${date}&title=${encodeURIComponent(title)}`);
        if (response.ok) {
          const notes = await response.json();
          if (notes.length > 0) {
            notesMap[key] = notes;
          }
        }
      } catch (err) {
        console.error(`Error loading notes for ${key}:`, err);
      }
    }
    
    setActivityNotes(notesMap);
  };

  // NEU v2.12.5: Notiz-Key für eine Aktivität
  const getActivityNoteKey = (activity) => {
    const dateStr = activity.date.split('T')[0];
    return `${dateStr}_${activity.title}`;
  };

  // NEU v2.12.5: Notizen für eine Aktivität holen
  const getNotesForActivity = (activity) => {
    const key = getActivityNoteKey(activity);
    return activityNotes[key] || [];
  };

  // NEU v2.12.5: Note Modal öffnen
  const openNoteModal = (activity, note = null) => {
    setNoteModalActivity(activity);
    setEditingNote(note);
    if (note) {
      setNoteForm({ note_type: note.note_type, note_text: note.note_text });
    } else {
      setNoteForm({ note_type: 'internal', note_text: '' });
    }
    setShowNoteModal(true);
  };

  // NEU v2.12.5: Note Modal schließen
  const closeNoteModal = () => {
    setShowNoteModal(false);
    setNoteModalActivity(null);
    setEditingNote(null);
    setNoteForm({ note_type: 'internal', note_text: '' });
  };

  // NEU v2.12.5: Notiz speichern
  const saveActivityNote = async () => {
    if (!noteForm.note_text.trim()) {
      setError('Bitte Notiztext eingeben');
      return;
    }

    const dateStr = noteModalActivity.date.split('T')[0];
    const weekNum = getWeekNumber(new Date(dateStr));
    const yearNum = new Date(dateStr).getFullYear();

    try {
      setLoading(true);
      
      if (editingNote) {
        // Bearbeiten
        const response = await fetch(`${API_URL}/activity-notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            note_type: noteForm.note_type,
            note_text: noteForm.note_text
          })
        });
        
        if (!response.ok) throw new Error('Fehler beim Aktualisieren');
      } else {
        // Neu erstellen
        const response = await fetch(`${API_URL}/activity-notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity_date: dateStr,
            activity_title: noteModalActivity.title,
            week_number: weekNum,
            year: yearNum,
            note_type: noteForm.note_type,
            note_text: noteForm.note_text
          })
        });
        
        if (!response.ok) throw new Error('Fehler beim Erstellen');
      }
      
      // Notizen neu laden
      await loadAllActivityNotes(activities);
      closeNoteModal();
      setError(null);
    } catch (err) {
      console.error('Error saving activity note:', err);
      setError(err.message || 'Fehler beim Speichern der Notiz');
    } finally {
      setLoading(false);
    }
  };

  // NEU v2.12.5: Notiz löschen
  const deleteActivityNote = async (noteId) => {
    if (!window.confirm('Möchten Sie diese Notiz wirklich löschen?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/activity-notes/${noteId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Fehler beim Löschen');
      
      await loadAllActivityNotes(activities);
      setError(null);
    } catch (err) {
      console.error('Error deleting activity note:', err);
      setError('Fehler beim Löschen der Notiz');
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
      notes: '',
      visibility: 'internal'  // NEU
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
      notes: activity.notes || '',
      visibility: activity.visibility || 'internal'  // NEU
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
      trainerIds: selectedTrainers,
      visibility: activityForm.visibility  // NEU
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

              {/* NEU: Visibility Selection */}
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sichtbarkeit *
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-colors hover:bg-white"
                    style={{
                      borderColor: activityForm.visibility === 'internal' ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: activityForm.visibility === 'internal' ? '#eff6ff' : 'transparent'
                    }}>
                    <input
                      type="radio"
                      name="visibility"
                      value="internal"
                      checked={activityForm.visibility === 'internal'}
                      onChange={(e) => setActivityForm({...activityForm, visibility: e.target.value})}
                      disabled={loading}
                      className="mt-0.5 w-4 h-4 text-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span>🔒</span>
                        <span>Nur für Trainer (Intern)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Diese Aktivität ist nur im Admin-Bereich sichtbar. Gut für: Fortbildungen, interne Meetings.
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-colors hover:bg-white"
                    style={{
                      borderColor: activityForm.visibility === 'public' ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: activityForm.visibility === 'public' ? '#eff6ff' : 'transparent'
                    }}>
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={activityForm.visibility === 'public'}
                      onChange={(e) => setActivityForm({...activityForm, visibility: e.target.value})}
                      disabled={loading}
                      className="mt-0.5 w-4 h-4 text-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span>📢</span>
                        <span>Für Eltern sichtbar (Extern)</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Erscheint im öffentlichen Kursplan. Gut für: Wettkämpfe, Aufführungen, Ausflüge.
                      </p>
                    </div>
                  </label>
                </div>
                
                {activityForm.visibility === 'public' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600">⚠️</span>
                      <p className="text-sm text-yellow-800">
                        <strong>Hinweis:</strong> Diese Aktivität wird im öffentlichen Kursplan für alle Eltern sichtbar sein.
                      </p>
                    </div>
                  </div>
                )}
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
          
          // NEU v2.12.5: Notizen für diese Aktivität
          const notes = getNotesForActivity(activity);
          const internalNotes = notes.filter(n => n.note_type === 'internal');
          const publicNotes = notes.filter(n => n.note_type === 'public');
          
          return (
            <div key={`${activity.date}_${activity.title}_${index}`} className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                    {/* Visibility Badge */}
                    {activity.visibility === 'public' ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center">
                        📢 Für Eltern
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded flex items-center">
                        🔒 Intern
                      </span>
                    )}
                    {/* NEU v2.12.5: Notes Badges */}
                    {internalNotes.length > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded flex items-center">
                        🔒 {internalNotes.length}
                      </span>
                    )}
                    {publicNotes.length > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded flex items-center">
                        📢 {publicNotes.length}
                      </span>
                    )}
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

              {/* Beschreibung (alte notes) */}
              {activity.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-700">{activity.notes}</p>
                  </div>
                </div>
              )}

              {/* NEU v2.12.5: Notizen-Liste */}
              {notes.length > 0 && (
                <div className="mb-4 space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Notizen ({notes.length})
                  </h4>
                  {notes.map(note => (
                    <div 
                      key={note.id}
                      className={`p-3 rounded-lg border ${
                        note.note_type === 'public' 
                          ? 'bg-purple-50 border-purple-200' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className={`text-xs font-medium ${
                            note.note_type === 'public' ? 'text-purple-700' : 'text-yellow-700'
                          }`}>
                            {note.note_type === 'public' ? '📢 Für Eltern' : '🔒 Intern'}
                          </span>
                          <p className="text-sm text-gray-700 mt-1">{note.note_text}</p>
                        </div>
                        {adminMode && (
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => openNoteModal(activity, note)}
                              className="text-blue-500 hover:text-blue-700 p-1"
                              title="Bearbeiten"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteActivityNote(note.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Löschen"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* NEU v2.12.5: Notiz hinzufügen Button */}
              {adminMode && (
                <button
                  onClick={() => openNoteModal(activity)}
                  className="mb-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Notiz hinzufügen
                </button>
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

      {/* NEU v2.12.5: Note Modal */}
      {showNoteModal && noteModalActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingNote ? 'Notiz bearbeiten' : 'Neue Notiz'}
              </h3>
              <button
                onClick={closeNoteModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="text-sm text-gray-600">
                Für: <span className="font-medium">{noteModalActivity.title}</span>
              </div>
              
              {/* Notiz-Typ Auswahl */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sichtbarkeit
                </label>
                <div className="flex gap-3">
                  <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    noteForm.note_type === 'internal' 
                      ? 'border-yellow-500 bg-yellow-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="note_type"
                      value="internal"
                      checked={noteForm.note_type === 'internal'}
                      onChange={(e) => setNoteForm({...noteForm, note_type: e.target.value})}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <span className="text-lg">🔒</span>
                      <p className="text-sm font-medium mt-1">Intern</p>
                      <p className="text-xs text-gray-500">Nur für Trainer</p>
                    </div>
                  </label>
                  
                  <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    noteForm.note_type === 'public' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="note_type"
                      value="public"
                      checked={noteForm.note_type === 'public'}
                      onChange={(e) => setNoteForm({...noteForm, note_type: e.target.value})}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <span className="text-lg">📢</span>
                      <p className="text-sm font-medium mt-1">Für Eltern</p>
                      <p className="text-xs text-gray-500">Öffentlich sichtbar</p>
                    </div>
                  </label>
                </div>
              </div>

              {noteForm.note_type === 'public' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Diese Notiz wird im öffentlichen Kursplan für Eltern sichtbar sein!
                  </p>
                </div>
              )}
              
              {/* Notiz-Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notiz
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={noteForm.note_text}
                  onChange={(e) => setNoteForm({...noteForm, note_text: e.target.value})}
                  placeholder="Notiz eingeben..."
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <button
                onClick={closeNoteModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                disabled={loading}
              >
                Abbrechen
              </button>
              <button
                onClick={saveActivityNote}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                disabled={loading || !noteForm.note_text.trim()}
              >
                {loading ? 'Speichern...' : (editingNote ? 'Aktualisieren' : 'Speichern')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}