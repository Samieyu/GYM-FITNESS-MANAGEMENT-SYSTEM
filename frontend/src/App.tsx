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
  DollarSign,
  AlertCircle,
  Phone,
  Target,
  Plus,
  Edit2,
  Upload,
  Image as ImageIcon,
  Layers,
  CreditCard,
  ExternalLink,
  RefreshCw,
  Users,
  MapPin,
  Scale,
  Wrench,
  BarChart3,
  TrendingUp,
  Download
} from 'lucide-react';
import { 
  User, 
  getStoredUser, 
  loginApi, 
  registerMemberApi, 
  verifyEmailApi, 
  resendVerificationApi,
  requestPasswordResetApi,
  resetPasswordApi,
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
  recordManualPaymentApi,
  verifyChapaTransactionApi
} from './api/payments';
import { MemberQrPassModal } from './components/MemberQrPassModal';
import { ReceptionScannerModal } from './components/ReceptionScannerModal';
import { MemberWorkoutModal } from './components/MemberWorkoutModal';
import { TrainerWorkoutModal } from './components/TrainerWorkoutModal';
import { WalkinRegistrationModal } from './components/WalkinRegistrationModal';
import {
  FitnessClass,
  ClassBooking,
  fetchUpcomingClassesApi,
  bookClassApi,
  cancelClassBookingApi,
  fetchMyBookingsApi,
} from './api/classes';
import { ClassRosterModal } from './components/ClassRosterModal';
import { CreateClassModal } from './components/CreateClassModal';
import { MemberProgressModal } from './components/MemberProgressModal';
import { TrainerProgressModal } from './components/TrainerProgressModal';
import { EquipmentManagementModal } from './components/EquipmentManagementModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { AthleteDashboardView } from './components/AthleteDashboardView';
import { SidebarNavigation } from './components/SidebarNavigation';


import { triggerManualExpiryCheckApi } from './api/reception';
import { formatEthiopianDateTime } from './utils/ethiopianCalendar';

