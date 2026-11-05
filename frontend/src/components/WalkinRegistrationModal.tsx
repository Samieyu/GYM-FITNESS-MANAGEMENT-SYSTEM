import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Phone, 
  RefreshCw,
  HeartHandshake,
  Target
} from 'lucide-react';
import { Plan } from '../api/plans';
import { registerWalkinMemberApi, WalkinRegistrationResponse } from '../api/reception';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

interface WalkinRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  plans: Plan[];
  onSuccess?: () => void;
}

export const WalkinRegistrationModal: React.FC<WalkinRegistrationModalProps> = ({
  isOpen,
  onClose,
  staffName,
  plans,
  onSuccess,
}) => {
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [amount, setAmount] = useState<number>(0);
  const [referenceNote, setReferenceNote] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('Full body conditioning & muscle tone');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Execution states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<WalkinRegistrationResponse | null>(null);

  // Set default plan and amount when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessResult(null);
      const activePlans = plans.filter((p) => p.isActive);
      if (activePlans.length > 0) {
        setPlanId(activePlans[0].id);
        setAmount(activePlans[0].price);
      }
    }
  }, [isOpen, plans]);

  // When plan changes, update amount default
  const handlePlanChange = (selectedId: string) => {
    setPlanId(selectedId);
    const selected = plans.find((p) => p.id === selectedId);
    if (selected) {
      setAmount(selected.price);
    }
  };

  const selectedPlan = plans.find((p) => p.id === planId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side strict validation for Gmail
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(cleanEmail)) {
      setErrorMessage('Only valid @gmail.com addresses are permitted (e.g. member@gmail.com).');
      return;
    }

    // Client-side strict validation for Ethiopian phone
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^(\+251|0)[79]\d{8}$/.test(cleanPhone)) {
      setErrorMessage(
        'Please enter a valid Ethiopian mobile phone (+251 9..., +251 7..., 09..., or 07...).'
      );
      return;
    }

    if (!selectedPlan) {
      setErrorMessage('Please select a membership plan.');
      return;
    }

    if (amount < selectedPlan.price) {
      setErrorMessage(
        `Amount entered (${amount} ETB) is less than the plan price (${selectedPlan.price} ETB).`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerWalkinMemberApi({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        planId: selectedPlan.id,
        paymentMethod,
        amount,
        referenceNote: referenceNote.trim() || undefined,
        fitnessGoals: fitnessGoals.trim() || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
      });

      setSuccessResult(result);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete walk-in registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setReferenceNote('');
    setSuccessResult(null);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-surface border border-border w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto text-text transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="walkin-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-text-muted hover:text-text transition p-1.5 rounded-full hover:bg-background"
          aria-label="Close walkin registration"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 id="walkin-modal-title" className="text-lg font-bold text-text flex items-center gap-2">
              Walk-In Member Registration
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 uppercase">
                Front Desk Intake
              </span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Staff Registrar: <strong className="text-text">{staffName}</strong> • Immediate Facility Activation
            </p>
          </div>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SUCCESS CONFIRMATION RECEIPT */}
        {successResult ? (
          <div className="py-2 space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-text">Registration & Payment Complete!</h3>
              <p className="text-xs text-text-muted">
                {successResult.user.isNewUser
                  ? 'New member account verified and activated with immediate facility access.'
                  : 'Existing member renewed with offline payment.'}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-background border border-border text-xs space-y-2">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Member</span>
                <span className="font-bold text-text">
                  {successResult.user.firstName} {successResult.user.lastName} ({successResult.user.email})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Membership Plan</span>
                <span className="font-bold text-primary">{selectedPlan?.name || 'Gym Tier'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Validity (E.C.)</span>
                <span className="font-medium text-text">
                  {formatEthiopianDate(successResult.membership.end_date)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Amount Paid</span>
                <span className="font-extrabold text-text">{successResult.payment.amount?.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-text-muted">Payment Reference</span>
                <span className="font-mono text-text-muted">{successResult.payment.payment_reference}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Payment Method</span>
                <span className="capitalize font-semibold text-text">
                  {successResult.payment.payment_method === 'cash' ? 'Cash (Front Desk)' : 'Bank Transfer'}
                </span>
              </div>
            </div>

            {/* Password Invitation Info */}
            {successResult.inviteSent && (
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-text space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-bold text-[11px]">
                  <Mail className="w-3.5 h-3.5" /> Password Setup Invitation Dispatched
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  A welcome email with a secure link to set their password has been sent to{' '}
                  <strong className="text-text">{successResult.user.email}</strong>. The member can log in to view their 60s rotating QR code pass.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFirstName('');
                  setLastName('');
                  setEmail('');
                  setPhone('');
                  setReferenceNote('');
                  setSuccessResult(null);
                  setErrorMessage(null);
                }}
                className="flex-1 py-3 rounded-xl bg-surface hover:bg-background border border-border text-text font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4 text-primary" />
                Register Another Walk-In
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                Done & Close
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION & PAYMENT FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Member Personal Information */}
            <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                1. Member Personal Information
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Abebe"
                    className="w-full bg-surface border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-text placeholder-text-muted focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Bikila"
                    className="w-full bg-surface border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-text placeholder-text-muted focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Gmail Address (@gmail.com) *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member.name@gmail.com"
                    className="w-full bg-surface border border-border focus:border-primary rounded-xl pl-9 pr-3 py-2 text-xs text-text placeholder-text-muted focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Ethiopian Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 9... or 09... (Ethio Telecom / Safaricom)"
                    className="w-full bg-surface border border-border focus:border-primary rounded-xl pl-9 pr-3 py-2 text-xs text-text placeholder-text-muted focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1 flex items-center gap-1">
                    <HeartHandshake className="w-3 h-3 text-text-muted" /> Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Name & Phone"
                    className="w-full bg-surface border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-text placeholder-text-muted focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3 text-text-muted" /> Fitness Goals
                  </label>
                  <input
                    type="text"
                    value={fitnessGoals}
                    onChange={(e) => setFitnessGoals(e.target.value)}
                    placeholder="e.g. Muscle gain, fat loss"
                    className="w-full bg-surface border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-text placeholder-text-muted focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Membership Plan & Offline Payment */}
            <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                2. Plan Selection & Payment Collection
              </span>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">Select Membership Plan *</label>
                <select
                  value={planId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full bg-surface border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-text focus:outline-none"
                >
                  {plans
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.price.toLocaleString()} ETB ({p.durationMonths}{' '}
                        {p.durationMonths === 1 ? 'Month' : 'Months'})
                      </option>
                    ))}
                </select>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Payment Method *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'cash'
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-surface text-text-muted hover:text-text'
                    }`}
                  >
                    💵 Cash (Front Desk)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-surface text-text-muted hover:text-text'
                    }`}
                  >
                    🏛️ Bank Transfer / Telebirr
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Amount Paid (ETB) *</label>
                  <input
                    type="number"
                    min={selectedPlan ? selectedPlan.price : 0}
                    step={10}
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-text font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">Receipt / Slip Note</label>
                  <input
                    type="text"
                    value={referenceNote}
                    onChange={(e) => setReferenceNote(e.target.value)}
                    placeholder="e.g. CBE Slip #49102"
                    className="w-full bg-surface border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-text placeholder-text-muted focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl bg-surface hover:bg-background border border-border text-text text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-extrabold text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Registering...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Complete Registration & Activate
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
