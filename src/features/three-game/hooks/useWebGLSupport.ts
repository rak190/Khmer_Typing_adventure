import { useState } from 'react';

export type WebGLSupportStatus = {
  isSupported: boolean;
  version: 'webgl2' | 'webgl' | null;
  errorMessage?: string;
};

export function checkWebGLSupport(): WebGLSupportStatus {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { isSupported: false, version: null, errorMessage: 'Browser environment unavailable.' };
  }

  try {
    const canvas = document.createElement('canvas');

    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      return { isSupported: true, version: 'webgl2' };
    }

    const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl1) {
      return { isSupported: true, version: 'webgl' };
    }

    return {
      isSupported: false,
      version: null,
      errorMessage: 'WebGL is not supported or is disabled in your browser settings.',
    };
  } catch (error) {
    return {
      isSupported: false,
      version: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to initialize WebGL context.',
    };
  }
}

export function useWebGLSupport() {
  const [support] = useState<WebGLSupportStatus>(() => checkWebGLSupport());
  return support;
}
