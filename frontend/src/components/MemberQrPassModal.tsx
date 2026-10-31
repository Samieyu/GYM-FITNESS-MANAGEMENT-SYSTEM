import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  History, 
  CheckCircle2, 
  XCircle, 
  Dumbbell 
} from 'lucide-react';
import { fetchMyQrPassApi, fetchMyCheckinHistoryApi, QrPassData, CheckinRecordItem } from '../api/checkins';
import { formatEthiopianDate, formatEthiopianTime } from '../utils/ethiopianCalendar';

interface MemberQrPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  memberEmail: string;
}

export const MemberQrPassModal: React.FC<MemberQrPassModalProps> = ({
  isOpen,
  onClose,
  memberName,
  memberEmail,
}) => {
  const [qrData, setQrData] = useState<QrPassData | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pass' | 'history'>('pass');
  const [history, setHistory] = useState<CheckinRecordItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  const loadQrPass = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMyQrPassApi();
      setQrData(data);
      // Calculate remaining seconds if timestamp provided
      const elapsed = Math.floor((Date.now() - data.timestamp) / 1000);
      const remaining = Math.max(1, 60 - elapsed);
      setSecondsRemaining(remaining);
    } catch (err: any) {
      setError(err.message || 'Failed to generate dynamic QR token');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await fetchMyCheckinHistoryApi(20);
      setHistory(data);
    } catch (err: any) {
      console.error('Failed to load check-in history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Initial load when modal opens
  useEffect(() => {
    if (isOpen) {
      loadQrPass();
      loadHistory();
    } else {
      setQrData(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // 60-Second Countdown & Auto-Refresh Interval (Business Rule 7)
  useEffect(() => {
    if (!isOpen || !qrData) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Token expired, immediately request a new signed rotating token
          loadQrPass();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, qrData?.token]);

  if (!isOpen) return null;

  // Percentage for the countdown circle
  const progressPercent = (secondsRemaining / 60) * 100;
  const strokeDashoffset = 100 - progressPercent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-charcoal-850 border border-charcoal-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition p-1.5 rounded-full hover:bg-charcoal-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-primary/15 border border-orange-primary/30 flex items-center justify-center text-orange-primary">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Member Digital Pass
              <span className="px-2 py-0.5 rounded-full bg-orange-primary/20 text-orange-primary text-[10px] font-bold border border-orange-primary/30 uppercase">
                Dynamic QR
              </span>
            </h3>
            <p className="text-xs text-gray-400">Scan at gym reception or turnstile</p>
          </div>
        </div>

        {/* Tabs: QR Pass vs. Attendance History */}
        <div className="flex rounded-xl bg-charcoal-900 p-1 border border-charcoal-800 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('pass')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'pass'
                ? 'bg-orange-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Digital Pass
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              loadHistory();
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-orange-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Attendance Log
          </button>
        </div>

        {/* VIEW 1: DYNAMIC ROTATING QR CODE */}
        {activeTab === 'pass' && (
          <div className="space-y-4">
            {/* Membership Status Badge */}
            <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                  Membership Tier
                </span>
                <span className="text-sm font-bold text-white">
                  {qrData?.membership ? qrData.membership.plan_name : 'No Active Membership'}
                </span>
                {qrData?.membership && (
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Valid until (E.C.): <span className="text-orange-primary font-medium">{formatEthiopianDate(qrData.membership.end_date)}</span>
                  </span>
                )}
              </div>

              {qrData?.membership ? (
                <span className="px-2.5 py-1 rounded-full bg-green-950 text-green-400 border border-green-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> INACTIVE
                </span>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* QR Code Presentation Box */}
            <div className="relative p-6 rounded-3xl bg-gradient-to-b from-charcoal-900 to-charcoal-950 border border-charcoal-700/80 shadow-inner flex flex-col items-center justify-center">
              {isLoading && !qrData ? (
                <div className="w-56 h-56 flex flex-col items-center justify-center text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-orange-primary mb-2" />
                  <span className="text-xs">Generating secure token...</span>
                </div>
              ) : qrData ? (
                <div className="relative flex flex-col items-center">
                  {/* Clean High-Contrast QR Code */}
                  <div className="p-3.5 bg-white rounded-2xl shadow-xl shadow-black/60 border-2 border-white/80">
                    <QRCodeSVG
                      value={qrData.token}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Member Name Tag under QR */}
                  <div className="mt-4 text-center">
                    <h4 className="text-sm font-bold text-white tracking-wide">{memberName}</h4>
                    <p className="text-[11px] text-gray-400">{memberEmail}</p>
                  </div>
                </div>
              ) : (
                <div className="w-56 h-56 flex flex-col items-center justify-center text-gray-400">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                  <span className="text-xs">Pass unavailable</span>
                </div>
              )}

              {/* Dynamic 60s Countdown Bar & Spinner */}
              <div className="mt-5 w-full flex items-center justify-between px-2 pt-3 border-t border-charcoal-800 text-xs">
                <div className="flex items-center gap-2">
                  {/* Circular SVG Countdown Ring */}
                  <div className="relative w-7 h-7 flex items-center justify-center">
                    <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-charcoal-750"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`${
                          secondsRemaining <= 10 ? 'text-red-500' : 'text-orange-primary'
                        } transition-all duration-1000 ease-linear`}
                        strokeDasharray="100, 100"
                        strokeDashoffset={strokeDashoffset}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[9px] font-bold text-white">
                      {secondsRemaining}
                    </span>
                  </div>

                  <span className="text-gray-300 font-medium text-[11px]">
                    Expires in <strong className="text-orange-primary">{secondsRemaining}s</strong>
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={loadQrPass}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-orange-primary transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Digital Entrance Pass Instructions */}
            <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-xs text-gray-400 space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 text-orange-primary font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Titan Digital Entrance Pass
              </div>
              <p className="text-[11px] text-gray-300">
                Hold your device up to the front desk optical scanner upon arrival. This dynamic QR pass automatically updates every 60 seconds for secure facility entry.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: ATTENDANCE HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Past check-in records (Ethiopian Calendar):</span>
              <button
                type="button"
                disabled={isLoadingHistory}
                onClick={loadHistory}
                className="text-[11px] text-orange-primary hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingHistory ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-orange-primary" />
                Loading attendance history...
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {formatEthiopianDate(item.checkin_time)}
                        </span>
                        <span className="text-gray-400 font-mono text-[11px]">
                          {formatEthiopianTime(item.checkin_time)}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 capitalize block mt-0.5">
                        {item.checkin_type.replace('_', ' ')} • {item.plan_name || 'Gym Access'}
                      </span>
                      {item.denial_reason && (
                        <span className="text-[10px] text-red-400 block mt-0.5 font-medium">
                          Reason: {item.denial_reason}
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'allowed'
                          ? 'bg-green-950 text-green-400 border border-green-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 text-xs">
                No check-in history found yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
