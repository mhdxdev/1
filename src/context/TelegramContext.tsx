// ============================================================
// TelegramContext — Unified Reactive State Engine
// ============================================================

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type {
  TelegramState,
  TelegramAction,
  User,
  Chat,
  Message,
  CustomMeme,
  AppSettings,
  ChatSettings,
  PrivacySettings,
  MessageStatus,
  SystemLog,
  ChatType,
  AuthStep,
  SettingsTab,
  AdminTab,
} from '../types';
import {
  SEED_USERS,
  SEED_CHATS,
  SEED_MESSAGES,
  SEED_MEMES,
  SEED_SESSIONS,
  SEED_LOGS,
} from '../data/seed';
import { telegramEmitter, EVENTS } from '../utils/eventEmitter';
import { getStorageItem, setStorageItem } from '../hooks/useStorage';

// ------------------------------------------------------------------
// Initial State
// ------------------------------------------------------------------
const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'en',
  notifications: true,
  chat: {
    fontSize: 15,
    background: 'dark',
    autoNightMode: false,
  },
  privacy: {
    passcodeLock: false,
    twoStepVerification: false,
    phoneVisibility: 'contacts',
    lastSeenVisibility: 'everybody',
  },
  sessions: SEED_SESSIONS,
};

function buildInitialState(): TelegramState {
  const savedUser = getStorageItem<User | null>('tg_current_user', null);
  const savedSettings = getStorageItem<AppSettings>('tg_settings', defaultSettings);
  const savedMemes = getStorageItem<CustomMeme[]>('tg_memes', SEED_MEMES);
  const savedChats = getStorageItem<Chat[]>('tg_chats', SEED_CHATS);
  const savedMessages = getStorageItem<Record<string, Message[]>>('tg_messages', SEED_MESSAGES);
  const savedUsers = getStorageItem<User[]>('tg_users', SEED_USERS);
  const savedLogs = getStorageItem<SystemLog[]>('tg_logs', SEED_LOGS);

  return {
    authStep: savedUser ? 'done' : 'landing',
    currentUser: savedUser,
    users: savedUsers,
    chats: savedChats,
    messages: savedMessages,
    customMemes: savedMemes,
    activeChat: null,
    activeSidebarTab: 'chats',
    activeSettingsTab: 'profile',
    activeAdminTab: 'analytics',
    searchQuery: '',
    showCreateModal: false,
    createModalType: 'group',
    showPremiumPanel: false,
    showMemeCreator: false,
    showAdminPanel: false,
    appSettings: savedSettings,
    systemLogs: savedLogs,
    analytics: {
      totalUsers: savedUsers.length,
      activeChannels: savedChats.filter((c) => c.type === 'channel').length,
      premiumSubscriptions: savedUsers.filter((u) => u.isPremium).length,
      messagesToday: Object.values(savedMessages).flat().filter(
        (m) => m.timestamp > Date.now() - 86400000
      ).length,
    },
  };
}

