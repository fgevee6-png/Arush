import { useEffect, useRef, useState } from 'react';
import { Heart, ListPlus, MoreHorizontal, Pause, Play, Plus, Trash2 } from 'lucide-react';
import type { Playlist, Track } from '../types/music';
import { formatDuration } from '../utils/format';
import { CoverImage } from './CoverImage';

interface TrackRowProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  isLiked: boolean;
  customPlaylists: Playlist[];
  canRemove?: boolean;
  onPlay: () => void;
  onToggleLike: () => void;
  onAddToQueue: () => void;
  onAddToPlaylist: (playlistId: string) => void;
  onRemoveFromPlaylist?: () => void;
  onSelectArtist: (artistName: string) => void;
}

export function TrackRow({
  track,
  index,
  isCurrent,
  isPlaying,
  isLiked,
  customPlaylists,
  canRemove,
  onPlay,
  onToggleLike,
  onAddToQueue,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onSelectArtist,
}: TrackRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  return (
    <div
      onDoubleClick={onPlay}
      className={`group grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-3 py-2 transition-colors md:grid-cols-[36px_minmax(0,1.6fr)_minmax(0,1fr)_auto] ${
        isCurrent ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
      }`}
    >
      {/* Index / Play toggle */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={onPlay}
          aria-label={isCurrent && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#A1A1AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760]"
        >
          {isCurrent && isPlaying ? (
            <>
              <span className="flex h-3.5 items-end gap-[2px] group-hover:hidden" aria-hidden="true">
                <span className="h-3.5 w-[3px] rounded-full bg-[#1ED760] eq-bar-1" />
                <span className="h-3.5 w-[3px] rounded-full bg-[#1ED760] eq-bar-2" />
                <span className="h-3.5 w-[3px] rounded-full bg-[#1ED760] eq-bar-3" />
              </span>
              <Pause size={15} className="hidden text-[#1ED760] group-hover:block" fill="currentColor" />
            </>
          ) : (
            <>
              <span
                className={`text-xs font-mono-tabular group-hover:hidden ${
                  isCurrent ? 'text-[#1ED760] font-medium' : 'text-[#71717A]'
                }`}
              >
                {index + 1}
              </span>
              <Play size={15} className="hidden text-white group-hover:block" fill="currentColor" />
            </>
          )}
        </button>
      </div>

      {/* Cover + Title + Artist */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onPlay}
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760]"
        >
          <CoverImage src={track.artworkUrl} alt={track.title} className="h-10 w-10" iconSize={16} />
        </button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onPlay}
            className={`block max-w-full truncate text-left text-sm font-medium transition-colors ${
              isCurrent ? 'text-[#1ED760]' : 'text-[#F5F5F7] hover:underline'
            }`}
          >
            {track.title}
          </button>
          <button
            type="button"
            onClick={() => onSelectArtist(track.artist)}
            className="block max-w-full truncate text-left text-xs text-[#A1A1AA] hover:text-white hover:underline"
          >
            {track.artist}
          </button>
        </div>
      </div>

      {/* Album & Year (hidden on small mobile) */}
      <div className="hidden min-w-0 pr-3 md:block">
        <p className="truncate text-xs text-[#A1A1AA]">
          {track.album} <span aria-hidden="true">·</span> {track.releaseYear}
        </p>
      </div>

      {/* Actions + Duration */}
      <div className="relative flex items-center gap-2" ref={menuRef}>
        <button
          type="button"
          onClick={onToggleLike}
          aria-label={isLiked ? `Remove ${track.title} from Liked Songs` : `Save ${track.title} to Liked Songs`}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760] ${
            isLiked
              ? 'text-[#1ED760] opacity-100'
              : 'text-[#A1A1AA] opacity-70 hover:text-white group-hover:opacity-100'
          }`}
        >
          <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
        </button>

        <span className="w-11 text-right text-xs text-[#71717A] font-mono-tabular">
          {formatDuration(track.durationMs)}
        </span>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={`More options for ${track.title}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#A1A1AA] opacity-80 transition-colors hover:bg-white/[0.08] hover:text-white group-hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760]"
        >
          <MoreHorizontal size={16} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-9 z-30 w-52 rounded-xl border border-white/[0.08] bg-[#18181D] p-1.5 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                onAddToQueue();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#F5F5F7] hover:bg-white/[0.08]"
            >
              <ListPlus size={15} className="text-[#A1A1AA]" />
              <span>Add to queue</span>
            </button>

            {customPlaylists.length > 0 && (
              <div className="my-1 border-t border-white/[0.06] pt-1">
                <p className="px-3 py-1 text-[11px] font-medium text-[#71717A]">
                  Add to playlist
                </p>
                {customPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => {
                      onAddToPlaylist(pl.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-xs text-[#F5F5F7] hover:bg-white/[0.08]"
                  >
                    <Plus size={14} className="text-[#A1A1AA]" />
                    <span className="truncate">{pl.title}</span>
                  </button>
                ))}
              </div>
            )}

            {canRemove && onRemoveFromPlaylist && (
              <div className="my-1 border-t border-white/[0.06] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onRemoveFromPlaylist();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-400 hover:bg-white/[0.08]"
                >
                  <Trash2 size={14} />
                  <span>Remove from playlist</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
