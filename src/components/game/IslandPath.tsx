import { Link } from 'react-router-dom';
import { Lock, Map } from 'lucide-react';
import { lessonStages } from '../../data/mockData';
import GameButton from './GameButton';

export default function IslandPath() {
  const stages = lessonStages.slice(0, 5);

  return (
    <section className="game-card rounded-[24px] border-white/80 p-6 shadow-[0_18px_38px_rgba(21,87,153,.2)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="khmer-body text-sm font-black text-primary">▰ ផ្លូវផ្សងព្រេង</div>
          <h2 className="text-[1.55rem] font-black text-[#132C55]">Your Adventure Path</h2>
        </div>
        <Link to="/map">
          <GameButton variant="secondary" size="sm" icon={<Map size={18} />}>
            View Map
          </GameButton>
        </Link>
      </div>
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-[#EAF9FF] to-white px-4 py-5">
        <div className="absolute left-[8%] right-[8%] top-[47%] h-4 -translate-y-1/2 rounded-full bg-[#72C0DA] shadow-[inset_0_-3px_0_rgba(0,69,110,.18)]" />
        <div className="absolute left-[8%] right-[8%] top-[47%] border-t-4 border-dashed border-white/80" />
        <div className="relative grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((stage, index) => (
            <div key={stage.id} className="text-center">
              <div
                className="island-shape relative mx-auto grid h-28 w-32 place-items-center shadow-[0_14px_20px_rgba(37,109,88,.22)]"
                style={{ transform: `translateY(${index % 2 === 0 ? '0' : '-10px'})` }}
              >
                <div className="absolute left-6 top-4 h-9 w-9 rounded-full bg-white/20" />
                <div
                  className={`grid h-14 w-14 place-items-center rounded-full border-4 border-white text-2xl font-black text-white shadow-button ${
                    stage.id === 5 ? 'bg-purple' : stage.id === 4 ? 'bg-[#F59E0B]' : 'bg-primary'
                  }`}
                >
                  {stage.id}
                </div>
              </div>
              <div
                className={`khmer-body mt-2 font-black ${
                  stage.id === 5 ? 'text-coral' : stage.id === 4 ? 'text-[#F47B11]' : 'text-primary'
                }`}
              >
                {stage.khmer}
              </div>
              <div className="text-sm font-bold text-[#1B3158]">{stage.english}</div>
            </div>
          ))}
          <div className="text-center">
            <div className="mx-auto grid h-28 w-32 place-items-center rounded-[49%_51%_44%_56%/56%_42%_58%_44%] bg-gradient-to-b from-slate-400 to-slate-700 shadow-lg grayscale">
              <div className="grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-slate-600 text-white shadow-button">
                <Lock />
              </div>
            </div>
            <div className="mt-2 font-black text-slate-700">Coming Soon</div>
          </div>
        </div>
      </div>
    </section>
  );
}
