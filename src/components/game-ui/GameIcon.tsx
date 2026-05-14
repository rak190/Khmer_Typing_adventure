import type { ReactNode } from 'react';
import {
  Award,
  BookOpen,
  CheckSquare,
  Flame,
  Gem,
  Gift,
  HelpCircle,
  Home,
  Lock,
  Mail,
  Medal,
  Settings,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react';
import { hudIconImages, imageAssets } from '../../assets/assetManifest';
import { cn } from '../../lib/cn';

export type GameIconName =
  | 'coin'
  | 'gem'
  | 'heart'
  | 'star'
  | 'lock'
  | 'chest'
  | 'medal'
  | 'home'
  | 'treasure'
  | 'quests'
  | 'achievements'
  | 'guide'
  | 'mail'
  | 'trophy'
  | 'settings'
  | 'shield'
  | 'swords'
  | 'sparkles'
  | 'zap'
  | 'flame'
  | 'book';

type GameIconProps = {
  name: GameIconName;
  className?: string;
  size?: number;
  decorative?: boolean;
};

const svgIcons: Record<string, ReactNode> = {
  home: <Home />,
  treasure: <Gift />,
  quests: <CheckSquare />,
  achievements: <Trophy />,
  guide: <HelpCircle />,
  mail: <Mail />,
  trophy: <Trophy />,
  settings: <Settings />,
  shield: <Shield />,
  swords: <Swords />,
  sparkles: <Sparkles />,
  zap: <Zap />,
  flame: <Flame />,
  book: <BookOpen />,
};

const pngIcons: Partial<Record<GameIconName, string>> = {
  coin: imageAssets.coin,
  gem: imageAssets.gem,
  heart: imageAssets.heart,
  star: imageAssets.star,
  lock: imageAssets.lock,
  chest: imageAssets.chest,
  medal: imageAssets.medal,
};

const fallbackIcons: Partial<Record<GameIconName, ReactNode>> = {
  coin: <Medal />,
  gem: <Gem />,
  heart: <Flame />,
  star: <Star />,
  lock: <Lock />,
  chest: <Gift />,
  medal: <Award />,
};

export default function GameIcon({ name, className, size = 24, decorative = true }: GameIconProps) {
  const png = pngIcons[name] ?? hudIconImages[name as keyof typeof hudIconImages];
  const alt = decorative ? '' : name;

  if (png) {
    return <img src={png} alt={alt} className={cn('object-contain', className)} style={{ width: size, height: size }} />;
  }

  const icon = svgIcons[name] ?? fallbackIcons[name] ?? <Sparkles />;

  return (
    <span className={cn('inline-grid place-items-center [&>svg]:h-full [&>svg]:w-full', className)} style={{ width: size, height: size }} aria-hidden={decorative}>
      {icon}
    </span>
  );
}
