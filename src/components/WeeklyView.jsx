import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertCircle, UserX, UserCheck, ChevronDown, ChevronRight, MapPin, X, Sparkles, MessageSquare, Edit3 } from 'lucide-react';

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

  // ✅ NEU v2.5.0: Kurs-Notizen
  const [courseNotes, setCourseNotes] = useState({});
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

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

  // ✅ NEU v2.5.0: Notiz für einen Kurs holen
  const getCourseNote = (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    return courseNotes[key] || '';
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
          const formattedNotes = {};
          const coursesWithoutAssignments = [];

          // Formatiere existierende Assignments UND Notizen
          Object.entries(allAssignments).forEach(([courseId, data]) => {
            // data kann entweder Array (alte Struktur) oder Object mit trainers und note sein
            if (Array.isArray(data)) {
              formattedAssignments[`${courseId}-${weekNum}-${year}`] = data.map(t => t.trainerId);
            } else {
              formattedAssignments[`${courseId}-${weekNum}-${year}`] = 
                (data.trainers || []).map(t => t.trainerId);
              // ✅ NEU: Notiz extrahieren
              if (data.note) {
                formattedNotes[`${courseId}-${weekNum}-${year}`] = data.note;
              }
            }
          });

          // ✅ NEU: Finde Kurse OHNE Assignments (neue Woche!)
          courses.forEach(course => {
            const key = `${course.id}-${weekNum}-${year}`;
            if (!formattedAssignments[key] && course.assignedTrainerIds?.length > 0) {
              // Dieser Kurs hat Defaults, aber keine Weekly Assignments
              formattedAssignments[key] = course.assignedTrainerIds;
              coursesWithoutAssignments.push(course.id);
            }
          });

          setWeeklyAssignments(formattedAssignments);
          setCourseNotes(formattedNotes);
          console.log(`📥 Weekly Assignments geladen für KW ${weekNum}/${year}`);

          // ✅ NEU: Wenn Kurse ohne Assignments gefunden wurden, speichere Defaults
          if (coursesWithoutAssignments.length > 0) {
            console.log(`💡 ${coursesWithoutAssignments.length} Kurse ohne Assignments gefunden - speichere Defaults...`);
            
            // Speichere die Defaults sofort
            for (const courseId of coursesWithoutAssignments) {
              const course = courses.find(c => c.id === courseId);
              if (course && course.assignedTrainerIds?.length > 0) {
                try {
                  await fetch(`${API_URL}/weekly-assignments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      course_id: courseId,
                      week_number: weekNum,
                      year: year,
                      trainer_ids: course.assignedTrainerIds
                    })
                  });
                  console.log(`✅ Defaults gespeichert für Kurs ${courseId} KW ${weekNum}/${year}`);
                } catch (error) {
                  console.error(`❌ Fehler beim Speichern der Defaults für Kurs ${courseId}:`, error);
                }
              }
            }
          }
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
          const key = `${courseId}-${weekNum}-${year}`;
          const note = courseNotes[key] || null;
          
          console.log(`📤 Speichere Kurs ${courseId} KW ${weekNum}/${year}: [${trainerIds.join(', ')}]`);

          await fetch(`${API_URL}/weekly-assignments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              course_id: parseInt(courseId),
              week_number: weekNum,
              year: year,
              trainer_ids: trainerIds,
              note: note  // ✅ NEU: Notiz mitsenden
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

  // ✅ NEU v2.5.0: Notiz speichern
  const saveNote = async (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    const trimmedNote = noteText.trim();
    
    try {
      await fetch(`${API_URL}/weekly-assignments/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: courseId,
          week_number: weekNumber,
          year: year,
          note: trimmedNote || null
        })
      });

      // State aktualisieren
      setCourseNotes(prev => {
        const newNotes = { ...prev };
        if (trimmedNote) {
          newNotes[key] = trimmedNote;
        } else {
          delete newNotes[key];
        }
        return newNotes;
      });

      console.log(`📝 Notiz gespeichert für Kurs ${courseId}: "${trimmedNote}"`);
    } catch (error) {
      console.error('Fehler beim Speichern der Notiz:', error);
    }

    setEditingNoteId(null);
    setNoteText('');
  };

  // ✅ NEU v2.5.0: Notiz-Bearbeitung starten
  const startEditNote = (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    setEditingNoteId(courseId);
    setNoteText(courseNotes[key] || '');
  };

  // ✅ NEU v2.5.0: Notiz-Bearbeitung abbrechen
  const cancelEditNote = () => {
    setEditingNoteId(null);
    setNoteText('');
  };

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
    // ✅ NEU: Notiz-Editor schließen beim Wochenwechsel
    setEditingNoteId(null);
    setNoteText('');

    // Zur neuen Woche wechseln
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
      console.error('Fehler beim Umschalten des Ausfalls:', error);
    }
  };

  // v2.4.5: Course Exception Toggle (Kurs findet trotz Ferien statt)
  const toggleCourseException = async (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;

    try {
      if (courseExceptions.has(key)) {
        // Ausnahme entfernen
        await fetch(`${API_URL}/course-exceptions/${courseId}/${weekNumber}/${year}`, {
          method: 'DELETE'
        });

        const newExceptions = new Set(courseExceptions);
        newExceptions.delete(key);
        setCourseExceptions(newExceptions);
        console.log(`🗑️ Kurs-Ausnahme entfernt: ${courseId}`);
      } else {
        // Ausnahme hinzufügen
        await fetch(`${API_URL}/course-exceptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: courseId,
            week_number: weekNumber,
            year: year
          })
        });

        const newExceptions = new Set(courseExceptions);
        newExceptions.add(key);
        setCourseExceptions(newExceptions);
        console.log(`✅ Kurs-Ausnahme hinzugefügt: ${courseId}`);
      }
    } catch (error) {
      console.error('Fehler beim Umschalten der Kurs-Ausnahme:', error);
    }
  };

  // Ferienwoche Toggle
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
            year: year,
            name: `Ferien KW ${weekNumber}`
          })
        });

        if (response.ok) {
          const newHolidays = new Set(holidayWeeks);
          newHolidays.add(key);
          setHolidayWeeks(newHolidays);
        }
      }
    } catch (error) {
      console.error('Fehler beim Umschalten der Ferienwoche:', error);
    }
  };

  // Trainer-Funktionen
  const addTrainerToCourse = (courseId, trainerId) => {
    if (!trainerId) return;

    const key = `${courseId}-${weekNumber}-${year}`;
    const currentTrainers = weeklyAssignments[key] ||
      courses.find(c => c.id === courseId)?.assignedTrainerIds || [];

    if (!currentTrainers.includes(parseInt(trainerId))) {
      setWeeklyAssignments(prev => ({
        ...prev,
        [key]: [...currentTrainers, parseInt(trainerId)]
      }));
    }
  };

  const removeTrainerFromCourse = (courseId, trainerId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    const currentTrainers = weeklyAssignments[key] ||
      courses.find(c => c.id === courseId)?.assignedTrainerIds || [];

    setWeeklyAssignments(prev => ({
      ...prev,
      [key]: currentTrainers.filter(id => id !== parseInt(trainerId))
    }));
  };

  // Kurs-Erweiterung Toggle
  const toggleCourseExpansion = (courseId) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  // Trainer-Name holen
  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId);
    if (!trainer) return 'Unbekannter Trainer';

    const firstName = trainer.firstName || trainer.first_name || '';
    const lastName = trainer.lastName || trainer.last_name || '';
    return `${firstName} ${lastName}`.trim();
  };

  // Besetzungs-Status berechnen
  const getStaffingStatus = (course) => {
    const assigned = getWeeklyTrainers(course).length;
    const required = course.requiredTrainers || course.required_trainers || 2;

    if (assigned === 0) return { color: 'red', message: 'Nicht besetzt' };
    if (assigned < required) return { color: 'yellow', message: `${assigned}/${required} Trainer` };
    if (assigned === required) return { color: 'green', message: 'Optimal besetzt' };
    return { color: 'blue', message: `Überbesetzt (${assigned}/${required})` };
  };

  // Kurse filtern
  const filteredCourses = courses.filter(course => {
    if (selectedDay === 'Alle') return true;
    return (course.dayOfWeek || course.day_of_week) === selectedDay;
  });

  // Monats-Header generieren
  const getWeekDateRange = () => {
    const date = new Date(currentWeek);
    const currentDay = date.getDay() || 7;
    const monday = new Date(date);
    monday.setDate(date.getDate() - currentDay + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return `${formatDate(monday)} - ${formatDate(sunday)}`;
  };

  return (
    <div className="space-y-4">
      {/* Header mit KW-Navigation */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeWeek(-1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              title="Vorherige Woche"
            >
              ◀
            </button>

            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                KW {weekNumber} / {year}
              </div>
              <div className="text-sm text-gray-500">
                {getWeekDateRange()}
              </div>
            </div>

            <button
              onClick={() => changeWeek(1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              title="Nächste Woche"
            >
              ▶
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Heute
            </button>

            <button
              onClick={toggleHolidayWeek}
              className={`px-3 py-1 text-sm rounded ${isHolidayWeek()
                  ? 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {isHolidayWeek() ? '🏖️ Ferien aktiv' : '🏖️ Als Ferien markieren'}
            </button>
          </div>
        </div>

        {/* Ferien-Banner */}
        {isHolidayWeek() && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏖️</span>
              <div>
                <span className="font-semibold text-yellow-800">Ferienwoche</span>
                <span className="text-yellow-700 text-sm ml-2">
                  Alle Kurse fallen aus (außer markierte Ausnahmen)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Status-Info */}
        {weekStatus.sessionCount > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm text-green-800">
                {weekStatus.sessionCount} Einheiten erfasst ({weekStatus.totalHours}h)
              </span>
            </div>
          </div>
        )}
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

      {/* Kursliste - Gruppiert nach Tagen */}
      <div className="space-y-6">
        {(() => {
          const daysToShow = selectedDay === 'Alle' ? daysOfWeek : [selectedDay];

          return daysToShow.map(day => {
            const dayCourses = filteredCourses.filter(course =>
              (course.dayOfWeek || course.day_of_week) === day
            );

            const dayActivities = getActivitiesForDay(day);

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
                  const courseNote = getCourseNote(course.id);
                  const bgColor = isCourseCancel(course.id)
                    ? 'bg-gray-100 border-gray-400 opacity-60'
                    : status.color === 'red' ? 'bg-red-50 border-red-300' :
                      status.color === 'yellow' ? 'bg-yellow-50 border-yellow-300' :
                        status.color === 'green' ? 'bg-green-50 border-green-300' :
                          'bg-blue-50 border-blue-300';

                  return (
                    <div key={course.id} className={`border-2 rounded-lg ${bgColor}`}>
                      <div className="p-3 sm:p-4">
                        {/* Ausgefallen-Banner */}
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

                        {/* Findet trotz Ferien statt Banner */}
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

                        {/* Kurs-Header */}
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

                            {/* Trainer-Badges */}
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

                        {/* ✅ NEU: NOTIZ-ANZEIGE (immer sichtbar wenn vorhanden) */}
                        {courseNote && editingNoteId !== course.id && (
                          <div
                            className="mt-3 ml-8 p-2 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
                            onClick={() => startEditNote(course.id)}
                          >
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-amber-800 flex-1">{courseNote}</p>
                              <Edit3 className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            </div>
                          </div>
                        )}

                        {/* ✅ NEU: NOTIZ-EDITOR (wenn Bearbeitung aktiv) */}
                        {editingNoteId === course.id && (
                          <div className="mt-3 ml-8 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-medium text-amber-800">Notiz bearbeiten</span>
                            </div>
                            <textarea
                              className="w-full p-2 border border-amber-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                              rows="2"
                              placeholder="z.B. Neue TN: Lisa M. (4 Jahre), Max S. (5 Jahre)"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={cancelEditNote}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                              >
                                Abbrechen
                              </button>
                              <button
                                onClick={() => saveNote(course.id)}
                                className="px-3 py-1 text-sm bg-amber-500 text-white rounded hover:bg-amber-600"
                              >
                                Speichern
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Aufgeklappter Bereich */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="sm:ml-9">
                              <h4 className="font-medium mb-3 text-sm sm:text-base">Trainer verwalten:</h4>

                              {/* Zugewiesene Trainer */}
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

                              {/* Trainer hinzufügen Dropdown */}
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

                              {/* ✅ NEU: Notiz hinzufügen Button (wenn keine Notiz vorhanden) */}
                              {!courseNote && editingNoteId !== course.id && (
                                <button
                                  onClick={() => startEditNote(course.id)}
                                  className="mt-3 w-full py-2 px-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Notiz hinzufügen (z.B. neue Teilnehmer)</span>
                                </button>
                              )}

                              {/* Kurs ausfallen lassen */}
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