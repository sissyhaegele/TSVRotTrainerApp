import React, { useState } from 'react';
import { Calendar, Users, Clock, MapPin, Tag, Plus, Trash2, Edit, Save, X, AlertTriangle, UserCheck } from 'lucide-react';

export default function Courses({ courses, setCourses, trainers, deleteMode, adminMode, canEdit, canAssignTrainers }) {
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

  const daysOfWeek = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const categories = ['Kinderturnen', 'Fitness', 'Seniorensport', 'Ballsport', 'Gymnastik', 'Sonstiges'];

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
    setCourses(courses.filter(c => c.id !== id));
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

  return (
    <div className="space-y-6">
      {canEdit && (
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
            <input
              type="time"
              className="px-3 py-2 border rounded-lg"
              value={newCourse.startTime}
              onChange={(e) => setNewCourse({...newCourse, startTime: e.target.value})}
            />
          </div>
          <button
            onClick={addCourse}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Kurs hinzufügen
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-lg shadow p-6">
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
              {canEdit && deleteMode && (
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
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

            <div>
              <h4 className="font-medium mb-2">
                {canEdit ? 'Trainer zuweisen:' : 'Zugewiesene Trainer:'}
              </h4>
              {canEdit ? (
                <div className="space-y-2">
                  {trainers.map(trainer => (
                    <label key={trainer.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={course.assignedTrainerIds?.includes(trainer.id) || false}
                        onChange={() => toggleTrainerAssignment(course.id, trainer.id)}
                      />
                      <span>{trainer.firstName} {trainer.lastName}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  {course.assignedTrainerIds?.length > 0 ? (
                    <div className="space-y-1">
                      {course.assignedTrainerIds.map(id => {
                        const trainer = trainers.find(t => t.id === id);
                        return trainer ? (
                          <div key={id} className="text-sm">
                            {trainer.firstName} {trainer.lastName}
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Keine Trainer zugewiesen</p>
                  )}
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      Trainerzuordnung nur im Wochenplan-Tab möglich
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          Noch keine Kurse angelegt.
        </div>
      )}
    </div>
  );
}
