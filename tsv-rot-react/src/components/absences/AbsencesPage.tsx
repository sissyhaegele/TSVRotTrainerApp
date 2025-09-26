import React, { useState } from 'react';
import { Plus, Calendar, User, FileText, Check, X, Clock } from 'lucide-react';
import { useAbsences, useCreateAbsence, useDeleteAbsence, useTrainers, useAuth } from '@/hooks';
import { formatDate, isToday, isFuture } from '@/utils';
import { Card, LoadingSpinner, EmptyState, Badge, ConfirmDialog } from '@/components/ui';
import type { Absence, AbsenceFormData } from '@/types';

function AbsencesPage() {
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [absenceToDelete, setAbsenceToDelete] = useState<Absence | null>(null);

  const { data: absences = [], isLoading: absencesLoading } = useAbsences();
  const { data: trainers = [] } = useTrainers();
  const createAbsence = useCreateAbsence();
  const deleteAbsence = useDeleteAbsence();

  const handleFormSubmit = async (data: AbsenceFormData) => {
    try {
      await createAbsence.mutateAsync(data);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating absence:', error);
    }
  };

  const handleDelete = (absence: Absence) => {
    setAbsenceToDelete(absence);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (absenceToDelete) {
      await deleteAbsence.mutateAsync(absenceToDelete.id);
      setDeleteConfirmOpen(false);
      setAbsenceToDelete(null);
    }
  };

  if (absencesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Group absences
  const upcomingAbsences = absences.filter(absence => isFuture(new Date(absence.startDate)));
  const currentAbsences = absences.filter(absence => {
    const start = new Date(absence.startDate);
    const end = new Date(absence.endDate);
    const today = new Date();
    return today >= start && today <= end;
  });
  const pendingAbsences = absences.filter(absence => !absence.isApproved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ausfälle</h1>
          <p className="text-gray-600">
            Verwaltung von Trainer-Ausfällen und Urlauben
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ausfall melden
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-tsv-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktuell</p>
              <p className="text-2xl font-bold text-tsv-yellow-700">{currentAbsences.length}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-tsv-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Geplant</p>
              <p className="text-2xl font-bold text-tsv-blue-700">{upcomingAbsences.length}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-tsv-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Offen</p>
              <p className="text-2xl font-bold text-tsv-red-700">{pendingAbsences.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Absences List */}
      <div className="space-y-4">
        {absences.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Keine Ausfälle gemeldet"
            description="Es sind derzeit keine Trainer-Ausfälle gemeldet."
            action={{
              label: "Ausfall melden",
              onClick: () => setShowForm(true)
            }}
          />
        ) : (
          absences.map((absence) => {
            const trainer = trainers.find(t => t.id === absence.trainerId);
            return (
              <AbsenceCard
                key={absence.id}
                absence={absence}
                trainer={trainer}
                onDelete={handleDelete}
                canDelete={isAdmin}
              />
            );
          })
        )}
      </div>

      {/* Absence Form Modal */}
      {showForm && (
        <AbsenceForm
          trainers={trainers}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          isLoading={createAbsence.isPending}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Ausfall löschen"
        message={`Möchten Sie diesen Ausfall wirklich löschen?`}
        confirmText="Löschen"
        isDestructive
        isLoading={deleteAbsence.isPending}
      />
    </div>
  );
}

// Absence Card Component
interface AbsenceCardProps {
  absence: Absence;
  trainer?: any; // Replace with proper trainer type
  onDelete: (absence: Absence) => void;
  canDelete: boolean;
}

function AbsenceCard({ absence, trainer, onDelete, canDelete }: AbsenceCardProps) {
  const startDate = new Date(absence.startDate);
  const endDate = new Date(absence.endDate);
  const isOngoing = new Date() >= startDate && new Date() <= endDate;
  const isUpcoming = isFuture(startDate);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {trainer?.name || 'Unbekannter Trainer'}
            </h3>
            <div className="ml-3">
              {isOngoing && (
                <Badge variant="warning">Aktuell</Badge>
              )}
              {isUpcoming && (
                <Badge variant="info">Geplant</Badge>
              )}
              {!absence.isApproved && (
                <Badge variant="danger">Nicht bestätigt</Badge>
              )}
              {absence.isApproved && (
                <Badge variant="success">Bestätigt</Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {formatDate(startDate, 'dd.MM.yyyy')} - {formatDate(endDate, 'dd.MM.yyyy')}
              </span>
            </div>

            <div className="flex items-start text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">{absence.reason}</p>
                {absence.notes && (
                  <p className="text-xs text-gray-500 mt-1">{absence.notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete(absence)}
            className="p-2 text-gray-400 hover:text-tsv-red-600 hover:bg-tsv-red-50 rounded-lg transition-colors duration-150"
            title="Löschen"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </Card>
  );
}

// Simple Absence Form Component
interface AbsenceFormProps {
  trainers: any[]; // Replace with proper trainer type
  onSubmit: (data: AbsenceFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

function AbsenceForm({ trainers, onSubmit, onCancel, isLoading }: AbsenceFormProps) {
  const [formData, setFormData] = useState<AbsenceFormData>({
    trainerId: 0,
    startDate: '',
    endDate: '',
    reason: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.trainerId && formData.startDate && formData.endDate && formData.reason) {
      await onSubmit(formData);
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ausfall melden
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Trainer *</label>
                <select
                  value={formData.trainerId}
                  onChange={(e) => setFormData({...formData, trainerId: parseInt(e.target.value)})}
                  className="form-select"
                  required
                  disabled={isLoading}
                >
                  <option value="">Trainer auswählen</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Von *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="form-input"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="form-label">Bis *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="form-input"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Grund *</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="form-input"
                  placeholder="z.B. Urlaub, Krankheit, ..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="form-label">Notizen</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="form-textarea"
                  rows={2}
                  placeholder="Zusätzliche Informationen..."
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Melde...
                    </>
                  ) : (
                    'Ausfall melden'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AbsencesPage;
