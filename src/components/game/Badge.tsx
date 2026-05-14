import type { ReactNode } from 'react';
import GameBadge from '../game-ui/GameBadge';

type BadgeProps = {
  icon?: ReactNode;
  label: string;
  subtitle?: string;
  tone?: 'green' | 'gold' | 'purple' | 'blue' | 'red' | 'gray';
  compact?: boolean;
};

const toneMap = {
  green: 'newbie',
  gold: 'master',
  purple: 'expert',
  blue: 'rising-star',
  red: 'boss-slayer',
  gray: 'skilled',
} as const;

export default function Badge({ label, tone = 'gold', compact = false }: BadgeProps) {
  return <GameBadge variant={toneMap[tone]} label={label} compact={compact} />;
}
