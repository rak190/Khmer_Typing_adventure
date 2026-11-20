import { useState } from 'react';
import { X, MapPin, BookOpen, Compass, Award, ShoppingBag, User, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { buildAdventureWorlds, getLessonState } from '../../../data/adventureWorlds';
import { WORLD_CHECKPOINTS } from '../physics/Checkpoints';
import { isFastTravelDiscovered, isCheckpointDiscovered } from '../../../lib/explorationRecord';
import { getGraphicsQuality, setGraphicsQuality, type GraphicsQuality } from '../config/graphicsQuality';
import { PROFILE_SKINS } from '../../../data/profileSkins';

export type ServiceTab = 'sanctuary' | 'map' | 'observatory' | 'market' | 'wardrobe' | 'settings';

type InWorldServicesModalProps = {
  initialTab?: ServiceTab;
  onClose: () => void;
  onSelectLesson: (worldId: number, levelId: number | 'boss') => void;
  onFastTravel: (targetPosition: [number, number, number]) => void;
  currentRegionName?: string;
};

export default function InWorldServicesModal({
  initialTab = 'sanctuary',
  onClose,
  onSelectLesson,
  onFastTravel,
  currentRegionName = 'Angkor Hub',
}: InWorldServicesModalProps) {
  const [activeTab, setActiveTab] = useState<ServiceTab>(initialTab);
  const [quality, setQuality] = useState<GraphicsQuality>(getGraphicsQuality);
  const worlds = buildAdventureWorlds();

  const handleQualityChange = (q: GraphicsQuality) => {
    setQuality(q);
    setGraphicsQuality(q);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="in-world-service-modal"
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 font-khmer backdrop-blur-md"
    >
      <div className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-slate-900 text-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-400/30 bg-slate-950/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-300">សេវាពិភពបុរាណ · World Services</h2>
              <p className="text-xs text-slate-400">Current Area: {currentRegionName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50 px-6 py-2 text-sm font-semibold">
          {[
            { id: 'sanctuary', label: 'វិហារអក្ខរក្រម (Lessons)', icon: BookOpen },
            { id: 'map', label: 'ផែនទីធ្វើដំណើរ (Fast Travel)', icon: Compass },
            { id: 'observatory', label: 'ហោរាសាស្រ្ត (Progress)', icon: Award },
            { id: 'market', label: 'ផ្សារបុរាណ (Shop)', icon: ShoppingBag },
            { id: 'wardrobe', label: 'ភូសន្តរាភរណ៍ (Wardrobe)', icon: User },
            { id: 'settings', label: 'ការកំណត់ (Settings)', icon: SettingsIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as ServiceTab)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 transition ${
                activeTab === id
                  ? 'border-amber-400 text-amber-300 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: LEARNING SANCTUARY (LESSONS) */}
          {activeTab === 'sanctuary' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/40 p-4">
                <h3 className="text-lg font-bold text-emerald-300">Touch-Typing Foundation · មូលដ្ឋានគ្រឹះម្រាមដៃ</h3>
                <p className="mt-1 text-xs text-slate-300">
                  Home row finger positioning and tactile anchoring for beginners.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectLesson(1, 1);
                  }}
                  className="mt-3 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-300"
                >
                  Start Foundation Practice &rarr;
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-amber-300 mb-3">Curriculum Worlds (54 Lessons)</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {worlds.map((world) => (
                    <div key={world.id} className="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
                      <div className="flex items-center justify-between">
                        <span className="rounded-lg bg-amber-400/20 px-2.5 py-1 text-xs font-bold text-amber-300">
                          World {world.id}
                        </span>
                        <span className="text-xs text-slate-400">{world.title}</span>
                      </div>
                      <h4 className="mt-2 text-base font-bold text-white">{world.titleKh}</h4>
                      <p className="text-xs text-slate-300 line-clamp-1">{world.skillFocus}</p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {world.lessons.map((lesson) => {
                          const state = getLessonState(world, lesson);
                          const isLocked = state === 'locked';
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              disabled={isLocked}
                              onClick={() => {
                                onClose();
                                onSelectLesson(world.id, lesson.id);
                              }}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                isLocked
                                  ? 'border border-slate-700 bg-slate-800/50 text-slate-500 cursor-not-allowed'
                                  : state === 'completed'
                                  ? 'border border-emerald-400/40 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80'
                                  : 'border border-amber-400/50 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
                              }`}
                            >
                              {lesson.id === 'boss' ? 'Boss' : `L${lesson.id}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CARTOGRAPHER SHRINE (FAST TRAVEL) */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-sky-400/30 bg-sky-950/40 p-4">
                <h3 className="text-lg font-bold text-sky-300">Fast Travel · ផ្លូវកាត់ធ្វើដំណើរ</h3>
                <p className="mt-1 text-xs text-slate-300">
                  Select any discovered Angkorian checkpoint to teleport across the continuous world seamlessly.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {WORLD_CHECKPOINTS.map((cp) => {
                  const discovered = isFastTravelDiscovered(cp.id) || isCheckpointDiscovered(cp.id);
                  return (
                    <div
                      key={cp.id}
                      className={`flex flex-col justify-between rounded-2xl border p-4 ${
                        discovered
                          ? 'border-amber-400/40 bg-slate-800 hover:border-amber-400'
                          : 'border-slate-800 bg-slate-900/50 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin className={`h-4 w-4 ${discovered ? 'text-amber-400' : 'text-slate-600'}`} />
                          <span className="text-sm font-bold text-white">{cp.nameKh}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{cp.nameEn}</p>
                      </div>

                      <button
                        type="button"
                        disabled={!discovered}
                        onClick={() => {
                          onClose();
                          onFastTravel(cp.position);
                        }}
                        className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition ${
                          discovered
                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {discovered ? 'Teleport Here · ទៅទីនេះ' : 'Locked · មិនទាន់រកឃើញ'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SCHOLAR OBSERVATORY (PROGRESS & WEAK KEYS) */}
          {activeTab === 'observatory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-amber-400/30 bg-slate-800 p-4 text-center">
                  <div className="text-xs uppercase text-slate-400">Total Lessons</div>
                  <div className="text-2xl font-bold text-amber-300">54</div>
                </div>
                <div className="rounded-2xl border border-sky-400/30 bg-slate-800 p-4 text-center">
                  <div className="text-xs uppercase text-slate-400">Speed Target</div>
                  <div className="text-2xl font-bold text-sky-300">CPM Metric</div>
                </div>
                <div className="rounded-2xl border border-emerald-400/30 bg-slate-800 p-4 text-center">
                  <div className="text-xs uppercase text-slate-400">Accuracy Priority</div>
                  <div className="text-2xl font-bold text-emerald-300">90%+</div>
                </div>
                <div className="rounded-2xl border border-purple-400/30 bg-slate-800 p-4 text-center">
                  <div className="text-xs uppercase text-slate-400">Curriculum</div>
                  <div className="text-2xl font-bold text-purple-300">6 Worlds</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5">
                <h4 className="text-base font-bold text-amber-300">Weak-Key Remediation System</h4>
                <p className="mt-1 text-xs text-slate-300">
                  Keys with mistakes or backspaces are automatically tracked to generate personalized training runes.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['ក', 'ខ', 'គ', 'ង', 'ច', 'ឆ', 'ជ', 'ដ', 'ឋ'].map((char) => (
                    <div
                      key={char}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-slate-900 text-lg font-bold text-amber-200"
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MARKET DISTRICT (SHOP & ITEMS) */}
          {activeTab === 'market' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-400/30 bg-amber-950/30 p-4">
                <h3 className="text-lg font-bold text-amber-300">Angkorian Bazaar · ផ្សារបុរាណ</h3>
                <p className="mt-1 text-xs text-slate-300">
                  Equip potions, retry tokens, and explorer gear earned through typing milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { name: 'Retry Token · សញ្ញាសាកល្បង', cost: '300 កាក់', desc: 'Allows instant retry without streak penalty.' },
                  { name: 'Khmer Explorer Cape · អាវផាយអង្គរ', cost: '500 កាក់', desc: 'Teal cape with embroidered Angkor Wat towers.' },
                  { name: 'Golden Diadem · ម្កុដមាស', cost: '1,000 កាក់', desc: 'Royal golden diadem with glowing cyan sapphire.' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col justify-between rounded-2xl border border-slate-700 bg-slate-800 p-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <p className="mt-1 text-xs text-slate-400">{item.desc}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">{item.cost}</span>
                      <button type="button" className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-300">
                        Purchase
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: WARDROBE PAVILION (COSMETICS) */}
          {activeTab === 'wardrobe' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-pink-400/30 bg-pink-950/30 p-4">
                <h3 className="text-lg font-bold text-pink-300">Wardrobe Pavilion · ភូសន្តរាភរណ៍</h3>
                <p className="mt-1 text-xs text-slate-300">
                  Select and preview your adventurer skins, clothing palettes, and regal accessories.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PROFILE_SKINS.map((skin) => (
                  <button
                    key={skin.id}
                    type="button"
                    className="flex flex-col items-center rounded-2xl border border-slate-700 bg-slate-800 p-4 transition hover:border-amber-400"
                  >
                    <div
                      className="h-12 w-12 rounded-full border-2 border-white/40 shadow-md"
                      style={{ background: skin.gradient }}
                    />
                    <span className="mt-2 text-xs font-bold text-white">{skin.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS SHRINE (GRAPHICS & AUDIO) */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
                <h4 className="text-base font-bold text-amber-300">Graphics Quality Profile · គុណភាពក្រាហ្វិក</h4>
                <p className="mt-1 text-xs text-slate-300">
                  Adjust rendering fidelity to match your school PC or laptop hardware.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { id: 'low' as const, label: 'Low (30 FPS)', desc: 'Lowest hardware / Integrated GPU' },
                    { id: 'balanced' as const, label: 'Balanced (60 FPS)', desc: 'Intel Iris Xe / Recommended' },
                    { id: 'high' as const, label: 'High (60 FPS+)', desc: 'Dedicated GPU / Max shadows' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => handleQualityChange(lvl.id)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 transition ${
                        quality === lvl.id
                          ? 'border-amber-400 bg-amber-400/20 text-white font-bold'
                          : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{lvl.label}</span>
                      <span className="text-[10px] text-slate-400 text-center mt-1">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5 space-y-4">
                <h4 className="text-base font-bold text-amber-300">Accessibility & Controls</h4>
                <label className="flex items-center justify-between text-sm">
                  <span>Khmer Finger Guidance Overlays</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-amber-400" />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Opposite-Hand Shift Guidance</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-amber-400" />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Reduced Motion / Camera Shake</span>
                  <input type="checkbox" className="h-4 w-4 rounded accent-amber-400" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
