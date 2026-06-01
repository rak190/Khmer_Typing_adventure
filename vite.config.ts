import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function normalizeBasePath(value?: string) {
  if (!value) return '/';
  if (/^https?:\/\//i.test(value)) return value.endsWith('/') ? value : `${value}/`;
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const adsenseAccount = env.VITE_GOOGLE_ADSENSE_ACCOUNT?.trim();

  return {
    base: normalizeBasePath(env.VITE_BASE_PATH),
    plugins: [
      react(),
      {
        name: 'khmer-typing-adsense-meta',
        transformIndexHtml(html) {
          if (!adsenseAccount) return html;

          return html.replace(
            '</head>',
            `    <meta name="google-adsense-account" content="${escapeHtmlAttribute(adsenseAccount)}" />\n  </head>`,
          );
        },
      },
    ],
    server: {
      host: '127.0.0.1',
      port: 5173,
    },
  };
});
