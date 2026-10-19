import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  CameraOff, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ShieldAlert, 
  Search, 
  Clock, 
  UserCheck, 
  CheckCheck,
  Zap
} from 'lucide-react';
import { 
  scanCheckinApi, 
  fetchRecentCheckinsApi, 
  ScanResultData, 
  CheckinRecordItem 
} from '../api/checkins';

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
          // Pause camera and process checkin
          stopCameraScanner();
          await handleProcessScan(decodedText, 'reception_qr');
        },
        () => {
          // Frame without QR code - ignore
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
      // Reload recent feed
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
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Front Desk QR Scanner & Check-In
              <span className="px-2 py-0.5 rounded-full bg-green-950 text-green-400 text-[10px] font-bold border border-green-800 uppercase">
                Rules 7, 8, 9 Live
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Staff Operator: <strong className="text-gray-200">{staffName}</strong>
            </p>
          </div>
        </div>

        {/* SCANNER VIEWPORT & CAMERA CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Left: Camera Scanner Box */}
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-primary flex items-center gap-1.5">
                  <Camera className="w-4 h-4" /> Live Camera Scanner
                </span>
                {isCameraActive && (
                  <span className="flex items-center gap-1 text-[10px] text-green-400 font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Scanning...
                  </span>
                )}
              </div>

              {/* Camera Scanner Container */}
              <div 
                id={scannerContainerId} 
                className={`w-full h-48 bg-charcoal-950 rounded-xl overflow-hidden border border-charcoal-700 flex items-center justify-center text-center text-xs text-gray-400 relative ${
                  !isCameraActive ? 'p-4' : ''
                }`}
              >
                {!isCameraActive && (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Camera className="w-8 h-8 text-gray-500" />
                    <span>Camera is currently off. Click below to activate or use manual entry.</span>
                  </div>
                )}
              </div>

              {cameraError && (
                <p className="text-[11px] text-amber-400 mt-2 bg-amber-950/40 p-2 rounded-lg border border-amber-800">
                  {cameraError}
                </p>
              )}
            </div>

            <div className="mt-4">
              {!isCameraActive ? (
                <button
                  type="button"
                  onClick={startCameraScanner}
                  className="w-full py-2.5 rounded-xl bg-orange-primary hover:bg-orange-hover text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-primary/20"
                >
                  <Camera className="w-4 h-4" /> Start Camera Scan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCameraScanner}
                  className="w-full py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <CameraOff className="w-4 h-4" /> Stop Camera
                </button>
              )}
            </div>
          </div>

          {/* Right: Manual Token or Member ID Input */}
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-primary flex items-center gap-1.5 mb-3">
                <Search className="w-4 h-4" /> Manual Check-In Entry
              </span>
              <p className="text-xs text-gray-400 mb-3">
                Paste rotating QR token, scan with barcode gun, or enter member UUID.
              </p>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Enter QR token or Member ID..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-orange-primary font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isScanning || !manualInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-charcoal-800 hover:bg-orange-primary border border-charcoal-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isScanning ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-orange-primary" />
                  ) : (
                    <Zap className="w-4 h-4 text-orange-primary" />
                  )}
                  Verify & Process Check-In
                </button>
              </form>
            </div>

            {/* Quick Helper Tips */}
            <div className="mt-4 pt-3 border-t border-charcoal-800 text-[11px] text-gray-400">
              <span className="text-gray-300 font-semibold block mb-1">Supported Scan Formats:</span>
              <span>• HMAC-SHA256 60s Token (Rule 7)</span><br />
              <span>• Registered Member UUID</span>
            </div>
          </div>
        </div>

        {/* SCAN RESULT BANNER (ALLOWED VS. DENIED) */}
        {scanErrorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/90 border border-red-700 text-xs text-red-200 flex items-start justify-between gap-3 shadow-lg shadow-red-950/50 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold text-white block">SCAN FAILED / REJECTED</strong>
                <p className="mt-1 leading-relaxed text-red-300">{scanErrorMessage}</p>
                <p className="mt-1 text-[10px] text-gray-400">Business Rule 7: Expired (&gt;60s) or tampered tokens are rejected.</p>
              </div>
            </div>
            <button 
              onClick={() => setScanErrorMessage(null)} 
              className="text-red-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {lastScanResult && (
          <div
            className={`mb-6 p-5 rounded-2xl border shadow-xl animate-fadeIn ${
              lastScanResult.status === 'allowed'
                ? 'bg-green-950/50 border-green-600/80'
                : 'bg-red-950/60 border-red-600/80'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {lastScanResult.status === 'allowed' ? (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    {lastScanResult.status === 'allowed' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                  </h4>
                  <p className="text-xs text-gray-300">{lastScanResult.message}</p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  lastScanResult.status === 'allowed'
                    ? 'bg-green-900 text-green-200 border border-green-700'
                    : 'bg-red-900 text-red-200 border border-red-700'
                }`}
              >
                {lastScanResult.status}
              </span>
            </div>

            {/* Member Details in Result Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-charcoal-900/80 border border-charcoal-800 text-xs mt-3">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Member Name</span>
                <span className="font-bold text-white">
                  {lastScanResult.member.firstName} {lastScanResult.member.lastName}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Plan</span>
                <span className="font-medium text-orange-primary">
                  {lastScanResult.membership?.plan_name || 'No Active Plan'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Plan Expiry</span>
                <span className="text-gray-300">
                  {lastScanResult.membership?.end_date || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Time</span>
                <span className="text-gray-300 font-mono text-[11px]">
                  {new Date(lastScanResult.checkinTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Denial Reason & Receptionist Override Action (Business Rule 9) */}
            {lastScanResult.status === 'denied' && (
              <div className="mt-3 p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-red-400 block">Denial Reason (Rule 8 / 9)</span>
                  <span className="text-gray-200 font-medium">{lastScanResult.denialReason}</span>
                  {lastScanResult.minutesSinceLastCheckin !== undefined && (
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      Last check-in was {lastScanResult.minutesSinceLastCheckin} minutes ago (2-hour rule).
                    </span>
                  )}
                </div>

                {/* Staff Override button */}
                {lastScanResult.isRepeatCheckin && (
                  <button
                    type="button"
                    disabled={isOverriding}
                    onClick={handleOverrideCheckin}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-1.5 shrink-0 shadow-lg shadow-amber-950/40 disabled:opacity-50"
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-primary" /> Live Check-In Attendance Feed (Today)
            </h4>
            <button
              type="button"
              disabled={isLoadingLogs}
              onClick={loadRecentLogs}
              className="text-[11px] text-orange-primary hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} /> Refresh Feed
            </button>
          </div>

          <div className="rounded-xl border border-charcoal-800 overflow-hidden bg-charcoal-900">
            {isLoadingLogs ? (
              <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-orange-primary" />
                Loading attendance feed...
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-charcoal-950/70 text-gray-400 border-b border-charcoal-800 sticky top-0 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Plan</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-800/60 text-gray-300">
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-charcoal-800/40 transition">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                          {new Date(log.checkin_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-white block">
                            {log.member_first_name} {log.member_last_name}
                          </span>
                          <span className="text-[10px] text-gray-500">{log.member_email}</span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-orange-primary">
                          {log.plan_name || 'Gym Entry'}
                        </td>
                        <td className="py-2.5 px-3 capitalize text-gray-400 text-[11px]">
                          {log.checkin_type.replace('_', ' ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.status === 'allowed'
                                ? 'bg-green-950 text-green-400 border border-green-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {log.status}
                          </span>
                          {log.denial_reason && (
                            <span className="block text-[10px] text-red-400/90 mt-0.5 max-w-xs truncate" title={log.denial_reason}>
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
              <div className="py-8 text-center text-gray-500 text-xs">
                No check-in events recorded today yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
