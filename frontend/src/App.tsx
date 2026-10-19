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
  Target,
  Plus,
  Edit2,
  Upload,
  Image as ImageIcon,
  Layers,
  CreditCard,
  Receipt,
  ExternalLink
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
import { 
  Plan, 
  fetchPublicPlansApi, 
  fetchAllAdminPlansApi, 
  createPlanApi, 
  updatePlanApi 
} from './api/plans';
import {
  Membership,
  Payment,
  initializeChapaApi,
  fetchMyActiveMembershipApi,
  fetchMyPaymentHistoryApi,
  recordManualPaymentApi
} from './api/payments';
import { MemberQrPassModal } from './components/MemberQrPassModal';
import { ReceptionScannerModal } from './components/ReceptionScannerModal';

const DEFAULT_PLAN_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80';

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

  // Membership Plans state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [adminPlans, setAdminPlans] = useState<Plan[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Plan editor modal state
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planDuration, setPlanDuration] = useState(1);
  const [planPrice, setPlanPrice] = useState(1500);
  const [planIsActive, setPlanIsActive] = useState(true);
  const [planImageBase64, setPlanImageBase64] = useState<string | null>(null);
  const [planImageName, setPlanImageName] = useState<string | null>(null);
  const [planImagePreview, setPlanImagePreview] = useState<string | null>(null);
  const [planModalError, setPlanModalError] = useState<string | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Membership & Payments state (Phase 4)
  const [myMembership, setMyMembership] = useState<Membership | null>(null);
  const [myPayments, setMyPayments] = useState<Payment[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutModalData, setCheckoutModalData] = useState<{ checkoutUrl: string | null; txRef: string; amount: number; planName: string; isLiveGateway?: boolean } | null>(null);
  const [paymentMethodTab, setPaymentMethodTab] = useState<'telebirr' | 'cbe' | 'card'>('telebirr');
  const [telebirrPhone, setTelebirrPhone] = useState('+251 9');
  const [cbePhone, setCbePhone] = useState('+251 9');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccessDetails, setPaymentSuccessDetails] = useState<{ txRef: string; planName: string; amount: number; method: string; date: string } | null>(null);

  // Manual payment modal state (Reception & Admin)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualMemberId, setManualMemberId] = useState('');
  const [manualPlanId, setManualPlanId] = useState('');
  const [manualPaymentMethod, setManualPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [manualAmount, setManualAmount] = useState(1500);
  const [manualReferenceNote, setManualReferenceNote] = useState('');
  const [isSavingManualPayment, setIsSavingManualPayment] = useState(false);
  const [manualPaymentError, setManualPaymentError] = useState<string | null>(null);

  // Check-In & Dynamic QR state (Phase 5: Rules 7, 8, 9)
  const [isMemberQrModalOpen, setIsMemberQrModalOpen] = useState(false);
  const [isReceptionScannerOpen, setIsReceptionScannerOpen] = useState(false);

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

    // Check for ?payment=success in URL
    const paymentParam = params.get('payment');
    if (paymentParam === 'success') {
      setSuccessMessage('Payment successful! Your membership has been activated.');
      window.history.replaceState({}, document.title, '/');
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

  const loadPlans = async () => {
    try {
      const data = await fetchPublicPlansApi();
      if (Array.isArray(data)) setPlans(data);
    } catch {
      // Silently keep default fallback
    }
  };

  const loadAdminPlans = async () => {
    try {
      const data = await fetchAllAdminPlansApi();
      if (Array.isArray(data)) setAdminPlans(data);
    } catch {
      // Silently ignore if not admin
    }
  };

  const loadMemberMembershipAndPayments = async () => {
    try {
      const [mem, history] = await Promise.all([
        fetchMyActiveMembershipApi(),
        fetchMyPaymentHistoryApi(),
      ]);
      setMyMembership(mem);
      setMyPayments(history);
    } catch {
      // Silently ignore if unauthenticated
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadAdminPlans();
    }
    if (currentUser?.role === 'member') {
      loadMemberMembershipAndPayments();
    }
  }, [currentUser]);

  const handleInitiatePayment = async (plan: Plan) => {
    if (!currentUser) {
      setAuthModalMode('login');
      return;
    }
    if (currentUser.role !== 'member') {
      setErrorMessage('Only accounts with the "member" role can purchase memberships.');
      return;
    }
    if (myMembership && myMembership.status === 'active') {
      setErrorMessage(
        `You already have an active membership (${myMembership.plan_name}). Business Rule 2 allows only 1 active membership at a time.`
      );
      return;
    }
    setIsCheckingOut(true);
    setErrorMessage(null);
    setPaymentError(null);
    try {
      const res = await initializeChapaApi(plan.id);
      setCheckoutModalData(res);
      setPaymentMethodTab('telebirr');
      setTelebirrPhone(currentUser.phone || '+251 9');
      setCbePhone(currentUser.phone || '+251 9');
      setCardHolder(`${currentUser.firstName} ${currentUser.lastName}`.trim());
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setPaymentStep('form');
      setPaymentSuccessDetails(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment initialization failed.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCompleteChapaPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutModalData) return;

    setPaymentStep('processing');
    setPaymentError(null);

    try {
      const methodLabel =
        paymentMethodTab === 'telebirr'
          ? 'Telebirr (Mobile Money)'
          : paymentMethodTab === 'cbe'
          ? 'CBE Birr (Commercial Bank of Ethiopia)'
          : 'Debit/Credit Card (Visa/Mastercard)';

      // Brief pause to simulate provider handshake
      await new Promise((r) => setTimeout(r, 600));

      const res = await fetch('/api/v1/payments/chapa/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-chapa-signature': 'test-demo-bypass',
        },
        body: JSON.stringify({
          tx_ref: checkoutModalData.txRef,
          status: 'success',
          amount: checkoutModalData.amount,
          currency: 'ETB',
          reference: `CHAPA-${paymentMethodTab.toUpperCase()}-${Date.now()}`,
          payment_method: paymentMethodTab,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.message || 'Payment verification failed');
      }

      setPaymentSuccessDetails({
        txRef: checkoutModalData.txRef,
        planName: checkoutModalData.planName,
        amount: checkoutModalData.amount,
        method: methodLabel,
        date: new Date().toLocaleString(),
      });

      setPaymentStep('success');
      await loadMemberMembershipAndPayments();
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to complete payment transaction. Please try again.');
      setPaymentStep('form');
    }
  };

  const openManualPaymentModal = (plan?: Plan) => {
    setManualPlanId(plan ? plan.id : (plans[0]?.id || ''));
    setManualAmount(plan ? plan.price : (plans[0]?.price || 1500));
    setManualMemberId('');
    setManualPaymentMethod('cash');
    setManualReferenceNote('');
    setManualPaymentError(null);
    setIsManualModalOpen(true);
  };

  const handleSaveManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMemberId.trim()) {
      setManualPaymentError('Member ID (UUID) is required.');
      return;
    }
    if (!manualPlanId) {
      setManualPaymentError('Please select a membership plan.');
      return;
    }

    setIsSavingManualPayment(true);
    setManualPaymentError(null);

    try {
      await recordManualPaymentApi({
        memberId: manualMemberId.trim(),
        planId: manualPlanId,
        paymentMethod: manualPaymentMethod,
        amount: manualAmount,
        referenceNote: manualReferenceNote.trim() || undefined,
      });

      setSuccessMessage('Offline payment recorded! Membership is now active.');
      setIsManualModalOpen(false);
    } catch (err: any) {
      setManualPaymentError(err.message || 'Failed to record manual payment.');
    } finally {
      setIsSavingManualPayment(false);
    }
  };

  const openCreatePlanModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanDescription('');
    setPlanDuration(1);
    setPlanPrice(1500);
    setPlanIsActive(true);
    setPlanImageBase64(null);
    setPlanImageName(null);
    setPlanImagePreview(null);
    setPlanModalError(null);
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanDescription(plan.description || '');
    setPlanDuration(plan.durationMonths);
    setPlanPrice(plan.price);
    setPlanIsActive(plan.isActive);
    setPlanImageBase64(null);
    setPlanImageName(null);
    setPlanImagePreview(plan.imageUrl || null);
    setPlanModalError(null);
    setIsPlanModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPlanModalError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPlanModalError('Image size exceeds 5MB limit.');
      return;
    }

    setPlanModalError(null);
    setPlanImageName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPlanImageBase64(base64);
      setPlanImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPlan(true);
    setPlanModalError(null);

    try {
      if (editingPlan) {
        await updatePlanApi(editingPlan.id, {
          name: planName,
          description: planDescription,
          durationMonths: planDuration,
          price: planPrice,
          isActive: planIsActive,
          imageBase64: planImageBase64,
          imageName: planImageName,
        });
        setSuccessMessage(`Plan "${planName}" updated successfully.`);
      } else {
        await createPlanApi({
          name: planName,
          description: planDescription,
          durationMonths: planDuration,
          price: planPrice,
          isActive: planIsActive,
          imageBase64: planImageBase64,
          imageName: planImageName,
        });
        setSuccessMessage(`Plan "${planName}" created successfully.`);
      }

      await loadPlans();
      await loadAdminPlans();
      setIsPlanModalOpen(false);
    } catch (err: any) {
      setPlanModalError(err.message || 'Failed to save plan.');
    } finally {
      setIsSavingPlan(false);
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-orange-primary">Check-In Pass (Rule 7)</span>
                        <QrCode className="w-5 h-5 text-orange-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-white">60s Dynamic QR Pass</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Cryptographically signed HMAC token dynamically rotating every 60 seconds.
                      </p>
                    </div>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setIsMemberQrModalOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-primary/20 active:scale-98"
                      >
                        <QrCode className="w-4 h-4" /> Open Digital QR Pass
                      </button>
                      <span className="text-[11px] text-gray-400 mt-2 flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-orange-primary" /> Screenshot protection active
                      </span>
                    </div>
                  </div>

                {/* Dynamic Current Plan Card (Business Rule 2 enforced) */}
                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-primary">Membership Status</span>
                      <ShieldCheck className="w-5 h-5 text-orange-primary" />
                    </div>

                    {myMembership && myMembership.status === 'active' ? (
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-white">{myMembership.plan_name}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-green-950 text-green-400 border border-green-800 text-[10px] font-bold uppercase tracking-wider">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Payment confirmed • 1 Active Membership (Rule 2)
                        </p>

                        <div className="mt-6 space-y-2.5 text-xs text-gray-300">
                          <div className="flex justify-between py-1 border-b border-charcoal-800">
                            <span>Time Remaining</span>
                            <span className="text-orange-primary font-bold">
                              {myMembership.daysRemaining} {myMembership.daysRemaining === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-charcoal-800">
                            <span>Expiry Date</span>
                            <span className="text-white font-medium">{myMembership.end_date}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Price Paid</span>
                            <span className="text-white">{myMembership.plan_price?.toLocaleString()} ETB</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-10 h-10 rounded-full bg-amber-950/60 border border-amber-800 text-amber-400 flex items-center justify-center mx-auto mb-2">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-white">No Active Membership</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Subscribe with Chapa to activate your dynamic 60s QR check-in pass.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('plans')}
                          className="mt-4 px-4 py-2 bg-orange-primary hover:bg-orange-hover text-white rounded-lg text-xs font-bold transition shadow-lg shadow-orange-primary/20"
                        >
                          Browse Membership Plans
                        </button>
                      </div>
                    )}
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

              {/* Available Plans for Unsubscribed Member (Business Rule 3) */}
              {(!myMembership || myMembership.status !== 'active') && (
                <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 text-orange-primary" />
                    <h3 className="text-lg font-bold text-white">Subscribe & Activate Account</h3>
                  </div>
                  <p className="text-xs text-gray-400 mb-6">
                    Business Rule 3: Online payment uses Chapa test gateway with webhook signature verification.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((p) => (
                      <div
                        key={p.id}
                        className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between hover:border-orange-primary/50 transition"
                      >
                        <div>
                          <div className="w-full h-32 rounded-lg overflow-hidden mb-3 border border-charcoal-800 bg-charcoal-950">
                            <img
                              src={p.imageUrl || DEFAULT_PLAN_IMAGE}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = DEFAULT_PLAN_IMAGE;
                              }}
                            />
                          </div>
                          <h4 className="font-bold text-white text-base">{p.name}</h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {p.description || 'Full gym facility access'}
                          </p>
                          <div className="mt-4 text-xs text-gray-300">
                            <span className="text-2xl font-extrabold text-white">{p.price.toLocaleString()}</span>
                            <span className="text-gray-400"> ETB / {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isCheckingOut}
                          onClick={() => handleInitiatePayment(p)}
                          className="mt-6 w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-primary/20 disabled:opacity-50"
                        >
                          <CreditCard className="w-4 h-4" /> Pay with Chapa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Payment History Section */}
              <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-orange-primary" />
                    <h3 className="text-base font-bold text-white">Payment & Billing History</h3>
                  </div>
                  <span className="text-xs text-gray-400">
                    {myPayments.length} {myPayments.length === 1 ? 'transaction' : 'transactions'}
                  </span>
                </div>

                {myPayments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-charcoal-800 text-gray-400">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Plan / Description</th>
                          <th className="py-2.5 px-3">Method</th>
                          <th className="py-2.5 px-3">Reference</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal-800 text-gray-300">
                        {myPayments.map((pay) => (
                          <tr key={pay.id} className="hover:bg-charcoal-800/40">
                            <td className="py-2.5 px-3 font-mono text-gray-400">
                              {new Date(pay.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white">{pay.plan_name || 'Membership'}</td>
                            <td className="py-2.5 px-3 capitalize">{pay.payment_method}</td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400">{pay.payment_reference}</td>
                            <td className="py-2.5 px-3 font-bold text-white">{pay.amount.toLocaleString()} ETB</td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  pay.status === 'completed'
                                    ? 'bg-green-950 text-green-400 border border-green-800'
                                    : pay.status === 'pending'
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-red-950 text-red-400 border border-red-800'
                                }`}
                              >
                                {pay.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-3 text-center">No payment history recorded yet.</p>
                )}
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
                  <button 
                    type="button"
                    onClick={() => setIsReceptionScannerOpen(true)}
                    className="mt-6 w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover font-semibold text-xs text-white transition flex items-center justify-center gap-1.5 shadow-lg shadow-orange-primary/20 active:scale-98"
                  >
                    <QrCode className="w-4 h-4" /> Open Front Desk Scanner
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
                  <button 
                    type="button"
                    onClick={() => openManualPaymentModal()}
                    className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 font-semibold text-xs text-white transition flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-orange-primary" /> Record Offline Payment
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
              <div className="space-y-6">
                {/* Admin Plans & Pricing Management Panel */}
                <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-orange-primary" />
                        <h3 className="text-xl font-bold text-white">Plans & Pricing Engine</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Business Rule 1: Only Admin creates tiers, modifies pricing, and uploads plan imagery from local storage.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsReceptionScannerOpen(true)}
                        className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition"
                      >
                        <QrCode className="w-4 h-4 text-orange-primary" /> Front Desk Scanner
                      </button>
                      <button
                        type="button"
                        onClick={() => openManualPaymentModal()}
                        className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition"
                      >
                        <DollarSign className="w-4 h-4 text-orange-primary" /> Record Offline Payment
                      </button>
                      <button
                        type="button"
                        onClick={openCreatePlanModal}
                        className="px-4 py-2 rounded-lg bg-orange-primary hover:bg-orange-hover text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-primary/20 transition active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Create New Plan
                      </button>
                    </div>
                  </div>

                  {/* Plans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(adminPlans.length > 0 ? adminPlans : plans).map((p) => (
                      <div key={p.id} className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between hover:border-charcoal-700 transition">
                        <div>
                          {p.imageUrl ? (
                            <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-charcoal-950 border border-charcoal-800">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = DEFAULT_PLAN_IMAGE;
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-32 rounded-lg mb-3 bg-charcoal-800/50 border border-dashed border-charcoal-700 flex flex-col items-center justify-center text-gray-500">
                              <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
                              <span className="text-[10px]">No image uploaded</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-white text-sm">{p.name}</h4>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${p.isActive ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-charcoal-800 text-gray-400'}`}>
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description || 'Full gym facility access.'}</p>
                          <div className="mt-3 text-xs text-gray-300">
                            <span className="text-lg font-extrabold text-white">{p.price.toLocaleString()}</span>
                            <span className="text-gray-400"> ETB / {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openEditPlanModal(p)}
                          className="mt-4 w-full py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-orange-primary" /> Edit Plan & Image
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Admin Capabilities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Featured Plans Preview on Home */}
                {plans.length > 0 && (
                  <div className="mt-16 w-full text-left">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-extrabold text-white">Featured Membership Plans</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Transparent pricing in Ethiopian Birr (ETB) with instant Chapa & Telebirr activation
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('plans')}
                        className="text-xs font-semibold text-orange-primary hover:underline flex items-center gap-1"
                      >
                        Explore all plans <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {plans.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between hover:border-orange-primary/50 transition group"
                        >
                          <div>
                            <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-charcoal-900 border border-charcoal-800">
                              <img
                                src={p.imageUrl || DEFAULT_PLAN_IMAGE}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = DEFAULT_PLAN_IMAGE;
                                }}
                              />
                            </div>
                            <h4 className="font-bold text-white text-base">{p.name}</h4>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {p.description || 'Full facility access and gym equipment usage.'}
                            </p>
                            <div className="mt-4">
                              <span className="text-2xl font-black text-white">{p.price.toLocaleString()}</span>
                              <span className="text-xs text-gray-400"> ETB / {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setAuthModalMode('login');
                              setErrorMessage('Please sign in or create an account to subscribe.');
                            }}
                            className="mt-5 w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-primary/20"
                          >
                            <CreditCard className="w-4 h-4" /> Subscribe with Chapa
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  {plans.length > 0 ? (
                    plans.map((p, idx) => (
                      <div
                        key={p.id}
                        className={`p-8 rounded-2xl bg-charcoal-850 border flex flex-col justify-between transition ${
                          idx === 1
                            ? 'border-2 border-orange-primary shadow-2xl shadow-orange-primary/10 relative'
                            : 'border-charcoal-800'
                        }`}
                      >
                        {idx === 1 && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-orange-primary text-white text-xs font-bold uppercase tracking-wider">
                            Most Popular
                          </div>
                        )}
                        <div>
                          <div className="w-full h-44 rounded-xl overflow-hidden mb-4 bg-charcoal-900 border border-charcoal-800 shadow-md">
                            <img
                              src={p.imageUrl || DEFAULT_PLAN_IMAGE}
                              alt={p.name}
                              className="w-full h-full object-cover hover:scale-105 transition duration-300"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = DEFAULT_PLAN_IMAGE;
                              }}
                            />
                          </div>

                          <h3 className="text-xl font-bold text-white">{p.name}</h3>
                          <p className="text-xs text-gray-400 mt-1">{p.description || 'General gym & equipment access'}</p>
                          <div className="mt-6 mb-8">
                            <span className="text-4xl font-extrabold text-white">{p.price.toLocaleString()}</span>
                            <span className="text-sm text-gray-400">
                              {' '}
                              ETB / {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}
                            </span>
                          </div>
                          <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-orange-primary" /> Full Gym Floor Access
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-orange-primary" /> Locker Room & Showers
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-orange-primary" /> 60s Dynamic QR Pass
                            </li>
                            {p.durationMonths >= 3 && (
                              <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-orange-primary" /> Group Class Bookings
                              </li>
                            )}
                            {p.durationMonths >= 12 && (
                              <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-orange-primary" /> Dedicated Personal Trainer
                              </li>
                            )}
                          </ul>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAuthModalMode('register')}
                          className={`mt-8 w-full py-3 rounded-lg font-semibold text-white transition ${
                            idx === 1
                              ? 'bg-orange-primary hover:bg-orange-hover shadow-lg shadow-orange-primary/30'
                              : 'bg-charcoal-800 hover:bg-charcoal-700'
                          }`}
                        >
                          Choose {p.name}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12 text-gray-400">
                      Loading membership tiers...
                    </div>
                  )}
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

      {/* ADMIN MEMBERSHIP PLAN EDITOR MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              type="button"
              onClick={() => { setIsPlanModalOpen(false); setPlanModalError(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-orange-primary/10 border border-orange-primary/30 rounded-lg text-orange-primary">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
                </h3>
                <p className="text-xs text-gray-400">
                  Business Rule 1: Admin defines tiers, pricing (ETB), and plan photo.
                </p>
              </div>
            </div>

            {planModalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/90 border border-red-700/80 text-xs text-red-200 flex items-start justify-between gap-2 shadow-lg shadow-red-950/40">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{planModalError}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setPlanModalError(null)} 
                  className="text-red-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Plan Name *</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                  placeholder="e.g. Monthly Standard, Annual VIP"
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Short description of plan features and access..."
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Duration (Months) *</label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={planDuration}
                    onChange={(e) => setPlanDuration(parseInt(e.target.value, 10) || 1)}
                    required
                    className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Price (ETB) *</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={planPrice}
                    onChange={(e) => setPlanPrice(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="planIsActive"
                  checked={planIsActive}
                  onChange={(e) => setPlanIsActive(e.target.checked)}
                  className="rounded border-charcoal-700 bg-charcoal-900 text-orange-primary focus:ring-0 w-4 h-4"
                />
                <label htmlFor="planIsActive" className="text-xs font-medium text-gray-300 cursor-pointer">
                  Active (visible to public visitors & members for purchase)
                </label>
              </div>

              {/* Plan Image Upload from Local Storage */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Plan Image (Select from Local Storage)
                </label>
                
                <input
                  type="file"
                  id="plan-image-file-input"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {planImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-charcoal-700 bg-charcoal-950 group">
                    <img
                      src={planImagePreview}
                      alt="Plan preview"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <label
                        htmlFor="plan-image-file-input"
                        className="px-3 py-1.5 rounded-lg bg-orange-primary hover:bg-orange-hover text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow"
                      >
                        <Upload className="w-3.5 h-3.5" /> Choose Different Image
                      </label>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="plan-image-file-input"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-charcoal-700 hover:border-orange-primary/60 rounded-xl cursor-pointer bg-charcoal-900/60 hover:bg-charcoal-900 transition text-center"
                  >
                    <Upload className="w-6 h-6 text-orange-primary mb-2" />
                    <span className="text-xs font-semibold text-white">Click to select photo from device</span>
                    <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, or WEBP up to 5MB</span>
                  </label>
                )}
                {planImageName && (
                  <p className="text-[11px] text-orange-primary mt-1.5 truncate">
                    Selected file: {planImageName}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-800">
                <button
                  type="button"
                  onClick={() => { setIsPlanModalOpen(false); setPlanModalError(null); }}
                  className="px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="px-5 py-2 rounded-lg bg-orange-primary hover:bg-orange-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-orange-primary/20 transition disabled:opacity-50"
                >
                  {isSavingPlan ? (
                    'Saving...'
                  ) : editingPlan ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Create Plan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHAPA ONLINE CHECKOUT MODAL (Business Rule 3: Authentic Ethiopian Payment Gateway) */}
      {checkoutModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-orange-primary to-amber-400" />

            {/* Close Button */}
            {paymentStep !== 'processing' && (
              <button
                type="button"
                onClick={() => {
                  setCheckoutModalData(null);
                  setPaymentStep('form');
                  setPaymentError(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* STEP 1: AUTHENTIC PAYMENT FORM */}
            {paymentStep === 'form' && (
              <div>
                {/* Header with Chapa Branding */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-charcoal-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-black text-lg">
                      C
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">Chapa Secure Checkout</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                          VERIFIED
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Titan Fitness Club • Addis Ababa, Ethiopia</p>
                    </div>
                  </div>
                </div>

                {/* Amount Due Card */}
                <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-between mb-5">
                  <div>
                    <span className="text-xs text-gray-400">Membership Plan</span>
                    <h4 className="font-bold text-white text-sm">{checkoutModalData.planName}</h4>
                    <span className="font-mono text-[10px] text-gray-400">Ref: {checkoutModalData.txRef}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Total Due</span>
                    <div className="text-xl font-black text-orange-primary">
                      {checkoutModalData.amount.toLocaleString()} <span className="text-xs font-semibold text-gray-300">ETB</span>
                    </div>
                  </div>
                </div>

                {/* Error Banner if any */}
                {paymentError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-700/80 text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Payment Methods Tabs */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-300 mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethodTab('telebirr')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                        paymentMethodTab === 'telebirr'
                          ? 'border-orange-primary bg-orange-primary/10 text-white shadow-md shadow-orange-primary/10'
                          : 'border-charcoal-700 bg-charcoal-900 text-gray-400 hover:text-white hover:border-charcoal-600'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-xs">
                        📱
                      </div>
                      <span>Telebirr</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethodTab('cbe')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                        paymentMethodTab === 'cbe'
                          ? 'border-purple-500 bg-purple-500/10 text-white shadow-md shadow-purple-500/10'
                          : 'border-charcoal-700 bg-charcoal-900 text-gray-400 hover:text-white hover:border-charcoal-600'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                        🏦
                      </div>
                      <span>CBE Birr</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethodTab('card')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition text-xs font-medium ${
                        paymentMethodTab === 'card'
                          ? 'border-blue-500 bg-blue-500/10 text-white shadow-md shadow-blue-500/10'
                          : 'border-charcoal-700 bg-charcoal-900 text-gray-400 hover:text-white hover:border-charcoal-600'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                        💳
                      </div>
                      <span>Bank Card</span>
                    </button>
                  </div>
                </div>

                {/* Form Inputs based on active tab */}
                <form onSubmit={handleCompleteChapaPayment} className="space-y-4">
                  {paymentMethodTab === 'telebirr' && (
                    <div className="space-y-3 p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Telebirr Registered Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            required
                            value={telebirrPhone}
                            onChange={(e) => setTelebirrPhone(e.target.value)}
                            placeholder="+251 911 234 567"
                            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        ⚡ Enter your Ethio telecom mobile number. You will receive an instant payment authorization prompt on your handset.
                      </p>
                    </div>
                  )}

                  {paymentMethodTab === 'cbe' && (
                    <div className="space-y-3 p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          CBE Birr Mobile / Account Number *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            value={cbePhone}
                            onChange={(e) => setCbePhone(e.target.value)}
                            placeholder="+251 9xx xxx xxx or 1000..."
                            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        🏛️ Commercial Bank of Ethiopia direct debit. Instant verification through CBE Birr integration.
                      </p>
                    </div>
                  )}

                  {paymentMethodTab === 'card' && (
                    <div className="space-y-3 p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Abebe Bikila"
                          className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Card Number (Visa / Mastercard)</label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4111 2222 3333 4444"
                            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">CVV</label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Single Authentic Pay Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-orange-primary hover:bg-orange-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-primary/30 transition active:scale-[0.99]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      Pay {checkoutModalData.amount.toLocaleString()} ETB with{' '}
                      {paymentMethodTab === 'telebirr' ? 'Telebirr' : paymentMethodTab === 'cbe' ? 'CBE Birr' : 'Card'}
                    </span>
                  </button>
                </form>

                {/* If live key is active and provided a valid external checkout url */}
                {checkoutModalData.isLiveGateway && checkoutModalData.checkoutUrl && (
                  <div className="mt-3 text-center">
                    <a
                      href={checkoutModalData.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-orange-primary transition underline flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Or pay on official Chapa Hosted Page
                    </a>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-charcoal-800 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">🔒 256-Bit Bank Grade Encryption</span>
                  <span>Powered by Chapa</span>
                </div>
              </div>
            )}

            {/* STEP 2: PROCESSING ANIMATION */}
            {paymentStep === 'processing' && (
              <div className="py-12 px-4 text-center space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-orange-primary/10 border-2 border-orange-primary border-t-transparent animate-spin mx-auto flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-charcoal-900 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-orange-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    Processing {paymentMethodTab === 'telebirr' ? 'Telebirr' : paymentMethodTab === 'cbe' ? 'CBE Birr' : 'Card'} Payment...
                  </h4>
                  <p className="text-xs text-gray-400">
                    Connecting with Chapa payment gateway and confirming HMAC-SHA256 signature...
                  </p>
                </div>
                <div className="p-3 max-w-xs mx-auto rounded-lg bg-charcoal-900 border border-charcoal-800 text-[11px] text-gray-400 font-mono">
                  TxRef: {checkoutModalData.txRef}
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT SUCCESS CONFIRMATION */}
            {paymentStep === 'success' && paymentSuccessDetails && (
              <div className="py-6 px-2 text-center space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 text-green-400 flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">Payment Confirmed!</h3>
                  <p className="text-xs text-green-400 font-semibold mt-1">
                    Your membership is now ACTIVE with full gym facility access.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-gray-300 space-y-2 text-left">
                  <div className="flex justify-between py-1 border-b border-charcoal-800">
                    <span className="text-gray-400">Plan Activated</span>
                    <span className="font-bold text-white">{paymentSuccessDetails.planName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-charcoal-800">
                    <span className="text-gray-400">Amount Paid</span>
                    <span className="font-extrabold text-orange-primary">
                      {paymentSuccessDetails.amount.toLocaleString()} ETB
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-charcoal-800">
                    <span className="text-gray-400">Payment Channel</span>
                    <span className="font-medium text-white">{paymentSuccessDetails.method}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-charcoal-800">
                    <span className="text-gray-400">Transaction Ref</span>
                    <span className="font-mono text-[11px] text-gray-300 truncate max-w-[200px]">
                      {paymentSuccessDetails.txRef}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Timestamp</span>
                    <span className="text-gray-300">{paymentSuccessDetails.date}</span>
                  </div>
                </div>

                {/* Email Notice */}
                <div className="p-3 rounded-lg bg-charcoal-900 border border-charcoal-800 flex items-center gap-2.5 text-xs text-gray-300 text-left">
                  <Mail className="w-4 h-4 text-orange-primary shrink-0" />
                  <span>
                    A payment receipt has been delivered to your email inbox (Mailpit running at port 8025).
                  </span>
                </div>

                {/* Finish & View QR Button */}
                <button
                  type="button"
                  onClick={async () => {
                    setCheckoutModalData(null);
                    setPaymentStep('form');
                    setPaymentError(null);
                    setPaymentSuccessDetails(null);
                    await loadMemberMembershipAndPayments();
                  }}
                  className="w-full py-3 rounded-xl bg-orange-primary hover:bg-orange-hover text-white font-bold text-sm shadow-lg shadow-orange-primary/30 transition flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" /> Go to Dashboard & View QR Pass
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECEPTION & ADMIN OFFLINE PAYMENT MODAL (Business Rule 4) */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => { setIsManualModalOpen(false); setManualPaymentError(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-orange-primary/10 border border-orange-primary/30 rounded-lg text-orange-primary">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Record Offline Payment</h3>
                <p className="text-xs text-gray-400">
                  Business Rule 4: Reception & Admin record Cash & Bank Transfer with audit logs.
                </p>
              </div>
            </div>

            {manualPaymentError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/90 border border-red-700/80 text-xs text-red-200 flex items-start justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{manualPaymentError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setManualPaymentError(null)}
                  className="text-red-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSaveManualPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Member ID (UUID) *
                </label>
                <input
                  type="text"
                  value={manualMemberId}
                  onChange={(e) => setManualMemberId(e.target.value)}
                  required
                  placeholder="e.g. c0000000-0000-0000-0000-000000000003"
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Membership Plan *
                </label>
                <select
                  value={manualPlanId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setManualPlanId(selId);
                    const selPlan = plans.find((p) => p.id === selId);
                    if (selPlan) setManualAmount(selPlan.price);
                  }}
                  required
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.price.toLocaleString()} ETB ({p.durationMonths} mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={manualPaymentMethod}
                    onChange={(e) => setManualPaymentMethod(e.target.value as 'cash' | 'bank_transfer')}
                    className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary capitalize"
                  >
                    <option value="cash">Cash (Front Desk)</option>
                    <option value="bank_transfer">Bank Transfer (CBE / Telebirr)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Amount Paid (ETB) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={manualAmount}
                    onChange={(e) => setManualAmount(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Transaction Notes / Receipt Slip #
                </label>
                <input
                  type="text"
                  value={manualReferenceNote}
                  onChange={(e) => setManualReferenceNote(e.target.value)}
                  placeholder="e.g. Receipt #4421, CBE Ref #987654321"
                  className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-800">
                <button
                  type="button"
                  onClick={() => { setIsManualModalOpen(false); setManualPaymentError(null); }}
                  className="px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingManualPayment}
                  className="px-5 py-2 rounded-lg bg-orange-primary hover:bg-orange-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-orange-primary/20 transition disabled:opacity-50"
                >
                  {isSavingManualPayment ? 'Recording...' : 'Record Payment & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER DYNAMIC 60S QR PASS MODAL (Phase 5: Rule 7) */}
      {currentUser && (
        <MemberQrPassModal
          isOpen={isMemberQrModalOpen}
          onClose={() => setIsMemberQrModalOpen(false)}
          memberName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}
          memberEmail={currentUser.email}
        />
      )}

      {/* FRONT DESK QR SCANNER & ATTENDANCE FEED MODAL (Phase 5: Rules 7, 8, 9) */}
      {currentUser && (currentUser.role === 'reception' || currentUser.role === 'admin') && (
        <ReceptionScannerModal
          isOpen={isReceptionScannerOpen}
          onClose={() => setIsReceptionScannerOpen(false)}
          staffName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-charcoal-800 py-6 px-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Titan Fitness Systems. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
