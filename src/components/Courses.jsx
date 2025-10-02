import React, { useState } from 'react';
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

export default function Courses({ 
  courses, 
  setCourses, 
  trainers, 
  deleteMode, 
  adminMode 
}) {
  const [editingCourse, setEditingCourse] = useState(null);
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

  const addCourse = () => {
    if (newCourse.name && newCourse.dayOfWeek && newCourse.startTime) {
      const course = {
        ...newCourse,
        id: Date.now(),
        requiredTrainers: parseInt(newCourse.requiredTrainers) || 2
      };
      setCourses([...courses, course]);
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
    }
  };

  const deleteCourse = (id) => {
    if (confirm('Möchten Sie diesen Kurs wirklich löschen?')) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const startEdit = (course) => {
    setEditingCourse({
      ...course,
      requiredTrainers: course.requiredTrainers || 2
    });
  };

  const saveEdit = () => {
    setCourses(courses.map(c => 
      c.id === editingCourse.id 
        ? {
            ...editingCourse,
            requiredTrainers: parseInt(editingCourse.requiredTrainers) || 2
          }
        : c
    ));
    setEditingCourse(null);
  };

  const cancelEdit = () => {
    setEditingCourse(null);
  };

  const toggleTrainerAssignment = (courseId, trainerId) => {
    setCourses(courses.map(course => {
      if (course.id === courseId) {
        const currentIds = course.assignedTrainerIds || [];
        const newIds = currentIds.includes(trainerId)
          ? currentIds.filter(id => id !== trainerId)
          : [...currentIds, trainerId];
        return { ...course, assignedTrainerIds: newIds };
      }
      return course;
    }));
  };

  const getStaffingStatus = (course) => {
    const assigned = course.assignedTrainerIds?.length || 0;
    const required = course.requiredTrainers || 2;
    
    if (assigned === 0) return { status: 'critical', color: 'red' };
    if (assigned < required) return { status: 'warning', color: 'yellow' };
    if (assigned === required) return { status: 'optimal', color: 'green' };
    return { status: 'overstaffed', color: 'blue' };
  };

  const getStaffingBadge = (course) => {
    const assigned = course.assignedTrainerIds?.length || 0;
    const required = course.requiredTrainers || 2;
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Kurs hinzufügen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Kursname"
            className="px-3 py-2 border rounded-lg"
            value={newCourse.name}
            onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
          />
          
          <select
            className="px-3 py-2 border rounded-lg"
            value={newCourse.dayOfWeek}
            onChange={(e) => setNewCourse({...newCourse, dayOfWeek: e.target.value})}
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
            />
            <input
              type="time"
              className="flex-1 px-3 py-2 border rounded-lg"
              value={newCourse.endTime}
              onChange={(e) => setNewCourse({...newCourse, endTime: e.target.value})}
            />
          </div>
          
          <input
            type="text"
            placeholder="Ort"
            className="px-3 py-2 border rounded-lg"
            value={newCourse.location}
            onChange={(e) => setNewCourse({...newCourse, location: e.target.value})}
          />
          
          <select
            className="px-3 py-2 border rounded-lg"
            value={newCourse.category}
            onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
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
            />
          </div>
        </div>
        
        <button
          onClick={addCourse}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
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
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="px-3 py-2 border rounded-lg"
                    value={editingCourse.dayOfWeek}
                    onChange={(e) => setEditingCourse({...editingCourse, dayOfWeek: e.target.value})}
                  >
                    <option value="">Tag wählen</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  
                  <select
                    className="px-3 py-2 border rounded-lg"
                    value={editingCourse.category}
                    onChange={(e) => setEditingCourse({...editingCourse, category: e.target.value})}
                  >
                    <option value="">Kategorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <input
                    type="time"
                    className="px-3 py-2 border rounded-lg"
                    value={editingCourse.startTime}
                    onChange={(e) => setEditingCourse({...editingCourse, startTime: e.target.value})}
                  />
                  
                  <input
                    type="time"
                    className="px-3 py-2 border rounded-lg"
                    value={editingCourse.endTime}
                    onChange={(e) => setEditingCourse({...editingCourse, endTime: e.target.value})}
                  />
                  
                  <input
                    type="text"
                    placeholder="Ort"
                    className="px-3 py-2 border rounded-lg"
                    value={editingCourse.location}
                    onChange={(e) => setEditingCourse({...editingCourse, location: e.target.value})}
                  />

                  <div className="flex items-center space-x-2">
                    <label className="text-sm">Trainer-Soll:</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      className="w-16 px-2 py-2 border rounded-lg"
                      value={editingCourse.requiredTrainers}
                      onChange={(e) => setEditingCourse({...editingCourse, requiredTrainers: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={saveEdit}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Speichern
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex items-center"
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
                    <h3 className="text-lg font-semibold">{course.name}</h3>
                    {course.category && (
                      <span className="inline-flex items-center text-xs text-gray-500 mt-1">
                        <Tag className="w-3 h-3 mr-1" />
                        {course.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStaffingBadge(course)}
                    {/* EDIT BUTTON - IMMER SICHTBAR */}
                    <button
                      onClick={() => startEdit(course)}
                      className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded"
                      title="Kurs bearbeiten"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {/* DELETE BUTTON - NUR FÜR ADMIN */}
                    {adminMode && deleteMode && (
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded"
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
                    {course.dayOfWeek}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {course.startTime} - {course.endTime || '?'}
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
                      Trainer-Soll: {course.requiredTrainers || 2}
                    </span>
                  </div>
                </div>

                {(() => {
                  const { status } = getStaffingStatus(course);
                  const assigned = course.assignedTrainerIds?.length || 0;
                  const required = course.requiredTrainers || 2;
                  
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
                        />
                        <span>{trainer.firstName} {trainer.lastName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          Noch keine Kurse angelegt. Fügen Sie oben Ihren ersten Kurs hinzu!
        </div>
      )}
    </div>
  );
}
