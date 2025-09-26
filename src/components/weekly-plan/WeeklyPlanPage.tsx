import { useState } from 'react';
import { Calendar, AlertTriangle, CheckCircle, User, Clock, Phone, Mail, Edit3, UserPlus } from 'lucide-react';

// Stammdaten aus CoursesPage importieren
const COURSES = [
  {
    id: 1, name: 'Frauengymnastik', day: 'Montag', startTime: '20:00', endTime: '21:30',
    requiredTrainers: 1, defaultTrainers: [1], location: 'Turnhalle'
  },
  {
    id: 2, name: 'Turnzwerge 3-4 Jahre', day: 'Dienstag', startTime: '15:30', endTime: '16:30',
    requiredTrainers: 2, defaultTrainers: [2, 4], location: 'Turnhalle'
  },
  {
    id: 3, name: 'Kinderturnen 5-7 Jahre', day: 'Mittwoch', startTime: '16:00', endTime: '17:00',
    requiredTrainers: 1, defaultTrainers: [1], location: 'Turnhalle'
  },
  {
    id: 4, name: 'Jugendturnen 8-12 Jahre', day: 'Donnerstag', startTime: '17:00', endTime: '18:30',
    requiredTrainers: 2, defaultTrainers: [2, 5], location: 'Turnhalle'
  },
  {
    id: 5, name: 'Geräteturnen Leistung', day: 'Freitag', startTime: '17:30', endTime: '19:30',
    requiredTrainers: 2, defaultTrainers: [2, 6], location: 'Turnhalle'
  },
  {
    id: 6, name: 'Fitness-Mix', day: 'Donnerstag', startTime: '19:00', endTime: '20:00',
    requiredTrainers: 1, defaultTrainers: [3], location: 'Turnhalle'
  },
  {
    id: 7, name: 'Seniorengymnastik', day: 'Mittwoch', startTime: '10:00', endTime: '11:00',
    requiredTrainers: 1, defaultTrainers: [], location: 'Gymnastiksaal'
  }
];

// Trainer-Stammdaten
const TRAINERS = [
  { id: 1, name: 'Desiree Knopf', phone: '+49 6227 123456', email: 'desiree.knopf@tsvrot.de' },
  { id: 2, name: 'Sarah Winkler', phone: '+49 6227 234567', email: 'sarah.winkler@tsvrot.de' },
  { id: 3, name: 'Julia Miller', phone: '+49 6227 345678', email: 'julia.miller@tsvrot.de' },
  { id: 4, name: 'Tom Schulze', phone: '+49 6227 456789', email: 'tom.schulze@tsvrot.de' },
  { id: 5, name: 'Nina Weber', phone: '+49 6227 567890', email: 'nina.weber@tsvrot.de' },
  { id: 6, name: 'Max Hoffmann', phone: '+49 6227 678901', email: 'max.hoffmann@tsvrot.de' }
];

interface WeeklyTrainerAssignment {
  trainerId: number;
  isActive: boolean; // Standard-Trainer aktiv oder deaktiviert
  isSubstitute: boolean; // Ist das eine Vertretung?
  substituteReason?: string;
}

interface WeeklyAssignment {
  id: number;
  courseId: number;
  weekDate: string;
  trainers: WeeklyTrainerAssignment[]; // Array von Trainern für diesen Kurs
}

interface WeeklyPlanPageProps {
  isAdmin: boolean;
  isDashboard?: boolean;
}

