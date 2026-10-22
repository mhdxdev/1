import { supabase, isSupabaseReady } from './supabase';

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

function mapProfileRow(row: any): ApiUser {
  return {
    id: row.id,
    displayName: row.display_name ?? row.displayName ?? '',
    username: row.username ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    avatarUrl: row.avatar_url ?? row.avatarUrl ?? '',
    bio: row.bio ?? '',
    isPremium: Boolean(row.is_premium ?? row.isPremium ?? false),
    premiumBadge: (row.premium_badge ?? row.premiumBadge ?? '⭐') as ApiUser['premiumBadge'],
    role: (row.role ?? 'user') as ApiUser['role'],
    isBanned: Boolean(row.is_banned ?? row.isBanned ?? false),
    isOnline: Boolean(row.is_online ?? row.isOnline ?? true),
    lastSeen: Number(row.last_seen ?? row.lastSeen ?? Date.now()),
    joinedAt: Number(row.joined_at ?? row.joinedAt ?? Date.now()),
    blockedUserIds: Array.isArray(row.blocked_user_ids ?? row.blockedUserIds) ? (row.blocked_user_ids ?? row.blockedUserIds) : [],
  };
}

function mapMessageRow(row: any): ApiMessage {
  return {
    id: row.id,
    chatId: row.chat_id ?? row.chatId,
    senderId: row.sender_id ?? row.senderId,
    text: row.text ?? '',
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    inlineMeme: row.inline_meme ?? row.inlineMeme ?? null,
    status: (row.status ?? 'sent') as ApiMessage['status'],
    timestamp: Number(row.created_at ?? row.timestamp ?? Date.now()),
    isDeleted: Boolean(row.is_deleted ?? row.isDeleted ?? false),
    replyToId: row.reply_to_id ?? row.replyToId ?? null,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<ApiUser> {
  if (isSupabaseReady) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user!.id).single();
    if (profileError) throw profileError;
    return mapProfileRow(profile);
  }

  const res = await request<{ user: ApiUser; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res.user;
}

export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<ApiUser> {
  if (isSupabaseReady) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const profileRow = {
      id: data.user!.id,
      display_name: displayName,
      username: '',
      email,
      phone: '',
      avatar_url: '',
      bio: '',
      is_premium: false,
      premium_badge: '⭐',
      role: 'user',
      is_banned: false,
      is_online: true,
      last_seen: Date.now(),
      joined_at: Date.now(),
      blocked_user_ids: [],
    };

    const { error: profileError } = await supabase.from('profiles').upsert(profileRow);
    if (profileError) throw profileError;

    return {
      id: data.user!.id,
      displayName,
      username: '',
      email,
      phone: '',
      avatarUrl: '',
      bio: '',
      isPremium: false,
      premiumBadge: '⭐',
      role: 'user',
      isBanned: false,
      isOnline: true,
      lastSeen: Date.now(),
      joinedAt: Date.now(),
      blockedUserIds: [],
    };
  }

  const res = await request<{ user: ApiUser; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
  return res.user;
}

export async function getCurrentProfile(): Promise<ApiUser> {
  if (isSupabaseReady) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw userError ?? new Error('No authenticated user');
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single();
    if (error) throw error;
    return mapProfileRow(data);
  }

  const res = await request<{ user: ApiUser }>('/users/me', {
    headers: { Authorization: `Bearer ${localStorage.getItem('tg_token') ?? ''}` },
  });
  return res.user;
}

