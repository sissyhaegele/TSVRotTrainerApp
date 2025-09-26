import React, { useState } from 'react';
import { Plus, Edit, Trash2, Clock, Users, MapPin, Award, AlertCircle, CheckCircle, BookOpen, AlertTriangle, User } from 'lucide-react';

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
      maxParticipants: 15,
      requiredTrainers: 2,
      requiredQualifications: ['Kinderturnen', 'Erste Hilfe'],
      isActive: true,
      location: 'Turnhalle',
      ageGroup: '3-4 Jahre',
      level: 'Anfänger',
      notes: 'Hohe Nachfrage',
      assignedTrainers: 2
    },
    {
      id: 3,
      name: 'Seniorengymnastik',
      description: 'Sanfte Gymnastik für Senioren',
      day: 'Mittwoch',
      startTime: '10:00',
      endTime: '11:00',
      maxParticipants: 20,
      requiredTrainers: 1,
      requiredQualifications: ['Übungsleiter C', 'Gesundheitssport'],
      isActive: false,
      location: 'Gymnastiksaal',
      ageGroup: 'Senioren (65+)',
      level: 'Leicht',
      notes: 'Sucht neuen Trainer',
      assignedTrainers: 0
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // KPI-Statistiken berechnen
  const stats = {
    total: courses.length,
    active: courses.filter(c => c.isActive).length,
    inactive: courses.filter(c => !c.isActive).length,
    totalTrainers: courses.reduce((sum, c) => sum + (c.requiredTrainers || 0), 0)
  };

  const handleAddCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse = {
      ...courseData,
      id: Math.max(...courses.map(c => c.id)) + 1
    };
    setCourses([...courses, newCourse]);
    setShowAddForm(false);
    console.log('Neuer Kurs hinzugefügt:', newCourse);
  };

  const handleEditCourse = (courseId: number, courseData: Omit<Course, 'id'>) => {
    setCourses(courses.map(c => c.id === courseId ? { ...courseData, id: courseId } : c));
    setEditingCourse(null);
    console.log('Kurs bearbeitet:', courseId);
  };

  const handleDeleteCourse = (courseId: number) => {
    if (window.confirm('Kurs wirklich löschen?')) {
      setCourses(courses.filter(c => c.id !== courseId));
      console.log('Kurs gelöscht:', courseId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kurs-Verwaltung</h1>
          <p className="text-gray-600">TSV Rot Kurse und Trainingszeiten verwalten</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              console.log('Add-Button geklickt');
              setShowAddForm(true);
            }}
            className="btn btn-primary add-course-button"
          >
            <Plus className="w-4 h-4" />
            <span>Kurs hinzufügen</span>
          </button>
        )}
      </div>

      {/* Kompakte KPI-Kacheln */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-content">
            <div className="kpi-icon">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="kpi-data">
              <div className="kpi-value">{stats.total}</div>
              <div className="kpi-label">Kurse gesamt</div>
            </div>
          </div>
        </div>
        
        <div className="kpi-card green">
          <div className="kpi-content">
            <div className="kpi-icon">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="kpi-data">
              <div className="kpi-value">{stats.active}</div>
              <div className="kpi-label">Aktive Kurse</div>
            </div>
          </div>
        </div>
        
        <div className="kpi-card red">
          <div className="kpi-content">
            <div className="kpi-icon">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="kpi-data">
              <div className="kpi-value">{stats.inactive}</div>
              <div className="kpi-label">Inaktive Kurse</div>
            </div>
          </div>
        </div>
        
        <div className="kpi-card orange">
          <div className="kpi-content">
            <div className="kpi-icon">
              <User className="w-4 h-4" />
            </div>
            <div className="kpi-data">
              <div className="kpi-value">{stats.totalTrainers}</div>
              <div className="kpi-label">Trainer benötigt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Form - Modal */}
      {showAddForm && (
        <div className="form-overlay" onClick={() => setShowAddForm(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <CourseForm
              onSubmit={handleAddCourse}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Form - Modal */}
      {editingCourse && (
        <div className="form-overlay" onClick={() => setEditingCourse(null)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <CourseForm
              course={editingCourse}
              onSubmit={(data) => handleEditCourse(editingCourse.id, data)}
              onCancel={() => setEditingCourse(null)}
            />
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid grid-responsive">
        {courses.map((course) => (
          <CourseCard 
            key={course.id}
            course={course}
            isAdmin={isAdmin}
            onEdit={() => {
              console.log('Edit-Button geklickt für:', course.name);
              setEditingCourse(course);
            }}
            onDelete={() => handleDeleteCourse(course.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CourseCard({ 
  course, 
  isAdmin, 
  onEdit, 
  onDelete 
}: {
  course: Course;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const trainerStatus = course.assignedTrainers === course.requiredTrainers ? 'complete' : 
                       course.assignedTrainers === 0 ? 'empty' : 'partial';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl hover:transform hover:scale-[1.02]">
      {/* Header mit Status-Gradient */}
      <div className={`h-2 ${course.isActive ? 
        (trainerStatus === 'complete' ? 'bg-green-400' : 
         trainerStatus === 'partial' ? 'bg-orange-400' : 'bg-red-400') 
        : 'bg-gray-300'}`}></div>
      
      <div className="p-6">
        {/* Top Section */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mr-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{course.name}</h3>
              <div className="flex gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  course.isActive 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {course.isActive ? 'Aktiv' : 'Inaktiv'}
                </span>
                {course.ageGroup && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {course.ageGroup}
                  </span>
                )}
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex space-x-1">
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title="Bearbeiten"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Course Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {course.day}, {course.startTime} - {course.endTime}
            </span>
          </div>
          
          {course.location && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{course.location}</span>
            </div>
          )}

          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {course.assignedTrainers || 0}/{course.requiredTrainers} Trainer
            </span>
            <span className={`ml-2 w-2 h-2 rounded-full ${
              trainerStatus === 'complete' ? 'bg-green-400' :
              trainerStatus === 'partial' ? 'bg-orange-400' : 'bg-red-400'
            }`}></span>
          </div>
        </div>

        {/* Qualifications */}
        {course.requiredQualifications.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Qualifikationen:</div>
            <div className="flex flex-wrap gap-1">
              {course.requiredQualifications.map((qual, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded border border-blue-200">
                  {qual}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {course.description && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
              "{course.description}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseForm({
  course,
  onSubmit,
  onCancel
}: {
  course?: Course;
  onSubmit: (data: Omit<Course, 'id'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    description: course?.description || '',
    day: course?.day || 'Montag',
    startTime: course?.startTime || '',
    endTime: course?.endTime || '',
    maxParticipants: course?.maxParticipants || 20,
    requiredTrainers: course?.requiredTrainers || 1,
    requiredQualifications: course?.requiredQualifications || [],
    isActive: course?.isActive ?? true,
    location: course?.location || '',
    ageGroup: course?.ageGroup || '',
    level: course?.level || '',
    notes: course?.notes || '',
    assignedTrainers: course?.assignedTrainers || 0
  });

  const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const qualifications = ['Übungsleiter C', 'Trainer B', 'Kinderturnen', 'Geräteturnen', 'Fitness', 'Erste Hilfe', 'Gesundheitssport'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    onSubmit(formData);
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
    <div className="trainer-form p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {course ? 'Kurs bearbeiten' : 'Neuen Kurs hinzufügen'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-section-title">Kursdaten</div>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Kursname *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Beschreibung</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-input"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Wochentag</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({...formData, day: e.target.value})}
                  className="form-input"
                >
                  {weekdays.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Von</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Bis</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Ort</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Altersgruppe</label>
                <input
                  type="text"
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({...formData, ageGroup: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Kapazität & Trainer</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Max. Teilnehmer</label>
              <input
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Benötigte Trainer</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.requiredTrainers}
                onChange={(e) => setFormData({...formData, requiredTrainers: parseInt(e.target.value)})}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Qualifikationen</div>
          <div className="checkbox-grid qualifications">
            {qualifications.map((qual) => (
              <label key={qual} className="qualification-checkbox">
                <input
                  type="checkbox"
                  checked={formData.requiredQualifications.includes(qual)}
                  onChange={() => toggleQualification(qual)}
                />
                <span className="text-sm font-medium text-gray-700">{qual}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-buttons">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Abbrechen
          </button>
          <button type="submit" className="btn btn-primary">
            {course ? 'Änderungen speichern' : 'Kurs hinzufügen'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CoursesPage;

