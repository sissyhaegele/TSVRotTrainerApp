import React, { useRef, useState } from 'react';
import { Download, Upload, Save, AlertCircle, Database } from 'lucide-react';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8181/api'
  : 'https://tsvrottrainerappbackend-dedsbkhuathccma8.germanywestcentral-01.azurewebsites.net/api';

export default function BackupManager({ trainers, courses, sessions, onRestore }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const downloadBackup = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lade aktuelle Daten von der Datenbank
      const [trainersRes, coursesRes] = await Promise.all([
        fetch(`${API_URL}/trainers`),
        fetch(`${API_URL}/courses`)
      ]);

      if (!trainersRes.ok || !coursesRes.ok) {
        throw new Error('Fehler beim Laden der Daten');
      }

      const trainersData = await trainersRes.json();
      const coursesData = await coursesRes.json();
      
      const backup = {
        trainers: trainersData,
        courses: coursesData,
        sessions: sessions, // Sessions kommen von localStorage (Hybrid-System)
        backupDate: new Date().toISOString(),
        version: '2.0',
        source: 'azure-database'
      };
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], 
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TSVRot-Backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      console.log('Backup erfolgreich erstellt:', {
        trainers: trainersData.length,
        courses: coursesData.length,
        sessions: sessions.length
      });
    } catch (err) {
      console.error('Backup error:', err);
      setError('Fehler beim Erstellen des Backups: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        setError(null);

        const restored = JSON.parse(e.target.result);
        
        // Validierung
        if (!restored.trainers || !restored.courses) {
          throw new Error('Ungültiges Backup-Format');
        }

        // Warnung anzeigen
        const confirmed = window.confirm(
          `Backup vom ${new Date(restored.backupDate).toLocaleString('de-DE')}\n\n` +
          `Trainers: ${restored.trainers.length}\n` +
          `Kurse: ${restored.courses.length}\n` +
          `Sessions: ${restored.sessions?.length || 0}\n\n` +
          `WARNUNG: Dies wird die aktuellen Daten überschreiben!\n` +
          `Möchten Sie fortfahren?`
        );

        if (!confirmed) {
          setLoading(false);
          return;
        }

        // Restore zu Datenbank
        // WICHTIG: Dies müsste eigentlich über spezielle Backend-Endpunkte laufen
        // Für jetzt: nur lokaler State Update
        onRestore(restored);

        alert('Daten erfolgreich wiederhergestellt!\n\nHinweis: Für vollständige Wiederherstellung in die Datenbank kontaktieren Sie den Administrator.');
        
      } catch (error) {
        console.error('Restore error:', error);
        setError('Fehler beim Wiederherstellen: ' + error.message);
        alert('Fehler beim Wiederherstellen: ' + error.message);
      } finally {
        setLoading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Save className="w-5 h-5 mr-2" />
        Datensicherung
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
            <div className="text-sm text-red-800">
              {error}
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
        <div className="flex items-start">
          <Database className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">Cloud-Datenbank aktiv</p>
            <p className="text-blue-700 mt-1">
              Ihre Daten werden in der Azure-Cloud gespeichert und auf allen Geräten synchronisiert.
              Erstellen Sie regelmäßig Backups für zusätzliche Sicherheit.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={downloadBackup}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Erstelle Backup...' : 'Backup herunterladen'}
        </button>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4 mr-2" />
          Backup wiederherstellen
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleRestore}
          className="hidden"
        />
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Trainer</div>
            <div className="font-semibold">{trainers?.length || 0}</div>
          </div>
          <div>
            <div className="text-gray-600">Kurse</div>
            <div className="font-semibold">{courses?.length || 0}</div>
          </div>
          <div>
            <div className="text-gray-600">Sessions</div>
            <div className="font-semibold">{sessions?.length || 0}</div>
          </div>
          <div>
            <div className="text-gray-600">Stand</div>
            <div className="font-semibold text-xs">{new Date().toLocaleDateString('de-DE')}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>💡 Tipp: Erstellen Sie vor wichtigen Änderungen immer ein Backup.</p>
        <p className="mt-1">⚠️ Backup-Wiederherstellung erfordert Admin-Rechte.</p>
      </div>
    </div>
  );
}
