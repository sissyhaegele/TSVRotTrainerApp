import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertCircle, UserX, UserCheck, ChevronDown, ChevronRight, MapPin, X } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8181/api'
  : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api';

const WeeklyView = ({ courses, trainers, setCourses }) => {
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [selectedDay, setSelectedDay] = useState('Alle');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // State für Ausfälle und Ferien
  const [cancelledCourses, setCancelledCourses] = useState(new Set());
  
  const [holidayWeeks, setHolidayWeeks] = useState(new Set());
  
// Wochenspezifische Trainer-Zuweisungen
  const [weeklyAssignments, setWeeklyAssignments] = useState({});

  // KW berechnen - ZUERST definieren
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  const weekNumber = getWeekNumber(currentWeek);
  const year = currentWeek.getFullYear();

  // selectedWeek ist dasselbe wie currentWeek
  const selectedWeek = currentWeek;

  // Wochentage Array
  const daysOfWeek = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

// Funktion um Trainer für eine bestimmte Woche zu bekommen
const getWeeklyTrainers = (course) => {
  const key = `${course.id}-${weekNumber}-${year}`;
  const weekly = weeklyAssignments[key];
  
  // ✅ FIX: Wenn keine wöchentlichen Zuweisungen existieren, verwende Standardtrainer
  if (weekly === undefined || weekly === null) {
    // Fallback zu Standardtrainern aus course.assignedTrainerIds
    return course.assignedTrainerIds || [];
  }
  
  return weekly;
};

  // ✅ NEU: Sortiere Trainer nach Verfügbarkeit und Nachname
  const getSortedTrainers = (dayOfWeek) => {
    return [...trainers].sort((a, b) => {
      const aAvailable = a.availability?.includes(dayOfWeek) || false;
      const bAvailable = b.availability?.includes(dayOfWeek) || false;
      
      // 1. Verfügbare Trainer zuerst
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;
      
      // 2. Alphabetisch nach Nachname
      const aLastName = (a.lastName || a.last_name || '').toLowerCase();
      const bLastName = (b.lastName || b.last_name || '').toLowerCase();
      return aLastName.localeCompare(bLastName);
    });
  };

  // Funktion um zu prüfen ob es eine Ferienwoche ist
  const isHolidayWeek = () => {
    return holidayWeeks.has(`${weekNumber}-${year}`);
  };

 // Weekly Assignments vom Server laden - OPTIMIERT mit Batch-Loading
useEffect(() => {
  const loadWeeklyAssignments = async () => {
      const weekNum = getWeekNumber(currentWeek);
      const year = currentWeek.getFullYear();
    
    try {
      // Ein Request für alle Assignments der Woche
      const response = await fetch(
        `${API_URL}/weekly-assignments/batch?weekNumber=${weekNum}&year=${year}`
      );
      
      if (response.ok) {
        const allAssignments = await response.json();
        
        // Konvertiere zu dem erwarteten Format
        const formattedAssignments = {};
        Object.entries(allAssignments).forEach(([courseId, trainers]) => {
          formattedAssignments[`${courseId}-${weekNum}-${year}`] = 
            trainers.map(t => t.trainerId);
        });
        
        setWeeklyAssignments(formattedAssignments);
      }
    } catch (error) {
      console.error('Error loading weekly assignments:', error);
    }
  };
  
  if (courses.length > 0) {
    loadWeeklyAssignments();
  }
}, [selectedWeek, courses.length]); // Dependencies korrigiert

// Auto-Save für Weekly Assignments bei Änderungen
useEffect(() => {
  const saveAllWeeklyAssignments = async () => {
    const weekNum = getWeekNumber(currentWeek);
    const year = currentWeek.getFullYear();
    
    // Sammle alle Änderungen für diese Woche
    const updates = {};
    courses.forEach(course => {
      const key = `${course.id}-${weekNum}-${year}`;
      // ✅ FIX: Speichere auch leere Arrays (wenn alle Trainer entfernt wurden)
      if (weeklyAssignments[key] !== undefined) {
        updates[course.id] = weeklyAssignments[key];
      }
    });
    
    // Nur speichern wenn es Updates gibt
    if (Object.keys(updates).length === 0) return;
    
    try {
      const response = await fetch(`${API_URL}/weekly-assignments/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, weekNumber: weekNum, year })
      });
      
      if (response.ok) {
        console.log('Batch save successful');
      }
    } catch (error) {
      console.error('Error saving batch assignments:', error);
    }
  };
  
  // Debounced Auto-Save - wartet 2 Sekunden nach der letzten Änderung
  const timeoutId = setTimeout(() => {
    if (Object.keys(weeklyAssignments).length > 0) {
      saveAllWeeklyAssignments();
    }
  }, 2000);
  
  return () => clearTimeout(timeoutId);
}, [weeklyAssignments, courses, selectedWeek]);

// Cancelled Courses vom Server laden
useEffect(() => {
  const loadCancelledCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/cancelled-courses`);
      if (response.ok) {
        const data = await response.json();
        const cancelled = new Set(data.map(item => 
          `${item.course_id}-${item.week_number}-${item.year}`
        ));
        setCancelledCourses(cancelled);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Ausfälle:', error);
    }
  };
  
  loadCancelledCourses();
}, [currentWeek]);

  // Holiday Weeks vom Server laden
useEffect(() => {
  const loadHolidayWeeks = async () => {
    try {
      const response = await fetch(`${API_URL}/holiday-weeks`);
      if (response.ok) {
        const data = await response.json();
        const holidays = new Set(data.map(item => 
          `${item.week_number}-${item.year}`
        ));
        setHolidayWeeks(holidays);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Ferienwochen:', error);
    }
  };
  
  loadHolidayWeeks();
}, [weekNumber, year]);

  // Hilfsfunktionen
  const calculateHours = (start, end) => {
    if (!start || !end) return 1;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH + endM/60) - (startH + startM/60);
  };

  // Wochenspezifische Keys und Getter/Setter
  const getWeeklyKey = (courseId) => {
    return `${courseId}-${weekNumber}-${year}`;
  };

  const setWeeklyTrainers = async (courseId, trainerIds) => {
  const key = getWeeklyKey(courseId);
  
  try {
    // An Server senden
    const response = await fetch(`${API_URL}/weekly-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: courseId,
        week_number: weekNumber,
        year: year,
        trainer_ids: trainerIds
      })
    });
    
    if (response.ok) {
      // Lokal aktualisieren
      setWeeklyAssignments(prev => ({
        ...prev,
        [key]: trainerIds
      }));
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Zuweisung:', error);
    alert('Fehler beim Speichern der Trainer-Zuweisung');
  }
};

  // Stunden speichern
  const saveWeekHours = async () => {
  courses.forEach(course => {
    if (isCourseCancel(course.id)) {
      return;
    }
    
    const weeklyTrainerIds = getWeeklyTrainers(course);
    if (weeklyTrainerIds.length > 0) {
      const hours = calculateHours(course.startTime, course.endTime);
      
      weeklyTrainerIds.forEach(async trainerId => {
        await fetch(`${API_URL}/training-sessions`, {   // OHNE /api davor!
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

  // Woche wechseln
  const changeWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
    
    // Stunden speichern beim Wechsel
    saveWeekHours();
  };

  // Datum-Funktionen
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
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Ausfall-Funktionen
  const isCourseCancel = (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    const isHoliday = holidayWeeks.has(`${weekNumber}-${year}`);
    return cancelledCourses.has(key) || isHoliday;
  };

  const toggleCourseCancellation = async (courseId, reason = 'Sonstiges') => {
    const key = `${courseId}-${weekNumber}-${year}`;
    
    try {
      if (cancelledCourses.has(key)) {
        // Kurs reaktivieren - DELETE Request
        const response = await fetch(`${API_URL}/cancelled-courses?course_id=${courseId}&week_number=${weekNumber}&year=${year}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const newCancelled = new Set(cancelledCourses);
          newCancelled.delete(key);
          setCancelledCourses(newCancelled);
        }
      } else {
        // Kurs ausfallen lassen - POST Request  
        const response = await fetch(`${API_URL}/cancelled-courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: courseId,
            week_number: weekNumber,
            year: year,
            reason: reason
          })
        });
        
        if (response.ok) {
          const newCancelled = new Set(cancelledCourses);
          newCancelled.add(key);
          setCancelledCourses(newCancelled);
        }
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Änderung');
    }
  };

  const toggleHolidayWeek = async () => {
  const key = `${weekNumber}-${year}`;
    console.log('Toggle Holiday Week:', key, 'Has:', holidayWeeks.has(key));
  
  try {
    if (holidayWeeks.has(key)) {
      // Ferienwoche entfernen - DELETE Request
      const response = await fetch(`${API_URL}/holiday-weeks?week_number=${weekNumber}&year=${year}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const newHolidays = new Set(holidayWeeks);
        newHolidays.delete(key);
        setHolidayWeeks(newHolidays);
      }
    } else {
      // Ferienwoche hinzufügen - POST Request
      const response = await fetch(`${API_URL}/holiday-weeks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week_number: weekNumber,
          year: year
        })
      });
      
      if (response.ok) {
        const newHolidays = new Set(holidayWeeks);
        newHolidays.add(key);
        setHolidayWeeks(newHolidays);
      }
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Ferienwoche:', error);
    alert('Fehler beim Speichern der Ferienwoche');
  }
};

  // Filter und Sortierung
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

  // UI-Funktionen
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
  if (!trainer) return 'Unbekannter Trainer';
  // Handle beide Varianten
  const firstName = trainer.firstName || trainer.first_name || '';
  const lastName = trainer.lastName || trainer.last_name || '';
  return `${firstName} ${lastName}`;
};

  // ✅ NEU: Dropdown-basierte Trainer-Zuweisung
  const addTrainerToCourse = (courseId, trainerId) => {
    if (!trainerId) return;
    
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    const weekNum = getWeekNumber(selectedWeek);
    const year = selectedWeek.getFullYear();
    const key = `${courseId}-${weekNum}-${year}`;
    
    setWeeklyAssignments(prev => {
      const currentAssignments = prev[key] || [];
      
      // Prüfe ob bereits zugewiesen
      if (currentAssignments.includes(parseInt(trainerId))) {
        return prev;
      }
      
      return {
        ...prev,
        [key]: [...currentAssignments, parseInt(trainerId)]
      };
    });
  };

  // ✅ Trainer entfernen
  const removeTrainerFromCourse = (courseId, trainerId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    const weekNum = getWeekNumber(selectedWeek);
    const year = selectedWeek.getFullYear();
    const key = `${courseId}-${weekNum}-${year}`;
    
    setWeeklyAssignments(prev => {
      const currentAssignments = prev[key] || [];
      return {
        ...prev,
        [key]: currentAssignments.filter(id => id !== trainerId)
      };
    });
  };

  const getStaffingStatus = (course) => {
    const weeklyTrainerIds = getWeeklyTrainers(course);
    const assigned = weeklyTrainerIds.length;
    const required = course.requiredTrainers || course.required_trainers || 2;
    
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
            {isHolidayWeek() ? '🏖️ Ferien aktiv' : '🏖️ Als Ferien markieren'}
          </button>
        </div>
        
        <button 
          onClick={() => changeWeek(1)} 
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          →
        </button>
      </div>
      
      {/* Filter ohne "Wochenplan" Überschrift */}
      <div className="mb-4 flex justify-end">
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
                          {course.dayOfWeek || course.day_of_week}, {formatDate(getDateForCourse(course.dayOfWeek || course.day_of_week))} · {course.startTime || course.start_time || '?'}
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
                        {course.endTime || course.end_time ? `bis ${course.endTime || course.end_time}` : '60 Min'}
                      </span>
                      <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        {getWeeklyTrainers(course).length}/{course.requiredTrainers || course.required_trainers || 2}
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

                {/* Expanded Section - ✅ NEU mit Dropdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="sm:ml-9">
                      <h4 className="font-medium mb-3 text-sm sm:text-base">Trainer zuweisen:</h4>
                      
                      {/* Zugewiesene Trainer anzeigen */}
                      {(() => {
                        const weeklyTrainerIds = getWeeklyTrainers(course);
                        const courseDayOfWeek = course.dayOfWeek || course.day_of_week;
                        
                        return weeklyTrainerIds.length > 0 && (
                          <div className="mb-3 space-y-1">
                            {weeklyTrainerIds.map(trainerId => {
                              const trainer = trainers.find(t => t.id === trainerId);
                              if (!trainer) return null;
                              
                              const isAvailable = trainer.availability?.includes(courseDayOfWeek);
                              
                              return (
                                <div key={trainerId} className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-sm">{getTrainerName(trainerId)}</span>
                                    {isAvailable && (
                                      <span className="text-xs text-green-600">✓ Verfügbar</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeTrainerFromCourse(course.id, trainerId)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Entfernen"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                      
                      {/* Dropdown zum Hinzufügen */}
                      <select
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                        value=""
                        onChange={(e) => addTrainerToCourse(course.id, e.target.value)}
                      >
                        <option value="">Trainer hinzufügen...</option>
                        {getSortedTrainers(course.dayOfWeek || course.day_of_week).map(trainer => {
                          const weeklyTrainerIds = getWeeklyTrainers(course);
                          const isAssigned = weeklyTrainerIds.includes(trainer.id);
                          const isAvailable = trainer.availability?.includes(course.dayOfWeek || course.day_of_week);
                          
                          if (isAssigned) return null; // Bereits zugewiesene Trainer ausblenden
                          
                          const firstName = trainer.firstName || trainer.first_name || '';
                          const lastName = trainer.lastName || trainer.last_name || '';
                          
                          return (
                            <option key={trainer.id} value={trainer.id}>
                              {firstName} {lastName} {isAvailable ? '✓' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        ✓ = Verfügbar am {course.dayOfWeek || course.day_of_week} · Sortiert nach Verfügbarkeit
                      </p>
                      
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
                              <span>✔</span>
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
