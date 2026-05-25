import { Mail, Settings, Trophy } from 'lucide-react';
import type { ResourceState } from '../../types/game';
import GameHudCounter from '../game-ui/GameHudCounter';

export function CoinCounter({ coins }: { coins: number }) {
  return <GameHudCounter type="coins" value={coins} />;
}

export function GemCounter({ gems }: { gems: number }) {
  return <GameHudCounter type="gems" value={gems} />;
}

export function HeartCounter({ hearts, maxHearts }: { hearts: number; maxHearts: number }) {
  return <GameHudCounter type="hearts" value={`${hearts}/${maxHearts}`} />;
}

export function TopResources({ resources, compact = false, variant = 'default' }: { resources: ResourceState; compact?: boolean; variant?: 'default' | 'glossy' }) {
  const iconButtonClass =
    variant === 'glossy'
      ? 'pointer-events-auto grid h-12 w-12 cursor-pointer place-items-center rounded-2xl border-[3px] border-white/65 bg-gradient-to-b from-[#FFFFFF] via-[#EEF8FF] to-[#A8D8FF] text-[#214375] shadow-button'
      : 'pointer-events-auto grid h-12 w-12 cursor-pointer place-items-center rounded-2xl border border-white/25 bg-gradient-to-b from-[#16405F] to-[#071C33] text-white shadow-lg';

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <CoinCounter coins={resources.coins} />
      {!compact && <GemCounter gems={resources.gems} />}
      <HeartCounter hearts={resources.hearts} maxHearts={resources.maxHearts} />
      {!compact && (
        <>
          <button type="button" className={`${iconButtonClass} disabled:cursor-not-allowed disabled:opacity-60`} aria-label="Mail coming soon" disabled title="Mail coming soon">
            <Mail size={22} />
          </button>
          <button type="button" className={`${iconButtonClass} disabled:cursor-not-allowed disabled:opacity-60`} aria-label="Trophy details coming soon" disabled title="Trophy details coming soon">
            <Trophy size={22} />
          </button>
          <button type="button" className={`${iconButtonClass} disabled:cursor-not-allowed disabled:opacity-60`} aria-label="Settings coming soon" disabled title="Settings coming soon">
            <Settings size={22} />
          </button>
        </>
      )}
    </div>
  );
}
