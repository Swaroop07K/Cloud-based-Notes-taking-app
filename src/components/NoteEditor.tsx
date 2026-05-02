import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Note } from '../types';
import ShareButton from './ShareButton';
import { Save, Eye, Edit3, Tag as TagIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
}

export default function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tagsInput, setTagsInput] = useState(note.tags.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    setTitle(note.title);
    setBody(note.body);
    setTagsInput(note.tags.join(', '));
  }, [note.id]);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      if (title !== note.title || body !== note.body || JSON.stringify(tags) !== JSON.stringify(note.tags)) {
        setIsSaving(true);
        onUpdate(note.id, { title, body, tags });
        setTimeout(() => setIsSaving(false), 800);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, body, tagsInput]);

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden" id="editor-container">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border-b px-6 py-4" id="editor-toolbar">
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg bg-gray-100 p-1" id="view-mode-toggle">
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                viewMode === 'edit' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              id="btn-mode-edit"
            >
              <Edit3 size={16} />
              Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                viewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              id="btn-mode-preview"
            >
              <Eye size={16} />
              Preview
            </button>
          </div>
          
          <AnimatePresence>
            {isSaving && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-gray-400 font-medium"
              >
                <Save size={12} className="animate-pulse" />
                Saving...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ShareButton note={note} onUpdate={onUpdate} />
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-8" id="editor-content">
        <div className="mx-auto max-w-4xl space-y-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full text-4xl font-bold placeholder-gray-200 outline-hidden border-none focus:ring-0"
            id="editor-title"
          />

          <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4" id="editor-tags">
            <TagIcon size={16} className="text-gray-400" />
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Add tags (comma separated)..."
              className="flex-1 text-sm text-gray-600 placeholder-gray-300 outline-hidden border-none focus:ring-0"
              id="editor-tags-input"
            />
            {note.tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 uppercase tracking-tighter">
                {tag}
              </span>
            ))}
          </div>

          <div className="min-h-[500px]" id="main-area">
            {viewMode === 'edit' ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 100000))}
                placeholder="Start writing in markdown..."
                className="w-full h-full min-h-[500px] resize-none text-lg text-gray-700 placeholder-gray-200 outline-hidden border-none focus:ring-0 font-mono leading-relaxed"
                id="editor-body"
              />
            ) : (
              <div className="prose prose-blue max-w-none prose-headings:font-bold prose-p:text-gray-600 prose-pre:bg-gray-50 prose-pre:border prose-pre:rounded-xl" id="markdown-preview">
                <Markdown>{body || '*No content yet.*'}</Markdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
