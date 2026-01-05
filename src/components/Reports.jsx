import { useState, useEffect } from 'react';

export default function Reports({ apiUrl }) {
  const [activeTab, setActiveTab] = useState('yearly'); // 'yearly' or 'range'
  const [year, setYear] = useState(2025);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [trainerData, setTrainerData] = useState(null);
  const [hallData, setHallData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = apiUrl || 'http://localhost:8181/api';

  // Setze default Datumsbereich (aktueller Monat)
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (activeTab === 'yearly') {
      fetchYearlyReports();
    }
  }, [year, activeTab]);

  const fetchYearlyReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const trainerResponse = await fetch(`${API_URL}/api/reports/trainer-hours?year=${year}`);
      if (!trainerResponse.ok) throw new Error('Fehler beim Laden der Trainer-Daten');
      const trainerJson = await trainerResponse.json();
      setTrainerData(trainerJson);

      const hallResponse = await fetch(`${API_URL}/api/reports/hall-usage?year=${year}`);
      if (!hallResponse.ok) throw new Error('Fehler beim Laden der Hallen-Daten');
      const hallJson = await hallResponse.json();
      setHallData(hallJson);

    } catch (err) {
      console.error('Error fetching yearly reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRangeReports = async () => {
    if (!startDate || !endDate) {
      setError('Bitte Start- und End-Datum auswählen');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start-Datum muss vor End-Datum liegen');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trainerResponse = await fetch(
        `${API_URL}/api/reports/trainer-hours-range?start=${startDate}&end=${endDate}`
      );
      if (!trainerResponse.ok) throw new Error('Fehler beim Laden der Trainer-Daten');
      const trainerJson = await trainerResponse.json();
      setTrainerData(trainerJson);

      const hallResponse = await fetch(
        `${API_URL}/api/reports/hall-usage-range?start=${startDate}&end=${endDate}`
      );
      if (!hallResponse.ok) throw new Error('Fehler beim Laden der Hallen-Daten');
      const hallJson = await hallResponse.json();
      setHallData(hallJson);

    } catch (err) {
      console.error('Error fetching range reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📊 Berichte
        </h1>
        <p className="text-gray-600">
          Auswertungen für Trainer-Stunden und Hallen-Auslastung
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('yearly')}
            className={`
              px-6 py-3 font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'yearly' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            📅 Jahresübersicht
          </button>
          <button
            onClick={() => setActiveTab('range')}
            className={`
              ml-8 px-6 py-3 font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'range' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            📊 Zeitraum-Analyse
          </button>
        </nav>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        {activeTab === 'yearly' ? (
          // Jahresauswahl
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700">
              Jahr:
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={fetchYearlyReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              🔄 Neu laden
            </button>
          </div>
        ) : (
          // Datumsbereich-Auswahl
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Von:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Bis:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchRangeReports}
              className="mt-5 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              📊 Analysieren
            </button>
            {startDate && endDate && !loading && !error && trainerData && (
              <div className="mt-5 text-sm text-gray-600">
                Zeitraum: {formatDate(startDate)} - {formatDate(endDate)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Lade Daten...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Reports */}
      {!loading && !error && trainerData && hallData && (
        <div className="space-y-8">
          
          {/* TRAINER-STUNDEN */}
          <section className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                👤 Trainer-Stunden {activeTab === 'yearly' ? year : ''}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {trainerData.summary.trainerCount} Trainer | {trainerData.summary.totalHours}h gesamt
                {activeTab === 'range' && startDate && endDate && (
                  <span> | {formatDate(startDate)} - {formatDate(endDate)}</span>
                )}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trainer (alphabetisch)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stunden
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wochen
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trainings
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trainerData.trainers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        Keine Daten vorhanden
                      </td>
                    </tr>
                  ) : (
                    trainerData.trainers.map((trainer) => (
                      <tr key={trainer.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {trainer.firstName.charAt(0)}{trainer.lastName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {trainer.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-lg font-bold text-gray-900">
                            {trainer.totalHours.toFixed(1)}h
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                          {trainer.trainingWeeks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                          {trainer.sessionCount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {trainerData.trainers.length > 0 && (
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td className="px-6 py-4 text-gray-900">
                        GESAMT ({trainerData.summary.trainerCount} Trainer)
                      </td>
                      <td className="px-6 py-4 text-right text-lg text-gray-900">
                        {trainerData.summary.totalHours.toFixed(1)}h
                      </td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>

          {/* HALLEN-AUSLASTUNG */}
          <section className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🏢 Hallen-Auslastung {activeTab === 'yearly' ? year : ''}
              </h2>
              <p className="text-green-100 text-sm mt-1">
                {hallData.summary.hallCount} Hallen | {hallData.summary.totalHours}h gesamt
                {activeTab === 'range' && startDate && endDate && (
                  <span> | {formatDate(startDate)} - {formatDate(endDate)}</span>
                )}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Halle
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stunden
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kurse
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wochen
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trainings
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hallData.halls.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        Keine Hallen-Daten vorhanden
                      </td>
                    </tr>
                  ) : (
                    hallData.halls.map((hall, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-semibold text-lg">
                                🏢
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {hall.location}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-lg font-bold text-gray-900">
                            {hall.totalHours.toFixed(1)}h
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                          {hall.courseCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                          {hall.trainingWeeks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                          {hall.sessionCount}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {hallData.halls.length > 0 && (
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td className="px-6 py-4 text-gray-900">
                        GESAMT ({hallData.summary.hallCount} Hallen)
                      </td>
                      <td className="px-6 py-4 text-right text-lg text-gray-900">
                        {hallData.summary.totalHours.toFixed(1)}h
                      </td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>

          {/* Export Buttons (für später) */}
          <div className="flex gap-4 justify-end">
            <button
              disabled
              className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
              title="Noch nicht implementiert"
            >
              📊 Excel Export
            </button>
            <button
              disabled
              className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
              title="Noch nicht implementiert"
            >
              📄 PDF Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}