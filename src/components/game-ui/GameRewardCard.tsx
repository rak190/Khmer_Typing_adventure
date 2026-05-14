import GameIcon, { type GameIconName } from './GameIcon';

type GameRewardCardProps = {
  icon: GameIconName;
  value: string | number;
  label: string;
};

export default function GameRewardCard({ icon, value, label }: GameRewardCardProps) {
  return (
    <div className="rounded-2xl border-2 border-[#E9D29E] bg-white px-2 py-3 text-center font-black shadow-sm">
      <GameIcon name={icon} size={28} className="mx-auto" />
      <div className="mt-1 text-lg text-[#3A2B1F]">{value}</div>
      <div className="text-[11px] uppercase text-[#8B6B43]">{label}</div>
    </div>
  );
}
