import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, Users, MapPin, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { QUALIFICATIONS, DAYS_OF_WEEK } from '../../types';

interface Course {
  id: number;
  name: string;
  description?: string;
  day: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  requiredTrainers: number;
  requiredQualifications: string[];
  isActive: boolean;
  location?: string;
  ageGroup?: string;
  level?: string;
  notes?: string;
  assignedTrainers?: number;
}

interface CoursesPageProps {
  isAdmin: boolean;
}

function CoursesPage({ isAdmin }: CoursesPageProps) {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      name: 'Frauengymnastik',
      description: 'Fitness und Gesundheitssport für Frauen',
      day: 'Montag',
      startTime: '20:00',
      endTime: '21:30',
      maxParticipants: 25,
      requiredTrainers: 1,
      requiredQualifications: ['Übungsleiter C', 'Fitness'],
      isActive: true,
      location: 'Turnhalle',
      ageGroup: 'Erwachsene (18-64 Jahre)',
      level: 'Mixed',
      notes: 'Sehr beliebter Kurs',
      assignedTrainers: 1
    },
    {
      id: 2,
      name: 'Turnzwerge 3-4 Jahre',
      description: 'Spielerisches Turnen für die Kleinsten',
      day: 'Dienstag',
      startTime: '15:30',
      endTime: '16:30',
      maxParticipants: 12,
      requiredTrainers: 2,
      requiredQualifications: ['Kinderturnen', 'Erste Hilfe'],
      isActive: true,
      location: 'Turnhalle',
      ageGroup: 'Bambini (3-5 Jahre)',
      level: 'Anfänger',
      notes: 'Mit Elternbegleitung',
      assignedTrainers: 2
    },
    {
      id: 3,
      name: 'Kinderturnen 5-7 Jahre',
      description: 'Grundlagen des Turnens für Kinder',
      day: 'Mittwoch',
      startTime: '16:00',
      endTime: '17:00',
      maxParticipants: 15,
      requiredTrainers: 1,
      requiredQualifications: ['Kinderturnen', 'Übungsleiter C'],
      isActive: true,
      location: 'Turnhalle',
      ageGroup: 'Kinder (6-10 Jahre)',
      level: 'Anfänger',
      notes: 'Sehr aktive Gruppe',
      assignedTrainers: 1
    },
    {
      id: 4,
      name: 'Jugendturnen 8-12 Jahre',
      description: 'Fortgeschrittenes Turnen für Schulkinder',
      day: 'Donnerstag',
      startTime: '17:00',
      endTime: '18:30',
      maxParticipants: 18,
      requiredTrainers: 2,
      requiredQualifications: ['Trainer B', 'Kinderturnen'],
      isActive: true,
      location: 'Turnhalle',
      ageGroup: 'Kinder (6-10 Jahre)',
      level: 'Fortgeschritten',
      notes: 'Wettkampfvorbereitung',
      assignedTrainers: 1
    },
    {
      id: 7,
      name: 'Seniorengymnastik',
      description: 'Sanfte Bewegung für Senioren',
      day: 'Mittwoch',
      startTime: '10:00',
      endTime: '11:00',
      maxParticipants: 15,
      requiredTrainers: 1,
      requiredQualifications: ['Übungsleiter C', 'Erste Hilfe'],
      isActive: true,
      location: 'Gymnastiksaal',
      ageGroup: 'Senioren (65+ Jahre)',
      level: 'Anfänger',
      notes: 'Gelenkschonend',
      assignedTrainers: 0
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleAdd = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setCourses(courses.filter(c => c.id !== id));
    setDeleteConfirm(null);
  };

  const handleSave = (courseData: Omit<Course, 'id' | 'assignedTrainers'>) => {
    if (editingCourse) {
      setCourses(courses.map(c => 
        c.id === editingCourse.id 
          ? { ...courseData, id: editingCourse.id, assignedTrainers: editingCourse.assignedTrainers }
          : c
      ));
    } else {
      const newId = Math.max(...courses.map(c => c.id)) + 1;
      setCourses([...courses, { ...courseData, id: newId, assignedTrainers: 0 }]);
    }
    setShowForm(false);
    setEditingCourse(null);
  };

  const totalMissingTrainers = courses.reduce((sum, c) => sum + Math.max(0, c.requiredTrainers - (c.assignedTrainers || 0)), 0);
  const fullyStaffedCourses = courses.filter(c => (c.assignedTrainers || 0) >= c.requiredTrainers).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kurse</h1>
          <p className="text-gray-600">Verwaltung der Kurse und Trainer-Zuordnungen</p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleAdd}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Kurs hinzufügen
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vollbesetzt</p>
              <p className="text-2xl font-bold text-green-700">{fullyStaffedCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertCircle className={`h-8 w-8 ${totalMissingTrainers > 0 ? 'text-red-600' : 'text-green-600'}`} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fehlende Trainer</p>
              <p className={`text-2xl font-bold ${totalMissingTrainers > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {totalMissingTrainers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kursstunden/Woche</p>
              <p className="text-2xl font-bold text-purple-700">8.5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={() => handleEdit(course)}
            onDelete={() => setDeleteConfirm(course.id)}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {showForm && (
        <CourseForm
          course={editingCourse}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirm
          courseName={courses.find(c => c.id === deleteConfirm)?.name || ''}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

function CourseCard({ course, onEdit, onDelete, isAdmin }: { 
  course: Course; 
  onEdit: () => void; 
  onDelete: () => void;
  isAdmin: boolean;
}) {
  const missingTrainers = Math.max(0, course.requiredTrainers - (course.assignedTrainers || 0));
  const isFullyStaffed = (course.assignedTrainers || 0) >= course.requiredTrainers;
  
  const getStaffingStatus = () => {
    if (isFullyStaffed) return { color: 'green', label: 'Vollbesetzt', icon: CheckCircle };
    if (course.assignedTrainers === 0) return { color: 'red', label: 'Keine Trainer', icon: AlertCircle };
    return { color: 'yellow', label: `${missingTrainers} fehlen`, icon: AlertCircle };
  };

  const staffing = getStaffingStatus();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              course.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {course.isActive ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>

          {course.description && (
            <p className="text-sm text-gray-600 mb-3">{course.description}</p>
          )}
        </div>

        {isAdmin && (
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Bearbeiten"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>{course.day}, {course.startTime} - {course.endTime}</span>
        </div>

        {course.location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{course.location}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span>Max. {course.maxParticipants} Teilnehmer</span>
          {course.ageGroup && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {course.ageGroup}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <staffing.icon className={`w-4 h-4 mr-2 text-${staffing.color}-600`} />
            <span className={`font-medium text-${staffing.color}-700`}>
              {course.assignedTrainers || 0}/{course.requiredTrainers} Trainer
            </span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full bg-${staffing.color}-100 text-${staffing.color}-800`}>
            {staffing.label}
          </span>
        </div>

        {course.requiredQualifications.length > 0 && (
          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Award className="w-3 h-3 mr-1" />
              Benötigte Qualifikationen:
            </div>
            <div className="flex flex-wrap gap-1">
              {course.requiredQualifications.slice(0, 2).map((qual) => (
                <span key={qual} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                  {qual}
                </span>
              ))}
              {course.requiredQualifications.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{course.requiredQualifications.length - 2} weitere
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseForm({ course, onSave, onCancel }: { 
  course: Course | null; 
  onSave: (data: Omit<Course, 'id' | 'assignedTrainers'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    description: course?.description || '',
    day: course?.day || 'Montag',
    startTime: course?.startTime || '18:00',
    endTime: course?.endTime || '19:00',
    maxParticipants: course?.maxParticipants || 20,
    requiredTrainers: course?.requiredTrainers || 1,
    requiredQualifications: course?.requiredQualifications || [],
    isActive: course?.isActive ?? true,
    location: course?.location || 'Turnhalle',
    ageGroup: course?.ageGroup || '',
    level: course?.level || 'Mixed',
    notes: course?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleQualification = (qual: string) => {
    setFormData(prev => ({
      ...prev,
      requiredQualifications: prev.requiredQualifications.includes(qual)
        ? prev.requiredQualifications.filter(q => q !== qual)
        : [...prev.requiredQualifications, qual]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onCancel}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {course ? 'Kurs bearbeiten' : 'Neuen Kurs hinzufügen'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kursname *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="z.B. Kinderturnen 5-7 Jahre"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wochentag *</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="z.B. Turnhalle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Startzeit *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endzeit *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max. Teilnehmer</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value) || 20})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Benötigte Trainer *</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.requiredTrainers}
                    onChange={(e) => setFormData({...formData, requiredTrainers: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Benötigte Qualifikationen</label>
                <div className="grid grid-cols-2 gap-2">
                  {QUALIFICATIONS.map((qual) => (
                    <label key={qual} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.requiredQualifications.includes(qual)}
                        onChange={() => toggleQualification(qual)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{qual}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={onCancel} className="btn btn-secondary">
                  Abbrechen
                </button>
                <button type="submit" className="btn btn-primary">
                  {course ? 'Änderungen speichern' : 'Kurs erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ courseName, onConfirm, onCancel }: { 
  courseName: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onCancel}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kurs löschen</h3>
            <p className="text-sm text-gray-600 mb-6">
              Möchten Sie den Kurs "{courseName}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={onCancel} className="btn btn-secondary">Abbrechen</button>
              <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                Löschen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;