function WeeklyPlanPage({ isAdmin, isDashboard = false }: WeeklyPlanPageProps) {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  });

  // Wöchentliche Zuordnungen - dynamisch generiert aus Stammdaten
  const [weeklyAssignments, setWeeklyAssignments] = useState<WeeklyAssignment[]>(() => {
    const assignments: WeeklyAssignment[] = [];
    
    // Für die nächsten 8 Wochen alle Kurse generieren
    for (let week = 0; week < 8; week++) {
      const weekDate = new Date();
      weekDate.setDate(weekDate.getDate() - weekDate.getDay() + 1 + (week * 7));
      
      COURSES.forEach(course => {
        const courseDate = new Date(weekDate);
        const dayOffset = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'].indexOf(course.day);
        courseDate.setDate(weekDate.getDate() + dayOffset);
        
        assignments.push({
          id: course.id * 100 + week,
          courseId: course.id,
          weekDate: courseDate.toISOString().split('T')[0],
          trainers: course.defaultTrainers.map(trainerId => ({
            trainerId,
            isActive: trainerId !== 1 || week !== 1, // Desiree fällt in Woche 2 aus (Beispiel)
            isSubstitute: false
          }))
        });
      });
      
      // Beispiel: Vertretung hinzufügen für Woche 2
      if (week === 1) {
        const frauengymnastikAssignment = assignments.find(a => a.courseId === 1 && a.weekDate.includes('2025-02-03'));
        if (frauengymnastikAssignment) {
          frauengymnastikAssignment.trainers.push({
            trainerId: 3, // Julia als Vertretung
            isActive: true,
            isSubstitute: true,
            substituteReason: 'Vertretung für Desiree (Urlaub)'
          });
        }
      }
    }
    
    return assignments;
  });

  const getWeekOptions = () => {
    const weeks = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1 + (i * 7));
      
      const weekNumber = getWeekNumber(weekStart);
      const year = weekStart.getFullYear();
      
      weeks.push({
        value: weekStart.toISOString().split('T')[0],
        label: `KW${weekNumber} ${year} (${weekStart.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })})`
      });
    }
    return weeks;
  };

  const getWeekNumber = (date: Date) => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  };

  const getCurrentWeekAssignments = () => {
    const selectedDate = new Date(selectedWeek);
    const weekEnd = new Date(selectedDate);
    weekEnd.setDate(selectedDate.getDate() + 6);
    
    return weeklyAssignments.filter(assignment => {
      const assignmentDate = new Date(assignment.weekDate);
      return assignmentDate >= selectedDate && assignmentDate <= weekEnd;
    });
  };

  const getWeekStats = () => {
    const assignments = getCurrentWeekAssignments();
    const total = assignments.length;
    
    let missing = 0;
    let substitutes = 0;
    let confirmed = 0;
    
    assignments.forEach(assignment => {
      const course = COURSES.find(c => c.id === assignment.courseId)!;
      const activeTrainers = assignment.trainers.filter(t => t.isActive).length;
      const substituteTrainers = assignment.trainers.filter(t => t.isActive && t.isSubstitute).length;
      
      if (activeTrainers < course.requiredTrainers) missing++;
      if (substituteTrainers > 0) substitutes++;
      if (activeTrainers >= course.requiredTrainers) confirmed++;
    });
    
    return { total, missing, substitutes, confirmed };
  };

  const toggleTrainer = (assignmentId: number, trainerId: number) => {
    if (!isAdmin) return;
    
    setWeeklyAssignments(prev => prev.map(assignment => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          trainers: assignment.trainers.map(trainer => 
            trainer.trainerId === trainerId 
              ? { ...trainer, isActive: !trainer.isActive }
              : trainer
          )
        };
      }
      return assignment;
    }));
  };

  const addSubstitute = (assignmentId: number, trainerId: number, reason: string) => {
    if (!isAdmin) return;
    
    setWeeklyAssignments(prev => prev.map(assignment => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          trainers: [...assignment.trainers, {
            trainerId,
            isActive: true,
            isSubstitute: true,
            substituteReason: reason
          }]
        };
      }
      return assignment;
    }));
  };

  const stats = getWeekStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isDashboard ? 'Diese Woche - Trainer-Übersicht' : 'Wochenplan & Vertretungen'}</h1>
          <p className="text-gray-600">{isDashboard ? 'Aktueller Wochenplan mit allen TSV-Kursen' : 'Trainer pro Woche verwalten - aus Stammdaten generiert'}</p>
        </div>
      </div>

      {/* Wochen-Auswahl */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Woche auswählen:</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {getWeekOptions().map(week => (
              <option key={week.value} value={week.value}>{week.label}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600">
          {stats.total} Kurse • {stats.missing} fehlen • {stats.substitutes} Vertretungen
        </div>
      </div>

      {/* Wochenstatistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kurse gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trainer fehlen</p>
              <p className="text-2xl font-bold text-red-700">{stats.missing}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <User className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vertretungen</p>
              <p className="text-2xl font-bold text-orange-700">{stats.substitutes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vollständig besetzt</p>
              <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kurse der Woche */}
      <div className="space-y-4">
        {getCurrentWeekAssignments()
          .sort((a, b) => {
            const courseA = COURSES.find(c => c.id === a.courseId)!;
            const courseB = COURSES.find(c => c.id === b.courseId)!;
            const dayOrder = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
            const dayComparison = dayOrder.indexOf(courseA.day) - dayOrder.indexOf(courseB.day);
            if (dayComparison !== 0) return dayComparison;
            return courseA.startTime.localeCompare(courseB.startTime);
          })
          .map((assignment) => (
            <WeeklyCourseCard
              key={assignment.id}
              assignment={assignment}
              course={COURSES.find(c => c.id === assignment.courseId)!}
              trainers={TRAINERS}
              isAdmin={isAdmin}
              onToggleTrainer={(trainerId) => toggleTrainer(assignment.id, trainerId)}
              onAddSubstitute={(trainerId, reason) => addSubstitute(assignment.id, trainerId, reason)}
            />
          ))}
      </div>
    </div>
  );
}

function WeeklyCourseCard({ 
  assignment, course, trainers, isAdmin, onToggleTrainer, onAddSubstitute 
}: { 
  assignment: WeeklyAssignment;
  course: typeof COURSES[0];
  trainers: typeof TRAINERS;
  isAdmin: boolean;
  onToggleTrainer: (trainerId: number) => void;
  onAddSubstitute: (trainerId: number, reason: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddSubstitute, setShowAddSubstitute] = useState(false);
  
  const activeTrainers = assignment.trainers.filter(t => t.isActive);
  const requiredTrainers = course.requiredTrainers;
  const isMissingTrainers = activeTrainers.length < requiredTrainers;
  const hasSubstitutes = assignment.trainers.some(t => t.isSubstitute && t.isActive);

  const getStatusColor = () => {
    if (isMissingTrainers) return 'red';
    if (hasSubstitutes) return 'orange';
    return 'green';
  };

  const getStatusText = () => {
    if (isMissingTrainers) return `${requiredTrainers - activeTrainers.length} Trainer fehlen`;
    if (hasSubstitutes) return 'Mit Vertretung';
    return 'Vollständig besetzt';
  };

  const statusColor = getStatusColor();
  const weekday = new Date(assignment.weekDate).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Kurs-Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
              {getStatusText()}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600 space-x-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{weekday}, {course.startTime} - {course.endTime}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span>{course.location}</span>
            <span className="text-gray-400">•</span>
            <span>Bedarf: {requiredTrainers} Trainer</span>
          </div>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-lg transition-colors ${isEditing ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
            title="Trainer bearbeiten"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Trainer-Liste */}
      <div className="space-y-3">
        {assignment.trainers.map((trainerAssignment) => {
          const trainer = trainers.find(t => t.id === trainerAssignment.trainerId);
          if (!trainer) return null;

          return (
            <div key={`${trainer.id}-${trainerAssignment.isSubstitute}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {isAdmin && isEditing && (
                  <button
                    onClick={() => onToggleTrainer(trainer.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      trainerAssignment.isActive 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {trainerAssignment.isActive && <CheckCircle className="w-3 h-3" />}
                  </button>
                )}
                
                <div className="flex items-center space-x-2">
                  <User className={`w-4 h-4 ${trainerAssignment.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${trainerAssignment.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {trainer.name}
                  </span>
                  {trainerAssignment.isSubstitute && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      Vertretung
                    </span>
                  )}
                  {!trainerAssignment.isActive && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Fällt aus
                    </span>
                  )}
                </div>
              </div>
              
              {trainerAssignment.isActive && (
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    <span>{trainer.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    <span>{trainer.email}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Vertretung hinzufügen */}
        {isAdmin && isEditing && isMissingTrainers && (
          <div className="mt-4 p-3 border-2 border-dashed border-gray-300 rounded-lg">
            {!showAddSubstitute ? (
              <button
                onClick={() => setShowAddSubstitute(true)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Vertretung hinzufügen
              </button>
            ) : (
              <AddSubstituteForm
                trainers={trainers}
                onAdd={(trainerId, reason) => {
                  onAddSubstitute(trainerId, reason);
                  setShowAddSubstitute(false);
                }}
                onCancel={() => setShowAddSubstitute(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Grund für Vertretung anzeigen */}
      {assignment.trainers.some(t => t.isSubstitute && t.substituteReason) && (
        <div className="mt-3 p-3 bg-orange-50 rounded-lg">
          <div className="text-sm text-orange-800">
            <strong>Vertretungsgrund:</strong> {assignment.trainers.find(t => t.isSubstitute && t.substituteReason)?.substituteReason}
          </div>
        </div>
      )}
    </div>
  );
}

function AddSubstituteForm({ 
  trainers, onAdd, onCancel 
}: { 
  trainers: typeof TRAINERS; 
  onAdd: (trainerId: number, reason: string) => void;
  onCancel: () => void;
}) {
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTrainer && reason) {
      onAdd(parseInt(selectedTrainer), reason);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Vertretung:</label>
        <select
          value={selectedTrainer}
          onChange={(e) => setSelectedTrainer(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Trainer auswählen...</option>
          {trainers.map(trainer => (
            <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Grund:</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="z.B. Krankheit, Urlaub..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
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
  );
}

export default WeeklyPlanPage;


