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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Titan Analytics & Intelligence
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {todayEth}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live financial overview, member throughput, and certified CSV exports
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('financial')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-medium text-sm border-b-2 transition ${
              activeTab === 'financial'
                ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Financial & Revenue</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-medium text-sm border-b-2 transition ${
              activeTab === 'attendance'
                ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Attendance & Scans</span>
          </button>
          <button
            onClick={() => setActiveTab('exports')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-medium text-sm border-b-2 transition ${
              activeTab === 'exports'
                ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV Exports & Reports</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center space-x-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && !financialData && !attendanceData ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-sm">Calculating gym performance & financial metrics...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: FINANCIAL OVERVIEW */}
              {activeTab === 'financial' && financialData && (
                <div className="space-y-6">
                  {/* Top KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs uppercase font-semibold">Total Revenue</span>
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {financialData.totalRevenue.toLocaleString()} <span className="text-xs text-amber-400 font-normal">ETB</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {financialData.successfulTransactions} successful payments
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs uppercase font-semibold">Active Memberships</span>
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {financialData.activeMembershipsCount}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Currently paying active subscribers
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs uppercase font-semibold">Maintenance Cost</span>
                        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                          <Wrench className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-rose-400">
                        {financialData.maintenanceExpense.toLocaleString()} <span className="text-xs text-rose-300 font-normal">ETB</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Logged equipment repairs & parts
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs uppercase font-semibold">Net Gym Margin</span>
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-emerald-400">
                        {financialData.netMargin.toLocaleString()} <span className="text-xs text-emerald-300 font-normal">ETB</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Gross revenue minus maintenance
                      </p>
                    </div>
                  </div>

                  {/* Channel Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Online Chapa Gateway</p>
                        <p className="text-lg font-bold text-white">
                          {financialData.chapaRevenue.toLocaleString()} ETB
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Cash at Reception Desk</p>
                        <p className="text-lg font-bold text-white">
                          {financialData.cashRevenue.toLocaleString()} ETB
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Bank Transfer / Telebirr Direct</p>
                        <p className="text-lg font-bold text-white">
                          {financialData.bankTransferRevenue.toLocaleString()} ETB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Revenue History */}
                  <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>Monthly Revenue Trend (Last 6 Months)</span>
                    </h3>
                    {financialData.revenueByMonth.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No payment history recorded yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {financialData.revenueByMonth.map((item, idx) => {
                          const maxAmount = Math.max(...financialData.revenueByMonth.map((m) => m.amount), 1);
                          const percentage = Math.round((item.amount / maxAmount) * 100);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium text-slate-300">{item.month}</span>
                                <span className="text-amber-400 font-semibold">
                                  {item.amount.toLocaleString()} ETB ({item.transactions} txns)
                                </span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                                <div
                                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Total Scans</p>
                      <p className="text-2xl font-bold text-white mt-1">{attendanceData.totalCheckins}</p>
                      <p className="text-xs text-slate-400 mt-1">QR check-in attempts</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs uppercase font-semibold">Allowed</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-2xl font-bold text-emerald-400 mt-1">{attendanceData.grantedCount}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {attendanceData.totalCheckins > 0
                          ? `${Math.round((attendanceData.grantedCount / attendanceData.totalCheckins) * 100)}% entrance rate`
                          : '0% entrance rate'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs uppercase font-semibold">Denied</span>
                        <XCircle className="w-4 h-4 text-rose-400" />
                      </div>
                      <p className="text-2xl font-bold text-rose-400 mt-1">{attendanceData.deniedCount}</p>
                      <p className="text-xs text-slate-400 mt-1">Expired, inactive or duplicates</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Denial Rate</p>
                      <p className="text-2xl font-bold text-amber-400 mt-1">{attendanceData.denialRate}%</p>
                      <p className="text-xs text-slate-400 mt-1">Of total scan requests</p>
                    </div>
                  </div>

                  {/* Hourly Traffic Distribution */}
                  <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Facility Traffic Density (06:00 - 22:00)</span>
                    </h3>
                    <div className="grid grid-cols-8 md:grid-cols-16 gap-1 pt-2">
                      {attendanceData.hourlyTraffic.map((slot) => {
                        const maxCount = Math.max(...attendanceData.hourlyTraffic.map((t) => t.count), 1);
                        const intensity = slot.count / maxCount;
                        let bgClass = 'bg-slate-800 text-slate-500';
                        if (intensity > 0.7) bgClass = 'bg-amber-500 text-slate-950 font-bold';
                        else if (intensity > 0.4) bgClass = 'bg-amber-600/80 text-white';
                        else if (intensity > 0) bgClass = 'bg-amber-900/60 text-amber-300';

                        return (
                          <div
                            key={slot.hour}
                            className="flex flex-col items-center justify-between p-1.5 rounded-lg border border-slate-700/40 transition hover:scale-105"
                          >
                            <span className="text-[10px] text-slate-400 font-mono">
                              {slot.hour}:00
                            </span>
                            <div className={`w-full py-1 mt-1 rounded text-center text-xs ${bgClass}`}>
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
                    <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                      <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>Common Denial Reasons</span>
                      </h4>
                      {attendanceData.topDenialReasons.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3">No denied scans recorded.</p>
                      ) : (
                        <div className="space-y-2">
                          {attendanceData.topDenialReasons.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                            >
                              <span className="text-slate-300 font-medium">{item.reason}</span>
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">
                                {item.count} scans
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Top Active Athletes */}
                    <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                      <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Top Active Members</span>
                      </h4>
                      {attendanceData.topActiveMembers.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3">No member attendance data available.</p>
                      ) : (
                        <div className="space-y-2">
                          {attendanceData.topActiveMembers.map((member, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                            >
                              <div>
                                <p className="font-semibold text-white">{member.name}</p>
                                <p className="text-[11px] text-slate-400">{member.email}</p>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                                {member.checkinCount} check-ins
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CSV EXPORTS */}
              {activeTab === 'exports' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-3">
                    <FileSpreadsheet className="w-5 h-5 flex-shrink-0" />
                    <span>
                      All exports automatically calculate and append the official Ethiopian Calendar date (ዓ.ም / E.C.) along with standard timestamps for audited gym records.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Attendance Logs Export */}
                    <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                          <Clock className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-bold text-white">Attendance Access Logs</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Complete entry logs with member name, status (allowed/denied), denial reason, and Ethiopian calendar dates.
                        </p>
                      </div>
                      <button
                        onClick={() => handleExport('attendance')}
                        disabled={exportingType !== null}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
                      >
                        {exportingType === 'attendance' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 text-blue-400" />
                        )}
                        <span>Download Attendance CSV</span>
                      </button>
                    </div>

                    {/* Member Roster Export */}
                    <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                          <Users className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-bold text-white">Member Roster & Plans</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Full athlete directory including plan type, expiry date, Ethiopian expiry, phone, and total check-in count.
                        </p>
                      </div>
                      <button
                        onClick={() => handleExport('members')}
                        disabled={exportingType !== null}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
                      >
                        {exportingType === 'members' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 text-emerald-400" />
                        )}
                        <span>Download Members CSV</span>
                      </button>
                    </div>

                    {/* Financial Transactions Export */}
                    <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <h4 className="text-base font-bold text-white">Financial Transactions</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Reconciliation sheet with payment method (Chapa, cash, transfer), ETB amount, status, and E.C. timestamps.
                        </p>
                      </div>
                      <button
                        onClick={() => handleExport('financial')}
                        disabled={exportingType !== null}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
                      >
                        {exportingType === 'financial' ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 text-amber-400" />
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
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
          <span>Titan Fitness Management System v2.0 • Ethiopian Calendar Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
