import GameProgressBar from './GameProgressBar';

type GameXPBarProps = {
  xp: number;
  nextXp: number;
  className?: string;
};

export default function GameXPBar({ xp, nextXp, className }: GameXPBarProps) {
  return <GameProgressBar value={xp} max={nextXp} label="XP" showValue variant="blue" className={className} />;
}
