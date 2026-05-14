import type { ReactNode } from 'react';

export type ResourceState = {
  coins: number;
  gems: number;
  hearts: number;
  maxHearts: number;
  xp: number;
  nextXp: number;
  level: number;
};

export type Achievement = {
  id: string;
  name: string;
  subtitle: string;
  icon: ReactNode;
  tone: 'green' | 'gold' | 'purple' | 'blue' | 'red';
};

export type LessonStage = {
  id: number;
  khmer: string;
  english: string;
  status: 'complete' | 'current' | 'locked';
  stars: number;
  color: 'green' | 'gold' | 'purple' | 'blue' | 'red' | 'gray';
};

export type Quest = {
  id: string;
  title: string;
  khmerTitle: string;
  progress: number;
  total: number;
  rewardCoins: number;
  complete?: boolean;
};

export type Student = {
  id: string;
  name: string;
  avatar: string;
  level: number;
  wpm: number;
  accuracy: number;
  xp: number;
  streak: number;
  status: 'Active' | 'In Progress';
};

export type PowerUp = {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  tone: 'blue' | 'gold' | 'red' | 'purple';
};

export type KeyboardKeyData = {
  label: string;
  value: string;
  wide?: boolean;
  action?: 'backspace' | 'enter' | 'space';
};
