import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, Gauge, Pause, Settings, Target, Trophy } from 'lucide-react';
import { imageAssets } from '../../assets/assetManifest';
import { useEconomyState } from '../../lib/useEconomyState';

type LessonHudProps = {
  score: number;
  streak: number;
  accuracy: number;
  cpm: number;
  xpEarned: number;
  onPause: () => void;
  onSettings: () => void;
};

export default function LessonHud({ score, streak, accuracy, cpm, xpEarned, onPause, onSettings }: LessonHudProps) {
  const economy = useEconomyState();
  const xp = economy.typingXP + xpEarned;
  const xpPercent = Math.min(100, Math.round(((xp % 100) / 100) * 100));

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40 h-[108px]">
      <Link
        to="/map"
        className="pointer-events-auto absolute left-[28px] top-[20px] grid h-[62px] w-[62px] place-items-center rounded-[18px] border-[3px] border-[#7FD1FF] bg-gradient-to-b from-[#43A7FF] via-[#166FD4] to-[#073E8A] text-white shadow-[inset_0_3px_0_rgba(255,255,255,.32),0_6px_0_rgba(0,48,118,.56),0_12px_18px_rgba(0,35,80,.28)]"
        aria-label="Back to lesson map"
      >
        <ArrowLeft size={34} strokeWidth={3.4} />
      </Link>

      <img
        src={imageAssets.logo}
        alt="Khmer Typing Adventure"
        draggable={false}
        className="pointer-events-none absolute left-[106px] top-[0px] h-[98px] w-[216px] object-contain drop-shadow-[0_10px_12px_rgba(0,31,72,.3)]"
      />

      <section className={`absolute left-[330px] top-[20px] grid h-[68px] w-[760px] grid-cols-4 overflow-hidden rounded-[18px] border-[2px] border-[#67C8FF] bg-gradient-to-b from-[#1377D3] via-[#0A5FB8] to-[#064282] text-white shadow-[inset_0_2px_0_rgba(255,255,255,.24),0_10px_18px_rgba(0,53,121,.24)] ${streak >= 10 ? 'lesson-streak-hot' : ''}`}>
        {[
          { label: 'Score', value: score.toLocaleString(), icon: <Trophy size={30} className="text-[#FFD94C]" /> },
          { label: 'Streak', value: streak.toString(), icon: <Flame size={31} className="text-[#FFB629]" fill="currentColor" /> },
          { label: 'Accuracy', value: `${accuracy}%`, icon: <Target size={31} className="text-[#FF7168]" /> },
          { label: 'CPM', value: cpm.toString(), icon: <Gauge size={31} className="text-[#8EFFD4]" /> },
        ].map((item, index) => (
          <div key={item.label} className={`flex items-center justify-center gap-3 px-3 ${index > 0 ? 'border-l border-[#063C85]/55' : ''}`}>
            <div className="grid h-[41px] w-[41px] place-items-center rounded-[12px] bg-white/15 shadow-inner">{item.icon}</div>
            <div className="leading-tight">
              <div className="text-[12px] font-black uppercase tracking-wide text-white/72">{item.label}</div>
              <div className="text-[25px] font-black leading-none drop-shadow-[0_2px_0_rgba(0,40,93,.28)]">{item.value}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="absolute left-[1110px] top-[20px] flex h-[68px] w-[282px] items-center gap-4 rounded-[18px] border-[2px] border-[#67C8FF] bg-gradient-to-b from-[#1475D8] to-[#074C9B] px-5 text-white shadow-[inset_0_2px_0_rgba(255,255,255,.24),0_10px_18px_rgba(0,53,121,.24)]">
        <div className="grid h-[52px] w-[52px] place-items-center rounded-[14px] border-[3px] border-[#FFD95B] bg-gradient-to-b from-[#8E62FF] to-[#5730B5] text-[21px] font-black shadow-[inset_0_2px_0_rgba(255,255,255,.3)]">
          {economy.level}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between text-[12px] font-black text-white/86">
            <span>Level</span>
            <span>{xp} XP</span>
          </div>
          <div className="h-[16px] overflow-hidden rounded-full border-2 border-[#083D78] bg-[#052D5C] shadow-inner">
            <div className="h-full rounded-full bg-gradient-to-r from-[#98FF5F] via-[#46D84E] to-[#18A742]" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </section>

      <div className="absolute right-[56px] top-[20px] flex gap-3">
        {[
          { label: 'Pause lesson', icon: <Pause size={28} fill="currentColor" />, onClick: onPause },
          { label: 'Lesson settings', icon: <Settings size={28} />, onClick: onSettings },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="pointer-events-auto grid h-[58px] w-[58px] place-items-center rounded-[18px] border-[3px] border-[#7FD1FF] bg-gradient-to-b from-[#349BFA] via-[#1269D0] to-[#07418D] text-white shadow-[inset_0_3px_0_rgba(255,255,255,.3),0_5px_0_rgba(0,48,118,.56)] transition hover:-translate-y-0.5"
            aria-label={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </header>
  );
}
