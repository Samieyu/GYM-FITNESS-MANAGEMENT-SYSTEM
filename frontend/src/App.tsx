import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  ShieldCheck, 
  QrCode, 
  Sparkles, 
  Check, 
  X, 
  UserCheck, 
  Calendar,
  Lock,
  Mail,
  ArrowRight,
  Server,
  LogOut,
  UserPlus,
  Activity,
  DollarSign,
  AlertCircle,
  Clock,
  Phone,
  Target
} from 'lucide-react';
import { 
  User, 
  getStoredUser, 
  loginApi, 
  registerMemberApi, 
  verifyEmailApi, 
  resendVerificationApi,
  logoutApi 
} from './api/auth';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'plans' | 'classes'>('home');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'verification-sent' | null>(null);
  
  // Login form state (empty defaults - no hardcoded demo accounts exposed)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGoals, setRegGoals] = useState('Muscle building and stamina');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // UI status and messages
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize stored session & check backend
  useEffect(() => {
    const user = getStoredUser();
    if (user) setCurrentUser(user);

    fetch('/health')
      .then((res) => {
        if (res.ok) setBackendStatus('connected');
        else setBackendStatus('disconnected');
      })
      .catch(() => setBackendStatus('disconnected'));

    // Check for ?token= query parameter in URL (Email Verification link)
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      handleAutoVerifyToken(tokenParam);
    }
  }, []);

  const handleAutoVerifyToken = async (token: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await verifyEmailApi(token);
      if (res.data?.email) {
        setLoginEmail(res.data.email);
      }
      setLoginPassword('');
      setSuccessMessage(res.data?.message || 'Email verified successfully! Please enter your password to sign in.');
      setAuthModalMode('login');
      // Clean query params from URL
      window.history.replaceState({}, document.title, '/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification token invalid or expired.');
      setAuthModalMode('login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await loginApi(loginEmail, loginPassword);
      setCurrentUser(data.user);
      setAuthModalMode(null);
      setSuccessMessage(`Welcome back, ${data.user.firstName}!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await registerMemberApi({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        fitnessGoals: regGoals,
      });

      setRegisteredEmail(regEmail);
      setLoginEmail(regEmail);
      setLoginPassword('');
      setAuthModalMode('verification-sent');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await resendVerificationApi(registeredEmail);
      setSuccessMessage(res.data?.message || 'A fresh verification link has been sent to your email.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutApi();
    setCurrentUser(null);
    setActiveTab('home');
    setSuccessMessage('Logged out successfully.');
  };

  return (
    <div className="min-h-screen bg-charcoal-900 text-gray-100 flex flex-col justify-between selection:bg-orange-primary selection:text-white">
      {/* Sticky Top Header */}
      <header className="border-b border-charcoal-800 bg-charcoal-950/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab('home')}
        >
          <div className="p-2 bg-orange-primary rounded-lg text-white shadow-md shadow-orange-primary/30">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              TITAN <span className="text-orange-primary">FITNESS</span>
            </h1>
            <p className="text-xs text-gray-400">Gym & Fitness Management System</p>
          </div>
        </div>

        {/* Navigation & User Session Bar */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-850 border border-charcoal-800 text-xs text-gray-400">
            <Server className={`w-3.5 h-3.5 ${backendStatus === 'connected' ? 'text-green-500' : 'text-amber-500'}`} />
            <span>API: {backendStatus === 'connected' ? 'Connected (Port 5000)' : 'Offline'}</span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white">{currentUser.firstName} {currentUser.lastName}</p>
                <span className="inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-orange-primary/10 text-orange-primary border border-orange-primary/30">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-charcoal-800 hover:bg-red-950 hover:text-red-400 border border-charcoal-700 text-gray-300 flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            <nav className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setActiveTab('home')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'home' ? 'text-orange-primary bg-charcoal-800' : 'text-gray-300 hover:text-white'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setActiveTab('plans')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'plans' ? 'text-orange-primary bg-charcoal-800' : 'text-gray-300 hover:text-white'}`}
              >
                Plans
              </button>
              <button 
                onClick={() => setActiveTab('classes')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${activeTab === 'classes' ? 'text-orange-primary bg-charcoal-800' : 'text-gray-300 hover:text-white'}`}
              >
                Classes
              </button>
              <button 
                onClick={() => { setAuthModalMode('register'); setErrorMessage(null); }}
                className="px-3.5 py-2 text-sm font-semibold rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-200 border border-charcoal-700 transition"
              >
                Sign Up
              </button>
              <button 
                onClick={() => { setAuthModalMode('login'); setErrorMessage(null); }}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-orange-primary hover:bg-orange-hover text-white shadow-lg shadow-orange-primary/20 transition active:scale-95"
              >
                Sign In
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Global Toast Alert (When modal is closed) */}
      {!authModalMode && (successMessage || errorMessage) && (
        <div className="max-w-6xl mx-auto w-full px-6 pt-4">
          {successMessage && (
            <div className="p-3 rounded-lg bg-green-950/70 border border-green-700/60 text-xs sm:text-sm text-green-300 flex items-center justify-between shadow-lg">
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)}><X className="w-4 h-4" /></button>
            </div>
          )}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/70 border border-red-700/60 text-xs sm:text-sm text-red-300 flex items-center justify-between shadow-lg">
              <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-400" /> {errorMessage}</span>
              <button onClick={() => setErrorMessage(null)}><X className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 w-full flex flex-col justify-center">
        {/* VIEW A: AUTHENTICATED ROLE DASHBOARD */}
        {currentUser ? (
          <div className="w-full space-y-8 animate-fadeIn">
            {/* Role Header Banner */}
            <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-orange-primary/20 text-orange-primary border border-orange-primary/30 mb-2">
                  Role: {currentUser.role.toUpperCase()}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome, {currentUser.firstName} {currentUser.lastName}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Active account: {currentUser.email} • Authenticated with RBAC Guard
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-950/60 text-green-400 border border-green-800 text-xs font-semibold">
                  <UserCheck className="w-4 h-4" /> Account Verified
                </span>
              </div>
            </div>

            {/* ROLE-SPECIFIC WORKSPACE TILES */}
            {currentUser.role === 'member' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-primary">Check-In Pass</span>
                    <QrCode className="w-5 h-5 text-orange-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white">60s Dynamic QR</h3>
                  <p className="text-xs text-gray-400 mt-1">Ready for receptionist scanning at entrance.</p>
                  <div className="mt-6 p-4 rounded-lg bg-charcoal-900 border border-charcoal-700 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center text-charcoal-950 font-mono font-bold text-xs p-2 text-center">
                      [QR TOKEN: ROTATES EVERY 60S]
                    </div>
                    <span className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-primary" /> Refreshes in 48s
                    </span>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-primary">Current Plan</span>
                    <ShieldCheck className="w-5 h-5 text-orange-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Annual VIP Elite</h3>
                  <p className="text-xs text-gray-400 mt-1">Payment verified via Chapa • 1 Active Membership</p>
                  <div className="mt-6 space-y-2 text-xs text-gray-300">
                    <div className="flex justify-between py-1 border-b border-charcoal-800">
                      <span>Status</span>
                      <span className="text-green-400 font-bold">ACTIVE</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-charcoal-800">
                      <span>Assigned Trainer</span>
                      <span className="text-white">Alex Strong</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Expiry Date</span>
                      <span className="text-gray-400">Oct 14, 2027</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-primary">Workout Routine</span>
                    <Activity className="w-5 h-5 text-orange-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Today: Chest & Core</h3>
                  <p className="text-xs text-gray-400 mt-1">Approved by Coach Alex • 5 Exercises</p>
                  <div className="mt-6 space-y-2 text-xs">
                    <div className="p-2.5 rounded bg-charcoal-900 border border-charcoal-800 flex justify-between items-center text-gray-300">
                      <span>Barbell Bench Press</span>
                      <span className="text-orange-primary font-semibold">4 × 8 reps</span>
                    </div>
                    <div className="p-2.5 rounded bg-charcoal-900 border border-charcoal-800 flex justify-between items-center text-gray-300">
                      <span>Overhead Shoulder Press</span>
                      <span className="text-orange-primary font-semibold">3 × 10 reps</span>
                    </div>
                    <div className="p-2.5 rounded bg-charcoal-900 border border-charcoal-800 flex justify-between items-center text-gray-300">
                      <span>Plank Hold</span>
                      <span className="text-orange-primary font-semibold">3 × 60 sec</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentUser.role === 'reception' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <div className="w-10 h-10 rounded-lg bg-orange-primary/10 border border-orange-primary/30 flex items-center justify-center text-orange-primary mb-4">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Live QR Scanner</h3>
                  <p className="text-xs text-gray-400 mt-1">Scan member dynamic pass and allow or deny entry.</p>
                  <button className="mt-6 w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover font-semibold text-xs text-white transition">
                    Activate Camera Scanner
                  </button>
                </div>

                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-orange-primary mb-4">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Walk-in Registration</h3>
                  <p className="text-xs text-gray-400 mt-1">Register walk-in client, pick plan, record payment, send invite.</p>
                  <button className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 font-semibold text-xs text-white transition">
                    New Member Form
                  </button>
                </div>

                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-orange-primary mb-4">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Manual Payment</h3>
                  <p className="text-xs text-gray-400 mt-1">Record Cash or Bank Transfer transactions with audit log.</p>
                  <button className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 font-semibold text-xs text-white transition">
                    Record Offline Payment
                  </button>
                </div>
              </div>
            )}

            {currentUser.role === 'trainer' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <h3 className="text-lg font-bold text-white">Assigned Members</h3>
                  <p className="text-xs text-gray-400 mt-1">View roster, review weight logs, and leave comments.</p>
                  <div className="mt-6 p-4 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs text-gray-300">
                    <p className="font-semibold text-white">John Athlete (MEM-0001)</p>
                    <p className="text-gray-400 mt-0.5">Goal: Lean muscle & cardio</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <h3 className="text-lg font-bold text-white">Workout Plan Builder</h3>
                  <p className="text-xs text-gray-400 mt-1">Create, edit, or approve AI-generated draft workout routines.</p>
                  <button className="mt-6 w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover font-semibold text-xs text-white transition">
                    Create New Plan
                  </button>
                </div>

                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <h3 className="text-lg font-bold text-white">My Classes</h3>
                  <p className="text-xs text-gray-400 mt-1">Schedule group classes, monitor bookings and waitlists.</p>
                  <button className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 font-semibold text-xs text-white transition">
                    View Class Roster
                  </button>
                </div>
              </div>
            )}

            {currentUser.role === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <h3 className="text-lg font-bold text-white">Plans & Pricing Engine</h3>
                  <p className="text-xs text-gray-400 mt-1">Only Admin can create and modify membership plan pricing.</p>
                  <div className="mt-6 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-charcoal-800">
                      <span>Standard Monthly</span>
                      <span className="font-bold text-white">1,500 ETB</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-charcoal-800">
                      <span>Quarterly Fitness</span>
                      <span className="font-bold text-white">4,000 ETB</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Annual VIP Elite</span>
                      <span className="font-bold text-white">14,000 ETB</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <h3 className="text-lg font-bold text-white">Financial & Attendance Reports</h3>
                  <p className="text-xs text-gray-400 mt-1">Export member lists, Chapa settlements, and audit logs.</p>
                  <button className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 font-semibold text-xs text-white transition">
                    Generate CSV Export
                  </button>
                </div>

                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                  <h3 className="text-lg font-bold text-white">Equipment Maintenance</h3>
                  <p className="text-xs text-gray-400 mt-1">Track machine statuses, inspect fault reports, and service due dates.</p>
                  <button className="mt-6 w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover font-semibold text-xs text-white transition">
                    Manage Inventory
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW B: PUBLIC VISITOR VIEW (When not logged in) */
          <>
            {activeTab === 'home' && (
              <div className="flex flex-col items-center text-center justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-primary/10 border border-orange-primary/30 text-orange-primary text-xs font-semibold mb-6">
                  <Sparkles className="w-3.5 h-3.5" /> Next-Generation Gym Management Platform
                </div>
                
                <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-3xl leading-tight">
                  Empowering Your Gym with <span className="text-orange-primary">Precision & AI</span>
                </h2>
                
                <p className="mt-6 text-lg text-gray-400 max-w-2xl leading-relaxed">
                  Integrated member management, 60-second rotating QR check-in, Chapa instant online payments, trainer workout builder, and Gemini AI coaching.
                </p>

                <div className="flex flex-wrap gap-4 mt-8 justify-center">
                  <button 
                    onClick={() => { setAuthModalMode('register'); setErrorMessage(null); }}
                    className="px-6 py-3 rounded-lg bg-orange-primary hover:bg-orange-hover text-white font-semibold flex items-center gap-2 shadow-lg shadow-orange-primary/25 transition active:scale-95"
                  >
                    Join Now <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('plans')}
                    className="px-6 py-3 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-gray-200 border border-charcoal-700 font-semibold transition"
                  >
                    View Membership Plans
                  </button>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
                  <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 hover:border-orange-primary/50 transition">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-orange-primary mb-4">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-lg text-white mb-2">Dynamic QR Check-In</h3>
                    <p className="text-sm text-gray-400">
                      Anti-passback 60s rotating QR tokens with receptionist verification and 2-hour repeat check-in prevention.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 hover:border-orange-primary/50 transition">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-orange-primary mb-4">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-lg text-white mb-2">Automated Expiry & Chapa</h3>
                    <p className="text-sm text-gray-400">
                      Verified webhook payment confirmation, daily automated expiry jobs, and 7-day/1-day email reminders.
                    </p>
                  </div>

                  <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 hover:border-orange-primary/50 transition">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center text-orange-primary mb-4">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-lg text-white mb-2">Gemini AI Coaching</h3>
                    <p className="text-sm text-gray-400">
                      Trainer-approved workout drafts, fitness Q&A, and strict schema validation with medical safety notices.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="w-full">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                    Membership <span className="text-orange-primary">Plans</span>
                  </h2>
                  <p className="mt-4 text-gray-400">Select the tier tailored to your fitness objectives.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">Standard Monthly</h3>
                      <p className="text-xs text-gray-400 mt-1">General gym & equipment access</p>
                      <div className="mt-6 mb-8">
                        <span className="text-4xl font-extrabold text-white">1,500</span>
                        <span className="text-sm text-gray-400"> ETB / Month</span>
                      </div>
                      <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Full Gym Floor Access</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Locker Room & Showers</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> 60s Dynamic QR Pass</li>
                      </ul>
                    </div>
                    <button 
                      onClick={() => setAuthModalMode('register')}
                      className="mt-8 w-full py-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 font-semibold text-white transition"
                    >
                      Choose Monthly
                    </button>
                  </div>

                  <div className="p-8 rounded-2xl bg-charcoal-850 border-2 border-orange-primary relative flex flex-col justify-between shadow-2xl shadow-orange-primary/10">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-primary text-white text-xs font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Quarterly Fitness</h3>
                      <p className="text-xs text-gray-400 mt-1">3 Months unlimited gym + assessment</p>
                      <div className="mt-6 mb-8">
                        <span className="text-4xl font-extrabold text-white">4,000</span>
                        <span className="text-sm text-gray-400"> ETB / 3 Months</span>
                      </div>
                      <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Unlimited Gym Access</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> 1 Free Trainer Assessment</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Progress Graph Tracking</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Group Class Bookings</li>
                      </ul>
                    </div>
                    <button 
                      onClick={() => setAuthModalMode('register')}
                      className="mt-8 w-full py-3 rounded-lg bg-orange-primary hover:bg-orange-hover font-semibold text-white shadow-lg shadow-orange-primary/30 transition"
                    >
                      Choose Quarterly
                    </button>
                  </div>

                  <div className="p-8 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">Annual VIP Elite</h3>
                      <p className="text-xs text-gray-400 mt-1">Full 12 Months VIP Access</p>
                      <div className="mt-6 mb-8">
                        <span className="text-4xl font-extrabold text-white">14,000</span>
                        <span className="text-sm text-gray-400"> ETB / Year</span>
                      </div>
                      <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> 24/7 Access & Sauna</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Dedicated Personal Trainer</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> AI Custom Workout Plan</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-orange-primary" /> Priority Class Booking</li>
                      </ul>
                    </div>
                    <button 
                      onClick={() => setAuthModalMode('register')}
                      className="mt-8 w-full py-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 font-semibold text-white transition"
                    >
                      Choose Annual VIP
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'classes' && (
              <div className="w-full">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                    Scheduled <span className="text-orange-primary">Classes</span>
                  </h2>
                  <p className="mt-4 text-gray-400">Instructor-led training sessions with capacity and waitlist management.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-orange-primary" /> Mon & Wed • 07:00 AM</span>
                      <span className="px-2 py-0.5 rounded bg-green-950 text-green-400 border border-green-800">12 / 15 Booked</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">HIIT Strength & Cardio</h3>
                    <p className="text-sm text-gray-400 mt-2">Coach Alex Strong • Main Studio</p>
                    <button 
                      onClick={() => setAuthModalMode('login')}
                      className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-orange-primary font-semibold text-white transition"
                    >
                      Reserve Spot
                    </button>
                  </div>

                  <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-orange-primary" /> Tue & Thu • 06:00 PM</span>
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">Full (3 on Waitlist)</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">Powerlifting & Deadlift Clinic</h3>
                    <p className="text-sm text-gray-400 mt-2">Coach Alex Strong • Heavy Iron Zone</p>
                    <button 
                      onClick={() => setAuthModalMode('login')}
                      className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-orange-primary font-semibold text-white transition"
                    >
                      Join Waitlist
                    </button>
                  </div>

                  <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-orange-primary" /> Saturday • 09:00 AM</span>
                      <span className="px-2 py-0.5 rounded bg-green-950 text-green-400 border border-green-800">8 / 20 Booked</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">Mobility & Functional Core</h3>
                    <p className="text-sm text-gray-400 mt-2">Studio 2 • All Levels</p>
                    <button 
                      onClick={() => setAuthModalMode('login')}
                      className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-orange-primary font-semibold text-white transition"
                    >
                      Reserve Spot
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* AUTH MODAL (LOGIN OR REGISTER) */}
      {authModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setAuthModalMode(null); setErrorMessage(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header for Login & Register */}
            {authModalMode !== 'verification-sent' && (
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-orange-primary/10 border border-orange-primary/30 rounded-lg text-orange-primary">
                  {authModalMode === 'login' ? <Lock className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {authModalMode === 'login' ? 'Sign In to Your Account' : 'Member Registration'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {authModalMode === 'login' 
                      ? 'Enter your credentials to access your dashboard' 
                      : 'Create an account to start training'}
                  </p>
                </div>
              </div>
            )}

            {/* In-Modal Alert Banners (Always visible inside modal) */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/90 border border-red-700/80 text-xs sm:text-sm text-red-200 flex items-start justify-between gap-2 shadow-lg shadow-red-950/40 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setErrorMessage(null)} 
                  className="text-red-400 hover:text-white transition p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-green-950/90 border border-green-700/80 text-xs sm:text-sm text-green-200 flex items-start justify-between gap-2 shadow-lg shadow-green-950/40 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="font-medium">{successMessage}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSuccessMessage(null)} 
                  className="text-green-400 hover:text-white transition p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* VIEW 1: VERIFICATION EMAIL SENT */}
            {authModalMode === 'verification-sent' ? (
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-16 h-16 rounded-full bg-orange-primary/10 border border-orange-primary/30 flex items-center justify-center text-orange-primary mb-4 shadow-lg shadow-orange-primary/10">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Verification Email Sent!</h3>
                <p className="text-sm text-gray-300 mt-2 max-w-sm">
                  We sent an activation link to <span className="font-semibold text-white">{registeredEmail}</span>.
                </p>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  Please check your inbox and click the verification link to activate your account before signing in.
                </p>
                
                <div className="mt-5 p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-700 w-full text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold text-orange-primary mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Testing Locally?
                  </div>
                  <p className="text-xs text-gray-400">
                    Verification emails are captured by Mailpit. Open your local inbox at{' '}
                    <a 
                      href="http://localhost:8025" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-orange-primary hover:underline font-mono"
                    >
                      http://localhost:8025
                    </a>
                  </p>
                </div>

                <div className="w-full space-y-2.5 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail(registeredEmail);
                      setLoginPassword('');
                      setAuthModalMode('login');
                      setErrorMessage(null);
                    }}
                    className="w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover text-white font-semibold text-sm shadow-lg shadow-orange-primary/20 transition"
                  >
                    Proceed to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 border border-charcoal-700 text-xs font-semibold transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Resending...' : 'Resend Verification Email'}
                  </button>
                </div>
              </div>
            ) : authModalMode === 'login' ? (
              /* VIEW 2: LOGIN FORM (Clean, unified, no admin role buttons) */
              <div>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input 
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input 
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover text-white font-semibold text-sm shadow-lg shadow-orange-primary/20 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Authenticating...' : 'Sign In'}
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-charcoal-800 text-center text-xs text-gray-400">
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setAuthModalMode('register'); setErrorMessage(null); }}
                    className="text-orange-primary hover:underline font-semibold"
                  >
                    Create Member Account
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW 3: REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">First Name</label>
                    <input 
                      type="text"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      required
                      placeholder="Jane"
                      className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Last Name</label>
                    <input 
                      type="text"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      required
                      placeholder="Doe"
                      className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Email (Verification Required)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="jane@example.com"
                      className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Password (Min 6 Characters)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+251 911 000 000"
                      className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Primary Fitness Goal</label>
                  <div className="relative">
                    <Target className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="text"
                      value={regGoals}
                      onChange={(e) => setRegGoals(e.target.value)}
                      placeholder="Muscle building, weight loss, endurance"
                      className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover text-white font-semibold text-sm shadow-lg shadow-orange-primary/20 transition disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? 'Registering...' : 'Complete Registration'}
                </button>

                <div className="mt-3 text-center text-xs text-gray-400">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setAuthModalMode('login'); setErrorMessage(null); }}
                    className="text-orange-primary hover:underline font-semibold"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-charcoal-800 py-6 px-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Titan Fitness Systems. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
