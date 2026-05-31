import { useId, type CSSProperties } from 'react';
import { PROFILE_AVATARS, type AvatarShapeType } from '../../data/avatars';
import { getProfileSkin } from '../../data/profileSkins';
import { getProfileTheme } from '../../data/profileThemes';

type GeneratedAvatarProps = {
  avatarId: string;
  skinStyleId: string;
  themeId: string;
  frameId: string;
  level: number;
  size?: number | string;
  showLevelBadge?: boolean;
  className?: string;
  ariaLabel?: string;
};

type FrameStyle = {
  ring: string;
  inner: string;
  glow: string;
};

const frameStyles: Record<string, FrameStyle> = {
  default_frame: {
    ring: '#E2C98B',
    inner: '#FFF4C7',
    glow: 'rgba(255, 244, 199, .34)',
  },
  bronze_learner_frame: {
    ring: '#C87A32',
    inner: '#FFD08A',
    glow: 'rgba(200, 122, 50, .45)',
  },
  gold_accuracy_frame: {
    ring: '#FFD75D',
    inner: '#FFF2A8',
    glow: 'rgba(255, 215, 93, .58)',
  },
  boss_victor_frame: {
    ring: '#FF8C3A',
    inner: '#FFE071',
    glow: 'rgba(255, 140, 58, .5)',
  },
  seven_day_streak_frame: {
    ring: '#77F35B',
    inner: '#D8FF8D',
    glow: 'rgba(119, 243, 91, .52)',
  },
  temple_badge_frame: {
    ring: '#D5A44A',
    inner: '#FFE9A0',
    glow: 'rgba(213, 164, 74, .52)',
  },
};

function getAvatarShape(avatarId: string): AvatarShapeType {
  return PROFILE_AVATARS.find((avatar) => avatar.id === avatarId)?.shapeType ?? 'elephant';
}

function sizeValue(size: number | string) {
  return typeof size === 'number' ? `${size}px` : size;
}

function EyePair({ y = 89, color = '#12222B' }: { y?: number; color?: string }) {
  return (
    <>
      <circle cx="84" cy={y} r="5.5" fill={color} />
      <circle cx="116" cy={y} r="5.5" fill={color} />
      <circle cx="86" cy={y - 2} r="1.7" fill="#FFFFFF" opacity=".85" />
      <circle cx="118" cy={y - 2} r="1.7" fill="#FFFFFF" opacity=".85" />
    </>
  );
}