// ------------------------------------------------------------------
// Reducer
// ------------------------------------------------------------------
function telegramReducer(state: TelegramState, action: TelegramAction): TelegramState {
  switch (action.type) {
    // ---- Auth ----
    case 'SET_AUTH_STEP':
      return { ...state, authStep: action.payload };

    case 'LOGIN': {
      const user = action.payload;
      setStorageItem('tg_current_user', user);
      const exists = state.users.find((u) => u.id === user.id);
      const newUsers = exists
        ? state.users.map((u) => (u.id === user.id ? user : u))
        : [...state.users, user];
      setStorageItem('tg_users', newUsers);
      telegramEmitter.emit(EVENTS.AUTH_CHANGED, { user });
      return {
        ...state,
        authStep: 'done',
        currentUser: user,
        users: newUsers,
        analytics: { ...state.analytics, totalUsers: newUsers.length },
      };
    }

    case 'LOGOUT':
      setStorageItem('tg_current_user', null);
      return {
        ...state,
        authStep: 'landing',
        currentUser: null,
        activeChat: null,
      };

    // ---- Users ----
    case 'UPDATE_USER': {
      const updatedUsers = state.users.map((u) =>
        u.id === action.payload.id ? { ...u, ...action.payload } : u
      );
      setStorageItem('tg_users', updatedUsers);
      const updatedCurrent =
        state.currentUser?.id === action.payload.id
          ? { ...state.currentUser, ...action.payload }
          : state.currentUser;
      if (updatedCurrent) setStorageItem('tg_current_user', updatedCurrent);
      telegramEmitter.emit(EVENTS.USER_UPDATED, action.payload);
      return { ...state, users: updatedUsers, currentUser: updatedCurrent };
    }

    case 'TOGGLE_PREMIUM': {
      const updatedUsers = state.users.map((u) =>
        u.id === action.payload.userId ? { ...u, isPremium: !u.isPremium } : u
      );
      const premCount = updatedUsers.filter((u) => u.isPremium).length;
      setStorageItem('tg_users', updatedUsers);
      const updatedCurrent =
        state.currentUser?.id === action.payload.userId
          ? { ...state.currentUser, isPremium: !state.currentUser.isPremium }
          : state.currentUser;
      if (updatedCurrent) setStorageItem('tg_current_user', updatedCurrent);
      telegramEmitter.emit(EVENTS.PREMIUM_TOGGLED, { userId: action.payload.userId });
      const newLog = makeLog(
        `[LOG]: Premium status toggled for user ID ${action.payload.userId}`
      );
      addLogToStorage(newLog);
      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedCurrent,
        analytics: { ...state.analytics, premiumSubscriptions: premCount },
        systemLogs: [newLog, ...state.systemLogs],
      };
    }

    case 'BAN_USER': {
      const updatedUsers = state.users.map((u) =>
        u.id === action.payload.userId ? { ...u, isBanned: action.payload.isBanned } : u
      );
      setStorageItem('tg_users', updatedUsers);
      const newLog = makeLog(
        `[LOG]: User ID ${action.payload.userId} ${action.payload.isBanned ? 'banned' : 'unbanned'}`
      );
      addLogToStorage(newLog);
      return {
        ...state,
        users: updatedUsers,
        systemLogs: [newLog, ...state.systemLogs],
      };
    }

    case 'BLOCK_USER': {
      if (!state.currentUser) return state;
      const blocked = [...new Set([...state.currentUser.blockedUserIds, action.payload.targetId])];
      const updatedUser = { ...state.currentUser, blockedUserIds: blocked };
      setStorageItem('tg_current_user', updatedUser);
      const updatedUsers = state.users.map((u) =>
        u.id === updatedUser.id ? updatedUser : u
      );
      setStorageItem('tg_users', updatedUsers);
      return { ...state, currentUser: updatedUser, users: updatedUsers };
    }

    case 'UNBLOCK_USER': {
      if (!state.currentUser) return state;
      const blocked = state.currentUser.blockedUserIds.filter(
        (id) => id !== action.payload.targetId
      );
      const updatedUser = { ...state.currentUser, blockedUserIds: blocked };
      setStorageItem('tg_current_user', updatedUser);
      const updatedUsers = state.users.map((u) =>
        u.id === updatedUser.id ? updatedUser : u
      );
      setStorageItem('tg_users', updatedUsers);
      return { ...state, currentUser: updatedUser, users: updatedUsers };
    }

    // ---- Chats ----
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChat: action.payload };

    case 'CREATE_CHAT': {
      const newChats = [action.payload, ...state.chats];
      setStorageItem('tg_chats', newChats);
      const newMessages = { ...state.messages, [action.payload.id]: [] };
      setStorageItem('tg_messages', newMessages);
      telegramEmitter.emit(EVENTS.CHAT_CREATED, action.payload);
      const newLog = makeLog(
        `[LOG]: ${action.payload.type === 'channel' ? 'Channel' : 'Group'} "${action.payload.name}" created`
      );
      addLogToStorage(newLog);
      return {
        ...state,
        chats: newChats,
        messages: newMessages,
        activeChat: action.payload,
        showCreateModal: false,
        analytics: {
          ...state.analytics,
          activeChannels:
            action.payload.type === 'channel'
              ? state.analytics.activeChannels + 1
              : state.analytics.activeChannels,
        },
        systemLogs: [newLog, ...state.systemLogs],
      };
    }

    case 'JOIN_CHAT': {
      if (!state.currentUser) return state;
      const updatedChats = state.chats.map((c) => {
        if (c.id !== action.payload.chatId) return c;
        if (c.memberIds.includes(state.currentUser!.id)) return c;
        return {
          ...c,
          memberIds: [...c.memberIds, state.currentUser!.id],
          members: [
            ...c.members,
            {
              userId: state.currentUser!.id,
              role: 'member' as const,
              joinedAt: Date.now(),
            },
          ],
        };
      });
      setStorageItem('tg_chats', updatedChats);
      telegramEmitter.emit(EVENTS.CHAT_JOINED, { chatId: action.payload.chatId });
      return { ...state, chats: updatedChats };
    }

    // ---- Messages ----
    case 'SEND_MESSAGE': {
      const { chatId } = action.payload;
      const existing = state.messages[chatId] ?? [];
      const newMsgs = [...existing, action.payload];
      const newMessages = { ...state.messages, [chatId]: newMsgs };
      const newChats = state.chats.map((c) =>
        c.id === chatId ? { ...c, lastMessageId: action.payload.id } : c
      );
      setStorageItem('tg_messages', newMessages);
      setStorageItem('tg_chats', newChats);
      telegramEmitter.emit(EVENTS.MESSAGE_SENT, action.payload);
      const newLog = makeLog(
        `[LOG]: User @${state.currentUser?.username ?? 'unknown'} sent a message in chat ${chatId}`
      );
      addLogToStorage(newLog);
      return {
        ...state,
        messages: newMessages,
        chats: newChats,
        analytics: {
          ...state.analytics,
          messagesToday: state.analytics.messagesToday + 1,
        },
        systemLogs: [newLog, ...state.systemLogs],
      };
    }

    case 'UPDATE_MESSAGE_STATUS': {
      const { chatId, messageId, status } = action.payload;
      const chatMsgs = (state.messages[chatId] ?? []).map((m) =>
        m.id === messageId ? { ...m, status } : m
      );
      const newMessages = { ...state.messages, [chatId]: chatMsgs };
      setStorageItem('tg_messages', newMessages);
      return { ...state, messages: newMessages };
    }

    // ---- Memes ----
    case 'CREATE_MEME': {
      const newMemes = [action.payload, ...state.customMemes];
      setStorageItem('tg_memes', newMemes);
      telegramEmitter.emit(EVENTS.MEME_CREATED, action.payload);
      return { ...state, customMemes: newMemes };
    }

    case 'DELETE_MEME': {
      const newMemes = state.customMemes.filter((m) => m.id !== action.payload.memeId);
      setStorageItem('tg_memes', newMemes);
      return { ...state, customMemes: newMemes };
    }

    // ---- UI ----
    case 'SET_SIDEBAR_TAB':
      return { ...state, activeSidebarTab: action.payload, activeChat: null };

    case 'SET_SETTINGS_TAB':
      return { ...state, activeSettingsTab: action.payload };

    case 'SET_ADMIN_TAB':
      return { ...state, activeAdminTab: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'TOGGLE_CREATE_MODAL':
      return {
        ...state,
        showCreateModal: action.payload.show,
        createModalType: action.payload.chatType,
      };

    case 'TOGGLE_PREMIUM_PANEL':
      return { ...state, showPremiumPanel: action.payload };

    case 'TOGGLE_MEME_CREATOR':
      return { ...state, showMemeCreator: action.payload };

    case 'TOGGLE_ADMIN_PANEL':
      return { ...state, showAdminPanel: action.payload };

    // ---- Settings ----
    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.appSettings, ...action.payload };
      setStorageItem('tg_settings', newSettings);
      telegramEmitter.emit(EVENTS.SETTINGS_UPDATED, newSettings);
      return { ...state, appSettings: newSettings };
    }

    case 'UPDATE_CHAT_SETTINGS': {
      const newSettings = {
        ...state.appSettings,
        chat: { ...state.appSettings.chat, ...action.payload },
      };
      setStorageItem('tg_settings', newSettings);
      telegramEmitter.emit(EVENTS.SETTINGS_UPDATED, newSettings);
      return { ...state, appSettings: newSettings };
    }

    case 'UPDATE_PRIVACY_SETTINGS': {
      const newSettings = {
        ...state.appSettings,
        privacy: { ...state.appSettings.privacy, ...action.payload },
      };
      setStorageItem('tg_settings', newSettings);
      return { ...state, appSettings: newSettings };
    }

    case 'TERMINATE_OTHER_SESSIONS': {
      const newSessions = state.appSettings.sessions.filter((s) => s.isCurrentSession);
      const newSettings = { ...state.appSettings, sessions: newSessions };
      setStorageItem('tg_settings', newSettings);
      const newLog = makeLog('[LOG]: All other sessions terminated');
      addLogToStorage(newLog);
      return {
        ...state,
        appSettings: newSettings,
        systemLogs: [newLog, ...state.systemLogs],
      };
    }

    // ---- Logs ----
    case 'ADD_LOG': {
      const newLogs = [action.payload, ...state.systemLogs.slice(0, 199)];
      setStorageItem('tg_logs', newLogs);
      return { ...state, systemLogs: newLogs };
    }

    case 'UPDATE_ANALYTICS':
      return { ...state, analytics: { ...state.analytics, ...action.payload } };

    default:
      return state;
  }
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function makeLog(message: string, level: SystemLog['level'] = 'info'): SystemLog {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    level,
    message,
  };
}

