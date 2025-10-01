import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  CheckCircle,
  MinusCircle,
  PlusCircle
} from 'lucide-react';

export default function StaffingOverview({ courses }) {
  const [staffingAnalysis, setStaffingAnalysis] = useState([]);

  useEffect(() => {
    analyzeStaffing();
  }, [courses, trainingSessions]);

  const analyzeStaffing = () => {
    const analysis = courses.map(course => {
      const requiredTrainers = course.requiredTrainers || 2;
      const assignedTrainerIds = course.assignedTrainerIds || [];
      
      const presentTrainerIds = [];const assignedCount = assignedTrainerIds.length;
      const presentCount = presentTrainerIds.length;
      const deltaAssigned = assignedCount - requiredTrainers;
      const deltaPresent = presentCount - requiredTrainers;

      let status = 'optimal';
      let statusColor = 'green';
      let statusIcon = CheckCircle;
      let message = '';

      if (assignedCount === 0) {
        status = 'critical';
        statusColor = 'red';
        statusIcon = UserX;
        message = `Keine Trainer zugewiesen! (Soll: ${requiredTrainers})`;
      } else if (deltaAssigned < 0) {
        status = 'understaffed';
        statusColor = 'yellow';
        statusIcon = AlertTriangle;
        message = `${Math.abs(deltaAssigned)} Trainer fehlen (Soll: ${requiredTrainers}, Ist: ${assignedCount})`;
      } else if (deltaAssigned > 0) {
        status = 'overstaffed';
        statusColor = 'blue';
        statusIcon = PlusCircle;
        message = `${deltaAssigned} Trainer zu viel (Soll: ${requiredTrainers}, Ist: ${assignedCount})`;
      } else {
        message = `Optimal besetzt (${requiredTrainers} Trainer)`;
      }

      return {
        course,
        requiredTrainers,
        assignedCount,
        presentCount,
        deltaAssigned,
        deltaPresent,
        status,
        statusColor,
        statusIcon,
        message,
        lastSessionDate: latestSession?.date
      };
    });

    setStaffingAnalysis(analysis);
  };

  const getOverallStats = () => {
    const totalCourses = staffingAnalysis.length;
    const critical = staffingAnalysis.filter(a => a.status === 'critical').length;
    const understaffed = staffingAnalysis.filter(a => a.status === 'understaffed').length;
    const optimal = staffingAnalysis.filter(a => a.status === 'optimal').length;
    const overstaffed = staffingAnalysis.filter(a => a.status === 'overstaffed').length;
    
    const totalRequired = staffingAnalysis.reduce((sum, a) => sum + a.requiredTrainers, 0);
    const totalAssigned = staffingAnalysis.reduce((sum, a) => sum + a.assignedCount, 0);
    const totalDelta = totalAssigned - totalRequired;

    return {
      totalCourses,
      critical,
      understaffed,
      optimal,
      overstaffed,
      totalRequired,
      totalAssigned,
      totalDelta
    };
  };

  const stats = getOverallStats();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Besetzungs-Übersicht</h2>
        
        {/* Mobile: 2 Spalten, Tablet: 4 Spalten */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalCourses}</div>
            <div className="text-xs sm:text-sm text-gray-600">Kurse gesamt</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.optimal}</div>
            <div className="text-xs sm:text-sm text-gray-600">Optimal besetzt</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.understaffed}</div>
            <div className="text-xs sm:text-sm text-gray-600">Unterbesetzt</div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-3 sm:p-4">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-xs sm:text-sm text-gray-600">Kritisch</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <div className="text-xs sm:text-sm text-gray-600">Gesamt-Besetzung</div>
              <div className="text-base sm:text-lg font-semibold">
                {stats.totalAssigned} von {stats.totalRequired} Trainer-Stellen besetzt
              </div>
            </div>
            <div className={`text-xl sm:text-2xl font-bold ${
              stats.totalDelta === 0 ? 'text-green-600' :
              stats.totalDelta > 0 ? 'text-blue-600' :
              'text-red-600'
            }`}>
              {stats.totalDelta > 0 && '+'}
              {stats.totalDelta}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: 1 Spalte, Desktop: 2 Spalten */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {staffingAnalysis.map(({ 
          course, 
          requiredTrainers,
          assignedCount,
          presentCount,
          deltaAssigned,
          status,
          statusColor,
          statusIcon: Icon,
          message,
          lastSessionDate
        }) => (
          <div key={course.id} className={`bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-${statusColor}-500`}>
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold">{course.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {course.dayOfWeek} â€¢ {course.startTime} - {course.endTime}
                </p>
                {course.location && (
                  <p className="text-xs text-gray-500 mt-1">
                    ðŸ“ {course.location}
                  </p>
                )}
              </div>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${statusColor}-500`} />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <div className="text-xs sm:text-sm text-gray-600">Soll</div>
                <div className="text-lg sm:text-xl font-bold">{requiredTrainers}</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-600">Zugewiesen</div>
                <div className={`text-lg sm:text-xl font-bold ${
                  assignedCount < requiredTrainers ? 'text-yellow-600' :
                  assignedCount > requiredTrainers ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {assignedCount}
                </div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-gray-600">Delta</div>
                <div className={`text-lg sm:text-xl font-bold ${
                  deltaAssigned === 0 ? 'text-green-600' :
                  deltaAssigned > 0 ? 'text-blue-600' :
                  'text-red-600'
                }`}>
                  {deltaAssigned > 0 && '+'}
                  {deltaAssigned}
                </div>
              </div>
            </div>

            <div className={`p-2 sm:p-3 rounded-lg bg-${statusColor}-50 text-${statusColor}-800`}>
              <p className="text-xs sm:text-sm font-medium">{message}</p>
            </div>

            {lastSessionDate && (
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Letzte Einheit: {new Date(lastSessionDate).toLocaleDateString('de-DE')}
                  {presentCount !== null && (
                    <span className="ml-2">
                      â€¢ {presentCount} Trainer anwesend
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {(stats.critical > 0 || stats.understaffed > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
          <h3 className="font-semibold text-yellow-900 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Handlungsempfehlungen
          </h3>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-yellow-800">
            {stats.critical > 0 && (
              <li>â€¢ {stats.critical} Kurse haben keine Trainer zugewiesen - dringend Trainer zuweisen!</li>
            )}
            {stats.understaffed > 0 && (
              <li>â€¢ {stats.understaffed} Kurse sind unterbesetzt - zusätzliche Trainer rekrutieren oder Vertretungen organisieren</li>
            )}
            {stats.totalDelta < 0 && (
              <li>â€¢ Insgesamt fehlen {Math.abs(stats.totalDelta)} Trainer - Personalbedarf prüfen</li>
            )}
          </ul>
        </div>
      )}

      {staffingAnalysis.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center text-gray-500">
          Keine Kurse vorhanden. Fügen Sie Kurse hinzu, um die Besetzungsübersicht zu sehen.
        </div>
      )}
    </div>
  );
}

