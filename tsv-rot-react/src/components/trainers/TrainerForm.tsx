import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, User } from 'lucide-react';

import { QUALIFICATIONS, DAYS_OF_WEEK } from '@/types';
import type { Trainer, TrainerFormData } from '@/types';
import { isValidEmail, isValidPhoneNumber } from '@/utils';

// Validation Schema
const trainerSchema = z.object({
  name: z.string()
    .min(1, 'Name ist erforderlich')
    .min(2, 'Name muss mindestens 2 Zeichen haben'),
  email: z.string()
    .optional()
    .refine(val => !val || isValidEmail(val), 'Ungültige E-Mail-Adresse'),
  phone: z.string()
    .optional()
    .refine(val => !val || isValidPhoneNumber(val), 'Ungültige Telefonnummer'),
  qualifications: z.array(z.string())
    .min(0, 'Mindestens eine Qualifikation auswählen'),
  availableDays: z.array(z.string())
    .min(1, 'Mindestens einen verfügbaren Tag auswählen'),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

interface TrainerFormProps {
  trainer?: Trainer | null;
  onSubmit: (data: TrainerFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function TrainerForm({ trainer, onSubmit, onCancel, isLoading = false }: TrainerFormProps) {
  const isEditing = !!trainer;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      name: trainer?.name || '',
      email: trainer?.email || '',
      phone: trainer?.phone || '',
      qualifications: trainer?.qualifications || [],
      availableDays: trainer?.availableDays || [],
      isActive: trainer?.isActive ?? true,
      notes: trainer?.notes || '',
    },
  });

  const watchedQualifications = watch('qualifications');
  const watchedAvailableDays = watch('availableDays');

  const handleFormSubmit = async (data: TrainerFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

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
                  <User className="w-5 h-5 text-tsv-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Trainer bearbeiten' : 'Neuen Trainer hinzufügen'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isEditing 
                    ? 'Bearbeiten Sie die Trainer-Informationen' 
                    : 'Geben Sie die Informationen für den neuen Trainer ein'
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
                  Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="form-input"
                  placeholder="Vollständiger Name des Trainers"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  E-Mail-Adresse
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="form-input"
                  placeholder="trainer@example.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="form-label">
                  Telefonnummer
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="form-input"
                  placeholder="+49 123 456789"
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="form-error">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Available Days */}
            <div>
              <label className="form-label">
                Verfügbare Tage *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {DAYS_OF_WEEK.map((day) => (
                  <label key={day} className="flex items-center">
                    <Controller
                      name="availableDays"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          className="form-checkbox mr-2"
                          checked={field.value.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, day]);
                            } else {
                              field.onChange(field.value.filter((d) => d !== day));
                            }
                          }}
                          disabled={isLoading}
                        />
                      )}
                    />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
              {errors.availableDays && (
                <p className="form-error">{errors.availableDays.message}</p>
              )}
            </div>

            {/* Qualifications */}
            <div>
              <label className="form-label">
                Qualifikationen
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {QUALIFICATIONS.map((qualification) => (
                  <label key={qualification} className="flex items-center">
                    <Controller
                      name="qualifications"
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
              {errors.qualifications && (
                <p className="form-error">{errors.qualifications.message}</p>
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
                  Trainer ist aktiv
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Aktive Trainer können für Kurse eingeplant werden
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

            {/* Selected Items Summary */}
            {(watchedQualifications.length > 0 || watchedAvailableDays.length > 0) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Auswahl:</h4>
                
                {watchedAvailableDays.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-600">Verfügbare Tage: </span>
                    <span className="text-xs text-gray-800">
                      {watchedAvailableDays.join(', ')}
                    </span>
                  </div>
                )}
                
                {watchedQualifications.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-600">Qualifikationen: </span>
                    <span className="text-xs text-gray-800">
                      {watchedQualifications.join(', ')}
                    </span>
                  </div>
                )}
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
                    {isEditing ? 'Änderungen speichern' : 'Trainer erstellen'}
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

export default TrainerForm;
