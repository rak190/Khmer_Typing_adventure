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

The app runs with local mock data by default. Add the Firebase values from `.env.example` to `.env.local` and the app will initialize Firebase Auth and Firestore automatically.

## GitHub Pages

For a project page, set:

```bash
VITE_BASE_PATH=/your-repo-name/
```

Then run:

```bash
npm run deploy
```