function addLogToStorage(log: SystemLog): void {
  const stored = getStorageItem<SystemLog[]>('tg_logs', []);
  setStorageItem('tg_logs', [log, ...stored].slice(0, 200));
}

// ------------------------------------------------------------------
// Context
// ------------------------------------------------------------------
interface TelegramContextValue {
  state: TelegramState;
  dispatch: React.Dispatch<TelegramAction>;
  // Convenience actions
  sendMessage: (
    chatId: string,
    text: string,
    inlineMeme?: Message['inlineMeme'],
    replyToId?: string | null
  ) => void;
  setActiveChat: (chat: Chat | null) => void;
  createChat: (chat: Omit<Chat, 'id' | 'createdAt' | 'lastMessageId' | 'pinnedMessageId'>) => void;
  getUserById: (id: string) => User | undefined;
  getChatMessages: (chatId: string) => Message[];
  searchResults: (query: string) => { users: User[]; chats: Chat[] };
  isChannelOwner: (chat: Chat) => boolean;
  addLog: (message: string, level?: SystemLog['level']) => void;
  updateChatSettings: (settings: Partial<ChatSettings>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateMessageStatus: (chatId: string, messageId: string, status: MessageStatus) => void;
}

const TelegramContext = createContext<TelegramContextValue | null>(null);

// ------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------
export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(telegramReducer, undefined, buildInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Simulate message read receipts
  const simulateRead = useCallback((chatId: string, messageId: string) => {
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_MESSAGE_STATUS',
        payload: { chatId, messageId, status: 'delivered' },
      });
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_MESSAGE_STATUS',
          payload: { chatId, messageId, status: 'read' },
        });
      }, 1500);
    }, 800);
  }, []);

  // Simulate auto-replies in direct chats
  useEffect(() => {
    const unsub = telegramEmitter.on<Message>(EVENTS.MESSAGE_SENT, (msg) => {
      const currentState = stateRef.current;
      const chat = currentState.chats.find((c) => c.id === msg.chatId);
      if (!chat || chat.type !== 'direct') return;
      const otherUserId = chat.memberIds.find((id) => id !== currentState.currentUser?.id);
      if (!otherUserId) return;
      const otherUser = currentState.users.find((u) => u.id === otherUserId);
      if (!otherUser || !otherUser.isOnline) return;

      const replies = [
        'Got it! 👍',
        'That sounds great!',
        'Let me check and get back to you 🔍',
        'Haha, nice one! 😄',
        'Absolutely! Will do.',
        '🔥🔥🔥',
        'On it! ✅',
        'Interesting... tell me more',
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];

      setTimeout(() => {
        const replyMsg: Message = {
          id: `msg_${Date.now()}_auto`,
          chatId: msg.chatId,
          senderId: otherUserId,
          text: reply,
          inlineMeme: null,
          attachments: [],
          status: 'sent',
          timestamp: Date.now(),
          isDeleted: false,
          replyToId: msg.id,
        };
        dispatch({ type: 'SEND_MESSAGE', payload: replyMsg });
      }, 1500 + Math.random() * 2000);
    });
    return unsub;
  }, []);

  // Simulate live log ticker
  useEffect(() => {
    const actions = [
      '[LOG]: Server heartbeat — all systems nominal',
      '[LOG]: Garbage collection completed',
      '[LOG]: Message cache flushed',
      '[LOG]: Analytics snapshot saved',
      '[LOG]: Background sync completed',
    ];
    const interval = setInterval(() => {
      const msg = actions[Math.floor(Math.random() * actions.length)];
      dispatch({ type: 'ADD_LOG', payload: makeLog(msg) });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // ------------------------------------------------------------------
  // Convenience helpers
  // ------------------------------------------------------------------
  const sendMessage = useCallback(
    (
      chatId: string,
      text: string,
      inlineMeme: Message['inlineMeme'] = null,
      replyToId: string | null = null
    ) => {
      const currentUser = stateRef.current.currentUser;
      if (!currentUser || (!text.trim() && !inlineMeme)) return;
      const msg: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        chatId,
        senderId: currentUser.id,
        text: text.trim(),
        inlineMeme,
        attachments: [],
        status: 'sending',
        timestamp: Date.now(),
        isDeleted: false,
        replyToId,
      };
      dispatch({ type: 'SEND_MESSAGE', payload: msg });
      // Transition: sending → sent
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_MESSAGE_STATUS',
          payload: { chatId, messageId: msg.id, status: 'sent' },
        });
        simulateRead(chatId, msg.id);
      }, 400);
    },
    [simulateRead]
  );

  const setActiveChat = useCallback((chat: Chat | null) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chat });
  }, []);

  const createChat = useCallback(
    (chatData: Omit<Chat, 'id' | 'createdAt' | 'lastMessageId' | 'pinnedMessageId'>) => {
      const chat: Chat = {
        ...chatData,
        id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
        lastMessageId: null,
        pinnedMessageId: null,
      };
      dispatch({ type: 'CREATE_CHAT', payload: chat });
    },
    []
  );

  const getUserById = useCallback(
    (id: string) => stateRef.current.users.find((u) => u.id === id),
    []
  );

  const getChatMessages = useCallback(
    (chatId: string) => stateRef.current.messages[chatId] ?? [],
    []
  );

  const searchResults = useCallback((query: string) => {
    if (!query.trim()) return { users: [], chats: [] };
    const q = query.toLowerCase().replace('@', '');
    const { users, chats, currentUser } = stateRef.current;
    return {
      users: users.filter(
        (u) =>
          u.id !== currentUser?.id &&
          (u.username.toLowerCase().includes(q) ||
            u.displayName.toLowerCase().includes(q))
      ),
      chats: chats.filter(
        (c) =>
          c.isPublic &&
          (c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      ),
    };
  }, []);

  const isChannelOwner = useCallback((chat: Chat) => {
    const cu = stateRef.current.currentUser;
    if (!cu) return false;
    return chat.createdBy === cu.id;
  }, []);

  const addLog = useCallback((message: string, level: SystemLog['level'] = 'info') => {
    dispatch({ type: 'ADD_LOG', payload: makeLog(message, level) });
  }, []);

  const updateChatSettings = useCallback((settings: Partial<ChatSettings>) => {
    dispatch({ type: 'UPDATE_CHAT_SETTINGS', payload: settings });
  }, []);

  const updatePrivacySettings = useCallback((settings: Partial<PrivacySettings>) => {
    dispatch({ type: 'UPDATE_PRIVACY_SETTINGS', payload: settings });
  }, []);

  const updateMessageStatus = useCallback(
    (chatId: string, messageId: string, status: MessageStatus) => {
      dispatch({
        type: 'UPDATE_MESSAGE_STATUS',
        payload: { chatId, messageId, status },
      });
    },
    []
  );

  return (
    <TelegramContext.Provider
      value={{
        state,
        dispatch,
        sendMessage,
        setActiveChat,
        createChat,
        getUserById,
        getChatMessages,
        searchResults,
        isChannelOwner,
        addLog,
        updateChatSettings,
        updatePrivacySettings,
        updateMessageStatus,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

// ------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------
export function useTelegram(): TelegramContextValue {
  const ctx = useContext(TelegramContext);
  if (!ctx) {
    throw new Error('useTelegram must be used inside <TelegramProvider>');
  }
  return ctx;
}

// Re-export types for convenience
export type {
  AuthStep,
  SettingsTab,
  AdminTab,
  ChatType,
  ChatSettings,
  PrivacySettings,
  MessageStatus,
};
