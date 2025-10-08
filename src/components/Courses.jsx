import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Tag, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8181/api'
  : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api';

export default function Courses({ 
  courses, 
  setCourses, 
  trainers, 
  deleteMode, 
  adminMode 
}) {
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newCourse, setNewCourse] = useState({
    name: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    assignedTrainerIds: [],
    requiredTrainers: 2
  });

  const daysOfWeek = [
    'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 
    'Freitag', 'Samstag', 'Sonntag'
  ];

  const categories = [
    'Kinderturnen', 'Fitness', 'Seniorensport', 
    'Ballsport', 'Gymnastik', 'Sonstiges'
  ];

  // Lade Kurse beim Start
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/courses`);
      if (!response.ok) throw new Error('Fehler beim Laden der Kurse');
      const data = await response.json();
      setCourses(data);
      setError(null);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Kurse konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async () => {
    if (newCourse.name && newCourse.dayOfWeek && newCourse.startTime) {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCourse.name,
            dayOfWeek: newCourse.dayOfWeek,
            startTime: newCourse.startTime,
            endTime: newCourse.endTime || null,
            location: newCourse.location || null,
            category: newCourse.category || null,
            requiredTrainers: parseInt(newCourse.requiredTrainers) || 2,
            assignedTrainerIds: newCourse.assignedTrainerIds || []
          })
        });
        
        if (!response.ok) throw new Error('Fehler beim Hinzufügen');
        
        const savedCourse = await response.json();
        setCourses([...courses, savedCourse]);
        setNewCourse({
          name: '',
          dayOfWeek: '',
          startTime: '',
          endTime: '',
          location: '',
          category: '',
          assignedTrainerIds: [],
          requiredTrainers: 2
        });
        setError(null);
      } catch (err) {
        console.error('Error adding course:', err);
        setError('Kurs konnte nicht hinzugefügt werden');
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Möchten Sie diesen Kurs wirklich löschen?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Fehler beim Löschen');
      
      setCourses(courses.filter(c => c.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Kurs konnte nicht gelöscht werden');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (course) => {
    setEditingCourse({
      ...course,
      requiredTrainers: course.requiredTrainers || course.required_trainers || 2,
      assignedTrainerIds: course.assignedTrainerIds || []
    });
  };

  const saveEdit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCourse.name,
          dayOfWeek: editingCourse.dayOfWeek || editingCourse.day_of_week,
          startTime: editingCourse.startTime || editingCourse.start_time,
          endTime: editingCourse.endTime || editingCourse.end_time || null,
          location: editingCourse.location || null,
          category: editingCourse.category || null,
          requiredTrainers: parseInt(editingCourse.requiredTrainers) || 2,
          assignedTrainerIds: editingCourse.assignedTrainerIds || []
        })
      });
      
      if (!response.ok) throw new Error('Fehler beim Speichern');
      
      const updatedCourse = await response.json();
      setCourses(courses.map(c => 
        c.id === updatedCourse.id ? updatedCourse : c
      ));
      setEditingCourse(null);
      setError(null);
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Änderungen konnten nicht gespeichert werden');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingCourse(null);
  };

  const toggleTrainerAssignment = async (courseId, trainerId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const currentIds = course.assignedTrainerIds || [];
    const newIds = currentIds.includes(trainerId)
      ? currentIds.filter(id => id !== trainerId)
      : [...currentIds, trainerId];

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: course.name,
          dayOfWeek: course.dayOfWeek || course.day_of_week,
          startTime: course.startTime || course.start_time,
          endTime: course.endTime || course.end_time || null,
          location: course.location || null,
          category: course.category || null,
          requiredTrainers: course.requiredTrainers || course.required_trainers || 2,
          assignedTrainerIds: newIds
        })
      });
      
      if (!response.ok) throw new Error('Fehler beim Speichern');
      
      const updatedCourse = await response.json();
      setCourses(courses.map(c => 
        c.id === updatedCourse.id ? updatedCourse : c
      ));
      setError(null);
    } catch (err) {
      console.error('Error updating trainer assignment:', err);
      setError('Trainer-Zuweisung konnte nicht gespeichert werden');
    } finally {
      setLoading(false);
    }
  };

  const getStaffingStatus = (course) => {
    const assigned = course.assignedTrainerIds?.length || 0;
    const required = course.requiredTrainers || course.required_trainers || 2;
    
    if (assigned === 0) return { status: 'critical', color: 'red' };
    if (assigned < required) return { status: 'warning', color: 'yellow' };
    if (assigned === required) return { status: 'optimal', color: 'green' };
    return { status: 'overstaffed', color: 'blue' };
  };

  const getStaffingBadge = (course) => {
    const assigned = course.assignedTrainerIds?.length || 0;
    const required = course.requiredTrainers || course.required_trainers || 2;
    const { color } = getStaffingStatus(course);
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
        ${color === 'red' ? 'bg-red-100 text-red-800' : ''}
        ${color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
        ${color === 'green' ? 'bg-green-100 text-green-800' : ''}
        ${color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
      `}>
        <Users className="w-3 h-3 mr-1" />
        {assigned} / {required}
      </span>
    );
  };

  const getCourseName = (course) => {
    return course.name;
  };

  const getCourseDayOfWeek = (course) => {
    return course.dayOfWeek || course.day_of_week;
  };

  const getCourseStartTime = (course) => {
    return course.startTime || course.start_time;
  };

  const getCourseEndTime = (course) => {
    return course.endTime || course.end_time || '?';
  };

  const getCourseRequiredTrainers = (course) => {
    return course.requiredTrainers || course.required_trainers || 2;
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

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Kurs hinzufügen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Kursname"
            className="px-3 py-2 border rounded-lg"
            value={newCourse.name}
            onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
            disabled={loading}
          />
          
          <select
            className="px-3 py-2 border rounded-lg"
            value={newCourse.dayOfWeek}
            onChange={(e) => setNewCourse({...newCourse, dayOfWeek: e.target.value})}
            disabled={loading}
          >
            <option value="">Tag wählen</option>
            {daysOfWeek.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          
          <div className="flex space-x-2">
            <input
              type="time"
              className="flex-1 px-3 py-2 border rounded-lg"
              value={newCourse.startTime}
              onChange={(e) => setNewCourse({...newCourse, startTime: e.target.value})}
              disabled={loading}
            />
            <input
              type="time"
              className="flex-1 px-3 py-2 border rounded-lg"
              value={newCourse.endTime}
              onChange={(e) => setNewCourse({...newCourse, endTime: e.target.value})}
              disabled={loading}
            />
          </div>
          
          <input
            type="text"
            placeholder="Ort"
            className="px-3 py-2 border rounded-lg"
            value={newCourse.location}
            onChange={(e) => setNewCourse({...newCourse, location: e.target.value})}
            disabled={loading}
          />
          
          <select
            className="px-3 py-2 border rounded-lg"
            value={newCourse.category}
            onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
            disabled={loading}
          >
            <option value="">Kategorie wählen</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Benötigte Trainer:</label>
            <input
              type="number"
              min="1"
              max="5"
              className="w-16 px-2 py-2 border rounded-lg"
              value={newCourse.requiredTrainers}
              onChange={(e) => setNewCourse({...newCourse, requiredTrainers: e.target.value})}
              disabled={loading}
            />
          </div>
        </div>
        
        <button
          onClick={addCourse}
          disabled={loading || !newCourse.name || !newCourse.dayOfWeek || !newCourse.startTime}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Kurs hinzufügen
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-lg shadow p-6">
            {editingCourse?.id === course.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg font-semibold"
                  value={editingCourse.name}
                  onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                  disabled={loading}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="px-3 py-2 border rounded-lg"
                    value={editingCourse.dayOfWeek || editingCourse.day_of_week}
                    onChange={(e) => setEditingCourse({...editingCourse, dayOfWeek: e.target.value})}
                    disabled={loading}
                  >
                    <option value="">Tag wählen</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  
                  <select
                    className="px-3 py-2 border rounded-lg"
                    value={editingCourse.category || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, category: e.target.value})}
                    disabled={loading}
                  >
                    <option value="">Kategorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <input
                    type="time"
                    className="px-3 py-2 border rounded-lg"
                    value={editingCourse.startTime || editingCourse.start_time}
                    onChange={(e) => setEditingCourse({...editingCourse, startTime: e.target.value})}
                    disabled={loading}
                  />
                  
                  <input
                    type="time"
                    className="px-3 py-2 border rounded-lg"
                    value={editingCourse.endTime || editingCourse.end_time || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, endTime: e.target.value})}
                    disabled={loading}
                  />
                  
                  <input
                    type="text"
                    placeholder="Ort"
                    className="px-3 py-2 border rounded-lg"
                    value={editingCourse.location || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, location: e.target.value})}
                    disabled={loading}
                  />

                  <div className="flex items-center space-x-2">
                    <label className="text-sm">Trainer-Soll:</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      className="w-16 px-2 py-2 border rounded-lg"
                      value={editingCourse.requiredTrainers || editingCourse.required_trainers}
                      onChange={(e) => setEditingCourse({...editingCourse, requiredTrainers: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={saveEdit}
                    disabled={loading}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Speichern
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={loading}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{getCourseName(course)}</h3>
                    {course.category && (
                      <span className="inline-flex items-center text-xs text-gray-500 mt-1">
                        <Tag className="w-3 h-3 mr-1" />
                        {course.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStaffingBadge(course)}
                    <button
                      onClick={() => startEdit(course)}
                      disabled={loading}
                      className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded disabled:opacity-50"
                      title="Kurs bearbeiten"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {adminMode && deleteMode && (
                      <button
                        onClick={() => deleteCourse(course.id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Kurs löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {getCourseDayOfWeek(course)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {getCourseStartTime(course)} - {getCourseEndTime(course)}
                  </div>
                  {course.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {course.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <UserCheck className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      Trainer-Soll: {getCourseRequiredTrainers(course)}
                    </span>
                  </div>
                </div>

                {(() => {
                  const { status } = getStaffingStatus(course);
                  const assigned = course.assignedTrainerIds?.length || 0;
                  const required = getCourseRequiredTrainers(course);
                  
                  if (status === 'critical') {
                    return (
                      <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-700 text-sm">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Kein Trainer zugewiesen! (Benötigt: {required})
                        </div>
                      </div>
                    );
                  } else if (status === 'warning') {
                    return (
                      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center text-yellow-700 text-sm">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Unterbesetzt: {required - assigned} Trainer fehlt/fehlen
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div>
                  <h4 className="font-medium mb-2">Trainer zuweisen:</h4>
                  <div className="space-y-2">
                    {trainers.map(trainer => (
                      <label key={trainer.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4"
                          checked={course.assignedTrainerIds?.includes(trainer.id) || false}
                          onChange={() => toggleTrainerAssignment(course.id, trainer.id)}
                          disabled={loading}
                        />
                        <span>{getTrainerName(trainer)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          Noch keine Kurse angelegt. Fügen Sie oben Ihren ersten Kurs hinzu!
        </div>
      )}
    </div>
  );
}
