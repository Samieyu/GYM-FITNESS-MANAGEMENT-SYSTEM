import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Phone,
  Target,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Plan } from '../../api/plans';
import { Button } from '../ui/Button';
import { PhotoUploader } from '../ui/PhotoUploader';
import { Badge } from '../ui/Badge';

export type AuthModalMode = 'login' | 'register' | 'set-password' | 'forgot-password';

export const BRANCH_OPTIONS = [
  { id: 'bole', name: 'Bole Branch', subtext: 'Cameroon St, Edna Mall Area' },
  { id: 'gebriel', name: 'Gebriel Branch', subtext: '22 Mazoria, Near St. Gabriel' },
  { id: 'semit', name: 'Semit Branch', subtext: 'Summit 72 Main Boulevard' },
];

interface AuthModalProps {
  mode: AuthModalMode;
  onClose: () => void;
  onSwitchMode: (newMode: AuthModalMode) => void;
  errorMessage: string | null;
  successMessage: string | null;
  onClearMessages: () => void;

  // Login handlers & state
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  onLoginSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;

  // Forgot password
  forgotEmail: string;
  setForgotEmail: (val: string) => void;
  isForgotSubmitting: boolean;
  forgotSuccess: boolean;
  onForgotPasswordSubmit: (e: React.FormEvent) => Promise<void>;
  onResetForgotSuccess: () => void;

  // Set / Reset password
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  onSetPasswordSubmit: (e: React.FormEvent) => Promise<void>;

  // Register wizard
  regFirstName: string;
  setRegFirstName: (val: string) => void;
  regLastName: string;
  setRegLastName: (val: string) => void;
  regEmail: string;
  setRegEmail: (val: string) => void;
  regPassword: string;
  setRegPassword: (val: string) => void;
  regPhone: string;
  setRegPhone: (val: string) => void;
  regGoals: string;
  setRegGoals: (val: string) => void;
  regBranch?: string;
  setRegBranch?: (val: string) => void;
  regPhotoUrl?: string | null;
  setRegPhotoUrl?: (url: string | null) => void;
  onRegisterSubmit: (e: React.FormEvent) => Promise<void>;

