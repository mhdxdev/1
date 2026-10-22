// ============================================================
// TELEGRAM WEB CLONE — Centralized TypeScript Type Definitions
// ============================================================

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type ChatType = 'direct' | 'group' | 'channel';
export type UserRole = 'user' | 'admin' | 'superadmin';
export type ThemeBackground = 'dark' | 'light' | 'arctic' | 'desert';
export type AuthStep = 'landing' | 'google' | 'phone' | 'otp' | 'profile' | 'done';
export type PrivacyOption = 'everybody' | 'contacts' | 'nobody';
export type BadgeIcon = '⭐' | '💎' | '🌟' | '🔥' | '👑' | '🚀' | '🎯' | '💫';
export type AppLanguage = 'en' | 'ru' | 'ar' | 'de' | 'fr' | 'es';
export type AdminTab = 'analytics' | 'users' | 'logs';
export type SettingsTab =
  | 'profile'
  | 'chat'
  | 'privacy'
  | 'devices'
  | 'language'
  | 'premium'
  | 'stickers';

// ------------------------------------------------------------------
// User
// ------------------------------------------------------------------
export interface User {
  id: string;
  displayName: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  isPremium: boolean;
  premiumBadge: BadgeIcon;
  role: UserRole;
  isBanned: boolean;
  isOnline: boolean;
  lastSeen: number; // unix ms
  joinedAt: number;
  blockedUserIds: string[];
}

// ------------------------------------------------------------------
// Message
// ------------------------------------------------------------------
export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'sticker' | 'meme';
  name: string;
  url: string;
  size?: number;
}

export interface InlineMeme {
  id: string;
  topText: string;
  bottomText: string;
  bgColor: string;
  textColor: string;
  emoji: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  inlineMeme: InlineMeme | null;
  attachments: Attachment[];
  status: MessageStatus;
  timestamp: number;
  isDeleted: boolean;
  replyToId: string | null;
}

// ------------------------------------------------------------------
// Chat / Channel / Group
// ------------------------------------------------------------------
export interface ChatMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: number;
}

export interface Chat {
  id: string;
  type: ChatType;
  name: string;
  description: string;
  avatarUrl: string;
  memberIds: string[];
  members: ChatMember[];
  createdBy: string;
  createdAt: number;
  lastMessageId: string | null;
  isPublic: boolean;
  pinnedMessageId: string | null;
  mutedByUserIds: string[];
}

// ------------------------------------------------------------------
// Premium
// ------------------------------------------------------------------
export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
}

// ------------------------------------------------------------------
// Meme / Sticker
// ------------------------------------------------------------------
export interface CustomMeme {
  id: string;
  creatorId: string;
  topText: string;
  bottomText: string;
  bgColor: string;
  textColor: string;
  emoji: string;
  createdAt: number;
}

// ------------------------------------------------------------------
// Settings
// ------------------------------------------------------------------
export interface ChatSettings {
  fontSize: number; // 12–20
  background: ThemeBackground;
  autoNightMode: boolean;
}

export interface PrivacySettings {
  passcodeLock: boolean;
  twoStepVerification: boolean;
  phoneVisibility: PrivacyOption;
  lastSeenVisibility: PrivacyOption;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: number;
  isCurrentSession: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  language: AppLanguage;
  chat: ChatSettings;
  privacy: PrivacySettings;
  sessions: DeviceSession[];
  notifications: boolean;
}

// ------------------------------------------------------------------
// System Logs
// ------------------------------------------------------------------
export interface SystemLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
}

// ------------------------------------------------------------------
// Analytics
// ------------------------------------------------------------------
export interface Analytics {
  totalUsers: number;
  activeChannels: number;
  premiumSubscriptions: number;
  messagesToday: number;
}

// ------------------------------------------------------------------
// Search
// ------------------------------------------------------------------
export interface SearchResult {
  type: 'user' | 'chat';
  user?: User;
  chat?: Chat;
}

// ------------------------------------------------------------------
// Context Shape
// ------------------------------------------------------------------
export interface TelegramState {
  // Auth
  authStep: AuthStep;
  currentUser: User | null;
  // Data
  users: User[];
  chats: Chat[];
  messages: Record<string, Message[]>; // chatId → messages
  customMemes: CustomMeme[];
  // UI State
  activeChat: Chat | null;
  activeSidebarTab: 'chats' | 'settings' | 'admin';
  activeSettingsTab: SettingsTab;
  activeAdminTab: AdminTab;
  searchQuery: string;
  showCreateModal: boolean;
  createModalType: ChatType;
  showPremiumPanel: boolean;
  showMemeCreator: boolean;
  showAdminPanel: boolean;
  // Settings
  appSettings: AppSettings;
  // Logs
  systemLogs: SystemLog[];
  // Analytics
  analytics: Analytics;
}

export type TelegramAction =
  // Auth
  | { type: 'SET_AUTH_STEP'; payload: AuthStep }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  // Users
  | { type: 'UPDATE_USER'; payload: Partial<User> & { id: string } }
  | { type: 'TOGGLE_PREMIUM'; payload: { userId: string } }
  | { type: 'BAN_USER'; payload: { userId: string; isBanned: boolean } }
  | { type: 'BLOCK_USER'; payload: { targetId: string } }
  | { type: 'UNBLOCK_USER'; payload: { targetId: string } }
  // Chats
  | { type: 'SET_ACTIVE_CHAT'; payload: Chat | null }
  | { type: 'CREATE_CHAT'; payload: Chat }
  | { type: 'JOIN_CHAT'; payload: { chatId: string } }
  // Messages
  | { type: 'SEND_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { chatId: string; messageId: string; status: MessageStatus } }
  // Memes
  | { type: 'CREATE_MEME'; payload: CustomMeme }
  | { type: 'DELETE_MEME'; payload: { memeId: string } }
  // UI
  | { type: 'SET_SIDEBAR_TAB'; payload: TelegramState['activeSidebarTab'] }
  | { type: 'SET_SETTINGS_TAB'; payload: SettingsTab }
  | { type: 'SET_ADMIN_TAB'; payload: AdminTab }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_CREATE_MODAL'; payload: { show: boolean; chatType: ChatType } }
  | { type: 'TOGGLE_PREMIUM_PANEL'; payload: boolean }
  | { type: 'TOGGLE_MEME_CREATOR'; payload: boolean }
  | { type: 'TOGGLE_ADMIN_PANEL'; payload: boolean }
  // Settings
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_CHAT_SETTINGS'; payload: Partial<ChatSettings> }
  | { type: 'UPDATE_PRIVACY_SETTINGS'; payload: Partial<PrivacySettings> }
  | { type: 'TERMINATE_OTHER_SESSIONS' }
  // Logs
  | { type: 'ADD_LOG'; payload: SystemLog }
  // Analytics
  | { type: 'UPDATE_ANALYTICS'; payload: Partial<Analytics> };
