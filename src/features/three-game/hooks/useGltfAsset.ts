import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

export function loadCachedGltf(url: string): Promise<THREE.Group | null> {
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
      () => {
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
  const [template, setTemplate] = useState<THREE.Group | null>(() => gltfCache.get(url) ?? null);

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
    const cloned = template.clone(true);
    enableShadows(cloned);
    return cloned;
  }, [template]);
}
