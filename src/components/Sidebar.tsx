import { Heart, Home, Library, ListMusic, Plus, Search, X } from 'lucide-react';
import type { ActiveRoute, Playlist } from '../types/music';
import { CoverImage } from './CoverImage';

interface SidebarProps {
  route: ActiveRoute;
  playlists: Playlist[];
  likedCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onNavigate: (route: ActiveRoute) => void;
  onOpenCreatePlaylist: () => void;
}

export function Sidebar({
  route,
  playlists,
  likedCount,
  mobileOpen,
  onCloseMobile,
  onNavigate,
  onOpenCreatePlaylist,
}: SidebarProps) {
  const isHome = route.view === 'home';
  const isSearch = route.view === 'search';
  const isLiked = route.view === 'liked';

  const handleSelect = (nextRoute: ActiveRoute) => {
    onNavigate(nextRoute);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0B0B0E] transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Primary navigation"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <button
            type="button"
            onClick={() => handleSelect({ view: 'home' })}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760] rounded-lg"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1ED760] text-[#050507]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 10c4.5-2 11.5-1.5 16 1" />
                <path d="M5.5 14c3.8-1.5 9.5-1.2 13 .8" />
                <path d="M7 18c2.8-1 7-.8 9.8.6" />
              </svg>
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-[#F5F5F7] whitespace-nowrap">
              Swarify
            </span>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#A1A1AA] hover:bg-white/[0.06] hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="px-3 space-y-1">
          <button
            type="button"
            onClick={() => handleSelect({ view: 'home' })}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              isHome
                ? 'bg-white/[0.08] text-white'
                : 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Home size={19} className={isHome ? 'text-[#1ED760]' : ''} />
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect({ view: 'search', query: '' })}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
              isSearch
                ? 'bg-white/[0.08] text-white'
                : 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Search size={19} className={isSearch ? 'text-[#1ED760]' : ''} />
            <span>Search</span>
          </button>
        </nav>

        {/* Divider */}
        <div className="mx-5 my-4 border-t border-white/[0.06]" />

        {/* Library Section */}
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-4">
          <div className="flex items-center justify-between px-2 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#A1A1AA]">
              <Library size={15} />
              <span>Your Library</span>
            </div>
            <button
              type="button"
              onClick={onOpenCreatePlaylist}
              title="Create playlist"
              aria-label="Create playlist"
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#A1A1AA] transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1ED760]"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {/* Liked Songs pinned tile */}
            <button
              type="button"
              onClick={() => handleSelect({ view: 'liked' })}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                isLiked ? 'bg-white/[0.09]' : 'hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#1ED760]/80 to-[#0C5E2A] text-white">
                <Heart size={18} fill="currentColor" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${isLiked ? 'text-[#1ED760]' : 'text-[#F5F5F7]'}`}>
                  Liked Songs
                </p>
                <p className="truncate text-xs text-[#A1A1AA] font-mono-tabular">
                  {likedCount} {likedCount === 1 ? 'song' : 'songs'}
                </p>
              </div>
            </button>

            {/* Curated + Custom Playlists */}
            {playlists.map((pl) => {
              const active = route.view === 'playlist' && route.playlistId === pl.id;
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => handleSelect({ view: 'playlist', playlistId: pl.id })}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                    active ? 'bg-white/[0.09]' : 'hover:bg-white/[0.05]'
                  }`}
                >
                  {pl.coverUrl ? (
                    <CoverImage
                      src={pl.coverUrl}
                      alt={pl.title}
                      className="h-11 w-11 shrink-0 rounded-md"
                      iconSize={16}
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#18181D] text-[#A1A1AA]">
                      <ListMusic size={18} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${active ? 'text-[#1ED760]' : 'text-[#F5F5F7]'}`}>
                      {pl.title}
                    </p>
                    <p className="truncate text-xs text-[#A1A1AA]">
                      {pl.isCustom ? 'Custom playlist' : 'Playlist'} · {pl.tracks.length} songs
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
