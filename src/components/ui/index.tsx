// ============================================================
// Shared UI Primitives
// ============================================================

import React from 'react';
import { cx } from '../../utils/helpers';

// ------------------------------------------------------------------
// Toggle Switch
// ------------------------------------------------------------------
interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Toggle({ checked, onChange, disabled = false, label }: ToggleProps) {
  return (
    <label className={cx('flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
      {label && <span className="text-[15px] text-white flex-1">{label}</span>}
      <div
        className={cx(
          'relative w-[46px] h-[26px] rounded-full transition-colors duration-200',
          checked ? 'bg-[#2481cc]' : 'bg-[#3a3a3c]'
        )}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          className={cx(
            'absolute top-[3px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
            checked ? 'translate-x-[23px]' : 'translate-x-[3px]'
          )}
        />
      </div>
    </label>
  );
}

// ------------------------------------------------------------------
// Modal
// ------------------------------------------------------------------
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;
  const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={cx('bg-[#1c1c1e] rounded-2xl w-full shadow-2xl border border-white/10', sizeClass)}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Avatar
// ------------------------------------------------------------------
interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  isPremium?: boolean;
  premiumBadge?: string;
  className?: string;
}

const AVATAR_COLORS = [
  'bg-[#2481cc]', 'bg-[#9c59d1]', 'bg-[#e8534f]', 'bg-[#e67e22]',
  'bg-[#27ae60]', 'bg-[#16a085]', 'bg-[#d35400]', 'bg-[#8e44ad]',
];

export function Avatar({ src, name, size = 'md', isOnline, isPremium, premiumBadge, className }: AvatarProps) {
  const sizes = { xs: 'w-7 h-7 text-xs', sm: 'w-9 h-9 text-sm', md: 'w-11 h-11 text-base', lg: 'w-14 h-14 text-xl', xl: 'w-20 h-20 text-3xl' };
  const indicatorSizes = { xs: 'w-2 h-2', sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-3.5 h-3.5', xl: 'w-4 h-4' };
  const colorIndex = name.charCodeAt(0) % AVATAR_COLORS.length;

  return (
    <div className={cx('relative flex-shrink-0', className)}>
      <div className={cx('rounded-full overflow-hidden flex items-center justify-center font-semibold text-white', sizes[size], !src && AVATAR_COLORS[colorIndex])}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <span>{name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      {isOnline && (
        <div className={cx('absolute bottom-0 right-0 rounded-full bg-[#4cd964] border-2 border-[#1c1c1e]', indicatorSizes[size])} />
      )}
      {isPremium && premiumBadge && (
        <div className="absolute -bottom-0.5 -right-0.5 text-[10px] leading-none bg-[#1c1c1e] rounded-full p-0.5">
          {premiumBadge}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Button
// ------------------------------------------------------------------
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', fullWidth, loading, children, className, disabled, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-[#2481cc] hover:bg-[#1a6db5] text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white',
    ghost: 'hover:bg-white/10 text-gray-300 hover:text-white',
    danger: 'bg-[#e53935] hover:bg-[#c62828] text-white',
    success: 'bg-[#4cd964] hover:bg-[#34c84a] text-black',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-[15px]', lg: 'px-6 py-3 text-base' };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cx(
        'rounded-xl font-medium transition-all duration-150 flex items-center justify-center gap-2 active:scale-95',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
}

// ------------------------------------------------------------------
// Input
// ------------------------------------------------------------------
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, rightIcon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-gray-400 font-medium">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</div>
        )}
        <input
          {...props}
          className={cx(
            'w-full bg-white/8 border border-white/10 rounded-xl text-white placeholder-gray-500 transition-colors',
            'focus:outline-none focus:border-[#2481cc] focus:bg-white/10',
            leftIcon ? 'pl-10' : 'pl-4',
            rightIcon ? 'pr-10' : 'pr-4',
            'py-3 text-[15px]',
            error && 'border-red-500',
            className
          )}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{rightIcon}</div>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

// ------------------------------------------------------------------
// Textarea
// ------------------------------------------------------------------
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-gray-400 font-medium">{label}</label>}
      <textarea
        {...props}
        className={cx(
          'w-full bg-white/8 border border-white/10 rounded-xl text-white placeholder-gray-500 transition-colors',
          'focus:outline-none focus:border-[#2481cc] focus:bg-white/10',
          'px-4 py-3 text-[15px] resize-none',
          className
        )}
      />
    </div>
  );
}

// ------------------------------------------------------------------
// Badge
// ------------------------------------------------------------------
interface BadgeProps {
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
}

export function Badge({ children, color = 'blue' }: BadgeProps) {
  const colors = {
    blue: 'bg-[#2481cc]/20 text-[#2481cc]',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    purple: 'bg-purple-500/20 text-purple-400',
    gray: 'bg-white/10 text-gray-400',
  };
  return (
    <span className={cx('text-xs px-2 py-0.5 rounded-full font-medium', colors[color])}>
      {children}
    </span>
  );
}

// ------------------------------------------------------------------
// Slider
// ------------------------------------------------------------------
interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  label?: string;
  showValue?: boolean;
}

export function Slider({ value, min, max, step = 1, onChange, label, showValue }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showValue && <span className="text-sm text-[#2481cc] font-medium">{value}</span>}
        </div>
      )}
      <div className="relative h-2 bg-white/10 rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-[#2481cc] rounded-full"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#2481cc] rounded-full shadow-lg border-2 border-white"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Spinner
// ------------------------------------------------------------------
export function Spinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cx('border-2 border-white/20 border-t-[#2481cc] rounded-full animate-spin', className)}
      style={{ width: size, height: size }}
    />
  );
}

// ------------------------------------------------------------------
// EmptyState
// ------------------------------------------------------------------
export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-4xl">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        {description && <p className="text-sm text-gray-500 max-w-xs">{description}</p>}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Select
// ------------------------------------------------------------------
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-gray-400 font-medium">{label}</label>}
      <select
        {...props}
        className={cx(
          'w-full bg-[#2a2a2e] border border-white/10 rounded-xl text-white px-4 py-3 text-[15px]',
          'focus:outline-none focus:border-[#2481cc] appearance-none cursor-pointer',
          className
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
