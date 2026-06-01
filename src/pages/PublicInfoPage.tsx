import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  HelpCircle,
  Keyboard,
  Mail,
  Newspaper,
  Play,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import GameButton from '../components/game-ui/GameButton';
import PageTransition from '../components/layout/PageTransition';
import { backgroundImages, imageAssets } from '../assets/assetManifest';

type PublicPageContent = {
  title: string;
  eyebrow: string;
  intro: string;
  icon: typeof Shield;
  primaryLink?: { label: string; to: string };
  sections: Array<{
    title: string;
    body?: string;
    items?: string[];
  }>;
  cards?: Array<{
    title: string;
    body: string;
    to?: string;
  }>;
};

const publicPages: Record<string, PublicPageContent> = {
  '/about': {
    title: 'About Khmer Typing Adventure',
    eyebrow: 'Mission',
    icon: Sparkles,
    intro:
      'Khmer Typing Adventure is an educational typing game built to help learners practice Khmer keyboard skills through clear lessons, accuracy goals, and light adventure rewards.',
    primaryLink: { label: 'View Lessons', to: '/lessons' },
    sections: [
      {
        title: 'Why It Exists',
        body:
          'Khmer typing can feel difficult when students are still learning key positions, dependent vowels, and coeng combinations. This project turns practice into small achievable missions while keeping typing accuracy as the main goal.',
      },
      {
        title: 'Who It Helps',
        items: [
          'Students who are learning Khmer typing for school or personal study.',
          'Parents who want a safer learning-first typing activity.',
          'Teachers who need a simple way to explain Khmer keyboard practice and encourage steady progress.',
        ],
      },
      {
        title: 'Learning Approach',
        body:
          'The app introduces characters, words, sentences, timed practice, and boss challenges gradually. Game rewards are used to motivate practice, but the core purpose remains Khmer typing skill.',
      },
    ],
  },
  '/contact': {
    title: 'Contact',
    eyebrow: 'Support',
    icon: Mail,
    intro:
      'Questions, feedback, privacy requests, and classroom suggestions are welcome. Please include enough detail so the project owner can understand the issue.',
    sections: [
      {
        title: 'How To Reach Us',
        body:
          'Use the contact option provided by the project owner or GitHub repository. If you are reporting an account or privacy concern, include the account email or user ID only when necessary.',
      },
      {
        title: 'What To Include',
        items: [
          'The page or feature where the problem happened.',
          'Your browser and device type if the issue is technical.',
          'A short description of what you expected and what happened instead.',
        ],
      },
      {
        title: 'Privacy And Removal Requests',
        body:
          'For account data questions or deletion requests, clearly state that the request is about privacy or account removal. Do not send passwords or sensitive classroom records.',
      },
    ],
  },
  '/privacy': {
    title: 'Privacy Policy',
    eyebrow: 'Data And Safety',
    icon: Shield,
    intro:
      'This policy explains the types of information Khmer Typing Adventure may use to operate accounts, save progress, improve learning, and keep the experience safe.',
    sections: [
      {
        title: 'Account Data',
        body:
          'If you sign in, the app may store basic profile information such as display name, level, typing XP, equipped avatar, titles, and progress records needed to continue your adventure.',
      },
      {
        title: 'Firebase And Authentication',
        body:
          'The app may use Firebase services for authentication and saving progress. Firebase may process sign-in identifiers such as email, user ID, provider data, and security-related metadata according to its own service behavior.',
      },
      {
        title: 'Learning Progress',
        items: [
          'Lesson completion and typing results may be saved to show progress.',
          'Accuracy, CPM, mistakes, stars, rewards, and boss results may be stored for learning feedback.',
          'Progress data should be used to support practice, not to shame or publicly rank students.',
        ],
      },
      {
        title: 'Cookies, Analytics, And Ads',
        body:
          'The site may use browser storage to operate the app and remember learning progress. Ads or analytics are not required for typing practice and should only be enabled after they are configured carefully for children, teens, students, and classroom use.',
      },
      {
        title: 'Children And Students',
        body:
          'Khmer Typing Adventure is intended as an educational tool. Parents and teachers should supervise student accounts, avoid sharing sensitive personal information, and review school or local privacy requirements before classroom use. Personalized ads should remain disabled for learners unless a responsible adult confirms that the setup is appropriate and lawful.',
      },
      {
        title: 'Access, Correction, And Removal',
        body:
          'Users, parents, or teachers may request help correcting or removing account-related data. Contact the project owner with the account identifier and a clear description of the request.',
      },
    ],
  },
  '/terms': {
    title: 'Terms Of Use',
    eyebrow: 'Rules',
    icon: Shield,
    intro:
      'These terms describe fair and safe use of Khmer Typing Adventure. By using the app, you agree to use it for lawful learning and practice.',
    sections: [
      {
        title: 'Acceptable Use',
        items: [
          'Use the app for Khmer typing practice, classroom learning, and personal study.',
          'Do not attempt to break, overload, copy, or misuse the service.',
          'Do not upload, enter, or share harmful, illegal, or abusive content.',
        ],
      },
      {
        title: 'Accounts And Responsibility',
        body:
          'You are responsible for the account you use. Keep passwords private, use accurate account information when needed, and ask a parent or teacher for help if you are a student.',
      },
      {
        title: 'No Cheating Or Abuse',
        body:
          'Do not manipulate scores, rewards, progress, or boss results. Cheating weakens the learning value and may lead to progress resets or account limits.',
      },
      {
        title: 'Educational Use',
        body:
          'The app supports Khmer typing practice but does not replace a teacher, school curriculum, or professional educational assessment.',
      },
      {
        title: 'Limitation Of Liability',
        body:
          'The app is provided as an educational project. It may change, contain errors, or be unavailable at times. Use it with reasonable care and keep important classroom records outside the app when required.',
      },
    ],
  },
  '/help': {
    title: 'Help Center',
    eyebrow: 'FAQ',
    icon: HelpCircle,
    intro: 'Find quick answers for sign-in, lessons, progress, practice, and Khmer keyboard setup.',
    sections: [
      {
        title: 'Login Questions',
        items: [
          'If email login fails, check the email, password length, and internet connection.',
          'Guest play is useful for quick testing, but saved progress may be limited compared with a signed-in account.',
          'If Google login is unavailable, use email login or guest mode until Firebase settings are configured.',
        ],
      },
      {
        title: 'Lessons And Progress',
        items: [
          'Lessons are designed to build from basic Khmer characters toward words, sentences, and timed challenges.',
          'Accuracy should come before speed, especially for beginners.',
          'CPM is used as the main typing speed metric for Khmer practice.',
        ],
      },
      {
        title: 'Typing Practice',
        items: [
          'Read the Khmer prompt carefully before typing.',
          'Pay attention to dependent vowels and coeng/subscript combinations.',
          'If a key does not match, check your operating system Khmer keyboard layout.',
        ],
      },
      {
        title: 'Keyboard Issues',
        body:
          'Make sure a Khmer keyboard is installed and active on your device. If the visible keyboard hints do not match your physical keyboard, review the Khmer keyboard guide.',
      },
    ],
  },
  '/parents-teachers': {
    title: 'Parents And Teachers',
    eyebrow: 'Classroom Guidance',
    icon: Users,
    intro:
      'Khmer Typing Adventure is designed to be learning-first. Adults can use it to encourage typing practice while keeping privacy, safety, and classroom expectations clear.',
    primaryLink: { label: 'Read Privacy Notes', to: '/privacy' },
    sections: [
      {
        title: 'Student Safety',
        body:
          'Students should avoid entering personal information beyond what is needed for an account. Adults should supervise younger learners and choose sign-in options that match school policy.',
      },
      {
        title: 'Possible Data Collected',
        items: [
          'Display name or account identifier.',
          'Lesson progress, scores, accuracy, CPM, mistakes, XP, and rewards.',
          'Cosmetic choices such as avatar, frame, title, and theme.',
        ],
      },
      {
        title: 'Classroom Use',
        body:
          'Teachers can use the app as a practice companion for Khmer keyboard familiarity. It works best when paired with direct instruction on finger placement, character order, and careful proofreading.',
      },
      {
        title: 'Ads And Privacy Caution',
        body:
          'Advertising is disabled by default. If advertising or analytics are enabled in the future, personalized ads should stay off for students, child-directed treatment should be configured where appropriate, and classroom users should confirm that the setup complies with school and local privacy rules.',
      },
      {
        title: 'Correction Or Deletion Requests',
        body:
          'Parents, teachers, and users may request correction or deletion of account-related learning data. Include only the account identifier needed to find the record, and do not send passwords or sensitive classroom documents.',
      },
    ],
  },
  '/blog': {
    title: 'Learning Blog',
    eyebrow: 'Articles',
    icon: Newspaper,
    intro: 'Short educational guides for Khmer typing practice, keyboard setup, and classroom learning routines.',
    sections: [
      {
        title: 'Latest Guides',
        body:
          'These article previews link to learning pages already available in the app. More detailed articles can be added as the project grows.',
      },
    ],
    cards: [
      {
        title: 'How To Start Khmer Typing Practice',
        body: 'Begin with accuracy, learn the keyboard layout, and practice short text before timed challenges.',
        to: '/typing-practice',
      },
      {
        title: 'Khmer Keyboard Basics For Students',
        body: 'Understand keyboard setup, character placement, dependent vowels, and why input method matters.',
        to: '/khmer-keyboard-guide',
      },
      {
        title: 'Using Typing Games In Class',
        body: 'Tips for teachers who want game rewards to support learning without distracting from accuracy.',
        to: '/parents-teachers',
      },
    ],
  },
  '/lessons': {
    title: 'Khmer Typing Lessons',
    eyebrow: 'Public Overview',
    icon: BookOpen,
    intro:
      'Lessons introduce Khmer typing step by step. The full interactive lesson path is available after login so progress can be saved.',
    primaryLink: { label: 'Login For Lessons', to: '/' },
    sections: [
      {
        title: 'Lesson Path',
        items: [
          'Start with Khmer consonants and common key positions.',
          'Practice vowels and character combinations carefully.',
          'Move into simple words, short phrases, and sentences.',
          'Use boss challenges to review accuracy under light pressure.',
        ],
      },
      {
        title: 'Learning Goals',
        body:
          'Each lesson should help learners build confidence with Khmer Unicode input while keeping text readable and mistakes easy to understand.',
      },
      {
        title: 'Why Login Is Used',
        body:
          'Interactive lessons can save XP, stars, accuracy history, and progress only when the app knows which learner is practicing.',
      },
    ],
  },
  '/khmer-keyboard-guide': {
    title: 'Khmer Keyboard Guide',
    eyebrow: 'Setup And Basics',
    icon: Keyboard,
    intro:
      'A working Khmer keyboard layout is required for meaningful practice. This guide explains the basics before starting lessons.',
    sections: [
      {
        title: 'Before You Practice',
        items: [
          'Install or enable a Khmer keyboard on your device.',
          'Confirm that the active input language is Khmer before typing in the app.',
          'Use the same layout consistently while learning key positions.',
        ],
      },
      {
        title: 'Typing Basics',
        items: [
          'Type slowly first and focus on correct characters.',
          'Watch for dependent vowels, signs, and subscript/coeng combinations.',
          'If the text looks wrong, check input order and keyboard mode before blaming speed.',
        ],
      },
      {
        title: 'Troubleshooting',
        body:
          'If a key produces an unexpected character, your operating system keyboard layout may differ from the app hints. Review your device keyboard settings and try a short practice phrase again.',
      },
    ],
  },
  '/typing-practice': {
    title: 'Typing Practice',
    eyebrow: 'Start Here',
    icon: Play,
    intro:
      'Public typing practice starts with learning what to expect. Sign in when you are ready for saved lessons, XP, boss battles, and progress tracking.',
    primaryLink: { label: 'Start Saved Practice', to: '/' },
    sections: [
      {
        title: 'Practice Routine',
        items: [
          'Warm up with short Khmer characters or words.',
          'Type the prompt exactly instead of guessing.',
          'Correct repeated mistakes before increasing speed.',
          'Use CPM as a speed signal, but treat accuracy as the first goal.',
        ],
      },
      {
        title: 'When To Use Boss Mode',
        body:
          'Boss battles are best after a learner understands the lesson text. They add pressure and rewards, but the goal is still accurate Khmer typing.',
      },
      {
        title: 'Saved Practice',
        body:
          'The interactive practice route may require login so the app can save progress and show personalized feedback.',
      },
    ],
  },
};

