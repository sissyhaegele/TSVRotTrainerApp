import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertCircle, UserX, UserCheck, ChevronDown, ChevronRight, MapPin, X, Sparkles, MessageSquare, Edit3 } from 'lucide-react';
import NoteModal from './NoteModal';
import NotesBadges from './NotesBadges';
import NotesList from './NotesList';

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

  // =====================================================
  // ✅ NEU v2.8.0: Mehrfache Notizen (intern/extern)
  // =====================================================
  const [courseNotes, setCourseNotes] = useState({}); // { courseId: [note, note, ...] }
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteModalCourse, setNoteModalCourse] = useState(null);
  const [noteModalNote, setNoteModalNote] = useState(null); // null = neu, object = bearbeiten

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

  // =====================================================
  // ✅ NEU v2.8.0: Notizen für einen Kurs holen (Array!)
  // =====================================================
  const getCourseNotes = (courseId) => {
    return courseNotes[courseId] || [];
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
          const formattedNotes = {};  // v2.8.0: Notizen extrahieren
          const coursesWithoutAssignments = [];

          // Formatiere existierende Assignments UND Notizen
          Object.entries(allAssignments).forEach(([courseId, data]) => {
            if (Array.isArray(data)) {
              formattedAssignments[`${courseId}-${weekNum}-${year}`] = data.map(t => t.trainerId);
            } else {
              formattedAssignments[`${courseId}-${weekNum}-${year}`] = 
                (data.trainers || []).map(t => t.trainerId);
              
              // v2.8.0: Notizen aus dem Backend-Response extrahieren
              if (data.notes && data.notes.length > 0) {
                formattedNotes[courseId] = data.notes;
              }
            }
          });

          // Finde Kurse OHNE Assignments (neue Woche!)
          courses.forEach(course => {
            const key = `${course.id}-${weekNum}-${year}`;
            if (!formattedAssignments[key] && course.assignedTrainerIds?.length > 0) {
              formattedAssignments[key] = course.assignedTrainerIds;
              coursesWithoutAssignments.push(course.id);
            }
          });

          setWeeklyAssignments(formattedAssignments);
          
          // v2.8.0: Notizen setzen wenn vorhanden
          if (Object.keys(formattedNotes).length > 0) {
            setCourseNotes(formattedNotes);
            console.log(`📝 Notizen aus Batch geladen:`, Object.keys(formattedNotes).length, 'Kurse');
          }
          
          console.log(`📥 Weekly Assignments geladen für KW ${weekNum}/${year}`);

          // Wenn Kurse ohne Assignments gefunden wurden, speichere Defaults
          if (coursesWithoutAssignments.length > 0) {
            console.log(`💡 ${coursesWithoutAssignments.length} Kurse ohne Assignments gefunden - speichere Defaults...`);
            
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

  // =====================================================
  // ✅ NEU v2.8.0: Notizen werden jetzt mit weekly-assignments geladen!
  // Das Backend liefert sie im batch-Endpoint mit.
  // Separater Load nur als Fallback.
  // =====================================================
  useEffect(() => {
    const loadWeekNotes = async () => {
      // Nur laden wenn courseNotes leer ist (Fallback)
      if (Object.keys(courseNotes).length > 0) return;
      
      try {
        const response = await fetch(
          `${API_URL}/notes/week?week=${weekNumber}&year=${year}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setCourseNotes(data.grouped || {});
          console.log(`📝 Notizen geladen für KW ${weekNumber}/${year}:`, Object.keys(data.grouped || {}).length, 'Kurse mit Notizen');
        }
      } catch (error) {
        console.error('Fehler beim Laden der Notizen:', error);
      }
    };

    loadWeekNotes();
  }, [weekNumber, year]);

  // =====================================================
  // ✅ NEU v2.8.0: Notiz-Modal öffnen (neu/bearbeiten)
  // =====================================================
  const openNoteModal = (course, note = null) => {
    setNoteModalCourse(course);
    setNoteModalNote(note);
    setNoteModalOpen(true);
  };

  const closeNoteModal = () => {
    setNoteModalOpen(false);
    setNoteModalCourse(null);
    setNoteModalNote(null);
  };

  // =====================================================
  // ✅ NEU v2.8.0: Notiz speichern (neu oder update)
  // =====================================================
  const handleSaveNote = async (noteData) => {
    if (!noteModalCourse) return;

    const courseId = noteModalCourse.id;
    const isEditing = noteData.id != null;

    try {
      let response;
      
      if (isEditing) {
        // Update bestehende Notiz
        response = await fetch(`${API_URL}/notes/${noteData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            note_type: noteData.note_type,
            note: noteData.note
          })
        });
      } else {
        // Neue Notiz erstellen
        response = await fetch(`${API_URL}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: courseId,
            week: weekNumber,
            year: year,
            note_type: noteData.note_type,
            note: noteData.note
          })
        });
      }

      if (response.ok) {
        const savedNote = await response.json();
        
        // State aktualisieren
        setCourseNotes(prev => {
          const currentNotes = [...(prev[courseId] || [])];
          
          if (isEditing) {
            // Ersetze die bearbeitete Notiz
            const index = currentNotes.findIndex(n => n.id === noteData.id);
            if (index !== -1) {
              currentNotes[index] = savedNote;
            }
          } else {
            // Füge neue Notiz hinzu
            currentNotes.push(savedNote);
          }
          
          return {
            ...prev,
            [courseId]: currentNotes
          };
        });

        console.log(`📝 Notiz ${isEditing ? 'aktualisiert' : 'erstellt'}: ${savedNote.id}`);
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Notiz:', error);
    }

    closeNoteModal();
  };

  // =====================================================
  // ✅ NEU v2.8.0: Notiz löschen
  // =====================================================
  const handleDeleteNote = async (noteId) => {
    if (!noteModalCourse) return;

    const courseId = noteModalCourse.id;

    try {
      const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // State aktualisieren
        setCourseNotes(prev => {
          const currentNotes = (prev[courseId] || []).filter(n => n.id !== noteId);
          
          return {
            ...prev,
            [courseId]: currentNotes
          };
        });

        console.log(`🗑️ Notiz gelöscht: ${noteId}`);
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Notiz:', error);
    }

    closeNoteModal();
  };

  // Direkt löschen ohne Modal (aus der Liste)
  const handleDeleteNoteDirectly = async (courseId, noteId) => {
    try {
      const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCourseNotes(prev => {
          const currentNotes = (prev[courseId] || []).filter(n => n.id !== noteId);
          return {
            ...prev,
            [courseId]: currentNotes
          };
        });
        console.log(`🗑️ Notiz gelöscht: ${noteId}`);
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Notiz:', error);
    }
  };

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
    return ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
  };

  const getStaffingStatus = (course) => {
    const assigned = getWeeklyTrainers(course).length;
    const required = course.requiredTrainers || course.required_trainers || 2;

    if (assigned === 0) return { color: 'red', message: 'Keine Trainer' };
    if (assigned < required) return { color: 'yellow', message: `${assigned}/${required} Trainer` };
    if (assigned === required) return { color: 'green', message: 'Optimal besetzt' };
    return { color: 'blue', message: `${assigned}/${required} Trainer (überbesetzt)` };
  };

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId);
    if (!trainer) return 'Unbekannter Trainer';
    const firstName = trainer.firstName || trainer.first_name || '';
    const lastName = trainer.lastName || trainer.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unbekannter Trainer';
  };

  const toggleCourseExpansion = (courseId) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const isCourseCancel = (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    return cancelledCourses.has(key) || (isHolidayWeek() && !hasCourseException(courseId));
  };

  const hasCourseException = (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    return courseExceptions.has(key);
  };

  const toggleCourseCancellation = async (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    const isCurrentlyCancelled = cancelledCourses.has(key);

    try {
      if (isCurrentlyCancelled) {
        await fetch(`${API_URL}/cancelled-courses/${courseId}/${weekNumber}/${year}`, {
          method: 'DELETE'
        });
        setCancelledCourses(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        await fetch(`${API_URL}/cancelled-courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: courseId,
            week_number: weekNumber,
            year: year
          })
        });
        setCancelledCourses(prev => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      }
    } catch (error) {
      console.error('Fehler beim Ändern des Kurs-Status:', error);
    }
  };

  const toggleCourseException = async (courseId) => {
    const key = `${courseId}-${weekNumber}-${year}`;
    const hasException = courseExceptions.has(key);

    try {
      if (hasException) {
        await fetch(`${API_URL}/course-exceptions/${courseId}/${weekNumber}/${year}`, {
          method: 'DELETE'
        });
        setCourseExceptions(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        await fetch(`${API_URL}/course-exceptions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: courseId,
            week_number: weekNumber,
            year: year
          })
        });
        setCourseExceptions(prev => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      }
    } catch (error) {
      console.error('Fehler beim Ändern der Kurs-Ausnahme:', error);
    }
  };

  const addTrainerToCourse = (courseId, trainerId) => {
    if (!trainerId) return;
    const key = `${courseId}-${weekNumber}-${year}`;
    const currentTrainers = weeklyAssignments[key] || 
      (courses.find(c => c.id === courseId)?.assignedTrainerIds || []);
    
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
      (courses.find(c => c.id === courseId)?.assignedTrainerIds || []);
    
    setWeeklyAssignments(prev => ({
      ...prev,
      [key]: currentTrainers.filter(id => id !== trainerId)
    }));
  };

  // Woche navigieren
  const navigateWeek = (direction) => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction * 7));
      return newDate;
    });
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // Formatiere Datum
  const formatDate = (date) => {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  // Hole Datum für einen Wochentag
  const getDateForCourse = (dayName) => {
    const dayIndex = daysOfWeek.indexOf(dayName);
    const date = new Date(currentWeek);
    const currentDayIndex = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - currentDayIndex + dayIndex);
    return date;
  };

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

  // Aktivitätstyp-Label
  const getActivityTypeLabel = (type, customType) => {
    const labels = {
      'wettkampf': '🏆 Wettkampf',
      'fortbildung': '📚 Fortbildung',
      'workshop': '🎯 Workshop',
      'sonstiges': customType ? `✨ ${customType}` : '✨ Sonstiges'
    };
    return labels[type] || type;
  };

  // Filtere Kurse nach Tag
  const filteredCourses = selectedDay === 'Alle'
    ? courses
    : courses.filter(c => (c.dayOfWeek || c.day_of_week) === selectedDay);

  // Gruppiere nach Wochentagen
  const coursesByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = filteredCourses.filter(c => (c.dayOfWeek || c.day_of_week) === day);
    return acc;
  }, {});

  // Gruppiere Aktivitäten nach Wochentagen
  const activitiesByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = weekActivities.filter(a => {
      const actDate = new Date(a.date);
      const actDayName = daysOfWeek[(actDate.getDay() + 6) % 7];
      return actDayName === day;
    });
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* =====================================================
          NOTE MODAL
          ===================================================== */}
      <NoteModal
        isOpen={noteModalOpen}
        onClose={closeNoteModal}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        note={noteModalNote}
        courseName={noteModalCourse?.name || ''}
      />

      {/* Header mit KW-Navigation */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateWeek(-1)}
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
              onClick={() => navigateWeek(1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              title="Nächste Woche"
            >
              ▶
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={goToCurrentWeek}
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

      {/* Kurse nach Tagen */}
      <div className="space-y-6">
        {(() => {
          const daysToShow = selectedDay === 'Alle' ? daysOfWeek : [selectedDay];
          
          return daysToShow.map(day => {
            const dayCourses = coursesByDay[day] || [];
            const dayActivities = activitiesByDay[day] || [];
            
            if (dayCourses.length === 0 && dayActivities.length === 0) return null;

            return (
              <div key={day} className="space-y-3">
                {/* Tages-Header */}
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
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
                  const notes = getCourseNotes(course.id);  // ← NEU: Array!
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
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-gray-900 text-sm sm:text-base">
                                    {course.startTime || course.start_time || '?'}
                                  </span>
                                  {/* =====================================================
                                      ✅ NEU: NOTIZEN-BADGES (zugeklappt)
                                      ===================================================== */}
                                  <NotesBadges notes={notes} />
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

                              {/* =====================================================
                                  ✅ NEU v2.8.0: NOTIZEN-LISTE (aufgeklappt)
                                  ===================================================== */}
                              <NotesList
                                notes={notes}
                                onAddNote={() => openNoteModal(course, null)}
                                onEditNote={(note) => openNoteModal(course, note)}
                                onDeleteNote={(noteId) => handleDeleteNoteDirectly(course.id, noteId)}
                              />

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
        {/* NEU: Notizen-Legende */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">🔒1</span>
              <span>Interne Notiz (nur Trainer)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">📢1</span>
              <span>Öffentliche Notiz (für Eltern)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;