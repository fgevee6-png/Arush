import { Play, Search as SearchIcon } from 'lucide-react';
import { QUICK_SEARCH_SUGGESTIONS } from '../data/curatedPlaylists';
import type { ActiveRoute, Playlist, Track } from '../types/music';
import { formatDuration } from '../utils/format';
import { CoverImage } from './CoverImage';
import { TrackRow } from './TrackRow';

interface SearchViewProps {
  query: string;
  results: Track[];
  isSearching: boolean;
  searchError: string | null;
  currentTrack: Track | null;
  isPlaying: boolean;
  likedIds: Set<string>;
  customPlaylists: Playlist[];
  onQuickSearch: (term: string) => void;
  onPlayTrack: (track: Track, contextTracks: Track[]) => void;
  onToggleLike: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist: (playlistId: string, track: Track) => void;
  onNavigate: (route: ActiveRoute) => void;
}

export function SearchView({
  query,
  results,
  isSearching,
  searchError,
  currentTrack,
  isPlaying,
  likedIds,
  customPlaylists,
  onQuickSearch,
  onPlayTrack,
  onToggleLike,
  onAddToQueue,
  onAddToPlaylist,
  onNavigate,
}: SearchViewProps) {
  const trimmed = query.trim();
  const topResult = results[0];

  return (
    <div className="space-y-8 pb-8">
      {/* Quick Search Artists & Moods */}
      <section aria-labelledby="browse-artists-heading">
        <h2 id="browse-artists-heading" className="mb-3 font-display text-lg font-bold text-[#F5F5F7]">
          {trimmed ? 'Try another search' : 'Search any song, artist, or movie'}
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_SEARCH_SUGGESTIONS.map((term) => {
            const active = trimmed.toLowerCase() === term.toLowerCase();
            return (
              <button
                key={term}
                type="button"
                onClick={() => onQuickSearch(term)}
                className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-[#1ED760] bg-[#1ED760] text-[#050507] font-semibold'
                    : 'border-white/[0.08] bg-[#141419] text-[#E4E4E7] hover:bg-[#1E1E26]'
                }`}
              >
                {term}
              </button>
            );
          })}
        </div>
      </section>

      {!trimmed ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#121216] px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-[#1ED760]">
            <SearchIcon size={24} />
          </div>
          <h3 className="mt-4 font-display text-xl font-semibold text-[#F5F5F7]">
            Find any track worldwide
          </h3>
          <p className="mt-1.5 max-w-md text-sm text-[#A1A1AA]">
            Type a Hindi film song, Punjabi banger, English pop hit, or favorite singer in the search bar above, or tap a quick suggestion.
          </p>
        </div>
      ) : isSearching ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-56 rounded-xl bg-[#121216] animate-pulse" />
            <div className="space-y-2 lg:col-span-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-[#121216] animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      ) : searchError ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#121216] p-8 text-center">
          <p className="text-sm font-medium text-[#F5F5F7]">Search temporarily unavailable</p>
          <p className="mt-1 text-xs text-[#A1A1AA]">{searchError}</p>
          <button
            type="button"
            onClick={() => onQuickSearch(trimmed)}
            className="mt-4 rounded-full bg-[#1ED760] px-5 py-2 text-xs font-semibold text-[#050507] hover:bg-[#1FDF64]"
          >
            Try again
          </button>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#121216] p-12 text-center">
          <p className="font-display text-lg font-semibold text-[#F5F5F7]">
            No songs found for &ldquo;{trimmed}&rdquo;
          </p>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Check spelling or try searching by artist or movie name.
          </p>
        </div>
      ) : (
        <>
          {/* Top Result + Top 4 Songs Split */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            {topResult && (
              <section aria-labelledby="top-result-heading">
                <h2 id="top-result-heading" className="mb-3 font-display text-lg font-bold text-[#F5F5F7]">
                  Top result
                </h2>
                <div
                  onClick={() => onPlayTrack(topResult, results)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onPlayTrack(topResult, results)}
                  className="group relative flex h-[236px] cursor-pointer flex-col justify-between rounded-xl border border-white/[0.06] bg-[#14141A] p-5 transition-colors hover:bg-[#1B1B23] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760]"
                >
                  <CoverImage
                    src={topResult.artworkUrl}
                    alt={topResult.title}
                    className="h-24 w-24 rounded-lg shadow-xl"
                    iconSize={28}
                  />
                  <div className="min-w-0 pr-14">
                    <h3 className="truncate font-display text-2xl font-bold text-white">
                      {topResult.title}
                    </h3>
                    <p className="mt-1 truncate text-xs text-[#A1A1AA]">
                      Song ·{' '}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate({ view: 'artist', artistName: topResult.artist });
                        }}
                        className="font-medium text-white hover:underline"
                      >
                        {topResult.artist}
                      </span>{' '}
                      · {topResult.releaseYear}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Play ${topResult.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayTrack(topResult, results);
                    }}
                    className="absolute right-5 bottom-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#1ED760] text-[#050507] shadow-xl transition-transform hover:scale-105"
                  >
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  </button>
                </div>
              </section>
            )}

            <section aria-labelledby="top-songs-heading">
              <h2 id="top-songs-heading" className="mb-3 font-display text-lg font-bold text-[#F5F5F7]">
                Songs
              </h2>
              <div className="space-y-1">
                {results.slice(0, 4).map((track) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => onPlayTrack(track, results)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && onPlayTrack(track, results)}
                      className={`group flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors ${
                        isCurrent ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md">
                          <CoverImage src={track.artworkUrl} alt={track.title} className="h-11 w-11" iconSize={16} />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <Play size={15} fill="currentColor" className="text-white" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-medium ${isCurrent ? 'text-[#1ED760]' : 'text-[#F5F5F7]'}`}>
                            {track.title}
                          </p>
                          <p className="truncate text-xs text-[#A1A1AA]">{track.artist}</p>
                        </div>
                      </div>
                      <span className="text-xs text-[#71717A] font-mono-tabular shrink-0">
                        {formatDuration(track.durationMs)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Full Results Table */}
          <section aria-labelledby="all-results-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="all-results-heading" className="font-display text-lg font-bold text-[#F5F5F7]">
                All results for &ldquo;{trimmed}&rdquo;
              </h2>
              <span className="text-xs text-[#71717A] font-mono-tabular">{results.length} tracks</span>
            </div>

            <div className="divide-y divide-white/[0.03]">
              {results.map((track, idx) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={idx}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  isLiked={likedIds.has(track.id)}
                  customPlaylists={customPlaylists}
                  onPlay={() => onPlayTrack(track, results)}
                  onToggleLike={() => onToggleLike(track)}
                  onAddToQueue={() => onAddToQueue(track)}
                  onAddToPlaylist={(plId) => onAddToPlaylist(plId, track)}
                  onSelectArtist={(artist) => onNavigate({ view: 'artist', artistName: artist })}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
