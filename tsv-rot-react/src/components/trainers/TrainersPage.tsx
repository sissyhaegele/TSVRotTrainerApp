import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Download,
  Upload,
  Filter,
  X,
  Check
} from 'lucide-react';

import { 
  useTrainers, 
  useCreateTrainer, 
  useUpdateTrainer, 
  useDeleteTrainer,
  useAuth,
  useSearch 
} from '@/hooks';
import { QUALIFICATIONS, DAYS_OF_WEEK } from '@/types';
import type { Trainer, TrainerFormData } from '@/types';
import { cn, formatDate } from '@/utils';

// Components
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import TrainerForm from '@/components/trainers/TrainerForm';

function TrainersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  // State
  const [showForm, setShowForm] = useState(!!id);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<Trainer | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Data fetching
  const { data: trainers = [], isLoading, error } = useTrainers();
  const createTrainer = useCreateTrainer();
  const updateTrainer = useUpdateTrainer();
  const deleteTrainer = useDeleteTrainer();

  // Search and filtering
  const { query, setQuery, filteredItems } = useSearch(
    trainers,
    ['name', 'email', 'qualifications'],
    ''
  );

  // Apply active filter
  const displayedTrainers = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return filteredItems.filter(trainer => trainer.isActive);
      case 'inactive':
        return filteredItems.filter(trainer => !trainer.isActive);
      default:
        return filteredItems;
    }
  }, [filteredItems, activeFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: trainers.length,
      active: trainers.filter(t => t.isActive).length,
      inactive: trainers.filter(t => !t.isActive).length,
    };
  }, [trainers]);

  // Handlers
  const handleCreate = () => {
    setEditingTrainer(null);
    setShowForm(true);
    navigate('/trainer/neu');
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setShowForm(true);
    navigate(`/trainer/${trainer.id}/bearbeiten`);
  };

  const handleDelete = (trainer: Trainer) => {
    setTrainerToDelete(trainer);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (trainerToDelete) {
      await deleteTrainer.mutateAsync(trainerToDelete.id);
      setDeleteConfirmOpen(false);
      setTrainerToDelete(null);
    }
  };

  const handleFormSubmit = async (data: TrainerFormData) => {
    try {
      if (editingTrainer) {
        await updateTrainer.mutateAsync({ id: editingTrainer.id, data });
      } else {
        await createTrainer.mutateAsync(data);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving trainer:', error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTrainer(null);
    navigate('/trainer');
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
          Fehler beim Laden der Trainer: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainer</h1>
          <p className="text-gray-600">
            Verwaltung der Trainer und deren Qualifikationen
          </p>
        </div>
        
        {isAdmin && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleCreate}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Trainer hinzufügen
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-tsv-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Check className="h-8 w-8 text-tsv-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktiv</p>
              <p className="text-2xl font-bold text-tsv-green-700">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-8 w-8 text-tsv-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inaktiv</p>
              <p className="text-2xl font-bold text-tsv-red-700">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Trainer suchen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as any)}
              className="form-select"
            >
              <option value="all">Alle anzeigen</option>
              <option value="active">Nur aktive</option>
              <option value="inactive">Nur inaktive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trainers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTrainers.map((trainer) => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {displayedTrainers.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Keine Trainer gefunden
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {query 
              ? 'Versuchen Sie eine andere Suchanfrage'
              : 'Beginnen Sie, indem Sie einen Trainer hinzufügen.'
            }
          </p>
          {isAdmin && !query && (
            <div className="mt-6">
              <button onClick={handleCreate} className="btn btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Ersten Trainer hinzufügen
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trainer Form Modal */}
      {showForm && (
        <TrainerForm
          trainer={editingTrainer}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
          isLoading={createTrainer.isPending || updateTrainer.isPending}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Trainer löschen"
        message={`Möchten Sie den Trainer "${trainerToDelete?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        isDestructive
        isLoading={deleteTrainer.isPending}
      />
    </div>
  );
}

// Trainer Card Component
interface TrainerCardProps {
  trainer: Trainer;
  onEdit: (trainer: Trainer) => void;
  onDelete: (trainer: Trainer) => void;
  isAdmin: boolean;
}

function TrainerCard({ trainer, onEdit, onDelete, isAdmin }: TrainerCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {trainer.name}
            </h3>
            <span
              className={cn(
                'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                trainer.isActive
                  ? 'bg-tsv-green-100 text-tsv-green-800'
                  : 'bg-gray-100 text-gray-800'
              )}
            >
              {trainer.isActive ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>

          {/* Contact Info */}
          <div className="mt-2 space-y-1">
            {trainer.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-3 h-3 mr-2" />
                {trainer.email}
              </div>
            )}
            {trainer.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-3 h-3 mr-2" />
                {trainer.phone}
              </div>
            )}
          </div>

          {/* Available Days */}
          {trainer.availableDays.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Calendar className="w-3 h-3 mr-2" />
                Verfügbare Tage:
              </div>
              <div className="flex flex-wrap gap-1">
                {trainer.availableDays.map((day) => (
                  <span
                    key={day}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-tsv-blue-100 text-tsv-blue-800"
                  >
                    {day.substring(0, 2)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Qualifications */}
          {trainer.qualifications.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Award className="w-3 h-3 mr-2" />
                Qualifikationen:
              </div>
              <div className="flex flex-wrap gap-1">
                {trainer.qualifications.slice(0, 3).map((qual) => (
                  <span
                    key={qual}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
                  >
                    {qual}
                  </span>
                ))}
                {trainer.qualifications.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{trainer.qualifications.length - 3} weitere
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
              onClick={() => onEdit(trainer)}
              className="p-2 text-gray-400 hover:text-tsv-blue-600 hover:bg-tsv-blue-50 rounded-lg transition-colors duration-150"
              title="Bearbeiten"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(trainer)}
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

export default TrainersPage;
