import { Check, Lock, ScrollText } from 'lucide-react';
import { imageAssets } from '../../assets/assetManifest';
import { cn } from '../../lib/cn';

export type QuestStageState = {
  label: string;
  state: 'completed' | 'current' | 'locked';
};

type QuestScrollProps = {
  objective: string;
  progress: number;
  total: number;
  nextKey: string;
  keyHint: string;
  stages: QuestStageState[];
  stars: number;
  xp: number;
  coins: number;
};

function visibleKey(key: string) {
  return key === ' ' ? 'Spacebar' : key;
}

export default function QuestScroll({ objective, progress, total, nextKey, keyHint, stages, stars, xp, coins }: QuestScrollProps) {
  const brickTotal = Math.max(1, total);

  return (
    <aside data-testid="quest-scroll" className="lesson-scroll-board pointer-events-none absolute right-[44px] top-[132px] z-30 h-[872px] w-[372px] px-7 py-7 text-[#4C2D14]">
      <div className="lesson-scroll-roller absolute left-5 right-5 top-3 h-3" />
      <div className="lesson-scroll-roller absolute bottom-3 left-5 right-5 h-3" />

      <div className="flex items-center gap-3 text-[#24395F]">
        <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#B68A45] bg-[#FFF4C4] text-[#7B4C20]">
          <ScrollText size={27} />
        </span>
        <div>
          <h2 className="khmer-body text-[29px] font-black leading-none">បេសកកម្ម</h2>
          <div className="khmer-body text-[13px] font-black tracking-wide text-[#8B5A20]">Temple Bridge</div>
        </div>
      </div>

      <div className="mt-5 border-t-2 border-[#B58749]/35 pt-4">
        <div className="khmer-body text-[13px] font-black tracking-wide text-[#754617]">Quest</div>
        <p className="khmer-body mt-1 line-clamp-2 text-[18px] font-bold leading-snug text-[#27324A]">{objective}</p>
      </div>

      <div className="mt-5 border-t-2 border-[#B58749]/35 pt-4">
        <div className="mb-3 flex items-end justify-between">
          <div className="khmer-body text-[13px] font-black tracking-wide text-[#754617]">Progress</div>
          <div className="text-[17px] font-black text-[#24395F]">{progress} / {total}</div>
        </div>
        <div className="lesson-mini-brick-track grid grid-cols-10 gap-1.5 p-2">
          {Array.from({ length: brickTotal }, (_, index) => (
            <span
              key={index}
              className={cn(
                'lesson-mini-brick h-[13px]',
                index < progress ? 'lesson-mini-brick--filled' : 'lesson-mini-brick--empty',
                index === progress && progress < total && 'lesson-mini-brick--next',
              )}
            />
          ))}
        </div>

        <div className="mt-4 space-y-2.5">
          {stages.map((stage) => (
            <div
              key={stage.label}
              className={cn(
                'khmer-body flex h-[46px] items-center gap-3 rounded-[18px] border-2 px-3 text-[16px] font-black shadow-inner',
                stage.state === 'completed' && 'border-[#53B96A] bg-[#E8FFD8] text-[#176D35]',
                stage.state === 'current' && 'border-[#C89B32] bg-gradient-to-r from-[#FFF1A8] to-[#E7D8FF] text-[#563280]',
                stage.state === 'locked' && 'border-[#B6B0A8] bg-[#EFE9DF] text-[#77736D]',
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-full',
                  stage.state === 'completed' && 'bg-[#24A84B] text-white',
                  stage.state === 'current' && 'bg-[#6B3FC6] text-[#FFE889]',
                  stage.state === 'locked' && 'bg-[#BDB7AF] text-white',
                )}
              >
                {stage.state === 'completed' ? <Check size={20} strokeWidth={4} /> : stage.state === 'locked' ? <Lock size={18} /> : <span className="h-3 w-3 rounded-full bg-current" />}
              </span>
              {stage.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t-2 border-[#B58749]/35 pt-4">
        <div className="khmer-body text-[13px] font-black tracking-wide text-[#754617]">Next Key</div>
        <div className="lesson-next-key-socket mt-2 flex min-h-[78px] items-center justify-between px-4 py-3">
          <span className="khmer-display lesson-next-key-glyph text-[50px] leading-none">{visibleKey(nextKey)}</span>
          <span className="max-w-[160px] text-right text-[16px] font-black leading-tight text-[#34507A]">{keyHint}</span>
        </div>
      </div>

      <div className="mt-5 border-t-2 border-[#B58749]/35 pt-4">
        <div className="khmer-body text-[13px] font-black tracking-wide text-[#754617]">Rewards</div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[13px] font-black text-[#24395F]">
          <div>
            <img src={imageAssets.star} alt="" className="mx-auto h-10 w-10 object-contain" />
            ផ្កាយ {stars}
          </div>
          <div>
            <img src={imageAssets.coin} alt="" className="mx-auto h-10 w-10 object-contain" />
            +{coins}
          </div>
          <div>
            <img src={imageAssets.chest} alt="" className="mx-auto h-10 w-10 object-contain" />
            +{xp} XP
          </div>
        </div>
      </div>
    </aside>
  );
}
