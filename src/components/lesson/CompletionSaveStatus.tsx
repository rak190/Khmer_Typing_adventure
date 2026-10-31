import { useState } from 'react';
import { retryPendingAttempts } from '../../lib/lessonCompletion';

export default function CompletionSaveStatus({ message }: { message: string }) {
  const [retry, setRetry] = useState('');
  if (!message) return null;
  return <div role="status" className="fixed bottom-4 left-4 z-50 max-w-sm rounded-xl bg-slate-900 p-3 text-sm text-white">
    <p>ការរក្សាទុក · {retry || message}</p>
    <button className="underline" onClick={() => { setRetry('Saving…'); void retryPendingAttempts().then(() => setRetry('Pending saves synchronized')).catch(() => setRetry('Save failed. Retained on this device; retry when online.')); }}>ព្យាយាមម្ដងទៀត · Retry pending saves</button>
  </div>;
}
