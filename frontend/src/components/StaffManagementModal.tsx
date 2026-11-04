import React, { useState, useEffect } from 'react';
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
  const [bio, setBio] = useState('Certified Titan Fitness Trainer');

  // Execution states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    staff: StaffMember;
    inviteSent: boolean;
    temporaryPassword?: string;
  } | null>(null);

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
    let pwd = 'Titan@';
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
      setErrorMessage('Only valid @gmail.com addresses are permitted (e.g. staff@gmail.com).');
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^(\+251|0)[79]\d{8}$/.test(cleanPhone)) {
      setErrorMessage(
        'Please enter a valid Ethiopian phone number (+251 9..., +251 7..., 09..., or 07...).'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
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
      // Refresh the staff list in background
      loadStaff();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to register staff member.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition p-1.5 rounded-full hover:bg-charcoal-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-primary/15 border border-orange-primary/30 flex items-center justify-center text-orange-primary">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Staff & Role Management
              <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-red-500/30">
                Admin Exclusive
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Administrator: <strong className="text-gray-200">{adminName}</strong> • Register Trainers & Front Desk Receptionists
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-charcoal-900 rounded-xl mb-6 border border-charcoal-800">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'bg-orange-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register New Staff
          </button>
          <button
            onClick={() => {
              setActiveTab('directory');
              loadStaff();
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'directory'
                ? 'bg-orange-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Active Staff Directory ({staffList.length})
          </button>
        </div>

        {/* ERROR NOTIFICATION */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: REGISTRATION */}
        {activeTab === 'register' && (
          <div>
            {successResult ? (
              /* REGISTRATION SUCCESS CARD */
              <div className="py-2 space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-green-950/60 border border-green-700/80 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border border-green-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {successResult.staff.role === 'trainer' ? 'Trainer' : 'Receptionist'} Successfully Provisioned!
                  </h4>
                  <p className="text-xs text-green-300">
                    The staff account has been verified and granted direct access to their assigned dashboard.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-gray-300 space-y-2.5">
                  <div className="flex justify-between py-1 border-b border-charcoal-800">
                    <span className="text-gray-400">Full Name</span>
                    <span className="font-bold text-white">
                      {successResult.staff.first_name} {successResult.staff.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-charcoal-800">
                    <span className="text-gray-400">Assigned Role</span>
                    <span className="font-bold uppercase tracking-wider text-orange-primary">
                      {successResult.staff.role === 'trainer' ? 'Certified Trainer' : 'Reception Desk'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-charcoal-800">
                    <span className="text-gray-400">Login Gmail</span>
                    <span className="font-mono text-white">{successResult.staff.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-charcoal-800">
                    <span className="text-gray-400">Initial Password</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {successResult.temporaryPassword || 'Configured'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Target Dashboard</span>
                    <span className="text-emerald-400 font-medium">
                      {successResult.staff.role === 'trainer'
                        ? 'Trainer Dashboard (Clients & Workouts)'
                        : 'Reception Dashboard (Check-ins & Cash Overrides)'}
                    </span>
                  </div>
                </div>

                {successResult.inviteSent && (
                  <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-gray-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-orange-primary font-semibold text-[11px]">
                      <Mail className="w-3.5 h-3.5" /> Set Password Invitation Dispatched
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      An official invitation email with the secure "Set Your Password" link has been sent to{' '}
                      <strong className="text-white">{successResult.staff.email}</strong> (captured in Mailpit at http://localhost:8025). The staff member can also immediately log in with their assigned password.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 rounded-xl bg-charcoal-700 hover:bg-charcoal-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4 text-orange-primary" />
                    Register Another Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('directory');
                    }}
                    className="flex-1 py-3 rounded-xl bg-orange-primary hover:bg-orange-hover text-white font-bold text-xs shadow-lg shadow-orange-primary/20 transition flex items-center justify-center gap-1.5"
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
                  <label className="block text-xs font-semibold text-gray-300 mb-2">
                    Select Staff Role & Access Level
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('trainer')}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                        role === 'trainer'
                          ? 'border-orange-primary bg-orange-primary/10 text-white'
                          : 'border-charcoal-700 bg-charcoal-900/50 text-gray-400 hover:border-charcoal-600'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${role === 'trainer' ? 'bg-orange-primary text-white' : 'bg-charcoal-800 text-gray-400'}`}>
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Fitness Trainer</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Assigned to workouts, client logs & classes. Opens Trainer Dashboard.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('reception')}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start gap-3 ${
                        role === 'reception'
                          ? 'border-orange-primary bg-orange-primary/10 text-white'
                          : 'border-charcoal-700 bg-charcoal-900/50 text-gray-400 hover:border-charcoal-600'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${role === 'reception' ? 'bg-orange-primary text-white' : 'bg-charcoal-800 text-gray-400'}`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Front Desk Reception</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Scans passes, registers walk-in cash payments. Opens Reception Dashboard.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Abebe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs focus:border-orange-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Bikila"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs focus:border-orange-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email (Gmail Strict) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Staff Gmail Address <span className="text-orange-primary text-[11px] font-normal">(@gmail.com required)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="staffmember@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs focus:border-orange-primary focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Credentials & "Set Your Password" notification link will be delivered to this Gmail.
                  </p>
                </div>

                {/* Ethiopian Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Ethiopian Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 911 234 567 or 0911234567"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs focus:border-orange-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Initial Password with Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-300">
                      Initial Password
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[11px] text-orange-primary hover:text-orange-hover flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Generate
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white text-xs focus:border-orange-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Trainer Specific Options */}
                {role === 'trainer' && (
                  <div className="p-3.5 rounded-xl bg-charcoal-900/80 border border-charcoal-800 space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Trainer Specialization
                      </label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Bodybuilding, Powerlifting, HIIT Cardio"
                        className="w-full px-3 py-2 rounded-lg bg-charcoal-850 border border-charcoal-700 text-white text-xs focus:border-orange-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Professional Bio / Credentials
                      </label>
                      <input
                        type="text"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="e.g. Certified NASM Personal Trainer • 5+ years experience"
                        className="w-full px-3 py-2 rounded-lg bg-charcoal-850 border border-charcoal-700 text-white text-xs focus:border-orange-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-orange-primary hover:bg-orange-hover disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-orange-primary/20 transition flex items-center justify-center gap-2"
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
              <span className="text-xs text-gray-400">
                Registered Trainers & Front Desk Staff ({staffList.length})
              </span>
              <button
                type="button"
                onClick={loadStaff}
                disabled={isLoadingList}
                className="text-[11px] text-orange-primary hover:text-orange-hover flex items-center gap-1 font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingList ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {isLoadingList ? (
              <div className="py-8 text-center text-gray-500 text-xs">Loading staff directory...</div>
            ) : staffList.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs">
                No staff members registered yet. Use the registration form to add trainers or receptionists.
              </div>
            ) : (
              <div className="space-y-2.5">
                {staffList.map((staff) => (
                  <div
                    key={staff.id}
                    className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-between hover:border-charcoal-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          staff.role === 'trainer'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {staff.first_name[0]}
                        {staff.last_name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          {staff.first_name} {staff.last_name}
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              staff.role === 'trainer'
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {staff.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-3 mt-0.5">
                          <span>{staff.email}</span>
                          {staff.phone && <span>• {staff.phone}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                        Active & Verified
                      </span>
                      <div className="text-[10px] text-gray-500 mt-1">
                        Added: {formatEthiopianDate(staff.created_at)}
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
