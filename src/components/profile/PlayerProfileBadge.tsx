import { useEffect, useMemo, useState } from 'react';
import { PLAYER_TITLES } from '../../data/playerTitles';
import { getProfileTheme } from '../../data/profileThemes';
import { useEconomyState } from '../../lib/useEconomyState';
import { loadStudentProgress } from '../../lib/studentProgress';
import { USER_PROFILE_EVENT } from '../../lib/userProfile';
import { ECONOMY_EVENT } from '../../lib/economy';
import { getDefaultGameProfile, getUserProfile, loadCachedGameProfile, type GameProfile } from '../../services/profileService';
import { cn } from '../../lib/cn';
import GeneratedAvatar from './GeneratedAvatar';

type PlayerProfileBadgeProps = {
  size: 'small' | 'medium' | 'large';
  showXP?: boolean;
  showTitle?: boolean;
  showLevel?: boolean;
  className?: string;
};

function levelXP(totalXP: number, level: number) {
  const safeLevel = Math.max(1, Math.floor(level));
  const target = Math.max(100, safeLevel * 100);
  const current = totalXP % target;
  return {
    current,
    target,
    percent: Math.min(100, Math.max(0, Math.round((current / target) * 100))),
  };
}

function getDisplayProfile(profile: GameProfile) {
  const fallback = getDefaultGameProfile();
  return {
    ...fallback,
    ...profile,
    displayName: profile.displayName?.trim() || 'Guest',
    equippedTitleId: profile.equippedTitleId || fallback.equippedTitleId,
    equippedAvatarId: profile.equippedAvatarId || fallback.equippedAvatarId,
    equippedSkinId: profile.equippedSkinId || fallback.equippedSkinId,
    equippedThemeId: profile.equippedThemeId || fallback.equippedThemeId,
    equippedFrameId: profile.equippedFrameId || fallback.equippedFrameId,
  };
}

export default function PlayerProfileBadge({
  size,
  showXP = false,
  showTitle = true,
  showLevel = true,
  className,
}: PlayerProfileBadgeProps) {
  const [profile, setProfile] = useState<GameProfile>(() => loadCachedGameProfile());
  const [progress, setProgress] = useState(() => loadStudentProgress());
  const economy = useEconomyState();
  const displayProfile = getDisplayProfile(profile);
  const title = PLAYER_TITLES.find((item) => item.id === displayProfile.equippedTitleId) ?? PLAYER_TITLES[0];
  const theme = getProfileTheme(displayProfile.equippedThemeId);
  const typingXP = Math.max(displayProfile.typingXP, economy.typingXP, progress.totalXP, 0);
  const level = Math.max(displayProfile.level, economy.level, progress.currentLevel, 1);
  const xp = useMemo(() => levelXP(typingXP, level), [typingXP, level]);

  useEffect(() => {
    let active = true;
    void getUserProfile().then((nextProfile) => {
      if (active) setProfile(nextProfile);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const refresh = () => {
      setProfile(loadCachedGameProfile());
      setProgress(loadStudentProgress());
    };

    window.addEventListener(USER_PROFILE_EVENT, refresh);
    window.addEventListener('khmer-student-progress-change', refresh);
    window.addEventListener(ECONOMY_EVENT, refresh);
    return () => {
      window.removeEventListener(USER_PROFILE_EVENT, refresh);
      window.removeEventListener('khmer-student-progress-change', refresh);
      window.removeEventListener(ECONOMY_EVENT, refresh);
    };
  }, []);

  const avatarSize = size === 'large' ? 'h-20 w-20 rounded-full' : size === 'medium' ? 'h-14 w-14 rounded-full' : 'h-11 w-11 rounded-full';
  const nameSize = size === 'large' ? 'text-lg' : size === 'medium' ? 'text-base' : 'text-sm';
  const subtitleSize = size === 'large' ? 'text-sm' : 'text-xs';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[18px] border-2 bg-[#062F35]/90 text-left text-white shadow-[0_14px_32px_rgba(0,0,0,.26)]',
        size === 'large' ? 'p-3' : size === 'medium' ? 'p-3' : 'p-2',
        className,
      )}
      style={{
        borderColor: theme.colors.accent,
        boxShadow: `0 14px 32px rgba(0,0,0,.26), inset 0 0 0 1px ${theme.colors.glow}33`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background: `radial-gradient(circle at 18% 0%, ${theme.colors.glow}66, transparent 38%), linear-gradient(135deg, ${theme.colors.sky}AA, transparent 60%, ${theme.colors.ground}BB)`,
        }}
      />
      <div className="relative flex items-center gap-3">
        <span
          className={cn('relative grid shrink-0 place-items-center overflow-hidden border-2 bg-[#0B4A50]', avatarSize)}
          style={{
            borderColor: theme.colors.accent,
            boxShadow: `0 0 18px ${theme.colors.glow}55`,
          }}
        >
          <GeneratedAvatar
            avatarId={displayProfile.equippedAvatarId}
            skinStyleId={displayProfile.equippedSkinId}
            themeId={displayProfile.equippedThemeId}
            frameId={displayProfile.equippedFrameId}
            artStyle="illustration"
            iconOnly
            level={level}
            size="100%"
            ariaLabel={`${displayProfile.displayName} avatar`}
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className={cn('khmer-body truncate font-black text-[#FFE6A6]', nameSize)}>{displayProfile.displayName}</div>
          {showTitle && <div className={cn('truncate font-bold text-[#D6F6EE]', subtitleSize)}>{title.name}</div>}
          {showLevel && (
            <div className={cn('mt-1 inline-flex rounded-full border border-white/20 bg-black/22 px-2 py-0.5 font-black text-[#FBE38B]', subtitleSize)}>
              Level {level}
            </div>
          )}
        </div>
      </div>
      {showXP && (
        <div className="relative mt-3">
          <div className="h-3 overflow-hidden rounded-full bg-black/35 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6DE24D] to-[#F7E55B]"
              style={{ width: `${xp.percent}%` }}
            />
          </div>
          <div className="mt-1 text-center text-xs font-black text-[#D6F6EE]">
            {xp.current.toLocaleString()} / {xp.target.toLocaleString()} XP
          </div>
        </div>
      )}
    </div>
  );
}
