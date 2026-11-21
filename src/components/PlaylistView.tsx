import { Heart, ListMusic, Pause, Play, Shuffle, Trash2 } from 'lucide-react';
import type { ActiveRoute, Playlist, Track } from '../types/music';
import { formatTotalDuration } from '../utils/format';
import { CoverImage } from './CoverImage';
import { TrackRow } from './TrackRow';

interface PlaylistViewProps {
  title: string;
  subtitle: string;
  description: string;
  coverUrl?: string;
  isLikedView?: boolean;
  isCustomPlaylist?: boolean;
  isLoading?: boolean;
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  likedIds: Set<string>;
  customPlaylists: Playlist[];
  onPlayTrack: (track: Track, contextTracks: Track[]) => void;
  onPlayAll: (shuffle?: boolean) => void;
  onToggleLike: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist: (playlistId: string, track: Track) => void;
  onRemoveTrackFromCustom?: (trackId: string) => void;
  onDeleteCustomPlaylist?: () => void;
  onNavigate: (route: ActiveRoute) => void;
}

export function PlaylistView({
  title,
  subtitle,
  description,
  coverUrl,
  isLikedView,
  isCustomPlaylist,
  isLoading,
  tracks,
  currentTrack,
  isPlaying,
  likedIds,
  customPlaylists,
  onPlayTrack,
  onPlayAll,
  onToggleLike,
  onAddToQueue,
  onAddToPlaylist,
  onRemoveTrackFromCustom,
  onDeleteCustomPlaylist,
  onNavigate,
}: PlaylistViewProps) {
  const isPlaylistPlaying =
    isPlaying && currentTrack !== null && tracks.some((t) => t.id === currentTrack.id);

  const displayCover = coverUrl || tracks[0]?.artworkUrl;
  const durationSummary = formatTotalDuration(tracks.map((t) => t.durationMs));

  return (
    <div className="space-y-8 pb-8">
      {/* Header Hero */}
      <div className="flex flex-col gap-6 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#1B1B24] to-[#111115] p-6 sm:flex-row sm:items-end sm:p-8">
        <div className="h-44 w-44 shrink-0 overflow-hidden rounded-xl shadow-2xl sm:h-52 sm:w-52">
          {isLikedView ? (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1ED760]/85 to-[#0C5E2A] text-white">
              <Heart size={56} fill="currentColor" />
            </div>
          ) : displayCover ? (
            <CoverImage src={displayCover} alt={title} className="h-full w-full" iconSize={48} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#18181D] text-[#71717A]">
              <ListMusic size={48} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#1ED760]">{subtitle}</p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl [text-wrap:balance]">
            {title}
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm text-[#A1A1AA]">{description}</p>
          <p className="mt-3 text-xs text-[#D4D4D8] font-mono-tabular">
            Swarify <span aria-hidden="true">·</span> {tracks.length}{' '}
            {tracks.length === 1 ? 'song' : 'songs'} <span aria-hidden="true">·</span> {durationSummary}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={tracks.length === 0}
              onClick={() => {
                if (isPlaylistPlaying && currentTrack) {
                  onPlayTrack(currentTrack, tracks);
                } else {
                  onPlayAll(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#1ED760] px-6 py-2.5 text-sm font-semibold text-[#050507] transition-transform hover:scale-[1.02] hover:bg-[#1FDF64] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {isPlaylistPlaying ? (
                <>
                  <Pause size={16} fill="currentColor" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={tracks.length === 0}
              onClick={() => onPlayAll(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              <Shuffle size={15} />
              <span>Shuffle</span>
            </button>

            {isCustomPlaylist && onDeleteCustomPlaylist && (
              <button
                type="button"
                onClick={onDeleteCustomPlaylist}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 whitespace-nowrap shrink-0"
              >
                <Trash2 size={14} />
                <span>Delete playlist</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tracklist Table */}
      <div>
        <div className="mb-1 hidden grid-cols-[36px_minmax(0,1.6fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[0.06] px-3 py-2 text-xs font-medium text-[#71717A] md:grid">
          <span className="text-center">#</span>
          <span>Title</span>
          <span>Album · Year</span>
          <span className="pr-10 text-right">Duration</span>
        </div>

        {isLoading ? (
          <div className="space-y-2 pt-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-14 rounded-lg bg-[#121216] animate-pulse" />
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-[#121216] p-12 text-center">
            <p className="font-display text-lg font-semibold text-[#F5F5F7]">
              {isLikedView ? 'No liked songs yet' : 'This playlist is empty'}
            </p>
            <p className="mt-1 text-xs text-[#A1A1AA]">
              {isLikedView
                ? 'Tap the heart icon on any song to save it here.'
                : 'Search for songs and use the menu on any track to add it to this playlist.'}
            </p>
            <button
              type="button"
              onClick={() => onNavigate({ view: 'search', query: '' })}
              className="mt-4 rounded-full bg-[#1ED760] px-5 py-2 text-xs font-semibold text-[#050507] hover:bg-[#1FDF64]"
            >
              Find songs
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {tracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                isLiked={likedIds.has(track.id)}
                customPlaylists={customPlaylists}
                canRemove={isCustomPlaylist}
                onPlay={() => onPlayTrack(track, tracks)}
                onToggleLike={() => onToggleLike(track)}
                onAddToQueue={() => onAddToQueue(track)}
                onAddToPlaylist={(plId) => onAddToPlaylist(plId, track)}
                onRemoveFromPlaylist={
                  onRemoveTrackFromCustom ? () => onRemoveTrackFromCustom(track.id) : undefined
                }
                onSelectArtist={(artist) => onNavigate({ view: 'artist', artistName: artist })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