export async function getUsers(token?: string): Promise<ApiUser[]> {
  if (isSupabaseReady) {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return (data ?? []).map(mapProfileRow);
  }

  return await request<ApiUser[]>('/users', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function getChats(token?: string, userId?: string): Promise<ApiChat[]> {
  if (isSupabaseReady) {
    const { data: user } = await supabase.auth.getUser();
    const targetUserId = userId ?? user?.user?.id;
    if (!targetUserId) return [];
    const { data, error } = await supabase
      .from('chats')
      .select('*, chat_members(user_id, role, joined_at)')
      .contains('member_ids', [targetUserId]);
    if (error) throw error;
    return (data ?? []).map((chat: any) => ({
      id: chat.id,
      type: chat.type,
      name: chat.name,
      description: chat.description ?? '',
      avatarUrl: chat.avatar_url ?? '',
      memberIds: chat.member_ids ?? [],
      members: Array.isArray(chat.chat_members) ? chat.chat_members.map((m: any) => ({
        userId: m.user_id,
        role: m.role,
        joinedAt: m.joined_at,
      })) : [],
      createdBy: chat.created_by,
      createdAt: Number(chat.created_at ?? Date.now()),
      lastMessageId: chat.last_message_id ?? null,
      isPublic: Boolean(chat.is_public ?? false),
      pinnedMessageId: chat.pinned_message_id ?? null,
      mutedByUserIds: chat.muted_by_user_ids ?? [],
    }));
  }

  return await request<ApiChat[]>(`/chats?userId=${encodeURIComponent(userId ?? '')}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export async function createChatRoom(input: {
  name: string;
  description: string;
  type: 'direct' | 'group' | 'channel';
  avatar_url?: string;
  memberIds: string[];
  createdBy: string;
}): Promise<ApiChat> {
  if (isSupabaseReady) {
    const { data, error } = await supabase.from('chats').insert({
      name: input.name,
      description: input.description,
      type: input.type,
      avatar_url: input.avatar_url ?? '',
      created_by: input.createdBy,
      created_at: Date.now(),
      last_message_id: null,
      is_public: input.type === 'channel',
      pinned_message_id: null,
      muted_by_user_ids: [],
      member_ids: input.memberIds,
    }).select().single();
    if (error) throw error;
    return {
      id: data.id,
      type: data.type,
      name: data.name,
      description: data.description ?? '',
      avatarUrl: data.avatar_url ?? '',
      memberIds: data.member_ids ?? input.memberIds,
      members: input.memberIds.map((uid) => ({
        userId: uid,
        role: uid === input.createdBy ? 'owner' : 'member',
        joinedAt: Date.now(),
      })),
      createdBy: data.created_by,
      createdAt: Number(data.created_at ?? Date.now()),
      lastMessageId: data.last_message_id ?? null,
      isPublic: Boolean(data.is_public ?? false),
      pinnedMessageId: data.pinned_message_id ?? null,
      mutedByUserIds: data.muted_by_user_ids ?? [],
    };
  }

  return await request<ApiChat>('/chats', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getMessagesForChat(chatId: string): Promise<ApiMessage[]> {
  if (isSupabaseReady) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapMessageRow);
  }

  return await request<ApiMessage[]>(`/messages?chatId=${encodeURIComponent(chatId)}`);
}

export async function sendMessageToChat(input: {
  chatId: string;
  senderId: string;
  text?: string;
  attachments?: any[];
  inlineMeme?: any;
  replyToId?: string | null;
}): Promise<ApiMessage> {
  if (isSupabaseReady) {
    const { data, error } = await supabase.from('messages').insert({
      chat_id: input.chatId,
      sender_id: input.senderId,
      text: input.text ?? '',
      attachments: input.attachments ?? [],
      inline_meme: input.inlineMeme ?? null,
      status: 'sent',
      created_at: Date.now(),
      reply_to_id: input.replyToId ?? null,
    }).select().single();
    if (error) throw error;
    return mapMessageRow(data);
  }

  return await request<ApiMessage>('/messages', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function isBackendConfigured(): boolean {
  return Boolean(import.meta.env.VITE_API_URL || isSupabaseReady);
}

export const chatApi = {
  loginWithEmail: signInWithEmail,
  registerUser: signUpWithEmail,
  getMe: getCurrentProfile,
  getUsers,
  getChats,
  createChat: createChatRoom,
  getMessages: getMessagesForChat,
  sendMessage: sendMessageToChat,
  searchUsers: async (token?: string, q?: string) => {
    const users = await getUsers(token);
    const query = (q ?? '').toLowerCase();
    return users.filter((user) => {
      if (!query) return true;
      return user.displayName.toLowerCase().includes(query) || user.username.toLowerCase().includes(query);
    });
  },
};
