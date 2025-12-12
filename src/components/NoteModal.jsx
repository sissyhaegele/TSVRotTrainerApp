// =====================================================
// TSV ROT TRAINER APP - Frontend v2.8.0
// Komponente: NoteModal.jsx (NEU)
// Pfad: src/components/NoteModal.jsx
// =====================================================

import React, { useState, useEffect } from 'react';
import { X, Lock, Megaphone, AlertTriangle, Trash2 } from 'lucide-react';

export default function NoteModal({ 
    isOpen, 
    onClose, 
    onSave, 
    onDelete,
    note = null,  // null = neue Notiz, sonst bearbeiten
    courseName = ''
}) {
    const [noteType, setNoteType] = useState('internal');
    const [noteText, setNoteText] = useState('');
    
    // Bei Bearbeitung: Felder vorausfüllen
    useEffect(() => {
        if (note) {
            setNoteType(note.note_type || 'internal');
            setNoteText(note.note || '');
        } else {
            setNoteType('internal');
            setNoteText('');
        }
    }, [note, isOpen]);
    
    if (!isOpen) return null;
    
    const isEditing = note !== null;
    const title = isEditing ? 'Notiz bearbeiten' : 'Notiz hinzufügen';
    
    const handleSave = () => {
        if (!noteText.trim()) return;
        
        onSave({
            id: note?.id,
            note_type: noteType,
            note: noteText.trim()
        });
    };
    
    const handleDelete = () => {
        onDelete(note.id);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Enter zum Speichern (Shift+Enter für neue Zeile)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (noteText.trim()) {
                handleSave();
            }
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        {courseName && (
                            <p className="text-sm text-gray-500">{courseName}</p>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-4 space-y-4">
                    {/* Typ-Auswahl */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sichtbarkeit:
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setNoteType('internal')}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all text-left ${
                                    noteType === 'internal'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Lock className={`w-5 h-5 ${noteType === 'internal' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium ${noteType === 'internal' ? 'text-blue-700' : 'text-gray-700'}`}>
                                        Intern
                                    </span>
                                </div>
                                <p className="text-xs mt-1 text-gray-500 ml-7">
                                    Nur für Trainer sichtbar
                                </p>
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => setNoteType('public')}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all text-left ${
                                    noteType === 'public'
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Megaphone className={`w-5 h-5 ${noteType === 'public' ? 'text-orange-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium ${noteType === 'public' ? 'text-orange-700' : 'text-gray-700'}`}>
                                        Für Eltern
                                    </span>
                                </div>
                                <p className="text-xs mt-1 text-gray-500 ml-7">
                                    Im Kursplan sichtbar
                                </p>
                            </button>
                        </div>
                    </div>
                    
                    {/* Warnung bei öffentlicher Notiz */}
                    {noteType === 'public' && (
                        <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-orange-800">
                                Diese Notiz wird im öffentlichen Kursplan für alle Eltern und Teilnehmer sichtbar sein!
                            </span>
                        </div>
                    )}
                    
                    {/* Textfeld */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notiz:
                        </label>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                noteType === 'internal' 
                                    ? 'z.B. Lisa hat Erdnussallergie, Max braucht extra Betreuung...'
                                    : 'z.B. Bitte Stoppersocken mitbringen, Nächste Woche fällt aus...'
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={3}
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Enter = Speichern, Shift+Enter = Neue Zeile
                        </p>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-lg">
                    <div>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Löschen
                            </button>
                        )}
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!noteText.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Speichern
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}