const DEFAULT_PLAN_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'plans' | 'classes'>('home');
  const [authModalMode, setAuthModalMode] = useState<
    'login' | 'register' | 'verification-sent' | 'set-password' | 'forgot-password' | null
  >(null);
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotSubmitting(true);
    setErrorMessage(null);
    try {
      await requestPasswordResetApi(forgotEmail);
      setForgotSuccess(true);
      setSuccessMessage('Password reset link sent! Please check your email inbox.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request password reset.');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
  const [, setIsCheckingOut] = useState(false);
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

  // Workout & AI Plan state (Phase 6: Rules 10, 11)
  const [isMemberWorkoutModalOpen, setIsMemberWorkoutModalOpen] = useState(false);
  const [isTrainerWorkoutModalOpen, setIsTrainerWorkoutModalOpen] = useState(false);
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);
  const [isRunningExpiryCheck, setIsRunningExpiryCheck] = useState(false);

  // Group Classes & Waitlists (Rule 12)
  const [classesList, setClassesList] = useState<FitnessClass[]>([]);
  const [myBookings, setMyBookings] = useState<ClassBooking[]>([]);
  const [selectedRosterClass, setSelectedRosterClass] = useState<FitnessClass | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  // Progress & Transformation Tracking
  const [isMemberProgressModalOpen, setIsMemberProgressModalOpen] = useState(false);
  const [isTrainerProgressModalOpen, setIsTrainerProgressModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  const [bookingLoadingId, setBookingLoadingId] = useState<string | null>(null);
  const [classesLoading, setClassesLoading] = useState(false);

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
    const pathname = window.location.pathname;
    const isSetPasswordMode =
      pathname.includes('set-password') ||
      pathname.includes('reset-password') ||
      params.get('mode') === 'set-password' ||
      params.get('mode') === 'reset-password';

    if (tokenParam) {
      if (isSetPasswordMode) {
        setResetPasswordToken(tokenParam);
        setNewPassword('');
        setConfirmPassword('');
        setErrorMessage(null);
        setAuthModalMode('set-password');
      } else {
        handleAutoVerifyToken(tokenParam);
      }
    }

    // Check for ?tx_ref= or ?trx_ref= in URL (Chapa hosted gateway return)
    const txRefParam = params.get('tx_ref') || params.get('trx_ref');
    if (txRefParam) {
      handleAutoVerifyChapaTx(txRefParam);
    }
  }, []);

  const loadClasses = async () => {
    setClassesLoading(true);
    try {
      const data = await fetchUpcomingClassesApi();
      setClassesList(data);
    } catch (err: any) {
      console.error('Error fetching classes:', err);
    } finally {
      setClassesLoading(false);
    }
  };

  const loadMyBookings = async () => {
    try {
      const data = await fetchMyBookingsApi();
      setMyBookings(data);
    } catch (err: any) {
      console.error('Error fetching member bookings:', err);
    }
  };

  const handleBookClass = async (cls: FitnessClass) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setErrorMessage('Please sign in to reserve a spot in this group class.');
      return;
    }
    if (currentUser.role !== 'member') {
      setErrorMessage('Only registered gym members can book group fitness classes.');
      return;
    }
    if (!myMembership || myMembership.status !== 'active') {
      setErrorMessage('Active membership required. Please subscribe to an active membership plan to reserve classes.');
      return;
    }

    setBookingLoadingId(cls.id);
    setErrorMessage(null);
    try {
      const res = await bookClassApi(cls.id);
      if (res.status === 'waitlisted') {
        setSuccessMessage(`Capacity full. You have joined the waitlist at Position #${res.waitlist_position}. You will be auto-promoted when a spot opens!`);
      } else {
        setSuccessMessage(`Spot reserved successfully for "${cls.title}"! Confirmation email dispatched.`);
      }
      await Promise.all([loadClasses(), loadMyBookings()]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to book class.');
    } finally {
      setBookingLoadingId(null);
    }
  };

  const handleCancelBooking = async (classId: string) => {
    setBookingLoadingId(classId);
    setErrorMessage(null);
    try {
      const res = await cancelClassBookingApi(classId);
      setSuccessMessage(res.message || 'Booking cancelled. Waitlisted member auto-promoted.');
      await Promise.all([loadClasses(), loadMyBookings()]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to cancel booking.');
    } finally {
      setBookingLoadingId(null);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role === 'member') {
      loadMyBookings();
    }
  }, [currentUser]);

  const handleAutoVerifyChapaTx = async (txRef: string) => {
    setIsCheckingOut(true);
    setErrorMessage(null);
    try {
      const res = await verifyChapaTransactionApi(txRef);
      if (res.status === 'success' || res.isCompleted) {
        setSuccessMessage('Payment successfully confirmed with Chapa! Your membership is now active.');
        await loadMemberMembershipAndPayments();
        setPaymentSuccessDetails({
          txRef,
          planName: res.membership?.plan_name || 'Gym Membership',
          amount: res.payment?.amount || 0,
          method: 'Chapa Secure Checkout (Telebirr / CBE / Card)',
          date: formatEthiopianDateTime(new Date()),
        });
        setPaymentStep('success');
        setCheckoutModalData({
          checkoutUrl: null,
          txRef,
          amount: res.payment?.amount || 0,
          planName: res.membership?.plan_name || 'Gym Membership',
          isLiveGateway: true,
        });
      } else if (res.status === 'failed') {
        setErrorMessage(res.message || 'Payment was unsuccessful or cancelled on Chapa. Please try again.');
        await loadMemberMembershipAndPayments();
      } else {
        setErrorMessage(res.message || 'Payment is still awaiting completion on Chapa.');
        await loadMemberMembershipAndPayments();
      }
    } catch (err: any) {
      console.warn('Auto-verify error:', err);
      setErrorMessage(err.message || 'Payment verification failed.');
    } finally {
      setIsCheckingOut(false);
      window.history.replaceState({}, document.title, '/');
    }
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordToken) {
      setErrorMessage('Missing password reset token');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await resetPasswordApi(resetPasswordToken, newPassword);
      setSuccessMessage(res.message || 'Password set successfully! Please log in with your new password.');
      setAuthModalMode('login');
      setLoginPassword('');
      window.history.replaceState({}, document.title, '/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to set password. Token may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        `You already have an active membership (${myMembership.plan_name}). Members may only hold one active membership at a time.`
      );
      return;
    }
    setIsCheckingOut(true);
    setErrorMessage(null);
    setPaymentError(null);
    try {
      const returnUrl = `${window.location.origin}/?payment=success`;
      const res = await initializeChapaApi(plan.id, returnUrl);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
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
        date: formatEthiopianDateTime(new Date()),
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

  const handleRunManualExpiryCheck = async () => {
    try {
      setIsRunningExpiryCheck(true);
      setErrorMessage(null);
      const res = await triggerManualExpiryCheckApi();
      setSuccessMessage(
        `Daily expiry check completed (Rule 5 & 6): ${res.expiredMemberships ?? 0} memberships expired, ${res.reminders7dSent ?? 0} 7-day reminders sent, ${res.reminders1dSent ?? 0} 1-day reminders sent.`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to run expiration check');
    } finally {
      setIsRunningExpiryCheck(false);
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
    // Client-side strict validation for Gmail & Ethiopian phone
    const cleanEmail = regEmail.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(cleanEmail)) {
      e.preventDefault();
      setErrorMessage('Only valid @gmail.com addresses are permitted (e.g. member@gmail.com).');
      return;
    }
    const cleanPhone = regPhone.replace(/[\s-]/g, '');
    if (!/^(\+251|0)[79]\d{8}$/.test(cleanPhone)) {
      e.preventDefault();
      setErrorMessage('Please provide a valid Ethiopian mobile phone (+251 9..., +251 7..., 09..., or 07...).');
      return;
    }
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await registerMemberApi({
        firstName: regFirstName,
        lastName: regLastName,
        email: cleanEmail,
        password: regPassword,
        phone: cleanPhone,
        fitnessGoals: regGoals,
      });

      setRegisteredEmail(cleanEmail);
      setLoginEmail(cleanEmail);
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
    <div className={`min-h-screen ${currentUser ? 'bg-[#F4F6F8] text-slate-900' : 'bg-charcoal-900 text-gray-100'} flex flex-col justify-between selection:bg-[#B4F82C] selection:text-slate-950`}>
      {/* Sleek Vertical Navigation Rail (from Design Screenshot) */}
      {currentUser && (
        <SidebarNavigation
          currentUser={currentUser}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenWorkout={() => {
            if (currentUser.role === 'member') setIsMemberWorkoutModalOpen(true);
            else setIsTrainerWorkoutModalOpen(true);
          }}
          onOpenProgress={() => {
            if (currentUser.role === 'member') setIsMemberProgressModalOpen(true);
            else setIsTrainerProgressModalOpen(true);
          }}
          onOpenAiCoach={() => setIsAiModalOpen(true)}
          onOpenQrPass={() => setIsMemberQrModalOpen(true)}
          onOpenScanner={() => setIsReceptionScannerOpen(true)}
          onOpenWalkin={() => setIsWalkinModalOpen(true)}
          onOpenEquipment={() => setIsEquipmentModalOpen(true)}
          onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
          onLogout={handleLogout}
        />
      )}
      {/* Sticky Top Header */}
      <header className="border-b border-charcoal-800 bg-charcoal-950/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab('home')}
        >
          <div className="p-2 bg-[#B4F82C] rounded-2xl text-slate-950 shadow-md shadow-[#B4F82C]/20 font-black">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              TITAN <span className="text-[#B4F82C] font-black">FITNESS</span>
            </h1>
            <p className="text-xs text-gray-400">Gym & Fitness Management System</p>
          </div>
        </div>

        {/* Navigation & User Session Bar */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-charcoal-850 border border-charcoal-800 text-xs text-gray-400">
            <Server className={`w-3.5 h-3.5 ${backendStatus === 'connected' ? 'text-green-500' : 'text-amber-500'}`} />
            <span>System: {backendStatus === 'connected' ? 'Online' : 'Offline'}</span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.role !== 'reception' && (
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#B4F82C]/10 hover:bg-[#B4F82C]/20 border border-[#B4F82C]/30 text-[#B4F82C] flex items-center gap-1.5 transition shadow-sm active:scale-95"
                  title={
                    currentUser.role === 'admin'
                      ? 'Management AI Consultant'
                      : currentUser.role === 'trainer'
                      ? 'Trainer Coaching Co-Pilot'
                      : 'Titan AI Fitness Coach'
                  }
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B4F82C]" />
                  <span className="hidden md:inline">
                    {currentUser.role === 'admin'
                      ? 'Management AI'
                      : currentUser.role === 'trainer'
                      ? 'Coaching Co-Pilot'
                      : 'AI Fitness Coach'}
                  </span>
                </button>
              )}

              {currentUser.role === 'admin' && activeTab === 'home' && (
                <button
                  type="button"
                  onClick={() => setIsAnalyticsModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 flex items-center gap-1.5 transition active:scale-95"
                  title="Financial overview, attendance throughput & CSV exports"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#B4F82C]" />
                  <span className="hidden md:inline">Analytics & Reports</span>
                </button>
              )}

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
      <main className={`mx-auto px-4 sm:px-6 py-8 flex-1 w-full flex flex-col justify-center ${currentUser ? "max-w-7xl md:pl-24" : "max-w-6xl"}`}>


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
                  Active account: {currentUser.email} • Verified Account
                </p>
              </div>

              <div className="flex items-center gap-3">

                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-950/60 text-green-400 border border-green-800 text-xs font-semibold">
                  <UserCheck className="w-4 h-4" /> Account Verified
                </span>
              </div>
            </div>

            {/* MEMBER WORKSPACE: ACTIVATION CHECK */}
            {currentUser.role === 'member' && activeTab === 'home' && (!myMembership || myMembership.status !== 'active') && (
              <div className="p-8 sm:p-12 rounded-3xl bg-[#0E1116] border border-slate-800 text-center max-w-4xl mx-auto space-y-8 shadow-2xl animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-[#B4F82C]/10 border border-[#B4F82C]/30 text-[#B4F82C] flex items-center justify-center mx-auto shadow-lg shadow-[#B4F82C]/10">
                  <CreditCard className="w-8 h-8" />
                </div>

                <div className="max-w-xl mx-auto space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#B4F82C]/10 border border-[#B4F82C]/30 text-[#B4F82C] text-xs font-semibold">
                    Step 2: Choose Membership Plan
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Activate Your Membership, {currentUser.firstName}!
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Your member account is verified. To access the gym floor, receive your 60-second rotating QR entrance pass, book group classes, and receive custom workout plans, please select a plan below.
                  </p>
                </div>

                {/* Steps tracker */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left py-2">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">✓</div>
                    <div>
                      <p className="text-xs font-bold text-white">1. Verified Account</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#B4F82C]/10 border border-[#B4F82C]/40 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#B4F82C] text-slate-950 font-bold flex items-center justify-center text-xs">2</div>
                    <div>
                      <p className="text-xs font-bold text-[#B4F82C]">2. Select Plan</p>
                      <p className="text-[10px] text-slate-300">Choose duration & pay</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 opacity-60">
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">3</div>
                    <div>
                      <p className="text-xs font-bold text-slate-300">3. Gym Access</p>
                      <p className="text-[10px] text-slate-500">Dynamic QR unlocked</p>
                    </div>
                  </div>
                </div>

                {/* Available Membership Plans Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  {plans.map((p) => (
                    <div key={p.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#B4F82C]/50 transition flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-bold text-white">{p.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description || 'Full gym facility access & trainer guidance.'}</p>
                        <div className="mt-4">
                          <span className="text-2xl font-black text-[#B4F82C]">{p.price.toLocaleString()}</span>
                          <span className="text-xs text-slate-400"> ETB / {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInitiatePayment(p)}
                        className="mt-6 w-full py-2.5 rounded-xl bg-[#B4F82C] hover:bg-[#a3e524] text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-[#B4F82C]/20"
                      >
                        <CreditCard className="w-4 h-4" /> Subscribe with Chapa
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-400">
                  <span>Prefer to pay in person? Visit the front desk to pay with Cash or Telebirr.</span>
                  <button
                    type="button"
                    onClick={loadMemberMembershipAndPayments}
                    className="text-[#B4F82C] hover:underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Payment Status
                  </button>
                </div>
              </div>
            )}

            {/* MEMBER WORKSPACE: FULL DASHBOARD (When paid & active) */}
            {currentUser.role === 'member' && activeTab === 'home' && myMembership && myMembership.status === 'active' && (
              <AthleteDashboardView
                currentUser={currentUser}
                myMembership={myMembership}
                myPayments={myPayments}
                classesList={classesList}
                myBookings={myBookings}
                plans={plans}
                onOpenQrPass={() => setIsMemberQrModalOpen(true)}
                onOpenWorkout={() => setIsMemberWorkoutModalOpen(true)}
                onOpenProgress={() => setIsMemberProgressModalOpen(true)}
                onOpenAiCoach={() => setIsAiModalOpen(true)}
                onInitiatePayment={handleInitiatePayment}
                onBookClass={handleBookClass}
                onCancelBooking={(cls) => handleCancelBooking(cls.id)}
                bookingLoadingId={bookingLoadingId}
                onRefreshClasses={loadClasses}
                onVerifyChapaTx={handleAutoVerifyChapaTx}
                onNavigateTab={setActiveTab}
              />
            )}

            {currentUser.role === 'reception' && activeTab === 'home' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#B4F82C]/10 border border-[#B4F82C]/30 flex items-center justify-center text-[#B4F82C] mb-4">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Live QR Scanner</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Optical scanner for member dynamic QR passes with instant anti-passback and expiration check.
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsReceptionScannerOpen(true)}
                    className="mt-6 w-full py-2.5 rounded-xl bg-[#B4F82C] hover:bg-[#a3e524] font-bold text-xs text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-[#B4F82C]/20 active:scale-98"
                  >
                    <QrCode className="w-4 h-4" /> Open Front Desk Scanner
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-charcoal-800 flex items-center justify-center text-[#B4F82C] mb-4">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Walk-in Member Registration</h3>
                    <p className="text-xs text-gray-400 mt-1">Register walk-in client, assign membership tier, record cash payment, and send activation link.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsWalkinModalOpen(true)}
                    className="mt-6 w-full py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 font-semibold text-xs text-white transition flex items-center justify-center gap-2 active:scale-98"
                  >
                    <UserPlus className="w-4 h-4 text-[#B4F82C]" /> Register Walk-in Member
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-charcoal-800 flex items-center justify-center text-[#B4F82C] mb-4">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Record Offline Payment</h3>
                    <p className="text-xs text-gray-400 mt-1">Record Cash or Direct Bank Transfer transactions with immediate receipt generation.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => openManualPaymentModal()}
                    className="mt-6 w-full py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 font-semibold text-xs text-white transition flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4 text-[#B4F82C]" /> Record Cash / Transfer
                  </button>
                </div>
              </div>
            )}

            {currentUser.role === 'trainer' && activeTab === 'home' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-orange-primary/10 border border-orange-primary/30 flex items-center justify-center text-orange-primary mb-4">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Assigned Athletes & Logs</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Review athlete weight metrics, body measurements, and leave coaching notes.
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsTrainerProgressModalOpen(true)}
                    className="mt-6 w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover font-semibold text-xs text-white transition flex items-center justify-center gap-1.5 shadow-lg shadow-orange-primary/20 active:scale-98"
                  >
                    <Scale className="w-4 h-4" /> Review Athlete Transformation
                  </button>
                </div>

                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-orange-primary/10 border border-orange-primary/30 flex items-center justify-center text-orange-primary mb-4">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Workout Plan Builder</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Review AI-generated draft plans (Rule 11) or build custom athlete routines.
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsTrainerWorkoutModalOpen(true)}
                    className="mt-6 w-full py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover font-semibold text-xs text-white transition flex items-center justify-center gap-1.5 shadow-lg shadow-orange-primary/20 active:scale-98"
                  >
                    <Sparkles className="w-4 h-4" /> Review Queue & Plan Builder
                  </button>
                </div>

                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-orange-primary/10 border border-orange-primary/30 flex items-center justify-center text-orange-primary mb-4">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Group Classes & Roster</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Schedule group workouts, monitor waitlists, and take live attendance.
                    </p>
                    <div className="mt-4 space-y-2">
                      {classesList.slice(0, 2).map((cls) => (
                        <div key={cls.id} className="p-2.5 rounded-lg bg-charcoal-900 border border-charcoal-800 flex justify-between items-center text-xs">
                          <div className="truncate mr-2">
                            <p className="font-semibold text-white truncate">{cls.title}</p>
                            <p className="text-[11px] text-gray-400">
                              {cls.booked_count}/{cls.capacity} Booked {cls.waitlist_count > 0 ? `(${cls.waitlist_count} waitlisted)` : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRosterClass(cls);
                              setIsRosterModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-md bg-charcoal-800 hover:bg-orange-primary/20 text-orange-primary border border-orange-primary/40 font-bold text-[11px] whitespace-nowrap transition"
                          >
                            Roster
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateClassModalOpen(true)}
                      className="flex-1 py-2.5 rounded-lg bg-orange-primary hover:bg-orange-hover text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-orange-primary/20"
                    >
                      <Plus className="w-4 h-4" /> Schedule Class
                    </button>
                    {classesList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRosterClass(classesList[0]);
                          setIsRosterModalOpen(true);
                        }}
                        className="py-2.5 px-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-200 font-semibold text-xs transition border border-charcoal-700"
                        title="View roster for upcoming class"
                      >
                        All Rosters
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-orange-primary/10 border border-orange-primary/30 flex items-center justify-center text-orange-primary mb-4">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Equipment & Defects</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Report floor machine issues, check operational status, and inspect maintenance history.
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsEquipmentModalOpen(true)}
                    className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Wrench className="w-4 h-4 text-orange-primary" /> View & Report Defect
                  </button>
                </div>

              </div>

              {/* Dedicated Trainer Group Classes & Roster Oversight Panel (Rule 12) */}
              <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-primary" />
                      <h3 className="text-xl font-bold text-white">Group Classes & Roster Oversight</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Direct class scheduling, capacity limits, live waitlist queue audit, and front-desk attendance check-in.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadClasses()}
                      className="px-3 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${classesLoading ? 'animate-spin text-orange-primary' : ''}`} /> Refresh
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreateClassModalOpen(true)}
                      className="px-4 py-2 rounded-lg bg-orange-primary hover:bg-orange-hover text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-primary/20 transition active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Schedule New Class
                    </button>
                  </div>
                </div>

                {classesList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {classesList.map((cls) => {
                      const isFull = cls.booked_count >= cls.capacity;
                      const pct = Math.min(100, Math.round((cls.booked_count / cls.capacity) * 100));

                      return (
                        <div
                          key={cls.id}
                          className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between hover:border-charcoal-750 transition"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-mono text-orange-primary flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatEthiopianDateTime(cls.start_time)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  isFull
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-green-950 text-green-400 border border-green-800'
                                }`}
                              >
                                {isFull ? `Full (${cls.waitlist_count} waitlist)` : `${cls.booked_count} / ${cls.capacity} spots`}
                              </span>
                            </div>

                            <h4 className="font-bold text-white text-base">{cls.title}</h4>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {cls.description || 'Instructor-led workout.'}
                            </p>

                            <div className="mt-3 space-y-1 text-xs text-gray-300">
                              <div className="flex items-center gap-1.5 text-gray-400">
                                <MapPin className="w-3.5 h-3.5 text-gray-500" /> {cls.location}
                              </div>
                              <div className="text-gray-400">
                                Instructor: <span className="text-white font-medium">{cls.trainer_name || 'Gym Trainer'}</span>
                                {cls.trainer_specialization && (
                                  <span className="text-[11px] text-gray-500"> ({cls.trainer_specialization})</span>
                                )}
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex justify-between text-[11px] mb-1 font-medium">
                                <span className="text-gray-400">Capacity</span>
                                <span className={isFull ? 'text-amber-400 font-bold' : 'text-green-400 font-bold'}>
                                  {cls.booked_count} / {cls.capacity} spots
                                </span>
                              </div>
                              <div className="w-full bg-charcoal-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isFull ? 'bg-amber-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRosterClass(cls);
                                setIsRosterModalOpen(true);
                              }}
                              className="w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-orange-primary/20 text-orange-primary hover:text-white border border-orange-primary/40 font-bold text-xs flex items-center justify-center gap-2 transition"
                            >
                              <Users className="w-4 h-4" /> View Class Roster & Attendance
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No group classes scheduled yet. Click "Schedule New Class" to create one.
                  </div>
                )}
              </div>
              </div>
            )}

            {currentUser.role === 'admin' && activeTab === 'home' && (
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
                        Only Admin creates tiers, modifies pricing, and uploads plan imagery from local storage.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsTrainerWorkoutModalOpen(true)}
                        className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition"
                      >
                        <Dumbbell className="w-4 h-4 text-orange-primary" /> Workout Review Gate
                      </button>
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
                        onClick={() => setIsCreateClassModalOpen(true)}
                        className="px-3.5 py-2 rounded-lg bg-orange-primary hover:bg-orange-hover text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-primary/20 transition active:scale-95"
                        title="Schedule a new group fitness class with capacity limits"
                      >
                        <Calendar className="w-4 h-4" /> Schedule Class
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsTrainerProgressModalOpen(true)}
                        className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition"
                        title="Review all member transformation metrics and coach feedback"
                      >
                        <Scale className="w-4 h-4 text-orange-primary" /> Athlete Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEquipmentModalOpen(true)}
                        className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition"
                        title="Manage gym equipment inventory, defect reports, and maintenance logs"
                      >
                        <Wrench className="w-4 h-4 text-orange-primary" /> Equipment & Repairs
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAnalyticsModalOpen(true)}
                        className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition"
                        title="Financial breakdown, attendance heatmap, and Ethiopian Calendar CSV exports"
                      >
                        <TrendingUp className="w-4 h-4 text-orange-primary" /> Analytics & CSV Reports
                      </button>
                      <button
                        type="button"
                        onClick={openCreatePlanModal}
                        className="px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Plus className="w-4 h-4 text-orange-primary" /> Create New Plan
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsWalkinModalOpen(true)}
                        className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition"
                      >
                        <UserPlus className="w-4 h-4 text-orange-primary" /> Walk-In Member
                      </button>
                      <button
                        type="button"
                        onClick={handleRunManualExpiryCheck}
                        disabled={isRunningExpiryCheck}
                        className="px-3.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-200 font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                        title="Scan all memberships, auto-expire overdue, and dispatch 7d/1d reminder emails in Ethiopian Calendar"
                      >
                        <RefreshCw className={`w-4 h-4 text-orange-primary ${isRunningExpiryCheck ? 'animate-spin' : ''}`} /> Run Expiry Check
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

                {/* Admin Group Class Scheduling & Roster Oversight Engine (Rule 12) */}
                <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-orange-primary" />
                        <h3 className="text-xl font-bold text-white">Group Classes & Roster Oversight Engine</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Direct class scheduling, capacity limits, live waitlist queue audit, and front-desk attendance oversight.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => loadClasses()}
                        className="px-3 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${classesLoading ? 'animate-spin text-orange-primary' : ''}`} /> Refresh
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreateClassModalOpen(true)}
                        className="px-4 py-2 rounded-lg bg-orange-primary hover:bg-orange-hover text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-primary/20 transition active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Schedule New Class
                      </button>
                    </div>
                  </div>

                  {classesList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {classesList.map((cls) => {
                        const isFull = cls.booked_count >= cls.capacity;
                        const pct = Math.min(100, Math.round((cls.booked_count / cls.capacity) * 100));

                        return (
                          <div
                            key={cls.id}
                            className="p-5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between hover:border-charcoal-700 transition"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-mono text-orange-primary flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formatEthiopianDateTime(cls.start_time)}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    isFull
                                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                      : 'bg-green-950 text-green-400 border border-green-800'
                                  }`}
                                >
                                  {isFull ? `Full (${cls.waitlist_count} waitlist)` : `${cls.booked_count} / ${cls.capacity} spots`}
                                </span>
                              </div>

                              <h4 className="font-bold text-white text-base">{cls.title}</h4>
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {cls.description || 'Full class details.'}
                              </p>

                              <div className="mt-3 space-y-1 text-xs text-gray-300">
                                <div className="flex items-center gap-1.5 text-gray-400">
                                  <MapPin className="w-3.5 h-3.5 text-gray-500" /> {cls.location}
                                </div>
                                <div className="text-gray-400">
                                  Instructor: <span className="text-white font-medium">{cls.trainer_name || 'Gym Trainer'}</span>
                                  {cls.trainer_specialization && (
                                    <span className="text-[11px] text-gray-500"> ({cls.trainer_specialization})</span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="flex justify-between text-[11px] mb-1 font-medium">
                                  <span className="text-gray-400">Capacity</span>
                                  <span className={isFull ? 'text-amber-400 font-bold' : 'text-green-400 font-bold'}>
                                    {cls.booked_count} / {cls.capacity} spots
                                  </span>
                                </div>
                                <div className="w-full bg-charcoal-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      isFull ? 'bg-amber-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="mt-5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRosterClass(cls);
                                  setIsRosterModalOpen(true);
                                }}
                                className="w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-orange-primary/20 text-orange-primary hover:text-white border border-orange-primary/40 font-bold text-xs flex items-center justify-center gap-2 transition"
                              >
                                <Users className="w-4 h-4" /> View Class Roster & Attendance
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      No group classes scheduled yet. Click "Schedule New Class" to create one.
                    </div>
                  )}
                </div>

                {/* Other Admin Capabilities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-[#B4F82C]/10 border border-[#B4F82C]/30 flex items-center justify-center text-[#B4F82C] mb-4">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Financial & Attendance Reports</h3>
                      <p className="text-xs text-gray-400 mt-1">View revenue analytics, attendance throughput, and download official CSV exports.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsAnalyticsModalOpen(true)}
                      className="mt-6 w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 font-semibold text-xs text-white transition flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Download className="w-4 h-4 text-[#B4F82C]" /> Open Analytics & CSV Reports
                    </button>
                  </div>

                  <div className="p-6 rounded-xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-[#B4F82C]/10 border border-[#B4F82C]/30 flex items-center justify-center text-[#B4F82C] mb-4">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Equipment & Maintenance</h3>
                      <p className="text-xs text-gray-400 mt-1">Track machine inventory, review defect reports, and schedule maintenance.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsEquipmentModalOpen(true)}
                      className="mt-6 w-full py-2.5 rounded-lg bg-[#B4F82C] hover:bg-[#a3e524] text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-98 shadow-md shadow-[#B4F82C]/20"
                    >
                      <Wrench className="w-4 h-4" /> Manage Inventory & Maintenance
                    </button>
                  </div>
                </div>
              </div>
            )}
          
            {/* LOGGED-IN VIEW: CLASSES TAB */}
            {activeTab === 'classes' && (
              <div className="w-full space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <Calendar className="w-7 h-7 text-[#B4F82C]" />
                      Scheduled <span className="text-[#B4F82C]">Group Classes</span>
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-gray-400">
                      Live schedule with instructor assignments, capacity limits, and Ethiopian Calendar times.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadClasses()}
                      className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white font-semibold text-xs border border-charcoal-700 transition flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${classesLoading ? 'animate-spin text-[#B4F82C]' : ''}`} /> Refresh
                    </button>
                    {(currentUser.role === 'admin' || currentUser.role === 'trainer') && (
                      <button
                        type="button"
                        onClick={() => setIsCreateClassModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-[#B4F82C] hover:bg-[#a3e524] text-slate-950 font-bold text-xs shadow-lg shadow-[#B4F82C]/20 transition flex items-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Schedule New Class
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {classesList.length > 0 ? (
                    classesList.map((cls) => {
                      const isFull = cls.booked_count >= cls.capacity;
                      const pct = Math.min(100, Math.round((cls.booked_count / cls.capacity) * 100));
                      const isBookedByMe = myBookings.some((b) => b.class_id === cls.id && b.status === 'booked');
                      const isWaitlistedByMe = myBookings.some((b) => b.class_id === cls.id && b.status === 'waitlisted');

                      return (
                        <div
                          key={cls.id}
                          className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between hover:border-[#B4F82C]/50 transition group"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-3">
                              <span className="flex items-center gap-1 font-mono text-[#B4F82C]">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatEthiopianDateTime(cls.start_time)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  isFull
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-green-950 text-green-400 border border-green-800'
                                }`}
                              >
                                {isFull ? `Full (${cls.waitlist_count} Waitlist)` : `${cls.booked_count} / ${cls.capacity} Booked`}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-white group-hover:text-[#B4F82C] transition">
                              {cls.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {cls.description || 'Full coaching, mobility guidance, and conditioning.'}
                            </p>

                            <div className="mt-4 space-y-1.5 text-xs text-gray-300">
                              <p className="text-gray-400 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-500" /> {cls.location}
                              </p>
                              <p className="text-gray-400">
                                Instructor: <span className="text-white font-medium">{cls.trainer_name || 'Titan Coach'}</span>
                                {cls.trainer_specialization && (
                                  <span className="text-gray-500"> ({cls.trainer_specialization})</span>
                                )}
                              </p>
                            </div>

                            {/* Capacity bar */}
                            <div className="mt-4">
                              <div className="w-full bg-charcoal-900 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isFull ? 'bg-amber-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col gap-2">
                            {(currentUser.role === 'admin' || currentUser.role === 'trainer') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRosterClass(cls);
                                  setIsRosterModalOpen(true);
                                }}
                                className="w-full py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
                              >
                                <Users className="w-4 h-4 text-[#B4F82C]" /> View Class Roster & Attendance
                              </button>
                            )}

                            {currentUser.role === 'member' && (
                              isBookedByMe ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancelBooking(cls.id)}
                                  disabled={bookingLoadingId === cls.id}
                                  className="w-full py-2.5 rounded-xl bg-charcoal-800 hover:bg-rose-950/80 hover:text-rose-300 border border-charcoal-700 text-gray-300 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                                >
                                  {bookingLoadingId === cls.id ? 'Updating...' : 'Cancel Reservation'}
                                </button>
                              ) : isWaitlistedByMe ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancelBooking(cls.id)}
                                  disabled={bookingLoadingId === cls.id}
                                  className="w-full py-2.5 rounded-xl bg-amber-950/40 text-amber-300 border border-amber-800 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                                >
                                  Waitlisted (Click to Leave)
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleBookClass(cls)}
                                  disabled={bookingLoadingId === cls.id}
                                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg ${
                                    isFull
                                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                                      : 'bg-[#B4F82C] hover:bg-[#a3e524] text-slate-950 shadow-[#B4F82C]/20'
                                  }`}
                                >
                                  {bookingLoadingId === cls.id ? (
                                    'Processing...'
                                  ) : isFull ? (
                                    'Join Waitlist Queue'
                                  ) : (
                                    'Reserve Spot'
                                  )}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-center py-12 text-gray-400">
                      No group classes scheduled yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LOGGED-IN VIEW: PLANS TAB */}
            {activeTab === 'plans' && (
              <div className="w-full space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      <CreditCard className="w-7 h-7 text-[#B4F82C]" />
                      Membership <span className="text-[#B4F82C]">Plans & Billing</span>
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-gray-400">
                      Official gym tiers, pricing in Ethiopian Birr (ETB), and instant Chapa payment gateway.
                    </p>
                  </div>
                  {currentUser.role === 'admin' && (
                    <button
                      type="button"
                      onClick={openCreatePlanModal}
                      className="px-4 py-2.5 rounded-xl bg-[#B4F82C] hover:bg-[#a3e524] text-slate-950 font-bold text-xs shadow-lg shadow-[#B4F82C]/20 transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Create New Plan
                    </button>
                  )}
                </div>

                {/* If member: Show active plan badge at top */}
                {currentUser.role === 'member' && myMembership && (
                  <div className="p-5 rounded-2xl bg-[#0E1116] border border-[#B4F82C]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#B4F82C]/10 text-[#B4F82C] flex items-center justify-center">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-[#B4F82C] font-bold uppercase tracking-wider">Current Active Plan</span>
                        <h4 className="text-lg font-bold text-white">{myMembership.plan_name}</h4>
                        <p className="text-xs text-gray-400">
                          Expires: {formatEthiopianDate(myMembership.end_date)} E.C.
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                      Active
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(currentUser.role === 'admin' && adminPlans.length > 0 ? adminPlans : plans).map((p) => (
                    <div
                      key={p.id}
                      className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between hover:border-[#B4F82C]/50 transition group"
                    >
                      <div>
                        {p.imageUrl ? (
                          <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-charcoal-900 border border-charcoal-800">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = DEFAULT_PLAN_IMAGE;
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-36 rounded-xl mb-4 bg-charcoal-800/50 border border-dashed border-charcoal-700 flex flex-col items-center justify-center text-gray-500">
                            <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
                            <span className="text-[10px]">No image uploaded</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-[#B4F82C] transition">
                            {p.name}
                          </h3>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${p.isActive ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-charcoal-800 text-gray-400'}`}>
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-2">
                          {p.description || 'Full gym facility access, showers, lockers, and expert coaching.'}
                        </p>

                        <div className="mt-4">
                          <span className="text-3xl font-black text-[#B4F82C]">{p.price.toLocaleString()}</span>
                          <span className="text-xs text-gray-400"> ETB / {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        {currentUser.role === 'admin' ? (
                          <button
                            type="button"
                            onClick={() => openEditPlanModal(p)}
                            className="w-full py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#B4F82C]" /> Edit Plan & Image
                          </button>
                        ) : currentUser.role === 'member' ? (
                          <button
                            type="button"
                            onClick={() => handleInitiatePayment(p)}
                            className="w-full py-2.5 rounded-xl bg-[#B4F82C] hover:bg-[#a3e524] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#B4F82C]/20 transition"
                          >
                            <CreditCard className="w-4 h-4" /> {myMembership ? 'Switch to Plan' : 'Subscribe with Chapa'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
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
                  <p className="mt-4 text-gray-400">
                    Live schedule with automatic waitlist promotion and Ethiopian Calendar time.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {classesList.length > 0 ? (
                    classesList.map((cls) => {
                      const isFull = cls.booked_count >= cls.capacity;
                      const pct = Math.min(100, Math.round((cls.booked_count / cls.capacity) * 100));

                      return (
                        <div
                          key={cls.id}
                          className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between hover:border-orange-primary/50 transition group"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-3">
                              <span className="flex items-center gap-1 font-mono text-orange-primary">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatEthiopianDateTime(cls.start_time)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  isFull
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-green-950 text-green-400 border border-green-800'
                                }`}
                              >
                                {isFull ? `Full (${cls.waitlist_count} Waitlist)` : `${cls.booked_count} / ${cls.capacity} Booked`}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-white group-hover:text-orange-primary transition">
                              {cls.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {cls.description || 'Full coaching, mobility guidance, and conditioning.'}
                            </p>

                            <div className="mt-4 space-y-1.5 text-xs text-gray-300">
                              <p className="text-gray-400 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-500" /> {cls.location}
                              </p>
                              <p className="text-gray-400">
                                Instructor: <span className="text-white font-medium">{cls.trainer_name || 'Titan Coach'}</span>
                                {cls.trainer_specialization && (
                                  <span className="text-gray-500"> ({cls.trainer_specialization})</span>
                                )}
                              </p>
                            </div>

                            {/* Capacity bar */}
                            <div className="mt-4">
                              <div className="w-full bg-charcoal-900 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isFull ? 'bg-amber-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!currentUser) {
                                setAuthModalMode('login');
                                setErrorMessage('Please sign in or create an account to book fitness classes.');
                              } else {
                                handleBookClass(cls);
                              }
                            }}
                            className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                              isFull
                                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                                : 'bg-orange-primary hover:bg-orange-hover text-white shadow-orange-primary/20'
                            }`}
                          >
                            {isFull ? 'Join Waitlist' : 'Reserve Spot'}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-center py-12 text-gray-400">
                      Loading scheduled fitness classes...
                    </div>
                  )}
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
                  {authModalMode === 'set-password' ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : authModalMode === 'login' ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {authModalMode === 'set-password'
                      ? 'Set Your Password'
                      : authModalMode === 'forgot-password'
                      ? 'Reset Your Password'
                      : authModalMode === 'login'
                      ? 'Sign In to Your Account'
                      : 'Member Registration'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {authModalMode === 'set-password'
                      ? 'Create a secure password to access your member dashboard'
                      : authModalMode === 'forgot-password'
                      ? 'Enter your registered Gmail to receive a password reset link'
                      : authModalMode === 'login'
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
            ) : authModalMode === 'set-password' ? (
              /* VIEW: SET / RESET PASSWORD FORM */
              <div>
                <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      New Password (minimum 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
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
                    {isSubmitting ? 'Saving Password...' : 'Save Password & Access Account'}
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-charcoal-800 text-center text-xs text-gray-400">
                  Already have a password?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setAuthModalMode('login'); setErrorMessage(null); }}
                    className="text-orange-primary hover:underline font-semibold"
                  >
                    Sign In
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-gray-300">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('forgot-password');
                          setForgotEmail(loginEmail);
                          setForgotSuccess(false);
                          setErrorMessage(null);
                        }}
                        className="text-xs text-[#B4F82C] hover:underline font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
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
                    className="text-[#B4F82C] hover:underline font-semibold"
                  >
                    Create Member Account
                  </button>
                </div>
              </div>
            ) : authModalMode === 'forgot-password' ? (
              /* VIEW 4: FORGOT PASSWORD FORM */
              <div className="space-y-4">
                {forgotSuccess ? (
                  <div className="p-4 rounded-xl bg-green-950/60 border border-green-800 text-green-300 text-xs space-y-3">
                    <p>
                      Password reset instructions have been dispatched to <strong>{forgotEmail}</strong>. Please check your inbox or spam folder.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode('login');
                        setForgotSuccess(false);
                        setErrorMessage(null);
                      }}
                      className="w-full py-2.5 rounded-lg bg-[#B4F82C] hover:bg-[#a3e524] text-slate-950 font-bold text-xs"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Registered Gmail Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          required
                          placeholder="yourname@gmail.com"
                          className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#B4F82C]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isForgotSubmitting}
                      className="w-full py-2.5 rounded-lg bg-[#B4F82C] hover:bg-[#a3e524] text-slate-950 font-bold text-sm shadow-lg shadow-[#B4F82C]/20 transition disabled:opacity-50"
                    >
                      {isForgotSubmitting ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                    </button>

                    <div className="mt-4 pt-4 border-t border-charcoal-800 text-center text-xs text-gray-400">
                      Remember your password?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMode('login');
                          setErrorMessage(null);
                        }}
                        className="text-[#B4F82C] hover:underline font-semibold"
                      >
                        Sign In
                      </button>
                    </div>
                  </form>
                )}
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">Gmail Address (@gmail.com) *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="yourname@gmail.com"
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">Ethiopian Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+251 9... or 09... (Ethio / Safaricom)"
                      required
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
                  Admin defines tiers, pricing (ETB), and plan photo.
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

                  {checkoutModalData.checkoutUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        if (checkoutModalData.checkoutUrl) {
                          window.location.href = checkoutModalData.checkoutUrl;
                        }
                      }}
                      className="mb-3 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 transition active:scale-[0.99]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Proceed to Official Chapa Gateway ({checkoutModalData.amount.toLocaleString()} ETB)</span>
                    </button>
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
                    <span className="text-gray-400">Timestamp (E.C.)</span>
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
                  Reception & Admin record Cash & Bank Transfer with audit logs.
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

      {/* MEMBER WORKOUT ROUTINE & AI COACH MODAL (Phase 6: Rules 10, 11) */}
      {currentUser && (
        <MemberWorkoutModal
          isOpen={isMemberWorkoutModalOpen}
          onClose={() => setIsMemberWorkoutModalOpen(false)}
          memberName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}
        />
      )}

      {/* WALKIN REGISTRATION MODAL (Phase 6: Rule 10) */}
      {currentUser && (currentUser.role === 'reception' || currentUser.role === 'admin') && (
        <WalkinRegistrationModal
          isOpen={isWalkinModalOpen}
          onClose={() => setIsWalkinModalOpen(false)}
          staffName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}
          plans={adminPlans.length > 0 ? adminPlans : plans}
          onSuccess={() => {
            loadPlans();
            loadAdminPlans();
          }}
        />
      )}

      {/* TRAINER & ADMIN WORKOUT REVIEW GATE & BUILDER MODAL (Phase 6: Rule 11) */}
      {currentUser && (currentUser.role === 'trainer' || currentUser.role === 'admin') && (
        <TrainerWorkoutModal
          isOpen={isTrainerWorkoutModalOpen}
          onClose={() => setIsTrainerWorkoutModalOpen(false)}
          trainerName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}
        />
      )}

            {/* CLASS ROSTER & ATTENDANCE MODAL (Rule 12) */}
      <ClassRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        fitnessClass={selectedRosterClass}
        classList={classesList}
        onSelectClass={setSelectedRosterClass}
        onAttendanceUpdated={loadClasses}
      />

      {/* CREATE CLASS MODAL (Rule 12) */}
      <CreateClassModal
        isOpen={isCreateClassModalOpen}
        onClose={() => setIsCreateClassModalOpen(false)}
        currentUserId={currentUser?.id}
        onClassCreated={(newCls) => {
          loadClasses();
          setSuccessMessage(`Class "${newCls.title}" scheduled successfully!`);
        }}
      />

            {/* MEMBER PROGRESS & BODY TRANSFORMATION MODAL */}
      {currentUser && (
        <MemberProgressModal
          isOpen={isMemberProgressModalOpen}
          onClose={() => setIsMemberProgressModalOpen(false)}
          memberName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}
        />
      )}

      {/* TRAINER & ADMIN ATHLETE PROGRESS REVIEW MODAL */}
      {currentUser && (currentUser.role === 'trainer' || currentUser.role === 'admin') && (
        <TrainerProgressModal
          isOpen={isTrainerProgressModalOpen}
          onClose={() => setIsTrainerProgressModalOpen(false)}
          trainerName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}
        />
      )}

      {/* EQUIPMENT INVENTORY & MAINTENANCE MODAL */}
      {currentUser && (
        <EquipmentManagementModal
          isOpen={isEquipmentModalOpen}
          onClose={() => setIsEquipmentModalOpen(false)}
          userRole={currentUser.role as any}
          userName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}
        />
      )}

            {/* TITAN AI ASSISTANT MODAL (Workout Coach, Biomechanics, Progress) */}

      {currentUser && (

        <AIAssistantModal

          isOpen={isAiModalOpen}

          onClose={() => setIsAiModalOpen(false)}

          userName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}

          userRole={currentUser.role}

        />

      )}



      {/* TITAN ANALYTICS & CSV REPORTING MODAL */}

      <AnalyticsModal

        isOpen={isAnalyticsModalOpen}

        onClose={() => setIsAnalyticsModalOpen(false)}

        userRole={currentUser?.role || 'guest'}

      />



      {/* Footer */}
      <footer className="border-t border-charcoal-800 py-6 px-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Titan Fitness Systems. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
