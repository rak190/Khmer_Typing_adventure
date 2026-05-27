import { useEffect, useState } from 'react';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOutSession, subscribeToSession, type AppSession } from '../../lib/firebase';
import { loadStudentProgress, type StudentProgress } from '../../lib/studentProgress';
import {
  USER_PROFILE_EVENT,
  avatarChoices,
  getSessionAvatar,
  getSessionDisplayName,
  loadUserProfile,
  saveUserProfile,
} from '../../lib/userProfile';
import { cn } from '../../lib/cn';

type AccountMenuProps = {
  variant?: 'home' | 'topbar';
};

export default function AccountMenu({ variant = 'home' }: AccountMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<AppSession | null>(null);
  const [progress, setProgress] = useState<StudentProgress>(() => loadStudentProgress());
  const [profile, setProfile] = useState(() => loadUserProfile());
  const displayName = getSessionDisplayName(session, progress);
  const avatar = getSessionAvatar(session);
  const level = progress.currentLevel || 1;

  useEffect(() => subscribeToSession(setSession), []);

  useEffect(() => {
    const refreshProfile = () => {
      setProfile(loadUserProfile());
      setProgress(loadStudentProgress());
    };

    window.addEventListener(USER_PROFILE_EVENT, refreshProfile);
    window.addEventListener('khmer-student-progress-change', refreshProfile);
    return () => {
      window.removeEventListener(USER_PROFILE_EVENT, refreshProfile);
      window.removeEventListener('khmer-student-progress-change', refreshProfile);
    };
  }, []);

  const buttonClass = variant === 'home'
    ? 'pointer-events-auto flex h-[58px] w-[176px] cursor-pointer items-center gap-2 rounded-[23px] border-2 border-white/35 bg-gradient-to-b from-[#78E0FF]/85 to-[#1472D8]/90 px-3 text-white shadow-[inset_0_-5px_0_rgba(0,38,91,.25),0_9px_16px_rgba(0,36,97,.24)]'
    : 'flex min-w-44 cursor-pointer items-center gap-3 rounded-2xl border border-white/25 bg-white/12 px-3 py-2 text-white shadow-inner';

  const avatarClass = variant === 'home'
    ? 'grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white/75 bg-gradient-to-b from-[#D6FFF7] to-[#30BE69]'
    : 'grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-b from-mint to-primary shadow';

  const chooseAvatar = (nextAvatar: string) => {
    setProfile(saveUserProfile({ ...profile, avatar: nextAvatar }));
  };

  const logout = async () => {
    await signOutSession();
    setOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="pointer-events-auto relative">
      <button type="button" className={buttonClass} onClick={() => setOpen((value) => !value)} aria-label="គណនីអ្នកលេង">
        <span className={avatarClass}>
          {avatar.kind === 'image' ? (
            <img src={avatar.value} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="khmer-body text-[22px] font-black">{avatar.value || <UserRound size={23} />}</span>
          )}
        </span>
        <span className="min-w-0 flex-1 text-left leading-tight">
          <span className={cn('block truncate font-black', variant === 'home' ? 'text-[16px]' : '')}>{displayName}</span>
          <span className={cn('block font-extrabold text-white/90', variant === 'home' ? 'text-[11px]' : 'text-xs')}>កម្រិត {level}</span>
        </span>
        <ChevronDown className="ml-auto shrink-0" size={18} />
      </button>

      {open && (
        <section className="absolute right-0 top-[calc(100%+10px)] z-[90] w-[286px] rounded-[22px] border-[3px] border-[#B9893E] bg-gradient-to-b from-[#FFF8DC] to-[#EFC36E] p-4 text-[#4D2D10] shadow-[0_18px_36px_rgba(0,24,64,.35)]">
          <div className="font-black">គណនីរបស់អ្នក</div>
          <div className="mt-1 truncate text-sm font-bold text-[#65411F]">{session?.user?.email ?? (session?.mode === 'demo' ? 'Guest Adventure' : 'អ្នកលេង')}</div>

          {avatar.kind !== 'image' && (
            <div className="mt-3">
              <div className="mb-2 text-xs font-black uppercase text-[#7A4D19]">ជ្រើសរូបគណនី</div>
              <div className="grid grid-cols-6 gap-2">
                {avatarChoices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    className={cn(
                      'grid h-9 w-9 place-items-center rounded-full border-2 bg-white/70 text-lg font-black shadow-inner',
                      profile.avatar === choice ? 'border-[#1764B2] ring-2 ring-[#7ED8FF]' : 'border-[#DDBD70]',
                    )}
                    onClick={() => chooseAvatar(choice)}
                    aria-label={`ជ្រើសរូប ${choice}`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          )}

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
