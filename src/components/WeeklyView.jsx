import React, { useState } from 'react';
import { Calendar, Clock, Users, AlertCircle, UserX, UserCheck, ChevronDown, ChevronRight, MapPin } from 'lucide-react';

const WeeklyView = ({ courses, trainers, setCourses }) => {
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [selectedDay, setSelectedDay] = useState('Alle');

  const daysOfWeek = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  // Filter courses by selected day
  const filteredCourses = React.useMemo(() => {
    let filtered = [...courses];
    
    if (selectedDay !== 'Alle') {
      filtered = filtered.filter(c => c.dayOfWeek === selectedDay);
    }
    
    // Sort by day and time
    const dayOrder = { 'Montag': 1, 'Dienstag': 2, 'Mittwoch': 3, 'Donnerstag': 4, 'Freitag': 5, 'Samstag': 6, 'Sonntag': 7 };
    filtered.sort((a, b) => {
      const dayDiff = dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
      if (dayDiff !== 0) return dayDiff;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
    
    return filtered;
  }, [courses, selectedDay]);

  // Toggle course expansion
  const toggleCourseExpansion = (courseId) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  // Get trainer name by ID
  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId);
    return trainer ? `${trainer.firstName} ${trainer.lastName}` : 'Unbekannter Trainer';
  };

  // Toggle trainer assignment
  const toggleTrainerAssignment = (courseId, trainerId) => {
    setCourses(courses.map(course => {
      if (course.id === courseId) {
        const currentIds = course.assignedTrainerIds || [];
        const newIds = currentIds.includes(trainerId)
          ? currentIds.filter(id => id !== trainerId)
          : [...currentIds, trainerId];
        return { ...course, assignedTrainerIds: newIds };
      }
      return course;
    }));
  };

  // Get available trainers for course
  const getAvailableTrainers = (course) => {
    return trainers.filter(trainer => 
      !course.assignedTrainerIds?.includes(trainer.id)
    );
  };

  // Get staffing status
  const getStaffingStatus = (course) => {
    const assigned = course.assignedTrainerIds?.length || 0;
    const required = course.requiredTrainers || 2;
    
    if (assigned === 0) return { status: 'critical', color: 'red', message: 'Keine Trainer' };
    if (assigned < required) return { status: 'warning', color: 'yellow', message: `${required - assigned} fehlt` };
    if (assigned === required) return { status: 'optimal', color: 'green', message: 'Optimal' };
    return { status: 'overstaffed', color: 'blue', message: `+${assigned - required} Extra` };
  };

  return (
    <div>
      {/* Header mit Filter - Mobile optimiert */}
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <span className="hidden sm:inline">Wochenplan</span>
          <span className="sm:hidden">Wochenplan</span>
        </h2>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
        >
          <option value="Alle">Alle Tage</option>
          {daysOfWeek.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredCourses.map(course => {
          const isExpanded = expandedCourses.has(course.id);
          const status = getStaffingStatus(course);
          const bgColor = status.color === 'red' ? 'bg-red-50 border-red-300' :
                         status.color === 'yellow' ? 'bg-yellow-50 border-yellow-300' :
                         status.color === 'green' ? 'bg-green-50 border-green-300' :
                         'bg-blue-50 border-blue-300';

          return (
            <div key={course.id} className={`border-2 rounded-lg ${bgColor}`}>
              <div className="p-3 sm:p-4">
                {/* Kurs-Header - Mobile optimiert */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <button
                        onClick={() => toggleCourseExpansion(course.id)}
                        className="mt-1 p-1 hover:bg-white hover:bg-opacity-50 rounded-full touch-manipulation"
                        aria-label={isExpanded ? 'Zuklappen' : 'Aufklappen'}
                      >
                        {isExpanded ? 
                          <ChevronDown className="w-5 h-5" /> : 
                          <ChevronRight className="w-5 h-5" />
                        }
                      </button>
                      <div className="flex-1">
                        {/* Zeit und Tag prominent */}
                        <div className="font-bold text-gray-900 text-sm sm:text-base">
                          {course.dayOfWeek}, {course.startTime || '?'}
                        </div>
                        {/* Kursname */}
                        <div className="font-medium text-gray-800 text-base sm:text-lg mt-1">
                          {course.name}
                        </div>
                        {/* Location für Mobile */}
                        {course.location && (
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            {course.location}
                          </div>
                        )}
                        {/* Kategorie Badge */}
                        {course.category && (
                          <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {course.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Info - Mobile optimiert */}
                    <div className="mt-3 ml-8 grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4">
                      <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {course.endTime ? `bis ${course.endTime}` : '60 Min'}
                      </span>
                      <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        {course.assignedTrainerIds?.length || 0}/{course.requiredTrainers || 2}
                      </span>
                    </div>

                    {/* Status Badge - Mobile optimiert */}
                    <div className="mt-3 ml-8">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        status.color === 'green' ? 'bg-green-100 text-green-800' :
                        status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        status.color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {status.color === 'green' ? '✓ ' : 
                         status.color === 'red' ? '⚠ ' : ''} 
                        {status.message}
                      </span>
                    </div>

                    {/* Zugewiesene Trainer - Mobile optimiert */}
                    {course.assignedTrainerIds && course.assignedTrainerIds.length > 0 && (
                      <div className="mt-3 ml-8">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {course.assignedTrainerIds.map(trainerId => (
                            <span key={trainerId} className="inline-flex items-center px-2 py-1 bg-white rounded text-xs sm:text-sm">
                              <UserCheck className="w-3 h-3 mr-1 text-green-600" />
                              {getTrainerName(trainerId)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Section - Mobile optimiert */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="sm:ml-9">
                      <h4 className="font-medium mb-3 text-sm sm:text-base">Verfügbare Trainer:</h4>
                      {/* Mobile: 1 Spalte, Desktop: 2 Spalten */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {getAvailableTrainers(course).map(trainer => {
                          const isAvailable = trainer.availability?.includes(course.dayOfWeek);
                          return (
                            <button
                              key={trainer.id}
                              onClick={() => toggleTrainerAssignment(course.id, trainer.id)}
                              className={`text-left p-3 rounded-lg border-2 hover:bg-blue-50 touch-manipulation ${
                                isAvailable ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
                              }`}
                            >
                              <div className="font-medium text-sm">
                                {trainer.firstName} {trainer.lastName}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {trainer.qualifications?.slice(0, 2).join(', ') || 'Keine Qualifikationen'}
                              </div>
                              {isAvailable ? (
                                <span className="text-xs text-green-600 mt-1 block">
                                  ✓ Verfügbar am {course.dayOfWeek}
                                </span>
                              ) : (
                                <span className="text-xs text-orange-600 mt-1 block">
                                  ⚠ Normalerweise nicht {course.dayOfWeek}
                                </span>
                              )}
                            </button>
                          );
                        })}
                        {getAvailableTrainers(course).length === 0 && (
                          <p className="text-sm text-gray-500 italic col-span-full">
                            Alle Trainer sind bereits zugewiesen
                          </p>
                        )}
                      </div>
                      
                      {/* Zugewiesene Trainer entfernen - Mobile optimiert */}
                      {course.assignedTrainerIds && course.assignedTrainerIds.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2 text-sm sm:text-base">Trainer entfernen:</h4>
                          <div className="flex flex-wrap gap-2">
                            {course.assignedTrainerIds.map(trainerId => (
                              <button
                                key={trainerId}
                                onClick={() => toggleTrainerAssignment(course.id, trainerId)}
                                className="inline-flex items-center px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm hover:bg-red-100 touch-manipulation"
                              >
                                <UserX className="w-4 h-4 mr-1 text-red-600" />
                                {getTrainerName(trainerId)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center text-gray-500">
          Keine Kurse für {selectedDay === 'Alle' ? 'diese Auswahl' : selectedDay} vorhanden.
        </div>
      )}

      {/* Legende - Mobile optimiert */}
      <div className="mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-xs sm:text-sm mb-2">Legende:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Optimal</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Unterbesetzt</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>Kritisch</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Überbesetzt</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;
