// ============================================================
// Utility helpers
// ============================================================

import type { AppLanguage } from '../types';

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' });
  } else {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export function formatLastSeen(timestamp: number, lang: AppLanguage = 'en'): string {
  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return lang === 'ru' ? 'только что' : 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generateOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function cx(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA' },
  { code: '+7', country: 'RU' },
  { code: '+44', country: 'UK' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+34', country: 'ES' },
  { code: '+39', country: 'IT' },
  { code: '+81', country: 'JP' },
  { code: '+82', country: 'KR' },
  { code: '+86', country: 'CN' },
  { code: '+91', country: 'IN' },
  { code: '+55', country: 'BR' },
  { code: '+52', country: 'MX' },
  { code: '+61', country: 'AU' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'SA' },
  { code: '+98', country: 'IR' },
  { code: '+90', country: 'TR' },
  { code: '+380', country: 'UA' },
  { code: '+48', country: 'PL' },
];

export const PREMIUM_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 4.99,
    duration: 'monthly' as const,
    features: [
      'No ads forever',
      'Animated profile photo',
      '4GB file uploads',
      'Exclusive sticker packs',
      'Premium badge ⭐',
      'Faster downloads',
      'Voice-to-text conversion',
      'Custom app icons',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 39.99,
    duration: 'yearly' as const,
    features: [
      'All Monthly benefits',
      'Save 33%',
      'Priority customer support',
      'Early access to new features',
      'Exclusive yearly badge 👑',
    ],
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 199.99,
    duration: 'lifetime' as const,
    features: [
      'All Yearly benefits',
      'Lifetime access — pay once',
      'Diamond badge 💎',
      'Name in premium hall of fame',
    ],
  },
];

export const BADGE_OPTIONS: Array<{ icon: string; label: string }> = [
  { icon: '⭐', label: 'Star' },
  { icon: '💎', label: 'Diamond' },
  { icon: '🌟', label: 'Glowing Star' },
  { icon: '🔥', label: 'Fire' },
  { icon: '👑', label: 'Crown' },
  { icon: '🚀', label: 'Rocket' },
  { icon: '🎯', label: 'Target' },
  { icon: '💫', label: 'Dizzy' },
];

export const EMOJI_LIST = [
  '😀','😂','🥰','😎','🤔','😅','🥳','😤','🤩','😭',
  '❤️','🔥','✅','👍','👎','🙌','🎉','🎊','💯','⭐',
  '🚀','💡','💪','🎯','🌟','💎','👑','⚡','🌈','🎮',
  '📱','💻','🔑','🏆','🎶','🍕','☕','🌍','✈️','🎁',
];

export const MEME_BG_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#f5a623', '#2ecc71', '#1abc9c',
  '#3498db', '#9b59b6', '#e74c3c', '#e67e22',
  '#000000', '#ffffff', '#2d3436', '#636e72',
];

export const MEME_TEXT_COLORS = [
  '#ffffff', '#ffff00', '#00ff00', '#00ffff',
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
  '#000000', '#ff4500', '#00d2ff', '#e91e63',
];
