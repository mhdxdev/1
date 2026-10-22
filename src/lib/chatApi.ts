export type ApiUser = {
  id: string;
  displayName: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  isPremium: boolean;
  premiumBadge: '⭐' | '💎' | '🌟' | '🔥' | '👑' | '🚀' | '🎯' | '💫';
  role: 'user' | 'admin' | 'superadmin';
  isBanned: boolean;
  isOnline: boolean;
  lastSeen: number;
  joinedAt: number;
  blockedUserIds: string[];
};

export type ApiChat = {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name: string;
  description: string;
  avatarUrl: string;
  memberIds: string[];
  members: Array<{ userId: string; role: 'owner' | 'admin' | 'member'; joinedAt: number }>;
  createdBy: string;
  createdAt: number;
  lastMessageId: string | null;
  isPublic: boolean;
  pinnedMessageId: string | null;
  mutedByUserIds: string[];
};

export type ApiMessage = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  attachments: Array<{ id: string; type: 'image' | 'file' | 'sticker' | 'meme'; name: string; url: string; size?: number }>;
  inlineMeme: any;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  timestamp: number;
  isDeleted: boolean;
  replyToId: string | null;
};

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api').replace(/\/$/, '');

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error (${res.status}): ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}

export const chatApi = {
  loginWithEmail: (payload: { email: string; password: string }) =>
    request<{ user: ApiUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  registerUser: (payload: Partial<ApiUser> & { email: string; password: string }) =>
    request<{ user: ApiUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: (token: string) =>
    request<{ user: ApiUser }>('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getUsers: (token: string) =>
    request<ApiUser[]>('/users', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  searchUsers: (token: string, q: string) =>
    request<ApiUser[]>(`/users/search?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getChats: (token: string, userId: string) =>
    request<ApiChat[]>(`/chats?userId=${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  createChat: (token: string, payload: Partial<ApiChat>) =>
    request<ApiChat>('/chats', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),

  getMessages: (token: string, chatId: string) =>
    request<ApiMessage[]>(`/messages?chatId=${encodeURIComponent(chatId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  sendMessage: (token: string, payload: Partial<ApiMessage>) =>
    request<ApiMessage>('/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
};

export function isBackendConfigured(): boolean {
  return Boolean(import.meta.env.VITE_API_URL);
}
