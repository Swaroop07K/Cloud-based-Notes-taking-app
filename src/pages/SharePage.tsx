import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Note } from '../types';
import Markdown from 'react-markdown';
import { BookOpen, AlertCircle, Calendar, ChevronLeft } from 'lucide-react';
import { isPast } from 'date-fns';

export default function SharePage() {
  const { userId, noteId } = useParams<{ userId: string; noteId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNote() {
      if (!userId || !noteId) return;
      
      try {
        const noteRef = doc(db, `users/${userId}/notes/${noteId}`);
        const snapshot = await getDoc(noteRef);
        
        if (!snapshot.exists()) {
          setError('Note not found or no longer available.');
          return;
        }

        const data = snapshot.data();
        const expiry = data.shareExpiresAt ? (data.shareExpiresAt as Timestamp).toDate() : null;

        if (!data.shared || (expiry && isPast(expiry))) {
          setError('This share link has expired or been disabled.');
          return;
        }

        setNote({
          id: snapshot.id,
          ...data,
          shareExpiresAt: expiry,
          createdAt: (data.createdAt as Timestamp)?.toDate(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate(),
        } as Note);
      } catch (err) {
        console.error('Error fetching shared note:', err);
        setError('Failed to load note. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [userId, noteId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-sm" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-red-500 shadow-sm border border-red-100">
          <AlertCircle size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{error || 'Access Denied'}</h1>
        <p className="mt-2 text-gray-500 max-w-sm mx-auto">This note is either private, deleted, or the share link has expired.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all">
          <BookOpen size={18} />
          Go to CloudNotes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <nav className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-blue-600">
            <BookOpen size={24} />
            <span>CloudNotes</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            <Calendar size={14} />
            Shared until {note.shareExpiresAt ? note.shareExpiresAt.toLocaleDateString() : 'forever'}
          </div>
        </div>
      </nav>

      <main className="mx-auto mt-12 max-w-4xl px-4 lg:px-0">
        <article className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100 sm:p-12">
          <header className="mb-8 border-b border-gray-100 pb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{note.title}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {note.tags.map((tag, i) => (
                <span key={i} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 uppercase tracking-widest border border-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="prose prose-blue max-w-none prose-headings:font-bold prose-pre:bg-gray-50 prose-pre:rounded-2xl prose-pre:border prose-pre:border-gray-100">
            <Markdown>{note.body}</Markdown>
          </div>
        </article>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">Created with CloudNotes – The modern markdown notebook.</p>
        </div>
      </main>
    </div>
  );
}
