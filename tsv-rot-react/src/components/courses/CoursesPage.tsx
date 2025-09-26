import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen,
  Clock,
  Users,
  MapPin,
  Award,
  Download,
  Filter,
  Calendar
} from 'lucide-react';

import { 
  useCourses, 
  useCreateCourse, 
  useUpdateCourse, 
  useDeleteCourse,
  useAuth,
  useSearch 
} from '@/hooks';
import { DAYS_OF_WEEK, AGE_GROUPS, COURSE_LEVELS } from '@/types';
import type { Course, CourseFormData } from '@/types';
import { cn, formatTime, formatDuration, getTimeDuration } from '@/utils';

// Components
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CourseForm from '@/components/courses/CourseForm';

function CoursesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  // State
  const [showForm, setShowForm] = useState(!!id);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Data fetching
  const { data: courses = [], isLoading, error } = useCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  // Search and filtering
  const { query, setQuery, filteredItems } = useSearch(
    courses,
    ['name', 'description', 'day', 'ageGroup', 'location'],
    ''
  );

  // Apply filters
  const displayedCourses = useMemo(() => {
    let filtered = filteredItems;

    // Day filter
    if (dayFilter !== 'all') {
      filtered = filtered.filter(course => course.day === dayFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => 
        statusFilter === 'active' ? course.isActive : !course.isActive
      );
    }

    return filtered.sort((a, b) => {
      // Sort by day first, then by start time
      const dayOrder = DAYS_OF_WEEK.indexOf(a.day as any) - DAYS_OF_WEEK.indexOf(b.day as any);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [filteredItems, dayFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: courses.length,
      active: courses.filter(c => c.isActive).length,
      inactive: courses.filter(c => !c.isActive).length,
      totalParticipants: courses.reduce((sum, c) => sum + c.maxParticipants, 0),
      byDay: DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = courses.filter(c => c.day === day).length;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [courses]);

  // Handlers
  const handleCreate = () => {
    setEditingCourse(null);
    setShowForm(true);
    navigate('/kurse/neu');
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
    navigate(`/kurse/${course.id}/bearbeiten`);
  };

  const handleDelete = (course: Course) => {
    setCourseToDelete(course);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (courseToDelete) {
      await deleteCourse.mutateAsync(courseToDelete.id);
      setDeleteConfirmOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleFormSubmit = async (data: CourseFormData) => {
    try {
      if (editingCourse) {
        await updateCourse.mutateAsync({ id: editingCourse.id, data });
      } else {
        await createCourse.mutateAsync(data);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    navigate('/kurse');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-tsv-red-600">
          Fehler beim Laden der Kurse: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kurse</h1>
          <p className="text-gray-600">
            Verwaltung der Kurse und Trainingszeiten
          </p>
        </div>
        
        {isAdmin && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleCreate}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Kurs hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-tsv-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-tsv-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktiv</p>
              <p className="text-2xl font-bold text-tsv-green-700">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-tsv-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Teilnehmer</p>
              <p className="text-2xl font-bold text-tsv-yellow-700">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-tsv-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inaktiv</p>
              <p className="text-2xl font-bold text-tsv-red-700">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Kurse suchen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">Alle Tage</option>
                {DAYS_OF_WEEK.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="form-select"
            >
              <option value="all">Alle Status</option>
              <option value="active">Nur aktive</option>
              <option value="inactive">Nur inaktive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayedCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {displayedCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Keine Kurse gefunden
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {query || dayFilter !== 'all' || statusFilter !== 'all'
              ? 'Versuchen Sie andere Suchkriterien'
              : 'Beginnen Sie, indem Sie einen Kurs hinzufügen.'
            }
          </p>
          {isAdmin && !query && dayFilter === 'all' && statusFilter === 'all' && (
            <div className="mt-6">
              <button onClick={handleCreate} className="btn btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Ersten Kurs hinzufügen
              </button>
            </div>
          )}
        </div>
      )}

      {/* Course Form Modal */}
      {showForm && (
        <CourseForm
          course={editingCourse}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isLoading={createCourse.isPending || updateCourse.isPending}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Kurs löschen"
        message={`Möchten Sie den Kurs "${courseToDelete?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        isDestructive
        isLoading={deleteCourse.isPending}
      />
    </div>
  );
}

// Course Card Component
interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  isAdmin: boolean;
}

function CourseCard({ course, onEdit, onDelete, isAdmin }: CourseCardProps) {
  const duration = getTimeDuration(course.startTime, course.endTime);
  
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {course.name}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                  course.isActive
                    ? 'bg-tsv-green-100 text-tsv-green-800'
                    : 'bg-gray-100 text-gray-800'
                )}
              >
                {course.isActive ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
          </div>

          {course.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {course.description}
            </p>
          )}

          {/* Schedule Info */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {course.day}
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(course.startTime)} - {formatTime(course.endTime)}
              <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">
                {formatDuration(duration)}
              </span>
            </div>

            {course.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {course.location}
              </div>
            )}
          </div>

          {/* Participants and Trainers */}
          <div className="mt-3 flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              <span>{course.maxParticipants} TN</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Award className="w-4 h-4 mr-1" />
              <span>{course.requiredTrainers} Trainer</span>
            </div>
          </div>

          {/* Age Group and Level */}
          <div className="mt-3 flex flex-wrap gap-2">
            {course.ageGroup && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-tsv-blue-100 text-tsv-blue-800">
                {course.ageGroup}
              </span>
            )}
            {course.level && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                {course.level}
              </span>
            )}
          </div>

          {/* Required Qualifications */}
          {course.requiredQualifications.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Benötigte Qualifikationen:</div>
              <div className="flex flex-wrap gap-1">
                {course.requiredQualifications.slice(0, 2).map((qual) => (
                  <span
                    key={qual}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                  >
                    {qual}
                  </span>
                ))}
                {course.requiredQualifications.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{course.requiredQualifications.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={() => onEdit(course)}
              className="p-2 text-gray-400 hover:text-tsv-blue-600 hover:bg-tsv-blue-50 rounded-lg transition-colors duration-150"
              title="Bearbeiten"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(course)}
              className="p-2 text-gray-400 hover:text-tsv-red-600 hover:bg-tsv-red-50 rounded-lg transition-colors duration-150"
              title="Löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursesPage;
