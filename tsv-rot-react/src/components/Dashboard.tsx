import React from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  UserX,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import { useDashboardStats, useTrainers, useCourses, useAbsences } from '@/hooks';
import { StatsCard, Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { formatDate, getWeekStart, getWeekRangeString } from '@/utils';

function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: trainers = [] } = useTrainers();
  const { data: courses = [] } = useCourses();
  const { data: absences = [] } = useAbsences();

  const weekStart = getWeekStart();
  const weekRange = getWeekRangeString(weekStart);

  // Calculate some basic stats if API stats not available
  const basicStats = {
    totalTrainers: trainers.length,
    activeTrainers: trainers.filter(t => t.isActive).length,
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.isActive).length,
    totalParticipants: courses.reduce((sum, c) => sum + c.maxParticipants, 0),
    pendingAbsences: absences.filter(a => !a.isApproved).length,
  };

  const displayStats = stats || basicStats;

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Übersicht über die Trainer- und Kursverwaltung
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Trainer"
          value={displayStats.activeTrainers}
          icon={Users}
        />
        
        <StatsCard
          title="Aktive Kurse"
          value={displayStats.activeCourses}
          icon={BookOpen}
        />
        
        <StatsCard
          title="Teilnehmerplätze"
          value={displayStats.totalParticipants}
          icon={TrendingUp}
        />
        
        <StatsCard
          title="Offene Ausfälle"
          value={displayStats.pendingAbsences}
          icon={UserX}
        />
      </div>

      {/* Current Week Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          title="Aktuelle Woche"
          subtitle={weekRange}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-tsv-blue-600 mr-3" />
                <span className="font-medium">Geplante Kurse</span>
              </div>
              <span className="text-lg font-bold text-tsv-blue-700">
                {courses.filter(c => c.isActive).length}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-tsv-green-600 mr-3" />
                <span className="font-medium">Verfügbare Trainer</span>
              </div>
              <span className="text-lg font-bold text-tsv-green-700">
                {trainers.filter(t => t.isActive).length}
              </span>
            </div>

            {displayStats.pendingAbsences > 0 && (
              <div className="flex items-center justify-between p-3 bg-tsv-yellow-50 rounded-lg border border-tsv-yellow-200">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-tsv-yellow-600 mr-3" />
                  <span className="font-medium text-tsv-yellow-800">Ausstehende Ausfälle</span>
                </div>
                <span className="text-lg font-bold text-tsv-yellow-700">
                  {displayStats.pendingAbsences}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card 
          title="Schnellzugriff"
          subtitle="Häufig verwendete Aktionen"
        >
          <div className="grid grid-cols-1 gap-3">
            <QuickActionButton
              icon={Users}
              title="Trainer verwalten"
              description="Trainer hinzufügen oder bearbeiten"
              href="/trainer"
            />
            
            <QuickActionButton
              icon={BookOpen}
              title="Kurse verwalten"
              description="Kurse erstellen oder ändern"
              href="/kurse"
            />
            
            <QuickActionButton
              icon={Calendar}
              title="Wochenplan anzeigen"
              description="Aktuelle Wochenplanung einsehen"
              href="/wochenplan"
            />
            
            <QuickActionButton
              icon={UserX}
              title="Ausfälle melden"
              description="Trainer-Ausfälle verwalten"
              href="/ausfaelle"
            />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card 
        title="System-Status"
        subtitle="Letzte Aktivitäten und wichtige Informationen"
      >
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-tsv-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-tsv-green-600 mr-3" />
            <div>
              <p className="font-medium text-tsv-green-900">System läuft stabil</p>
              <p className="text-sm text-tsv-green-700">
                Alle Funktionen sind verfügbar
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">Letzte Aktualisierung</p>
              <p className="text-sm text-blue-700">
                {formatDate(new Date(), 'dd.MM.yyyy HH:mm')} Uhr
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Quick Action Button Component
interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}

function QuickActionButton({ icon: Icon, title, description, href }: QuickActionButtonProps) {
  return (
    <a
      href={href}
      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-tsv-blue-300 transition-colors duration-150 group"
    >
      <div className="flex-shrink-0">
        <Icon className="w-6 h-6 text-gray-400 group-hover:text-tsv-blue-600" />
      </div>
      <div className="ml-4">
        <h4 className="text-sm font-medium text-gray-900 group-hover:text-tsv-blue-900">
          {title}
        </h4>
        <p className="text-xs text-gray-500 group-hover:text-tsv-blue-700">
          {description}
        </p>
      </div>
    </a>
  );
}

export default Dashboard;
