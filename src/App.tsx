// ============================================================
// App.tsx — Root component wiring auth and main views
// ============================================================

import { SpeedInsights } from '@vercel/speed-insights/react';
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
      <SpeedInsights />
    </TelegramProvider>
  );
}
