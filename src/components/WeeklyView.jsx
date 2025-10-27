import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertCircle, UserX, UserCheck, ChevronDown, ChevronRight, MapPin, X, Sparkles } from 'lucide-react';

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

  // v2.3.4: Wochenspezifische Trainer-Zuweisungen (ALLE Änderungen)
  const [weeklyAssignments, setWeeklyAssignments] = useState({});

  // v2.2.0: State für Stundenerfassung
  const [weekStatus, setWeekStatus] = useState({});
  const [finalizingWeek, setFinalizingWeek] = useState(false);

  // v2.4.2: Außerplanmäßige Aktivitäten der Woche
  const [weekActivities, setWeekActivities] = useState([]);

  // v2.4.5: Course Exceptions (Ferien-Override)
  const [courseExceptions, setCourseExceptions] = useState(new Set());

  // KW berechnen
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const weekNumber = getWeekNumber(currentWeek);
  const year = currentWeek.getFullYear();
  const selectedWeek = currentWeek;

  // Wochentage Array
  const daysOfWeek = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  // v2.3.4: Gib die Trainer zurück (geladen oder Defaults)
  const getWeeklyTrainers = (course) => {
    const key = `${course.id}-${weekNumber}-${year}`;
    const weekly = weeklyAssignments[key];

    // Wenn für diese Woche in DB geladen: nimm diese
    if (weekly !== undefined && weekly !== null) {
      return weekly;
    }

    // Sonst: Defaults (first-time Anzeige)
    return course.assignedTrainerIds || [];
  };

  // Sortiere Trainer nach Verfügbarkeit und Nachname
  const getSortedTrainers = (dayOfWeek) => {
    return [...trainers].sort((a, b) => {
      const aAvailable = a.availability?.includes(dayOfWeek) || false;
      const bAvailable = b.availability?.includes(dayOfWeek) || false;

      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;

      const aLastName = (a.lastName || a.last_name || '').toLowerCase();
      const bLastName = (b.lastName || b.last_name || '').toLowerCase();
      return aLastName.localeCompare(bLastName);
    });
  };

  // Prüfe ob es eine Ferienwoche ist
  const isHolidayWeek = () => {
    return holidayWeeks.has(`${weekNumber}-${year}`);
  };

  // Lade Woche-Status beim Mount und bei Wechsel
  useEffect(() => {
    const syncPastDays = async () => {
      try {
        const response = await fetch(`${API_URL}/training-sessions/sync-past-days`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Sync abgeschlossen: ${data.synced} gesynct, ${data.skipped} übersprungen`);
        } else {
          console.error(`❌ Sync fehlgeschlagen: ${response.status}`);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    };

    // Sync beim App-Start - nur 1x!
    syncPastDays();
  }, []); // Leeres dependency array = nur beim Mount!

  useEffect(() => {
    const loadWeekStatus = async () => {
      try {
        const response = await fetch(
          `${API_URL}/training-sessions/week/${weekNumber}/${year}/check`
        );
        if (response.ok) {
          const data = await response.json();
          setWeekStatus(data);
          console.log(`📊 KW ${weekNumber}/${year}: ${data.sessionCount} Stunden erfasst (${data.totalHours}h)`);
        }
      } catch (error) {
        console.error('Fehler beim Laden des Woche-Status:', error);
      }
    };

    loadWeekStatus();
  }, [weekNumber, year]);

  // v2.3.4: Weekly Assignments für ALLE sichtbaren Kurse laden
  useEffect(() => {
    const loadWeeklyAssignments = async () => {
      const weekNum = getWeekNumber(currentWeek);
      const year = currentWeek.getFullYear();

      try {
        const response = await fetch(
          `${API_URL}/weekly-assignments/batch?weekNumber=${weekNum}&year=${year}`
        );

        if (response.ok) {
          const allAssignments = await response.json();

          const formattedAssignments = {};
          Object.entries(allAssignments).forEach(([courseId, trainers]) => {
            formattedAssignments[`${courseId}-${weekNum}-${year}`] =
              trainers.map(t => t.trainerId);
          });

          setWeeklyAssignments(formattedAssignments);
          console.log(`📥 Weekly Assignments geladen für KW ${weekNum}/${year}`);
        }
      } catch (error) {
        console.error('Error loading weekly assignments:', error);
      }
    };

    if (courses.length > 0) {
      loadWeeklyAssignments();
    }
  }, [selectedWeek, courses.length]);

  // v2.3.4: Auto-Save - speichere alle Änderungen sofort
  useEffect(() => {
    const saveWeeklyAssignments = async () => {
      const weekNum = getWeekNumber(currentWeek);
      const year = currentWeek.getFullYear();

      // Sammle nur die Zuweisungen der AKTUELLEN Woche die sich geändert haben
      const currentWeekAssignments = {};
      courses.forEach(course => {
        const key = `${course.id}-${weekNum}-${year}`;
        if (weeklyAssignments[key] !== undefined) {
          currentWeekAssignments[course.id] = weeklyAssignments[key];
        }
      });

      if (Object.keys(currentWeekAssignments).length === 0) return;

      try {
        for (const [courseId, trainerIds] of Object.entries(currentWeekAssignments)) {
          console.log(`📤 Speichere Kurs ${courseId} KW ${weekNum}/${year}: [${trainerIds.join(', ')}]`);

          await fetch(`${API_URL}/weekly-assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              course_id: parseInt(courseId),
              week_number: weekNum,
              year: year,
              trainer_ids: trainerIds
            })
          });
        }

        console.log(`💾 Trainer-Zuweisungen für KW ${weekNum}/${year} gespeichert`);
      } catch (error) {
        console.error('Error saving assignments:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      if (Object.keys(weeklyAssignments).length > 0) {
        saveWeeklyAssignments();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [weeklyAssignments]);

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

  // v2.4.2: Lade Aktivitäten der aktuellen Woche
  useEffect(() => {
    const loadWeekActivities = async () => {
      try {
        const response = await fetch(`${API_URL}/special-activities/week/${weekNumber}/${year}`);
        if (response.ok) {
          const data = await response.json();
          setWeekActivities(data);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Wochen-Aktivitäten:', error);
      }
    };

    loadWeekActivities();
  }, [weekNumber, year]);

  // v2.4.2: Lade Aktivitäten der aktuellen Woche
  useEffect(() => {
    const loadWeekActivities = async () => {
      try {
        const response = await fetch(`${API_URL}/special-activities/week/${weekNumber}/${year}`);
        if (response.ok) {
          const data = await response.json();
          setWeekActivities(data);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Wochen-Aktivitäten:', error);
      }
    };

    loadWeekActivities();
  }, [weekNumber, year]);

  // v2.4.5: Lade Course Exceptions für diese Woche
  useEffect(() => {
    const loadCourseExceptions = async () => {
      try {
        const response = await fetch(`${API_URL}/course-exceptions?weekNumber=${weekNumber}&year=${year}`);
        if (response.ok) {
          const data = await response.json();
          const exceptions = new Set(
            data.map(ex => `${ex.course_id}-${ex.week_number}-${ex.year}`)
          );
          setCourseExceptions(exceptions);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Kurs-Ausnahmen:', error);
      }
    };

    loadCourseExceptions();
  }, [weekNumber, year]);

  // Hilfsfunktionen
  const calculateHours = (start, end) => {
    if (!start || !end) return 1;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return (endH + endM / 60) - (startH + startM / 60);
  };

  // v2.2.0: Finale Erfassung einer Woche mit Differenz-Logik
  const finalizeWeek = async (weekNum, yearNum) => {
    console.log(`📝 Finalisiere KW ${weekNum}/${yearNum}...`);

    try {
      const response = await fetch(`${API_URL}/training-sessions/finalize-week`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekNumber: weekNum,
          year: yearNum
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Änderungen gespeichert: +${result.changes.added} | -${result.changes.deleted}`);
        console.log(`📊 Total: ${result.changes.totalSessions} Sessions (${result.changes.totalHours}h)`);

        if (result.details && result.details.length > 0) {
          console.table(result.details);
        }

        // Update Status nach Speicherung
        setWeekStatus({
          weekSaved: result.changes.totalSessions > 0,
          sessionCount: result.changes.totalSessions,
          totalHours: result.changes.totalHours
        });

        return result.changes;
      } else {
        console.log(`ℹ️ Keine Änderungen für KW ${weekNum}/${yearNum}`);
        return { added: 0, deleted: 0, totalSessions: 0 };
      }
    } catch (error) {
      console.error('Fehler bei Finalisierung:', error);
      alert('Fehler beim Erfassen der Stunden!');
      return { added: 0, deleted: 0, totalSessions: 0 };
    }
  };

  // v2.2.0: Woche wechseln mit Finalisierung
  const changeWeek = async (direction) => {
    // v2.3.5: Schließe alle offenen Kurse BEVOR Woche wechselt
    setExpandedCourses(new Set());

    // Zur neuen Woche wechseln
    // (finalize-week nicht mehr nötig - sync-past-days beim App-Load macht das automatisch)
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
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

  // v2.4.2: Gruppiere Aktivitäten nach Datum und Titel
  const getGroupedActivities = () => {
    const grouped = weekActivities.reduce((acc, activity) => {
      const key = `${activity.date}_${activity.title}`;
      if (!acc[key]) {
        acc[key] = {
          ...activity,
          trainers: []
        };
      }
      acc[key].trainers.push({
        id: activity.trainer_id,
        hours: activity.hours
      });
      return acc;
    }, {});
    return Object.values(grouped);
  };

  // v2.4.2: Hole Aktivitäten für einen bestimmten Wochentag
  const getActivitiesForDay = (dayOfWeek) => {
    const groupedActivities = getGroupedActivities();

    // v2.4.3: Nutze day_of_week direkt aus DB (konsistent mit Kursen)
    return groupedActivities.filter(activity => {
      return (activity.day_of_week || '').toLowerCase() === dayOfWeek.toLowerCase();
    });
  };

  // v2.4.2: Hole Aktivitäts-Typ Label
  const getActivityTypeLabel = (type, customType) => {
    const types = {
      'ferienspass': 'Ferienspaß',
      'vereinsfest': 'Vereinsfest',
      'workshop': 'Workshop',
      'fortbildung': 'Fortbildung',
      'sonstiges': customType || 'Sonstiges'
    };
    return types[type] || type;
  };

  // v2.4.5: Prüfe ob Kurs eine Ausnahme hat (findet trotz Ferien statt)
  const hasCourseException = (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    return courseExceptions.has(key);
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

    // v2.4.5: Wenn Ferienwoche UND Kurs hat Exception → Findet statt!
    if (isHoliday && hasCourseException(courseId)) {
      return false;
    }

    return cancelledCourses.has(key) || isHoliday;
  };

  const toggleCourseCancellation = async (courseId, reason = 'Sonstiges') => {
    const key = `${courseId}-${weekNumber}-${year}`;

    try {
      if (cancelledCourses.has(key)) {
        const response = await fetch(`${API_URL}/cancelled-courses?course_id=${courseId}&week_number=${weekNumber}&year=${year}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const newCancelled = new Set(cancelledCourses);
          newCancelled.delete(key);
          setCancelledCourses(newCancelled);
        }
      } else {
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


  // v2.4.5: Toggle Course Exception (Kurs trotz Ferien)
  const toggleCourseException = async (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    const hasException = courseExceptions.has(key);

    try {
      if (hasException) {
        // Exception entfernen (Kurs fällt wieder aus)
        const response = await fetch(
          `${API_URL}/course-exceptions?course_id=${courseId}&week_number=${weekNumber}&year=${year}`,
          { method: 'DELETE' }
        );

        if (response.ok) {
          const newExceptions = new Set(courseExceptions);
          newExceptions.delete(key);
          setCourseExceptions(newExceptions);
        }
      } else {
        // Exception hinzufügen (Kurs findet trotz Ferien statt)
        const response = await fetch(`${API_URL}/course-exceptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: courseId,
            week_number: weekNumber,
            year: year,
            exception_type: 'active_in_holiday',
            reason: 'Manuell aktiviert trotz Ferien'
          })
        });

        if (response.ok) {
          const newExceptions = new Set(courseExceptions);
          newExceptions.add(key);
          setCourseExceptions(newExceptions);
        }
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Ausnahme:', error);
      alert('Fehler beim Speichern der Änderung');
    }
  };

const toggleHolidayWeek = async () => {
  const key = `${weekNumber}-${year}`;

      try {
        if (holidayWeeks.has(key)) {
          const response = await fetch(`${API_URL}/holiday-weeks?week_number=${weekNumber}&year=${year}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            const newHolidays = new Set(holidayWeeks);
            newHolidays.delete(key);
            setHolidayWeeks(newHolidays);
          }
        } else {
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
        filtered = filtered.filter(c => (c.dayOfWeek || c.day_of_week) === selectedDay);
      }

      const dayOrder = { 'Montag': 1, 'Dienstag': 2, 'Mittwoch': 3, 'Donnerstag': 4, 'Freitag': 5, 'Samstag': 6, 'Sonntag': 7 };
      filtered.sort((a, b) => {
        // FIX: Unterstütze beide Feldnamen
        const aDayOfWeek = a.dayOfWeek || a.day_of_week;
        const bDayOfWeek = b.dayOfWeek || b.day_of_week;
        const dayDiff = dayOrder[aDayOfWeek] - dayOrder[bDayOfWeek];
        if (dayDiff !== 0) return dayDiff;
        // FIX: Unterstütze beide Feldnamen für startTime
        return (a.startTime || a.start_time || '').localeCompare(b.startTime || b.start_time || '');
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
      const firstName = trainer.firstName || trainer.first_name || '';
      const lastName = trainer.lastName || trainer.last_name || '';
      return `${firstName} ${lastName}`;
    };

    // v2.3.4: Trainer hinzufügen
    const addTrainerToCourse = (courseId, trainerId) => {
      if (!trainerId) return;

      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const weekNum = getWeekNumber(selectedWeek);
      const year = selectedWeek.getFullYear();
      const key = `${courseId}-${weekNum}-${year}`;

      setWeeklyAssignments(prev => {
        const currentAssignments = prev[key] || getWeeklyTrainers(course) || [];

        if (currentAssignments.includes(parseInt(trainerId))) {
          return prev;
        }

        console.log(`➕ Trainer ${trainerId} zu Kurs ${courseId} hinzugefügt`);

        return {
          ...prev,
          [key]: [...currentAssignments, parseInt(trainerId)]
        };
      });
    };

    // v2.3.4: Trainer entfernen - ALLE können gelöscht werden
    const removeTrainerFromCourse = (courseId, trainerId) => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const weekNum = getWeekNumber(selectedWeek);
      const year = selectedWeek.getFullYear();
      const key = `${courseId}-${weekNum}-${year}`;

      console.log(`❌ Trainer ${trainerId} aus Kurs ${courseId} entfernt`);

      setWeeklyAssignments(prev => {
        const currentAssignments = prev[key] || getWeeklyTrainers(course) || [];
        const trainerIdInt = parseInt(trainerId);
        const filtered = currentAssignments.filter(id => id !== trainerIdInt);

        return {
          ...prev,
          [key]: filtered
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

    // RENDER
    return (
      <div>
        {/* KW Navigation */}
        <div className="mb-3 flex items-center justify-between bg-white p-3 rounded-lg border">
          <button
            onClick={() => changeWeek(-1)}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
            disabled={finalizingWeek}
          >
            ←
          </button>

          <div className="text-center flex-1">
            <div className="font-bold">KW {weekNumber}/{year}</div>
            {weekStatus.weekSaved && (
              <div className="text-xs text-green-600 mt-1">
                ✅ {weekStatus.sessionCount} Sessions ({weekStatus.totalHours}h)
              </div>
            )}
            <button
              onClick={toggleHolidayWeek}
              className={`mt-1 px-3 py-1 text-sm rounded-full ${isHolidayWeek()
                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {isHolidayWeek() ? '🏖️ Ferien aktiv' : '🏖️ Als Ferien markieren'}
            </button>
          </div>

          <button
            onClick={() => changeWeek(1)}
            disabled={finalizingWeek}
            className={`px-3 py-1 rounded ${finalizingWeek
                ? 'bg-gray-300 cursor-wait'
                : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            {finalizingWeek ? '⏳' : '→'}
          </button>
        </div>

        {/* Filter */}
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

        {/* Kursliste - v2.4.2: Gruppiert nach Tagen */}
        <div className="space-y-6">
          {(() => {
            // Welche Tage sollen angezeigt werden?
            const daysToShow = selectedDay === 'Alle' ? daysOfWeek : [selectedDay];
            console.log('🔍 DEBUG:', {
              daysToShow,
              filteredCoursesTotal: filteredCourses.length,
              firstCourse: filteredCourses[0]
            });

            return daysToShow.map(day => {
              // Kurse für diesen Tag
              const dayCourses = filteredCourses.filter(course =>
                (course.dayOfWeek || course.day_of_week) === day
              );

              // Aktivitäten für diesen Tag
              const dayActivities = getActivitiesForDay(day);
              console.log(`📅 ${day}:`, {
                dayCourses: dayCourses.length,
                dayActivities: dayActivities.length
              });

              // Wenn weder Kurse noch Aktivitäten: Tag überspringen
              if (dayCourses.length === 0 && dayActivities.length === 0) {
                return null;
              }

              return (
                <div key={day} className="space-y-3">
                  {/* Tages-Header */}
                  <div className="border-b-2 border-red-600 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-red-600" />
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl">{day}</h3>
                        <span className="text-gray-500 text-sm">{formatDate(getDateForCourse(day))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Kurse */}
                  {dayCourses.map(course => {
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
                          {isCourseCancel(course.id) && !hasCourseException(course.id) && (
                            <div className="mb-2 px-3 py-2 bg-red-100 border border-red-300 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🚫</span>
                                  <span className="text-sm font-medium text-red-800">
                                    {isHolidayWeek() ? 'AUSGEFALLEN - Ferien' : 'AUSGEFALLEN'}
                                  </span>
                                </div>
                                {isHolidayWeek() && (
                                  <button
                                    onClick={() => toggleCourseException(course.id)}
                                    className="text-xs px-3 py-1 bg-green-100 text-green-800 border border-green-300 rounded hover:bg-green-200 font-medium"
                                  >
                                    ✓ Trotzdem stattfinden lassen
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {isHolidayWeek() && hasCourseException(course.id) && (
                            <div className="mb-2 px-3 py-2 bg-green-100 border border-green-300 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">✅</span>
                                  <span className="text-sm font-medium text-green-800">
                                    FINDET STATT - Trotz Ferien
                                  </span>
                                </div>
                                <button
                                  onClick={() => toggleCourseException(course.id)}
                                  className="text-xs px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded hover:bg-red-200 font-medium"
                                >
                                  ✗ Doch ausfallen lassen
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <button
                                  onClick={() => toggleCourseExpansion(course.id)}
                                  className="mt-1 p-1 hover:bg-white hover:bg-opacity-50 rounded-full"
                                >
                                  {isExpanded ?
                                    <ChevronDown className="w-5 h-5" /> :
                                    <ChevronRight className="w-5 h-5" />
                                  }
                                </button>
                                <div className="flex-1">
                                  <div className="font-bold text-gray-900 text-sm sm:text-base">
                                    {course.startTime || course.start_time || '?'}
                                  </div>
                                  <div className="font-medium text-gray-800 text-base sm:text-lg mt-1">
                                    {course.name}
                                  </div>
                                  {course.location && (
                                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                      {course.location}
                                    </div>
                                  )}
                                  {course.category && (
                                    <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {course.category}
                                    </span>
                                  )}
                                </div>
                              </div>

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

                              <div className="mt-3 ml-8">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${status.color === 'green' ? 'bg-green-100 text-green-800' :
                                    status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                      status.color === 'red' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                  }`}>
                                  {status.message}
                                </span>
                              </div>

                              {(() => {
                                const weeklyTrainerIds = getWeeklyTrainers(course);
                                return weeklyTrainerIds.length > 0 && (
                                  <div className="mt-3 ml-8">
                                    <div className="flex flex-wrap gap-1 sm:gap-2">
                                      {weeklyTrainerIds.map(trainerId => (
                                        <span key={trainerId} className="inline-flex items-center px-2 py-1 bg-white rounded text-xs sm:text-sm border border-gray-200">
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

                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="sm:ml-9">
                                <h4 className="font-medium mb-3 text-sm sm:text-base">Trainer verwalten:</h4>

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

                                    if (isAssigned) return null;

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
                                  ✓ = Verfügbar am {course.dayOfWeek || course.day_of_week}
                                </p>

                                <div className="mt-4 pt-4 border-t">
                                  <button
                                    onClick={() => toggleCourseCancellation(course.id)}
                                    className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${isCourseCancel(course.id)
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
                                      Dieser Kurs ist für diese Woche ausgefallen.
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

                  {/* Aktivitäten für diesen Tag */}
                  {dayActivities.map((activity, actIdx) => {
                    const activityTypeLabel = getActivityTypeLabel(activity.activity_type, activity.custom_type);
                    const trainerCount = activity.trainers.length;
                    const trainerNames = activity.trainers
                      .map(t => getTrainerName(t.id))
                      .filter(name => name !== 'Unbekannter Trainer')
                      .join(', ');

                    return (
                      <div
                        key={`activity-${activity.id}-${actIdx}`}
                        className="border-2 border-green-400 rounded-lg bg-green-50"
                      >
                        <div className="p-3 sm:p-4">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="mt-1 p-1 bg-green-200 rounded-full">
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded">
                                  {activityTypeLabel}
                                </span>
                              </div>
                              <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                                {activity.hours}h · {activity.title}
                              </div>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="font-medium">{trainerCount} Trainer:</span>
                                <span className="text-gray-600">{trainerNames}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            });
          })()}
        </div>

        {filteredCourses.length === 0 && weekActivities.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center text-gray-500">
            Keine Kurse oder Aktivitäten für {selectedDay === 'Alle' ? 'diese Woche' : selectedDay} vorhanden.
          </div>
        )}

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
    </div>
  );
};

export default WeeklyView;