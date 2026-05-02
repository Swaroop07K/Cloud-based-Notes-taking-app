import { Note } from '../types';
import { Plus, Trash2, Search, FileText } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
}

export default function NoteList({ notes, selectedNoteId, onSelectNote, onCreateNote, onDeleteNote }: NoteListProps) {
  const [search, setSearch] = useState('');

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(search.toLowerCase()) || 
    note.body.toLowerCase().includes(search.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-full flex-col bg-gray-50 border-r" id="note-list-container">
      <div className="p-4 border-b space-y-4" id="note-list-header">
        <button
          onClick={onCreateNote}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          id="btn-create-note"
        >
          <Plus size={20} />
          Create New Note
        </button>

        <div className="relative" id="note-search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border-gray-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 outline-hidden bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2" id="notes-scroll-area">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400" id="no-notes">
            <FileText size={48} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">No notes found</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note)}
              className={`group relative mb-2 cursor-pointer rounded-xl p-4 transition-all ${
                selectedNoteId === note.id
                  ? 'bg-blue-50 border-blue-100 shadow-sm'
                  : 'hover:bg-white hover:shadow-sm border-transparent'
              } border`}
              id={`note-item-${note.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={`truncate font-semibold ${selectedNoteId === note.id ? 'text-blue-900' : 'text-gray-900'}`}>
                    {note.title || 'Untitled'}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500 leading-relaxed uppercase tracking-wider">
                    {note.body ? note.body.substring(0, 100) : 'No content'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                  className="ml-2 rounded-lg p-1 text-gray-400 opacity-0 hover:bg-red-50 hover:text-red-500 transition-all group-hover:opacity-100 focus:opacity-100"
                  title="Delete note"
                  id={`btn-delete-${note.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-gray-400">
                <span>{note.updatedAt ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) : 'Just now'}</span>
                {note.shared && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">SHARED</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
