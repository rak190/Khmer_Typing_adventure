import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, Play, Shield, Sparkles, UserPlus } from 'lucide-react';
import GameButton from '../components/game-ui/GameButton';
import GameIcon from '../components/game-ui/GameIcon';
import LizardMascot from '../components/characters/LizardMascot';
import PageTransition from '../components/layout/PageTransition';
import { backgroundImages, imageAssets } from '../assets/assetManifest';
import { createAccountWithEmail, firebaseEnabled, signInAsGuest, signInWithEmail, signInWithGoogle } from '../lib/firebase';

type LoginMode = 'login' | 'create';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');

    try {
      if (mode === 'create') {
        await createAccountWithEmail(email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
      navigate('/', { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'មិនអាចចូលទៅកាន់ Adventure បានទេ។');
    } finally {
      setBusy(false);
    }
  };

  const quickStart = async () => {
    setBusy(true);
    setError('');

    try {
      await signInAsGuest();
      navigate('/', { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'មិនអាចចាប់ផ្តើម Guest Adventure បានទេ។');
    } finally {
      setBusy(false);
    }
  };

  const googleLogin = async () => {
    setBusy(true);
    setError('');

    try {
      await signInWithGoogle();
      navigate('/', { replace: true });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Google Login មិនទាន់អាចប្រើបានទេ។');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageTransition className="min-h-screen overflow-hidden bg-[#0597D8]">
      <main
        className="relative grid min-h-screen place-items-center px-5 py-8"
        style={{
          backgroundImage: `linear-gradient(180deg,rgba(3,125,190,.1),rgba(0,54,118,.45)), url(${backgroundImages.home})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,.28),transparent_30%),linear-gradient(180deg,rgba(255,255,255,.12),rgba(0,47,92,.34))]" />

        <section className="relative z-10 grid w-full max-w-[1160px] items-center gap-6 lg:grid-cols-[1fr_450px]">
          <div className="relative min-h-[600px]">
            <img src={imageAssets.logo} alt="Khmer Typing Adventure" className="h-[210px] w-[360px] object-contain drop-shadow-[0_18px_18px_rgba(0,30,72,.35)]" />
            <div className="pointer-events-none absolute left-[18px] top-[205px] w-[280px]">
              <LizardMascot className="w-[280px] max-w-none drop-shadow-[0_20px_20px_rgba(0,35,65,.38)]" withTiles={false} animated={false} />
            </div>
            <div className="absolute bottom-8 left-[250px] max-w-[470px] rounded-[30px] border-[4px] border-[#8B5426] bg-gradient-to-b from-[#FFF4C8] via-[#FAD580] to-[#C98235] p-5 text-[#4A2A10] shadow-[0_22px_34px_rgba(0,30,62,.38),inset_0_2px_0_rgba(255,255,255,.5)]">
              <div className="flex items-center gap-3">
                <GameIcon name="shield" size={42} className="text-[#1E78E6]" />
                <div>
                  <div className="khmer-body text-[28px] font-black leading-tight">ចូលដំណើរផ្សងព្រេង</div>
                  <div className="text-[18px] font-black">Login ចូលលេង</div>
                </div>
              </div>
              <p className="mt-3 text-[15px] font-extrabold leading-snug">
                ចូលគណនីដើម្បីរក្សាទុកវឌ្ឍនភាពពិភពលោក ផ្កាយ រង្វាន់ ការឈ្នះ Boss និងមេរៀន Typing ជាមួយ Firebase។
              </p>
            </div>
          </div>

          <div className="rounded-[34px] border-[5px] border-[#78451F] bg-gradient-to-b from-[#FFF5D0] via-[#FFFDF5] to-[#E5C27D] p-5 text-[#4A2A10] shadow-[0_26px_44px_rgba(0,24,64,.45),inset_0_2px_0_rgba(255,255,255,.55)]">
            <div className="rounded-[24px] border-[3px] border-[#2B348F] bg-gradient-to-r from-[#293AA8] via-[#5D47DC] to-[#7A51EF] px-5 py-4 text-white shadow-[inset_0_-6px_0_rgba(0,0,0,.18)]">
              <div className="flex items-center gap-3">
                <Sparkles size={34} className="text-[#FFE86A]" />
                <div>
                  <h1 className="text-[28px] font-black leading-tight">{mode === 'login' ? 'សូមស្វាគមន៍' : 'បង្កើតអ្នកលេងថ្មី'}</h1>
                  <div className="text-sm font-bold text-white/86">គណនី Adventure ត្រៀមភ្ជាប់ Firebase</div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-[22px] bg-[#6B421F]/12 p-2">
              <button
                type="button"
                className={`h-12 rounded-[17px] text-base font-black transition ${mode === 'login' ? 'bg-gradient-to-b from-[#7BD8FF] to-[#1767C6] text-white shadow-button' : 'text-[#65411F]'}`}
                onClick={() => setMode('login')}
              >
                ចូលគណនី
              </button>
              <button
                type="button"
                className={`h-12 rounded-[17px] text-base font-black transition ${mode === 'create' ? 'bg-gradient-to-b from-[#B9FF69] to-[#159447] text-white shadow-button' : 'text-[#65411F]'}`}
                onClick={() => setMode('create')}
              >
                អ្នកលេងថ្មី
              </button>
            </div>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-black text-[#5A3A17]"><Mail size={18} /> អ៊ីមែល Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-14 w-full rounded-[18px] border-[3px] border-[#D4A65E] bg-white/95 px-4 text-lg font-bold text-[#253858] shadow-inner outline-none focus:border-[#248CEC]"
                  placeholder="student@example.com"
                />
              </label>
              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-black text-[#5A3A17]"><LockKeyhole size={18} /> ពាក្យសម្ងាត់ Password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-14 w-full rounded-[18px] border-[3px] border-[#D4A65E] bg-white/95 px-4 text-lg font-bold text-[#253858] shadow-inner outline-none focus:border-[#248CEC]"
                  placeholder="យ៉ាងតិច 6 តួអក្សរ"
                />
              </label>

              {error && (
                <div className="rounded-[18px] border-2 border-[#E1493D] bg-[#FFE8E4] px-4 py-3 text-sm font-black text-[#9C221D]">
                  {error}
                </div>
              )}

              <GameButton type="submit" variant="green" size="xl" className="h-[68px] w-full rounded-[24px] text-[22px]" rightIcon={mode === 'login' ? <Play size={28} /> : <UserPlus size={28} />} disabled={busy}>
                {busy ? 'កំពុងដំណើរការ...' : mode === 'login' ? 'ចូល Adventure' : 'បង្កើតគណនី'}
              </GameButton>
            </form>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <GameButton variant="blue" size="md" className="h-[54px] rounded-[20px]" onClick={googleLogin} disabled={busy}>
                Google Login
              </GameButton>
              <GameButton variant="gold" size="md" className="h-[54px] rounded-[20px]" onClick={quickStart} disabled={busy}>
                ចូលជា Guest
              </GameButton>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-[18px] border-2 border-[#C99A55] bg-[#FFF8E4] px-4 py-3 text-xs font-black text-[#6B4A24]">
              <Shield size={22} className="text-[#159447]" />
              {firebaseEnabled ? 'Firebase progress saving is ready for classroom practice.' : 'Firebase config is missing. Progress can only stay in memory for this session.'}
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}
