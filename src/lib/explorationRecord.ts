import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, auth } from './firebase';
import type { ExplorationRecordPayload } from './completionContract';

export const EXPLORATION_STORAGE_KEY = 'khmer_typing_exploration_v1';
export const EXPLORATION_QUEUE_KEY = 'khmer_typing_exploration_queue_v1';
export const EXPLORATION_PROGRESS_EVENT = 'khmer:exploration-progress';

export type ExplorationRecord = {
  version: number;
  checkpointIds: string[];
  fastTravelPointIds: string[];
  collectibleIds: string[];
  lastVisitedRegion: string;
  updatedAt: string;
};

const DEFAULT_RECORD: ExplorationRecord = {
  version: 1,
  checkpointIds: ['hub-center'],
  fastTravelPointIds: ['ft-hub-sanctuary'],
  collectibleIds: [],
  lastVisitedRegion: 'angkor-hub',
  updatedAt: new Date().toISOString(),
};

function readStorageRecord(): ExplorationRecord {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_RECORD };
  }
  try {
    const raw = window.localStorage.getItem(EXPLORATION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_RECORD };
    const parsed = JSON.parse(raw) as Partial<ExplorationRecord>;
    return {
      version: parsed.version ?? 1,
      checkpointIds: Array.isArray(parsed.checkpointIds) ? [...new Set(parsed.checkpointIds)] : ['hub-center'],
      fastTravelPointIds: Array.isArray(parsed.fastTravelPointIds) ? [...new Set(parsed.fastTravelPointIds)] : ['ft-hub-sanctuary'],
      collectibleIds: Array.isArray(parsed.collectibleIds) ? [...new Set(parsed.collectibleIds)] : [],
      lastVisitedRegion: typeof parsed.lastVisitedRegion === 'string' ? parsed.lastVisitedRegion : 'angkor-hub',
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return { ...DEFAULT_RECORD };
  }
}

function writeStorageRecord(record: ExplorationRecord): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(EXPLORATION_STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new CustomEvent(EXPLORATION_PROGRESS_EVENT, { detail: record }));
  } catch (error) {
    console.warn('Failed to save exploration record to localStorage:', error);
  }
}

function enqueueOfflineSync(payload: ExplorationRecordPayload): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(EXPLORATION_QUEUE_KEY);
    const queue: ExplorationRecordPayload[] = raw ? JSON.parse(raw) : [];
    queue.push(payload);
    // Keep max 20 queue entries
    if (queue.length > 20) queue.splice(0, queue.length - 20);
    window.localStorage.setItem(EXPLORATION_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn('Failed to enqueue exploration offline sync:', error);
  }
}

export function getExplorationRecord(): ExplorationRecord {
  return readStorageRecord();
}

export function isCheckpointDiscovered(checkpointId: string): boolean {
  const record = readStorageRecord();
  return record.checkpointIds.includes(checkpointId);
}

export function isFastTravelDiscovered(pointId: string): boolean {
  const record = readStorageRecord();
  return record.fastTravelPointIds.includes(pointId);
}

export function isCollectibleFound(collectibleId: string): boolean {
  const record = readStorageRecord();
  return record.collectibleIds.includes(collectibleId);
}

export async function discoverCheckpoint(checkpointId: string, regionId?: string): Promise<boolean> {
  const record = readStorageRecord();
  if (record.checkpointIds.includes(checkpointId)) return false;

  const nextCheckpoints = [...record.checkpointIds, checkpointId];
  const updated: ExplorationRecord = {
    ...record,
    checkpointIds: nextCheckpoints,
    lastVisitedRegion: regionId ?? record.lastVisitedRegion,
    updatedAt: new Date().toISOString(),
  };
  writeStorageRecord(updated);

  await syncExplorationPayload({
    version: updated.version,
    checkpointIds: [checkpointId],
    fastTravelPointIds: [],
    collectibleIds: [],
    lastVisitedRegion: updated.lastVisitedRegion,
    clientTimestamp: updated.updatedAt,
  });

  return true;
}

export async function discoverFastTravel(pointId: string, regionId?: string): Promise<boolean> {
  const record = readStorageRecord();
  if (record.fastTravelPointIds.includes(pointId)) return false;

  const nextPoints = [...record.fastTravelPointIds, pointId];
  const updated: ExplorationRecord = {
    ...record,
    fastTravelPointIds: nextPoints,
    lastVisitedRegion: regionId ?? record.lastVisitedRegion,
    updatedAt: new Date().toISOString(),
  };
  writeStorageRecord(updated);

  await syncExplorationPayload({
    version: updated.version,
    checkpointIds: [],
    fastTravelPointIds: [pointId],
    collectibleIds: [],
    lastVisitedRegion: updated.lastVisitedRegion,
    clientTimestamp: updated.updatedAt,
  });

  return true;
}

export async function collectWorldItem(collectibleId: string): Promise<boolean> {
  const record = readStorageRecord();
  if (record.collectibleIds.includes(collectibleId)) return false;

  const nextCollectibles = [...record.collectibleIds, collectibleId];
  const updated: ExplorationRecord = {
    ...record,
    collectibleIds: nextCollectibles,
    updatedAt: new Date().toISOString(),
  };
  writeStorageRecord(updated);

  await syncExplorationPayload({
    version: updated.version,
    checkpointIds: [],
    fastTravelPointIds: [],
    collectibleIds: [collectibleId],
    clientTimestamp: updated.updatedAt,
  });

  return true;
}

async function syncExplorationPayload(payload: ExplorationRecordPayload): Promise<void> {
  if (!auth?.currentUser || !app) {
    enqueueOfflineSync(payload);
    return;
  }

  try {
    const functions = getFunctions(app, 'us-central1');
    const saveCallable = httpsCallable<ExplorationRecordPayload, { success: boolean }>(
      functions,
      'saveExplorationRecord',
    );
    await saveCallable(payload);
  } catch (error) {
    console.info('Backend unavailable for exploration sync, queued offline:', error);
    enqueueOfflineSync(payload);
  }
}

export async function flushExplorationQueue(): Promise<void> {
  if (typeof window === 'undefined' || !window.localStorage || !auth?.currentUser || !app) return;
  try {
    const raw = window.localStorage.getItem(EXPLORATION_QUEUE_KEY);
    if (!raw) return;
    const queue: ExplorationRecordPayload[] = JSON.parse(raw);
    if (!queue.length) return;

    const functions = getFunctions(app, 'us-central1');
    const saveCallable = httpsCallable<ExplorationRecordPayload, { success: boolean }>(
      functions,
      'saveExplorationRecord',
    );

    const mergedCheckpoints = [...new Set(queue.flatMap((q) => q.checkpointIds))];
    const mergedFastTravel = [...new Set(queue.flatMap((q) => q.fastTravelPointIds))];
    const mergedCollectibles = [...new Set(queue.flatMap((q) => q.collectibleIds))];

    await saveCallable({
      version: 1,
      checkpointIds: mergedCheckpoints,
      fastTravelPointIds: mergedFastTravel,
      collectibleIds: mergedCollectibles,
      clientTimestamp: new Date().toISOString(),
    });

    window.localStorage.removeItem(EXPLORATION_QUEUE_KEY);
  } catch (error) {
    console.warn('Exploration queue flush deferred:', error);
  }
}
