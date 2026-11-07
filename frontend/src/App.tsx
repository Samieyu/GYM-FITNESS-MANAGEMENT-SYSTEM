import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  QrCode, 
  Sparkles, 
  Check, 
  X, 
  UserCheck, 
  Calendar,
  Server,
  LogOut,
  UserPlus,
  DollarSign,
  AlertCircle,
  Plus,
  Edit2,
  Upload,
  Image as ImageIcon,
  Layers,
  CreditCard,
  RefreshCw,
  Users,
  MapPin,
  Scale,
  Wrench,
  BarChart3,
  TrendingUp,
  Download,
  Shield,
} from 'lucide-react';
import { 
  User, 
  getStoredUser, 
  setStoredAuth,
  loginApi, 
  registerMemberApi, 
  verifyEmailApi, 
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
import { StaffManagementModal } from './components/StaffManagementModal';
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
import { PublicHeader, MemberBottomBar, StaffNavigation } from './components/navigation';
import { ThemeToggle } from './components/ui/ThemeToggle';
import {
  PublicHomePage,
  PublicClassesSchedule,
  AuthModal,
  ChapaCheckoutModal,
} from './components/public';


import { triggerManualExpiryCheckApi } from './api/reception';
import { formatEthiopianDate, formatEthiopianDateTime } from './utils/ethiopianCalendar';

const DEFAULT_PLAN_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'plans' | 'classes'>('home');
  const [authModalMode, setAuthModalMode] = useState<
    'login' | 'register' | 'set-password' | 'forgot-password' | null
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
  const [regBranch, setRegBranch] = useState('Bole Branch');
  const [regPhotoUrl, setRegPhotoUrl] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  // const [registeredEmail, setRegisteredEmail] = useState('');

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
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
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
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

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

    // Check for ?tx_ref= or ?trx_ref= in URL (Chapa hosted gateway return) or cached pending tx
    const txRefParam =
      params.get('tx_ref') ||
      params.get('trx_ref') ||
      localStorage.getItem('sweatbox_pending_tx_ref');
    if (txRefParam) {
      localStorage.removeItem('sweatbox_pending_tx_ref');
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
        setActiveTab('home');
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
      if (mem && mem.status === 'active') {
        setActiveTab('home');
      }
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

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const handleInitiatePayment = async (plan: Plan, overrideUser?: User) => {
    const userToUse = overrideUser || currentUser || getStoredUser();
    if (!userToUse) {
      setAuthModalMode('login');
      return;
    }
    if (userToUse.role !== 'member') {
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
      if (res.txRef) {
        localStorage.setItem('sweatbox_pending_tx_ref', res.txRef);
      }
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setCheckoutModalData(res);
      setPaymentMethodTab('telebirr');
      setTelebirrPhone(userToUse.phone || '+251 9');
      setCbePhone(userToUse.phone || '+251 9');
      setCardHolder(`${userToUse.firstName} ${userToUse.lastName}`.trim());
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
      setAuthModalMode(null);
      setErrorMessage(null);
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
        `Daily expiry check completed: ${res.expiredMemberships ?? 0} memberships expired, ${res.reminders7dSent ?? 0} 7-day reminders sent, ${res.reminders1dSent ?? 0} 1-day reminders sent.`
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
      const branchGoal = regBranch ? `${regGoals ? regGoals + ' | ' : ''}Home Branch: ${regBranch}` : regGoals;
      const res = await registerMemberApi({
        firstName: regFirstName,
        lastName: regLastName,
        email: cleanEmail,
        password: regPassword,
        phone: cleanPhone,
        fitnessGoals: branchGoal,
        photoUrl: regPhotoUrl || undefined,
      });

      // Immediately log in new user without any email verification screen
      const token = res.data?.accessToken;
      const rToken = res.data?.refreshToken;
      const user = res.data?.user;

      if (token && user) {
        setStoredAuth({ accessToken: token, refreshToken: rToken || '' }, user);
        setCurrentUser(user);
        setAuthModalMode(null);
        setActiveTab('home');
        setRegFirstName('');
        setRegLastName('');
        setRegEmail('');
        setRegPassword('');
        setRegPhone('');
        setRegPhotoUrl(null);
        await loadMemberMembershipAndPayments();

        // Seamlessly open checkout for selected tier without breaking payment logic
        if (selectedPlanId) {
          const chosenPlan = plans.find((p) => p.id === selectedPlanId);
          if (chosenPlan) {
            handleInitiatePayment(chosenPlan, user);
          }
        }
      } else {
        const loginRes = await loginApi(cleanEmail, regPassword);
        if (loginRes.data?.accessToken && loginRes.data?.user) {
          setStoredAuth(
            { accessToken: loginRes.data.accessToken, refreshToken: loginRes.data.refreshToken },
            loginRes.data.user
          );
          setCurrentUser(loginRes.data.user);
          setAuthModalMode(null);
          setActiveTab('home');
          setRegFirstName('');
          setRegLastName('');
          setRegEmail('');
          setRegPassword('');
          setRegPhone('');
          setRegPhotoUrl(null);
          await loadMemberMembershipAndPayments();

          // Seamlessly open checkout for selected tier without breaking payment logic
          if (selectedPlanId) {
            const chosenPlan = plans.find((p) => p.id === selectedPlanId);
            if (chosenPlan) {
              handleInitiatePayment(chosenPlan, loginRes.data.user);
            }
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Unused legacy verification handler */
  // const handleResendVerification = async () => {};

  const handleLogout = async () => {
    await logoutApi();
    setCurrentUser(null);
    setActiveTab('home');
    setSuccessMessage('Logged out successfully.');
  };

  return (
    <div className="min-h-screen bg-background text-text flex flex-col justify-between transition-colors duration-200">
      {/* Sleek Vertical Navigation Rail (from Design Screenshot) */}
      {currentUser && (
        <>
          <StaffNavigation
            currentUser={currentUser}
            isPaidMember={Boolean(myMembership && myMembership.status === 'active')}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenWorkout={() => {
              if (currentUser.role === 'member') {
                if (myMembership && myMembership.status === 'active') {
                  setIsMemberWorkoutModalOpen(true);
                }
              } else {
                setIsTrainerWorkoutModalOpen(true);
              }
            }}
            onOpenProgress={() => {
              if (currentUser.role === 'member') {
                if (myMembership && myMembership.status === 'active') {
                  setIsMemberProgressModalOpen(true);
                }
              } else {
                setIsTrainerProgressModalOpen(true);
              }
            }}
            onOpenAiCoach={() => {
              if (currentUser.role !== 'member' || (myMembership && myMembership.status === 'active')) {
                setIsAiModalOpen(true);
              }
            }}
            onOpenQrPass={() => {
              if (currentUser.role === 'member' && myMembership && myMembership.status === 'active') {
                setIsMemberQrModalOpen(true);
              }
            }}
            onOpenScanner={() => setIsReceptionScannerOpen(true)}
            onOpenWalkin={() => setIsWalkinModalOpen(true)}
            onOpenEquipment={() => setIsEquipmentModalOpen(true)}
            onOpenAnalytics={() => setIsAnalyticsModalOpen(true)}
            onOpenStaff={() => setIsStaffModalOpen(true)}
            onLogout={() => setIsLogoutConfirmOpen(true)}
          />

          {currentUser.role === 'member' && (
            <MemberBottomBar
              activeTab={activeTab}
              isPaidMember={Boolean(myMembership && myMembership.status === 'active')}
              userName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}
              onSelectTab={setActiveTab}
              onOpenQrPass={() => {
                if (myMembership && myMembership.status === 'active') {
                  setIsMemberQrModalOpen(true);
                }
              }}
              onOpenProgress={() => {
                if (myMembership && myMembership.status === 'active') {
                  setIsMemberProgressModalOpen(true);
                }
              }}
              onOpenAiCoach={() => {
                if (myMembership && myMembership.status === 'active') {
                  setIsAiModalOpen(true);
                }
              }}
              onLogout={() => setIsLogoutConfirmOpen(true)}
            />
          )}
        </>
      )}
      {/* Top Header Shell */}
      {!currentUser ? (
        <PublicHeader
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenLogin={() => { setAuthModalMode('login'); setErrorMessage(null); }}
          onOpenRegister={() => { setAuthModalMode('register'); setErrorMessage(null); }}
          onScrollToTrainers={() => {
            const el = document.getElementById('trainers-section') || document.querySelector('[data-section="trainers"]');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      ) : (
        <header className="border-b border-border bg-surface/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between lg:pl-28 transition-all">
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab(currentUser.role === 'member' && !(myMembership && myMembership.status === 'active') ? 'plans' : 'home')}
          >
            <div className="w-10 h-10 bg-[#FF6B00] rounded-xl text-[#0E1116] shadow-sm flex items-center justify-center font-black">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight text-content-primary flex items-center gap-1.5 leading-none">
                SWEATBOX <span className="text-[#FF6B00]">FITNESS</span>
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-wider text-content-secondary mt-0.5">
                {currentUser.role.toUpperCase()} PORTAL
              </p>
            </div>
          </div>

          {/* Navigation & User Session Bar */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border-subtle text-xs text-content-secondary">
              <Server className={`w-3.5 h-3.5 ${backendStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>System: {backendStatus === 'connected' ? 'Online' : 'Offline'}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {currentUser.role !== 'reception' && (currentUser.role !== 'member' || Boolean(myMembership && myMembership.status === 'active')) && (
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF6B00]/15 hover:bg-[#FF6B00]/25 border border-[#FF6B00]/30 text-[#FF6B00] flex items-center gap-1.5 transition active:scale-95"
                  title={
                    currentUser.role === 'admin'
                      ? 'Management AI Consultant'
                      : currentUser.role === 'trainer'
                      ? 'Trainer Coaching Co-Pilot'
                      : 'SWEATBOX AI Fitness Coach'
                  }
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
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
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-elevated hover:bg-surface border border-border-subtle text-content-primary flex items-center gap-1.5 transition active:scale-95"
                  title="Financial overview, attendance throughput & CSV exports"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span className="hidden md:inline">Analytics & Reports</span>
                </button>
              )}

              <div className="flex items-center gap-2.5 hidden sm:flex">
                {currentUser.photoUrl ? (
                  <img
                    src={currentUser.photoUrl}
                    alt={`${currentUser.firstName} ${currentUser.lastName}`}
                    className="w-9 h-9 rounded-full object-cover border border-[#FF6B00] shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 font-bold text-xs flex items-center justify-center shrink-0">
                    {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                  </div>
                )}
                <div className="text-right">
                  <p className="text-xs font-semibold text-content-primary">{currentUser.firstName} {currentUser.lastName}</p>
                  <span className="inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30">
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-surface-elevated hover:bg-rose-500/10 hover:text-rose-500 border border-border text-text-muted flex items-center gap-1.5 transition min-h-[44px]"
              >
                <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Global Floating Toast Alert Stack */}
      {!authModalMode && (successMessage || errorMessage) && (
        <div 
          aria-live="polite"
          aria-atomic="true"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 pointer-events-none flex flex-col gap-2.5 animate-slideUp"
        >
          {successMessage && (
            <div className="p-4 rounded-2xl bg-surface/95 backdrop-blur-md border border-emerald-500/30 text-text shadow-2xl flex items-start gap-3 pointer-events-auto transition-all">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div className="flex-1 pr-1">
                <p className="text-xs font-bold text-text">Success</p>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{successMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-elevated transition"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-surface/95 backdrop-blur-md border border-rose-500/30 text-text shadow-2xl flex items-start gap-3 pointer-events-auto transition-all">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1 pr-1">
                <p className="text-xs font-bold text-rose-500">Notice</p>
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-elevated transition"
                aria-label="Close alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Container */}
      <main className={currentUser ? "mx-auto px-4 sm:px-6 py-8 pb-24 lg:pb-12 flex-1 w-full flex flex-col justify-center max-w-7xl lg:pl-24" : "w-full flex-1 flex flex-col p-0 m-0"}>


        {/* VIEW A: AUTHENTICATED ROLE DASHBOARD */}
        {currentUser ? (
          <div className="w-full space-y-8 animate-fadeIn">
            {/* Role Header Banner (Staff Only; Members have dedicated Athlete Command Header) */}
            {currentUser.role !== 'member' && (
              <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="inline-block text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-2">
                    Role: {currentUser.role.toUpperCase()}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-text">
                    Welcome, {currentUser.firstName} {currentUser.lastName}
                  </h2>
                  <p className="text-xs sm:text-sm text-text-muted mt-1">
                    Active account: {currentUser.email} • Verified Account
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">
                    <UserCheck className="w-4 h-4" /> Account Verified
                  </span>
                </div>
              </div>
            )}

            {/* UNPAID MEMBER WORKSPACE: ONLY MEMBERSHIP PLANS & PRICING SCREEN */}
            {currentUser.role === 'member' && (!myMembership || myMembership.status !== 'active') ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-border text-center max-w-4xl mx-auto space-y-8 shadow-card animate-fadeIn transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mx-auto shadow-sm">
                  <CreditCard className="w-8 h-8" />
                </div>

                <div className="max-w-xl mx-auto space-y-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                    Step 2: Choose Membership Plan
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-text tracking-tight">
                    Activate Your Membership, {currentUser.firstName}!
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Your member account is verified. To access the gym floor, receive your 60-second rotating QR entrance pass, book group classes, and receive custom workout plans, please select a plan below.
                  </p>
                </div>

                {/* Steps tracker */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left py-2">
                  <div className="p-3.5 rounded-xl bg-background border border-emerald-500/30 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-xs">✓</div>
                    <div>
                      <p className="text-xs font-bold text-text">1. Verified Account</p>
                      <p className="text-[10px] text-text-muted truncate max-w-[140px]">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/40 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">2</div>
                    <div>
                      <p className="text-xs font-bold text-primary">2. Select Plan</p>
                      <p className="text-[10px] text-text-muted">Choose duration & pay</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-3 opacity-60">
                    <div className="w-7 h-7 rounded-full bg-surface border border-border text-text-muted font-bold flex items-center justify-center text-xs">3</div>
                    <div>
                      <p className="text-xs font-bold text-text-muted">3. Gym Access</p>
                      <p className="text-[10px] text-text-muted">Dynamic QR unlocked</p>
                    </div>
                  </div>
                </div>

                {/* Available Membership Plans Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  {plans.map((p) => (
                    <div key={p.id} className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-bold text-text">{p.name}</h4>
                        <p className="text-xs text-text-muted mt-1 line-clamp-2">{p.description || 'Full gym facility access & trainer guidance.'}</p>
                        <div className="mt-4">
                          <span className="text-2xl font-black text-primary">{p.price.toLocaleString()}</span>
                          <span className="text-xs text-text-muted"> ETB / {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInitiatePayment(p)}
                        className="mt-6 w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <CreditCard className="w-4 h-4" /> Subscribe with Chapa
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-text-muted">
                  <span>Prefer to pay in person? Visit the front desk to pay with Cash or Telebirr.</span>
                  <button
                    type="button"
                    onClick={loadMemberMembershipAndPayments}
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Payment Status
                  </button>
                </div>
              </div>
            ) : (
              <>

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
              <div className="space-y-6">
                {/* RECEPTION OPERATIONAL COMMAND HEADER */}
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          <Shield className="w-3.5 h-3.5" />
                          Front Desk Terminal • የመስተንግዶ ማዕከል
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface-elevated text-text-muted border border-border">
                          {formatEthiopianDate(new Date())}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Entrance Turnstiles Online
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
                        Concierge Operations & Access Control
                      </h2>
                      <p className="text-sm text-text-muted mt-1 max-w-2xl">
                        Verify dynamic member QR passes with anti-passback protection, onboard walk-in athletes, and record in-person cash & bank transfer subscriptions.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsReceptionScannerOpen(true)}
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 transition flex items-center justify-center gap-2 active:scale-95"
                      >
                        <QrCode className="w-4 h-4" />
                        Launch Scanner
                      </button>
                    </div>
                  </div>

                  {/* QUICK STATS RAIL */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-border">
                    <div className="bg-surface-elevated/60 border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Pass Verification</div>
                        <div className="text-sm font-bold text-text">60s Dynamic Pass</div>
                      </div>
                    </div>

                    <div className="bg-surface-elevated/60 border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Anti-Passback Rule</div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Strict 5-Min Cooldown</div>
                      </div>
                    </div>

                    <div className="bg-surface-elevated/60 border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Payment Channels</div>
                        <div className="text-sm font-bold text-text">Cash, CBE & Telebirr</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3 OPERATIONAL WORKSPACE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Scanner */}
                  <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-primary/50 transition group">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                          <QrCode className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Optical & Token
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">
                        Live Entrance Scanner
                      </h3>
                      <p className="text-xs text-text-muted mt-2 leading-relaxed">
                        High-speed optical camera scan for rotating 60s member passes. Verifies active tier, anti-passback cooldown, and logs attendance immediately.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsReceptionScannerOpen(true)}
                      className="mt-6 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <QrCode className="w-4 h-4" /> Open Scanner Terminal
                    </button>
                  </div>

                  {/* Card 2: Walk-In Registration */}
                  <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-border-strong transition group">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border text-text flex items-center justify-center group-hover:scale-105 transition-transform">
                          <UserPlus className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                          2-Step Wizard
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">
                        Walk-in Registration
                      </h3>
                      <p className="text-xs text-text-muted mt-2 leading-relaxed">
                        Fast counter onboarding: enter phone (+251) and Gmail, select membership duration, collect cash/transfer, and send password invitation.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsWalkinModalOpen(true)}
                      className="mt-6 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-surface border border-border font-bold text-xs text-text transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <UserPlus className="w-4 h-4 text-primary" /> Register Walk-in Member
                    </button>
                  </div>

                  {/* Card 3: Offline Payment */}
                  <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-border-strong transition group">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border text-text flex items-center justify-center group-hover:scale-105 transition-transform">
                          <DollarSign className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-surface-elevated text-text-muted border border-border">
                          Audited Receipts
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">
                        Record Offline Payment
                      </h3>
                      <p className="text-xs text-text-muted mt-2 leading-relaxed">
                        Record Cash or Bank Transfer transactions with member ID matching, automatic plan pricing, reference slip logging, and immediate activation.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => openManualPaymentModal()}
                      className="mt-6 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-surface border border-border font-bold text-xs text-text transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <DollarSign className="w-4 h-4 text-emerald-500" /> Record Cash / Transfer
                    </button>
                  </div>
                </div>

                {/* PROTOCOL GUIDANCE ACCORDION / BOX */}
                <div className="bg-surface-elevated/40 border border-border rounded-2xl p-5 sm:p-6 text-xs text-text-muted space-y-3">
                  <div className="flex items-center gap-2 text-text font-bold text-sm">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Front Desk Protocol & Shift Security Guide</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <div className="font-semibold text-text">1. Anti-Passback Enforcement</div>
                      <p className="text-[11px] leading-relaxed">
                        Members cannot share passes. Consecutive scans within 5 minutes trigger a yellow cooldown warning. Use Reception Override only if authorized.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-text">2. Cash Handling & Reconciliation</div>
                      <p className="text-[11px] leading-relaxed">
                        Issue a physical gym receipt slip for all cash transactions and enter the slip number in the Reference Note field for end-of-shift reconciliation.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-text">3. Expired Membership Handling</div>
                      <p className="text-[11px] leading-relaxed">
                        If the scanner displays Red (Access Denied / Expired), directly tap "Record Payment" to renew the member’s tier on the spot.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentUser.role === 'trainer' && activeTab === 'home' && (
              <div className="space-y-6">
                {/* TRAINER COMMAND & COACHING ROSTER HEADER (TRN-PAGE-01) */}
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          <Dumbbell className="w-3.5 h-3.5" />
                          Certified Trainer Hub • የሰውነት ማጎልበቻ አሰልጣኝ
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface-elevated text-text-muted border border-border">
                          {formatEthiopianDate(new Date())}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Floor Coaching Session Active
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
                        Trainer Command & Athlete Coaching
                      </h2>
                      <p className="text-sm text-text-muted mt-1 max-w-2xl">
                        Monitor assigned athlete body transformation metrics, approve AI-generated workout routines, schedule group classes, and manage live session rosters.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsTrainerWorkoutModalOpen(true)}
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 transition flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" />
                        Review Routines
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreateClassModalOpen(true)}
                        className="min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text font-bold text-xs transition flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Plus className="w-4 h-4 text-primary" />
                        Schedule Class
                      </button>
                    </div>
                  </div>

                  {/* QUICK STATS RAIL */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-border">
                    <div className="bg-surface-elevated/60 border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Assigned Athletes</div>
                        <div className="text-sm font-bold text-text">Active Client Roster</div>
                      </div>
                    </div>

                    <div className="bg-surface-elevated/60 border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Routine Approval Gate</div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Rule 11 Enforced</div>
                      </div>
                    </div>

                    <div className="bg-surface-elevated/60 border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Scheduled Classes</div>
                        <div className="text-sm font-bold text-text">{classesList.length} Sessions on Calendar</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 OPERATIONAL WORKSPACE CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Assigned Athletes & Logs */}
                  <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-primary/50 transition group">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Scale className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                        Athlete Progress & Logs
                      </h3>
                      <p className="text-xs text-text-muted mt-2 leading-relaxed">
                        Review athlete weigh-in deltas, circumference measurements, and dispatch feedback with email notifications.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsTrainerProgressModalOpen(true)}
                      className="mt-6 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Scale className="w-4 h-4" /> Review Athletes
                    </button>
                  </div>

                  {/* Card 2: Workout Routine Builder */}
                  <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-border-strong transition group">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border text-text flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Dumbbell className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                        Workout Plan Builder
                      </h3>
                      <p className="text-xs text-text-muted mt-2 leading-relaxed">
                        Inspect AI draft routines in the review queue and publish custom multi-day resistance splits for athletes.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsTrainerWorkoutModalOpen(true)}
                      className="mt-6 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-surface border border-border font-bold text-xs text-text transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-primary" /> Review Queue & Builder
                    </button>
                  </div>

                  {/* Card 3: Group Classes & Scheduling */}
                  <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-border-strong transition group">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border text-text flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Calendar className="w-6 h-6 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                        Group Classes
                      </h3>
                      <p className="text-xs text-text-muted mt-2 leading-relaxed">
                        Schedule studio fitness sessions, configure capacities, and take live attendance with auto-promoted waitlists.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsCreateClassModalOpen(true)}
                      className="mt-6 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-surface border border-border font-bold text-xs text-text transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-blue-500" /> Schedule Class
                    </button>
                  </div>

                  {/* Card 4: Equipment & Defects */}
                  <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-border-strong transition group">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border text-text flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <Wrench className="w-6 h-6 text-amber-500" />
                      </div>
                      <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                        Floor Equipment
                      </h3>
                      <p className="text-xs text-text-muted mt-2 leading-relaxed">
                        Report defective machines or broken resistance equipment on the floor to notify gym technicians and management.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsEquipmentModalOpen(true)}
                      className="mt-6 w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-surface border border-border font-bold text-xs text-text transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Wrench className="w-4 h-4 text-amber-500" /> View & Report Defect
                    </button>
                  </div>
                </div>

                {/* DEDICATED TRAINER GROUP CLASSES & ROSTER OVERSIGHT PANEL (TRN-PAGE-05) */}
                <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-border space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold text-text">Group Classes & Roster Oversight</h3>
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        Direct class scheduling, capacity limits, live waitlist queue audit, and front-desk attendance check-in.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => loadClasses()}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text text-xs font-semibold flex items-center gap-2 transition"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${classesLoading ? 'animate-spin text-primary' : ''}`} />
                        <span>Refresh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreateClassModalOpen(true)}
                        className="min-h-[40px] px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/20 transition active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Schedule New Class</span>
                      </button>
                    </div>
                  </div>

                  {classesList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {classesList.map((cls) => {
                        const isFull = cls.booked_count >= cls.capacity;
                        const pct = Math.min(100, Math.round((cls.booked_count / cls.capacity) * 100));

                        return (
                          <div
                            key={cls.id}
                            className="p-5 rounded-2xl bg-surface-elevated/60 border border-border flex flex-col justify-between hover:border-border-strong transition group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-mono text-primary flex items-center gap-1 font-bold">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formatEthiopianDateTime(cls.start_time)}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isFull
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  }`}
                                >
                                  {isFull ? `Full (${cls.waitlist_count} waitlist)` : `${cls.booked_count} / ${cls.capacity} spots`}
                                </span>
                              </div>

                              <h4 className="font-bold text-text text-base group-hover:text-primary transition-colors">
                                {cls.title}
                              </h4>
                              <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                                {cls.description || 'Instructor-led session.'}
                              </p>

                              <div className="mt-3.5 space-y-1.5 text-xs text-text-muted">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-text-muted" /> {cls.location}
                                </div>
                                <div>
                                  Instructor: <span className="text-text font-semibold">{cls.trainer_name || 'Gym Trainer'}</span>
                                  {cls.trainer_specialization && (
                                    <span className="text-[11px] text-text-muted"> ({cls.trainer_specialization})</span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-border/80">
                                <div className="flex justify-between text-[11px] mb-1.5 font-medium">
                                  <span className="text-text-muted">Capacity</span>
                                  <span className={isFull ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                                    {cls.booked_count} / {cls.capacity} booked
                                  </span>
                                </div>
                                <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isFull ? 'bg-amber-500' : 'bg-primary'
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
                                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-elevated text-text border border-border hover:border-primary/50 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
                              >
                                <Users className="w-4 h-4 text-primary" /> View Class Roster & Attendance
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-text-muted text-xs bg-surface-elevated/40 rounded-2xl border border-border p-6">
                      <Calendar className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-text">No group classes scheduled yet</p>
                      <p className="mt-1 text-[11px]">Click "Schedule New Class" to create your first session.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentUser.role === 'admin' && activeTab === 'home' && (
              <div className="space-y-6">
                {/* Admin Plans & Pricing Management Panel */}
                <div className="p-5 sm:p-7 rounded-3xl bg-surface border border-border shadow-sm">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/15 text-primary border border-primary/25">
                          <Layers className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-text tracking-tight">Plans & Pricing Engine</h3>
                      </div>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Create membership tiers, adjust Ethiopian Birr pricing, and upload plan imagery from local storage.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsTrainerWorkoutModalOpen(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border text-text font-bold text-xs flex items-center gap-1.5 transition min-h-[44px]"
                      >
                        <Dumbbell className="w-4 h-4 text-primary" /> Workout Review Gate
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsReceptionScannerOpen(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border text-text font-bold text-xs flex items-center gap-1.5 transition min-h-[44px]"
                      >
                        <QrCode className="w-4 h-4 text-primary" /> Front Desk Scanner
                      </button>
                      <button
                        type="button"
                        onClick={() => openManualPaymentModal()}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border text-text font-bold text-xs flex items-center gap-1.5 transition min-h-[44px]"
                      >
                        <DollarSign className="w-4 h-4 text-primary" /> Record Offline Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreateClassModalOpen(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 transition active:scale-95 min-h-[44px]"
                        title="Schedule a new group fitness class with capacity limits"
                      >
                        <Calendar className="w-4 h-4" /> Schedule Class
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsTrainerProgressModalOpen(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border text-text font-bold text-xs flex items-center gap-1.5 transition min-h-[44px]"
                        title="Review all member transformation metrics and coach feedback"
                      >
                        <Scale className="w-4 h-4 text-primary" /> Athlete Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEquipmentModalOpen(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border text-text font-bold text-xs flex items-center gap-1.5 transition min-h-[44px]"
                        title="Manage gym equipment inventory, defect reports, and maintenance logs"
                      >
                        <Wrench className="w-4 h-4 text-primary" /> Equipment & Repairs
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAnalyticsModalOpen(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border text-text font-bold text-xs flex items-center gap-1.5 transition min-h-[44px]"
                        title="Financial breakdown, attendance heatmap, and Ethiopian Calendar CSV exports"
                      >
                        <TrendingUp className="w-4 h-4 text-primary" /> Analytics & CSV Reports
                      </button>
                      <button
                        type="button"
                        onClick={openCreatePlanModal}
                        className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 transition active:scale-95 min-h-[44px]"
                      >
                        <Plus className="w-4 h-4" /> Create New Plan
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsWalkinModalOpen(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border text-text font-bold text-xs flex items-center gap-1.5 transition min-h-[44px]"
                      >
                        <UserPlus className="w-4 h-4 text-primary" /> Walk-In Member
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsStaffModalOpen(true)}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border text-text font-bold text-xs flex items-center gap-1.5 transition min-h-[44px]"
                        title="Register Trainers and Front Desk Reception staff"
                      >
                        <Shield className="w-4 h-4 text-primary" /> Staff Management
                      </button>
                      <button
                        type="button"
                        onClick={handleRunManualExpiryCheck}
                        disabled={isRunningExpiryCheck}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border text-text font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 min-h-[44px]"
                        title="Scan all memberships, auto-expire overdue, and dispatch 7d/1d reminder emails in Ethiopian Calendar"
                      >
                        <RefreshCw className={`w-4 h-4 text-primary ${isRunningExpiryCheck ? 'animate-spin' : ''}`} /> Run Expiry Check
                      </button>
                    </div>
                  </div>

                  {/* Plans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {(adminPlans.length > 0 ? adminPlans : plans).map((p) => (
                      <div
                        key={p.id}
                        className="p-5 rounded-2xl bg-surface-elevated/60 border border-border flex flex-col justify-between hover:border-primary/50 transition shadow-sm group"
                      >
                        <div>
                          {p.imageUrl ? (
                            <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-surface border border-border">
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
                            <div className="w-full h-36 rounded-xl mb-4 bg-surface-elevated border border-dashed border-border flex flex-col items-center justify-center text-text-muted">
                              <ImageIcon className="w-6 h-6 mb-1 text-text-muted opacity-60" />
                              <span className="text-[10px]">No image uploaded</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h4 className="font-black text-text text-base">{p.name}</h4>
                            <span
                              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                                p.isActive
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                                  : 'bg-surface-elevated text-text-muted border-border'
                              }`}
                            >
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                            {p.description || 'Full gym facility access, locker, and workout areas.'}
                          </p>
                          <div className="mt-3 text-xs text-text-muted">
                            <span className="text-2xl font-black text-primary">{p.price.toLocaleString()}</span>
                            <span className="text-text-muted font-medium"> ETB / {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openEditPlanModal(p)}
                          className="mt-5 w-full py-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-text text-xs font-bold flex items-center justify-center gap-1.5 transition min-h-[44px]"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-primary" /> Edit Plan & Image
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Group Class Scheduling & Roster Oversight Engine */}
                <div className="p-5 sm:p-7 rounded-3xl bg-surface border border-border shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/15 text-primary border border-primary/25">
                          <Users className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-text tracking-tight">Group Classes & Roster Oversight Engine</h3>
                      </div>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Direct class scheduling, capacity limits, live waitlist queue audit, and front-desk attendance oversight.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => loadClasses()}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border text-text text-xs font-bold flex items-center gap-1.5 transition min-h-[44px]"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${classesLoading ? 'animate-spin text-primary' : ''}`} /> Refresh
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreateClassModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 transition active:scale-95 min-h-[44px]"
                      >
                        <Plus className="w-4 h-4" /> Schedule New Class
                      </button>
                    </div>
                  </div>

                  {classesList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {classesList.map((cls) => {
                        const isFull = cls.booked_count >= cls.capacity;
                        const pct = Math.min(100, Math.round((cls.booked_count / cls.capacity) * 100));

                        return (
                          <div
                            key={cls.id}
                            className="p-5 rounded-2xl bg-surface-elevated/60 border border-border flex flex-col justify-between hover:border-primary/50 transition shadow-sm"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="text-[11px] font-mono font-bold text-primary flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {formatEthiopianDateTime(cls.start_time)}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                    isFull
                                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                                  }`}
                                >
                                  {isFull ? `Full (${cls.waitlist_count} waitlist)` : `${cls.booked_count} / ${cls.capacity} spots`}
                                </span>
                              </div>

                              <h4 className="font-black text-text text-base">{cls.title}</h4>
                              <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                                {cls.description || 'Full class details.'}
                              </p>

                              <div className="mt-3.5 space-y-1.5 text-xs text-text-muted">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-text-muted opacity-70" /> {cls.location}
                                </div>
                                <div>
                                  Instructor: <span className="text-text font-bold">{cls.trainer_name || 'Gym Trainer'}</span>
                                  {cls.trainer_specialization && (
                                    <span className="text-[11px] text-text-muted"> ({cls.trainer_specialization})</span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="flex justify-between text-[11px] mb-1 font-bold">
                                  <span className="text-text-muted">Capacity</span>
                                  <span className={isFull ? 'text-amber-500' : 'text-emerald-500'}>
                                    {cls.booked_count} / {cls.capacity} spots
                                  </span>
                                </div>
                                <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden border border-border">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      isFull ? 'bg-amber-500' : 'bg-emerald-500'
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
                                className="w-full py-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-text font-bold text-xs flex items-center justify-center gap-2 transition min-h-[44px]"
                              >
                                <Users className="w-4 h-4 text-primary" /> View Class Roster & Attendance
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-text-muted text-xs bg-surface-elevated/40 rounded-2xl border border-border p-6">
                      <Calendar className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                      <p className="font-semibold text-text">No group classes scheduled yet</p>
                      <p className="mt-1 text-[11px]">Click "Schedule New Class" to create your first session.</p>
                    </div>
                  )}
                </div>

                {/* Other Admin Capabilities */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-6 rounded-3xl bg-surface border border-border flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary mb-4">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-black text-text">Financial & Attendance Reports</h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        View revenue analytics, attendance throughput, and download official CSV exports.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsAnalyticsModalOpen(true)}
                      className="mt-6 w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border font-bold text-xs text-text transition flex items-center justify-center gap-1.5 active:scale-98 min-h-[44px]"
                    >
                      <Download className="w-4 h-4 text-primary" /> Open Analytics & CSV Reports
                    </button>
                  </div>

                  <div className="p-6 rounded-3xl bg-surface border border-border flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary mb-4">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-black text-text">Equipment & Maintenance</h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Track machine inventory, review defect reports, and schedule maintenance services.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsEquipmentModalOpen(true)}
                      className="mt-6 w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-98 shadow-md shadow-primary/20 min-h-[44px]"
                    >
                      <Wrench className="w-4 h-4" /> Manage Inventory & Maintenance
                    </button>
                  </div>

                  <div className="p-6 rounded-3xl bg-surface border border-border flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary mb-4">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-black text-text">Staff & Role Management</h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Register Trainers & Front Desk Receptionists, generate credentials, and dispatch setup emails.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsStaffModalOpen(true)}
                      className="mt-6 w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-98 shadow-md shadow-primary/20 min-h-[44px]"
                    >
                      <Shield className="w-4 h-4" /> Register & Manage Staff
                    </button>
                  </div>
                </div>
              </div>
            )}
          
            {/* LOGGED-IN VIEW: CLASSES TAB */}
            {activeTab === 'classes' && (
              <div className="w-full space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-surface border border-border shadow-sm">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-text tracking-tight flex items-center gap-2.5">
                      <Calendar className="w-7 h-7 text-primary" />
                      Scheduled <span className="text-primary">Group Classes</span>
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-text-muted">
                      Live schedule with instructor assignments, capacity limits, and Ethiopian Calendar times.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => loadClasses()}
                      className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-elevated text-text font-bold text-xs border border-border transition flex items-center gap-1.5 shadow-sm active:scale-95 min-h-[44px]"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${classesLoading ? 'animate-spin text-primary' : 'text-primary'}`} /> Refresh
                    </button>
                    {(currentUser.role === 'admin' || currentUser.role === 'trainer') && (
                      <button
                        type="button"
                        onClick={() => setIsCreateClassModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-extrabold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 min-h-[44px]"
                      >
                        <Plus className="w-4 h-4" /> Schedule New Class
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classesList.length > 0 ? (
                    classesList.map((cls) => {
                      const isFull = cls.booked_count >= cls.capacity;
                      const pct = Math.min(100, Math.round((cls.booked_count / cls.capacity) * 100));
                      const isBookedByMe = myBookings.some((b) => b.class_id === cls.id && b.booking_status === 'booked');
                      const isWaitlistedByMe = myBookings.some((b) => b.class_id === cls.id && b.booking_status === 'waitlisted');

                      return (
                        <div
                          key={cls.id}
                          className="p-6 rounded-3xl bg-surface border border-border flex flex-col justify-between hover:border-primary/50 transition group shadow-sm"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-3">
                              <span className="flex items-center gap-1.5 font-mono text-primary text-xs font-bold">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatEthiopianDateTime(cls.start_time)}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isFull
                                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25'
                                }`}
                              >
                                {isFull ? `Full (${cls.waitlist_count} Waitlist)` : `${cls.booked_count} / ${cls.capacity} Booked`}
                              </span>
                            </div>

                            <h3 className="text-lg font-black text-text group-hover:text-primary transition uppercase">
                              {cls.title}
                            </h3>
                            <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                              {cls.description || 'Full coaching, mobility guidance, and conditioning.'}
                            </p>

                            <div className="mt-4 space-y-1.5 text-xs text-text-muted">
                              <p className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary" /> {cls.location}
                              </p>
                              <p>
                                Instructor: <span className="text-text font-bold">{cls.trainer_name || 'SWEATBOX Coach'}</span>
                                {cls.trainer_specialization && (
                                  <span className="text-text-muted"> ({cls.trainer_specialization})</span>
                                )}
                              </p>
                            </div>

                            {/* Capacity bar */}
                            <div className="mt-4">
                              <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden border border-border/50">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isFull ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col gap-2.5">
                            {(currentUser.role === 'admin' || currentUser.role === 'trainer') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRosterClass(cls);
                                  setIsRosterModalOpen(true);
                                }}
                                className="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-background border border-border text-text font-bold text-xs transition flex items-center justify-center gap-1.5 min-h-[44px]"
                              >
                                <Users className="w-4 h-4 text-primary" /> View Class Roster & Attendance
                              </button>
                            )}

                            {currentUser.role === 'member' && (
                              isBookedByMe ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancelBooking(cls.id)}
                                  disabled={bookingLoadingId === cls.id}
                                  className="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold text-xs transition flex items-center justify-center gap-1.5 min-h-[44px]"
                                >
                                  {bookingLoadingId === cls.id ? 'Updating...' : 'Cancel Reservation'}
                                </button>
                              ) : isWaitlistedByMe ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancelBooking(cls.id)}
                                  disabled={bookingLoadingId === cls.id}
                                  className="w-full py-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/25 font-bold text-xs transition flex items-center justify-center gap-1.5 min-h-[44px]"
                                >
                                  Waitlisted (Click to Leave)
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleBookClass(cls)}
                                  disabled={bookingLoadingId === cls.id}
                                  className={`w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md min-h-[44px] ${
                                    isFull
                                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                      : 'bg-primary hover:bg-primary-hover text-primary-foreground'
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
                    <div className="col-span-3 text-center py-12 text-text-muted text-sm">
                      No group classes scheduled yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LOGGED-IN VIEW: PLANS TAB */}
            {activeTab === 'plans' && (
              <div className="w-full space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-surface border border-border shadow-sm">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-text tracking-tight flex items-center gap-2.5">
                      <CreditCard className="w-7 h-7 text-primary" />
                      Membership <span className="text-primary">Plans & Billing</span>
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-text-muted">
                      Official gym tiers, pricing in Ethiopian Birr (ETB), and instant Chapa payment gateway.
                    </p>
                  </div>
                  {currentUser.role === 'admin' && (
                    <button
                      type="button"
                      onClick={openCreatePlanModal}
                      className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-extrabold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 min-h-[44px]"
                    >
                      <Plus className="w-4 h-4" /> Create New Plan
                    </button>
                  )}
                </div>

                {/* If member: Show active plan badge at top */}
                {currentUser.role === 'member' && myMembership && (
                  <div className="p-5 rounded-2xl bg-surface border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-primary font-mono font-bold uppercase tracking-wider">Current Active Plan</span>
                        <h4 className="text-lg font-black text-text">{myMembership.plan_name}</h4>
                        <p className="text-xs text-text-muted">
                          Expires: {formatEthiopianDate(myMembership.end_date)} E.C.
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 text-xs font-bold">
                      Active
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(currentUser.role === 'admin' && adminPlans.length > 0 ? adminPlans : plans).map((p) => (
                    <div
                      key={p.id}
                      className="p-6 rounded-3xl bg-surface border border-border flex flex-col justify-between hover:border-primary/50 transition group shadow-sm"
                    >
                      <div>
                        {p.imageUrl ? (
                          <div className="w-full h-36 rounded-2xl overflow-hidden mb-4 bg-surface-elevated border border-border">
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
                          <div className="w-full h-36 rounded-2xl mb-4 bg-surface-elevated border border-dashed border-border flex flex-col items-center justify-center text-text-muted">
                            <ImageIcon className="w-6 h-6 mb-1 text-text-muted opacity-60" />
                            <span className="text-[10px]">No image uploaded</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-lg font-black text-text group-hover:text-primary transition">
                            {p.name}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                              p.isActive
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                                : 'bg-surface-elevated text-text-muted border-border'
                            }`}
                          >
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                          {p.description || 'Full gym facility access, showers, lockers, and expert coaching.'}
                        </p>

                        <div className="mt-4">
                          <span className="text-3xl font-black text-primary">{p.price.toLocaleString()}</span>
                          <span className="text-xs text-text-muted font-medium"> ETB / {p.durationMonths} {p.durationMonths === 1 ? 'Month' : 'Months'}</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        {currentUser.role === 'admin' ? (
                          <button
                            type="button"
                            onClick={() => openEditPlanModal(p)}
                            className="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-border/60 border border-border text-text font-bold text-xs flex items-center justify-center gap-1.5 transition min-h-[44px]"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-primary" /> Edit Plan & Image
                          </button>
                        ) : currentUser.role === 'member' ? (
                          <button
                            type="button"
                            onClick={() => handleInitiatePayment(p)}
                            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 transition min-h-[44px]"
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
              </>
            )}

          </div>
        ) : (
          /* VIEW B: PUBLIC VISITOR VIEW (When not logged in) */
          <>
            {activeTab === 'home' && (
              <PublicHomePage
                plans={plans}
                classesList={classesList}
                onJoinNow={() => {
                  setAuthModalMode('register');
                  setErrorMessage(null);
                }}
                onViewPlans={() => {
                  setAuthModalMode('register');
                  setRegisterStep(3);
                  setErrorMessage(null);
                }}
                onViewClasses={() => setActiveTab('classes')}
                onSelectPlan={(plan) => {
                  setSelectedPlanId(plan.id);
                  setAuthModalMode('register');
                  setRegisterStep(3);
                  setErrorMessage(null);
                }}
                onBookClass={() => {
                  setAuthModalMode('login');
                  setErrorMessage('Please sign in or create an account to reserve group fitness classes.');
                }}
              />
            )}

            {activeTab === 'plans' && (
              <PublicHomePage
                plans={plans}
                classesList={classesList}
                onJoinNow={() => {
                  setAuthModalMode('register');
                  setRegisterStep(3);
                  setErrorMessage(null);
                }}
                onViewPlans={() => {
                  setAuthModalMode('register');
                  setRegisterStep(3);
                  setErrorMessage(null);
                }}
                onViewClasses={() => setActiveTab('classes')}
                onSelectPlan={(plan) => {
                  setSelectedPlanId(plan.id);
                  setAuthModalMode('register');
                  setRegisterStep(3);
                  setErrorMessage(null);
                }}
                onBookClass={() => {
                  setAuthModalMode('login');
                  setErrorMessage('Please sign in or create an account to reserve group fitness classes.');
                }}
              />
            )}

            {activeTab === 'classes' && (
              <PublicClassesSchedule
                classesList={classesList}
                isLoading={classesList.length === 0}
                onBookClass={() => {
                  setAuthModalMode('login');
                  setErrorMessage('Please sign in or create an account to reserve group fitness classes.');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* AUTH MODAL (LOGIN, REGISTER WIZARD, FORGOT PASSWORD, SET PASSWORD) */}
      {authModalMode && (
        <AuthModal
          mode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onSwitchMode={(mode) => setAuthModalMode(mode)}
          errorMessage={errorMessage}
          successMessage={successMessage}
          onClearMessages={() => {
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          onLoginSubmit={handleLoginSubmit}
          isSubmitting={isSubmitting}
          forgotEmail={forgotEmail}
          setForgotEmail={setForgotEmail}
          isForgotSubmitting={isForgotSubmitting}
          forgotSuccess={forgotSuccess}
          onForgotPasswordSubmit={handleForgotPasswordSubmit}
          onResetForgotSuccess={() => setForgotSuccess(false)}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          onSetPasswordSubmit={handleSetPasswordSubmit}
          regFirstName={regFirstName}
          setRegFirstName={setRegFirstName}
          regLastName={regLastName}
          setRegLastName={setRegLastName}
          regEmail={regEmail}
          setRegEmail={setRegEmail}
          regPassword={regPassword}
          setRegPassword={setRegPassword}
          regPhone={regPhone}
          setRegPhone={setRegPhone}
          regGoals={regGoals}
          setRegGoals={setRegGoals}
          regBranch={regBranch}
          setRegBranch={setRegBranch}
          regPhotoUrl={regPhotoUrl}
          setRegPhotoUrl={setRegPhotoUrl}
          onRegisterSubmit={handleRegisterSubmit}
          plans={plans}
          selectedPlanId={selectedPlanId}
          onSelectPlanId={(id) => setSelectedPlanId(id)}
          registerStep={registerStep}
          setRegisterStep={setRegisterStep}
        />
      )}

      {/* ADMIN MEMBERSHIP PLAN EDITOR MODAL */}
      {isPlanModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-editor-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md animate-fadeIn"
        >
          <div className="bg-surface border border-border w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl text-text relative max-h-[92vh] overflow-y-auto animate-scaleUp">
            <button 
              type="button"
              onClick={() => { setIsPlanModalOpen(false); setPlanModalError(null); }}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center text-text-muted hover:text-text rounded-xl hover:bg-surface-elevated border border-border/50 transition"
              aria-label="Close plan editor modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/15 border border-primary/25 rounded-2xl text-primary">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 id="plan-editor-title" className="text-lg font-black text-text tracking-tight">
                  {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Admin defines tiers, pricing in Ethiopian Birr (ETB), and plan imagery.
                </p>
              </div>
            </div>

            {planModalError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{planModalError}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setPlanModalError(null)} 
                  className="text-text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Plan Name *</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  required
                  placeholder="e.g. Monthly Standard, Annual VIP"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-text-muted/60 focus:outline-none focus:border-primary transition min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Short description of plan features and access..."
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-text-muted/60 focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Duration (Months) *</label>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={planDuration}
                    onChange={(e) => setPlanDuration(parseInt(e.target.value, 10) || 1)}
                    required
                    className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-text-muted/60 focus:outline-none focus:border-primary transition min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1.5">Price (ETB) *</label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={planPrice}
                    onChange={(e) => setPlanPrice(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-text-muted/60 focus:outline-none focus:border-primary transition min-h-[44px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="planIsActive"
                  checked={planIsActive}
                  onChange={(e) => setPlanIsActive(e.target.checked)}
                  className="rounded-lg border-border bg-surface-elevated text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="planIsActive" className="text-xs font-bold text-text cursor-pointer select-none">
                  Active (visible to public visitors & members for purchase)
                </label>
              </div>

              {/* Plan Image Upload from Local Storage */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-text-muted mb-1.5">
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
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-surface-elevated group">
                    <img
                      src={planImagePreview}
                      alt="Plan preview"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <label
                        htmlFor="plan-image-file-input"
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow min-h-[44px]"
                      >
                        <Upload className="w-3.5 h-3.5" /> Choose Different Image
                      </label>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="plan-image-file-input"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border hover:border-primary/60 rounded-2xl cursor-pointer bg-surface-elevated/40 hover:bg-surface-elevated transition text-center min-h-[120px]"
                  >
                    <Upload className="w-6 h-6 text-primary mb-2" />
                    <span className="text-xs font-bold text-text">Click to select photo from device</span>
                    <span className="text-[10px] text-text-muted mt-1">PNG, JPG, or WEBP up to 5MB</span>
                  </label>
                )}
                {planImageName && (
                  <p className="text-[11px] font-mono text-primary mt-1.5 truncate">
                    Selected file: {planImageName}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => { setIsPlanModalOpen(false); setPlanModalError(null); }}
                  className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-text text-xs font-bold transition min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center gap-1.5 shadow-md shadow-primary/20 transition disabled:opacity-50 min-h-[44px]"
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

      {/* CHAPA ONLINE CHECKOUT MODAL (Phase 3 Redesign) */}
      {checkoutModalData && (
        <ChapaCheckoutModal
          checkoutData={checkoutModalData}
          onClose={() => {
            setCheckoutModalData(null);
            setPaymentStep('form');
            setPaymentError(null);
          }}
          paymentStep={paymentStep}
          paymentError={paymentError}
          paymentSuccessDetails={paymentSuccessDetails}
          paymentMethodTab={paymentMethodTab}
          setPaymentMethodTab={setPaymentMethodTab}
          telebirrPhone={telebirrPhone}
          setTelebirrPhone={setTelebirrPhone}
          cbePhone={cbePhone}
          setCbePhone={setCbePhone}
          cardHolder={cardHolder}
          setCardHolder={setCardHolder}
          cardNumber={cardNumber}
          setCardNumber={setCardNumber}
          cardExpiry={cardExpiry}
          setCardExpiry={setCardExpiry}
          cardCvv={cardCvv}
          setCardCvv={setCardCvv}
          onCompletePayment={handleCompleteChapaPayment}
          onFinishAndAccessPass={async () => {
            setCheckoutModalData(null);
            setPaymentStep('form');
            setPaymentError(null);
            setPaymentSuccessDetails(null);
            setAuthModalMode(null);
            setActiveTab('home');
            setSuccessMessage('Payment confirmed! Welcome to SWEATBOX with full member access.');
            await loadMemberMembershipAndPayments();
          }}
          onRetreatToBranchPlans={() => {
            setCheckoutModalData(null);
            setPaymentStep('form');
            setPaymentError(null);
            setPaymentSuccessDetails(null);
            setAuthModalMode('register');
            setRegisterStep(3);
          }}
        />
      )}

      {/* RECEPTION & ADMIN OFFLINE PAYMENT MODAL (POP-REC-03 / REC-PAGE-07) */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => { setIsManualModalOpen(false); setManualPaymentError(null); }}
              className="absolute top-4 right-4 p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-elevated transition min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">Record Offline Payment</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Collect Cash or Direct Bank Transfer with instant membership activation.
                </p>
              </div>
            </div>

            {manualPaymentError && (
              <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-start justify-between gap-2 shadow-sm animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
                  <span>{manualPaymentError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setManualPaymentError(null)}
                  className="text-danger hover:opacity-80 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSaveManualPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Member ID (UUID) *
                </label>
                <input
                  type="text"
                  value={manualMemberId}
                  onChange={(e) => setManualMemberId(e.target.value)}
                  required
                  placeholder="e.g. c0000000-0000-0000-0000-000000000003"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-xs text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary font-mono transition"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Copy from the Scanner terminal or Member Roster.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Membership Plan Tier *
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
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-primary transition"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id} className="bg-surface text-text">
                      {p.name} — {p.price.toLocaleString()} ETB ({p.durationMonths} {p.durationMonths === 1 ? 'month' : 'months'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-text">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setManualPaymentMethod('cash')}
                    className={`min-h-[44px] py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      manualPaymentMethod === 'cash'
                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                        : 'bg-surface-elevated border-border text-text-muted hover:text-text hover:border-border-strong'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    Cash at Front Desk
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualPaymentMethod('bank_transfer')}
                    className={`min-h-[44px] py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      manualPaymentMethod === 'bank_transfer'
                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                        : 'bg-surface-elevated border-border text-text-muted hover:text-text hover:border-border-strong'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    CBE / Telebirr Transfer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Amount Received (ETB) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={manualAmount}
                    onChange={(e) => setManualAmount(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm font-bold text-text focus:outline-none focus:border-primary transition"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
                    ETB
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  Transaction Notes / Receipt Slip #
                </label>
                <input
                  type="text"
                  value={manualReferenceNote}
                  onChange={(e) => setManualReferenceNote(e.target.value)}
                  placeholder="e.g. Paper Slip #4421, CBE Ref #FT26..."
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-xs text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => { setIsManualModalOpen(false); setManualPaymentError(null); }}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingManualPayment}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
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

      {/* ADMIN STAFF MANAGEMENT MODAL (Trainer & Reception Registration) */}
      {currentUser && currentUser.role === 'admin' && (
        <StaffManagementModal
          isOpen={isStaffModalOpen}
          onClose={() => setIsStaffModalOpen(false)}
          adminName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}
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

            {/* SWEATBOX AI ASSISTANT MODAL (Workout Coach, Biomechanics, Progress) */}

      {currentUser && (

        <AIAssistantModal

          isOpen={isAiModalOpen}

          onClose={() => setIsAiModalOpen(false)}

          userName={`${currentUser.firstName} ${currentUser.lastName}`.trim()}

          userRole={currentUser.role}

        />

      )}



      {/* SWEATBOX ANALYTICS & CSV REPORTING MODAL */}

      <AnalyticsModal

        isOpen={isAnalyticsModalOpen}

        onClose={() => setIsAnalyticsModalOpen(false)}

        userRole={currentUser?.role || 'guest'}

      />



      {/* LOGOUT CONFIRMATION DIALOG (POP-AUTH-05) */}
      {isLogoutConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
        >
          <div className="bg-surface border border-border w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl text-text relative animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 id="logout-dialog-title" className="text-lg font-black text-text tracking-tight">
              Sign Out of SWEATBOX?
            </h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Are you sure you want to end your current session? You will need to sign in again to access your passes, workouts, and portal features.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-text font-bold text-xs transition min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsLogoutConfirmOpen(false);
                  await handleLogout();
                }}
                className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition min-h-[44px]"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border-subtle py-6 px-6 text-center text-xs text-content-secondary flex flex-wrap items-center justify-center gap-4">
        <span>&copy; {new Date().getFullYear()} SWEATBOX Fitness Systems. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default App;