  // Plans list for step 3
  plans?: Plan[];
  selectedPlanId?: string;
  onSelectPlanId?: (id: string) => void;
  registerStep?: 1 | 2 | 3;
  setRegisterStep?: (step: 1 | 2 | 3) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  onClose,
  onSwitchMode,
  errorMessage,
  successMessage,
  onClearMessages,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  onLoginSubmit,
  isSubmitting,
  forgotEmail,
  setForgotEmail,
  isForgotSubmitting,
  forgotSuccess,
  onForgotPasswordSubmit,
  onResetForgotSuccess,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSetPasswordSubmit,
  regFirstName,
  setRegFirstName,
  regLastName,
  setRegLastName,
  regEmail,
  setRegEmail,
  regPassword,
  setRegPassword,
  regPhone,
  setRegPhone,
  regGoals,
  setRegGoals,
  regBranch = 'Bole Branch',
  setRegBranch,
  regPhotoUrl,
  setRegPhotoUrl,
  onRegisterSubmit,
  plans = [],
  selectedPlanId,
  onSelectPlanId,
  registerStep: controlledRegisterStep,
  setRegisterStep: controlledSetRegisterStep,
}) => {
  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign-Up Stepwise Wizard state (Step 1 -> Step 2 -> Step 3)
  const [internalRegisterStep, setInternalRegisterStep] = useState<1 | 2 | 3>(1);
  const registerStep = controlledRegisterStep ?? internalRegisterStep;
  const setRegisterStep = (step: 1 | 2 | 3) => {
    if (controlledSetRegisterStep) {
      controlledSetRegisterStep(step);
    } else {
      setInternalRegisterStep(step);
    }
  };
  const [stepError, setStepError] = useState<string | null>(null);
  const [selectedBranchLocal, setSelectedBranchLocal] = useState<string>(regBranch || 'Bole Branch');

  const handleChooseBranch = (branchName: string) => {
    setSelectedBranchLocal(branchName);
    setRegBranch?.(branchName);
    try {
      localStorage.setItem('sweatbox_member_branch', branchName);
    } catch {
      // ignore
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { label: string; percent: number; color: string } => {
    if (!pwd) return { label: '', percent: 0, color: 'bg-transparent' };
    let score = 0;
    if (pwd.length >= 6) score += 30;
    if (pwd.length >= 10) score += 20;
    if (/[A-Z]/.test(pwd)) score += 20;
    if (/[0-9]/.test(pwd)) score += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15;

    if (score < 40) return { label: 'Weak', percent: 30, color: 'bg-rose-500' };
    if (score < 70) return { label: 'Fair', percent: 65, color: 'bg-amber-500' };
    return { label: 'Strong', percent: 100, color: 'bg-emerald-500' };
  };

  const regPwdStrength = getPasswordStrength(regPassword);
  const newPwdStrength = getPasswordStrength(newPassword);

  // Validate step 1 before proceeding
  const handleNextToStep2 = (e: React.MouseEvent) => {
    e.preventDefault();
    setStepError(null);
    if (!regFirstName.trim() || !regLastName.trim()) {
      setStepError('Please enter your full first and last name.');
      return;
    }
    if (!regEmail.trim()) {
      setStepError('Gmail address is required.');
      return;
    }
    if (!regEmail.toLowerCase().endsWith('@gmail.com')) {
      setStepError('Only personal Gmail addresses (@gmail.com) are supported for verification.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setStepError('Password must contain at least 6 characters.');
      return;
    }
    setRegisterStep(2);
  };

  // Validate step 2 before proceeding
  const handleNextToStep3 = (e: React.MouseEvent) => {
    e.preventDefault();
    setStepError(null);
    if (!regPhone.trim()) {
      setStepError('Please enter your Ethiopian mobile phone number.');
      return;
    }
    // Basic phone validation (+251 9... / 09...)
    const cleanPhone = regPhone.replace(/\s+/g, '');
    if (!cleanPhone.startsWith('+251') && !cleanPhone.startsWith('09') && !cleanPhone.startsWith('07')) {
      setStepError('Phone number should begin with +251, 09, or 07.');
      return;
    }
    setRegisterStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-border w-full max-w-lg rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl shadow-black/80 relative max-h-[94vh] overflow-y-auto animate-scaleUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onClearMessages();
            setStepError(null);
          }}
          className="absolute top-4 right-4 text-text-muted hover:text-text transition p-2 rounded-lg"
          aria-label="Close auth dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3 bg-primary/10 border border-primary/25 rounded-2xl text-primary">
            {mode === 'set-password' ? (
              <ShieldCheck className="w-6 h-6" />
            ) : mode === 'login' ? (
              <Lock className="w-6 h-6" />
            ) : mode === 'forgot-password' ? (
              <Mail className="w-6 h-6" />
            ) : (
              <UserPlus className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-black text-text uppercase tracking-tight">
              {mode === 'set-password'
                ? 'Set Your Password'
                : mode === 'forgot-password'
                ? 'Reset Your Password'
                : mode === 'login'
                ? 'Sign In to POWERZONE'
                : 'Join POWERZONE'}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {mode === 'set-password'
                ? 'Create a secure password to access your member dashboard'
                : mode === 'forgot-password'
                ? 'Enter your registered Gmail to receive a password reset link'
                : mode === 'login'
                ? 'Access your athlete dashboard, QR pass, and workouts'
                : 'Stepwise member registration with instant pass creation'}
            </p>
          </div>
        </div>

        {/* In-Modal Alert Banners */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-start justify-between gap-2 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={onClearMessages}
              className="text-rose-400 hover:text-white transition p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-start justify-between gap-2 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={onClearMessages}
              className="text-emerald-400 hover:text-white transition p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {stepError && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-950/80 border border-amber-800 text-xs text-amber-200 flex items-start justify-between gap-2 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium">{stepError}</span>
            </div>
            <button
              type="button"
              onClick={() => setStepError(null)}
              className="text-amber-400 hover:text-white transition p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. SET / RESET PASSWORD FORM */}
        {mode === 'set-password' && (
          <form onSubmit={onSetPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1.5">
                New Password (minimum 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-text placeholder:text-slate-400 dark:placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3.5 text-text-muted hover:text-text transition"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-slate-200 dark:bg-charcoal-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${newPwdStrength.color}`}
                      style={{ width: `${newPwdStrength.percent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-text-muted flex justify-between">
                    <span>Password Strength</span>
                    <span className="font-bold">{newPwdStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-text placeholder:text-slate-400 dark:placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-text-muted hover:text-text transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full justify-center font-bold mt-2"
            >
              {isSubmitting ? 'Saving Password...' : 'Save Password & Access Account'}
            </Button>

            <div className="mt-4 pt-4 border-t border-border text-center text-xs text-text-muted">
              Already have a password?{' '}
              <button
                type="button"
                onClick={() => {
                  onSwitchMode('login');
                  onClearMessages();
                }}
                className="text-primary hover:underline font-bold"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGN IN / LOGIN FORM */}
        {mode === 'login' && (
          <div>
            <form onSubmit={onLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1.5">
                  Personal Gmail Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="you@gmail.com"
                    className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-text placeholder:text-slate-400 dark:placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-900 dark:text-text">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchMode('forgot-password');
                      setForgotEmail(loginEmail);
                      onResetForgotSuccess();
                      onClearMessages();
                    }}
                    className="text-xs text-primary hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-text placeholder:text-slate-400 dark:placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3.5 text-text-muted hover:text-text transition"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full justify-center font-bold mt-2"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Account'}
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-border text-center text-xs text-text-muted">
              Don't have an athlete account?{' '}
              <button
                type="button"
                onClick={() => {
                  onSwitchMode('register');
                  onClearMessages();
                }}
                className="text-primary hover:underline font-bold"
              >
                Create Member Account
              </button>
            </div>
          </div>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {mode === 'forgot-password' && (
          <div className="space-y-4">
            {forgotSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Reset Link Dispatched</span>
                </div>
                <p className="leading-relaxed">
                  If an active account matches <strong>{forgotEmail}</strong>, password reset instructions have been sent. Please check your inbox and spam folder (link expires in 1 hour).
                </p>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center font-bold"
                  onClick={() => {
                    onSwitchMode('login');
                    onResetForgotSuccess();
                    onClearMessages();
                  }}
                >
                  Return to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={onForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1.5">
                    Registered Gmail Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="athlete@gmail.com"
                      className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-text placeholder:text-slate-400 dark:placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isForgotSubmitting}
                  className="w-full justify-center font-bold"
                >
                  {isForgotSubmitting ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                </Button>

                <div className="mt-4 pt-4 border-t border-border text-center text-xs text-text-muted">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchMode('login');
                      onClearMessages();
                    }}
                    className="text-primary hover:underline font-bold"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 4. 3-STEP SIGN-UP WIZARD */}
        {mode === 'register' && (
          <div className="space-y-5">
            {/* Step Wizard Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-text-muted mb-2">
                <span className={registerStep >= 1 ? 'text-primary' : ''}>1. Account</span>
                <span className={registerStep >= 2 ? 'text-primary' : ''}>2. Profile & Photo</span>
                <span className={registerStep >= 3 ? 'text-primary' : ''}>3. Branch & Plan</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-charcoal-900 h-2 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(registerStep / 3) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={onRegisterSubmit} className="space-y-4">
              {/* STEP 1: ACCOUNT CREDENTIALS */}
              {registerStep === 1 && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1">First Name *</label>
                      <input
                        type="text"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        required
                        placeholder="Jane"
                        className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-text placeholder:text-slate-400 dark:placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        required
                        placeholder="Doe"
                        className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-text placeholder:text-slate-400 dark:placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1">
                      Personal Gmail (@gmail.com) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        placeholder="yourname@gmail.com"
                        className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-900 dark:text-text placeholder:text-slate-400 dark:placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1">
                      Password (Min 6 Characters) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border rounded-xl pl-10 pr-10 py-2 text-sm text-slate-900 dark:text-text placeholder:text-slate-400 dark:placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 top-3 text-text-muted hover:text-text transition"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Live Strength meter */}
                    {regPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="w-full bg-slate-200 dark:bg-charcoal-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${regPwdStrength.color}`}
                            style={{ width: `${regPwdStrength.percent}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-text-muted flex justify-between">
                          <span>Password Strength</span>
                          <span className="font-bold">{regPwdStrength.label}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleNextToStep2}
                    className="w-full justify-center font-bold mt-3"
                  >
                    <span>Continue to Profile & Photo</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* STEP 2: PROFILE, PHONE, PHOTO */}
              {registerStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1">
                      Ethiopian Mobile Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        required
                        placeholder="+251 911 234 567 or 09..."
                        className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-900 dark:text-text placeholder:text-slate-400 dark:placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1">
                      Primary Fitness Goal
                    </label>
                    <div className="relative">
                      <Target className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={regGoals}
                        onChange={(e) => setRegGoals(e.target.value)}
                        placeholder="e.g. Muscle hypertrophy, fat loss, stamina"
                        className="w-full bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-900 dark:text-text placeholder:text-slate-400 dark:placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Photo Uploader with Camera Capture */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1.5">
                      Athlete Profile Photo (Optional)
                    </label>
                    <PhotoUploader
                      value={regPhotoUrl || undefined}
                      onChange={(url) => setRegPhotoUrl?.(url)}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => setRegisterStep(1)}
                      className="w-1/3 justify-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={handleNextToStep3}
                      className="w-2/3 justify-center font-bold"
                    >
                      <span>Choose Branch & Membership</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: BRANCH SELECTION & PLAN SELECTION */}
              {registerStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Branch Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      Select Home Gym Branch *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {BRANCH_OPTIONS.map((b) => {
                        const isBranchSelected = (regBranch || selectedBranchLocal) === b.name;
                        return (
                          <div
                            key={b.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleChooseBranch(b.name)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') handleChooseBranch(b.name);
                            }}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                              isBranchSelected
                                ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary'
                                : 'border-slate-300 dark:border-border bg-white dark:bg-charcoal-900 hover:border-primary/50'
                            }`}
                          >
                            <span className="text-xs font-bold text-slate-900 dark:text-text leading-tight">
                              {b.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-text-muted mt-1 leading-snug line-clamp-1">
                              {b.subtext}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-900 dark:text-text mb-2">
                      Select Your Desired Membership Plan
                    </label>

                    {plans.length > 0 ? (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {plans.map((p) => {
                          const isSelected = selectedPlanId === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => onSelectPlanId?.(p.id)}
                              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                                isSelected
                                  ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary'
                                  : 'border-slate-300 dark:border-border bg-white dark:bg-charcoal-900 hover:border-primary/50 shadow-sm'
                              }`}
                            >
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-text uppercase">{p.name}</h4>
                                <span className="text-xs text-slate-600 dark:text-text-muted">
                                  {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'} duration
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-base font-black text-slate-900 dark:text-text">
                                  {p.price.toLocaleString()} ETB
                                </span>
                                {isSelected && (
                                  <Badge variant="primary" size="sm" className="ml-2">
                                    Selected
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-border text-xs text-slate-700 dark:text-text-muted text-center">
                        Standard facility tiers will be available immediately upon registration.
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-border text-xs text-text-muted space-y-1">
                    <p className="flex items-center gap-1.5 text-text font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Instant Access Next
                    </p>
                    <p>
                      Completing registration signs you in and unlocks your athlete command center. You can pay via Telebirr or CBE Birr right away.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => setRegisterStep(2)}
                      className="w-1/3 justify-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-2/3 justify-center font-bold"
                    >
                      {isSubmitting ? 'Registering...' : 'Complete & Activate'}
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-4 pt-4 border-t border-border text-center text-xs text-text-muted">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  onSwitchMode('login');
                  onClearMessages();
                }}
                className="text-primary hover:underline font-bold"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
