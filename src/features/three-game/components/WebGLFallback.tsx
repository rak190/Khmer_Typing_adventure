import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type WebGLFallbackProps = {
  message?: string;
};

export default function WebGLFallback({ message }: WebGLFallbackProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const lessonQuery = new URLSearchParams({ world: params.get('world') ?? '1', level: params.get('level') ?? '1' });

  return (
    <div
      data-testid="three-webgl-fallback"
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0A0F1D] px-4 font-khmer text-white"
    >
      <div className="max-w-md rounded-2xl border border-amber-500/30 bg-[#1E293B]/90 p-6 text-center shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h1 className="text-xl font-bold text-amber-300">
          មិនអាចបើក 3D WebGL បានទេ
        </h1>
        <p className="mt-1 text-sm text-slate-300 font-sans">
          WebGL 3D Graphics Unavailable
        </p>

        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          កម្មវិធីរុករក (Browser) ឬកុំព្យូទ័ររបស់អ្នកមិនទាន់បើកដំណើរការ WebGL ឬការបង្កើនល្បឿនផ្នែករឹង (Hardware Acceleration) ទេ។
        </p>

        {message && (
          <div className="mt-3 rounded-lg bg-black/40 px-3 py-2 text-xs font-mono text-amber-200/80">
            {message}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            data-testid="three-fallback-lesson-btn"
            onClick={() => navigate(`/lesson?${lessonQuery}`)}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-400 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            បន្តរៀនវាយអក្សរ 2D (Play 2D Game)
          </button>
          <button
            type="button"
            data-testid="three-fallback-map-btn"
            onClick={() => navigate('/map')}
            className="rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700"
          >
            ត្រឡប់ទៅផែនទី (Back to Map)
          </button>
        </div>
      </div>
    </div>
  );
}
