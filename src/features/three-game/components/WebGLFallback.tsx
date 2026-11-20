import { AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type WebGLFallbackProps = {
  message?: string;
};

export default function WebGLFallback({ message }: WebGLFallbackProps) {
  return (
    <div
      data-testid="three-webgl-fallback"
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0A0F1D] px-4 font-khmer text-white"
    >
      <div className="max-w-lg rounded-3xl border-2 border-amber-500/40 bg-[#1E293B]/95 p-8 text-center shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <h1 className="text-2xl font-bold text-amber-300">
          ទាមទារប្រព័ន្ធ 3D WebGL2
        </h1>
        <p className="mt-1 text-sm font-sans text-slate-300">
          WebGL2 Hardware Graphics Acceleration Required
        </p>

        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Khmer Typing Adventure ដំណើរការជាពិភព 3D ទាំងស្រុង។ កម្មវិធីរុករក (Browser)
          របស់អ្នកត្រូវការ WebGL2 និងការបង្កើនល្បឿនផ្នែករឹង (Hardware Acceleration) ដើម្បីដំណើរការ។
        </p>

        {message && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-black/50 px-4 py-2 text-xs font-mono text-amber-200">
            {message}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-900/60 p-4 text-left text-xs text-slate-300 space-y-2">
          <div className="font-bold text-amber-200">វិធីដោះស្រាយបញ្ហា (Troubleshooting Steps):</div>
          <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
            <li>
              <strong>Google Chrome / Brave / Edge:</strong> ចូលទៅ Settings &rarr; System &rarr; បើក &ldquo;Use graphics acceleration when available&rdquo; រួច Restart Browser។
            </li>
            <li>
              <strong>Mozilla Firefox:</strong> ចូលទៅ Settings &rarr; Performance &rarr; ធីក &ldquo;Use recommended performance settings&rdquo;។
            </li>
            <li>
              <strong>Graphic Drivers:</strong> សូមធ្វើបច្ចុប្បន្នភាព Driver កាតក្រាហ្វិក (Intel, AMD, ឬ Nvidia)។
            </li>
            <li>
              ពិនិត្យមើលគេហទំព័រ <a href="https://get.webgl.org/webgl2/" target="_blank" rel="noreferrer" className="text-sky-400 underline hover:text-sky-300">get.webgl.org/webgl2</a> ដើម្បីសាកល្បងសមត្ថភាព WebGL2។
            </li>
          </ol>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            data-testid="three-reload-btn"
            onClick={() => window.location.reload()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-amber-300 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            ព្យាយាមឡើងវិញ (Reload)
          </button>
          <Link
            to="/help"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700"
          >
            <HelpCircle className="h-4 w-4" />
            ជំនួយ (Help Center)
          </Link>
        </div>
      </div>
    </div>
  );
}
