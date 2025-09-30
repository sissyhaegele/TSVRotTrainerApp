import React, { useState } from 'react';
import { Upload, Database, CheckCircle, AlertCircle } from 'lucide-react';

export default function DataMigration({ trainers, courses }) {
  const [migrationStatus, setMigrationStatus] = useState('');
  const API_URL = 'https://tsvrot-api-v2.azurewebsites.net/api';
  
  const migrateToDatabase = async () => {
    setMigrationStatus('Migration läuft...');
    let successCount = 0;
    let errorCount = 0;
    
    // Trainer migrieren
    for (const trainer of trainers) {
      try {
        await fetch(`${API_URL}/trainers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: trainer.firstName,
            lastName: trainer.lastName,
            email: trainer.email,
            phone: trainer.phone
          })
        });
        successCount++;
      } catch (error) {
        console.error('Fehler bei Trainer:', trainer.name, error);
        errorCount++;
      }
    }
    
    // Kurse migrieren
    for (const course of courses) {
      try {
        await fetch(`${API_URL}/courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: course.name,
            dayOfWeek: course.dayOfWeek,
            startTime: course.startTime,
            endTime: course.endTime,
            location: course.location,
            category: course.category,
            requiredTrainers: course.requiredTrainers || 2
          })
        });
        successCount++;
      } catch (error) {
        console.error('Fehler bei Kurs:', course.name, error);
        errorCount++;
      }
    }
    
    setMigrationStatus(`Migration abgeschlossen: ${successCount} erfolgreich, ${errorCount} Fehler`);
  };
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Database className="w-5 h-5 mr-2" />
        Daten-Migration zur Datenbank
      </h2>
      
      <div className="space-y-2 text-sm mb-4">
        <p>Lokale Daten gefunden:</p>
        <ul className="ml-4">
          <li>• {trainers.length} Trainer in localStorage</li>
          <li>• {courses.length} Kurse in localStorage</li>
        </ul>
      </div>
      
      <button
        onClick={migrateToDatabase}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
      >
        <Upload className="w-4 h-4 mr-2" />
        Lokale Daten zur Datenbank hochladen
      </button>
      
      {migrationStatus && (
        <div className="mt-4 p-3 bg-white rounded border">
          {migrationStatus}
        </div>
      )}
    </div>
  );
}
