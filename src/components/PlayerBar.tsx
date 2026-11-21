import {
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { RepeatMode, Track } from '../types/music';
import { formatSeconds } from '../utils/format';
import { CoverImage } from './CoverImage';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  isLiked: boolean;
  queueOpen: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleLike: () => void;
  onToggleQueue: () => void;
  onSelectArtist: (artist: string) => void;
}

export function PlayerBar({
  currentTrack,
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  volume,
  isMuted,
  shuffle,
  repeatMode,
  isLiked,
  queueOpen,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleRepeat,
  onToggleLike,
  onToggleQueue,
  onSelectArtist,
}: PlayerBarProps) {
  const safeDuration = duration > 0 ? duration : 30;
  const progressPct = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));
  const effectiveVolume = isMuted ? 0 : volume;

  return (
    <footer
      className="z-30 flex h-[78px] shrink-0 items-center justify-between gap-4 border-t border-white/[0.08] bg-[#07070A] px-3 sm:h-[84px] sm:px-5"
      aria-label="Audio player controls"
    >
      {/* Left: Track Info */}
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-[300px]">
        {currentTrack ? (
          <>
            <CoverImage
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              className="h-12 w-12 shrink-0 rounded-md shadow-md sm:h-14 sm:w-14"
              iconSize={20}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#F5F5F7]">
                {currentTrack.title}
              </p>
              <button
                type="button"
                onClick={() => onSelectArtist(currentTrack.artist)}
                className="block max-w-full truncate text-left text-xs text-[#A1A1AA] hover:text-white hover:underline"
              >
                {currentTrack.artist}
              </button>
            </div>
            <button
              type="button"
              onClick={onToggleLike}
              aria-label={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
              className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors sm:flex ${
                isLiked ? 'text-[#1ED760]' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-md bg-[#141419]" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#A1A1AA]">Select a song to play</p>
            </div>
          </div>
        )}
      </div>

      {/* Center: Transport & Scrubber */}
      <div className="flex flex-col items-center gap-1.5 sm:flex-1 sm:max-w-[540px]">
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={onToggleShuffle}
            aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
            className={`hidden h-8 w-8 items-center justify-center rounded-full transition-colors sm:flex ${
              shuffle ? 'text-[#1ED760]' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Shuffle size={16} />
          </button>

          <button
            type="button"
            onClick={onPrev}
            disabled={!currentTrack}
            aria-label="Previous track"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#D4D4D8] transition-colors hover:text-white disabled:opacity-35"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            disabled={!currentTrack}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#050507] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 sm:h-10 sm:w-10"
          >
            {isBuffering ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#050507] border-t-transparent" />
            ) : isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!currentTrack}
            aria-label="Next track"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#D4D4D8] transition-colors hover:text-white disabled:opacity-35"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>

          <button
            type="button"
            onClick={onCycleRepeat}
            aria-label={`Repeat mode: ${repeatMode}`}
            className={`hidden h-8 w-8 items-center justify-center rounded-full transition-colors sm:flex ${
              repeatMode !== 'off' ? 'text-[#1ED760]' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        {/* Scrubber */}
        <div className="hidden w-full items-center gap-2.5 sm:flex">
          <span className="w-9 text-right text-[11px] text-[#71717A] font-mono-tabular">
            {formatSeconds(currentTime)}
          </span>
          <div className="group relative flex h-4 flex-1 items-center">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.14]">
              <div
                className="h-full rounded-full bg-[#1ED760] transition-[width] duration-75"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={safeDuration}
              step={0.1}
              value={Math.min(currentTime, safeDuration)}
              disabled={!currentTrack}
              onChange={(e) => onSeek(Number(e.target.value))}
              aria-label="Seek playback position"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
            />
          </div>
          <span className="w-9 text-left text-[11px] text-[#71717A] font-mono-tabular">
            {formatSeconds(safeDuration)}
          </span>
        </div>
      </div>

      {/* Right: Queue & Volume */}
      <div className="hidden flex-1 items-center justify-end gap-3 sm:flex sm:max-w-[260px]">
        <button
          type="button"
          onClick={onToggleQueue}
          aria-label="Toggle queue panel"
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            queueOpen
              ? 'bg-white/[0.1] text-[#1ED760]'
              : 'text-[#A1A1AA] hover:text-white'
          }`}
        >
          <ListMusic size={17} />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A1A1AA] hover:text-white"
          >
            {effectiveVolume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <div className="relative flex h-4 w-24 items-center">
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.14]">
              <div
                className="h-full rounded-full bg-[#F5F5F7]"
                style={{ width: `${effectiveVolume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={effectiveVolume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              aria-label="Volume"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
