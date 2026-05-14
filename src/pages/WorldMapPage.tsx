import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck } from 'lucide-react';
import GameMissionPanel from '../components/game-ui/GameMissionPanel';
import GameProgressBar from '../components/game-ui/GameProgressBar';
import GameScreen from '../components/layout/GameScreen';
import GameSidebarItem from '../components/game-ui/GameSidebarItem';
import PageTransition from '../components/layout/PageTransition';
import { TopResources } from '../components/game/ResourceCounters';
import WorldMapNode from '../components/game/WorldMapNode';
import { backgroundImages } from '../assets/assetManifest';
import { lessonStages, resources } from '../data/mockData';
import type { LessonStage } from '../types/game';

const nodePositions = [
  { x: 470, y: 740 },
  { x: 610, y: 630 },
  { x: 770, y: 545 },
  { x: 960, y: 490 },
  { x: 1130, y: 410 },
  { x: 1280, y: 485 },
  { x: 1180, y: 625 },
  { x: 990, y: 735 },
  { x: 810, y: 835 },
  { x: 1030, y: 880 },
  { x: 1255, y: 815 },
];

const sidebarItems = [
  { subtitle: 'Treasure', khmer: 'រង្វាន់', icon: 'treasure' as const },
  { subtitle: 'Daily Quests', khmer: 'បេសកកម្ម', icon: 'quests' as const },
  { subtitle: 'Achievements', khmer: 'សមិទ្ធផល', icon: 'achievements' as const },
  { subtitle: 'Guide', khmer: 'ណែនាំ', icon: 'guide' as const },
];

const categoryLabels = [
  { khmer: 'ព្យញ្ជនៈខ្មែរ', english: 'Khmer Consonants', x: 410, y: 555, color: '#2FBE62', rotate: -5 },
  { khmer: 'ស្រៈខ្មែរ', english: 'Khmer Vowels', x: 680, y: 405, color: '#F0A817', rotate: 4 },
  { khmer: 'ពាក្យ', english: 'Words', x: 1050, y: 275, color: '#7C4DFF', rotate: -4 },
  { khmer: 'ប្រយោគ', english: 'Sentences', x: 1040, y: 600, color: '#1E78E6', rotate: 3 },
  { khmer: 'មេប្រយុទ្ធ', english: 'Boss Challenge', x: 1285, y: 710, color: '#FF5A5F', rotate: -5 },
];

export default function WorldMapPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<LessonStage>(lessonStages[5]);

  return (
    <PageTransition>
      <GameScreen background={backgroundImages.worldMap} reference="/src/reference/world-map-reference.png">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_48%,rgba(255,255,255,.08),transparent_34%),linear-gradient(180deg,rgba(0,70,130,.06),rgba(0,33,77,.18))]" />

        <button
          className="pointer-events-auto absolute left-[34px] top-[32px] z-40 grid h-[70px] w-[70px] cursor-pointer place-items-center rounded-[22px] border-[4px] border-[#743F1E] bg-gradient-to-b from-[#F6C079] to-[#B76224] text-white shadow-button"
          onClick={() => navigate('/')}
          aria-label="Back"
        >
          <ArrowLeft size={36} />
        </button>

        <aside className="absolute left-[34px] top-[122px] z-40 flex w-[184px] flex-col gap-[18px]">
          <div className="rounded-[28px] border-[4px] border-[#6E421F] bg-gradient-to-b from-[#FFEAB0] via-[#F4C56E] to-[#D99032] px-3 py-5 text-center shadow-button">
            <div className="khmer-display text-[31px] leading-tight text-[#6A3217]">ផែនទី</div>
            <div className="text-[15px] font-black text-[#5C3417]">World Map</div>
          </div>

          {sidebarItems.map((item, index) => (
            <GameSidebarItem
              key={item.subtitle}
              icon={item.icon}
              khmer={item.khmer}
              subtitle={item.subtitle}
              active={index === 1}
              className="h-[132px] w-[184px] justify-center"
            />
          ))}

          <div className="mt-1 rounded-[26px] border-[4px] border-[#74451C]/55 bg-gradient-to-b from-[#FFF8DE] to-[#E8BD68] p-4 shadow-[inset_0_-5px_0_rgba(92,55,25,.16),0_14px_24px_rgba(33,81,107,.2)]">
            <BookOpenCheck className="mx-auto text-[#7C4DFF]" size={34} />
            <div className="khmer-body mt-1 text-center text-[15px] font-black text-[#5B3518]">ដំណើរផ្សងព្រេង</div>
            <GameProgressBar value={24} max={36} variant="gold" className="mt-3" />
            <div className="mt-1 text-center text-xs font-black text-[#7A5630]">24 / 36 stars</div>
          </div>
        </aside>

        <div className="absolute right-[430px] top-[28px] z-40">
          <TopResources resources={resources} variant="glossy" />
        </div>

        <svg className="pointer-events-none absolute left-[280px] top-[185px] z-10 h-[760px] w-[1130px] overflow-visible" viewBox="0 0 1130 760" aria-hidden="true">
          <path
            d="M170 560 C245 500 280 390 430 365 C560 343 608 228 768 224 C934 220 1015 330 900 430 C810 510 668 485 598 585 C538 672 710 707 985 632"
            fill="none"
            stroke="rgba(83,50,25,.42)"
            strokeWidth="48"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0 13)"
          />
          <path
            d="M170 560 C245 500 280 390 430 365 C560 343 608 228 768 224 C934 220 1015 330 900 430 C810 510 668 485 598 585 C538 672 710 707 985 632"
            fill="none"
            stroke="#C99155"
            strokeWidth="38"
            strokeDasharray="1 22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M170 560 C245 500 280 390 430 365 C560 343 608 228 768 224 C934 220 1015 330 900 430 C810 510 668 485 598 585 C538 672 710 707 985 632"
            fill="none"
            stroke="rgba(255,231,164,.92)"
            strokeWidth="12"
            strokeDasharray="1 26"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0 -8)"
          />
        </svg>

        {categoryLabels.map((label) => (
          <div
            key={label.english}
            className="pointer-events-none absolute z-20 min-w-[170px] rounded-[20px] border-[4px] border-white/85 px-4 py-2 text-center text-white shadow-[inset_0_-5px_0_rgba(0,0,0,.14),0_9px_15px_rgba(51,81,71,.24)]"
            style={{ left: label.x, top: label.y, backgroundColor: label.color, transform: `translate(-50%, -50%) rotate(${label.rotate}deg)` }}
          >
            <span className="khmer-body block text-[17px] font-black leading-tight">{label.khmer}</span>
            <span className="block text-[13px] font-black leading-tight">{label.english}</span>
          </div>
        ))}

        {lessonStages.map((stage, index) => (
          <WorldMapNode
            key={stage.id}
            stage={stage}
            selected={selected.id === stage.id}
            className="z-20 scale-[1.08]"
            onSelect={(next) => setSelected(next)}
            stylePosition={nodePositions[index]}
          />
        ))}

        <div className="absolute right-[34px] top-[112px] z-40 h-[842px] w-[374px]">
          <GameMissionPanel selectedLevel={selected.id} onStart={() => navigate('/lesson')} />
        </div>

      </GameScreen>
    </PageTransition>
  );
}
