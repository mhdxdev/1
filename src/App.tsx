// ============================================================
// App.tsx — Root component wiring auth and main views
// ============================================================

import { Analytics } from '@vercel/analytics/react';
import { TelegramProvider, useTelegram } from './context/TelegramContext';
import { AuthPage } from './components/auth/AuthPage';
import { MainPage } from './pages/MainPage';

function AppRouter() {
  const { state } = useTelegram();

  if (state.authStep !== 'done') {
    return <AuthPage />;
  }

  return <MainPage />;
}

export default function App() {
  return (
    <TelegramProvider>
      <AppRouter />
      <Analytics />
    </TelegramProvider>
  );
}
