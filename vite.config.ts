import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function normalizeBasePath(value?: string) {
  if (!value) return '/';
  if (/^https?:\/\//i.test(value)) return value.endsWith('/') ? value : `${value}/`;
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: normalizeBasePath(env.VITE_BASE_PATH),
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
    },
  };
});
