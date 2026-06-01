# AdSense Readiness Checklist

Do not submit Khmer Typing Adventure to AdSense until every required item below is true in the production deployment.

## Public Trust Pages

- [ ] Public `/about` page is complete and reachable without login.
- [ ] Public `/contact` page is complete and reachable without login.
- [ ] Public `/privacy` page is complete and reachable without login.
- [ ] Public `/terms` page is complete and reachable without login.
- [ ] Public `/help` page is complete and reachable without login.
- [ ] Public `/parents-teachers` page is complete and reachable without login.
- [ ] Public learning pages are complete: `/lessons`, `/khmer-keyboard-guide`, and `/typing-practice`.
- [ ] Footer and homepage links point to real routes, not placeholder text.

## Policy And Safety

- [ ] Privacy policy explains account data, Firebase/auth data, progress data, cookies/storage, analytics/ads caution, and deletion/correction requests.
- [ ] Terms explain acceptable use, account responsibility, no cheating/abuse, educational use, and liability limits.
- [ ] Contact page explains how users, parents, or teachers can request help, correction, or deletion.
- [ ] Parents & Teachers page explains student safety, data collection, classroom use, and ad/privacy caution.
- [ ] Child/student privacy has been reviewed for the production audience.
- [ ] Ad placement has been reviewed against invalid click, rewarded click, accidental click, and deceptive placement policies.
- [ ] No page asks users to click ads or implies rewards for ad interaction.

## Crawling And SEO

- [ ] `public/robots.txt` exists and does not block Google or AdSense crawlers.
- [ ] `public/sitemap.xml` exists and lists only public routes.
- [ ] Protected routes such as `/dashboard`, `/shop`, `/profile`, `/map`, `/lesson`, and `/battle` are not listed in the sitemap.
- [ ] Canonical URL and sitemap domain have been changed from `https://example.com` to the real production domain.
- [ ] Site is accessible to reviewers without a password for public pages.

## AdSense Configuration

- [ ] `public/ads.txt` is created from `public/ads.txt.example`.
- [ ] `public/ads.txt` uses the real publisher ID, not `pub-XXXXXXXXXXXXXXXX`.
- [ ] `VITE_GOOGLE_ADSENSE_ACCOUNT` is set to the real `ca-pub-...` value in production.
- [ ] No fake AdSense publisher ID is deployed.
- [ ] `VITE_ADS_ENABLED` remains `false` until ad placement and child/student treatment are reviewed.
- [ ] `VITE_PERSONALIZED_ADS_ENABLED` remains `false` for student/child audiences unless a responsible production review says otherwise.
- [ ] `VITE_CHILD_DIRECTED_TREATMENT` is configured correctly for the production audience.
- [ ] No ad display units are added until the policy review is complete.

## Product Honesty

- [ ] No fake or unsupported statistics remain, such as unverified student counts, school counts, or approval percentages.
- [ ] No unsupported curriculum, school, government, or teacher approval claims remain.
- [ ] Public copy clearly explains which features require login.
- [ ] Internal/development routes such as `/design-system` are hidden in production.

## Production Data Readiness

- [ ] Firebase Auth is configured in production.
- [ ] Firestore is configured in production.
- [ ] Required Firebase environment variables are set:
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
- [ ] Production login does not silently fall back to demo or in-memory persistence.
- [ ] Firestore security rules allow users to access only their own profile/progress data.

## Quality Checks

- [ ] `npm install` has completed successfully.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] Production deployment has been manually opened and public pages work after refresh.

## UI Preservation Reminder

The current UI/visual design is already good. Do not redesign the app for AdSense readiness work. Only make the smallest UI changes required for content completeness, real working links/routes, policy pages, SEO files, privacy/children safety, production configuration, and build correctness.
