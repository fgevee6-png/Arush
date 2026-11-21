import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ListMusic, Menu, Search, X } from 'lucide-react';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { HomeView } from './components/HomeView';
import { PlayerBar } from './components/PlayerBar';
import { PlaylistView } from './components/PlaylistView';
import { QueuePanel } from './components/QueuePanel';
import { Sidebar } from './components/Sidebar';
import { SearchView } from './components/SearchView';
import { INITIAL_CURATED_PLAYLISTS } from './data/curatedPlaylists';
import type { ActiveRoute, Playlist, RepeatMode, Track } from './types/music';

const STORAGE_LIKED = 'swarify_liked_tracks_v1';
const STORAGE_CUSTOM_PLAYLISTS = 'swarify_custom_playlists_v1';
const STORAGE_VOLUME = 'swarify_volume_v1';

function loadStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  // Navigation history stack
  const [history, setHistory] = useState<ActiveRoute[]>([{ view: 'home' }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const currentRoute = history[historyIndex] ?? { view: 'home' };

  // Sidebar & modal states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Catalog & search state
  const [curatedPlaylists, setCuratedPlaylists] = useState<Playlist[]>(INITIAL_CURATED_PLAYLISTS);
  const [isLoadingDiscover, setIsLoadingDiscover] = useState(true);
  const [discoverError, setDiscoverError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Artist view state
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [isLoadingArtist, setIsLoadingArtist] = useState(false);

  // User library state (persisted)
  const [likedTracks, setLikedTracks] = useState<Track[]>(() =>
    loadStoredJson<Track[]>(STORAGE_LIKED, [])
  );
  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>(() =>
    loadStoredJson<Playlist[]>(STORAGE_CUSTOM_PLAYLISTS, [])
  );

  // Playback engine state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [volume, setVolume] = useState<number>(() => {
    const saved = loadStoredJson<number>(STORAGE_VOLUME, 0.8);
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);

  // Subtle toast notification
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 2400);
  }, []);

  // Persist user data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LIKED, JSON.stringify(likedTracks));
    } catch {
      // ignore quota errors
    }
  }, [likedTracks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOM_PLAYLISTS, JSON.stringify(customPlaylists));
    } catch {
      // ignore quota errors
    }
  }, [customPlaylists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VOLUME, JSON.stringify(volume));
    } catch {
      // ignore
    }
  }, [volume]);

  const likedIds = useMemo(() => new Set(likedTracks.map((t) => t.id)), [likedTracks]);
  const allPlaylists = useMemo(
    () => [...customPlaylists, ...curatedPlaylists],
    [customPlaylists, curatedPlaylists]
  );

  // Navigation helpers
  const navigate = useCallback(
    (nextRoute: ActiveRoute) => {
      setHistory((prev) => {
        const current = prev[historyIndex];
        if (JSON.stringify(current) === JSON.stringify(nextRoute)) {
          return prev;
        }
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, nextRoute];
      });
      setHistoryIndex((prev) => {
        const current = history[prev];
        if (JSON.stringify(current) === JSON.stringify(nextRoute)) {
          return prev;
        }
        return prev + 1;
      });
      if (nextRoute.view === 'search') {
        setSearchInput(nextRoute.query);
      }
    },
    [history, historyIndex]
  );

  const goBack = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      const target = history[nextIdx];
      if (target?.view === 'search') setSearchInput(target.query);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const target = history[nextIdx];
      if (target?.view === 'search') setSearchInput(target.query);
    }
  };

  // Load curated discover collections on mount
  const fetchDiscover = useCallback(async () => {
    setIsLoadingDiscover(true);
    setDiscoverError(null);
    try {
      const res = await fetch('/api/music/discover');
      if (!res.ok) throw new Error('Unable to load music catalog');
      const data = (await res.json()) as { collections?: Record<string, Track[]> };
      const collections = data.collections || {};
      setCuratedPlaylists(
        INITIAL_CURATED_PLAYLISTS.map((pl) => ({
          ...pl,
          tracks: pl.categoryKey ? collections[pl.categoryKey] || [] : [],
        }))
      );
    } catch (err) {
      setDiscoverError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoadingDiscover(false);
    }
  }, []);

  useEffect(() => {
    void fetchDiscover();
  }, [fetchDiscover]);

  // Execute live global search when on search route with query
  const runSearch = useCallback(async (query: string) => {
    const clean = query.trim();
    if (!clean) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(clean)}&limit=30`);
      if (!res.ok) throw new Error('Search request failed');
      const data = (await res.json()) as { tracks?: Track[] };
      setSearchResults(data.tracks || []);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (currentRoute.view !== 'search') return;
    const handle = window.setTimeout(() => {
      void runSearch(currentRoute.query);
    }, 280);
    return () => window.clearTimeout(handle);
  }, [currentRoute, runSearch]);

  // Fetch artist top tracks when viewing artist route
  useEffect(() => {
    if (currentRoute.view !== 'artist') return;
    let cancelled = false;
    setIsLoadingArtist(true);
    setArtistTracks([]);

    fetch(`/api/music/search?q=${encodeURIComponent(currentRoute.artistName)}&limit=25`)
      .then((res) => res.json())
      .then((data: { tracks?: Track[] }) => {
        if (!cancelled) {
          setArtistTracks(data.tracks || []);
        }
      })
      .catch(() => {
        if (!cancelled) setArtistTracks([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingArtist(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentRoute]);

  // Playback core functions
  const startTrackPlayback = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsBuffering(true);
    audio.src = track.previewUrl;
    audio.load();
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
      })
      .catch(() => {
        setIsPlaying(false);
        setIsBuffering(false);
      });
  }, []);

  const handlePlayTrack = useCallback(
    (track: Track, contextTracks: Track[]) => {
      const audio = audioRef.current;
      if (currentTrack?.id === track.id && audio) {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
        return;
      }

      if (contextTracks.length > 0) {
        setQueue(contextTracks);
      } else if (!queue.some((t) => t.id === track.id)) {
        setQueue((prev) => [track, ...prev]);
      }

      startTrackPlayback(track);
    },
    [currentTrack, isPlaying, queue, startTrackPlayback]
  );

  const handlePlayPlaylist = useCallback(
    (tracks: Track[], useShuffle = false) => {
      if (tracks.length === 0) return;
      const ordered = useShuffle
        ? [...tracks].sort(() => Math.random() - 0.5)
        : tracks;
      setShuffle(useShuffle);
      setQueue(ordered);
      startTrackPlayback(ordered[0]);
    },
    [startTrackPlayback]
  );

  const handleTogglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentTrack, isPlaying]);

  const handleNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;

    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play();
      }
      return;
    }

    if (shuffle && queue.length > 1) {
      const candidates = queue.filter((t) => t.id !== currentTrack.id);
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      if (next) startTrackPlayback(next);
      return;
    }

    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    if (idx >= 0 && idx < queue.length - 1) {
      startTrackPlayback(queue[idx + 1]);
    } else if (repeatMode === 'all' && queue.length > 0) {
      startTrackPlayback(queue[0]);
    } else {
      setIsPlaying(false);
    }
  }, [currentTrack, queue, repeatMode, shuffle, startTrackPlayback]);

  const handlePrev = useCallback(() => {
    const audio = audioRef.current;
    if (!currentTrack) return;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    if (idx > 0) {
      startTrackPlayback(queue[idx - 1]);
    } else if (queue.length > 0) {
      startTrackPlayback(queue[queue.length - 1]);
    }
  }, [currentTrack, queue, startTrackPlayback]);

  // Keep audio element volume in sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Global keyboard shortcut: Space to toggle play/pause when not typing
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }
      if (e.code === 'Space' && currentTrack) {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentTrack, handleTogglePlay]);

  // Library actions
  const handleToggleLike = useCallback(
    (track: Track) => {
      setLikedTracks((prev) => {
        const exists = prev.some((t) => t.id === track.id);
        if (exists) {
          showToast('Removed from Liked Songs');
          return prev.filter((t) => t.id !== track.id);
        }
        showToast('Saved to Liked Songs');
        return [track, ...prev];
      });
    },
    [showToast]
  );

  const handleAddToQueue = useCallback(
    (track: Track) => {
      setQueue((prev) => [...prev, track]);
      showToast(`Added "${track.title}" to queue`);
    },
    [showToast]
  );

  const handleCreatePlaylist = (title: string, description: string) => {
    const created: Playlist = {
      id: `custom_${Date.now()}`,
      title,
      subtitle: 'Custom Playlist',
      description,
      coverUrl: '',
      isCustom: true,
      tracks: [],
    };
    setCustomPlaylists((prev) => [created, ...prev]);
    navigate({ view: 'playlist', playlistId: created.id });
    showToast(`Created playlist "${title}"`);
  };

  const handleAddToPlaylist = (playlistId: string, track: Track) => {
    let playlistTitle = '';
    setCustomPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        playlistTitle = pl.title;
        if (pl.tracks.some((t) => t.id === track.id)) return pl;
        return {
          ...pl,
          coverUrl: pl.coverUrl || track.artworkUrl,
          tracks: [...pl.tracks, track],
        };
      })
    );
    showToast(playlistTitle ? `Added to "${playlistTitle}"` : 'Added to playlist');
  };

  const handleRemoveFromCustomPlaylist = (playlistId: string, trackId: string) => {
    setCustomPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        const remaining = pl.tracks.filter((t) => t.id !== trackId);
        return {
          ...pl,
          tracks: remaining,
        };
      })
    );
    showToast('Removed from playlist');
  };

  const handleDeleteCustomPlaylist = (playlistId: string) => {
    setCustomPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
    navigate({ view: 'home' });
    showToast('Playlist deleted');
  };

  const handleSearchInputChange = (val: string) => {
    setSearchInput(val);
    navigate({ view: 'search', query: val });
  };

  const activePlaylist =
    currentRoute.view === 'playlist'
      ? allPlaylists.find((p) => p.id === currentRoute.playlistId) || null
      : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#050507] text-[#F5F5F7]">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onEnded={handleNext}
        onError={() => {
          setIsBuffering(false);
          setIsPlaying(false);
          showToast('Audio stream unavailable for this track');
        }}
      />

      {/* Main Middle Workspace: Sidebar + Content + Optional Queue */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          route={currentRoute}
          playlists={allPlaylists}
          likedCount={likedTracks.length}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onNavigate={navigate}
          onOpenCreatePlaylist={() => setCreateModalOpen(true)}
        />

        {/* Scrollable Content Viewport */}
        <main className="relative flex min-w-0 flex-1 flex-col bg-[#0A0A0C]">
          {/* Clean Top Bar */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-[#0A0A0C]/90 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#141419] text-[#D4D4D8] hover:text-white lg:hidden"
              >
                <Menu size={18} />
              </button>

              <div className="hidden items-center gap-1.5 sm:flex shrink-0">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={historyIndex <= 0}
                  aria-label="Go back"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#141419] text-[#D4D4D8] transition-colors hover:bg-[#1E1E26] hover:text-white disabled:opacity-35"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={goForward}
                  disabled={historyIndex >= history.length - 1}
                  aria-label="Go forward"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#141419] text-[#D4D4D8] transition-colors hover:bg-[#1E1E26] hover:text-white disabled:opacity-35"
                >
                  <ChevronRight size={17} />
                </button>
              </div>

              {/* Integrated Global Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#A1A1AA]"
                />
                <input
                  type="search"
                  value={searchInput}
                  onFocus={() => {
                    if (currentRoute.view !== 'search') {
                      navigate({ view: 'search', query: searchInput });
                    }
                  }}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  placeholder="Search songs, artists, albums..."
                  aria-label="Search songs, artists, albums"
                  className="h-10 w-full rounded-full border border-white/[0.08] bg-[#141419] pr-9 pl-10 text-sm text-white placeholder-[#71717A] transition-colors focus:border-[#1ED760]/70 focus:bg-[#18181F] focus:outline-none"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => handleSearchInputChange('')}
                    aria-label="Clear search"
                    className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#A1A1AA] hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setQueueOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  queueOpen
                    ? 'border-[#1ED760]/60 bg-[#1ED760]/15 text-[#1ED760]'
                    : 'border-white/[0.08] bg-[#141419] text-[#D4D4D8] hover:text-white'
                }`}
              >
                <ListMusic size={15} />
                <span className="hidden sm:inline">Queue</span>
              </button>
            </div>
          </header>

          {/* Route Body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1280px]">
              {currentRoute.view === 'home' && (
                <HomeView
                  playlists={allPlaylists}
                  likedTracks={likedTracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  isLoadingDiscover={isLoadingDiscover}
                  discoverError={discoverError}
                  likedIds={likedIds}
                  customPlaylists={customPlaylists}
                  onRetryDiscover={fetchDiscover}
                  onPlayTrack={handlePlayTrack}
                  onPlayPlaylist={handlePlayPlaylist}
                  onToggleLike={handleToggleLike}
                  onAddToQueue={handleAddToQueue}
                  onAddToPlaylist={handleAddToPlaylist}
                  onNavigate={navigate}
                />
              )}

              {currentRoute.view === 'search' && (
                <SearchView
                  query={currentRoute.query}
                  results={searchResults}
                  isSearching={isSearching}
                  searchError={searchError}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  likedIds={likedIds}
                  customPlaylists={customPlaylists}
                  onQuickSearch={(term) => handleSearchInputChange(term)}
                  onPlayTrack={handlePlayTrack}
                  onToggleLike={handleToggleLike}
                  onAddToQueue={handleAddToQueue}
                  onAddToPlaylist={handleAddToPlaylist}
                  onNavigate={navigate}
                />
              )}

              {currentRoute.view === 'liked' && (
                <PlaylistView
                  title="Liked Songs"
                  subtitle="Personal Collection"
                  description="All the tracks you have saved with a heart across Bollywood, Punjabi, Lo-Fi, and Global Pop."
                  isLikedView
                  tracks={likedTracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  likedIds={likedIds}
                  customPlaylists={customPlaylists}
                  onPlayTrack={handlePlayTrack}
                  onPlayAll={(shuf) => handlePlayPlaylist(likedTracks, shuf)}
                  onToggleLike={handleToggleLike}
                  onAddToQueue={handleAddToQueue}
                  onAddToPlaylist={handleAddToPlaylist}
                  onNavigate={navigate}
                />
              )}

              {currentRoute.view === 'playlist' && activePlaylist && (
                <PlaylistView
                  title={activePlaylist.title}
                  subtitle={activePlaylist.subtitle}
                  description={activePlaylist.description}
                  coverUrl={activePlaylist.coverUrl}
                  isCustomPlaylist={activePlaylist.isCustom}
                  isLoading={!activePlaylist.isCustom && isLoadingDiscover}
                  tracks={activePlaylist.tracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  likedIds={likedIds}
                  customPlaylists={customPlaylists}
                  onPlayTrack={handlePlayTrack}
                  onPlayAll={(shuf) => handlePlayPlaylist(activePlaylist.tracks, shuf)}
                  onToggleLike={handleToggleLike}
                  onAddToQueue={handleAddToQueue}
                  onAddToPlaylist={handleAddToPlaylist}
                  onRemoveTrackFromCustom={
                    activePlaylist.isCustom
                      ? (trackId) => handleRemoveFromCustomPlaylist(activePlaylist.id, trackId)
                      : undefined
                  }
                  onDeleteCustomPlaylist={
                    activePlaylist.isCustom
                      ? () => handleDeleteCustomPlaylist(activePlaylist.id)
                      : undefined
                  }
                  onNavigate={navigate}
                />
              )}

              {currentRoute.view === 'artist' && (
                <PlaylistView
                  title={currentRoute.artistName}
                  subtitle="Artist Radio"
                  description={`Top streaming tracks and collaborations featuring ${currentRoute.artistName}.`}
                  isLoading={isLoadingArtist}
                  tracks={artistTracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  likedIds={likedIds}
                  customPlaylists={customPlaylists}
                  onPlayTrack={handlePlayTrack}
                  onPlayAll={(shuf) => handlePlayPlaylist(artistTracks, shuf)}
                  onToggleLike={handleToggleLike}
                  onAddToQueue={handleAddToQueue}
                  onAddToPlaylist={handleAddToPlaylist}
                  onNavigate={navigate}
                />
              )}
            </div>
          </div>
        </main>

        <QueuePanel
          open={queueOpen}
          currentTrack={currentTrack}
          queue={queue}
          onClose={() => setQueueOpen(false)}
          onPlayTrack={(track) => startTrackPlayback(track)}
          onRemoveFromQueue={(idx) =>
            setQueue((prev) => prev.filter((_, index) => index !== idx))
          }
          onClearQueue={() => {
            if (currentTrack) {
              setQueue([currentTrack]);
            } else {
              setQueue([]);
            }
          }}
        />
      </div>

      {/* Persistent Bottom Player */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        shuffle={shuffle}
        repeatMode={repeatMode}
        isLiked={currentTrack ? likedIds.has(currentTrack.id) : false}
        queueOpen={queueOpen}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        onSeek={(time) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
          }
        }}
        onVolumeChange={(val) => {
          setVolume(val);
          if (val > 0 && isMuted) setIsMuted(false);
        }}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onToggleShuffle={() => setShuffle((prev) => !prev)}
        onCycleRepeat={() =>
          setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'))
        }
        onToggleLike={() => currentTrack && handleToggleLike(currentTrack)}
        onToggleQueue={() => setQueueOpen((prev) => !prev)}
        onSelectArtist={(artist) => navigate({ view: 'artist', artistName: artist })}
      />

      <CreatePlaylistModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreatePlaylist}
      />

      {/* Ephemeral Action Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[#1ED760] px-5 py-2 text-xs font-semibold text-[#050507] shadow-2xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
