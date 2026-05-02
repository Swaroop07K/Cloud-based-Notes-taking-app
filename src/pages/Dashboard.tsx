import { useState, useEffect } from 'react';
import { useNotes } from '../hooks/useNotes';
import NoteList from '../components/NoteList';
import NoteEditor from '../components/NoteEditor';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { Navigate } from 'react-router-dom';
import { Note } from '../types';
import { Plus, Coffee } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [user, loadingAuth] = useAuthState(auth);
  const { notes, loading: loadingNotes, createNote, updateNote, deleteNote } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Sync selected note with latest data from notes array
  useEffect(() => {
    if (selectedNote) {
      const updated = notes.find(n => n.id === selectedNote.id);
      if (updated) {
        setSelectedNote(updated);
      }
    }
  }, [notes]);

  if (loadingAuth) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const handleCreate = async () => {
    const id = await createNote();
    // note will be added via snapshot and sync effect will handle selection if we want, 
    // but for immediate ux we can try to find it. 
  };

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-white" id="dashboard-layout">
      {/* Sidebar: Note List */}
      <div className="w-80 flex-shrink-0" id="sidebar">
        <NoteList
          notes={notes}
          selectedNoteId={selectedNote?.id || null}
          onSelectNote={setSelectedNote}
          onCreateNote={handleCreate}
          onDeleteNote={deleteNote}
        />
      </div>

      {/* Main: Note Editor */}
      <div className="flex-1" id="main-editor-area">
        {selectedNote ? (
          <NoteEditor note={selectedNote} onUpdate={updateNote} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-8 bg-gray-50/30" id="empty-state">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6"
            >
              <div className="mx-auto h-24 w-24 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                <Coffee size={48} />
              </div>
              <div className="max-w-xs mx-auto">
                <h2 className="text-2xl font-bold text-gray-900">Choose a note</h2>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Select a note from the sidebar or create a new one to start writing.
                </p>
              </div>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                <Plus size={20} />
                Create New Note
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