function Smile({ y = 109, color = '#6D3F26' }: { y?: number; color?: string }) {
  return <path d={`M88 ${y} C95 ${y + 8} 105 ${y + 8} 112 ${y}`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />;
}

function HumanBase({
  ids,
  shape,
  accent,
  skinSecondary,
  skinShadow,
}: {
  ids: string;
  shape: AvatarShapeType;
  accent: string;
  skinSecondary: string;
  skinShadow: string;
}) {
  const isMonk = shape === 'monk';
  const isStudent = shape === 'student';
  const isJungle = shape === 'jungle';
  const isGuardian = shape === 'guardian';

  return (
    <>
      <path d="M57 168 C61 137 77 123 100 123 C123 123 139 137 143 168 Z" fill={`url(#${ids}-robe)`} />
      <path d="M70 166 C74 145 85 136 100 136 C115 136 126 145 130 166 Z" fill={isMonk ? '#F4A83E' : isJungle ? '#1D8A59' : isGuardian ? '#7B8797' : '#2D7BC9'} opacity=".96" />
      <circle cx="100" cy="87" r="39" fill={`url(#${ids}-skin)`} />
      <path d="M68 81 C69 54 81 39 102 38 C123 38 135 55 133 82 C126 66 76 66 68 81 Z" fill={isMonk ? '#7B4A2A' : isGuardian ? '#475366' : '#2C1E18'} />
      <path d="M66 86 C76 70 91 63 113 67 C125 70 132 78 134 91 C135 54 119 35 97 36 C76 37 63 55 66 86 Z" fill={isStudent ? '#1A2638' : isJungle ? '#234022' : isMonk ? '#5E341C' : '#2D211B'} opacity=".98" />
      {isGuardian && (
        <>
          <path d="M64 75 C71 48 88 36 100 31 C112 36 129 48 136 75 L128 80 C120 63 80 63 72 80 Z" fill={`url(#${ids}-metal)`} />
          <path d="M100 33 L108 61 L100 55 L92 61 Z" fill={accent} />
        </>
      )}
      {isJungle && (
        <>
          <path d="M63 74 C75 48 94 35 122 38 C116 54 92 69 63 74 Z" fill="#4DAE45" />
          <path d="M77 60 C94 62 107 57 121 39" fill="none" stroke="#E4F6A3" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      <EyePair />
      <Smile color={skinShadow} />
      <path d="M96 92 C93 101 93 105 100 106" fill="none" stroke={skinShadow} strokeWidth="3" strokeLinecap="round" opacity=".72" />
      <path d="M78 130 C88 138 112 138 122 130" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".24" />
      {isMonk && <circle cx="100" cy="47" r="7" fill={skinSecondary} opacity=".55" />}
      {isStudent && (
        <path d="M72 56 L100 41 L128 56 L100 71 Z" fill={accent} stroke="#FFF3B8" strokeWidth="3" strokeLinejoin="round" />
      )}
    </>
  );
}

function ElephantAvatar({
  ids,
  accent,
  skinShadow,
}: {
  ids: string;
  accent: string;
  skinShadow: string;
}) {
  return (
    <>
      <ellipse cx="67" cy="93" rx="31" ry="39" fill={`url(#${ids}-skin)`} opacity=".9" />
      <ellipse cx="133" cy="93" rx="31" ry="39" fill={`url(#${ids}-skin)`} opacity=".9" />
      <ellipse cx="100" cy="91" rx="42" ry="46" fill={`url(#${ids}-skin)`} />
      <path d="M92 122 C91 147 108 154 115 138 C102 144 101 128 104 114 Z" fill={`url(#${ids}-skin)`} stroke={skinShadow} strokeWidth="3" strokeLinecap="round" />
      <path d="M71 78 C78 67 87 62 96 62" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity=".22" />
      <EyePair y={86} />
      <path d="M65 62 L100 40 L135 62 L124 72 L100 58 L76 72 Z" fill={accent} stroke="#FFF4BC" strokeWidth="4" strokeLinejoin="round" />
      <path d="M82 114 C91 122 109 122 118 114" fill="none" stroke={skinShadow} strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="43" r="5" fill="#FFF2A8" />
    </>
  );
}

function MedalAvatar({ ids, accent }: { ids: string; accent: string }) {
  return (
    <>
      <path d="M72 47 L90 73 L100 61 L110 73 L128 47 L117 123 L83 123 Z" fill={`url(#${ids}-robe)`} />
      <circle cx="100" cy="96" r="47" fill={`url(#${ids}-metal)`} stroke="#FFF1A4" strokeWidth="7" />
      <circle cx="100" cy="96" r="31" fill={accent} opacity=".92" />
      <path d="M100 72 L107 88 L124 90 L111 101 L115 118 L100 109 L85 118 L89 101 L76 90 L93 88 Z" fill="#FFF8C8" />
      <path d="M80 143 C92 151 108 151 120 143" fill="none" stroke="#FFE98C" strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

function SpiritAvatar({ ids, accent }: { ids: string; accent: string }) {
  return (
    <>
      <path d="M100 38 C121 60 142 82 134 113 C128 137 110 150 100 164 C90 150 72 137 66 113 C58 82 79 60 100 38 Z" fill={`url(#${ids}-spirit)`} />
      <path d="M100 58 L108 82 L133 83 L113 98 L120 123 L100 109 L80 123 L87 98 L67 83 L92 82 Z" fill="#FFFAD2" opacity=".95" />
      <circle cx="86" cy="101" r="4.5" fill="#10263A" />
      <circle cx="114" cy="101" r="4.5" fill="#10263A" />
      <path d="M90 120 C97 127 105 127 112 120" fill="none" stroke="#10263A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="137" cy="67" r="6" fill={accent} opacity=".75" />
      <circle cx="64" cy="72" r="4" fill={accent} opacity=".55" />
    </>
  );
}

export default function GeneratedAvatar({
  avatarId,
  skinStyleId,
  themeId,
  frameId,
  level,
  size = '100%',
  showLevelBadge = false,
  className = '',
  ariaLabel,
}: GeneratedAvatarProps) {
  const reactId = useId().replace(/:/g, '');
  const ids = `avatar-${reactId}`;
  const skin = getProfileSkin(skinStyleId);
  const theme = getProfileTheme(themeId);
  const shape = getAvatarShape(avatarId);
  const frame = frameStyles[frameId] ?? frameStyles.default_frame;
  const avatar = PROFILE_AVATARS.find((item) => item.id === avatarId) ?? PROFILE_AVATARS[0];

  const style = {
    '--avatar-size': sizeValue(size),
    '--avatar-frame': frame.ring,
    '--avatar-frame-inner': frame.inner,
    '--avatar-frame-glow': frame.glow,
  } as CSSProperties;

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-visible ${className}`}
      style={{ width: 'var(--avatar-size)', height: 'var(--avatar-size)', ...style }}
      role="img"
      aria-label={ariaLabel ?? `${avatar.name} generated avatar, level ${Math.max(1, Math.floor(level))}`}
    >
      <svg className="h-full w-full drop-shadow-[0_16px_18px_rgba(0,0,0,.34)]" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${ids}-stage`} x1="38" y1="15" x2="154" y2="190" gradientUnits="userSpaceOnUse">
            <stop stopColor={theme.colors.sky} />
            <stop offset=".58" stopColor={theme.colors.horizon} />
            <stop offset="1" stopColor={theme.colors.ground} />
          </linearGradient>
          <linearGradient id={`${ids}-skin`} x1="64" y1="45" x2="126" y2="136" gradientUnits="userSpaceOnUse">
            <stop stopColor={skin.primaryColor} />
            <stop offset=".7" stopColor={skin.secondaryColor} />
            <stop offset="1" stopColor={skin.shadowColor} />
          </linearGradient>
          <linearGradient id={`${ids}-robe`} x1="64" y1="122" x2="140" y2="174" gradientUnits="userSpaceOnUse">
            <stop stopColor={theme.colors.accent} />
            <stop offset="1" stopColor={theme.colors.ground} />
          </linearGradient>
          <linearGradient id={`${ids}-metal`} x1="66" y1="40" x2="132" y2="136" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF4B8" />
            <stop offset=".45" stopColor={theme.colors.accent} />
            <stop offset="1" stopColor="#9A641A" />
          </linearGradient>
          <radialGradient id={`${ids}-spirit`} cx="50%" cy="42%" r="58%">
            <stop stopColor={theme.colors.glow} />
            <stop offset=".62" stopColor={skin.primaryColor} />
            <stop offset="1" stopColor={theme.colors.horizon} />
          </radialGradient>
          <filter id={`${ids}-shadow`} x="-20%" y="-20%" width="140%" height="145%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity=".34" />
          </filter>
        </defs>

        <circle cx="100" cy="100" r="94" fill="var(--avatar-frame)" />
        <circle cx="100" cy="100" r="86" fill="var(--avatar-frame-inner)" opacity=".9" />
        <circle cx="100" cy="100" r="78" fill={`url(#${ids}-stage)`} />
        <path d="M28 137 C53 123 77 126 100 140 C124 126 150 123 172 137 L172 172 L28 172 Z" fill={theme.colors.ground} opacity=".72" />
        <path d="M42 53 L54 64 M158 53 L146 64 M45 149 L60 141 M155 149 L140 141" stroke={theme.colors.accent} strokeWidth="4" strokeLinecap="round" opacity=".62" />
        <g filter={`url(#${ids}-shadow)`}>
          {shape === 'elephant' ? (
            <ElephantAvatar ids={ids} accent={theme.colors.accent} skinShadow={skin.shadowColor} />
          ) : shape === 'medal' ? (
            <MedalAvatar ids={ids} accent={theme.colors.accent} />
          ) : shape === 'spirit' ? (
            <SpiritAvatar ids={ids} accent={theme.colors.accent} />
          ) : (
            <HumanBase ids={ids} shape={shape} accent={theme.colors.accent} skinSecondary={skin.secondaryColor} skinShadow={skin.shadowColor} />
          )}
        </g>
        <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,.42)" strokeWidth="4" />
        <circle cx="100" cy="100" r="80" fill="none" stroke={theme.colors.glow} strokeWidth="2" strokeDasharray="7 10" opacity=".55" />
      </svg>

      {showLevelBadge && (
        <span className="absolute bottom-0 right-0 grid h-[24%] min-h-7 min-w-7 place-items-center rounded-full border-2 border-[#FFF6BE] bg-gradient-to-br from-[#C8922A] to-[#F0C060] px-2 text-[clamp(10px,22%,16px)] font-black leading-none text-[#302008] shadow-[0_6px_12px_rgba(0,0,0,.32)]">
          {Math.max(1, Math.floor(level))}
        </span>
      )}
    </div>
  );
}
