import type { Playlist } from '../types/music';

export const HERO_BANNER_IMAGE = '/src/assets/images/hero_featured_stage_1795277722911.jpg';

export const COVER_ASSETS = {
  bollywood: '/src/assets/images/cover_bollywood_hits_1795277722627.jpg',
  punjabi: '/src/assets/images/cover_punjabi_beats_1795277722410.jpg',
  lofi: '/src/assets/images/cover_lofi_chill_1795277722116.jpg',
  global: '/src/assets/images/cover_global_pop_1795277722992.jpg',
};

export const INITIAL_CURATED_PLAYLISTS: Playlist[] = [
  {
    id: 'curated-bollywood',
    title: 'Bollywood Top 50',
    subtitle: 'Curated Mix · Hindi & Romantic',
    description: 'Essential Bollywood chartbusters, soulful ballads, and modern film soundtracks.',
    coverUrl: COVER_ASSETS.bollywood,
    categoryKey: 'bollywood',
    tracks: [],
  },
  {
    id: 'curated-punjabi',
    title: 'Punjabi Pulse',
    subtitle: 'Curated Mix · Bass & Bhangra',
    description: 'High-energy Punjabi anthems, late-night drive beats, and chart-topping urban hits.',
    coverUrl: COVER_ASSETS.punjabi,
    categoryKey: 'punjabi',
    tracks: [],
  },
  {
    id: 'curated-global',
    title: 'Global Pop & R&B',
    subtitle: 'Curated Mix · Worldwide Charts',
    description: 'International pop icons, synth-wave grooves, and stadium-ready R&B.',
    coverUrl: COVER_ASSETS.global,
    categoryKey: 'global',
    tracks: [],
  },
  {
    id: 'curated-lofi',
    title: 'Midnight Lo-Fi & Chill',
    subtitle: 'Curated Mix · Focus & Late Night',
    description: 'Warm analog textures, downtempo beats, and rain-soaked study instrumentals.',
    coverUrl: COVER_ASSETS.lofi,
    categoryKey: 'lofi',
    tracks: [],
  },
  {
    id: 'curated-retro90s',
    title: '90s Golden Era',
    subtitle: 'Curated Mix · Classic Nostalgia',
    description: 'Timeless 90s Hindi melodies from Kumar Sanu, Udit Narayan, and Alka Yagnik.',
    coverUrl: COVER_ASSETS.bollywood,
    categoryKey: 'retro90s',
    tracks: [],
  },
  {
    id: 'curated-indie',
    title: 'Indie & Acoustic India',
    subtitle: 'Curated Mix · Singer-Songwriter',
    description: 'Intimate acoustic storytelling and fresh independent voices from across India.',
    coverUrl: COVER_ASSETS.lofi,
    categoryKey: 'indie',
    tracks: [],
  },
];

export const QUICK_SEARCH_SUGGESTIONS = [
  'Arijit Singh',
  'AP Dhillon',
  'Diljit Dosanjh',
  'Shreya Ghoshal',
  'Karan Aujla',
  'Atif Aslam',
  'The Weeknd',
  'KK',
  'Taylor Swift',
  'Sidhu Moose Wala',
  'Anuv Jain',
  '90s Bollywood',
];

export const GENRE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'bollywood', label: 'Bollywood' },
  { id: 'punjabi', label: 'Punjabi' },
  { id: 'global', label: 'Global Pop' },
  { id: 'lofi', label: 'Lo-Fi' },
  { id: 'retro90s', label: '90s Retro' },
  { id: 'indie', label: 'Indie' },
];
