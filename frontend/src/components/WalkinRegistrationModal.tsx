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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition p-1.5 rounded-full hover:bg-charcoal-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-primary/15 border border-orange-primary/30 flex items-center justify-center text-orange-primary">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Walk-In Member Registration
              <span className="px-2 py-0.5 rounded-full bg-orange-primary/20 text-orange-primary text-[10px] font-bold border border-orange-primary/30 uppercase">
                Member Registration
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Staff Registrar: <strong className="text-gray-200">{staffName}</strong> • In-Person Verification
            </p>
          </div>
        </div>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SUCCESS CONFIRMATION RECEIPT */}
        {successResult ? (
          <div className="py-4 space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-green-950/60 border border-green-700/80 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border border-green-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Registration & Payment Complete!</h4>
              <p className="text-xs text-green-300">
                {successResult.user.isNewUser
                  ? 'New member account verified and activated with immediate facility access.'
                  : 'Existing member renewed with offline payment.'}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-gray-300 space-y-2">
              <div className="flex justify-between py-1 border-b border-charcoal-800">
                <span className="text-gray-400">Member</span>
                <span className="font-bold text-white">
                  {successResult.user.firstName} {successResult.user.lastName} ({successResult.user.email})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-charcoal-800">
                <span className="text-gray-400">Membership Plan</span>
                <span className="font-semibold text-orange-primary">{selectedPlan?.name || 'Gym Tier'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-charcoal-800">
                <span className="text-gray-400">Validity (E.C.)</span>
                <span className="font-medium text-white">
                  {formatEthiopianDate(successResult.membership.end_date)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-charcoal-800">
                <span className="text-gray-400">Amount Paid</span>
                <span className="font-bold text-white">{successResult.payment.amount?.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-charcoal-800">
                <span className="text-gray-400">Payment Reference</span>
                <span className="font-mono text-gray-300">{successResult.payment.payment_reference}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Payment Method</span>
                <span className="capitalize text-white">
                  {successResult.payment.payment_method === 'cash' ? 'Cash (Front Desk)' : 'Bank Transfer'}
                </span>
              </div>
            </div>

            {/* Password Invitation Info */}
            {successResult.inviteSent && (
              <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-gray-300 space-y-1">
                <div className="flex items-center gap-1.5 text-orange-primary font-semibold text-[11px]">
                  <Mail className="w-3.5 h-3.5" /> Password Setup Invitation Dispatched
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  A welcome email with a secure link to set their password has been sent to{' '}
                  <strong className="text-white">{successResult.user.email}</strong> (Mailpit port 8025). The member can log in to view their 60s rotating QR code pass.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-xl bg-orange-primary hover:bg-orange-hover text-white font-bold text-xs shadow-lg shadow-orange-primary/20 transition"
            >
              Done & Register Another Walk-In
            </button>
          </div>
        ) : (
          /* REGISTRATION & PAYMENT FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Member Personal Information */}
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-primary block">
                1. Member Personal Information
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Abebe"
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Bikila"
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Gmail Address (@gmail.com) *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="abebe.bikila@gmail.com"
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Ethiopian Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 9... or 09... (Ethio / Safaricom)"
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Name & Phone"
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Fitness Goals</label>
                  <input
                    type="text"
                    value={fitnessGoals}
                    onChange={(e) => setFitnessGoals(e.target.value)}
                    placeholder="e.g. Muscle gain, endurance"
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>
              </div>
            </div>

            {/* 2. Membership Plan & Offline Payment */}
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-primary block">
                2. Plan Selection & Payment Collection
              </span>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Select Membership Plan *</label>
                <select
                  value={planId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-primary"
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
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Payment Method *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'cash'
                        ? 'border-orange-primary bg-orange-primary/10 text-white shadow-sm'
                        : 'border-charcoal-700 bg-charcoal-950 text-gray-400 hover:text-white'
                    }`}
                  >
                    💵 Cash (Front Desk)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-orange-primary bg-orange-primary/10 text-white shadow-sm'
                        : 'border-charcoal-700 bg-charcoal-950 text-gray-400 hover:text-white'
                    }`}
                  >
                    🏛️ Bank Transfer / Slip
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Amount Paid (ETB) *</label>
                  <input
                    type="number"
                    min={selectedPlan ? selectedPlan.price : 0}
                    step={10}
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Receipt / Slip Note</label>
                  <input
                    type="text"
                    value={referenceNote}
                    onChange={(e) => setReferenceNote(e.target.value)}
                    placeholder="e.g. CBE Slip #49102"
                    className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-primary"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-orange-primary/20 disabled:opacity-50"
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
