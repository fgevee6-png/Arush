export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string;
  previewUrl: string;
  durationMs: number;
  releaseYear: string;
  genre: string;
}

export interface Playlist {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  coverUrl: string;
  categoryKey?: string;
  isCustom?: boolean;
  tracks: Track[];
}

export type RepeatMode = 'off' | 'all' | 'one';

export type ActiveRoute =
  | { view: 'home' }
  | { view: 'search'; query: string }
  | { view: 'liked' }
  | { view: 'playlist'; playlistId: string }
  | { view: 'artist'; artistName: string };
