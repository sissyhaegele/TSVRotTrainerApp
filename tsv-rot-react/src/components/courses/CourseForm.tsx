import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, BookOpen } from 'lucide-react';

import { DAYS_OF_WEEK, AGE_GROUPS, COURSE_LEVELS, QUALIFICATIONS } from '@/types';
import type { Course, CourseFormData } from '@/types';
import { isValidTime, isTimeAfter } from '@/utils';

// Validation Schema
const courseSchema = z.object({
  name: z.string()
    .min(1, 'Name ist erforderlich')
    .min(3, 'Name muss mindestens 3 Zeichen haben'),
  description: z.string().optional(),
  day: z.string()
    .min(1, 'Tag ist erforderlich'),
  startTime: z.string()
    .min(1, 'Startzeit ist erforderlich')
    .refine(val => isValidTime(val), 'Ungültige Startzeit (HH:MM)'),
  endTime: z.string()
    .min(1, 'Endzeit ist erforderlich')
    .refine(val => isValidTime(val), 'Ungültige Endzeit (HH:MM)'),
  maxParticipants: z.number()
    .min(1, 'Mindestens 1 Teilnehmer')
    .max(100, 'Maximum 100 Teilnehmer'),
  requiredTrainers: z.number()
    .min(1, 'Mindestens 1 Trainer erforderlich')
    .max(10, 'Maximum 10 Trainer'),
  requiredQualifications: z.array(z.string()),
  isActive: z.boolean(),
  location: z.string().optional(),
  ageGroup: z.string().optional(),
  level: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => isTimeAfter(data.endTime, data.startTime), {
  message: 'Endzeit muss nach der Startzeit liegen',
  path: ['endTime'],
});

interface CourseFormProps {
  course?: Course | null;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function CourseForm({ course, onSubmit, onCancel, isLoading = false }: CourseFormProps) {
  const isEditing = !!course;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: course?.name || '',
      description: course?.description || '',
      day: course?.day || '',
      startTime: course?.startTime || '10:00',
      endTime: course?.endTime || '11:00',
      maxParticipants: course?.maxParticipants || 15,
      requiredTrainers: course?.requiredTrainers || 1,
      requiredQualifications: course?.requiredQualifications || [],
      isActive: course?.isActive ?? true,
      location: course?.location || '',
      ageGroup: course?.ageGroup || '',
      level: course?.level || '',
      notes: course?.notes || '',
    },
  });

  const watchedQualifications = watch('requiredQualifications');
  const watchedStartTime = watch('startTime');
  const watchedEndTime = watch('endTime');

  const handleFormSubmit = async (data: CourseFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Calculate duration
  const calculateDuration = () => {
    if (watchedStartTime && watchedEndTime && isValidTime(watchedStartTime) && isValidTime(watchedEndTime)) {
      const [startH, startM] = watchedStartTime.split(':').map(Number);
      const [endH, endM] = watchedEndTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const duration = endMinutes - startMinutes;
      
      if (duration > 0) {
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
      }
    }
    return '';
  };

  const duration = calculateDuration();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onCancel}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-tsv-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-tsv-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Kurs bearbeiten' : 'Neuen Kurs hinzufügen'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isEditing 
                    ? 'Bearbeiten Sie die Kurs-Informationen' 
                    : 'Geben Sie die Informationen für den neuen Kurs ein'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="form-label">
                  Kursname *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="form-input"
                  placeholder="z.B. Kinderturnen 4-6 Jahre"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="form-label">
                  Beschreibung
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="form-textarea"
                  placeholder="Kurze Beschreibung des Kurses..."
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="form-error">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="day" className="form-label">
                  Wochentag *
                </label>
                <select
                  {...register('day')}
                  className="form-select"
                  disabled={isLoading}
                >
                  <option value="">Wochentag wählen</option>
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                {errors.day && (
                  <p className="form-error">{errors.day.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="startTime" className="form-label">
                  Startzeit *
                </label>
                <input
                  {...register('startTime')}
                  type="time"
                  className="form-input"
                  disabled={isLoading}
                />
                {errors.startTime && (
                  <p className="form-error">{errors.startTime.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="endTime" className="form-label">
                  Endzeit *
                </label>
                <input
                  {...register('endTime')}
                  type="time"
                  className="form-input"
                  disabled={isLoading}
                />
                {duration && (
                  <p className="text-xs text-green-600 mt-1">Dauer: {duration}</p>
                )}
                {errors.endTime && (
                  <p className="form-error">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            {/* Participants and Trainers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxParticipants" className="form-label">
                  Max. Teilnehmer *
                </label>
                <input
                  {...register('maxParticipants', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="100"
                  className="form-input"
                  disabled={isLoading}
                />
                {errors.maxParticipants && (
                  <p className="form-error">{errors.maxParticipants.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="requiredTrainers" className="form-label">
                  Benötigte Trainer *
                </label>
                <input
                  {...register('requiredTrainers', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  disabled={isLoading}
                />
                {errors.requiredTrainers && (
                  <p className="form-error">{errors.requiredTrainers.message}</p>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="location" className="form-label">
                  Ort
                </label>
                <input
                  {...register('location')}
                  type="text"
                  className="form-input"
                  placeholder="z.B. Turnhalle 1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="ageGroup" className="form-label">
                  Altersgruppe
                </label>
                <select
                  {...register('ageGroup')}
                  className="form-select"
                  disabled={isLoading}
                >
                  <option value="">Altersgruppe wählen</option>
                  {AGE_GROUPS.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="level" className="form-label">
                  Level
                </label>
                <select
                  {...register('level')}
                  className="form-select"
                  disabled={isLoading}
                >
                  <option value="">Level wählen</option>
                  {COURSE_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Required Qualifications */}
            <div>
              <label className="form-label">
                Benötigte Qualifikationen
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {QUALIFICATIONS.map((qualification) => (
                  <label key={qualification} className="flex items-center">
                    <Controller
                      name="requiredQualifications"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          className="form-checkbox mr-2"
                          checked={field.value.includes(qualification)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, qualification]);
                            } else {
                              field.onChange(field.value.filter((q) => q !== qualification));
                            }
                          }}
                          disabled={isLoading}
                        />
                      )}
                    />
                    <span className="text-sm text-gray-700">{qualification}</span>
                  </label>
                ))}
              </div>
              {errors.requiredQualifications && (
                <p className="form-error">{errors.requiredQualifications.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      className="form-checkbox mr-3"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
                <span className="text-sm font-medium text-gray-700">
                  Kurs ist aktiv
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Aktive Kurse werden in der Wochenplanung angezeigt
              </p>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="form-label">
                Notizen
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="form-textarea"
                placeholder="Zusätzliche Informationen oder Notizen..."
                disabled={isLoading}
              />
              {errors.notes && (
                <p className="form-error">{errors.notes.message}</p>
              )}
            </div>

            {/* Selected Qualifications Summary */}
            {watchedQualifications.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Benötigte Qualifikationen:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {watchedQualifications.map((qual) => (
                    <span
                      key={qual}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-tsv-blue-100 text-tsv-blue-800"
                    >
                      {qual}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !isDirty}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Speichere...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Änderungen speichern' : 'Kurs erstellen'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CourseForm;