const footerLinks = [
  { label: 'About', to: '/about' },
  { label: 'Lessons', to: '/lessons' },
  { label: 'Keyboard Guide', to: '/khmer-keyboard-guide' },
  { label: 'Practice', to: '/typing-practice' },
  { label: 'Help', to: '/help' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Contact', to: '/contact' },
];

export default function PublicInfoPage() {
  const location = useLocation();
  const page = publicPages[location.pathname];

  if (!page) return <Navigate to="/" replace />;

  const Icon = page.icon;

  return (
    <PageTransition className="min-h-screen bg-[#0597D8]">
      <main
        className="min-h-screen px-5 py-6 text-[#102654]"
        style={{
          backgroundImage: `linear-gradient(180deg,rgba(255,255,255,.25),rgba(231,247,255,.96) 56%,rgba(255,255,255,.98)), url(${backgroundImages.home})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/70 bg-gradient-to-b from-[#075ED0] via-[#004AAE] to-[#003382] px-5 py-3 text-white shadow-[0_12px_24px_rgba(0,35,105,.25)]">
          <Link to="/" className="flex items-center gap-3">
            <img src={imageAssets.logo} alt="Khmer Typing Adventure" className="h-20 w-32 object-contain drop-shadow-[0_8px_10px_rgba(0,18,70,.28)]" />
            <span className="sr-only">Home</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-black">
            {footerLinks.slice(0, 6).map((link) => (
              <Link key={link.to} to={link.to} className="rounded-full px-3 py-2 text-white/90 transition hover:bg-white/12 hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="mx-auto mt-8 grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <article className="rounded-[30px] border-[5px] border-[#78451F] bg-gradient-to-b from-[#FFF5D0] via-[#FFFDF5] to-[#E5C27D] p-5 shadow-[0_22px_38px_rgba(0,40,95,.24),inset_0_2px_0_rgba(255,255,255,.55)]">
            <div className="rounded-[24px] border-[3px] border-[#2B348F] bg-gradient-to-r from-[#293AA8] via-[#416CD6] to-[#1689E8] px-5 py-5 text-white shadow-[inset_0_-6px_0_rgba(0,0,0,.16)]">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] border-2 border-white/70 bg-white/16">
                  <Icon size={32} className="text-[#FFE86A]" />
                </div>
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.12em] text-[#B8FF66]">{page.eyebrow}</div>
                  <h1 className="mt-1 text-[34px] font-black leading-tight">{page.title}</h1>
                  <p className="mt-3 max-w-3xl text-base font-bold leading-relaxed text-white/88">{page.intro}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {page.sections.map((section) => (
                <section key={section.title} className="rounded-[22px] border-2 border-[#D4A65E] bg-white/88 p-5 shadow-[0_10px_18px_rgba(74,42,16,.08)]">
                  <h2 className="text-xl font-black text-[#0B3A80]">{section.title}</h2>
                  {section.body && <p className="mt-2 text-[15px] font-bold leading-relaxed text-[#334A66]">{section.body}</p>}
                  {section.items && (
                    <ul className="mt-3 space-y-2 text-[15px] font-bold leading-relaxed text-[#334A66]">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#28A94D]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </article>

          <aside className="space-y-4">
            <div className="rounded-[26px] border-[4px] border-[#FFE17B] bg-gradient-to-b from-[#FFF6A8] via-[#FFC23A] to-[#D8750C] p-4 text-[#542B00] shadow-[0_18px_28px_rgba(0,40,95,.2),inset_0_2px_0_rgba(255,255,255,.52)]">
              <h2 className="text-xl font-black">Learning Links</h2>
              <div className="mt-3 grid gap-2">
                {footerLinks.map((link) => (
                  <Link key={link.to} to={link.to} className="rounded-[16px] bg-white/62 px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:bg-white">
                    {link.label}
                  </Link>
                ))}
              </div>
              {page.primaryLink && (
                <Link to={page.primaryLink.to} className="mt-4 block">
                  <GameButton variant="blue" size="md" className="h-[54px] w-full rounded-[20px]">
                    {page.primaryLink.label}
                  </GameButton>
                </Link>
              )}
            </div>

            {page.cards && (
              <div className="grid gap-3">
                {page.cards.map((card) => (
                  <Link
                    key={card.title}
                    to={card.to ?? '#'}
                    className="rounded-[22px] border-2 border-[#8DBDFF] bg-white/92 p-4 shadow-[0_10px_18px_rgba(27,91,143,.12)] transition hover:-translate-y-0.5"
                  >
                    <h3 className="text-base font-black text-[#146FE1]">{card.title}</h3>
                    <p className="mt-1 text-sm font-bold leading-relaxed text-[#40506B]">{card.body}</p>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </section>

        <footer className="mx-auto mt-8 flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 rounded-[22px] bg-gradient-to-b from-[#075AC9] via-[#0047A6] to-[#00317E] px-5 py-4 text-white shadow-[0_-6px_18px_rgba(0,54,118,.16)]">
          <div className="text-sm font-black">Khmer Typing Adventure</div>
          <nav className="flex flex-wrap gap-3 text-xs font-bold text-white/84">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-white hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>
        </footer>
      </main>
    </PageTransition>
  );
}
