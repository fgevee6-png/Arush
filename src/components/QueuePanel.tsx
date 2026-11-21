import { Play, Trash2, X } from 'lucide-react';
import type { Track } from '../types/music';
import { CoverImage } from './CoverImage';

interface QueuePanelProps {
  open: boolean;
  currentTrack: Track | null;
  queue: Track[];
  onClose: () => void;
  onPlayTrack: (track: Track) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
}

export function QueuePanel({
  open,
  currentTrack,
  queue,
  onClose,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
}: QueuePanelProps) {
  if (!open) return null;

  const currentIdx = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;
  const upNext = currentIdx >= 0 ? queue.slice(currentIdx + 1) : queue;

  return (
    <aside
      className="flex w-full shrink-0 flex-col border-l border-white/[0.06] bg-[#0B0B0E] sm:w-[320px]"
      aria-label="Playback queue"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
        <h2 className="font-display text-base font-bold text-[#F5F5F7]">Queue</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close queue"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-white/[0.06] hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
        {currentTrack && (
          <div>
            <p className="mb-2 text-xs font-semibold text-[#A1A1AA]">Now playing</p>
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#141419] p-3">
              <CoverImage
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                className="h-12 w-12 shrink-0 rounded-md"
                iconSize={18}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1ED760]">{currentTrack.title}</p>
                <p className="truncate text-xs text-[#A1A1AA]">{currentTrack.artist}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#A1A1AA]">
              Next up ({upNext.length})
            </p>
            {upNext.length > 0 && (
              <button
                type="button"
                onClick={onClearQueue}
                className="text-xs text-[#71717A] hover:text-white"
              >
                Clear upcoming
              </button>
            )}
          </div>

          {upNext.length === 0 ? (
            <p className="rounded-xl border border-white/[0.05] bg-[#121216] p-4 text-xs text-[#71717A]">
              Queue is empty. Play a playlist or add songs from any track menu.
            </p>
          ) : (
            <div className="space-y-1">
              {upNext.map((track, offset) => {
                const actualIdx = currentIdx >= 0 ? currentIdx + 1 + offset : offset;
                return (
                  <div
                    key={`${track.id}-${actualIdx}`}
                    className="group flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-white/[0.05]"
                  >
                    <button
                      type="button"
                      onClick={() => onPlayTrack(track)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md">
                        <CoverImage
                          src={track.artworkUrl}
                          alt={track.title}
                          className="h-10 w-10"
                          iconSize={15}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Play size={13} fill="currentColor" className="text-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-[#F5F5F7]">{track.title}</p>
                        <p className="truncate text-[11px] text-[#A1A1AA]">{track.artist}</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveFromQueue(actualIdx)}
                      aria-label={`Remove ${track.title} from queue`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#71717A] opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
