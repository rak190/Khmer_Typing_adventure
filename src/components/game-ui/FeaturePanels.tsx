import { useState, type ReactNode } from 'react';
import { CheckCircle2, Clock, Gift, Lock, RotateCcw, ShieldCheck, Sparkles, Star, Target, Trophy, Volume2, VolumeX } from 'lucide-react';
import GameButton from './GameButton';
import GameProgressBar from './GameProgressBar';
import {
  type AchievementProgress,
  type AppSettings,
  type DailyQuest,
  type RewardAmount,
  type TreasureReward,
} from '../../lib/playerFeatures';

function PanelCard({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'green' | 'gold' | 'locked' }) {
  const toneClass = {
    default: 'border-[#B9D8F2] bg-[#F2FBFF]',
    green: 'border-[#8ED47A] bg-[#ECFFD9]',
    gold: 'border-[#DDBD70] bg-[#FFF8DA]',
    locked: 'border-[#C9C1B5] bg-[#EFE9DF]',
  }[tone];

  return (
    <section className={`rounded-[16px] border-2 p-3 shadow-inner ${toneClass}`}>
      {children}
    </section>
  );
}

function StatusPill({ status }: { status: 'locked' | 'claimable' | 'claimed' | 'unlocked' }) {
  const label = status === 'claimable' ? 'អាចទទួល' : status === 'claimed' ? 'បានទទួល' : status === 'unlocked' ? 'បានបើក' : 'ជាប់សោ';
  const className = status === 'locked'
    ? 'bg-[#DED8CE] text-[#655C52]'
    : status === 'claimed' || status === 'unlocked'
      ? 'bg-[#DFFFD4] text-[#176D35]'
      : 'bg-[#FFF0A6] text-[#70420A]';

  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black uppercase ${className}`}>{label}</span>;
}

function RewardText({ reward }: { reward: RewardAmount }) {
  const parts = [
    reward.coins ? `${reward.coins} កាក់` : null,
    reward.gems ? `${reward.gems} ពេជ្រ` : null,
    reward.XP ? `${reward.XP} XP` : null,
    reward.stars ? `${reward.stars} ផ្កាយ` : null,
  ].filter(Boolean);

  return <span>{parts.join(' + ')}</span>;
}

const achievementCopy: Record<string, { name: string; description: string; requirement: string }> = {
  'accuracy-monk': {
    name: 'អ្នកថែភាពត្រឹមត្រូវ',
    description: 'ឆ្លងមេរៀនជាច្រើនដោយរក្សាភាពត្រឹមត្រូវខ្ពស់។',
    requirement: 'ឆ្លងមេរៀន 5 ដោយមានភាពត្រឹមត្រូវយ៉ាងតិច 95%។',
  },
  'speed-runner': {
    name: 'អ្នកវាយលឿន',
    description: 'ឈានដល់គោលដៅ CPM ក្នុងមេរៀនជាច្រើន។',
    requirement: 'ឈានដល់គោលដៅ CPM ក្នុងមេរៀន 3។',
  },
  'no-mistake-warrior': {
    name: 'អ្នកគ្មានកំហុស',
    description: 'បញ្ចប់មេរៀនដោយគ្មានកំហុស។',
    requirement: 'ឆ្លងមេរៀន 1 ដោយមានភាពត្រឹមត្រូវ 100% និងកំហុស 0។',
  },
  'khmer-vowel-master': {
    name: 'អ្នកជំនាញស្រៈខ្មែរ',
    description: 'បញ្ចប់ផ្លូវហាត់ស្រៈខ្មែរ។',
    requirement: 'ឆ្លងមេរៀនស្រៈទាំងអស់។',
  },
  'subscript-hero': {
    name: 'វីរបុរសជើងអក្សរ',
    description: 'ហាត់ coeng និងជើងអក្សរឲ្យបានច្បាស់។',
    requirement: 'ឆ្លង Boss ជើងអក្សរ។',
  },
  'consistent-learner': {
    name: 'អ្នករៀនជាប់លាប់',
    description: 'ត្រឡប់មកហាត់ជាច្រើនថ្ងៃជាប់ៗគ្នា។',
    requirement: 'ឈានដល់ streak 3 ថ្ងៃ។',
  },
  'final-boss-victor': {
    name: 'អ្នកឈ្នះ Boss ចុងក្រោយ',
    description: 'ឆ្លងការប្រយុទ្ធចុងក្រោយដែលមានអត្ថបទចម្រុះ។',
    requirement: 'ឆ្លង Angkor Final Boss។',
  },
};

function getAchievementCopy(achievement: AchievementProgress) {
  return achievementCopy[achievement.badgeId] ?? {
    name: achievement.badgeName,
    description: achievement.description,
    requirement: achievement.requirement,
  };
}

function ToggleRow({
  label,
  detail,
  checked,
  onChange,
  icon,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-[#C7A25D]/45 bg-white/55 px-3 py-3">
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#E8F6FF] text-[#1764B2] shadow-inner">{icon}</span>
        <span className="min-w-0">
          <span className="block font-black text-[#17325A]">{label}</span>
          <span className="block text-sm font-bold text-[#65533E]">{detail}</span>
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-6 w-6 shrink-0 accent-[#1E78E6]"
      />
    </label>
  );
}

export function SettingsPanel({
  settings,
  onChange,
  onResetProgress,
}: {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onResetProgress: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const updateSetting = (key: keyof AppSettings, value: boolean) => onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-3">
      <ToggleRow
        label="សំឡេង"
        detail="បើក/បិទសំឡេងឆ្លើយតបខ្លីៗ នៅពេលមុខងារសំឡេងរួចរាល់។"
        checked={settings.soundEnabled}
        onChange={(checked) => updateSetting('soundEnabled', checked)}
        icon={settings.soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
      />
      <ToggleRow
        label="ភ្លេង"
        detail="រក្សាទុកជម្រើសភ្លេងផ្ទៃក្រោយសម្រាប់ពេលមានសំឡេង។"
        checked={settings.musicEnabled}
        onChange={(checked) => updateSetting('musicEnabled', checked)}
        icon={<Sparkles size={22} />}
      />
      <ToggleRow
        label="ជំនួយក្តារចុច"
        detail="បង្ហាញគ្រាប់ចុចគោលដៅក្នុងមេរៀន។"
        checked={settings.keyboardHintsEnabled}
        onChange={(checked) => updateSetting('keyboardHintsEnabled', checked)}
        icon={<Target size={22} />}
      />
      <ToggleRow
        label="ជំនួយម្រាមដៃ"
        detail="បង្ហាញដៃ និងម្រាមដៃដែលត្រូវប្រើក្នុងមេរៀន។"
        checked={settings.handHintsEnabled}
        onChange={(checked) => updateSetting('handHintsEnabled', checked)}
        icon={<ShieldCheck size={22} />}
      />

      <PanelCard tone="locked">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-black text-[#8B2B1E]">កំណត់វឌ្ឍនភាពឡើងវិញ</div>
            <div className="text-sm font-bold text-[#65533E]">លុបវឌ្ឍនភាពមេរៀន រង្វាន់ដែលបានទទួល ភារកិច្ចប្រចាំថ្ងៃ និងសមិទ្ធផលដែលបានរក្សាទុក។</div>
          </div>
          {!confirmReset ? (
            <GameButton variant="red" size="sm" leftIcon={<RotateCcw size={16} />} onClick={() => setConfirmReset(true)}>
              លុប
            </GameButton>
          ) : (
            <div className="flex flex-wrap gap-2">
              <GameButton variant="white" size="sm" onClick={() => setConfirmReset(false)}>បោះបង់</GameButton>
              <GameButton
                variant="red"
                size="sm"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
              >
                បញ្ជាក់លុប
              </GameButton>
            </div>
          )}
        </div>
      </PanelCard>
    </div>
  );
}

export function TreasurePanel({
  rewards,
  wallet,
  onClaim,
}: {
  rewards: TreasureReward[];
  wallet: { coins: number; gems: number; XP: number; stars: number };
  onClaim: (rewardId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-black text-[#17325A]">
        {[
          ['កាក់', wallet.coins],
          ['ពេជ្រ', wallet.gems],
          ['XP', wallet.XP],
          ['ផ្កាយ', wallet.stars],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[13px] border border-[#DDBD70] bg-white/62 px-2 py-2 shadow-inner">
            <div className="uppercase text-[#7A4D19]">{label}</div>
            <div className="text-lg">{Number(value).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {rewards.map((reward) => (
        <PanelCard key={reward.id} tone={reward.status === 'locked' ? 'locked' : reward.status === 'claimed' ? 'green' : 'gold'}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {reward.status === 'locked' ? <Lock size={18} /> : <Gift size={18} />}
                <h3 className="font-black text-[#17325A]">{reward.title}</h3>
              </div>
              <p className="mt-1 text-sm font-bold text-[#4D371E]">{reward.description}</p>
              <div className="mt-2 text-sm font-black text-[#70420A]">រង្វាន់៖ <RewardText reward={reward.reward} /></div>
              <div className="mt-2 text-xs font-bold text-[#65533E]">{reward.status === 'locked' ? `ជាប់សោ៖ ${reward.requirement}` : reward.requirement}</div>
            </div>
            <StatusPill status={reward.status} />
          </div>
          <GameProgressBar value={reward.progress} max={reward.total} showValue variant={reward.status === 'locked' ? 'gold' : 'green'} className="mt-3" />
          {reward.status === 'claimable' && (
            <GameButton variant="gold" size="sm" className="mt-3 w-full" onClick={() => onClaim(reward.id)}>
              ទទួលរង្វាន់
            </GameButton>
          )}
        </PanelCard>
      ))}
    </div>
  );
}

export function DailyQuestsPanel({ quests, onClaim }: { quests: DailyQuest[]; onClaim: (questId: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-[#4D371E]">ភារកិច្ចប្រចាំថ្ងៃកែប្រែតាមលទ្ធផលមេរៀនដែលបានរក្សាទុកថ្ងៃនេះ។ រង្វាន់អាចទទួលបានម្តងក្នុងមួយថ្ងៃ។</p>
      {quests.map((quest) => (
        <PanelCard key={quest.id} tone={quest.status === 'locked' ? 'locked' : quest.status === 'claimed' ? 'green' : 'gold'}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {quest.status === 'claimed' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                <h3 className="font-black text-[#17325A]">{quest.title}</h3>
              </div>
              <p className="mt-1 text-sm font-bold text-[#4D371E]">{quest.description}</p>
              <div className="mt-2 text-xs font-bold text-[#65533E]">{quest.status === 'locked' ? `ជាប់សោ៖ ${quest.requirement}` : quest.requirement}</div>
              <div className="mt-2 text-sm font-black text-[#70420A]">រង្វាន់៖ <RewardText reward={quest.reward} /></div>
            </div>
            <StatusPill status={quest.status} />
          </div>
          <GameProgressBar value={quest.progress} max={quest.total} showValue variant={quest.status === 'locked' ? 'gold' : 'green'} className="mt-3" />
          {quest.status === 'claimable' && (
            <GameButton variant="gold" size="sm" className="mt-3 w-full" onClick={() => onClaim(quest.id)}>
              ទទួលរង្វាន់ភារកិច្ច
            </GameButton>
          )}
        </PanelCard>
      ))}
    </div>
  );
}

export function AchievementsPanel({ achievements }: { achievements: AchievementProgress[] }) {
  return (
    <div className="space-y-3">
      {achievements.map((achievement) => (
        <PanelCard key={achievement.badgeId} tone={achievement.unlocked ? 'green' : 'locked'}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {achievement.unlocked ? <Trophy size={18} /> : <Lock size={18} />}
                <h3 className="font-black text-[#17325A]">{getAchievementCopy(achievement).name}</h3>
              </div>
              <p className="mt-1 text-sm font-bold text-[#4D371E]">{getAchievementCopy(achievement).description}</p>
              <div className="mt-2 text-xs font-bold text-[#65533E]">
                {achievement.unlocked
                  ? `បានបើក${achievement.unlockedAt ? ` នៅ ${new Date(achievement.unlockedAt).toLocaleDateString('km-KH')}` : ''}`
                  : `ជាប់សោ៖ ${getAchievementCopy(achievement).requirement}`}
              </div>
            </div>
            <StatusPill status={achievement.unlocked ? 'unlocked' : 'locked'} />
          </div>
          <GameProgressBar value={achievement.progress} max={achievement.total} showValue variant={achievement.unlocked ? 'green' : 'gold'} className="mt-3" />
        </PanelCard>
      ))}
    </div>
  );
}

export function GuidePanel() {
  const guideItems = [
    ['របៀបលេង', 'ជ្រើសមេរៀនដែលបានបើកនៅលើផែនទី បន្ទាប់មកវាយអត្ថបទខ្មែរឲ្យដូចដែលបានបង្ហាញ។ ប្រើ Backspace ដោយប្រុងប្រយ័ត្នពេលចាំបាច់។'],
    ['ភាពត្រឹមត្រូវ', 'អ្នកចាប់ផ្តើមគួររក្សាភាពត្រឹមត្រូវជាមុន។ ដើម្បីឆ្លងមេរៀន ត្រូវឈានដល់គោលដៅភាពត្រឹមត្រូវរបស់មេរៀន។'],
    ['CPM', 'CPM មានន័យថាចំនួនតួអក្សរក្នុងមួយនាទី។ វាជាម៉ែត្រល្បឿនសំខាន់សម្រាប់ការវាយអក្សរខ្មែរ ព្រោះពាក្យខ្មែរអាចមានសញ្ញាផ្សំច្រើន។'],
    ['ផ្កាយ', 'ផ្កាយបានពីការឆ្លងមេរៀនដោយមានភាពត្រឹមត្រូវ និងល្បឿនល្អ។ ផ្កាយច្រើនជួយបង្កើនរង្វាន់ និងមតិកែលម្អវឌ្ឍនភាព។'],
    ['រង្វាន់', 'មេរៀន ភារកិច្ចប្រចាំថ្ងៃ និងប្រអប់រង្វាន់អាចផ្តល់កាក់ ពេជ្រ XP និងផ្កាយ។ របស់ដែលជាប់សោនឹងប្រាប់លក្ខខណ្ឌបើក។'],
    ['Boss Mode', 'ការប្រយុទ្ធ Boss ត្រូវការវាយចប់អត្ថបទ និងឈានដល់គោលដៅភាពត្រឹមត្រូវ។ លេងម្តងទៀតបើភាពត្រឹមត្រូវមិនទាន់គ្រប់។'],
  ];

  return (
    <div className="space-y-3">
      {guideItems.map(([title, text]) => (
        <PanelCard key={title} tone="default">
          <div className="flex gap-3">
            <Star className="mt-0.5 shrink-0 text-[#D29B18]" size={18} />
            <div>
              <h3 className="font-black text-[#17325A]">{title}</h3>
              <p className="mt-1 text-sm font-bold text-[#4D371E]">{text}</p>
            </div>
          </div>
        </PanelCard>
      ))}
    </div>
  );
}

export function ComingSoonPanel({ title, detail }: { title: string; detail: string }) {
  return (
    <PanelCard tone="default">
      <div className="flex gap-3">
        <Sparkles className="mt-0.5 shrink-0 text-[#1764B2]" size={20} />
        <div>
          <h3 className="font-black text-[#17325A]">{title}</h3>
          <p className="mt-1 text-sm font-bold text-[#4D371E]">{detail}</p>
        </div>
      </div>
    </PanelCard>
  );
}
