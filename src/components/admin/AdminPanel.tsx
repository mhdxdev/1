// ============================================================
// Admin Panel — Analytics, User Management, System Logs
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  Users, Hash, Star, MessageSquare, Ban, Shield,
  Activity, TrendingUp, RefreshCw, Circle,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { Avatar, Badge, Button, Toggle } from '../ui';
import { useTranslation } from '../../utils/i18n';
import { formatTime, cx } from '../../utils/helpers';
import type { AdminTab } from '../../types';

// ------------------------------------------------------------------
// Stat Card
// ------------------------------------------------------------------
function StatCard({ icon, label, value, color, change }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  change?: string;
}) {
  return (
    <div className={cx('bg-white/3 rounded-2xl p-5 border border-white/5 flex flex-col gap-3 hover:border-white/10 transition-colors')}>
      <div className={cx('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-black text-white mt-1">{value.toLocaleString()}</p>
        {change && <p className="text-xs text-green-400 mt-1">↑ {change}</p>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Analytics Tab
// ------------------------------------------------------------------
function AnalyticsTab() {
  const { state } = useTelegram();
  const a = state.analytics;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Analytics Overview</h2>
        <div className="flex items-center gap-2 text-xs text-green-400">
          <Circle className="w-2 h-2 fill-current animate-pulse" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6 text-white" />}
          label="Total Users"
          value={a.totalUsers}
          color="bg-[#2481cc]"
          change="12% this week"
        />
        <StatCard
          icon={<Hash className="w-6 h-6 text-white" />}
          label="Active Channels"
          value={a.activeChannels}
          color="bg-[#9c59d1]"
          change="3 new today"
        />
        <StatCard
          icon={<Star className="w-6 h-6 text-white" />}
          label="Premium Subs"
          value={a.premiumSubscriptions}
          color="bg-[#e67e22]"
          change="5% this month"
        />
        <StatCard
          icon={<MessageSquare className="w-6 h-6 text-white" />}
          label="Messages Today"
          value={a.messagesToday}
          color="bg-[#27ae60]"
          change="24% vs yesterday"
        />
      </div>

      {/* Mini bar chart simulation */}
      <div className="bg-white/3 rounded-2xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">Message Activity (7 days)</h3>
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex items-end gap-2 h-20">
          {[42, 68, 55, 89, 73, 91, a.messagesToday > 0 ? Math.min(a.messagesToday * 10, 100) : 64].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm bg-gradient-to-t from-[#2481cc] to-[#2481cc]/40 transition-all duration-500"
                style={{ height: `${v}%` }}
              />
              <span className="text-[9px] text-gray-600">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white/3 rounded-2xl p-5 border border-white/5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Recent System Events</h3>
        <div className="flex flex-col gap-2">
          {state.systemLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-sm">
              <div className={cx(
                'w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0',
                log.level === 'error' ? 'bg-red-400' : log.level === 'warn' ? 'bg-yellow-400' : 'bg-green-400'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-gray-300 text-xs font-mono truncate">{log.message}</p>
                <p className="text-gray-600 text-[10px] mt-0.5">{formatTime(log.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Users Tab
// ------------------------------------------------------------------
function UsersTab() {
  const { state, dispatch } = useTelegram();
  const t = useTranslation(state.appSettings.language);
  const [search, setSearch] = useState('');

  const filtered = state.users.filter((u) =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">User Management</h2>
        <Badge color="blue">{state.users.length} total</Badge>
      </div>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-white/8 border border-white/10 rounded-xl text-white placeholder-gray-500 px-4 py-2.5 text-sm focus:outline-none focus:border-[#2481cc]"
      />

      <div className="flex flex-col gap-2">
        {filtered.map((user) => (
          <div
            key={user.id}
            className={cx(
              'bg-white/3 rounded-2xl p-4 border transition-colors',
              user.isBanned ? 'border-red-500/20 bg-red-500/5' : 'border-white/5'
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src={user.avatarUrl}
                name={user.displayName}
                size="md"
                isOnline={user.isOnline}
                isPremium={user.isPremium}
                premiumBadge={user.premiumBadge}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-white text-[15px]">{user.displayName}</p>
                  {user.isPremium && <Badge color="yellow">Premium {user.premiumBadge}</Badge>}
                  {user.isBanned && <Badge color="red">Banned</Badge>}
                  {user.role === 'superadmin' && <Badge color="purple">SuperAdmin</Badge>}
                  {user.role === 'admin' && <Badge color="blue">Admin</Badge>}
                </div>
                <p className="text-xs text-gray-500">@{user.username} • {user.email}</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => dispatch({ type: 'TOGGLE_PREMIUM', payload: { userId: user.id } })}
              >
                <Star className="w-3.5 h-3.5" />
                {user.isPremium ? 'Remove Premium' : t('togglePremium')}
              </Button>

              <Button
                variant={user.isBanned ? 'success' : 'danger'}
                size="sm"
                onClick={() => dispatch({ type: 'BAN_USER', payload: { userId: user.id, isBanned: !user.isBanned } })}
              >
                <Ban className="w-3.5 h-3.5" />
                {user.isBanned ? t('unban') : t('ban')}
              </Button>

              {user.role !== 'superadmin' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    dispatch({
                      type: 'UPDATE_USER',
                      payload: {
                        id: user.id,
                        role: user.role === 'admin' ? 'user' : 'admin',
                      },
                    })
                  }
                >
                  <Shield className="w-3.5 h-3.5" />
                  {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// System Logs Tab
// ------------------------------------------------------------------
function LogsTab() {
  const { state, addLog } = useTelegram();
  const [autoScroll, setAutoScroll] = useState(true);
  const logRef = React.useRef<HTMLDivElement>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warn' | 'error'>('all');

  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [state.systemLogs.length, autoScroll]);

  const filtered = state.systemLogs.filter(
    (l) => filterLevel === 'all' || l.level === filterLevel
  );

  const levelColors = { info: 'text-green-400', warn: 'text-yellow-400', error: 'text-red-400' };
  const levelBg = { info: 'bg-green-500/10', warn: 'bg-yellow-500/10', error: 'bg-red-500/10' };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">System Logs</h2>
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <Activity className="w-3 h-3" />
            <span className="font-mono animate-pulse">LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Toggle checked={autoScroll} onChange={setAutoScroll} label="Auto-scroll" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addLog('[LOG]: Manual log refresh triggered by admin')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Level Filter */}
      <div className="flex gap-2">
        {(['all', 'info', 'warn', 'error'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={cx(
              'px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors',
              filterLevel === lvl ? 'bg-[#2481cc] text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            )}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Log scroll area */}
      <div
        ref={logRef}
        className="flex-1 bg-[#0d0d0f] rounded-2xl p-4 border border-white/5 overflow-y-auto font-mono text-xs max-h-[500px]"
      >
        {filtered.map((log) => (
          <div
            key={log.id}
            className={cx('flex items-start gap-2 py-1.5 border-b border-white/3 hover:bg-white/2 transition-colors rounded px-1', levelBg[log.level])}
          >
            <span className="text-gray-600 text-[10px] mt-0.5 flex-shrink-0 w-20">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className={cx('flex-shrink-0 font-bold text-[10px] uppercase mt-0.5', levelColors[log.level])}>
              [{log.level}]
            </span>
            <span className="text-gray-300 break-all">{log.message.replace(/^\[(LOG|WARN|ERROR)\]: /, '')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Admin Panel Root
// ------------------------------------------------------------------
export function AdminPanel() {
  const { state, dispatch } = useTelegram();
  const t = useTranslation(state.appSettings.language);

  const tabs: { key: AdminTab; icon: React.ReactNode; label: string }[] = [
    { key: 'analytics', icon: <TrendingUp className="w-4 h-4" />, label: t('analytics') },
    { key: 'users', icon: <Users className="w-4 h-4" />, label: t('users') },
    { key: 'logs', icon: <Activity className="w-4 h-4" />, label: t('logs') },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0f1012]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-[#1a1a1e]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2481cc] to-[#9c59d1] flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-bold text-white">Super Admin Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-500">System Online</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-white/5 bg-[#1a1a1e]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => dispatch({ type: 'SET_ADMIN_TAB', payload: tab.key })}
            className={cx(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2',
              state.activeAdminTab === tab.key
                ? 'text-[#2481cc] border-[#2481cc]'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {state.activeAdminTab === 'analytics' && <AnalyticsTab />}
        {state.activeAdminTab === 'users' && <UsersTab />}
        {state.activeAdminTab === 'logs' && <LogsTab />}
      </div>
    </div>
  );
}
