import React from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  Phone,
  AlertCircle,
  ExternalLink,
  Check,
  Mail,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface CheckoutModalData {
  planId?: string;
  planName: string;
  amount: number;
  txRef: string;
  checkoutUrl?: string | null;
  isLiveGateway?: boolean;
}

export interface PaymentSuccessDetails {
  planName: string;
  amount: number;
  txRef: string;
  date: string;
  method: string;
}

interface ChapaCheckoutModalProps {
  checkoutData: CheckoutModalData;
  onClose: () => void;
  paymentStep: 'form' | 'processing' | 'success';
  paymentError: string | null;
  paymentSuccessDetails: PaymentSuccessDetails | null;
  paymentMethodTab: 'telebirr' | 'cbe' | 'card';
  setPaymentMethodTab: (tab: 'telebirr' | 'cbe' | 'card') => void;

  // Telebirr inputs
  telebirrPhone: string;
  setTelebirrPhone: (val: string) => void;

  // CBE Birr inputs
  cbePhone: string;
  setCbePhone: (val: string) => void;

  // Card inputs
  cardHolder: string;
  setCardHolder: (val: string) => void;
  cardNumber: string;
  setCardNumber: (val: string) => void;
  cardExpiry: string;
  setCardExpiry: (val: string) => void;
  cardCvv: string;
  setCardCvv: (val: string) => void;

  onCompletePayment: (e: React.FormEvent) => Promise<void>;
  onFinishAndAccessPass: () => Promise<void>;
  onRetreatToBranchPlans?: () => void;
}

