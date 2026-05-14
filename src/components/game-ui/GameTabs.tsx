import { cn } from '../../lib/cn';

type Tab = {
  id: string;
  label: string;
};

type GameTabsProps = {
  tabs: Tab[];
  active: string;
  onChange?: (id: string) => void;
};

export default function GameTabs({ tabs, active, onChange }: GameTabsProps) {
  return (
    <div className="inline-flex rounded-2xl border-2 border-[#8BB8DC] bg-[#DDF4FF] p-1 shadow-inner">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn('rounded-xl px-4 py-2 font-black text-[#226193] transition', active === tab.id ? 'bg-gradient-to-b from-[#7BD8FF] to-[#1E78E6] text-white shadow-button' : 'hover:bg-white/60')}
          onClick={() => onChange?.(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
