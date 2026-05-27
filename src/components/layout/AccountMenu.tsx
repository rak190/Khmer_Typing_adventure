import { useEffect, useState } from 'react';
import { BadgeCheck, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOutSession, subscribeToSession, type AppSession } from '../../lib/firebase';
import { loadStudentProgress, type StudentProgress } from '../../lib/studentProgress';
import { USER_PROFILE_EVENT, getSessionDisplayName } from '../../lib/userProfile';
import { PROFILE_AVATARS } from '../../data/avatars';
import { PLAYER_TITLES } from '../../data/playerTitles';
import { getUserProfile, loadCachedGameProfile, type GameProfile } from '../../services/profileService';
import { cn } from '../../lib/cn';

type AccountMenuProps = {
  variant?: 'home' | 'topbar';
};

export default function AccountMenu({ variant = 'home' }: AccountMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<AppSession | null>(null);
  const [progress, setProgress] = useState<StudentProgress>(() => loadStudentProgress());
  const [profile, setProfile] = useState<GameProfile>(() => loadCachedGameProfile());
  const displayName = profile.displayName || getSessionDisplayName(session, progress);
  const avatar = PROFILE_AVATARS.find((item) => item.id === profile.equippedAvatarId) ?? PROFILE_AVATARS[0];
  const title = PLAYER_TITLES.find((item) => item.id === profile.equippedTitleId) ?? PLAYER_TITLES[0];
  const level = progress.currentLevel || 1;

  useEffect(() => subscribeToSession(setSession), []);

  useEffect(() => {
    let active = true;
    void getUserProfile(session?.userId).then((nextProfile) => {
      if (active) setProfile(nextProfile);
    }).catch(() => undefined);
    return () => {
      active = false;
    };
  }, [session?.userId]);

  useEffect(() => {
    const refreshProfile = () => {
      setProfile(loadCachedGameProfile(session?.userId));
      setProgress(loadStudentProgress());
    };

    window.addEventListener(USER_PROFILE_EVENT, refreshProfile);
    window.addEventListener('khmer-student-progress-change', refreshProfile);
    return () => {
      window.removeEventListener(USER_PROFILE_EVENT, refreshProfile);
      window.removeEventListener('khmer-student-progress-change', refreshProfile);
    };
  }, [session?.userId]);

  const buttonClass = variant === 'home'
    ? 'pointer-events-auto flex h-[58px] w-[176px] cursor-pointer items-center gap-2 rounded-[23px] border-2 border-white/35 bg-gradient-to-b from-[#78E0FF]/85 to-[#1472D8]/90 px-3 text-white shadow-[inset_0_-5px_0_rgba(0,38,91,.25),0_9px_16px_rgba(0,36,97,.24)]'
    : 'flex min-w-44 cursor-pointer items-center gap-3 rounded-2xl border border-white/25 bg-white/12 px-3 py-2 text-white shadow-inner';

  const avatarClass = variant === 'home'
    ? 'grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white/75 bg-gradient-to-b from-[#D6FFF7] to-[#30BE69]'
    : 'grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-b from-mint to-primary shadow';

  const logout = async () => {
    await signOutSession();
    setOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="pointer-events-auto relative">
      <button type="button" className={buttonClass} onClick={() => setOpen((value) => !value)} aria-label="គណនីអ្នកលេង">
        <span className={avatarClass}>
          {session?.user?.photoURL && !profile.equippedAvatarId ? (
            <img src={session.user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <img src={avatar.image} alt="" className="h-full w-full object-cover" />
          )}
        </span>
        <span className="min-w-0 flex-1 text-left leading-tight">
          <span className={cn('block truncate font-black', variant === 'home' ? 'text-[16px]' : '')}>{displayName}</span>
          <span className={cn('block truncate font-extrabold text-white/90', variant === 'home' ? 'text-[11px]' : 'text-xs')}>Level {level} · {title.name}</span>
        </span>
        <ChevronDown className="ml-auto shrink-0" size={18} />
      </button>

      {open && (
        <section className="absolute right-0 top-[calc(100%+10px)] z-[90] w-[286px] rounded-[22px] border-[3px] border-[#B9893E] bg-gradient-to-b from-[#FFF8DC] to-[#EFC36E] p-4 text-[#4D2D10] shadow-[0_18px_36px_rgba(0,24,64,.35)]">
          <div className="font-black">គណនីរបស់អ្នក</div>
          <div className="mt-1 truncate text-sm font-bold text-[#65411F]">{session?.user?.email ?? (session?.mode === 'demo' ? 'Guest Adventure' : 'អ្នកលេង')}</div>

          <button
            type="button"
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[16px] border-2 border-[#1764B2] bg-gradient-to-b from-[#7BD8FF] to-[#1764B2] font-black text-white shadow-button"
            onClick={() => {
              setOpen(false);
              navigate('/profile');
            }}
          >
            <BadgeCheck size={18} />
            Open Player Profile
          </button>

          <button
            type="button"
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[16px] border-2 border-[#A41F29] bg-gradient-to-b from-[#FF969B] via-[#EF4E54] to-[#B92430] font-black text-white shadow-button"
            onClick={logout}
          >
            <LogOut size={18} />
            ចាកចេញ
          </button>
        </section>
      )}
    </div>
  );
}
