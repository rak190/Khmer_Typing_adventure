import { NavLink } from 'react-router-dom';
import { ChevronDown, UserRound } from 'lucide-react';
import { navItems, resources } from '../../data/mockData';
import { cn } from '../../lib/cn';
import GameHudCounter from '../game-ui/GameHudCounter';
import LevelBadge from '../game/LevelBadge';
import Logo from '../game/Logo';
import { TopResources } from '../game/ResourceCounters';

type TopGameBarProps = {
  compactLogo?: boolean;
  overlay?: boolean;
  variant?: 'default' | 'landing';
};

export default function TopGameBar({ compactLogo = true, overlay = false, variant = 'default' }: TopGameBarProps) {
  const isLanding = variant === 'landing';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-white/20 bg-gradient-to-r from-[#004598] via-[#075EC7] to-[#00397C] shadow-xl',
        isLanding ? 'px-4 py-2 lg:h-[84px]' : 'px-4 py-3',
        overlay ? 'absolute inset-x-0' : '',
      )}
    >
      <div className={cn('mx-auto flex max-w-[1520px] items-center', isLanding ? 'h-full gap-5' : 'gap-4')}>
        <NavLink to="/" className={cn('shrink-0', isLanding ? 'relative z-10 -mb-8' : '')}>
          <Logo
            compact={compactLogo}
            className={
              isLanding
                ? 'origin-left scale-[0.82] sm:scale-[0.92] xl:scale-100'
                : compactLogo
                  ? 'scale-75 origin-left sm:scale-90'
                  : ''
            }
          />
        </NavLink>
        <nav className={cn('hidden min-w-0 flex-1 items-center xl:flex', isLanding ? 'justify-center gap-2' : 'justify-center gap-1')}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to + item.label}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 font-black text-white transition hover:bg-white/15',
                    isLanding ? 'rounded-[18px] px-4 py-3 text-[15px]' : 'rounded-2xl px-4 py-3 text-sm',
                    isActive ? (isLanding ? 'bg-[#3A86FF] shadow-[inset_0_-3px_0_rgba(0,0,0,.18),0_8px_16px_rgba(0,31,85,.25)]' : 'bg-white/20 shadow-inner') : '',
                  )
                }
              >
                <Icon size={isLanding ? 21 : 19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {isLanding ? (
            <>
              <GameHudCounter type="coins" value={resources.coins} showPlus />
              <GameHudCounter type="hearts" value={`${resources.hearts}/${resources.maxHearts}`} label="Full" />
            </>
          ) : (
            <TopResources resources={resources} compact />
          )}
          <div
            className={cn(
              'flex items-center gap-3 text-white',
              isLanding
                ? 'min-w-48 rounded-[18px] border border-white/25 bg-white/12 px-3 py-2 shadow-[inset_0_-4px_0_rgba(0,0,0,.18),0_7px_16px_rgba(0,19,57,.2)]'
                : 'min-w-44 rounded-2xl border border-white/25 bg-white/12 px-3 py-2 shadow-inner',
            )}
          >
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-b from-mint to-primary shadow">
              <UserRound size={23} />
            </div>
            <div className="leading-tight">
              <div className="font-black">Sophea</div>
              <div className="text-xs font-bold text-sky">Level 12</div>
            </div>
            <ChevronDown size={18} className="ml-auto" />
          </div>
          <LevelBadge level={12} size="sm" className="hidden 2xl:grid" />
        </div>
      </div>
    </header>
  );
}
