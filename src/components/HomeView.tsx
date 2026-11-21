import { useMemo, useState } from 'react';
import { Heart, Pause, Play, Shuffle } from 'lucide-react';
import { GENRE_FILTERS, HERO_BANNER_IMAGE } from '../data/curatedPlaylists';
import type { ActiveRoute, Playlist, Track } from '../types/music';
import { CoverImage } from './CoverImage';
import { TrackRow } from './TrackRow';

interface HomeViewProps {
  playlists: Playlist[];
  likedTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoadingDiscover: boolean;
  discoverError: string | null;
  likedIds: Set<string>;
  customPlaylists: Playlist[];
  onRetryDiscover: () => void;
  onPlayTrack: (track: Track, contextTracks: Track[]) => void;
  onPlayPlaylist: (tracks: Track[], shuffle?: boolean) => void;
  onToggleLike: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist: (playlistId: string, track: Track) => void;
  onNavigate: (route: ActiveRoute) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeView({
  playlists,
  likedTracks,
  currentTrack,
  isPlaying,
  isLoadingDiscover,
  discoverError,
  likedIds,
  customPlaylists,
  onRetryDiscover,
  onPlayTrack,
  onPlayPlaylist,
  onToggleLike,
  onAddToQueue,
  onAddToPlaylist,
  onNavigate,
}: HomeViewProps) {
  const [activeGenre, setActiveGenre] = useState<string>('all');

  const curatedPlaylists = useMemo(
    () => playlists.filter((p) => !p.isCustom),
    [playlists]
  );

  const featuredMix = curatedPlaylists[0];

  const filteredTracks = useMemo(() => {
    if (activeGenre === 'all') {
      const merged: Track[] = [];
      const seen = new Set<string>();
      for (const pl of curatedPlaylists) {
        for (const t of pl.tracks.slice(0, 4)) {
          if (!seen.has(t.id)) {
            seen.add(t.id);
            merged.push(t);
          }
        }
      }
      return merged;
    }

    const matched = curatedPlaylists.find((p) => p.categoryKey === activeGenre);
    return matched ? matched.tracks : [];
  }, [activeGenre, curatedPlaylists]);

  const greeting = getGreeting();

  return (
    <div className="space-y-10 pb-8">
      {/* Hero Spotlight Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#121216]">
        <div className="relative h-[260px] w-full sm:h-[300px]">
          <img
            src={HERO_BANNER_IMAGE}
            alt="Live concert stage spotlight"
            className="h-full w-full object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/65 to-black/25"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <p className="text-xs font-medium text-[#1ED760] tracking-wide">
              Featured Edition · Curated Daily
            </p>
            <h1 className="mt-1.5 max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
              {greeting}. Every song, ready to play.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#D4D4D8] sm:text-base">
              Stream Bollywood chartbusters, Punjabi anthems, midnight lo-fi, and global hits with instant worldwide search.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!featuredMix || featuredMix.tracks.length === 0}
                onClick={() => featuredMix && onPlayPlaylist(featuredMix.tracks, false)}
                className="inline-flex items-center gap-2 rounded-full bg-[#1ED760] px-6 py-2.5 text-sm font-semibold text-[#050507] transition-transform hover:scale-[1.02] hover:bg-[#1FDF64] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <Play size={16} fill="currentColor" />
                <span>Play Top Mix</span>
              </button>
              <button
                type="button"
                disabled={filteredTracks.length === 0}
                onClick={() => onPlayPlaylist(filteredTracks, true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-xs transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <Shuffle size={15} />
                <span>Shuffle All</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Picks 6-Tile Grid */}
      <section aria-labelledby="quick-picks-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="quick-picks-heading" className="font-display text-xl font-bold text-[#F5F5F7]">
            Jump back in
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {/* Liked Songs Quick Tile */}
          <div
            onClick={() => onNavigate({ view: 'liked' })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate({ view: 'liked' })}
            className="group flex cursor-pointer items-center justify-between overflow-hidden rounded-lg border border-white/[0.06] bg-[#141419] pr-3 transition-colors hover:bg-[#1C1C23] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760]"
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-gradient-to-br from-[#1ED760]/85 to-[#0C5E2A] text-white">
                <Heart size={22} fill="currentColor" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#F5F5F7]">Liked Songs</p>
                <p className="truncate text-xs text-[#A1A1AA] font-mono-tabular">
                  {likedTracks.length} {likedTracks.length === 1 ? 'track' : 'tracks'}
                </p>
              </div>
            </div>
            {likedTracks.length > 0 && (
              <button
                type="button"
                aria-label="Play Liked Songs"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPlaylist(likedTracks, false);
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1ED760] text-[#050507] opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 hover:scale-105"
              >
                <Play size={16} fill="currentColor" className="ml-0.5" />
              </button>
            )}
          </div>

          {curatedPlaylists.slice(0, 5).map((pl) => {
            const isPlPlaying =
              isPlaying &&
              currentTrack !== null &&
              pl.tracks.some((t) => t.id === currentTrack.id);

            return (
              <div
                key={pl.id}
                onClick={() => onNavigate({ view: 'playlist', playlistId: pl.id })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' && onNavigate({ view: 'playlist', playlistId: pl.id })
                }
                className="group flex cursor-pointer items-center justify-between overflow-hidden rounded-lg border border-white/[0.06] bg-[#141419] pr-3 transition-colors hover:bg-[#1C1C23] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760]"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <CoverImage
                    src={pl.coverUrl}
                    alt={pl.title}
                    className="h-16 w-16 shrink-0"
                    iconSize={20}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#F5F5F7]">{pl.title}</p>
                    <p className="truncate text-xs text-[#A1A1AA]">
                      {pl.tracks.length > 0 ? `${pl.tracks.length} tracks` : 'Loading mix'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={pl.tracks.length === 0}
                  aria-label={isPlPlaying ? `Pause ${pl.title}` : `Play ${pl.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPlPlaying && currentTrack) {
                      onPlayTrack(currentTrack, pl.tracks);
                    } else {
                      onPlayPlaylist(pl.tracks, false);
                    }
                  }}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1ED760] text-[#050507] shadow-lg transition-all duration-150 hover:scale-105 disabled:opacity-0 ${
                    isPlPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {isPlPlaying ? (
                    <Pause size={16} fill="currentColor" />
                  ) : (
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Curated Editorial Playlists */}
      <section aria-labelledby="made-for-you-heading">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id="made-for-you-heading" className="font-display text-xl font-bold text-[#F5F5F7]">
              Made for your mood
            </h2>
            <p className="text-xs text-[#A1A1AA]">Handpicked collections across Hindi, Punjabi, Lo-Fi, and Global Pop</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {curatedPlaylists.map((pl) => {
            const firstCover = pl.coverUrl || pl.tracks[0]?.artworkUrl;
            return (
              <div
                key={pl.id}
                onClick={() => onNavigate({ view: 'playlist', playlistId: pl.id })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' && onNavigate({ view: 'playlist', playlistId: pl.id })
                }
                className="group cursor-pointer rounded-xl border border-white/[0.06] bg-[#121216] p-3.5 transition-colors hover:bg-[#191920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760]"
              >
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg">
                  <CoverImage src={firstCover} alt={pl.title} className="h-full w-full" iconSize={28} />
                  <button
                    type="button"
                    disabled={pl.tracks.length === 0}
                    aria-label={`Play ${pl.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayPlaylist(pl.tracks, false);
                    }}
                    className="absolute right-2.5 bottom-2.5 flex h-11 w-11 translate-y-1 items-center justify-center rounded-full bg-[#1ED760] text-[#050507] opacity-0 shadow-xl transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105 disabled:hidden"
                  >
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  </button>
                </div>
                <h3 className="truncate text-sm font-semibold text-[#F5F5F7]">{pl.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#A1A1AA]">
                  {pl.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trending Songs with Interactive Genre Filter Bar */}
      <section aria-labelledby="trending-tracks-heading">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="trending-tracks-heading" className="font-display text-xl font-bold text-[#F5F5F7]">
              Trending tracks
            </h2>
            <p className="text-xs text-[#A1A1AA]">Click any song to start streaming immediately</p>
          </div>

          <div
            className="flex items-center gap-1 overflow-x-auto rounded-lg bg-[#121216] p-1 border border-white/[0.06]"
            role="tablist"
            aria-label="Filter trending tracks by genre"
          >
            {GENRE_FILTERS.map((genre) => {
              const selected = activeGenre === genre.id;
              return (
                <button
                  key={genre.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveGenre(genre.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    selected
                      ? 'bg-[#1ED760] text-[#050507] font-semibold'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {genre.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Header */}
        <div className="mb-1 hidden grid-cols-[36px_minmax(0,1.6fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[0.06] px-3 py-2 text-xs font-medium text-[#71717A] md:grid">
          <span className="text-center">#</span>
          <span>Title</span>
          <span>Album · Year</span>
          <span className="pr-10 text-right">Duration</span>
        </div>

        {isLoadingDiscover ? (
          <div className="space-y-2 pt-2">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="flex h-14 items-center gap-3 rounded-lg bg-[#121216]/80 px-3 animate-pulse"
              >
                <div className="h-10 w-10 rounded-md bg-white/[0.07]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-48 rounded bg-white/[0.07]" />
                  <div className="h-2.5 w-32 rounded bg-white/[0.05]" />
                </div>
                <div className="h-3 w-10 rounded bg-white/[0.06]" />
              </div>
            ))}
          </div>
        ) : discoverError && filteredTracks.length === 0 ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#121216] p-8 text-center">
            <p className="text-sm font-medium text-[#F5F5F7]">Could not load trending catalog</p>
            <p className="mt-1 text-xs text-[#A1A1AA]">{discoverError}</p>
            <button
              type="button"
              onClick={onRetryDiscover}
              className="mt-4 rounded-full bg-[#1ED760] px-5 py-2 text-xs font-semibold text-[#050507] hover:bg-[#1FDF64]"
            >
              Retry loading
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {filteredTracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                isLiked={likedIds.has(track.id)}
                customPlaylists={customPlaylists}
                onPlay={() => onPlayTrack(track, filteredTracks)}
                onToggleLike={() => onToggleLike(track)}
                onAddToQueue={() => onAddToQueue(track)}
                onAddToPlaylist={(plId) => onAddToPlaylist(plId, track)}
                onSelectArtist={(artist) => onNavigate({ view: 'artist', artistName: artist })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
