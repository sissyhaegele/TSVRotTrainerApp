// =====================================================
// TSV ROT TRAINER APP - Frontend v2.8.0
// Komponente: NotesList.jsx (NEU)
// Pfad: src/components/NotesList.jsx
// =====================================================
// Zeigt alle Notizen eines Kurses in der aufgeklappten Ansicht

import React from 'react';
import { MessageSquare, Lock, Megaphone, X, Plus } from 'lucide-react';

export default function NotesList({ 
    notes = [], 
    onAddNote, 
    onEditNote, 
    onDeleteNote 
}) {
    // Sortiere: erst interne, dann öffentliche (jeweils nach Erstelldatum)
    const sortedNotes = [...notes].sort((a, b) => {
        // Erst nach Typ sortieren
        if (a.note_type !== b.note_type) {
            return a.note_type === 'internal' ? -1 : 1;
        }
        // Dann nach Erstelldatum
        return new Date(a.created_at) - new Date(b.created_at);
    });
    
    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Header mit Button */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                        Notizen
                    </span>
                    {notes.length > 0 && (
                        <span className="text-xs text-gray-400">
                            ({notes.length})
                        </span>
                    )}
                </div>
                <button
                    onClick={onAddNote}
                    className="flex items-center gap-1 text-sm px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Notiz
                </button>
            </div>
            
            {/* Notizen-Liste */}
            {notes.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2">
                    Keine Notizen für diese Woche
                </p>
            ) : (
                <div className="space-y-2">
                    {sortedNotes.map(note => (
                        <NoteItem 
                            key={note.id} 
                            note={note} 
                            onEdit={() => onEditNote(note)}
                            onDelete={() => {
                                if (confirm('Notiz wirklich löschen?')) {
                                    onDeleteNote(note.id);
                                }
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Einzelne Notiz-Zeile
function NoteItem({ note, onEdit, onDelete }) {
    const isPublic = note.note_type === 'public';
    
    return (
        <div 
            className={`group flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                isPublic 
                    ? 'bg-orange-50 hover:bg-orange-100 border border-orange-200' 
                    : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
            }`}
            onClick={onEdit}
        >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
                {isPublic ? (
                    <Megaphone className="w-4 h-4 text-orange-500" />
                ) : (
                    <Lock className="w-4 h-4 text-blue-500" />
                )}
            </div>
            
            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm whitespace-pre-wrap break-words ${
                    isPublic ? 'text-orange-800' : 'text-blue-800'
                }`}>
                    {note.note}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {isPublic ? 'Öffentlich für Eltern' : 'Nur für Trainer'}
                </p>
            </div>
            
            {/* Löschen-Button (erscheint bei Hover) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-white rounded transition-all"
                title="Löschen"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
