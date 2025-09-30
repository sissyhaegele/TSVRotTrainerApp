import React, { useRef } from 'react';
import { Download, Upload, Save, AlertCircle } from 'lucide-react';

export default function BackupManager({ data, onRestore }) {
  const fileInputRef = useRef(null);
  
  const downloadBackup = () => {
    const backup = {
      ...data,
      backupDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TSVRot-Backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };
  
  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const restored = JSON.parse(e.target.result);
        onRestore(restored);
        alert('Daten erfolgreich wiederhergestellt!');
      } catch (error) {
        alert('Fehler beim Wiederherstellen: ' + error.message);
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
      
      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">Automatische Sicherung aktiv</p>
            <p className="text-blue-700 mt-1">
              Ihre Daten werden lokal gespeichert und bleiben auch bei Neuladen erhalten.
              Erstellen Sie regelmäßig Backups für zusätzliche Sicherheit.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={downloadBackup}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Backup herunterladen
        </button>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
      
      <div className="mt-4 text-xs text-gray-600">
        Letztes Backup: {new Date().toLocaleString('de-DE')}
      </div>
    </div>
  );
}
