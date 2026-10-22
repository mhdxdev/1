// ============================================================
// MainPage — Responsive split-pane layout
// ============================================================

import React from 'react';
import { useTelegram } from '../context/TelegramContext';
import { Sidebar } from '../components/sidebar/Sidebar';
import { ChatView } from '../components/chat/ChatView';
import { SettingsPage } from '../components/settings/SettingsPage';
import { AdminPanel } from '../components/admin/AdminPanel';
import { cx } from '../utils/helpers';

export function MainPage() {
  const { state } = useTelegram();
  const { activeSidebarTab, activeChat } = state;

  // Determine main content
  let mainContent: React.ReactNode;
  if (activeSidebarTab === 'settings') {
    mainContent = <SettingsPage />;
  } else if (activeSidebarTab === 'admin') {
    mainContent = <AdminPanel />;
  } else {
    mainContent = <ChatView />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f1012]">
      {/* Left sidebar — hidden on mobile when chat is open */}
      <div
        className={cx(
          'h-full flex-shrink-0 transition-all duration-200',
          // Mobile: full width when no chat; hidden when chat open
          activeChat && activeSidebarTab === 'chats'
            ? 'hidden md:flex md:w-[320px] lg:w-[360px]'
            : 'flex w-full md:w-[320px] lg:w-[360px]'
        )}
      >
        <Sidebar />
      </div>

      {/* Main content area */}
      <div
        className={cx(
          'flex-1 h-full overflow-hidden',
          !activeChat && activeSidebarTab === 'chats'
            ? 'hidden md:flex'
            : 'flex'
        )}
      >
        {mainContent}
      </div>
    </div>
  );
}
