import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const gltfCache = new Map<string, THREE.Group>();
const gltfPending = new Map<string, Promise<THREE.Group | null>>();
const sharedLoader = new GLTFLoader();

function enableShadows(root: THREE.Object3D) {
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

export function resolveModelUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = import.meta.env.BASE_URL ?? '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  return `${cleanBase}${cleanPath}`;
}

export function loadCachedGltf(rawUrl: string): Promise<THREE.Group | null> {
  const url = resolveModelUrl(rawUrl);
  const cached = gltfCache.get(url);
  if (cached) {
    return Promise.resolve(cached);
  }
  const existing = gltfPending.get(url);
  if (existing) {
    return existing;
  }

  const promise = new Promise<THREE.Group | null>((resolve) => {
    sharedLoader.load(
      url,
      (gltf) => {
        enableShadows(gltf.scene);
        gltfCache.set(url, gltf.scene);
        gltfPending.delete(url);
        resolve(gltf.scene);
      },
      undefined,
      (err) => {
        console.warn(`[useGltfAsset] Failed to load GLB: ${url}`, err);
        gltfPending.delete(url);
        resolve(null);
      }
    );
  });

  gltfPending.set(url, promise);
  return promise;
}

/**
 * Loads a GLB asset with in-memory caching and returns a cloned THREE.Group
 * so multiple instances can be placed in the scene safely without blocking Suspense.
 */
export function useGltfClone(url: string): THREE.Group | null {
  const resolvedUrl = useMemo(() => resolveModelUrl(url), [url]);
  const [template, setTemplate] = useState<THREE.Group | null>(() => gltfCache.get(resolvedUrl) ?? null);

  useEffect(() => {
    let active = true;
    loadCachedGltf(url).then((scene) => {
      if (active && scene) {
        setTemplate(scene);
      }
    });
    return () => {
      active = false;
    };
  }, [url]);

  return useMemo(() => {
    if (!template) return null;
    const cloned = SkeletonUtils.clone(template) as THREE.Group;
    enableShadows(cloned);
    return cloned;
  }, [template]);
}
