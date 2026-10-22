// ============================================================
// Sidebar — Left panel with chat list, search, navigation
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import {
  Settings, BarChart3, Plus, Users, Hash, Search, X,
  MessageSquare, LogOut, Shield,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { Avatar, Badge } from '../ui';
import { formatTime, cx } from '../../utils/helpers';
import { useTranslation } from '../../utils/i18n';
import type { Chat, Message } from '../../types';

// ------------------------------------------------------------------
// SearchBar
// ------------------------------------------------------------------
function SearchBar() {
  const { state, dispatch, searchResults } = useTelegram();
  const t = useTranslation(state.appSettings.language);
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (!state.searchQuery.trim()) return null;
    return searchResults(state.searchQuery);
  }, [state.searchQuery, searchResults]);

  const hasResults = results && (results.users.length > 0 || results.chats.length > 0);

  return (
    <div className="relative px-3 py-2">
      <div className={cx(
        'flex items-center gap-2 bg-white/8 rounded-xl px-3 py-2 transition-all',
        focused ? 'border border-[#2481cc]/50 bg-white/10' : 'border border-transparent'
      )}>
        <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={state.searchQuery}
          onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
        />
        {state.searchQuery && (
          <button onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}>
            <X className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
          </button>
        )}
      </div>

      {/* Global search dropdown */}
      {state.searchQuery && focused && (
        <div className="absolute top-full left-3 right-3 mt-1 bg-[#1c1c1e] rounded-xl border border-white/10 shadow-2xl z-30 max-h-80 overflow-y-auto">
          {!hasResults ? (
            <p className="text-gray-500 text-sm text-center py-6">{t('noResults')}</p>
          ) : (
            <>
              {results.users.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase px-3 pt-3 pb-1 tracking-wider font-medium">People</p>
                  {results.users.map((user) => (
                    <button
                      key={user.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors"
                      onClick={() => {
                        // Open DM
                        const { chats, currentUser } = state;
                        let dm = chats.find(
                          (c) => c.type === 'direct' &&
                            c.memberIds.includes(user.id) &&
                            c.memberIds.includes(currentUser!.id)
                        );
                        if (!dm) {
                          dispatch({
                            type: 'CREATE_CHAT',
                            payload: {
                              id: `dm_${Date.now()}`,
                              type: 'direct',
                              name: user.displayName,
                              description: '',
                              avatarUrl: user.avatarUrl,
                              memberIds: [currentUser!.id, user.id],
                              members: [
                                { userId: currentUser!.id, role: 'member', joinedAt: Date.now() },
                                { userId: user.id, role: 'member', joinedAt: Date.now() },
                              ],
                              createdBy: currentUser!.id,
                              createdAt: Date.now(),
                              lastMessageId: null,
                              isPublic: false,
                              pinnedMessageId: null,
                              mutedByUserIds: [],
                            },
                          });
                          dm = state.chats[0];
                        }
                        if (dm) dispatch({ type: 'SET_ACTIVE_CHAT', payload: dm });
                        dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
                      }}
                    >
                      <Avatar src={user.avatarUrl} name={user.displayName} size="sm" isOnline={user.isOnline} isPremium={user.isPremium} premiumBadge={user.premiumBadge} />
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                          {user.isPremium && <span className="text-xs">{user.premiumBadge}</span>}
                        </div>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {results.chats.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase px-3 pt-3 pb-1 tracking-wider font-medium">Channels & Groups</p>
                  {results.chats.map((chat) => (
                    <button
                      key={chat.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors"
                      onClick={() => {
                        dispatch({ type: 'JOIN_CHAT', payload: { chatId: chat.id } });
                        dispatch({ type: 'SET_ACTIVE_CHAT', payload: chat });
                        dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
                      }}
                    >
                      <Avatar src={chat.avatarUrl} name={chat.name} size="sm" />
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-medium text-white truncate">{chat.name}</p>
                        <p className="text-xs text-gray-500">{chat.memberIds.length} members • {chat.type}</p>
                      </div>
                      <Badge color="blue">Join</Badge>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Chat List Item
// ------------------------------------------------------------------
function ChatListItem({ chat, isActive }: { chat: Chat; isActive: boolean }) {
  const { state, dispatch } = useTelegram();
  const msgs = state.messages[chat.id] ?? [];
  const lastMsg = msgs[msgs.length - 1] as Message | undefined;
  const unread = msgs.filter(
    (m) => m.senderId !== state.currentUser?.id && m.status !== 'read'
  ).length;

  const otherUserId =
    chat.type === 'direct'
      ? chat.memberIds.find((id) => id !== state.currentUser?.id)
      : null;
  const otherUser = otherUserId
    ? state.users.find((u) => u.id === otherUserId)
    : null;

  const displayName = chat.type === 'direct' ? (otherUser?.displayName ?? chat.name) : chat.name;
  const avatarSrc = chat.type === 'direct' ? (otherUser?.avatarUrl ?? chat.avatarUrl) : chat.avatarUrl;
  const isOnline = chat.type === 'direct' ? otherUser?.isOnline ?? false : false;
  const isPremium = chat.type === 'direct' ? otherUser?.isPremium ?? false : false;
  const premiumBadge = chat.type === 'direct' ? otherUser?.premiumBadge : undefined;

  const lastMsgText = lastMsg
    ? lastMsg.inlineMeme
      ? '🎭 Meme'
      : lastMsg.text || (lastMsg.attachments.length > 0 ? '📎 Attachment' : '')
    : chat.type === 'channel' ? 'Channel' : chat.type === 'group' ? 'Group' : 'No messages';

  const handleSelectChat = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chat });
  }, [dispatch, chat]);

  return (
    <button
      className={cx(
        'w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 transition-colors relative',
        isActive && 'bg-[#2481cc]/15 hover:bg-[#2481cc]/20'
      )}
      onClick={handleSelectChat}
    >
      <div className="relative">
        <Avatar
          src={avatarSrc}
          name={displayName}
          size="md"
          isOnline={isOnline}
          isPremium={isPremium}
          premiumBadge={premiumBadge}
        />
        {chat.type === 'channel' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#2481cc] rounded-full flex items-center justify-center">
            <Hash className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        {chat.type === 'group' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#9c59d1] rounded-full flex items-center justify-center">
            <Users className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[15px] font-semibold text-white truncate pr-2">{displayName}</span>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {lastMsg ? formatTime(lastMsg.timestamp) : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 truncate pr-2">
            {lastMsg && lastMsg.senderId === state.currentUser?.id && (
              <span className="mr-1 text-[#2481cc]">
                {lastMsg.status === 'read' ? '✓✓' : lastMsg.status === 'delivered' ? '✓✓' : '✓'}
              </span>
            )}
            {lastMsgText}
          </p>
          {unread > 0 && (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-[#2481cc] rounded-full text-[11px] font-bold text-white flex items-center justify-center px-1">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ------------------------------------------------------------------
// Create Chat Modal
// ------------------------------------------------------------------
function CreateChatModal() {
  const { state, dispatch, createChat } = useTelegram();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const isChannel = state.createModalType === 'channel';

  const availableUsers = state.users.filter((u) => u.id !== state.currentUser?.id);

  const handleCreate = () => {
    if (!name.trim() || !state.currentUser) return;
    createChat({
      type: state.createModalType,
      name: name.trim(),
      description: description.trim(),
      avatarUrl: '',
      memberIds: [state.currentUser.id, ...selectedUsers],
      members: [
        { userId: state.currentUser.id, role: 'owner', joinedAt: Date.now() },
        ...selectedUsers.map((uid) => ({ userId: uid, role: 'member' as const, joinedAt: Date.now() })),
      ],
      createdBy: state.currentUser.id,
      isPublic,
      mutedByUserIds: [],
    });
    dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: { show: false, chatType: 'group' } });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: { show: false, chatType: 'group' } })}
    >
      <div className="bg-[#1c1c1e] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">
            {isChannel ? '📢 New Channel' : '👥 New Group'}
          </h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: { show: false, chatType: 'group' } })}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <input
            type="text"
            placeholder={isChannel ? 'Channel name' : 'Group name'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/8 border border-white/10 rounded-xl text-white placeholder-gray-500 px-4 py-3 text-[15px] focus:outline-none focus:border-[#2481cc]"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-white/8 border border-white/10 rounded-xl text-white placeholder-gray-500 px-4 py-3 text-[15px] focus:outline-none focus:border-[#2481cc] resize-none"
          />

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-300">Public {isChannel ? 'Channel' : 'Group'}</span>
            <div
              className={cx('relative w-[46px] h-[26px] rounded-full transition-colors', isPublic ? 'bg-[#2481cc]' : 'bg-[#3a3a3c]')}
              onClick={() => setIsPublic(!isPublic)}
            >
              <div className={cx('absolute top-[3px] w-5 h-5 bg-white rounded-full shadow transition-transform', isPublic ? 'translate-x-[23px]' : 'translate-x-[3px]')} />
            </div>
          </label>

          <div>
            <p className="text-sm text-gray-400 mb-2">Add members</p>
            <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
              {availableUsers.map((u) => (
                <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={(e) =>
                      setSelectedUsers(e.target.checked
                        ? [...selectedUsers, u.id]
                        : selectedUsers.filter((id) => id !== u.id))
                    }
                    className="accent-[#2481cc]"
                  />
                  <Avatar src={u.avatarUrl} name={u.displayName} size="sm" />
                  <div>
                    <p className="text-sm text-white">{u.displayName}</p>
                    <p className="text-xs text-gray-500">@{u.username}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="bg-[#2481cc] hover:bg-[#1a6db5] disabled:opacity-50 text-white rounded-xl py-3 font-medium transition-colors"
          >
            Create {isChannel ? 'Channel' : 'Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Sidebar Root
// ------------------------------------------------------------------
export function Sidebar() {
  const { state, dispatch } = useTelegram();
  const t = useTranslation(state.appSettings.language);
  const [showMenu, setShowMenu] = useState(false);

  const myChats = useMemo(() =>
    state.chats
      .filter((c) => c.memberIds.includes(state.currentUser?.id ?? ''))
      .sort((a, b) => {
        const lastA = state.messages[a.id]?.at(-1)?.timestamp ?? a.createdAt;
        const lastB = state.messages[b.id]?.at(-1)?.timestamp ?? b.createdAt;
        return lastB - lastA;
      }),
    [state.chats, state.messages, state.currentUser]
  );

  const isRTL = state.appSettings.language === 'ar';

  return (
    <div className={cx('flex flex-col h-full bg-[#1e2128] border-r border-white/5', isRTL && 'direction-rtl')}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 h-14">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors relative"
        >
          <div className="flex flex-col gap-1">
            <span className="w-4 h-0.5 bg-gray-300 block rounded" />
            <span className="w-4 h-0.5 bg-gray-300 block rounded" />
            <span className="w-4 h-0.5 bg-gray-300 block rounded" />
          </div>

          {/* Hamburger dropdown */}
          {showMenu && (
            <div
              className="absolute top-10 left-0 w-52 bg-[#1c1c1e] rounded-xl border border-white/10 shadow-2xl z-50 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { icon: <MessageSquare className="w-4 h-4" />, label: t('newGroup'), action: () => dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: { show: true, chatType: 'group' } }) },
                { icon: <Hash className="w-4 h-4" />, label: t('newChannel'), action: () => dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: { show: true, chatType: 'channel' } }) },
                { icon: <Settings className="w-4 h-4" />, label: t('settings'), action: () => dispatch({ type: 'SET_SIDEBAR_TAB', payload: 'settings' }) },
                ...(state.currentUser?.role === 'superadmin' || state.currentUser?.role === 'admin'
                  ? [{ icon: <Shield className="w-4 h-4" />, label: t('admin'), action: () => dispatch({ type: 'SET_SIDEBAR_TAB', payload: 'admin' }) }]
                  : []),
                { icon: <LogOut className="w-4 h-4" />, label: t('logout'), action: () => dispatch({ type: 'LOGOUT' }) },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </button>

        <SearchBar />

        <button
          onClick={() => dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: { show: true, chatType: 'group' } })}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white ml-auto flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex border-b border-white/5">
        {[
          { key: 'chats', icon: <MessageSquare className="w-4 h-4" />, label: t('chats') },
          { key: 'settings', icon: <Settings className="w-4 h-4" />, label: t('settings') },
          ...(state.currentUser?.role === 'superadmin' || state.currentUser?.role === 'admin'
            ? [{ key: 'admin', icon: <BarChart3 className="w-4 h-4" />, label: t('admin') }]
            : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => dispatch({ type: 'SET_SIDEBAR_TAB', payload: tab.key as 'chats' | 'settings' | 'admin' })}
            className={cx(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2',
              state.activeSidebarTab === tab.key
                ? 'text-[#2481cc] border-[#2481cc]'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Current User Profile Strip */}
      {state.activeSidebarTab === 'chats' && state.currentUser && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-white/2">
          <Avatar
            src={state.currentUser.avatarUrl}
            name={state.currentUser.displayName}
            size="sm"
            isOnline
            isPremium={state.currentUser.isPremium}
            premiumBadge={state.currentUser.premiumBadge}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-white truncate">{state.currentUser.displayName}</span>
              {state.currentUser.isPremium && <span className="text-xs">{state.currentUser.premiumBadge}</span>}
            </div>
            <span className="text-xs text-gray-500">@{state.currentUser.username}</span>
          </div>
        </div>
      )}

      {/* Chat List */}
      {state.activeSidebarTab === 'chats' && (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {myChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-400 text-sm">No chats yet. Start a new conversation!</p>
            </div>
          ) : (
            myChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={state.activeChat?.id === chat.id}
              />
            ))
          )}
        </div>
      )}

      {/* Bottom action buttons for non-chats tabs */}
      {state.activeSidebarTab !== 'chats' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-sm">← Select a view</p>
        </div>
      )}

      {/* Create modal */}
      {state.showCreateModal && <CreateChatModal />}
    </div>
  );
}
