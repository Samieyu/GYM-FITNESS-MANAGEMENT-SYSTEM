import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  CameraOff, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldAlert, 
  Search, 
  Clock, 
  Zap,
  Calendar
} from 'lucide-react';
import { 
  scanCheckinApi, 
  fetchRecentCheckinsApi, 
  ScanResultData, 
  CheckinRecordItem 
} from '../api/checkins';
import { formatEthiopianDate, formatEthiopianTime } from '../utils/ethiopianCalendar';

interface ReceptionScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
}

export const ReceptionScannerModal: React.FC<ReceptionScannerModalProps> = ({
  isOpen,
  onClose,
  staffName,
}) => {
  // Scanner state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Scan Result Modal / Card
  const [lastScanResult, setLastScanResult] = useState<ScanResultData | null>(null);
  const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null);
  const [isOverriding, setIsOverriding] = useState<boolean>(false);

  // Live Attendance Log
  const [recentLogs, setRecentLogs] = useState<CheckinRecordItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'gym-reception-qr-reader';

  const loadRecentLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const records = await fetchRecentCheckinsApi(25);
      setRecentLogs(records);
    } catch (err: any) {
      console.error('Failed to load recent checkins:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRecentLogs();
    } else {
      stopCameraScanner();
      setLastScanResult(null);
      setScanErrorMessage(null);
      setManualInput('');
    }
  }, [isOpen]);

  const startCameraScanner = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          stopCameraScanner();
          await handleProcessScan(decodedText, 'reception_qr');
        },
        () => {
          // Frame without QR code
        }
      );

      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(err.message || 'Camera access denied or unavailable. You can use manual entry below.');
      setIsCameraActive(false);
    }
  };

  const stopCameraScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      console.warn('Error stopping camera:', err);
    } finally {
      setIsCameraActive(false);
    }
  };

  const handleProcessScan = async (
    dataToScan: string, 
    type: 'reception_qr' | 'reception_manual' = 'reception_qr',
    allowOverride = false
  ) => {
    if (!dataToScan.trim()) return;

    setIsScanning(true);
    setScanErrorMessage(null);
    try {
      const result = await scanCheckinApi({
        scannedData: dataToScan.trim(),
        checkinType: type,
        allowOverride,
      });

      setLastScanResult(result);
      await loadRecentLogs();
    } catch (err: any) {
      setScanErrorMessage(err.message || 'Check-in scan verification failed');
      setLastScanResult(null);
    } finally {
      setIsScanning(false);
      setIsOverriding(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleProcessScan(manualInput, 'reception_manual');
  };

  const handleOverrideCheckin = async () => {
    if (!lastScanResult?.member?.id) return;
    setIsOverriding(true);
    await handleProcessScan(lastScanResult.member.id, 'reception_manual', true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-surface border border-border w-full max-w-3xl rounded-3xl p-6 md:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto text-text transition-colors"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanner-modal-title"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-text transition p-1.5 rounded-full hover:bg-background"
          aria-label="Close scanner modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 id="scanner-modal-title" className="text-xl font-bold text-text flex items-center gap-2">
              Front Desk QR Scanner & Entrance Gate
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 uppercase">
                Turnstile Terminal
              </span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5 flex flex-wrap items-center gap-2">
              <span>Staff Operator: <strong className="text-text">{staffName}</strong></span>
              <span className="text-border">•</span>
              <span className="font-medium text-text flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" />
                {formatEthiopianDate(new Date().toISOString())}
              </span>
            </p>
          </div>
        </div>

        {/* SCANNER VIEWPORT & CAMERA CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Left: Camera Scanner Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Camera className="w-4 h-4" /> Live Optical Viewfinder
                </span>
                {isCameraActive && (
                  <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Active
                  </span>
                )}
              </div>

              {/* Camera Scanner Viewport */}
              <div 
                id={scannerContainerId} 
                className={`w-full h-48 bg-surface rounded-xl overflow-hidden border border-border flex items-center justify-center text-center text-xs text-text-muted relative ${
                  !isCameraActive ? 'p-4' : ''
                }`}
              >
                {!isCameraActive && (
                  <div className="flex flex-col items-center justify-center gap-2 text-text-muted">
                    <Camera className="w-8 h-8 opacity-40 text-primary" />
                    <span className="max-w-[200px]">Camera standby. Click below to activate turnstile scanner or use manual token entry.</span>
                  </div>
                )}
              </div>

              {cameraError && (
                <p className="text-[11px] text-rose-500 mt-2 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 leading-relaxed">
                  {cameraError}
                </p>
              )}
            </div>

            <div className="mt-4">
              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={startCameraScanner}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <Camera className="w-4 h-4" /> Start Camera Scanner
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCameraScanner}
                  className="w-full py-2.5 rounded-xl bg-surface hover:bg-background border border-border text-text text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <CameraOff className="w-4 h-4" /> Stop Camera
                </button>
              )}
            </div>
          </div>

          {/* Right: Manual Token or Member ID Input */}
          <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2">
                <Search className="w-4 h-4" /> Manual Check-In Entry
              </span>
              <p className="text-xs text-text-muted mb-3 leading-relaxed">
                Scan with handheld barcode gun, paste 60s rotating token, or enter member ID.
              </p>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Enter rotating token or member UUID..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-text placeholder-text-muted text-xs focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isScanning || !manualInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-extrabold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-98"
                >
                  {isScanning ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Verify & Process Check-In
                </button>
              </form>
            </div>

            {/* Quick Helper Tips */}
            <div className="mt-4 pt-3 border-t border-border text-[11px] text-text-muted">
              <span className="text-text font-semibold block mb-1">Supported Formats:</span>
              <span>• 60-Second Rotating HMAC Pass</span><br />
              <span>• Front Desk Registered Member UUID</span>
            </div>
          </div>
        </div>

        {/* SCAN RESULT BANNER (ALLOWED VS. DENIED) */}
        {scanErrorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 flex items-start justify-between gap-3 shadow-sm animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold block">SCAN FAILED / REJECTED</strong>
                <p className="mt-1 leading-relaxed">{scanErrorMessage}</p>
                <p className="mt-1 text-[10px] text-text-muted">Expired (&gt;60s) or tampered tokens are rejected by front desk security policy.</p>
              </div>
            </div>
            <button 
              onClick={() => setScanErrorMessage(null)} 
              className="text-text-muted hover:text-text p-1"
              aria-label="Dismiss scan error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {lastScanResult && (
          <div
            className={`mb-6 p-5 rounded-2xl border shadow-sm animate-fadeIn ${
              lastScanResult.status === 'allowed'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-text'
                : 'bg-rose-500/10 border-rose-500/30 text-text'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {lastScanResult.status === 'allowed' ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-extrabold text-text">
                    {lastScanResult.status === 'allowed' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                  </h3>
                  <p className="text-xs text-text-muted">{lastScanResult.message}</p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  lastScanResult.status === 'allowed'
                    ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                }`}
              >
                {lastScanResult.status}
              </span>
            </div>

            {/* Member Details in Result Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-surface border border-border text-xs mt-3">
              <div>
                <span className="text-[10px] text-text-muted uppercase font-semibold block">Member Name</span>
                <span className="font-bold text-text">
                  {lastScanResult.member.firstName} {lastScanResult.member.lastName}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase font-semibold block">Tier Plan</span>
                <span className="font-bold text-primary">
                  {lastScanResult.membership?.plan_name || 'No Active Plan'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase font-semibold block">Expiry (E.C.)</span>
                <span className="text-text font-medium">
                  {formatEthiopianDate(lastScanResult.membership?.end_date)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase font-semibold block">Timestamp</span>
                <span className="text-text-muted font-mono text-[11px]">
                  {formatEthiopianTime(lastScanResult.checkinTime)}
                </span>
              </div>
            </div>

            {/* Denial Reason & Receptionist Override Action */}
            {lastScanResult.status === 'denied' && (
              <div className="mt-3 p-3.5 rounded-xl bg-surface border border-border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-500 block">Denial Reason</span>
                  <span className="text-text font-medium">{lastScanResult.denialReason}</span>
                  {lastScanResult.minutesSinceLastCheckin !== undefined && (
                    <span className="text-[11px] text-text-muted block mt-0.5">
                      Last check-in was {lastScanResult.minutesSinceLastCheckin} minutes ago (Anti-passback cooldown).
                    </span>
                  )}
                </div>

                {/* Staff Override button */}
                {lastScanResult.isRepeatCheckin && (
                  <button
                    type="button"
                    disabled={isOverriding}
                    onClick={handleOverrideCheckin}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {isOverriding ? 'Overriding...' : 'Override & Allow Entry'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* LIVE RECENT ATTENDANCE FEED */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" /> Live Check-In Attendance Feed (Ethiopian Calendar)
            </h3>
            <button
              type="button"
              disabled={isLoadingLogs}
              onClick={loadRecentLogs}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} /> Refresh Feed
            </button>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden bg-background">
            {isLoadingLogs ? (
              <div className="py-8 text-center text-text-muted text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                Loading attendance feed...
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface text-text-muted border-b border-border sticky top-0 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Date (E.C.)</th>
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-text">
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-surface/60 transition">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-text-muted whitespace-nowrap">
                          {formatEthiopianTime(log.checkin_time)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-text whitespace-nowrap">
                          {formatEthiopianDate(log.checkin_time)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-text block">
                            {log.member_first_name} {log.member_last_name}
                          </span>
                          <span className="text-[10px] text-text-muted">{log.member_email}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-primary">
                          {log.plan_name || 'Gym Entry'}
                        </td>
                        <td className="py-2.5 px-3 capitalize text-text-muted text-[11px]">
                          {log.checkin_type.replace('_', ' ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.status === 'allowed'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            }`}
                          >
                            {log.status}
                          </span>
                          {log.denial_reason && (
                            <span className="block text-[10px] text-rose-500/90 mt-0.5 max-w-xs truncate" title={log.denial_reason}>
                              {log.denial_reason}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-text-muted text-xs">
                No check-in events recorded today yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
