import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Mail, Phone, Award } from 'lucide-react';
import { QUALIFICATIONS, DAYS_OF_WEEK } from '../../types';

interface Trainer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  qualifications: string[];
  isActive: boolean;
  availableDays: string[];
  notes?: string;
}

interface TrainersPageProps {
  isAdmin: boolean;
}

function TrainersPage({ isAdmin }: TrainersPageProps) {
  const [trainers, setTrainers] = useState<Trainer[]>([
    {
      id: 1,
      name: 'Desiree Knopf',
      email: 'desiree.knopf@tsvrot.de',
      phone: '+49 6227 123456',
      qualifications: ['Übungsleiter C', 'Kinderturnen', 'Erste Hilfe'],
      isActive: true,
      availableDays: ['Montag', 'Mittwoch', 'Freitag'],
      notes: 'Leiterin Kinderturnen'
    },
    {
      id: 2,
      name: 'Sarah Winkler',
      email: 'sarah.winkler@tsvrot.de',
      phone: '+49 6227 234567',
      qualifications: ['Trainer B', 'Geräteturnen', 'Fitness'],
      isActive: true,
      availableDays: ['Dienstag', 'Donnerstag', 'Samstag'],
      notes: 'Spezialistin Geräteturnen'
    },
    {
      id: 3,
      name: 'Julia Miller',
      email: 'julia.miller@tsvrot.de',
      phone: '+49 6227 345678',
      qualifications: ['Übungsleiter C', 'Fitness', 'Erste Hilfe'],
      isActive: true,
      availableDays: ['Montag', 'Mittwoch', 'Donnerstag'],
      notes: 'Fitness und Gesundheitssport'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleAdd = () => {
    setEditingTrainer(null);
    setShowForm(true);
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setTrainers(trainers.filter(t => t.id !== id));
    setDeleteConfirm(null);
  };

  const handleSave = (trainerData: Omit<Trainer, 'id'>) => {
    if (editingTrainer) {
      setTrainers(trainers.map(t => 
        t.id === editingTrainer.id 
          ? { ...trainerData, id: editingTrainer.id }
          : t
      ));
    } else {
      const newId = Math.max(...trainers.map(t => t.id)) + 1;
      setTrainers([...trainers, { ...trainerData, id: newId }]);
    }
    setShowForm(false);
    setEditingTrainer(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainer</h1>
          <p className="text-gray-600">Verwaltung der Trainer und deren Qualifikationen</p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleAdd}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Trainer hinzufügen
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{trainers.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <User className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktiv</p>
              <p className="text-2xl font-bold text-green-700">
                {trainers.filter(t => t.isActive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Qualifikationen</p>
              <p className="text-2xl font-bold text-yellow-700">
                {trainers.reduce((sum, t) => sum + t.qualifications.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
            onEdit={() => handleEdit(trainer)}
            onDelete={() => setDeleteConfirm(trainer.id)}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {showForm && (
        <TrainerForm
          trainer={editingTrainer}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirm
          trainerName={trainers.find(t => t.id === deleteConfirm)?.name || ''}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

function TrainerCard({ trainer, onEdit, onDelete, isAdmin }: { 
  trainer: Trainer; 
  onEdit: () => void; 
  onDelete: () => void;
  isAdmin: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{trainer.name}</h3>
            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              trainer.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {trainer.isActive ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>

          <div className="space-y-1 mb-3">
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

          {trainer.availableDays.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Verfügbare Tage:</div>
              <div className="flex flex-wrap gap-1">
                {trainer.availableDays.map((day) => (
                  <span key={day} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                    {day.substring(0, 2)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {trainer.qualifications.length > 0 && (
            <div>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <Award className="w-3 h-3 mr-1" />
                Qualifikationen:
              </div>
              <div className="flex flex-wrap gap-1">
                {trainer.qualifications.slice(0, 2).map((qual) => (
                  <span key={qual} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                    {qual}
                  </span>
                ))}
                {trainer.qualifications.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{trainer.qualifications.length - 2} weitere
                  </span>
                )}
              </div>
            </div>
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
    </div>
  );
}

function TrainerForm({ trainer, onSave, onCancel }: { 
  trainer: Trainer | null; 
  onSave: (data: Omit<Trainer, 'id'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: trainer?.name || '',
    email: trainer?.email || '',
    phone: trainer?.phone || '',
    qualifications: trainer?.qualifications || [],
    isActive: trainer?.isActive ?? true,
    availableDays: trainer?.availableDays || [],
    notes: trainer?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleQualification = (qual: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.includes(qual)
        ? prev.qualifications.filter(q => q !== qual)
        : [...prev.qualifications, qual]
    }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onCancel}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {trainer ? 'Trainer bearbeiten' : 'Neuen Trainer hinzufügen'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Vollständiger Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="trainer@tsvrot.de"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+49 123 456789"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Trainer ist aktiv</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verfügbare Tage</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.availableDays.includes(day)}
                        onChange={() => toggleDay(day)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualifikationen</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {QUALIFICATIONS.map((qual) => (
                    <label key={qual} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.qualifications.includes(qual)}
                        onChange={() => toggleQualification(qual)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{qual}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Zusätzliche Informationen..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={onCancel} className="btn btn-secondary">
                  Abbrechen
                </button>
                <button type="submit" className="btn btn-primary">
                  {trainer ? 'Änderungen speichern' : 'Trainer erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ trainerName, onConfirm, onCancel }: { 
  trainerName: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onCancel}></div>
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trainer löschen</h3>
            <p className="text-sm text-gray-600 mb-6">
              Möchten Sie den Trainer "{trainerName}" wirklich löschen? 
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

export default TrainersPage;
