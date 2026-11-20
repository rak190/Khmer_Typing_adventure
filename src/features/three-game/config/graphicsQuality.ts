export type GraphicsQuality = 'low' | 'balanced' | 'high';

export type GraphicsProfile = {
  quality: GraphicsQuality;
  dprMin: number;
  dprMax: number;
  shadows: boolean;
  shadowMapSize: number;
  maxDrawDistance: number;
  streamingChunkRadius: number;
  foliageDensity: number;
  enableBloom: boolean;
  targetFps: number;
};

export const GRAPHICS_PROFILES: Record<GraphicsQuality, GraphicsProfile> = {
  low: {
    quality: 'low',
    dprMin: 1.0,
    dprMax: 1.0,
    shadows: false,
    shadowMapSize: 512,
    maxDrawDistance: 80,
    streamingChunkRadius: 1,
    foliageDensity: 0.35,
    enableBloom: false,
    targetFps: 30,
  },
  balanced: {
    quality: 'balanced',
    dprMin: 1.0,
    dprMax: 1.25,
    shadows: true,
    shadowMapSize: 1024,
    maxDrawDistance: 150,
    streamingChunkRadius: 2,
    foliageDensity: 0.75,
    enableBloom: true,
    targetFps: 60,
  },
  high: {
    quality: 'high',
    dprMin: 1.0,
    dprMax: 1.5,
    shadows: true,
    shadowMapSize: 2048,
    maxDrawDistance: 240,
    streamingChunkRadius: 3,
    foliageDensity: 1.0,
    enableBloom: true,
    targetFps: 60,
  },
};

const STORAGE_KEY = 'khmer_typing_graphics_quality';

export function getGraphicsQuality(): GraphicsQuality {
  if (typeof window === 'undefined') return 'balanced';
  const urlParam = new URLSearchParams(window.location.search).get('quality');
  if (urlParam === 'low' || urlParam === 'balanced' || urlParam === 'high') {
    return urlParam;
  }
  try {
    const saved = window.localStorage?.getItem(STORAGE_KEY) as GraphicsQuality | null;
    if (saved === 'low' || saved === 'balanced' || saved === 'high') {
      return saved;
    }
  } catch {
    /* Ignore storage error */
  }
  return 'balanced';
}

export function setGraphicsQuality(quality: GraphicsQuality): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage?.setItem(STORAGE_KEY, quality);
    window.dispatchEvent(new CustomEvent('khmer:graphics-quality-change', { detail: quality }));
  } catch {
    /* Ignore storage error */
  }
}

export function getActiveGraphicsProfile(): GraphicsProfile {
  return GRAPHICS_PROFILES[getGraphicsQuality()];
}
