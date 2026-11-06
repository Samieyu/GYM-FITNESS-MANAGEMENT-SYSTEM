import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  BarChart3,
  Download,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  CreditCard,
  Wrench,
  Clock,
  Calendar,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  FinancialOverview,
  AttendanceOverview,
  fetchFinancialOverviewApi,
  fetchAttendanceOverviewApi,
  downloadAttendanceCsv,
  downloadMembersCsv,
  downloadFinancialCsv,
} from '../api/analytics';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'attendance' | 'exports'>('financial');
  const [financialData, setFinancialData] = useState<FinancialOverview | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exportingType, setExportingType] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fin, att] = await Promise.all([
        fetchFinancialOverviewApi(),
        fetchAttendanceOverviewApi(),
      ]);
      setFinancialData(fin);
      setAttendanceData(att);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'attendance' | 'members' | 'financial') => {
    setExportingType(type);
    try {
      if (type === 'attendance') {
        await downloadAttendanceCsv();
      } else if (type === 'members') {
        await downloadMembersCsv();
      } else if (type === 'financial') {
        await downloadFinancialCsv();
      }
    } catch (err: any) {
      alert(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setExportingType(null);
    }
  };

  if (!isOpen) return null;

  const todayIso = new Date().toISOString();
  const todayEth = formatEthiopianDate(todayIso);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="analytics-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 md:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-surface border border-border text-text rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-border bg-surface-elevated/70 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="analytics-modal-title" className="text-lg sm:text-xl font-black text-text tracking-tight">
                  SWEATBOX Intelligence & Analytics
                </h2>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                  {todayEth} E.C.
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Financial revenue metrics, member entrance throughput, and audited CSV exports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text rounded-xl hover:bg-surface-elevated border border-border/50 transition disabled:opacity-50"
              title="Refresh Analytics"
              aria-label="Refresh analytics data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-text-muted hover:text-text rounded-xl hover:bg-surface-elevated border border-border/50 transition"
              aria-label="Close analytics modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border px-5 sm:px-7 py-2 bg-surface-elevated/40 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-xl font-bold text-xs transition min-h-[44px] shrink-0 ${
              activeTab === 'financial'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted hover:text-text hover:bg-surface-elevated/70'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Financial & Revenue</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-xl font-bold text-xs transition min-h-[44px] shrink-0 ${
              activeTab === 'attendance'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted hover:text-text hover:bg-surface-elevated/70'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Attendance & Scans</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exports')}
            className={`flex items-center space-x-2 py-2 px-4 rounded-xl font-bold text-xs transition min-h-[44px] shrink-0 ${
              activeTab === 'exports'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-text-muted hover:text-text hover:bg-surface-elevated/70'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV Exports & Reports</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center space-x-3 text-xs font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && !financialData && !attendanceData ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs font-medium">Calculating gym performance & financial metrics...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: FINANCIAL OVERVIEW */}
              {activeTab === 'financial' && financialData && (
                <div className="space-y-6">
                  {/* Top KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-text-muted mb-2">
                        <span className="text-[11px] uppercase tracking-wider font-bold">Total Revenue</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-text">
                          {financialData.totalRevenue.toLocaleString()} <span className="text-xs text-primary font-bold">ETB</span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          {financialData.successfulTransactions} successful payments
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-text-muted mb-2">
                        <span className="text-[11px] uppercase tracking-wider font-bold">Active Memberships</span>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-text">
                          {financialData.activeMembershipsCount}
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          Currently paying active subscribers
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-text-muted mb-2">
                        <span className="text-[11px] uppercase tracking-wider font-bold">Maintenance Cost</span>
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <Wrench className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-rose-500">
                          {financialData.maintenanceExpense.toLocaleString()} <span className="text-xs text-rose-400 font-bold">ETB</span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          Logged equipment repairs & parts
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-text-muted mb-2">
                        <span className="text-[11px] uppercase tracking-wider font-bold">Net Gym Margin</span>
                        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-emerald-500">
                          {financialData.netMargin.toLocaleString()} <span className="text-xs text-emerald-400 font-bold">ETB</span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                          Gross revenue minus maintenance
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Channel Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-surface-elevated/50 border border-border flex items-center space-x-3 shadow-sm">
                      <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-muted">Online Chapa Gateway</p>
                        <p className="text-lg font-black text-text">
                          {financialData.chapaRevenue.toLocaleString()} <span className="text-xs font-normal text-text-muted">ETB</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-elevated/50 border border-border flex items-center space-x-3 shadow-sm">
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-muted">Cash at Reception Desk</p>
                        <p className="text-lg font-black text-text">
                          {financialData.cashRevenue.toLocaleString()} <span className="text-xs font-normal text-text-muted">ETB</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-elevated/50 border border-border flex items-center space-x-3 shadow-sm">
                      <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-muted">Bank Transfer / Telebirr Direct</p>
                        <p className="text-lg font-black text-text">
                          {financialData.bankTransferRevenue.toLocaleString()} <span className="text-xs font-normal text-text-muted">ETB</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Revenue History */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-surface-elevated/50 border border-border shadow-sm">
                    <h3 className="text-sm font-bold text-text mb-4 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Monthly Revenue Trend (Last 6 Months)</span>
                    </h3>
                    {financialData.revenueByMonth.length === 0 ? (
                      <p className="text-xs text-text-muted py-6 text-center">No payment history recorded yet.</p>
                    ) : (
                      <div className="space-y-3.5">
                        {financialData.revenueByMonth.map((item, idx) => {
                          const maxAmount = Math.max(...financialData.revenueByMonth.map((m) => m.amount), 1);
                          const percentage = Math.round((item.amount / maxAmount) * 100);
                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-text">{item.month}</span>
                                <span className="text-primary font-bold">
                                  {item.amount.toLocaleString()} ETB <span className="text-text-muted font-normal">({item.transactions} txns)</span>
                                </span>
                              </div>
                              <div className="w-full bg-surface-elevated rounded-full h-2.5 overflow-hidden border border-border">
                                <div
                                  className="bg-gradient-to-r from-primary to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max(percentage, 5)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ATTENDANCE OVERVIEW */}
              {activeTab === 'attendance' && attendanceData && (
                <div className="space-y-6">
                  {/* Top Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border shadow-sm">
                      <p className="text-[11px] text-text-muted uppercase tracking-wider font-bold">Total Scans</p>
                      <p className="text-2xl font-black text-text mt-1">{attendanceData.totalCheckins}</p>
                      <p className="text-xs text-text-muted mt-1">QR check-in attempts</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border shadow-sm">
                      <div className="flex items-center justify-between text-text-muted">
                        <span className="text-[11px] uppercase tracking-wider font-bold">Granted</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-2xl font-black text-emerald-500 mt-1">{attendanceData.grantedCount}</p>
                      <p className="text-xs text-text-muted mt-1">
                        {attendanceData.totalCheckins > 0
                          ? `${Math.round((attendanceData.grantedCount / attendanceData.totalCheckins) * 100)}% entrance rate`
                          : '0% entrance rate'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border shadow-sm">
                      <div className="flex items-center justify-between text-text-muted">
                        <span className="text-[11px] uppercase tracking-wider font-bold">Denied</span>
                        <XCircle className="w-4 h-4 text-rose-500" />
                      </div>
                      <p className="text-2xl font-black text-rose-500 mt-1">{attendanceData.deniedCount}</p>
                      <p className="text-xs text-text-muted mt-1">Expired, inactive or duplicates</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-elevated/60 border border-border shadow-sm">
                      <p className="text-[11px] text-text-muted uppercase tracking-wider font-bold">Denial Rate</p>
                      <p className="text-2xl font-black text-primary mt-1">{attendanceData.denialRate}%</p>
                      <p className="text-xs text-text-muted mt-1">Of total scan requests</p>
                    </div>
                  </div>

                  {/* Hourly Traffic Distribution */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-surface-elevated/50 border border-border shadow-sm">
                    <h3 className="text-sm font-bold text-text mb-3 flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Facility Traffic Density (06:00 - 22:00)</span>
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-1.5 pt-2">
                      {attendanceData.hourlyTraffic.map((slot) => {
                        const maxCount = Math.max(...attendanceData.hourlyTraffic.map((t) => t.count), 1);
                        const intensity = slot.count / maxCount;
                        let cellClass = 'bg-surface-elevated text-text-muted border-border';
                        if (intensity > 0.7) {
                          cellClass = 'bg-primary text-primary-foreground font-black border-primary shadow-sm';
                        } else if (intensity > 0.4) {
                          cellClass = 'bg-primary/70 text-primary-foreground font-bold border-primary/80';
                        } else if (intensity > 0) {
                          cellClass = 'bg-primary/20 text-primary font-semibold border-primary/30';
                        }

                        return (
                          <div
                            key={slot.hour}
                            className="flex flex-col items-center justify-between p-1.5 rounded-xl border border-border/80 bg-surface/60 transition hover:scale-105"
                          >
                            <span className="text-[10px] text-text-muted font-mono">
                              {slot.hour}:00
                            </span>
                            <div className={`w-full py-1 mt-1 rounded-lg text-center text-xs font-semibold ${cellClass}`}>
                              {slot.count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Breakdown & Top Members */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top Denial Reasons */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-surface-elevated/50 border border-border shadow-sm">
                      <h4 className="text-sm font-bold text-text mb-3 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        <span>Common Denial Reasons</span>
                      </h4>
                      {attendanceData.topDenialReasons.length === 0 ? (
                        <p className="text-xs text-text-muted py-4">No denied scans recorded.</p>
                      ) : (
                        <div className="space-y-2">
                          {attendanceData.topDenialReasons.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border text-xs"
                            >
                              <span className="text-text font-medium">{item.reason}</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">
                                {item.count} scans
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top Active Athletes */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-surface-elevated/50 border border-border shadow-sm">
                      <h4 className="text-sm font-bold text-text mb-3 flex items-center space-x-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span>Top Active Members</span>
                      </h4>
                      {attendanceData.topActiveMembers.length === 0 ? (
                        <p className="text-xs text-text-muted py-4">No member attendance data available.</p>
                      ) : (
                        <div className="space-y-2">
                          {attendanceData.topActiveMembers.map((member, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border text-xs"
                            >
                              <div>
                                <p className="font-bold text-text">{member.name}</p>
                                <p className="text-[11px] text-text-muted">{member.email}</p>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                                {member.checkinCount} check-ins
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Recent Scans Activity Log */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-surface-elevated/50 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-text flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Live Entrance & Scan Activity (Recent Check-Ins)</span>
                      </h4>
                      <span className="text-[11px] text-text-muted bg-surface px-2.5 py-1 rounded-full border border-border font-medium">
                        Real-Time Log
                      </span>
                    </div>

                    {!attendanceData.recentScans || attendanceData.recentScans.length === 0 ? (
                      <p className="text-xs text-text-muted py-6 text-center">No recent scan activity recorded.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-border text-text-muted">
                              <th className="pb-2.5 font-bold">Member</th>
                              <th className="pb-2.5 font-bold">Time (E.C.)</th>
                              <th className="pb-2.5 font-bold">Status</th>
                              <th className="pb-2.5 font-bold">Access Detail</th>
                              <th className="pb-2.5 font-bold">Check-in Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {attendanceData.recentScans.map((scan) => {
                              const timeStr = new Date(scan.checkinTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              });
                              const ethDate = formatEthiopianDate(scan.checkinTime);
                              return (
                                <tr key={scan.id} className="hover:bg-surface-elevated/40 transition">
                                  <td className="py-2.5 font-bold text-text">
                                    {scan.memberName}
                                    <div className="text-[11px] text-text-muted font-normal">{scan.memberEmail}</div>
                                  </td>
                                  <td className="py-2.5 text-text-muted font-mono text-[11px]">
                                    {ethDate} • {timeStr}
                                  </td>
                                  <td className="py-2.5">
                                    {scan.status === 'allowed' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[11px] border border-emerald-500/20">
                                        <CheckCircle2 className="w-3 h-3" /> Granted
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-bold text-[11px] border border-rose-500/20">
                                        <XCircle className="w-3 h-3" /> Denied
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 text-text-muted text-[11px] max-w-xs truncate">
                                    {scan.denialReason || 'Standard Facility Entrance'}
                                  </td>
                                  <td className="py-2.5">
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-elevated text-text-muted font-mono uppercase border border-border">
                                      {scan.checkinType?.replace('_', ' ') || 'QR PASS'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CSV EXPORTS */}
              {activeTab === 'exports' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/25 text-text text-xs flex items-center space-x-3 font-medium">
                    <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" />
                    <span>
                      All exports automatically calculate and append the official Ethiopian Calendar date (ዓ.ም / E.C.) along with standard timestamps for audited gym records.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Attendance Logs Export */}
                    <div className="p-5 rounded-2xl bg-surface-elevated/60 border border-border flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/40 transition">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mb-3">
                          <Clock className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-bold text-text">Attendance Access Logs</h4>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          Complete entry logs with member name, status (allowed/denied), denial reason, and Ethiopian calendar dates.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleExport('attendance')}
                        disabled={exportingType !== null}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50 min-h-[44px] shadow-sm"
                      >
                        {exportingType === 'attendance' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>Download Attendance CSV</span>
                      </button>
                    </div>

                    {/* Member Roster Export */}
                    <div className="p-5 rounded-2xl bg-surface-elevated/60 border border-border flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/40 transition">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-3">
                          <Users className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-bold text-text">Member Roster & Plans</h4>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          Full athlete directory including plan type, expiry date, Ethiopian expiry, phone, and total check-in count.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleExport('members')}
                        disabled={exportingType !== null}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50 min-h-[44px] shadow-sm"
                      >
                        {exportingType === 'members' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>Download Members CSV</span>
                      </button>
                    </div>

                    {/* Financial Transactions Export */}
                    <div className="p-5 rounded-2xl bg-surface-elevated/60 border border-border flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/40 transition">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center mb-3">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-bold text-text">Financial Transactions</h4>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          Reconciliation sheet with payment method (Chapa, cash, transfer), ETB amount, status, and E.C. timestamps.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleExport('financial')}
                        disabled={exportingType !== null}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50 min-h-[44px] shadow-sm"
                      >
                        {exportingType === 'financial' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>Download Financial CSV</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-border bg-surface-elevated/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <span>SWEATBOX Fitness Intelligence Engine • Ethiopian Calendar (ዓ.ም)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-text font-bold transition min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
