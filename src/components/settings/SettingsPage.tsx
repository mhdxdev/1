// ============================================================
// Settings Page — All functional toggles and panels
// ============================================================

import React, { useState, useRef } from 'react';
import {
  User, MessageSquare, Shield, Monitor, Globe, Star,
  Sticker, Camera, ChevronRight, Trash2, Plus, LogOut,
  Lock, Eye, EyeOff, Smartphone, Check, X, ArrowLeft,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { Avatar, Toggle, Slider, Button, Input, Textarea, Select, Badge, Modal } from '../ui';
import { useTranslation } from '../../utils/i18n';
import { BADGE_OPTIONS, PREMIUM_PLANS, formatLastSeen, generateId, cx } from '../../utils/helpers';
import type { SettingsTab, AppLanguage, BadgeIcon } from '../../types';

// ------------------------------------------------------------------
// Settings Nav Item
// ------------------------------------------------------------------
function NavItem({ icon, label, active, onClick, badge }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'w-full flex items-center gap-3 px-4 py-3 transition-colors rounded-xl text-left',
        active ? 'bg-[#2481cc]/15 text-[#2481cc]' : 'text-gray-300 hover:bg-white/5 hover:text-white'
      )}
    >
      <div className={cx('w-9 h-9 rounded-full flex items-center justify-center', active ? 'bg-[#2481cc]/20' : 'bg-white/8')}>
        {icon}
      </div>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {badge && <Badge color="blue">{badge}</Badge>}
      <ChevronRight className="w-4 h-4 text-gray-600" />
    </button>
  );
}

// ------------------------------------------------------------------
// Edit Profile Tab
// ------------------------------------------------------------------
function EditProfileTab() {
  const { state, dispatch } = useTelegram();
  const t = useTranslation(state.appSettings.language);
  const user = state.currentUser!;
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_USER',
      payload: { id: user.id, displayName, username, bio },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-xl font-bold text-white">{t('editProfile')}</h2>

      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar src={user.avatarUrl} name={user.displayName} size="xl" />
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#2481cc] rounded-full flex items-center justify-center hover:bg-[#1a6db5] transition-colors shadow-lg"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Click camera to change photo</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-white/3 rounded-2xl p-4 border border-white/5">
        <Input
          label={t('displayName')}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        />
        <Input
          label={t('username')}
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
          leftIcon={<span className="text-gray-400 text-sm">@</span>}
        />
        <Textarea
          label={t('bio')}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Tell something about yourself..."
        />
      </div>

      <Button onClick={handleSave} variant={saved ? 'success' : 'primary'} size="lg">
        {saved ? <><Check className="w-4 h-4" /> Saved!</> : t('save')}
      </Button>
    </div>
  );
}

