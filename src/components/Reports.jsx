import { useState, useEffect } from 'react';

export default function Reports() {
  const [year, setYear] = useState(2025);
  const [trainerData, setTrainerData] = useState(null);
  const [hallData, setHallData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8181';

  useEffect(() => {
    fetchReports();
  }, [year]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch Trainer Hours
      const trainerResponse = await fetch(`${API_URL}/api/reports/trainer-hours?year=${year}`);
      if (!trainerResponse.ok) throw new Error('Fehler beim Laden der Trainer-Daten');
      const trainerJson = await trainerResponse.json();
      setTrainerData(trainerJson);

      // Fetch Hall Usage
      const hallResponse = await fetch(`${API_URL}/api/reports/hall-usage?year=${year}`);
      if (!hallResponse.ok) throw new Error('Fehler beim Laden der Hallen-Daten');
      const hallJson = await hallResponse.json();
      setHallData(hallJson);

    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📊 Jahresberichte
        </h1>
        <p className="text-gray-600">
          Übersicht über Trainer-Stunden und Hallen-Auslastung
        </p>
      </div>

      {/* Jahr-Auswahl */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-lg font-semibold text-gray-700">
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
          onClick={fetchReports}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Neu laden
        </button>
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
                👤 Trainer-Stunden {year}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {trainerData.summary.trainerCount} Trainer | {trainerData.summary.totalHours}h gesamt
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trainer
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
                        Keine Daten für {year} vorhanden
                      </td>
                    </tr>
                  ) : (
                    trainerData.trainers.map((trainer, idx) => (
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
                🏢 Hallen-Auslastung {year}
              </h2>
              <p className="text-green-100 text-sm mt-1">
                {hallData.summary.hallCount} Hallen | {hallData.summary.totalHours}h gesamt
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
                        Keine Hallen-Daten für {year} vorhanden
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
