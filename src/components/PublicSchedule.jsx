// ============================================
// PublicSchedule.jsx - Öffentliche Eltern-Ansicht
// v2.12.4 - MIT KURS-AUSNAHMEN + DYNAMISCHEM FERIEN-BANNER
// Speichern unter: src/components/PublicSchedule.jsx
// ============================================

import React, { useState, useEffect } from 'react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8181/api'
  : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api';

// Hilfsfunktion: URL-Parameter auslesen
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Hilfsfunktion: URL-Parameter setzen (ohne Seite neu zu laden)
function setUrlParams(week, year) {
  const url = new URL(window.location);
  url.searchParams.set('week', week);
  url.searchParams.set('year', year);
  window.history.replaceState({}, '', url);
}

// Hilfsfunktion: Kalenderwoche berechnen
function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export default function PublicSchedule() {
  // URL-Parameter auslesen oder aktuelle Woche
  const initialWeek = parseInt(getUrlParam('week')) || getISOWeekNumber(new Date());
  const initialYear = parseInt(getUrlParam('year')) || new Date().getFullYear();
  
  const [weekNumber, setWeekNumber] = useState(initialWeek);
  const [year, setYear] = useState(initialYear);
  const [schedule, setSchedule] = useState({});
  const [weekDates, setWeekDates] = useState({ start: '', end: '' });
  const [isHolidayWeek, setIsHolidayWeek] = useState(false);
  const [holidayName, setHolidayName] = useState(null);
  const [hasExceptions, setHasExceptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // ✅ NEU v2.12.0: Öffentliche Sonderaktivitäten
  const [publicActivities, setPublicActivities] = useState([]);

  // Daten laden
  useEffect(() => {
    fetchSchedule();
    // URL aktualisieren
    setUrlParams(weekNumber, year);
  }, [weekNumber, year]);

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/public/kursplan?week=${weekNumber}&year=${year}`);
      const data = await response.json();
      
      if (data.success) {
        setSchedule(data.schedule);
        setWeekDates(data.weekDates);
        setIsHolidayWeek(data.isHolidayWeek);
        setHolidayName(data.holidayName);
        setHasExceptions(data.hasExceptions || false);
        // ✅ NEU v2.12.0: Öffentliche Activities laden
        setPublicActivities(data.activities || []);
      } else {
        setError('Fehler beim Laden des Kursplans');
      }
    } catch (err) {
      setError('Verbindungsfehler. Bitte später erneut versuchen.');
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  // Woche wechseln
  const changeWeek = (delta) => {
    let newWeek = weekNumber + delta;
    let newYear = year;
    
    if (newWeek < 1) {
      newYear--;
      newWeek = 52;
    } else if (newWeek > 52) {
      newYear++;
      newWeek = 1;
    }
    
    setWeekNumber(newWeek);
    setYear(newYear);
  };

  // Zur aktuellen Woche springen
  const goToCurrentWeek = () => {
    const now = new Date();
    setWeekNumber(getISOWeekNumber(now));
    setYear(now.getFullYear());
  };

  // ✅ NEU v2.12.0: Activities für einen Tag holen
  const getActivitiesForDay = (dayName) => {
    return publicActivities.filter(activity => 
      activity.day_of_week === dayName
    );
  };

  // ✅ NEU v2.12.0: Icon für Activity-Typ
  const getActivityIcon = (activityType) => {
    const icons = {
      'ferienspass': '🎉',
      'vereinsfest': '🎪',
      'workshop': '🔧',
      'fortbildung': '📚',
      'sonstiges': '📋'
    };
    return icons[activityType] || '🎯';
  };

  // Link kopieren
  const copyLink = async () => {
    const url = `${window.location.origin}/kursplan?week=${weekNumber}&year=${year}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback für ältere Browser
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // WhatsApp teilen
  const shareWhatsApp = () => {
    const url = `${window.location.origin}/kursplan?week=${weekNumber}&year=${year}`;
    const text = `🏃 TSV Rot Turnen - Kursplan KW ${weekNumber}\n📅 ${weekDates.start} - ${weekDates.end}${year}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Aktuelle Woche checken
  const currentWeekNum = getISOWeekNumber(new Date());
  const currentYear = new Date().getFullYear();
  const isCurrentWeek = weekNumber === currentWeekNum && year === currentYear;

  // Kurse für einen Tag rendern
  const renderDayCourses = (day, courses) => {
    const dayActivities = getActivitiesForDay(day);
    
    // Nur ausblenden wenn weder Kurse noch Activities vorhanden
    if ((!courses || courses.length === 0) && dayActivities.length === 0) return null;
    
    return (
      <div key={day} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
          {day}
        </h3>
        <div className="space-y-3">
          {/* Kurse */}
          {courses && courses.map(course => (
            <div 
              key={course.id}
              className={`p-4 rounded-lg border-l-4 ${
                course.isOff 
                  ? 'bg-red-50 border-red-400' 
                  : 'bg-green-50 border-green-400'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-lg ${
                    course.isOff ? 'text-red-800' : 'text-gray-800'
                  }`}>
                    {course.name}
                  </h4>
                  
                  <div className="mt-1 text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      <span>{course.startTime} - {course.endTime} Uhr</span>
                    </div>
                    
                    {course.location && (
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{course.location}</span>
                      </div>
                    )}
                    
                    {course.trainers && course.trainers.length > 0 && !course.isOff && (
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span>{course.trainers.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* =====================================================
                      ✅ NEU v2.8.0: ÖFFENTLICHE NOTIZEN
                      ===================================================== */}
                  {course.public_notes && course.public_notes.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {course.public_notes.map((note, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start gap-2 p-2.5 bg-orange-50 border border-orange-200 rounded-lg"
                        >
                          <span className="text-orange-500 flex-shrink-0 mt-0.5">📢</span>
                          <p className="text-sm text-orange-800">{note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  course.isOff 
                    ? 'bg-red-200 text-red-800' 
                    : 'bg-green-200 text-green-800'
                }`}>
                  {course.isOff ? (
                    <span>❌ {course.statusReason || 'Fällt aus'}</span>
                  ) : (
                    <span>✅ Findet statt</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* ✅ NEU v2.12.0: Sonderaktivitäten */}
          {dayActivities.length > 0 && (
            <div className={courses && courses.length > 0 ? "mt-4" : ""}>
              <div className="mb-2 pb-1 border-b border-purple-200">
                <h4 className="text-sm font-semibold text-purple-700 flex items-center gap-1">
                  <span>🎯</span>
                  <span>Besondere Aktivitäten</span>
                </h4>
              </div>
              
              {dayActivities.map(activity => (
                <div
                  key={`activity-${activity.id}`}
                  className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 rounded-lg p-5 shadow-md mb-3 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl flex-shrink-0">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xl font-bold text-purple-900 mb-2">
                        {activity.title}
                      </h5>
                      
                      <div className="space-y-2 text-gray-700 mb-3">
                        <p className="flex items-center gap-2 text-base">
                          <span className="font-semibold">🕐</span>
                          <span>{activity.hours} Stunden</span>
                        </p>
                        
                        {activity.trainer_names && (
                          <p className="flex items-center gap-2 text-base">
                            <span className="font-semibold">👤</span>
                            <span>{activity.trainer_names}</span>
                          </p>
                        )}
                        
                        {activity.custom_type && activity.activity_type === 'sonstiges' && (
                          <p className="text-sm text-purple-700 italic">
                            Art: {activity.custom_type}
                          </p>
                        )}
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        <span>📢</span>
                        <span>Besondere Aktivität</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // QR-Code URL
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/kursplan?week=${weekNumber}&year=${year}`)}`;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-700 text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span>🏃</span>
                <span>TSV Rot Turnen</span>
              </h1>
              <p className="text-red-200 text-sm mt-1">Kursplan</p>
            </div>
          </div>
        </div>
      </header>

      {/* Kalenderwochen-Navigation */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeWeek(-1)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Vorherige Woche"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">
                KW {weekNumber} / {year}
              </div>
              <div className="text-sm text-gray-500 mt-0.5">
                {weekDates.start} - {weekDates.end}{year}
              </div>
              {isHolidayWeek && (
                <div className="text-amber-600 font-medium text-sm mt-1 flex items-center justify-center gap-1">
                  <span>🏖️</span>
                  <span>Ferienwoche</span>
                </div>
              )}
              {!isCurrentWeek && (
                <button 
                  onClick={goToCurrentWeek}
                  className="text-red-600 text-xs mt-1 hover:underline"
                >
                  → Aktuelle Woche
                </button>
              )}
            </div>
            
            <button
              onClick={() => changeWeek(1)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              aria-label="Nächste Woche"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Share Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-full transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? '✓ Kopiert!' : '📋 Link kopieren'}
            </button>
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-100 hover:bg-green-200 rounded-full text-green-700 transition-colors"
            >
              💬 WhatsApp
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-full transition-colors ${
                showQR 
                  ? 'bg-blue-200 text-blue-800' 
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
            >
              📱 QR-Code
            </button>
          </div>

          {/* QR Code Anzeige */}
          {showQR && (
            <div className="mt-4 flex justify-center">
              <div className="bg-white p-4 rounded-xl shadow-lg border">
                <img 
                  src={qrUrl}
                  alt="QR Code zum Kursplan"
                  className="w-48 h-48"
                />
                <p className="text-center text-xs text-gray-500 mt-2">
                  Scannen für KW {weekNumber}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hauptinhalt */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchSchedule}
              className="mt-2 text-red-600 hover:underline text-sm"
            >
              Erneut versuchen
            </button>
          </div>
        ) : (
          <>
            {/* Ferien-Banner */}
            {isHolidayWeek && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-amber-800 font-medium text-lg">
                  🏖️ Ferienwoche - {hasExceptions ? 'Einige Kurse fallen aus' : 'Alle Kurse fallen aus'}
                </p>
                
                {/* ✅ NEU v2.12.0: Hinweis auf Activities */}
                {publicActivities.length > 0 && (
                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-300">
                    <p className="text-purple-800 font-semibold mb-2">
                      🎯 In dieser Woche {publicActivities.length === 1 ? 'findet 1 besondere Aktivität' : `finden ${publicActivities.length} besondere Aktivitäten`} statt!
                    </p>
                    <p className="text-sm text-purple-700">
                      Siehe unten für Details zu Ferienprogrammen, Workshops oder Wettkämpfen.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Kurse nach Tagen */}
            {DAYS.map(day => renderDayCourses(day, schedule[day]))}

            {/* Keine Kurse Hinweis */}
            {Object.values(schedule).every(courses => !courses || courses.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-xl">🔭</p>
                <p className="mt-2">Keine Kurse für diese Woche gefunden.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 border-t mt-8">
        <div className="max-w-3xl mx-auto px-4 py-4 text-center text-sm text-gray-600">
          <p>TSV 1905 Rot e.V. - Turnabteilung</p>
          <p className="text-xs mt-1 text-gray-400">
            Zuletzt aktualisiert: {new Date().toLocaleString('de-DE')}
          </p>
        </div>
      </footer>
    </div>
  );
}