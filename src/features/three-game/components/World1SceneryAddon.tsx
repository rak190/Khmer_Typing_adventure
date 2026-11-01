import { useGltfClone } from '../hooks/useGltfAsset';

/**
 * Static decorative scenery for Khmer Typing Adventure World 1.
 * This does NOT replace Environment, animated gates, player, or hitboxes.
 * The asset's local origin matches the scene root (+Y up, world Z forward).
 * Use 'lite' as the default for ordinary Cambodian school PCs.
 */
export default function World1SceneryAddon({ quality = 'lite' }: {
  quality?: 'lite' | 'full';
}) {
  const path = quality === 'full'
    ? '/models/environments/world1_scenery_addon.glb'
    : '/models/environments/world1_scenery_addon_LITE.glb';
  const model = useGltfClone(path);
  return model ? <primitive object={model} /> : null;
}
