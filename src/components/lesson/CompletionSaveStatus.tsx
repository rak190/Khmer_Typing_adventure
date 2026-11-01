import { useState } from 'react';
import { retryPendingAttempts, isStudentOnlineSaveAvailable } from '../../lib/lessonCompletion';

export type CompletionSaveStatusProps = {
  message?: string;
  status?:
    | 'saving'
    | 'saved'
    | 'pending-offline'
    | 'backend-unavailable'
    | 'save-failed'
    | 'local-demo'
    | 'idle';
};

export default function CompletionSaveStatus({
  message = '',
  status,
}: CompletionSaveStatusProps) {
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  if (!message && (!status || status === 'idle')) {
    return null;
  }

  const isSaved = status === 'saved' || message.startsWith('Saved');
  const isSaving = isRetrying || status === 'saving' || message.startsWith('Saving');
  const isLocalOnly = status === 'backend-unavailable' || status === 'local-demo';
  const isFailedOrPending =
    status === 'save-failed' ||
    status === 'pending-offline' ||
    message.includes('failed') ||
    message.includes('pending');

  const handleRetry = async () => {
    if (!isStudentOnlineSaveAvailable()) {
      setRetryStatus('ម៉ាស៊ីនបម្រើ Cloud មិនទាន់ដំណើរការ — រក្សាទុកក្នុងឧបករណ៍ (Online backend unavailable; retained locally)');
      return;
    }
    setIsRetrying(true);
    setRetryStatus('កំពុងបញ្ជូន... (Synchronizing pending saves…)');
    try {
      const res = await retryPendingAttempts();
      if (res.failed === 0 && res.succeeded > 0) {
        setRetryStatus('បានបញ្ជូនដោយជោគជ័យ (Pending saves synchronized)');
      } else if (res.failed > 0) {
        setRetryStatus(`បានបញ្ជូន ${res.succeeded} — នៅសល់ ${res.failed} (Retry when connection stabilizes)`);
      } else {
        setRetryStatus('គ្មានទិន្នន័យនៅសល់ (No pending saves remaining)');
      }
    } catch {
      setRetryStatus('ការបញ្ជូនមិនទាន់បានសម្រេច — រក្សាទុកក្នុងឧបករណ៍ (Save retained on this device; retry when online)');
    } finally {
      setIsRetrying(false);
    }
  };

  const displayText = retryStatus || message;

  return (
    <div
      role="status"
      data-testid="completion-save-status"
      className={`fixed bottom-4 left-4 z-50 max-w-md rounded-2xl border p-3.5 text-xs shadow-2xl backdrop-blur-md transition-all ${
        isSaved
          ? 'border-emerald-500/40 bg-slate-900/95 text-emerald-300 shadow-emerald-950/40'
          : isSaving
          ? 'border-blue-500/40 bg-slate-900/95 text-blue-300 shadow-blue-950/40'
          : isLocalOnly
          ? 'border-slate-700 bg-slate-900/90 text-slate-300 shadow-black/50'
          : 'border-amber-500/40 bg-slate-900/95 text-amber-200 shadow-amber-950/40'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold">
          {isSaved
            ? '✓ រក្សាទុកជោគជ័យ (Saved)'
            : isSaving
            ? '⏳ កំពុងរក្សាទុក (Saving)'
            : isLocalOnly
            ? '💾 រក្សាទុកលើឧបករណ៍ (Local Storage)'
            : '⚠️ ការរក្សាទុក (Sync Status)'}
        </span>
      </div>

      <p className="mt-1 leading-relaxed text-slate-200">{displayText}</p>

      {isFailedOrPending && (
        <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-3">
          <button
            type="button"
            disabled={isRetrying}
            className="underline font-bold text-amber-300 hover:text-amber-200 transition disabled:opacity-50"
            onClick={handleRetry}
          >
            ព្យាយាមម្ដងទៀត · Retry pending saves
          </button>
        </div>
      )}
    </div>
  );
}