// ------------------------------------------------------------------
// Chat Settings Tab
// ------------------------------------------------------------------
function ChatSettingsTab() {
  const { state, dispatch } = useTelegram();
  const t = useTranslation(state.appSettings.language);
  const cs = state.appSettings.chat;

  const backgrounds = [
    { value: 'dark', label: '🌑 Dark', preview: 'bg-[#0f1012]' },
    { value: 'light', label: '☀️ Light', preview: 'bg-[#e8e8e8]' },
    { value: 'arctic', label: '❄️ Arctic', preview: 'bg-gradient-to-br from-[#0f1a2e] to-[#1a2d4a]' },
    { value: 'desert', label: '🏜️ Desert', preview: 'bg-gradient-to-br from-[#2e1a0f] to-[#3d2b1a]' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-xl font-bold text-white">{t('chatSettings')}</h2>

      <div className="flex flex-col gap-4 bg-white/3 rounded-2xl p-4 border border-white/5">
        <Slider
          label="Text Size"
          value={cs.fontSize}
          min={12}
          max={20}
          step={1}
          onChange={(v) => dispatch({ type: 'UPDATE_CHAT_SETTINGS', payload: { fontSize: v } })}
          showValue
        />

        {/* Preview */}
        <div className="bg-[#2a2a2e] rounded-xl p-3">
          <p className="text-white leading-relaxed" style={{ fontSize: cs.fontSize }}>
            Preview: Hello! This is how your messages will look. 👋
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 bg-white/3 rounded-2xl p-4 border border-white/5">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Chat Background</h3>
        <div className="grid grid-cols-2 gap-3">
          {backgrounds.map((bg) => (
            <button
              key={bg.value}
              onClick={() =>
                dispatch({
                  type: 'UPDATE_CHAT_SETTINGS',
                  payload: { background: bg.value as typeof cs.background },
                })
              }
              className={cx(
                'relative h-20 rounded-xl overflow-hidden border-2 transition-all',
                cs.background === bg.value ? 'border-[#2481cc] scale-95' : 'border-white/10 hover:border-white/30'
              )}
            >
              <div className={cx('absolute inset-0', bg.preview)} />
              <div className="absolute inset-0 flex items-end p-2">
                <span className="text-xs font-medium text-white/80 bg-black/40 px-2 py-0.5 rounded-full">
                  {bg.label}
                </span>
              </div>
              {cs.background === bg.value && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#2481cc] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/3 rounded-2xl p-4 border border-white/5">
        <Toggle
          checked={cs.autoNightMode}
          onChange={(v) => dispatch({ type: 'UPDATE_CHAT_SETTINGS', payload: { autoNightMode: v } })}
          label="Auto Night Mode"
        />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Privacy & Security Tab
// ------------------------------------------------------------------
function PrivacyTab() {
  const { state, dispatch } = useTelegram();
  const t = useTranslation(state.appSettings.language);
  const priv = state.appSettings.privacy;
  const [showPasscode, setShowPasscode] = useState(false);
  const [showPasscodeText, setShowPasscodeText] = useState(false);

  const blockedUsers = state.users.filter((u) =>
    state.currentUser?.blockedUserIds.includes(u.id)
  );

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-xl font-bold text-white">{t('privacySettings')}</h2>

      <div className="flex flex-col gap-2 bg-white/3 rounded-2xl p-4 border border-white/5">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Security</h3>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-[15px] text-white">Passcode Lock</p>
                <p className="text-xs text-gray-500">Lock app with a passcode</p>
              </div>
            </div>
            <Toggle
              checked={priv.passcodeLock}
              onChange={(v) => {
                dispatch({ type: 'UPDATE_PRIVACY_SETTINGS', payload: { passcodeLock: v } });
                if (v) setShowPasscode(true);
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center">
                <Shield className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-[15px] text-white">Two-Step Verification</p>
                <p className="text-xs text-gray-500">Add extra password protection</p>
              </div>
            </div>
            <Toggle
              checked={priv.twoStepVerification}
              onChange={(v) => dispatch({ type: 'UPDATE_PRIVACY_SETTINGS', payload: { twoStepVerification: v } })}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-white/3 rounded-2xl p-4 border border-white/5">
        <h3 className="text-sm font-semibold text-gray-400 mb-1">Who can see my...</h3>

        <Select
          label="Phone Number"
          value={priv.phoneVisibility}
          onChange={(e) => dispatch({ type: 'UPDATE_PRIVACY_SETTINGS', payload: { phoneVisibility: e.target.value as typeof priv.phoneVisibility } })}
          options={[
            { value: 'everybody', label: 'Everybody' },
            { value: 'contacts', label: 'My Contacts' },
            { value: 'nobody', label: 'Nobody' },
          ]}
        />
        <Select
          label="Last Seen & Online"
          value={priv.lastSeenVisibility}
          onChange={(e) => dispatch({ type: 'UPDATE_PRIVACY_SETTINGS', payload: { lastSeenVisibility: e.target.value as typeof priv.lastSeenVisibility } })}
          options={[
            { value: 'everybody', label: 'Everybody' },
            { value: 'contacts', label: 'My Contacts' },
            { value: 'nobody', label: 'Nobody' },
          ]}
        />
      </div>

      {/* Blocked Users */}
      <div className="flex flex-col gap-3 bg-white/3 rounded-2xl p-4 border border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-400">Blocked Users</h3>
          <Badge color={blockedUsers.length > 0 ? 'red' : 'gray'}>{blockedUsers.length}</Badge>
        </div>

        {blockedUsers.length === 0 ? (
          <p className="text-gray-600 text-sm">No blocked users</p>
        ) : (
          blockedUsers.map((u) => (
            <div key={u.id} className="flex items-center gap-3">
              <Avatar src={u.avatarUrl} name={u.displayName} size="sm" />
              <div className="flex-1">
                <p className="text-sm text-white">{u.displayName}</p>
                <p className="text-xs text-gray-500">@{u.username}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: 'UNBLOCK_USER', payload: { targetId: u.id } })}
              >
                Unblock
              </Button>
            </div>
          ))
        )}

        <div className="mt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const notBlocked = state.users.filter(
                (u) =>
                  u.id !== state.currentUser?.id &&
                  !state.currentUser?.blockedUserIds.includes(u.id)
              );
              if (notBlocked[0]) {
                dispatch({ type: 'BLOCK_USER', payload: { targetId: notBlocked[0].id } });
              }
            }}
          >
            <Plus className="w-4 h-4" /> Block a user
          </Button>
        </div>
      </div>

      <Modal isOpen={showPasscode} onClose={() => setShowPasscode(false)} title="Set Passcode">
        <div className="flex flex-col gap-4">
          <p className="text-gray-400 text-sm">Enter a 4-digit passcode to lock the app</p>
          <Input
            type={showPasscodeText ? 'text' : 'password'}
            placeholder="Enter passcode"
            maxLength={4}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPasscodeText(!showPasscodeText)}
                className="hover:text-white transition-colors"
              >
                {showPasscodeText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <Input
            type={showPasscodeText ? 'text' : 'password'}
            placeholder="Confirm passcode"
            maxLength={4}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPasscodeText(!showPasscodeText)}
                className="hover:text-white transition-colors"
              >
                {showPasscodeText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <Button onClick={() => setShowPasscode(false)} fullWidth>Set Passcode</Button>
        </div>
      </Modal>
    </div>
  );
}

// ------------------------------------------------------------------
// Devices Tab
// ------------------------------------------------------------------
function DevicesTab() {
  const { state, dispatch } = useTelegram();
  const t = useTranslation(state.appSettings.language);
  const sessions = state.appSettings.sessions;

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-xl font-bold text-white">{t('devices')}</h2>

      <div className="flex flex-col gap-3">
        {sessions.map((sess) => (
          <div
            key={sess.id}
            className={cx(
              'bg-white/3 rounded-2xl p-4 border transition-colors',
              sess.isCurrentSession ? 'border-[#2481cc]/30' : 'border-white/5'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-semibold text-white">{sess.deviceName}</p>
                  {sess.isCurrentSession && <Badge color="green">Current</Badge>}
                </div>
                <p className="text-xs text-gray-500">{sess.browser} • {sess.os}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 pl-13">
              <span>📍 {sess.location}</span>
              <span>🌐 {sess.ip}</span>
              <span>🕐 {sess.isCurrentSession ? 'Active now' : formatLastSeen(sess.lastActive)}</span>
            </div>
          </div>
        ))}
      </div>

      {sessions.length > 1 && (
        <Button
          variant="danger"
          fullWidth
          onClick={() => dispatch({ type: 'TERMINATE_OTHER_SESSIONS' })}
        >
          <Trash2 className="w-4 h-4" />
          {t('terminateSessions')}
        </Button>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Language Tab
// ------------------------------------------------------------------
function LanguageTab() {
  const { state, dispatch } = useTelegram();
  const t = useTranslation(state.appSettings.language);

  const languages: { code: AppLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ru', label: 'Russian', native: 'Русский' },
    { code: 'ar', label: 'Arabic', native: 'العربية' },
    { code: 'de', label: 'German', native: 'Deutsch' },
    { code: 'fr', label: 'French', native: 'Français' },
    { code: 'es', label: 'Spanish', native: 'Español' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-xl font-bold text-white">{t('language')}</h2>

      <div className="flex flex-col gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { language: lang.code } })}
            className={cx(
              'flex items-center gap-4 p-4 rounded-2xl border transition-all text-left',
              state.appSettings.language === lang.code
                ? 'border-[#2481cc] bg-[#2481cc]/10'
                : 'border-white/5 bg-white/3 hover:bg-white/5'
            )}
          >
            <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-xl">
              {lang.code === 'en' ? '🇺🇸' : lang.code === 'ru' ? '🇷🇺' : lang.code === 'ar' ? '🇸🇦' : lang.code === 'de' ? '🇩🇪' : lang.code === 'fr' ? '🇫🇷' : '🇪🇸'}
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-white">{lang.native}</p>
              <p className="text-xs text-gray-500">{lang.label}</p>
            </div>
            {state.appSettings.language === lang.code && (
              <Check className="w-5 h-5 text-[#2481cc]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Premium Tab
// ------------------------------------------------------------------
function PremiumTab() {
  const { state, dispatch } = useTelegram();
  const t = useTranslation(state.appSettings.language);
  const isPremium = state.currentUser?.isPremium ?? false;
  const [selectedBadge, setSelectedBadge] = useState<BadgeIcon>(state.currentUser?.premiumBadge ?? '⭐');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchased, setPurchased] = useState(false);

  const handlePurchase = (planId: string) => {
    setPurchasing(planId);
    setTimeout(() => {
      setPurchasing(null);
      setPurchased(true);
      dispatch({ type: 'TOGGLE_PREMIUM', payload: { userId: state.currentUser!.id } });
    }, 2000);
  };

  const handleBadgeSelect = (badge: BadgeIcon) => {
    setSelectedBadge(badge);
    dispatch({
      type: 'UPDATE_USER',
      payload: { id: state.currentUser!.id, premiumBadge: badge },
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div className="text-center py-4 bg-gradient-to-br from-[#2481cc]/20 to-[#9c59d1]/20 rounded-2xl border border-[#2481cc]/20">
        <div className="text-5xl mb-2">{isPremium ? state.currentUser?.premiumBadge ?? '⭐' : '⭐'}</div>
        <h2 className="text-2xl font-bold text-white">{t('premium')}</h2>
        <p className="text-gray-400 text-sm mt-1">
          {isPremium ? 'You have Telegram Premium!' : 'Unlock exclusive features'}
        </p>
        <div className="flex justify-center gap-2 mt-2">
          {isPremium && <Badge color="purple">PREMIUM ACTIVE</Badge>}
          {purchased && <Badge color="green">Plan Activated</Badge>}
        </div>
      </div>

      {isPremium && (
        <div className="flex flex-col gap-3 bg-white/3 rounded-2xl p-4 border border-white/5">
          <h3 className="text-sm font-semibold text-gray-300">Your Premium Badge</h3>
          <div className="grid grid-cols-4 gap-3">
            {BADGE_OPTIONS.map((b) => (
              <button
                key={b.icon}
                onClick={() => handleBadgeSelect(b.icon as BadgeIcon)}
                className={cx(
                  'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                  selectedBadge === b.icon
                    ? 'border-[#2481cc] bg-[#2481cc]/15 scale-95'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                )}
              >
                <span className="text-2xl">{b.icon}</span>
                <span className="text-[10px] text-gray-400">{b.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isPremium && (
        <div className="flex flex-col gap-4">
          {PREMIUM_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cx(
                'bg-white/3 rounded-2xl p-5 border transition-all',
                plan.id === 'yearly' ? 'border-[#2481cc]/40 ring-1 ring-[#2481cc]/20' : 'border-white/5'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    {plan.id === 'yearly' && <Badge color="blue">Best Value</Badge>}
                  </div>
                  <p className="text-2xl font-black text-[#2481cc] mt-1">
                    \${plan.price}
                    <span className="text-sm text-gray-500 font-normal ml-1">/{plan.duration}</span>
                  </p>
                </div>
              </div>
              <ul className="flex flex-col gap-1.5 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-3.5 h-3.5 text-[#4cd964] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handlePurchase(plan.id)}
                loading={purchasing === plan.id}
                fullWidth
                variant={plan.id === 'yearly' ? 'primary' : 'secondary'}
              >
                {t('subscribe')}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Stickers & Meme Creator Tab
// ------------------------------------------------------------------
function StickersTab() {
  const { state, dispatch } = useTelegram();
  const t = useTranslation(state.appSettings.language);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [bgColor, setBgColor] = useState('#1a1a2e');
  const [textColor, setTextColor] = useState('#ffffff');
  const [emoji, setEmoji] = useState('😂');
  const [saved, setSaved] = useState(false);

  const myMemes = state.customMemes.filter((m) => m.creatorId === state.currentUser?.id);

  const bgColors = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560', '#f5a623', '#2ecc71', '#000000'];
  const textColors = ['#ffffff', '#ffff00', '#00ff00', '#00ffff', '#ff6b6b', '#ffd93d', '#000000', '#e91e63'];
  const emojis = ['😂', '🔥', '💎', '👑', '🎉', '🚀', '💡', '😎', '🤔', '🥳', '😭', '✅'];

  const handleCreate = () => {
    dispatch({
      type: 'CREATE_MEME',
      payload: {
        id: generateId(),
        creatorId: state.currentUser!.id,
        topText,
        bottomText,
        bgColor,
        textColor,
        emoji,
        createdAt: Date.now(),
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setTopText('');
    setBottomText('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h2 className="text-xl font-bold text-white">{t('stickers')} & {t('createMeme')}</h2>

      {/* Meme Builder */}
      <div className="bg-white/3 rounded-2xl p-5 border border-white/5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">🎨 Meme Builder</h3>

        {/* Preview */}
        <div
          className="rounded-xl p-6 text-center mb-4 mx-auto"
          style={{ backgroundColor: bgColor, maxWidth: 260 }}
        >
          <div className="text-5xl mb-2">{emoji}</div>
          {topText && (
            <p className="font-black text-sm uppercase tracking-wide" style={{ color: textColor, textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
              {topText}
            </p>
          )}
          {bottomText && (
            <p className="font-black text-sm uppercase tracking-wide mt-1" style={{ color: textColor, textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
              {bottomText}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Input
            placeholder="Top text..."
            value={topText}
            onChange={(e) => setTopText(e.target.value)}
          />
          <Input
            placeholder="Bottom text..."
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
          />

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Emoji</label>
            <div className="flex gap-2 flex-wrap">
              {emojis.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cx('text-xl p-1.5 rounded-lg transition-all', emoji === e ? 'bg-[#2481cc]/20 scale-110' : 'hover:bg-white/10')}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Background Color</label>
            <div className="flex gap-2 flex-wrap">
              {bgColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  className={cx('w-8 h-8 rounded-full border-2 transition-all', bgColor === c ? 'border-[#2481cc] scale-90' : 'border-white/20 hover:scale-105')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Text Color</label>
            <div className="flex gap-2 flex-wrap">
              {textColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setTextColor(c)}
                  className={cx('w-8 h-8 rounded-full border-2 transition-all', textColor === c ? 'border-[#2481cc] scale-90' : 'border-white/20 hover:scale-105')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button onClick={handleCreate} fullWidth variant={saved ? 'success' : 'primary'} disabled={!topText && !bottomText}>
            {saved ? <><Check className="w-4 h-4" /> Meme Saved!</> : `${t('createMeme')} & Save`}
          </Button>
        </div>
      </div>

      {/* My Memes gallery */}
      {myMemes.length > 0 && (
        <div className="bg-white/3 rounded-2xl p-4 border border-white/5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">My Memes ({myMemes.length})</h3>
          <div className="grid grid-cols-2 gap-3">
            {myMemes.map((m) => (
              <div
                key={m.id}
                className="rounded-xl overflow-hidden relative group"
                style={{ backgroundColor: m.bgColor }}
              >
                <div className="p-3 text-center">
                  <div className="text-3xl mb-1">{m.emoji}</div>
                  {m.topText && <p className="text-xs font-black uppercase" style={{ color: m.textColor }}>{m.topText}</p>}
                  {m.bottomText && <p className="text-xs font-black uppercase" style={{ color: m.textColor }}>{m.bottomText}</p>}
                </div>
                <button
                  onClick={() => dispatch({ type: 'DELETE_MEME', payload: { memeId: m.id } })}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Settings Root
// ------------------------------------------------------------------
export function SettingsPage() {
  const { state, dispatch } = useTelegram();
  const t = useTranslation(state.appSettings.language);
  const [mobileShowContent, setMobileShowContent] = useState(false);

  const navItems: { key: SettingsTab; icon: React.ReactNode; label: string; badge?: string }[] = [
    { key: 'profile', icon: <User className="w-4 h-4" />, label: t('editProfile') },
    { key: 'chat', icon: <MessageSquare className="w-4 h-4" />, label: t('chatSettings') },
    { key: 'privacy', icon: <Shield className="w-4 h-4" />, label: t('privacySettings') },
    { key: 'devices', icon: <Monitor className="w-4 h-4" />, label: t('devices'), badge: state.appSettings.sessions.length.toString() },
    { key: 'language', icon: <Globe className="w-4 h-4" />, label: t('language') },
    { key: 'premium', icon: <Star className="w-4 h-4" />, label: t('premium'), badge: state.currentUser?.isPremium ? 'Active' : undefined },
    { key: 'stickers', icon: <Sticker className="w-4 h-4" />, label: t('stickers') },
  ];

  const contentMap: Record<SettingsTab, React.ReactNode> = {
    profile: <EditProfileTab />,
    chat: <ChatSettingsTab />,
    privacy: <PrivacyTab />,
    devices: <DevicesTab />,
    language: <LanguageTab />,
    premium: <PremiumTab />,
    stickers: <StickersTab />,
  };

  return (
    <div className="flex h-full bg-[#0f1012]">
      {/* Settings Sidebar Nav */}
      <div className={cx('w-full md:w-72 bg-[#1a1a1e] border-r border-white/5 flex flex-col flex-shrink-0', mobileShowContent && 'hidden md:flex')}>
        <div className="px-4 py-4 border-b border-white/5">
          <h1 className="text-xl font-bold text-white">{t('settings')}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={state.activeSettingsTab === item.key}
              badge={item.badge}
              onClick={() => {
                dispatch({ type: 'SET_SETTINGS_TAB', payload: item.key });
                setMobileShowContent(true);
              }}
            />
          ))}
        </div>
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[15px] font-medium">{t('logout')}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={cx('flex-1 overflow-y-auto p-6', !mobileShowContent && 'hidden md:block')}>
        <button
          onClick={() => setMobileShowContent(false)}
          className="md:hidden flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {contentMap[state.activeSettingsTab]}
      </div>
    </div>
  );
}
