// ============================================================
// Auth Page — Google OAuth, Phone OTP, Profile Creation
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Mail, ArrowLeft, Check, User, AtSign } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { Button, Input, Avatar } from '../ui';
import { SEED_USERS } from '../../data/seed';
import { generateOtp, generateId, COUNTRY_CODES } from '../../utils/helpers';
import type { User as TgUser } from '../../types';

// ------------------------------------------------------------------
// Landing Screen
// ------------------------------------------------------------------
function LandingScreen() {
  const { dispatch } = useTelegram();
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      <div className="text-center">
        <div className="text-7xl mb-4">✈️</div>
        <h1 className="text-3xl font-bold text-white mb-2">Telegram</h1>
        <p className="text-gray-400 text-[15px]">Faster. Safer. More Open.</p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => dispatch({ type: 'SET_AUTH_STEP', payload: 'google' })}
          className="gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => dispatch({ type: 'SET_AUTH_STEP', payload: 'phone' })}
          className="gap-3"
        >
          <Smartphone className="w-5 h-5" />
          Continue with Phone
        </Button>
      </div>

      <p className="text-xs text-gray-600 text-center">
        By signing in you agree to Telegram's Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

// ------------------------------------------------------------------
// Google OAuth Screen
// ------------------------------------------------------------------
const GOOGLE_USERS = [
  { email: 'alex@gmail.com', name: 'Alex Johnson', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=alex', userId: 'u1' },
  { email: 'maria@gmail.com', name: 'Maria Garcia', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=maria', userId: 'u2' },
  { email: 'newuser@gmail.com', name: 'New User', avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=newgoogle', userId: null },
];

function GoogleScreen() {
  const { dispatch } = useTelegram();
  const [step, setStep] = useState<'select' | 'verifying' | 'done'>('select');
  const [selected, setSelected] = useState<typeof GOOGLE_USERS[0] | null>(null);

  const handleSelect = (gu: typeof GOOGLE_USERS[0]) => {
    setSelected(gu);
    setStep('verifying');
    setTimeout(() => {
      setStep('done');
      setTimeout(() => {
        const existingUser = SEED_USERS.find((u) => u.email === gu.email);
        if (existingUser) {
          dispatch({ type: 'LOGIN', payload: existingUser });
        } else {
          // New user — go to profile creation
          dispatch({
            type: 'LOGIN',
            payload: {
              id: generateId(),
              displayName: gu.name,
              username: '',
              email: gu.email,
              phone: '',
              avatarUrl: gu.avatar,
              bio: '',
              isPremium: false,
              premiumBadge: '⭐',
              role: 'user',
              isBanned: false,
              isOnline: true,
              lastSeen: Date.now(),
              joinedAt: Date.now(),
              blockedUserIds: [],
            } satisfies TgUser,
          });
          dispatch({ type: 'SET_AUTH_STEP', payload: 'profile' });
        }
      }, 500);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <button
        onClick={() => dispatch({ type: 'SET_AUTH_STEP', payload: 'landing' })}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Sign in with Google</h2>
        <p className="text-gray-400 text-sm mt-1">Choose an account to continue to Telegram</p>
      </div>

      {step === 'select' && (
        <div className="flex flex-col gap-2">
          {GOOGLE_USERS.map((gu) => (
            <button
              key={gu.email}
              onClick={() => handleSelect(gu)}
              className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left border border-white/5 hover:border-[#2481cc]/50"
            >
              <Avatar src={gu.avatar} name={gu.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-[15px]">{gu.name}</p>
                <p className="text-sm text-gray-400">{gu.email}</p>
              </div>
              {gu.userId && <span className="text-xs text-[#2481cc] bg-[#2481cc]/10 px-2 py-1 rounded-full">Existing</span>}
            </button>
          ))}
        </div>
      )}

      {step === 'verifying' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-12 h-12 border-2 border-[#2481cc] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300">Verifying with Google...</p>
          {selected && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Avatar src={selected.avatar} name={selected.name} size="sm" />
              {selected.email}
            </div>
          )}
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-300">Authenticated! Signing in...</p>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Phone Auth Screen
// ------------------------------------------------------------------
function PhoneScreen() {
  const { dispatch } = useTelegram();
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [generatedOtp] = useState(generateOtp());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendTimer]);

  const handleSendOtp = () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (code: string) => {
    if (code !== generatedOtp) {
      setError('Incorrect code. Try: ' + generatedOtp);
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Check if phone matches a known user
      const fullPhone = `${countryCode} ${phone}`;
      const existing = SEED_USERS.find((u) => u.phone.replace(/\s/g, '') === fullPhone.replace(/\s/g, ''));
      if (existing) {
        dispatch({ type: 'LOGIN', payload: existing });
      } else {
        dispatch({
          type: 'LOGIN',
          payload: {
            id: generateId(),
            displayName: 'New User',
            username: '',
            email: '',
            phone: fullPhone,
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
          } satisfies TgUser,
        });
        dispatch({ type: 'SET_AUTH_STEP', payload: 'profile' });
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <button
        onClick={() => step === 'otp' ? setStep('phone') : dispatch({ type: 'SET_AUTH_STEP', payload: 'landing' })}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {step === 'phone' ? (
        <>
          <div className="text-center">
            <div className="text-5xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-white">Your Phone</h2>
            <p className="text-gray-400 text-sm mt-1">
              Please confirm your country code and enter your phone number.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Country</label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full bg-white/8 border border-white/10 rounded-xl text-white px-4 py-3 text-[15px] focus:outline-none focus:border-[#2481cc] appearance-none"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.country} ({c.code})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="w-24">
                <Input value={countryCode} readOnly className="text-center font-mono" />
              </div>
              <div className="flex-1">
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  error={error}
                />
              </div>
            </div>

            <Button onClick={handleSendOtp} loading={loading} fullWidth size="lg">
              <Smartphone className="w-4 h-4" />
              Next
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-white">Enter Code</h2>
            <p className="text-gray-400 text-sm mt-1">
              We sent a code to <span className="text-white font-medium">{countryCode} {phone}</span>
            </p>
            <p className="text-xs text-[#2481cc] mt-1">Demo code: <strong>{generatedOtp}</strong></p>
          </div>

          <div className="flex gap-3 justify-center">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className={`w-14 h-14 text-center text-2xl font-bold bg-white/8 border rounded-xl text-white focus:outline-none transition-all ${
                  digit ? 'border-[#2481cc] bg-[#2481cc]/10' : 'border-white/10 focus:border-[#2481cc]'
                }`}
              />
            ))}
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <Button onClick={() => handleVerify(otp.join(''))} loading={loading} fullWidth size="lg">
            Verify Code
          </Button>

          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">Resend code in {resendTimer}s</p>
            ) : (
              <button
                onClick={() => { setResendTimer(60); setOtp(['', '', '', '']); }}
                className="text-sm text-[#2481cc] hover:underline"
              >
                Resend code
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Profile Creation Screen
// ------------------------------------------------------------------
function ProfileScreen() {
  const { state, dispatch } = useTelegram();
  const [displayName, setDisplayName] = useState(state.currentUser?.displayName ?? '');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUsernameChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
    setUsername(clean);
    setUsernameAvailable(null);
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    if (clean.length >= 3) {
      setCheckingUsername(true);
      usernameTimer.current = setTimeout(() => {
        const taken = state.users.some((u) => u.username === clean);
        setUsernameAvailable(!taken);
        setCheckingUsername(false);
      }, 600);
    }
  };

  const handleSave = () => {
    if (!displayName.trim() || !username.trim() || !usernameAvailable) return;
    dispatch({
      type: 'UPDATE_USER',
      payload: {
        id: state.currentUser!.id,
        displayName: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
      },
    });
    dispatch({ type: 'SET_AUTH_STEP', payload: 'done' });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <div className="text-center">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-white">Create Profile</h2>
        <p className="text-gray-400 text-sm mt-1">Set up your Telegram identity</p>
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <Avatar
            src={state.currentUser?.avatarUrl}
            name={displayName || 'U'}
            size="xl"
          />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#2481cc] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1a6db5] transition-colors">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          label="Display Name"
          placeholder="Your full name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        />

        <div className="relative">
          <Input
            label="Username"
            placeholder="username (min. 3 chars)"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            leftIcon={<AtSign className="w-4 h-4" />}
            rightIcon={
              username.length >= 3 ? (
                checkingUsername ? (
                  <div className="w-4 h-4 border-2 border-[#2481cc] border-t-transparent rounded-full animate-spin" />
                ) : usernameAvailable === true ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : usernameAvailable === false ? (
                  <span className="text-red-400 text-xs">✕</span>
                ) : null
              ) : null
            }
          />
          {username.length >= 3 && !checkingUsername && (
            <p className={`text-xs mt-1 ${usernameAvailable ? 'text-green-400' : 'text-red-400'}`}>
              {usernameAvailable ? `@${username} is available` : `@${username} is taken`}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-400 font-medium">Bio (optional)</label>
          <textarea
            placeholder="Tell something about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full bg-white/8 border border-white/10 rounded-xl text-white placeholder-gray-500 px-4 py-3 text-[15px] focus:outline-none focus:border-[#2481cc] resize-none"
          />
        </div>

        <Button
          onClick={handleSave}
          fullWidth
          size="lg"
          disabled={!displayName.trim() || username.length < 3 || !usernameAvailable}
        >
          Create Profile
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// AuthPage — Root
// ------------------------------------------------------------------
export function AuthPage() {
  const { state } = useTelegram();

  const screens: Record<typeof state.authStep, React.ReactNode> = {
    landing: <LandingScreen />,
    google: <GoogleScreen />,
    phone: <PhoneScreen />,
    otp: <PhoneScreen />,
    profile: <ProfileScreen />,
    done: null,
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {screens[state.authStep]}
      </div>
    </div>
  );
}
