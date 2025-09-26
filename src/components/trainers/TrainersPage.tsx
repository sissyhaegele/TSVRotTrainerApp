import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Mail, Phone, Award } from 'lucide-react';

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

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  const handleAddTrainer = (trainerData: Omit<Trainer, 'id'>) => {
    const newTrainer = {
      ...trainerData,
      id: Math.max(...trainers.map(t => t.id)) + 1
    };
    setTrainers([...trainers, newTrainer]);
    setShowAddForm(false);
  };

  const handleEditTrainer = (trainerId: number, trainerData: Omit<Trainer, 'id'>) => {
    setTrainers(trainers.map(t => t.id === trainerId ? { ...trainerData, id: trainerId } : t));
    setEditingTrainer(null);
  };

  const handleDeleteTrainer = (trainerId: number) => {
    if (confirm('Trainer wirklich löschen?')) {
      setTrainers(trainers.filter(t => t.id !== trainerId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainer-Verwaltung</h1>
          <p className="text-gray-600">TSV Rot Trainer verwalten</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Trainer hinzufügen
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <TrainerForm
          onSubmit={handleAddTrainer}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Form */}
      {editingTrainer && (
        <TrainerForm
          trainer={editingTrainer}
          onSubmit={(data) => handleEditTrainer(editingTrainer.id, data)}
          onCancel={() => setEditingTrainer(null)}
        />
      )}

      {/* Trainer Grid */}
      <div className="trainers-grid">
        {trainers.map((trainer) => (
          <TrainerCard 
            key={trainer.id}
            trainer={trainer}
            isAdmin={isAdmin}
            onEdit={() => setEditingTrainer(trainer)}
            onDelete={() => handleDeleteTrainer(trainer.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TrainerCard({ 
  trainer, 
  isAdmin, 
  onEdit, 
  onDelete 
}: {
  trainer: Trainer;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl hover:transform hover:scale-[1.02]">
      {/* Header mit Gradient */}
      <div className="bg-gradient-to-r from-blue-500 to-red-500 h-2"></div>
      
      <div className="p-6">
        {/* Top Section - Name und Actions */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-red-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{trainer.name}</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                trainer.isActive 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  trainer.isActive ? 'bg-green-400' : 'bg-gray-400'
                }`}></div>
                {trainer.isActive ? 'Aktiv' : 'Inaktiv'}
              </span>
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

        {/* Contact Information */}
        <div className="space-y-3 mb-4">
          {trainer.email && (
            <div className="flex items-center group">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <a 
                  href={`mailto:${trainer.email}`} 
                  className="text-sm text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  {trainer.email}
                </a>
              </div>
            </div>
          )}
          
          {trainer.phone && (
            <div className="flex items-center group">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-100 transition-colors">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <a 
                  href={`tel:${trainer.phone}`} 
                  className="text-sm text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                  {trainer.phone}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Qualifications Section */}
        {trainer.qualifications.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center mr-3">
                <Award className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Qualifikationen</span>
            </div>
            <div className="flex flex-wrap gap-2 ml-11">
              {trainer.qualifications.map((qual, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200"
                >
                  {qual}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Available Days Section */}
        {trainer.availableDays.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Verfügbare Tage</span>
            </div>
            <div className="flex flex-wrap gap-1 ml-11">
              {['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].map((day) => (
                <span 
                  key={day}
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    trainer.availableDays.includes(day)
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {day.slice(0, 2)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {trainer.notes && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
              "{trainer.notes}"
            </p>
          </div>
        )}

        {/* Stats Footer */}
        <div className="pt-4 border-t border-gray-100 mt-4">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{trainer.qualifications.length} Qualifikationen</span>
            <span>{trainer.availableDays.length} verfügbare Tage</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrainerForm({
  trainer,
  onSubmit,
  onCancel
}: {
  trainer?: Trainer;
  onSubmit: (data: Omit<Trainer, 'id'>) => void;
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

  const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const qualificationOptions = ['Übungsleiter C', 'Trainer B', 'Kinderturnen', 'Geräteturnen', 'Fitness', 'Erste Hilfe', 'Gesundheitssport'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const toggleQualification = (qual: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.includes(qual)
        ? prev.qualifications.filter(q => q !== qual)
        : [...prev.qualifications, qual]
    }));
  };

  return (
    <div className="trainer-form p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {trainer ? 'Trainer bearbeiten' : 'Neuen Trainer hinzufügen'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        {/* Grunddaten Section */}
        <div className="form-section">
          <div className="form-section-title">Grunddaten</div>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="form-input"
                placeholder="Vollständiger Name"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">E-Mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="form-input"
                  placeholder="name@tsvrot.de"
                />
              </div>
              <div>
                <label className="form-label">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="form-input"
                  placeholder="+49 6227 123456"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Verfügbarkeit Section */}
        <div className="form-section">
          <div className="form-section-title">Verfügbare Tage</div>
          <div className="checkbox-grid days">
            {weekdays.map((day) => (
              <div
                key={day}
                onClick={() => toggleDay(day)}
                className={`day-button ${formData.availableDays.includes(day) ? 'selected' : ''}`}
              >
                <span>{day.slice(0, 2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Qualifikationen Section */}
        <div className="form-section">
          <div className="form-section-title">Qualifikationen</div>
          <div className="checkbox-grid qualifications">
            {qualificationOptions.map((qual) => (
              <label key={qual} className="qualification-checkbox">
                <input
                  type="checkbox"
                  checked={formData.qualifications.includes(qual)}
                  onChange={() => toggleQualification(qual)}
                />
                <span className="text-sm font-medium text-gray-700">{qual}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Zusätzliche Informationen Section */}
        <div className="form-section">
          <div className="form-section-title">Zusätzliche Informationen</div>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Notizen</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="form-input"
                rows={3}
                placeholder="Zusätzliche Informationen über den Trainer..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
              />
              <label htmlFor="isActive" className="form-label mb-0">
                Trainer ist aktiv
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Abbrechen
          </button>
          <button type="submit" className="btn btn-primary">
            {trainer ? 'Änderungen speichern' : 'Trainer hinzufügen'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TrainersPage;




