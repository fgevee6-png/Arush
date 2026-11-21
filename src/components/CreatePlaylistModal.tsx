import { useState } from 'react';
import { X } from 'lucide-react';

interface CreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
}

export function CreatePlaylistModal({ open, onClose, onCreate }: CreatePlaylistModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    onCreate(cleanTitle, description.trim() || 'Personal collection');
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-playlist-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#141419] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 id="create-playlist-title" className="font-display text-xl font-bold text-[#F5F5F7]">
            Create playlist
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-white/[0.08] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="playlist-name" className="block text-xs font-medium text-[#D4D4D8]">
              Playlist name
            </label>
            <input
              id="playlist-name"
              type="text"
              required
              autoFocus
              maxLength={60}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Late Night Drive"
              className="mt-1.5 w-full rounded-lg border border-white/[0.1] bg-[#0B0B0E] px-3.5 py-2.5 text-sm text-white placeholder-[#71717A] focus:border-[#1ED760] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="playlist-desc" className="block text-xs font-medium text-[#D4D4D8]">
              Description
            </label>
            <textarea
              id="playlist-desc"
              rows={3}
              maxLength={160}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add an optional description..."
              className="mt-1.5 w-full resize-none rounded-lg border border-white/[0.1] bg-[#0B0B0E] px-3.5 py-2.5 text-sm text-white placeholder-[#71717A] focus:border-[#1ED760] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2 text-xs font-medium text-[#A1A1AA] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-full bg-[#1ED760] px-6 py-2 text-xs font-semibold text-[#050507] hover:bg-[#1FDF64] disabled:opacity-40"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
