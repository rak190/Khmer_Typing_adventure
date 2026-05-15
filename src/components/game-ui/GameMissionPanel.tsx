import { PawPrint } from 'lucide-react';
import GameButton from './GameButton';
import GameIcon from './GameIcon';
import GamePanel from './GamePanel';
import GameProgressBar from './GameProgressBar';
import GameRewardCard from './GameRewardCard';

type GameMissionPanelProps = {
  selectedLevel?: number;
  onStart?: () => void;
};

export default function GameMissionPanel({ selectedLevel = 6, onStart }: GameMissionPanelProps) {
  return (
    <aside className="flex min-h-[760px] flex-col rounded-[32px] border-[4px] border-[#825222]/65 bg-gradient-to-b from-[#FFF8E6] via-[#FFFDF7] to-[#F0D69A] p-4 text-[#4E3216] shadow-[inset_0_-7px_0_rgba(116,69,28,.14),0_22px_38px_rgba(20,75,118,.26)]">
      <GamePanel title="បេសកកម្មបច្ចុប្បន្ន" subtitle="Mission" bodyClassName="p-4" className="border-[#D6B171] bg-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="khmer-body text-2xl font-black text-[#693D1E]">កម្រិត {selectedLevel}</div>
            <div className="text-xl font-black text-[#2F2A54]">Level {selectedLevel}</div>
          </div>
          <div className="flex rounded-full bg-[#FFF4C1] px-2 py-1 shadow-inner">
            {[1, 2, 3].map((star) => <GameIcon key={star} name="star" size={24} />)}
          </div>
        </div>

        <div className="relative mt-4 h-32 overflow-hidden rounded-[20px] border-[3px] border-[#9D7342] bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,.92)_0_6%,transparent_15%),linear-gradient(180deg,#70D9FF_0%,#C9F3FF_48%,#73C86A_49%,#3FAE58_100%)] shadow-[inset_0_-5px_0_rgba(95,64,36,.18)]">
          <div className="absolute left-5 top-5 h-12 w-16 rounded-[60%] bg-white/70 blur-sm" />
          <div className="absolute right-4 top-7 h-10 w-14 rounded-[60%] bg-white/60 blur-sm" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#39AC59] to-transparent" />
          <PawPrint className="absolute bottom-8 right-8 text-[#6C4A2A]" size={34} />
        </div>

        <div className="mt-4 rounded-[20px] border-[3px] border-[#5C35BE] bg-gradient-to-r from-[#8E64FF] to-[#5E35D6] px-4 py-3 text-center text-white shadow-button">
          <div className="khmer-body text-xl font-black leading-tight">ពាក្យ - សត្វ</div>
          <div className="text-base font-black">Words - Animals</div>
        </div>

        <section className="mt-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="khmer-body text-lg font-black text-[#68421F]">គោលដៅ</div>
              <div className="font-black text-[#2F2A54]">Objective</div>
            </div>
            <div className="rounded-full bg-[#EAF7ED] px-3 py-1 text-sm font-black text-[#208345]">12/20</div>
          </div>
          <p className="mt-1 text-sm font-extrabold text-[#6D604F]">វាយពាក្យអំពីសត្វឱ្យត្រឹមត្រូវ ២០ ពាក្យ។</p>
          <GameProgressBar value={12} max={20} variant="green" showValue className="mt-3" />
        </section>

        <section className="mt-5 rounded-[22px] border-2 border-[#E4C88B] bg-[#FFF7DF] p-3">
          <div className="mb-3 text-base font-black text-[#68421F]">រង្វាន់ Rewards</div>
          <div className="grid grid-cols-3 gap-2">
            <GameRewardCard icon="coin" value="200" label="coins" />
            <GameRewardCard icon="star" value="30" label="stars" />
            <GameRewardCard icon="gem" value="2" label="gems" />
          </div>
        </section>

        <section className="mt-4 rounded-[20px] border-2 border-[#D4D7DE] bg-gradient-to-b from-[#F6F7FA] to-[#E8EBF0] p-3">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div>
              <div className="khmer-body font-black text-[#6B7280]">កម្រិត 7</div>
              <div className="text-sm font-black text-[#7A8494]">Level បន្ទាប់ជាប់សោ</div>
              <div className="mt-1 text-xs font-bold text-[#8993A3]">រកផ្កាយបន្ថែម 3 ដើម្បីបើក។</div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#C7CDD8] bg-white shadow-inner">
              <GameIcon name="lock" size={28} />
            </div>
          </div>
        </section>
      </GamePanel>

      <GameButton size="xl" variant="green" className="mt-4 w-full" onClick={onStart}>
        ចាប់ផ្តើម Level {selectedLevel}
      </GameButton>
    </aside>
  );
}
