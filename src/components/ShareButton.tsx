import { useState, useEffect } from 'react';
import { Note } from '../types';
import { Share2, Copy, Check, Calendar, Lock, Unlock } from 'lucide-react';
import { format, addDays, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface ShareButtonProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
}

export default function ShareButton({ note, onUpdate }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date>(() => {
    return note.shareExpiresAt || addDays(new Date(), 7);
  });

  // Sync state if note changes externally
  useEffect(() => {
    if (note.shareExpiresAt) {
      setExpiryDate(note.shareExpiresAt);
    }
  }, [note.shareExpiresAt]);

  const shareUrl = `${window.location.origin}/share/${note.userId}/${note.id}`;

  const toggleSharing = () => {
    const newShared = !note.shared;
    onUpdate(note.id, { 
      shared: newShared,
      shareExpiresAt: newShared ? expiryDate : null
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateExpiry = (days: number) => {
    const newDate = addDays(new Date(), days);
    setExpiryDate(newDate);
    if (note.shared) {
      onUpdate(note.id, { shareExpiresAt: newDate });
    }
  };

  // Helper to check if a button matches current expiry (roughly)
  const isSelected = (days: number) => {
    if (!note.shareExpiresAt) return false;
    const now = new Date();
    // Normalize to midnight for fair comparison of "days"
    const diff = Math.round((note.shareExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff === days;
  };

  return (
    <div className="relative" id="share-section">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
          note.shared 
            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        id="btn-share-toggle"
      >
        <Share2 size={16} />
        {note.shared ? 'Sharing Active' : 'Share Note'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border bg-white p-6 shadow-2xl"
              id="share-dropdown"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">Share Publicly</h4>
                    <p className="text-xs text-gray-500 mt-1">Anyone with the link can view this.</p>
                  </div>
                  <button
                    onClick={toggleSharing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      note.shared ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        note.shared ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {note.shared && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} />
                        Link Expiry
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 7, 30].map(days => (
                          <button
                            key={days}
                            onClick={() => updateExpiry(days)}
                            className={`rounded-lg py-1.5 text-xs font-medium border transition-all ${
                              isSelected(days)
                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {days}d
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 text-center">
                        Expires on {format(expiryDate, 'MMM d, yyyy')}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        Link
                      </label>
                      <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-2 pl-3 border border-gray-100">
                        <input
                          type="text"
                          readOnly
                          value={shareUrl}
                          className="flex-1 bg-transparent text-xs text-gray-500 outline-hidden truncate"
                        />
                        <button
                          onClick={handleCopy}
                          className="rounded-lg bg-white p-1.5 text-gray-400 shadow-sm border hover:text-blue-600 transition-colors"
                        >
                          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
