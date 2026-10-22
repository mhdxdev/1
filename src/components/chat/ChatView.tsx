// ============================================================
// Chat View — Message list, bubbles, input bar, emoji panel,
// replies, and Chat Info Drawer
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Smile, Paperclip, Image, ArrowLeft, Info,
  MoreVertical, Hash, Users, Check, CheckCheck, Clock,
  Mic, X, Reply, Bell, Shield,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { Avatar, Badge, Modal } from '../ui';
import { formatTime, formatLastSeen, EMOJI_LIST, cx } from '../../utils/helpers';
import { useTranslation } from '../../utils/i18n';
import type { Message, Chat, User } from '../../types';

// ------------------------------------------------------------------
// Message Status Icon
// ------------------------------------------------------------------
function StatusIcon({ status }: { status: Message['status'] }) {
  if (status === 'sending') return <Clock className="w-3 h-3 text-white/50" />;
  if (status === 'sent') return <Check className="w-3 h-3 text-white/60" />;
  if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-white/60" />;
  if (status === 'read') return <CheckCheck className="w-3 h-3 text-[#4fc3f7]" />;
  return null;
}

// ------------------------------------------------------------------
// Inline Meme Card
// ------------------------------------------------------------------
function InlineMemeCard({ meme }: { meme: NonNullable<Message['inlineMeme']> }) {
  return (
    <div
      className="rounded-xl overflow-hidden mt-1 select-none"
      style={{ backgroundColor: meme.bgColor, minWidth: 200, maxWidth: 280 }}
    >
      <div className="p-4 text-center">
        <div className="text-4xl mb-2">{meme.emoji}</div>
        {meme.topText && (
          <p className="font-black text-sm uppercase tracking-wide" style={{ color: meme.textColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            {meme.topText}
          </p>
        )}
        {meme.bottomText && (
          <p className="font-black text-sm uppercase tracking-wide mt-1" style={{ color: meme.textColor, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            {meme.bottomText}
          </p>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Quoted Reply Preview Inside Bubble
// ------------------------------------------------------------------
function QuotedReply({ replyToId, chatMessages, allUsers }: {
  replyToId: string;
  chatMessages: Message[];
  allUsers: User[];
}) {
  const origMsg = chatMessages.find((m) => m.id === replyToId);
  if (!origMsg) return null;
  const author = allUsers.find((u) => u.id === origMsg.senderId);

  return (
    <div className="mb-1.5 pl-2.5 border-l-2 border-[#2481cc] bg-black/20 rounded py-1 pr-2 text-xs">
      <p className="font-semibold text-[#4fc3f7] truncate">
        {author?.displayName ?? 'User'}
      </p>
      <p className="text-gray-300 truncate">
        {origMsg.inlineMeme ? `🎭 ${origMsg.inlineMeme.topText || 'Meme'}` : origMsg.text || 'Media'}
      </p>
    </div>
  );
}

// ------------------------------------------------------------------
// Message Bubble
// ------------------------------------------------------------------
function MessageBubble({
  message,
  chat,
  sender,
  isMine,
  prevSenderId,
  chatMessages,
  allUsers,
  onReply,
}: {
  message: Message;
  chat: Chat;
  sender: User | undefined;
  isMine: boolean;
  prevSenderId: string | null;
  chatMessages: Message[];
  allUsers: User[];
  onReply: (msg: Message) => void;
}) {
  const showAvatar = !isMine && sender && prevSenderId !== message.senderId;
  const showName = !isMine && (chat.type === 'group' || chat.type === 'channel') && prevSenderId !== message.senderId;

  return (
    <div className={cx('flex items-end gap-2 group px-4 relative', isMine ? 'flex-row-reverse' : 'flex-row', showAvatar ? 'mt-3' : 'mt-0.5')}>
      {/* Avatar */}
      {!isMine && (
        <div className="w-8 flex-shrink-0">
          {showAvatar && sender && (
            <Avatar src={sender.avatarUrl} name={sender.displayName} size="xs" />
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={cx('max-w-[75%] flex flex-col', isMine ? 'items-end' : 'items-start')}>
        {showName && sender && (
          <span className="text-xs font-semibold text-[#2481cc] mb-0.5 px-1">
            {sender.displayName}
            {sender.isPremium && <span className="ml-1">{sender.premiumBadge}</span>}
          </span>
        )}

        <div
          className={cx(
            'relative px-3 py-2 rounded-2xl text-[15px] leading-relaxed shadow-sm',
            isMine
              ? 'bg-[#2b5278] text-white rounded-br-sm'
              : 'bg-[#2a2a2e] text-white rounded-bl-sm'
          )}
        >
          {message.replyToId && (
            <QuotedReply
              replyToId={message.replyToId}
              chatMessages={chatMessages}
              allUsers={allUsers}
            />
          )}

          {message.inlineMeme && <InlineMemeCard meme={message.inlineMeme} />}
          {message.text && <p className="break-words">{message.text}</p>}

          <div className={cx('flex items-center gap-1 mt-1', isMine ? 'justify-end' : 'justify-start')}>
            <span className="text-[11px] text-white/40">{formatTime(message.timestamp)}</span>
            {isMine && <StatusIcon status={message.status} />}
          </div>
        </div>
      </div>

      {/* Quick Reply Button on Hover */}
      <button
        onClick={() => onReply(message)}
        title="Reply"
        className={cx(
          'opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white',
          isMine ? 'order-first mr-1' : 'ml-1'
        )}
      >
        <Reply className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ------------------------------------------------------------------
// Date Separator
// ------------------------------------------------------------------
function DateSeparator({ timestamp }: { timestamp: number }) {
  const d = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let label: string;
  if (d.toDateString() === today.toDateString()) {
    label = 'Today';
  } else if (d.toDateString() === yesterday.toDateString()) {
    label = 'Yesterday';
  } else {
    label = d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="flex items-center justify-center py-4">
      <span className="bg-[#1a1a2e] text-gray-400 text-xs px-3 py-1 rounded-full border border-white/5">
        {label}
      </span>
    </div>
  );
}

// ------------------------------------------------------------------
// Emoji Panel
// ------------------------------------------------------------------
function EmojiPanel({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full mb-2 left-0 bg-[#1c1c1e] border border-white/10 rounded-2xl p-3 shadow-2xl z-20 w-72">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">Emoji</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="text-xl p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Meme Quick Insert Panel
// ------------------------------------------------------------------
function MemeInsertPanel({ onInsert, onClose }: {
  onInsert: (meme: NonNullable<Message['inlineMeme']>) => void;
  onClose: () => void;
}) {
  const { state } = useTelegram();
  const myMemes = state.customMemes.filter((m) => m.creatorId === state.currentUser?.id);

  return (
    <div className="absolute bottom-full mb-2 left-0 bg-[#1c1c1e] border border-white/10 rounded-2xl p-3 shadow-2xl z-20 w-72 max-h-60 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">My Memes</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      {myMemes.length === 0 ? (
        <p className="text-gray-500 text-xs text-center py-4">No memes yet. Create one in Settings!</p>
      ) : (
        <div className="flex flex-col gap-2">
          {myMemes.map((m) => (
            <button
              key={m.id}
              onClick={() => onInsert({ id: m.id, topText: m.topText, bottomText: m.bottomText, bgColor: m.bgColor, textColor: m.textColor, emoji: m.emoji })}
              className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors"
              style={{ backgroundColor: m.bgColor + '33' }}
            >
              <span className="text-2xl">{m.emoji}</span>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: m.textColor }}>{m.topText}</p>
                <p className="text-xs text-gray-500 truncate">{m.bottomText}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Input Bar
// ------------------------------------------------------------------
function InputBar({
  chat,
  replyingTo,
  onCancelReply,
}: {
  chat: Chat;
  replyingTo: Message | null;
  onCancelReply: () => void;
}) {
  const { state, sendMessage, isChannelOwner } = useTelegram();
  const t = useTranslation(state.appSettings.language);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMemes, setShowMemes] = useState(false);
  const [pendingMeme, setPendingMeme] = useState<Message['inlineMeme']>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canWrite = chat.type !== 'channel' || isChannelOwner(chat);

  const replySender = replyingTo
    ? state.users.find((u) => u.id === replyingTo.senderId)
    : null;

  const handleSend = useCallback(() => {
    if ((!text.trim() && !pendingMeme) || !canWrite) return;
    sendMessage(chat.id, text, pendingMeme, replyingTo?.id ?? null);
    setText('');
    setPendingMeme(null);
    setShowEmoji(false);
    setShowMemes(false);
    onCancelReply();
    inputRef.current?.focus();
  }, [text, pendingMeme, canWrite, sendMessage, chat.id, replyingTo, onCancelReply]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [text]);

  if (!canWrite) {
    return (
      <div className="px-4 py-3 border-t border-white/5 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Mic className="w-4 h-4" />
          <span className="text-sm">{t('broadcastOnly')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-white/5 bg-[#1e2128]">
      {/* Replying Banner */}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between bg-white/5 rounded-xl px-3 py-1.5 border-l-4 border-[#2481cc]">
          <div className="flex items-center gap-2 overflow-hidden">
            <Reply className="w-4 h-4 text-[#2481cc] flex-shrink-0" />
            <div className="text-xs truncate">
              <span className="font-semibold text-[#2481cc]">{replySender?.displayName ?? 'User'}: </span>
              <span className="text-gray-300">
                {replyingTo.inlineMeme ? '🎭 Meme' : replyingTo.text || 'Media'}
              </span>
            </div>
          </div>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-white p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Pending meme preview */}
      {pendingMeme && (
        <div className="mb-2 flex items-center gap-2 bg-white/5 rounded-xl p-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: pendingMeme.bgColor }}>
            {pendingMeme.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-300 truncate">{pendingMeme.topText || pendingMeme.bottomText || 'Meme'}</p>
          </div>
          <button onClick={() => setPendingMeme(null)} className="text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 relative">
        {/* Emoji */}
        <div className="relative">
          <button
            onClick={() => { setShowEmoji(!showEmoji); setShowMemes(false); }}
            className={cx('w-9 h-9 rounded-full flex items-center justify-center transition-colors mb-1', showEmoji ? 'text-[#2481cc] bg-[#2481cc]/10' : 'text-gray-400 hover:text-white hover:bg-white/10')}
          >
            <Smile className="w-5 h-5" />
          </button>
          {showEmoji && (
            <EmojiPanel
              onSelect={(e) => setText((prev) => prev + e)}
              onClose={() => setShowEmoji(false)}
            />
          )}
        </div>

        {/* Text area */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('typeMessage')}
            rows={1}
            className="w-full bg-white/8 border border-white/10 rounded-xl text-white placeholder-gray-500 px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#2481cc]/50 resize-none overflow-hidden leading-relaxed"
            style={{ fontSize: state.appSettings.chat.fontSize }}
          />
        </div>

        {/* Attach / Meme */}
        <div className="relative">
          <button
            onClick={() => { setShowMemes(!showMemes); setShowEmoji(false); }}
            className={cx('w-9 h-9 rounded-full flex items-center justify-center transition-colors mb-1', showMemes ? 'text-[#2481cc] bg-[#2481cc]/10' : 'text-gray-400 hover:text-white hover:bg-white/10')}
          >
            <Image className="w-5 h-5" />
          </button>
          {showMemes && (
            <MemeInsertPanel
              onInsert={(meme) => { setPendingMeme(meme); setShowMemes(false); }}
              onClose={() => setShowMemes(false)}
            />
          )}
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors mb-1"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input ref={fileRef} type="file" className="hidden" />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && !pendingMeme}
          className={cx(
            'w-9 h-9 rounded-full flex items-center justify-center transition-all mb-1',
            text.trim() || pendingMeme
              ? 'bg-[#2481cc] text-white hover:bg-[#1a6db5] shadow-md active:scale-90'
              : 'bg-white/8 text-gray-500'
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Chat Info Modal
// ------------------------------------------------------------------
function ChatInfoModal({ chat, isOpen, onClose }: {
  chat: Chat;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { state } = useTelegram();
  const otherUser = chat.type === 'direct'
    ? state.users.find((u) => u.id !== state.currentUser?.id && chat.memberIds.includes(u.id))
    : null;

  const title = chat.type === 'direct' ? (otherUser?.displayName ?? chat.name) : chat.name;
  const avatarSrc = chat.type === 'direct' ? (otherUser?.avatarUrl ?? chat.avatarUrl) : chat.avatarUrl;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chat Info" size="md">
      <div className="flex flex-col items-center gap-4 py-2">
        <Avatar
          src={avatarSrc}
          name={title}
          size="xl"
          isOnline={chat.type === 'direct' ? otherUser?.isOnline : undefined}
          isPremium={chat.type === 'direct' ? otherUser?.isPremium : undefined}
          premiumBadge={chat.type === 'direct' ? otherUser?.premiumBadge : undefined}
        />
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {otherUser?.isPremium && <span>{otherUser.premiumBadge}</span>}
          </div>
          {chat.type === 'direct' && otherUser?.username && (
            <p className="text-sm text-[#2481cc]">@{otherUser.username}</p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">
            {chat.type === 'direct'
              ? (otherUser?.isOnline ? 'Online' : `Last seen ${formatLastSeen(otherUser?.lastSeen ?? 0)}`)
              : `${chat.memberIds.length} members • ${chat.type}`}
          </p>
        </div>

        {/* Bio / Description */}
        {(otherUser?.bio || chat.description) && (
          <div className="w-full bg-white/5 rounded-xl p-3 border border-white/5 text-sm text-gray-300">
            <p className="text-xs text-gray-500 font-medium mb-1">
              {chat.type === 'direct' ? 'Bio' : 'Description'}
            </p>
            <p>{chat.type === 'direct' ? otherUser?.bio : chat.description}</p>
          </div>
        )}

        {/* Member list for group/channel */}
        {chat.type !== 'direct' && (
          <div className="w-full">
            <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">
              Members ({chat.memberIds.length})
            </p>
            <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
              {chat.memberIds.map((uid) => {
                const u = state.users.find((user) => user.id === uid);
                if (!u) return null;
                const isOwner = chat.createdBy === uid;
                return (
                  <div key={uid} className="flex items-center gap-3 p-2 bg-white/3 rounded-xl">
                    <Avatar src={u.avatarUrl} name={u.displayName} size="sm" isOnline={u.isOnline} isPremium={u.isPremium} premiumBadge={u.premiumBadge} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{u.displayName}</p>
                      <p className="text-xs text-gray-500">@{u.username}</p>
                    </div>
                    {isOwner ? (
                      <Badge color="purple">Owner</Badge>
                    ) : (
                      <Badge color="gray">Member</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Settings */}
        <div className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Bell className="w-4 h-4 text-[#2481cc]" />
            <span>Notifications</span>
          </div>
          <Badge color="green">Enabled</Badge>
        </div>

        <div className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Shield className="w-4 h-4 text-green-400" />
            <span>Encryption</span>
          </div>
          <span className="text-xs text-gray-400">End-to-End</span>
        </div>
      </div>
    </Modal>
  );
}

// ------------------------------------------------------------------
// Chat Header
// ------------------------------------------------------------------
function ChatHeader({
  chat,
  onClose,
  onOpenInfo,
}: {
  chat: Chat;
  onClose: () => void;
  onOpenInfo: () => void;
}) {
  const { state } = useTelegram();
  const t = useTranslation(state.appSettings.language);

  const otherUser =
    chat.type === 'direct'
      ? state.users.find((u) => u.id !== state.currentUser?.id && chat.memberIds.includes(u.id))
      : null;

  const subtitle =
    chat.type === 'direct'
      ? otherUser?.isOnline
        ? t('online')
        : `${t('lastSeen')} ${formatLastSeen(otherUser?.lastSeen ?? 0, state.appSettings.language)}`
      : `${chat.memberIds.length} ${t('members')}`;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#1e2128] h-14">
      <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white md:hidden">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="cursor-pointer" onClick={onOpenInfo}>
        <Avatar
          src={chat.type === 'direct' ? (otherUser?.avatarUrl ?? chat.avatarUrl) : chat.avatarUrl}
          name={chat.type === 'direct' ? (otherUser?.displayName ?? chat.name) : chat.name}
          size="sm"
          isOnline={chat.type === 'direct' ? otherUser?.isOnline : undefined}
          isPremium={chat.type === 'direct' ? otherUser?.isPremium : undefined}
          premiumBadge={chat.type === 'direct' ? otherUser?.premiumBadge : undefined}
        />
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpenInfo}>
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-white text-[15px] truncate">
            {chat.type === 'direct' ? (otherUser?.displayName ?? chat.name) : chat.name}
          </h2>
          {chat.type === 'channel' && <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />}
          {chat.type === 'group' && <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />}
        </div>
        <p className={cx('text-xs truncate', otherUser?.isOnline ? 'text-[#4cd964]' : 'text-gray-500')}>
          {subtitle}
        </p>
      </div>

      {/* Info Button */}
      <button
        onClick={onOpenInfo}
        title="Chat Details"
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
      >
        <Info className="w-5 h-5" />
      </button>

      <button
        onClick={onOpenInfo}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  );
}

// ------------------------------------------------------------------
// ChatView Root
// ------------------------------------------------------------------
export function ChatView() {
  const { state, dispatch } = useTelegram();
  const chat = state.activeChat;
  const bottomRef = useRef<HTMLDivElement>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const messages = chat ? (state.messages[chat.id] ?? []) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0f1012] text-center px-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#2481cc]/20 to-[#2481cc]/5 flex items-center justify-center text-6xl mb-6 animate-pulse">
          ✈️
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Telegram</h2>
        <p className="text-gray-500 max-w-xs text-[15px]">
          Select a chat to start messaging. Your conversations are end-to-end encrypted.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-[#4cd964]" />
          Connected
        </div>
      </div>
    );
  }

  // Background themes
  const bgThemes: Record<string, string> = {
    dark: 'bg-[#0f1012]',
    light: 'bg-[#e8e8e8]',
    arctic: 'bg-gradient-to-br from-[#0f1a2e] to-[#1a2d4a]',
    desert: 'bg-gradient-to-br from-[#2e1a0f] to-[#3d2b1a]',
  };
  const bg = bgThemes[state.appSettings.chat.background] ?? bgThemes.dark;

  // Group messages by date
  let lastDate = '';
  let lastSenderId: string | null = null;

  return (
    <div className={cx('flex-1 flex flex-col h-full', bg)}>
      <ChatHeader
        chat={chat}
        onClose={() => dispatch({ type: 'SET_ACTIVE_CHAT', payload: null })}
        onOpenInfo={() => setShowInfo(true)}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-600 text-sm">
            No messages yet. Say hello! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const msgDate = new Date(msg.timestamp).toDateString();
            const showDate = msgDate !== lastDate;
            lastDate = msgDate;
            const prevSender = lastSenderId;
            lastSenderId = msg.senderId;
            const isMine = msg.senderId === state.currentUser?.id;
            const sender = state.users.find((u) => u.id === msg.senderId);

            return (
              <React.Fragment key={msg.id}>
                {showDate && <DateSeparator timestamp={msg.timestamp} />}
                <MessageBubble
                  message={msg}
                  chat={chat}
                  sender={sender}
                  isMine={isMine}
                  prevSenderId={prevSender}
                  chatMessages={messages}
                  allUsers={state.users}
                  onReply={(m) => setReplyingTo(m)}
                />
              </React.Fragment>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <InputBar
        chat={chat}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {/* Chat Info Modal */}
      <ChatInfoModal
        chat={chat}
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </div>
  );
}
