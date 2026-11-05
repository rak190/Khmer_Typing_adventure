export type GraphicsQuality = 'low' | 'balanced' | 'high';

export function getGraphicsQuality(): GraphicsQuality {
  if (typeof window === 'undefined') return 'balanced';
  const requested = new URLSearchParams(window.location.search).get('quality');
  return requested === 'low' || requested === 'high' ? requested : 'balanced';
}
