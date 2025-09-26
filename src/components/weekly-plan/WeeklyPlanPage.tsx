import React, { useState } from 'react';
import { Calendar, AlertTriangle, User, CheckCircle, Clock, Phone, Mail, UserPlus } from 'lucide-react';

interface WeeklyPlanPageProps {
  isAdmin: boolean;
  isDashboard?: boolean;
}

function WeeklyPlanPage({ isAdmin, isDashboard = false }: WeeklyPlanPageProps) {
  const [selectedWeek, setSelectedWeek] = useState('KW39 2025 (22.09.)');
  
  // Dynamische Wochenberechnung
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    
    // Montag der aktuellen Woche
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    
    // Sonntag der aktuellen Woche
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}.${month}.`;
    };
    
    return {
      weekNumber,
      year: now.getFullYear(),
      dateRange: `${formatDate(monday)} - ${formatDate(sunday)}`
    };
  };

  const currentWeek = getCurrentWeek();
  
  // Mock-Daten für Statistiken
  const stats = {
    total: 7,
    missing: 1,
    substitutes: 0,
    confirmed: 6
  };

  return (
    <div className="space-y-6">
      {/* Header - angepasst für Dashboard */}
      {isDashboard ? (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Aktuelle Woche KW{currentWeek.weekNumber} ({currentWeek.dateRange})
          </h1>
          <p className="text-gray-600">Trainer-Übersicht für diese Woche</p>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wochenplan & Vertretungen</h1>
            <p className="text-gray-600">Trainer pro Woche verwalten - aus Stammdaten generiert</p>
          </div>
        </div>
      )}

      {/* Wochenauswahl - nur außerhalb Dashboard */}
      {!isDashboard && (
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Woche auswählen:</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>KW39 2025 (22.09.)</option>
              <option>KW40 2025 (29.09.)</option>
              <option>KW41 2025 (06.10.)</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {stats.total} Kurse • {stats.missing} fehlen • {stats.substitutes} Vertretungen
          </div>
        </div>
      )}

      {/* Kompakte KPI-Kacheln */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-content">
            <div className="kpi-icon">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="kpi-data">
              <div className="kpi-value">{stats.total}</div>
              <div className="kpi-label">Kurse gesamt</div>
            </div>
          </div>
        </div>
        
        <div className="kpi-card red">
          <div className="kpi-content">
            <div className="kpi-icon">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="kpi-data">
              <div className="kpi-value">{stats.missing}</div>
              <div className="kpi-label">Trainer fehlen</div>
            </div>
          </div>
        </div>
        
        <div className="kpi-card orange">
          <div className="kpi-content">
            <div className="kpi-icon">
              <User className="w-4 h-4" />
            </div>
            <div className="kpi-data">
              <div className="kpi-value">{stats.substitutes}</div>
              <div className="kpi-label">Vertretungen</div>
            </div>
          </div>
        </div>
        
        <div className="kpi-card green">
          <div className="kpi-content">
            <div className="kpi-icon">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="kpi-data">
              <div className="kpi-value">{stats.confirmed}</div>
              <div className="kpi-label">Vollständig besetzt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Kursliste */}
      <div className="space-y-4">
        <CourseCard
          course={{
            id: 1,
            name: 'Frauengymnastik',
            time: 'Montag, 22.09., 20:00 - 21:30',
            location: 'Turnhalle',
            requirements: 'Bedarf: 1 Trainer',
            status: 'confirmed',
            requiredTrainers: 1
          }}
          trainers={[
            {
              id: 1,
              name: 'Desiree Knopf',
              phone: '+49 6227 123456',
              email: 'desiree.knopf@tsvrot.de',
              isActive: true,
              isSubstitute: false
            }
          ]}
          isAdmin={isAdmin}
        />
        
        <CourseCard
          course={{
            id: 2,
            name: 'Turnzwerge 3-4 Jahre',
            time: 'Dienstag, 23.09., 15:30 - 16:30',
            location: 'Turnhalle',
            requirements: 'Bedarf: 2 Trainer',
            status: 'missing',
            requiredTrainers: 2
          }}
          trainers={[
            {
              id: 2,
              name: 'Sarah Winkler',
              phone: '+49 6227 234567',
              email: 'sarah.winkler@tsvrot.de',
              isActive: true,
              isSubstitute: false
            }
          ]}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}

function CourseCard({ course, trainers }: {
  course: any;\n  trainers: any[];
}) {
  const [trainerAssignments, setTrainerAssignments] = useState(trainers);
  const [showSubstituteForm, setShowSubstituteForm] = useState<number | null>(null);
  
  const toggleTrainerActive = (trainerId: number) => {
    console.log('Toggle geklickt für Trainer:', trainerId);
    setTrainerAssignments(prev => 
      prev.map(assignment => 
        assignment.id === trainerId 
          ? { ...assignment, isActive: !assignment.isActive }
          : assignment
      )
    );
  };

  const addSubstitute = (substituteData: any) => {
    const newSubstitute = {
      ...substituteData,
      id: Date.now(),
      isSubstitute: true,
      isActive: true
    };
    
    setTrainerAssignments(prev => [...prev, newSubstitute]);
    setShowSubstituteForm(null);
  };

  const activeTrainers = trainerAssignments.filter(t => t.isActive).length;
  const requiredTrainers = course.requiredTrainers || 2;
  const missingTrainers = Math.max(0, requiredTrainers - activeTrainers);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Course Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
            <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              missingTrainers > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {missingTrainers > 0 ? 'Trainer fehlen' : 'Vollständig besetzt'}
            </span>
            {missingTrainers > 0 && (
              <span className="ml-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {missingTrainers}
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600 space-x-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {course.time}
            </div>
            <span>•</span>
            <span>{course.location}</span>
          </div>
        </div>
      </div>

      {/* Trainer List */}
      <div className="space-y-3">
        {trainerAssignments.map((trainer) => (
          <div key={trainer.id} className={`flex items-center justify-between p-3 rounded-lg ${
            trainer.isActive 
              ? trainer.isSubstitute 
                ? 'bg-orange-50 border border-orange-200' 
                : 'bg-green-50 border border-green-200'
              : 'bg-gray-50 border border-gray-200 opacity-75'
          }`}>
            <div className="flex items-center space-x-3">
              {/* Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Button geklickt für:', trainer.name);
                  toggleTrainerActive(trainer.id);
                }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  trainer.isActive 
                    ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' 
                    : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50'
                }`}
                title={trainer.isActive ? 'Trainer deaktivieren' : 'Trainer aktivieren'}
              >
                {trainer.isActive && <CheckCircle className="w-3 h-3" />}
              </button>

              <div className="flex items-center space-x-2">
                <User className={`w-4 h-4 ${trainer.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${trainer.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                  {trainer.name}
                  {trainer.isSubstitute && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      Vertretung
                    </span>
                  )}
                  {!trainer.isActive && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Abwesend
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Phone className="w-3 h-3" />
              <span>{trainer.phone}</span>
              <Mail className="w-3 h-3" />
              <span>{trainer.email}</span>
            </div>
          </div>
        ))}

        {/* Vertretung hinzufügen */}
        {missingTrainers > 0 && (
          <div className="mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg">
            <button
              onClick={() => setShowSubstituteForm(Date.now())}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Vertretung hinzufügen
            </button>
          </div>
        )}

        {/* Substitute Form */}
        {showSubstituteForm && (
          <SubstituteForm
            onSubmit={addSubstitute}
            onCancel={() => setShowSubstituteForm(null)}
          />
        )}
      </div>
    </div>
  );
}

function SubstituteForm({ onSubmit, onCancel }: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    trainerId: '',
    reason: ''
  });

  // Trainer-Stammdaten
  const availableTrainers = [
    { id: 1, name: 'Desiree Knopf', phone: '+49 6227 123456', email: 'desiree.knopf@tsvrot.de' },
    { id: 2, name: 'Sarah Winkler', phone: '+49 6227 234567', email: 'sarah.winkler@tsvrot.de' },
    { id: 3, name: 'Julia Miller', phone: '+49 6227 345678', email: 'julia.miller@tsvrot.de' },
    { id: 4, name: 'Tom Schulze', phone: '+49 6227 456789', email: 'tom.schulze@tsvrot.de' },
    { id: 5, name: 'Nina Weber', phone: '+49 6227 567890', email: 'nina.weber@tsvrot.de' },
    { id: 6, name: 'Max Hoffmann', phone: '+49 6227 678901', email: 'max.hoffmann@tsvrot.de' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTrainer = availableTrainers.find(t => t.id.toString() === formData.trainerId);
    if (selectedTrainer) {
      onSubmit({
        ...selectedTrainer,
        reason: formData.reason
      });
    }
  };

  return (
    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="font-medium text-blue-900 mb-3">Vertretung hinzufügen</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trainer auswählen *</label>
          <select
            value={formData.trainerId}
            onChange={(e) => setFormData({...formData, trainerId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Trainer auswählen --</option>
            {availableTrainers.map((trainer) => (
              <option key={trainer.id} value={trainer.id}>
                {trainer.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grund (optional)</label>
          <input
            type="text"
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. Krankheit, Urlaub..."
          />
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="btn btn-primary text-sm">
            Hinzufügen
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary text-sm">
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  );
}

export default WeeklyPlanPage;


