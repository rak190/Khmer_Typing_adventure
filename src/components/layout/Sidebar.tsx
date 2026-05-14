import { NavLink } from 'react-router-dom';
import { BookOpen, Crown, Gamepad2, Gift, Home, Map, Settings, ShieldCheck } from 'lucide-react';
import Logo from '../game/Logo';
import CharacterPlaceholder from '../characters/CharacterPlaceholder';

const items = [
  { label: 'Dashboard', khmer: 'ផ្ទាំងគ្រប់គ្រង', to: '/dashboard', icon: Home },
  { label: 'Learn', khmer: 'មេរៀន', to: '/lesson', icon: BookOpen },
  { label: 'World Map', khmer: 'ផែនទី', to: '/map', icon: Map },
  { label: 'Mini-Games', khmer: 'ល្បែង', to: '/battle', icon: Gamepad2 },
  { label: 'Challenges', khmer: 'ប្រកួត', to: '/battle', icon: ShieldCheck },
  { label: 'Rewards', khmer: 'រង្វាន់', to: '/design-system', icon: Gift },
  { label: 'Leaderboards', khmer: 'ចំណាត់ថ្នាក់', to: '/dashboard', icon: Crown },
  { label: 'Settings', khmer: 'កំណត់', to: '/design-system', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 overflow-y-auto bg-gradient-to-b from-[#12A9F0] to-[#78E3FF] px-4 py-5 shadow-2xl lg:block">
      <Logo compact className="mb-5 scale-90 origin-left" />
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 font-black text-[#07315F] transition ${
                  isActive ? 'bg-adventure text-white shadow-button' : 'hover:bg-white/40'
                }`
              }
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-8 overflow-hidden rounded-3xl border-2 border-white/60 bg-gradient-to-b from-white/65 to-primary/35 p-3 text-center shadow-game">
        <CharacterPlaceholder type="lizard" withTiles className="-mx-8 -mb-10 scale-[0.62]" />
        <div className="relative rounded-2xl bg-primary/90 p-3 text-white">
          <div className="khmer-body font-black">រង្វាន់ប្រចាំថ្ងៃ</div>
          <div className="text-sm font-bold">Come back tomorrow for more XP & coins!</div>
        </div>
      </div>
      <div className="mt-8 grid place-items-center">
        <CharacterPlaceholder type="elephant" className="-mb-20 scale-[0.56]" />
      </div>
    </aside>
  );
}
