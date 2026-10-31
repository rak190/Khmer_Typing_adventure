import { getCurriculumLevel, lessonCurriculum } from '../data/lessonCurriculum';
import { foundationHomeRowLesson } from '../data/touchTypingFoundations';
import { getStructuredLesson, getStructuredLessonByRoute } from '../data/typingProgression';
import { getLessonMinimumAccuracy } from './typingMetrics';
import type { FoundationPracticeSummary } from '../data/touchTypingFoundations';

export const CURRICULUM_VERSION = 'khmer-first-5.5-v1';
export type AttemptMetrics = { accuracy: number; cpm: number; score: number; stars: number; mistakes: number; backspaces: number; elapsedSeconds: number; passed: boolean };
export type LessonAttempt = {
  attemptId: string;
  lessonId: string;
  version: string;
  mode: '2d' | '3d' | 'foundation';
  category: 'physical-key' | 'unicode-output' | 'mixed';
  completedAt: string;
  metrics: AttemptMetrics;
  stages: Array<{ id: string; accuracy: number; completed: boolean }>;
  foundation?: FoundationPracticeSummary;
  weakKeys?: Array<{ value: string; mistakes: number; backspaces: number; category: string }>;
};

/** Map aliases explicitly: structured IDs are historical, sometimes many-to-one. */
export function resolveLessonIdentity(id: string) {
  if (id === 'foundation-home-row') return { id, worldId: 0, levelId: 1 as const, lesson: foundationHomeRowLesson, legacyId: id };
  const legacy = getStructuredLesson(id);
  const route = legacy ? `${legacy.routeWorldId}:${legacy.routeLessonId}` : id;
  const match = /^(\d+):(\d+|boss)$/.exec(route);
  if (!match) throw new Error('Unsupported lesson identity');
  const worldId = Number(match[1]);
  const levelId = match[2] === 'boss' ? 'boss' as const : Number(match[2]);
  const lesson = getCurriculumLevel(worldId, levelId);
  if (!lesson) throw new Error('Unknown curriculum lesson');
  return { id: route, worldId, levelId, lesson, legacyId: getStructuredLessonByRoute(worldId, levelId)?.lessonId ?? route };
}

export function predecessorIds(id: string) {
  const sequence = lessonCurriculum.flatMap(w => w.levels.map(l => `${w.id}:${l.id}`));
  return sequence.slice(0, sequence.indexOf(id));
}

export function validateLessonAttempt(input: LessonAttempt) {
  if (!input || typeof input !== 'object' || JSON.stringify(input).length > 32000 || Object.keys(input).some(k => !['attemptId','lessonId','version','mode','category','completedAt','metrics','stages','foundation','weakKeys'].includes(k))) throw new Error('Invalid attempt fields');
  if (input.weakKeys && (!Array.isArray(input.weakKeys) || input.weakKeys.length > 20 || input.weakKeys.some(k => typeof k.value !== 'string' || ['__proto__','constructor','prototype'].includes(k.value) || !['character','vowel','coeng','mark','key'].includes(k.category) || k.value.length > 32 || !Number.isInteger(k.mistakes) || k.mistakes < 0 || k.mistakes > 10000 || !Number.isInteger(k.backspaces) || k.backspaces < 0 || k.backspaces > 10000))) throw new Error('Invalid weak keys');
  if (input.foundation && (input.mode !== 'foundation' || !Number.isInteger(input.foundation.physicalCorrectCount) || input.foundation.physicalCorrectCount < 0 || !Number.isInteger(input.foundation.virtualAssistedCount) || input.foundation.virtualAssistedCount < 0)) throw new Error('Invalid physical practice evidence');
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(input.attemptId) || input.version !== CURRICULUM_VERSION) throw new Error('Invalid attempt/version');
  const identity = resolveLessonIdentity(input.lessonId);
  if (!['2d','3d','foundation'].includes(input.mode) || !['physical-key','unicode-output','mixed'].includes(input.category)) throw new Error('Invalid mode');
  if ((identity.worldId === 0) !== (input.mode === 'foundation')) throw new Error('Foundation identity mismatch');
  if (input.mode === '3d' && identity.id !== '1:1') throw new Error('Unsupported 3D lesson');
  if (!Number.isFinite(Date.parse(input.completedAt))) throw new Error('Invalid completion time');
  const m = input.metrics;
  if (!m || Object.keys(m).sort().join() !== ['accuracy','cpm','score','stars','mistakes','backspaces','elapsedSeconds','passed'].sort().join()) throw new Error('Invalid metrics');
  for (const [key, max] of Object.entries({ accuracy:100, cpm:1500, score:10000, stars:3, mistakes:10000, backspaces:10000, elapsedSeconds:14400 })) {
    const value = m[key as keyof AttemptMetrics];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max) throw new Error(`Invalid ${key}`);
  }
  if (!Number.isInteger(m.stars) || !Number.isInteger(m.mistakes) || !Number.isInteger(m.backspaces) || typeof m.passed !== 'boolean') throw new Error('Invalid counters');
  if ((m.stars >= 2 && m.accuracy < 90) || (m.stars === 3 && m.accuracy < 95)) throw new Error('Inconsistent stars');
  if (m.passed && (m.accuracy < getLessonMinimumAccuracy(identity.lesson, identity.worldId) || m.elapsedSeconds < 1)) throw new Error('Invalid pass');
  if (!Array.isArray(input.stages) || input.stages.length > 10) throw new Error('Invalid stages');
  if ((input.mode === '3d' || input.mode === 'foundation') && m.passed) {
    if (input.stages.length !== identity.lesson.stages.length || identity.lesson.stages.some((s, i) => input.stages[i]?.id !== s.id || !input.stages[i].completed || !Number.isFinite(input.stages[i].accuracy) || input.stages[i].accuracy > 100 || input.stages[i].accuracy < s.accuracyGoal)) throw new Error('Incomplete stages');
  }
  return identity;
}
