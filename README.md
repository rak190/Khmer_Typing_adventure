# Khmer Typing Adventure

A responsive Khmer-first typing learning game built with React, TypeScript, Vite, Tailwind CSS, React Router, Framer Motion, Recharts, and Firebase-ready demo mode.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Push To GitHub Beginner Guide

Follow these steps when you finish editing the project and want to upload your changes to GitHub.

### 1. Open PowerShell

Open PowerShell, then go to this project folder:

```powershell
cd D:\Khmer_Typing_adventure_codex
```

### 2. Check What Changed

This command shows which files you changed:

```powershell
git status
```

If you see file names in red, that means Git sees your changes but they are not ready to commit yet.

### 3. Test The Project Before Pushing

Run this first to make sure the project can build:

```powershell
npm run build
```

If you also want to check code style, run:

```powershell
npm run lint
```

If there is an error, fix the error before pushing.

### 4. Add Your Changes

This command prepares all changed files for commit:

```powershell
git add .
```

### 5. Create A Commit

A commit is like saving a named version of your work. Change the message to explain what you changed:

```powershell
git commit -m "Describe what you changed"
```

Example:

```powershell
git commit -m "Fix dashboard and shop buttons"
```

### 6. Push To GitHub

This command uploads your commit to GitHub:

```powershell
git push
```

### 7. If Git Says No Upstream Branch

If Git says the branch has no upstream branch, run this command:

```powershell
git push -u origin your-branch-name
```

Example:

```powershell
git push -u origin codex-khmer-typing-gamification
```

### Quick Version

After you understand the steps, you can usually run:

```powershell
cd D:\Khmer_Typing_adventure_codex
git status
npm run build
git add .
git commit -m "Describe what you changed"
git push
```

## Firebase

The app can use development demo mode when Firebase is not configured, but production deployments should configure Firebase Auth and Firestore so users do not think progress is saved when it is only local or in memory.

Required production environment variables:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Optional:

```bash
VITE_FIREBASE_MEASUREMENT_ID=
```

Development behavior:

- If Firebase variables are missing, the app allows demo/in-memory fallback and shows a development-only Firebase warning.
- Demo progress is only for testing and should not be treated as durable student data.

Production behavior:

- If required Firebase variables are missing, login and saved-progress features are disabled with a clear error.
- Do not launch a public product that promises saved accounts or progress until Firebase Auth and Firestore are configured.

## Google AdSense Verification

Do not commit a fake live publisher ID. Use the placeholders only as examples, and replace them with the real AdSense publisher ID from your Google AdSense account before production.

### 1. Add the AdSense account meta tag

Set this value in `.env.local` or your production hosting environment:

```bash
VITE_GOOGLE_ADSENSE_ACCOUNT=ca-pub-XXXXXXXXXXXXXXXX
```

Replace `ca-pub-XXXXXXXXXXXXXXXX` with the real account value from AdSense. When this variable is empty or missing, the build does not add the `google-adsense-account` meta tag.

### 2. Add ads.txt only when you have the real publisher ID

Copy the example file:

```bash
copy public\ads.txt.example public\ads.txt
```

Then edit `public/ads.txt` and replace `pub-XXXXXXXXXXXXXXXX` with the real publisher ID from AdSense:

```text
google.com, pub-YOUR_REAL_PUBLISHER_ID, DIRECT, f08c47fec0942fa0
```

Do not deploy `public/ads.txt` with the placeholder publisher ID.

### 3. Keep student-safe monetization defaults

Monetization is disabled by default. Configure these only after reviewing AdSense child/teen treatment, school privacy requirements, and whether the app is being used by children or students:

```bash
VITE_ADS_ENABLED=false
VITE_PERSONALIZED_ADS_ENABLED=false
VITE_CHILD_DIRECTED_TREATMENT=true
```

The central settings live in `src/config/monetization.ts`. Do not add ad units, rewarded clicks, or messages asking learners to click ads. Any future ad component should read these settings and pass the child/age treatment configuration to the ad provider.

## GitHub Pages

For a project page, set:

```bash
VITE_BASE_PATH=/your-repo-name/
```

Then run:

```bash
npm run deploy
```
