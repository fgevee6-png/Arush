import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface ITunesResultItem {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  releaseDate?: string;
  primaryGenreName?: string;
}

interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesResultItem[];
}

export interface NormalizedTrack {
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

interface CacheEntry<T> {
  expiresAt: number;
  data: T;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const searchCache = new Map<string, CacheEntry<NormalizedTrack[]>>();
const SEARCH_TTL_MS = 30 * 60 * 1000;
const DISCOVER_TTL_MS = 60 * 60 * 1000;

let discoverCache: CacheEntry<Record<string, NormalizedTrack[]>> | null = null;

function normalizeITunesTrack(item: ITunesResultItem, fallbackGenre?: string): NormalizedTrack | null {
  if (!item.trackId || !item.trackName || !item.artistName || !item.previewUrl) {
    return null;
  }

  const rawArtwork = item.artworkUrl100 ?? '';
  const artworkUrl = rawArtwork
    ? rawArtwork.replace(/\/\d+x\d+bb\./, '/600x600bb.')
    : '';

  const yearMatch = item.releaseDate ? item.releaseDate.slice(0, 4) : '';

  return {
    id: `itunes_${item.trackId}`,
    title: item.trackName.trim(),
    artist: item.artistName.trim(),
    album: (item.collectionName || 'Single').trim(),
    artworkUrl,
    previewUrl: item.previewUrl,
    durationMs: item.trackTimeMillis && item.trackTimeMillis > 0 ? item.trackTimeMillis : 30000,
    releaseYear: yearMatch || '2024',
    genre: fallbackGenre || item.primaryGenreName || 'Music',
  };
}

async function fetchITunesTracks(
  query: string,
  limit = 25,
  country = 'IN',
  fallbackGenre?: string
): Promise<NormalizedTrack[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const cacheKey = `${country}:${limit}:${cleanQuery.toLowerCase()}`;
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    cleanQuery
  )}&media=music&entity=song&country=${encodeURIComponent(country)}&limit=${limit}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SwarifyMusicPlayer/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`iTunes API responded with ${response.status}`);
    }

    const payload = (await response.json()) as ITunesSearchResponse;
    const seenIds = new Set<string>();
    const tracks: NormalizedTrack[] = [];

    for (const item of payload.results || []) {
      const track = normalizeITunesTrack(item, fallbackGenre);
      if (track && !seenIds.has(track.id)) {
        seenIds.add(track.id);
        tracks.push(track);
      }
    }

    searchCache.set(cacheKey, {
      expiresAt: Date.now() + SEARCH_TTL_MS,
      data: tracks,
    });

    return tracks;
  } finally {
    clearTimeout(timer);
  }
}

async function getDiscoverCollections(): Promise<Record<string, NormalizedTrack[]>> {
  if (discoverCache && discoverCache.expiresAt > Date.now()) {
    return discoverCache.data;
  }

  const queries: Array<{ key: string; term: string; country: string; genre: string; limit: number }> = [
    { key: 'bollywood', term: 'Arijit Singh Pritam Hindi', country: 'IN', genre: 'Bollywood', limit: 16 },
    { key: 'punjabi', term: 'Diljit Dosanjh Karan Aujla AP Dhillon', country: 'IN', genre: 'Punjabi', limit: 16 },
    { key: 'global', term: 'The Weeknd Dua Lipa Sabrina Carpenter', country: 'US', genre: 'Global Pop', limit: 16 },
    { key: 'lofi', term: 'Lofi Beats Chillhop Instrumental', country: 'US', genre: 'Lo-Fi', limit: 14 },
    { key: 'retro90s', term: 'Kumar Sanu Udit Narayan 90s Hindi', country: 'IN', genre: '90s Retro', limit: 14 },
    { key: 'indie', term: 'Anuv Jain Prateek Kuhad Indie India', country: 'IN', genre: 'Indie', limit: 14 },
  ];

  const settled = await Promise.allSettled(
    queries.map(async (q) => ({
      key: q.key,
      tracks: await fetchITunesTracks(q.term, q.limit, q.country, q.genre),
    }))
  );

  const result: Record<string, NormalizedTrack[]> = {};
  for (const item of settled) {
    if (item.status === 'fulfilled') {
      result[item.value.key] = item.value.tracks;
    }
  }

  if (Object.values(result).some((list) => list.length > 0)) {
    discoverCache = {
      expiresAt: Date.now() + DISCOVER_TTL_MS,
      data: result,
    };
  }

  return result;
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get('/api/music/search', async (req: Request, res: Response) => {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const country = typeof req.query.country === 'string' && req.query.country.length === 2
      ? req.query.country.toUpperCase()
      : 'IN';
    const rawLimit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 28;
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 28;

    if (!q) {
      res.status(400).json({ error: 'Search query is required', tracks: [] });
      return;
    }

    try {
      let tracks = await fetchITunesTracks(q, limit, country);
      if (tracks.length < 5 && country !== 'US') {
        const usTracks = await fetchITunesTracks(q, limit, 'US');
        const existing = new Set(tracks.map((t) => t.id));
        for (const t of usTracks) {
          if (!existing.has(t.id)) {
            tracks.push(t);
          }
        }
      }
      res.json({ tracks });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      res.status(502).json({ error: message, tracks: [] });
    }
  });

  app.get('/api/music/discover', async (_req: Request, res: Response) => {
    try {
      const collections = await getDiscoverCollections();
      res.json({ collections });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Discover fetch failed';
      res.status(502).json({ error: message, collections: {} });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build not found');
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Swarify server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