export const ChapaCheckoutModal: React.FC<ChapaCheckoutModalProps> = ({
  checkoutData,
  onClose,
  paymentStep,
  paymentError,
  paymentSuccessDetails,
  paymentMethodTab,
  setPaymentMethodTab,
  telebirrPhone,
  setTelebirrPhone,
  cbePhone,
  setCbePhone,
  cardHolder,
  setCardHolder,
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvv,
  setCardCvv,
  onCompletePayment,
  onFinishAndAccessPass,
  onRetreatToBranchPlans,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-border w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto animate-scaleUp">
        {/* Top athletic accent stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-primary to-amber-400" />

        {/* Close Button (disabled while processing) */}
        {paymentStep !== 'processing' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text transition p-2 rounded-lg"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* STEP 1: PAYMENT FORM */}
        {paymentStep === 'form' && (
          <div>
            {/* Header with Chapa Gateway Branding */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-black text-lg">
                  C
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-text uppercase tracking-tight">
                      Chapa Secure Checkout
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">SWEATBOX Fitness Club • Addis Ababa, Ethiopia</p>
                </div>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-border flex items-center justify-between mb-5">
              <div>
                <span className="text-[11px] text-text-muted block font-semibold uppercase">Membership Tier</span>
                <h4 className="font-bold text-text text-sm sm:text-base uppercase">{checkoutData.planName}</h4>
                <span className="font-mono text-[10px] text-text-muted">Ref: {checkoutData.txRef}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-text-muted block font-semibold uppercase">Total Due</span>
                <div className="text-2xl font-black text-primary">
                  {checkoutData.amount.toLocaleString()} <span className="text-xs font-semibold text-text">ETB</span>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {paymentError && (
              <div className="mb-4 p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-semibold">{paymentError}</span>
                </div>
                {onRetreatToBranchPlans && (
                  <button
                    type="button"
                    onClick={onRetreatToBranchPlans}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-white font-bold text-xs transition border border-rose-700/60 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>← Retreat to Branch & Plan Selection</span>
                  </button>
                )}
              </div>
            )}

            {/* Change Branch or Plan Link */}
            {onRetreatToBranchPlans && (
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={onRetreatToBranchPlans}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>← Change Branch or Tier</span>
                </button>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-text uppercase tracking-wide mb-2.5">
                Select Ethiopian Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethodTab('telebirr')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs font-bold min-h-[58px] ${
                    paymentMethodTab === 'telebirr'
                      ? 'border-primary bg-primary/10 text-text shadow-md shadow-primary/10'
                      : 'border-border bg-charcoal-900 text-text-muted hover:text-text hover:border-border/80'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-sm">
                    📱
                  </div>
                  <span>Telebirr</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethodTab('cbe')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs font-bold min-h-[58px] ${
                    paymentMethodTab === 'cbe'
                      ? 'border-purple-500 bg-purple-500/10 text-text shadow-md shadow-purple-500/10'
                      : 'border-border bg-charcoal-900 text-text-muted hover:text-text hover:border-border/80'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                    🏦
                  </div>
                  <span>CBE Birr</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethodTab('card')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-xs font-bold min-h-[58px] ${
                    paymentMethodTab === 'card'
                      ? 'border-blue-500 bg-blue-500/10 text-text shadow-md shadow-blue-500/10'
                      : 'border-border bg-charcoal-900 text-text-muted hover:text-text hover:border-border/80'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                    💳
                  </div>
                  <span>Card</span>
                </button>
              </div>
            </div>

            {/* Method-specific Inputs */}
            <form onSubmit={onCompletePayment} className="space-y-4">
              {paymentMethodTab === 'telebirr' && (
                <div className="space-y-3 p-4 rounded-2xl bg-charcoal-900 border border-border">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1.5">
                      Telebirr Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={telebirrPhone}
                        onChange={(e) => setTelebirrPhone(e.target.value)}
                        placeholder="+251 911 234 567 or 09..."
                        className="w-full bg-charcoal-950 border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    ⚡ Enter your Ethio telecom mobile number. You will receive an instant payment authorization prompt on your handset.
                  </p>
                </div>
              )}

              {paymentMethodTab === 'cbe' && (
                <div className="space-y-3 p-4 rounded-2xl bg-charcoal-900 border border-border">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1.5">
                      CBE Birr Mobile / Account Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={cbePhone}
                        onChange={(e) => setCbePhone(e.target.value)}
                        placeholder="+251 9xx xxx xxx or 1000..."
                        className="w-full bg-charcoal-950 border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    🏛️ Commercial Bank of Ethiopia direct debit. Instant verification through CBE Birr integration.
                  </p>
                </div>
              )}

              {paymentMethodTab === 'card' && (
                <div className="space-y-3 p-4 rounded-2xl bg-charcoal-900 border border-border">
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Abebe Bikila"
                      className="w-full bg-charcoal-950 border border-border rounded-xl px-3.5 py-2 text-sm text-text focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text mb-1">
                      Card Number (Visa / Mastercard)
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4111 2222 3333 4444"
                        className="w-full bg-charcoal-950 border border-border rounded-xl pl-10 pr-3.5 py-2 text-sm text-text font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full bg-charcoal-950 border border-border rounded-xl px-3.5 py-2 text-sm text-text font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-charcoal-950 border border-border rounded-xl px-3.5 py-2 text-sm text-text font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Direct Link to Chapa if Hosted URL provided */}
              {checkoutData.checkoutUrl && (
                <button
                  type="button"
                  onClick={() => {
                    if (checkoutData.checkoutUrl) {
                      window.location.href = checkoutData.checkoutUrl;
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Proceed to Official Chapa Gateway ({checkoutData.amount.toLocaleString()} ETB)</span>
                </button>
              )}

              {/* Sticky bottom pay button (>= 44px touch target) */}
              <div className="sticky bottom-0 pt-2 bg-surface">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center font-black text-sm uppercase shadow-xl shadow-primary/25"
                >
                  <ShieldCheck className="w-5 h-5 mr-1.5" />
                  <span>
                    Pay {checkoutData.amount.toLocaleString()} ETB with{' '}
                    {paymentMethodTab === 'telebirr' ? 'Telebirr' : paymentMethodTab === 'cbe' ? 'CBE Birr' : 'Card'}
                  </span>
                </Button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit Bank Grade Encryption
              </span>
              <span>Powered by Chapa</span>
            </div>
          </div>
        )}

        {/* STEP 2: PROCESSING ANIMATION */}
        {paymentStep === 'processing' && (
          <div className="py-12 px-4 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary border-t-transparent animate-spin mx-auto flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-charcoal-900 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-text uppercase tracking-tight">
                Processing {paymentMethodTab === 'telebirr' ? 'Telebirr' : paymentMethodTab === 'cbe' ? 'CBE Birr' : 'Card'} Payment...
              </h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                Communicating with Chapa payment gateway and confirming HMAC-SHA256 signature verification...
              </p>
            </div>
            <div className="p-3 max-w-xs mx-auto rounded-xl bg-charcoal-900 border border-border text-[11px] text-text-muted font-mono">
              TxRef: {checkoutData.txRef}
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT SUCCESS CONFIRMATION */}
        {paymentStep === 'success' && paymentSuccessDetails && (
          <div className="py-6 px-2 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-text uppercase tracking-tight">Payment Confirmed!</h3>
              <p className="text-xs text-emerald-400 font-bold mt-1">
                Your membership is now ACTIVE with full gym facility access.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 rounded-2xl bg-charcoal-900 border border-border text-xs text-text-muted space-y-2.5 text-left">
              <div className="flex justify-between py-1 border-b border-border/60">
                <span>Plan Activated</span>
                <span className="font-bold text-text uppercase">{paymentSuccessDetails.planName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span>Amount Paid</span>
                <span className="font-black text-primary text-sm">
                  {paymentSuccessDetails.amount.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span>Payment Method</span>
                <span className="font-medium text-text">{paymentSuccessDetails.method}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span>Transaction Ref</span>
                <span className="font-mono text-[11px] text-text truncate max-w-[200px]">
                  {paymentSuccessDetails.txRef}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Timestamp (E.C.)</span>
                <span className="text-text font-mono">{paymentSuccessDetails.date}</span>
              </div>
            </div>

            {/* Email Notice */}
            <div className="p-3.5 rounded-xl bg-charcoal-900 border border-border flex items-center gap-3 text-xs text-text-muted text-left">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <span>
                A payment receipt has been dispatched to your email address. Mailpit is running at port 8025.
              </span>
            </div>

            {/* Open Member QR Pass Button */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={onFinishAndAccessPass}
              className="w-full justify-center font-black text-sm uppercase shadow-xl shadow-primary/25"
            >
              <Sparkles className="w-5 h-5 mr-1.5" />
              <span>Activate Membership & Access QR Pass</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
