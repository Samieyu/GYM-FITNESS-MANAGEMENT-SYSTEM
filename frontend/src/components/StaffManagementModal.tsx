import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UserPlus,
  Shield,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Dumbbell,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  fetchStaffMembersApi,
  registerStaffApi,
  StaffMember,
  RegisterStaffPayload,
} from '../api/auth';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

interface StaffManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
}

export const StaffManagementModal: React.FC<StaffManagementModalProps> = ({
  isOpen,
  onClose,
  adminName,
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'directory'>('register');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Form fields
  const [role, setRole] = useState<'trainer' | 'reception'>('trainer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [specialization, setSpecialization] = useState('Strength & Functional Conditioning');
  const [bio, setBio] = useState('Certified POWERZONE Trainer');

  // Execution states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    staff: StaffMember;
    inviteSent: boolean;
    temporaryPassword?: string;
  } | null>(null);

  const modalContainerRef = useRef<HTMLDivElement>(null);

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    modalContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      loadStaff();
      setErrorMessage(null);
      setSuccessResult(null);
    }
  }, [isOpen]);

  const loadStaff = async () => {
    setIsLoadingList(true);
    try {
      const data = await fetchStaffMembersApi();
      setStaffList(data);
    } catch (err: any) {
      console.error('Failed to load staff members:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pwd = 'Powerzone@';
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(cleanEmail)) {
      triggerError('Only valid @gmail.com addresses are permitted (e.g. staff@gmail.com).');
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^(\+251|0)[79]\d{8}$/.test(cleanPhone)) {
      triggerError(
        'Please enter a valid Ethiopian phone number (+251 9..., +251 7..., 09..., or 07...).'
      );
      return;
    }

    if (password.length < 6) {
      triggerError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: RegisterStaffPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role,
        password,
        specialization: role === 'trainer' ? specialization.trim() : undefined,
        bio: role === 'trainer' ? bio.trim() : undefined,
      };

      const res = await registerStaffApi(payload);
      setSuccessResult({
        staff: res.staff,
        inviteSent: res.inviteSent,
        temporaryPassword: password,
      });
      modalContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      // Refresh the staff list in background
      loadStaff();
    } catch (err: any) {
      triggerError(err.message || 'Failed to register staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setErrorMessage(null);
    setSuccessResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div ref={modalContainerRef} className="bg-surface border border-border w-full max-w-2xl rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-text">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 text-text-muted hover:text-text transition p-2 rounded-xl hover:bg-surface-elevated min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-6 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold text-text">
                Staff & Role Management Center
              </h3>
              <span className="text-[10px] bg-danger/10 text-danger px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold border border-danger/20">
                Admin Exclusive
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Administrator: <strong className="text-text font-semibold">{adminName}</strong> • Provision Certified Trainers & Front Desk Receptionists
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-2xl bg-surface-elevated p-1.5 border border-border mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
              activeTab === 'register'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Staff</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('directory');
              loadStaff();
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 min-h-[44px] ${
              activeTab === 'directory'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Active Staff Directory ({staffList.length})</span>
          </button>
        </div>

        {/* ERROR NOTIFICATION */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-danger hover:opacity-80 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: REGISTRATION */}
        {activeTab === 'register' && (
          <div>
            {successResult ? (
              /* REGISTRATION SUCCESS CARD */
              <div className="py-2 space-y-4 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-text">
                    {successResult.staff.role === 'trainer' ? 'Fitness Trainer' : 'Receptionist'} Successfully Provisioned!
                  </h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    The staff account has been verified and granted direct access to their assigned operational dashboard.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-elevated border border-border text-xs text-text space-y-2.5">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Full Name</span>
                    <span className="font-bold text-text">
                      {successResult.staff.first_name} {successResult.staff.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Assigned Role</span>
                    <span className="font-bold uppercase tracking-wider text-primary">
                      {successResult.staff.role === 'trainer' ? 'Certified Trainer' : 'Front Desk Reception'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Login Gmail</span>
                    <span className="font-mono text-text">{successResult.staff.email}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Initial Password</span>
                    <span className="font-mono text-amber-500 font-bold">
                      {successResult.temporaryPassword || 'Configured'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-text-muted">Target Dashboard</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {successResult.staff.role === 'trainer'
                        ? 'Trainer Dashboard (Clients & Workouts)'
                        : 'Reception Dashboard (Check-ins & Cash Overrides)'}
                    </span>
                  </div>
                </div>

                {successResult.inviteSent && (
                  <div className="p-3.5 rounded-xl bg-surface-elevated border border-border text-xs text-text-muted space-y-1">
                    <div className="flex items-center gap-1.5 text-primary font-bold text-[11px]">
                      <Mail className="w-3.5 h-3.5" /> Set Password Invitation Dispatched
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      An official invitation email with the secure "Set Your Password" link has been sent to{' '}
                      <strong className="text-text">{successResult.staff.email}</strong>. The staff member can also immediately log in with their assigned password.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 min-h-[44px] py-3 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-text font-bold text-xs transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <UserPlus className="w-4 h-4 text-primary" />
                    Register Another Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('directory');
                    }}
                    className="flex-1 min-h-[44px] py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Users className="w-4 h-4" />
                    View Staff Directory
                  </button>
                </div>
              </div>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-bold text-text mb-2">
                    Select Staff Role & Access Level *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('trainer')}
                      className={`min-h-[64px] p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                        role === 'trainer'
                          ? 'border-primary bg-primary/10 text-text shadow-sm'
                          : 'border-border bg-surface-elevated text-text-muted hover:border-border-strong hover:text-text'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${role === 'trainer' ? 'bg-primary text-primary-foreground' : 'bg-surface text-text-muted border border-border'}`}>
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text">Fitness Trainer</div>
                        <div className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                          Assigned to workouts, client progress logs & classes.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('reception')}
                      className={`min-h-[64px] p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                        role === 'reception'
                          ? 'border-primary bg-primary/10 text-text shadow-sm'
                          : 'border-border bg-surface-elevated text-text-muted hover:border-border-strong hover:text-text'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${role === 'reception' ? 'bg-primary text-primary-foreground' : 'bg-surface text-text-muted border border-border'}`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text">Front Desk Reception</div>
                        <div className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                          Scans passes, registers walk-in cash payments & overrides.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text mb-1.5">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Abebe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border focus:border-primary text-text text-xs focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text mb-1.5">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Bikila"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border focus:border-primary text-text text-xs focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Email (Gmail Strict) */}
                <div>
                  <label className="block text-xs font-bold text-text mb-1.5">
                    Staff Gmail Address <span className="text-primary text-[11px] font-normal">(@gmail.com required) *</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="staffmember@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border focus:border-primary text-text text-xs focus:outline-none transition"
                    />
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    Credentials & "Set Your Password" notification link will be delivered to this Gmail.
                  </p>
                </div>

                {/* Ethiopian Phone */}
                <div>
                  <label className="block text-xs font-bold text-text mb-1.5">
                    Ethiopian Mobile Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 911 234 567 or 0911234567"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border focus:border-primary text-text text-xs focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Initial Password with Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-text">
                      Initial Temporary Password *
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 font-bold"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Auto-Generate
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-elevated border border-border focus:border-primary text-text text-xs focus:outline-none font-mono transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 p-1 text-text-muted hover:text-text transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Trainer Specific Options */}
                {role === 'trainer' && (
                  <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-text mb-1">
                        Trainer Specialization
                      </label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Bodybuilding, Powerlifting, HIIT Cardio"
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:border-primary text-text text-xs focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text mb-1">
                        Professional Bio / Credentials
                      </label>
                      <input
                        type="text"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="e.g. Certified NASM Personal Trainer • 5+ years experience"
                        className="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:border-primary text-text text-xs focus:outline-none transition"
                      />
                    </div>
                  </div>
                )}

                {/* Inline Error Notice before submit button */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
                      <span>{errorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorMessage(null)}
                      className="text-danger hover:opacity-80 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[44px] py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Provisioning Credentials...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Register {role === 'trainer' ? 'Trainer' : 'Receptionist'} & Send Credentials
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: STAFF DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">
                Registered Trainers & Front Desk Staff ({staffList.length})
              </span>
              <button
                type="button"
                onClick={loadStaff}
                disabled={isLoadingList}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-bold"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingList ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {isLoadingList ? (
              <div className="py-12 text-center text-text-muted text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                <span>Loading staff directory...</span>
              </div>
            ) : staffList.length === 0 ? (
              <div className="py-12 text-center text-text-muted text-xs bg-surface-elevated/40 rounded-2xl border border-border p-6">
                <Users className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-text">No staff members registered yet</p>
                <p className="mt-1 text-[11px]">Use the registration form to add trainers or receptionists.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {staffList.map((staff) => (
                  <div
                    key={staff.id}
                    className="p-3.5 rounded-xl bg-surface-elevated border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-border-strong transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                          staff.role === 'trainer'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {staff.first_name[0]}
                        {staff.last_name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text flex items-center gap-2">
                          <span>{staff.first_name} {staff.last_name}</span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              staff.role === 'trainer'
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {staff.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                          <span>{staff.email}</span>
                          {staff.phone && <span>• {staff.phone}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
                        Active & Verified
                      </span>
                      <div className="text-[10px] text-text-muted mt-1 flex items-center gap-1 sm:justify-end">
                        <Calendar className="w-3 h-3" />
                        <span>Added: {formatEthiopianDate(staff.created_at)} E.C.</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
