import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertCircle, UserX, UserCheck, ChevronDown, ChevronRight, MapPin } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8181/api'
  : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api';

const WeeklyView = ({ courses, trainers, setCourses }) => {
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [selectedDay, setSelectedDay] = useState('Alle');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // State für Ausfälle und Ferien
  const [cancelledCourses, setCancelledCourses] = useState(() => {
    const saved = localStorage.getItem('tsvrot-cancelled-courses');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [holidayWeeks, setHolidayWeeks] = useState(() => {
    const saved = localStorage.getItem('tsvrot-holiday-weeks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  // Wochenspezifische Trainer-Zuweisungen
  const [weeklyAssignments, setWeeklyAssignments] = useState(() => {
    const saved = localStorage.getItem('tsvrot-weekly-assignments');
    return saved ? JSON.parse(saved) : {};
  });

  // Speichern bei Änderungen
  useEffect(() => {
    localStorage.setItem('tsvrot-weekly-assignments', JSON.stringify(weeklyAssignments));
  }, [weeklyAssignments]);

  const daysOfWeek = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  // ===== WICHTIG: Funktionen in korrekter Reihenfolge =====
  
  // 1. KW berechnen - ZUERST definieren
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  const weekNumber = getWeekNumber(currentWeek);
  const year = currentWeek.getFullYear();

  // 2. Hilfsfunktionen - VOR den Funktionen die sie nutzen
  const calculateHours = (start, end) => {
    if (!start || !end) return 1;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH + endM/60) - (startH + startM/60);
  };

  // 3. Wochenspezifische Keys und Getter/Setter
  const getWeeklyKey = (courseId) => {
    return `${courseId}-${weekNumber}-${year}`;
  };

  const getWeeklyTrainers = (course) => {
    const key = getWeeklyKey(course.id);
    return weeklyAssignments[key] || course.assignedTrainerIds || [];
  };
  
  const setWeeklyTrainers = (courseId, trainerIds) => {
    const key = getWeeklyKey(courseId);
    setWeeklyAssignments(prev => ({
      ...prev,
      [key]: trainerIds
    }));
  };

  // 4. Stunden speichern (nutzt calculateHours - jetzt korrekt)
  const saveWeekHours = async () => {
    courses.forEach(course => {
      if (isCourseCancel(course.id)) {
        return;
      }
      
      const weeklyTrainerIds = getWeeklyTrainers(course);
      if (weeklyTrainerIds.length > 0) {
        const hours = calculateHours(course.startTime, course.endTime);
        
        weeklyTrainerIds.forEach(async trainerId => {
          await fetch(`${API_URL}/api/training-sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              week_number: weekNumber,
              year: year,
              course_id: course.id,
              trainer_id: trainerId,
              hours: hours || 1,
              status: 'done'
            })
          });
        });
      }
    });
  };

  // 5. Woche wechseln
  const changeWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
    
    // Stunden speichern beim Wechsel
    saveWeekHours();
  };

  // 6. Datum-Funktionen
  const getDateForCourse = (dayOfWeek) => {
    const date = new Date(currentWeek);
    const currentDay = date.getDay() || 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - currentDay + 1);
    
    const dayIndex = {
      'Montag': 0, 'Dienstag': 1, 'Mittwoch': 2, 
      'Donnerstag': 3, 'Freitag': 4, 'Samstag': 5, 'Sonntag': 6
    };
    
    const courseDate = new Date(monday);
    courseDate.setDate(monday.getDate() + (dayIndex[dayOfWeek] || 0));
    
    return courseDate;
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}.`;
  };

  // 7. Ausfall-Funktionen
  const isCourseCancel = (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    const isHoliday = holidayWeeks.has(`${weekNumber}-${year}`);
    return cancelledCourses.has(key) || isHoliday;
  };

  const toggleCourseCancellation = (courseId, reason = 'Sonstiges') => {
    const key = `${courseId}-${weekNumber}-${year}`;
    const newCancelled = new Set(cancelledCourses);
    
    if (newCancelled.has(key)) {
      newCancelled.delete(key);
    } else {
      newCancelled.add(key);
    }
    
    setCancelledCourses(newCancelled);
    localStorage.setItem('tsvrot-cancelled-courses', JSON.stringify([...newCancelled]));
  };

  const toggleHolidayWeek = () => {
    const key = `${weekNumber}-${year}`;
    const newHolidays = new Set(holidayWeeks);
    
    if (newHolidays.has(key)) {
      newHolidays.delete(key);
    } else {
      newHolidays.add(key);
    }
    
    setHolidayWeeks(newHolidays);
    localStorage.setItem('tsvrot-holiday-weeks', JSON.stringify([...newHolidays]));
  };

  const isHolidayWeek = () => {
    return holidayWeeks.has(`${weekNumber}-${year}`);
  };

  // 8. Filter und Sortierung
  const filteredCourses = React.useMemo(() => {
    let filtered = [...courses];
    
    if (selectedDay !== 'Alle') {
      filtered = filtered.filter(c => c.dayOfWeek === selectedDay);
    }
    
    const dayOrder = { 'Montag': 1, 'Dienstag': 2, 'Mittwoch': 3, 'Donnerstag': 4, 'Freitag': 5, 'Samstag': 6, 'Sonntag': 7 };
    filtered.sort((a, b) => {
      const dayDiff = dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
      if (dayDiff !== 0) return dayDiff;
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
    
    return filtered;
  }, [courses, selectedDay]);

  // 9. UI-Funktionen
  const toggleCourseExpansion = (courseId) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId);
    return trainer ? `${trainer.firstName} ${trainer.lastName}` : 'Unbekannter Trainer';
  };

  const toggleTrainerAssignment = (courseId, trainerId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    const currentIds = getWeeklyTrainers(course);
    const newIds = currentIds.includes(trainerId)
      ? currentIds.filter(id => id !== trainerId)
      : [...currentIds, trainerId];
    
    setWeeklyTrainers(courseId, newIds);
  };

  const getAvailableTrainers = (course) => {
    const weeklyTrainerIds = getWeeklyTrainers(course);
    return trainers.filter(trainer => 
      !weeklyTrainerIds.includes(trainer.id)
    );
  };

  const getStaffingStatus = (course) => {
    const weeklyTrainerIds = getWeeklyTrainers(course);
    const assigned = weeklyTrainerIds.length;
    const required = course.requiredTrainers || 2;
    
    if (assigned === 0) return { status: 'critical', color: 'red', message: 'Keine Trainer' };
    if (assigned < required) return { status: 'warning', color: 'yellow', message: `${required - assigned} fehlt` };
    if (assigned === required) return { status: 'optimal', color: 'green', message: '' };
    return { status: 'overstaffed', color: 'blue', message: `+${assigned - required} Extra` };
  };

  // ===== RENDER =====
  return (
    <div>
      {/* KW Navigation mit Ferien-Button */}
      <div className="mb-3 flex items-center justify-between bg-white p-3 rounded-lg border">
        <button 
          onClick={() => changeWeek(-1)} 
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          ←
        </button>
        
        <div className="text-center flex-1">
          <div className="font-bold">KW {weekNumber}/{year}</div>
          <button
            onClick={toggleHolidayWeek}
            className={`mt-1 px-3 py-1 text-sm rounded-full ${
              isHolidayWeek() 
                ? 'bg-orange-100 text-orange-800 border border-orange-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isHolidayWeek() ? '🖐️ Ferien aktiv' : '🖐️ Als Ferien markieren'}
          </button>
        </div>
        
        <button 
          onClick={() => changeWeek(1)} 
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          →
        </button>
      </div>
      
      {/* Header mit Filter */}
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <span>Wochenplan</span>
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

      {/* Kursliste */}
      <div className="space-y-3">
        {filteredCourses.map(course => {
          const isExpanded = expandedCourses.has(course.id);
          const status = getStaffingStatus(course);
          const bgColor = isCourseCancel(course.id) 
            ? 'bg-gray-100 border-gray-400 opacity-60' 
            : status.color === 'red' ? 'bg-red-50 border-red-300' :
              status.color === 'yellow' ? 'bg-yellow-50 border-yellow-300' :
              status.color === 'green' ? 'bg-green-50 border-green-300' :
              'bg-blue-50 border-blue-300';

          return (
            <div key={course.id} className={`border-2 rounded-lg ${bgColor}`}>
              <div className="p-3 sm:p-4">
                {/* Ausfall-Banner */}
                {isCourseCancel(course.id) && (
                  <div className="mb-2 px-3 py-2 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2">
                    <span className="text-lg">🚫</span>
                    <span className="text-sm font-medium text-red-800">
                      {isHolidayWeek() ? 'AUSGEFALLEN - Ferien' : 'AUSGEFALLEN'}
                    </span>
                  </div>
                )}
                
                {/* Kurs-Header */}
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
                        {/* Zeit und Tag mit Datum */}
                        <div className="font-bold text-gray-900 text-sm sm:text-base">
                          {course.dayOfWeek}, {formatDate(getDateForCourse(course.dayOfWeek))} · {course.startTime || '?'}
                        </div>
                        {/* Kursname */}
                        <div className="font-medium text-gray-800 text-base sm:text-lg mt-1">
                          {course.name}
                        </div>
                        {/* Location */}
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

                    {/* Status Info */}
                    <div className="mt-3 ml-8 grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4">
                      <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {course.endTime ? `bis ${course.endTime}` : '60 Min'}
                      </span>
                      <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        {getWeeklyTrainers(course).length}/{course.requiredTrainers || 2}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3 ml-8">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        status.color === 'green' ? 'bg-green-100 text-green-800' :
                        status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        status.color === 'red' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {status.message}
                      </span>
                    </div>

                    {/* Zugewiesene Trainer */}
                    {(() => {
                      const weeklyTrainerIds = getWeeklyTrainers(course);
                      return weeklyTrainerIds.length > 0 && (
                        <div className="mt-3 ml-8">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {weeklyTrainerIds.map(trainerId => (
                              <span key={trainerId} className="inline-flex items-center px-2 py-1 bg-white rounded text-xs sm:text-sm">
                                <UserCheck className="w-3 h-3 mr-1 text-green-600" />
                                {getTrainerName(trainerId)}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Expanded Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="sm:ml-9">
                      <h4 className="font-medium mb-3 text-sm sm:text-base">Verfügbare Trainer:</h4>
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
                                  Verfügbar am {course.dayOfWeek}
                                </span>
                              ) : (
                                <span className="text-xs text-orange-600 mt-1 block">
                                  Normalerweise nicht {course.dayOfWeek}
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
                      
                      {/* Zugewiesene Trainer entfernen */}
                      {(() => {
                        const weeklyTrainerIds = getWeeklyTrainers(course);
                        return weeklyTrainerIds.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2 text-sm sm:text-base">Trainer entfernen:</h4>
                            <div className="flex flex-wrap gap-2">
                              {weeklyTrainerIds.map(trainerId => (
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
                        );
                      })()}
                      
                      {/* Kurs ausfallen lassen / reaktivieren */}
                      <div className="mt-4 pt-4 border-t">
                        <button
                          onClick={() => toggleCourseCancellation(course.id)}
                          className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 touch-manipulation ${
                            isCourseCancel(course.id)
                              ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                          }`}
                        >
                          {isCourseCancel(course.id) ? (
                            <>
                              <span>✓</span>
                              <span>Kurs reaktivieren</span>
                            </>
                          ) : (
                            <>
                              <span>🚫</span>
                              <span>Kurs ausfallen lassen</span>
                            </>
                          )}
                        </button>
                        {isCourseCancel(course.id) && !isHolidayWeek() && (
                          <p className="text-xs text-gray-600 mt-2">
                            Dieser Kurs ist für diese Woche ausgefallen und wird nicht abgerechnet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leere-State */}
      {filteredCourses.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center text-gray-500">
          Keine Kurse für {selectedDay === 'Alle' ? 'diese Auswahl' : selectedDay} vorhanden.
        </div>
      )}

      {/* Legende */}
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




