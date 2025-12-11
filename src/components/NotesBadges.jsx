// =====================================================
// TSV ROT TRAINER APP - Frontend v2.8.0
// Komponente: NotesBadges.jsx (NEU)
// Pfad: src/components/NotesBadges.jsx
// =====================================================
// Zeigt die Anzahl der internen/externen Notizen als Badges

import React from 'react';

export default function NotesBadges({ notes = [] }) {
    if (!notes || notes.length === 0) return null;
    
    const internalCount = notes.filter(n => n.note_type === 'internal').length;
    const publicCount = notes.filter(n => n.note_type === 'public').length;
    
    if (internalCount === 0 && publicCount === 0) return null;
    
    return (
        <div className="flex items-center gap-1">
            {internalCount > 0 && (
                <span 
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                    title={`${internalCount} interne Notiz${internalCount > 1 ? 'en' : ''}`}
                >
                    🔒{internalCount}
                </span>
            )}
            {publicCount > 0 && (
                <span 
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium"
                    title={`${publicCount} öffentliche Notiz${publicCount > 1 ? 'en' : ''}`}
                >
                    📢{publicCount}
                </span>
            )}
        </div>
    );
}
