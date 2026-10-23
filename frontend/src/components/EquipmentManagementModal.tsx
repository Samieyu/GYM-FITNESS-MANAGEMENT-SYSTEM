import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  AlertTriangle,
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,

  ShieldAlert,
  Trash2,
  Edit2,
  RefreshCw,
  Building,
} from 'lucide-react';
import {
  Equipment,
  EquipmentReport,
  MaintenanceLog,
  fetchEquipmentApi,
  createEquipmentApi,
  updateEquipmentApi,
  deleteEquipmentApi,
  fetchEquipmentReportsApi,
  createEquipmentReportApi,
  updateReportStatusApi,
  fetchMaintenanceLogsApi,
  createMaintenanceLogApi,
} from '../api/equipment';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';

interface EquipmentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'trainer' | 'reception' | 'member';
  userName: string;
}

export const EquipmentManagementModal: React.FC<EquipmentManagementModalProps> = ({
  isOpen,
  onClose,
  userRole,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'reports' | 'maintenance'>('inventory');
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [reportsList, setReportsList] = useState<EquipmentReport[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reportStatusFilter, setReportStatusFilter] = useState('all');

  // Sub-modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);

  // Form states - Add/Edit Equipment
  const [equipForm, setEquipForm] = useState({
    name: '',
    code: '',
    category: 'Strength',
    location: 'Main Gym Floor',
    status: 'operational' as 'operational' | 'faulty' | 'maintenance' | 'decommissioned',
    last_service_date: '',
    next_service_due: '',
  });

  // Form states - Defect Report
  const [reportForm, setReportForm] = useState({
    equipment_id: '',
    issue_description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });

  // Form states - Maintenance Log
  const [maintenanceForm, setMaintenanceForm] = useState({
    equipment_id: '',
    serviced_by: '',
    cost: 0,
    description: '',
    service_date: new Date().toISOString().split('T')[0],
    next_service_due: '',
  });

  const loadAllData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [equip, reports, maint] = await Promise.all([
        fetchEquipmentApi({ search: searchQuery, status: statusFilter, category: categoryFilter }),
        fetchEquipmentReportsApi({ status: reportStatusFilter }),
        fetchMaintenanceLogsApi(),
      ]);
      setEquipmentList(equip);
      setReportsList(reports);
      setMaintenanceList(maint);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load equipment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, statusFilter, categoryFilter, reportStatusFilter]);

  if (!isOpen) return null;

  const operationalCount = equipmentList.filter((e) => e.status === 'operational').length;
  const faultyCount = equipmentList.filter((e) => e.status === 'faulty' || e.status === 'maintenance').length;
  const openReportsCount = reportsList.filter((r) => r.status !== 'resolved').length;

  const handleOpenAdd = () => {
    setEditingEquipment(null);
    setEquipForm({
      name: '',
      code: '',
      category: 'Strength',
      location: 'Main Gym Floor',
      status: 'operational',
      last_service_date: new Date().toISOString().split('T')[0],
      next_service_due: '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setEquipForm({
      name: item.name,
      code: item.code,
      category: item.category,
      location: item.location || '',
      status: item.status,
      last_service_date: item.last_service_date ? item.last_service_date.split('T')[0] : '',
      next_service_due: item.next_service_due ? item.next_service_due.split('T')[0] : '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      if (editingEquipment) {
        await updateEquipmentApi(editingEquipment.id, equipForm);
        setSuccessMessage(`Equipment "${equipForm.name}" updated successfully.`);
      } else {
        await createEquipmentApi(equipForm);
        setSuccessMessage(`Equipment "${equipForm.name}" registered successfully.`);
      }
      setIsAddEditModalOpen(false);
      loadAllData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save equipment');
    }
  };

  const handleDeleteEquipment = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to decommission and remove "${name}"?`)) return;
    try {
      await deleteEquipmentApi(id);
      setSuccessMessage(`Equipment "${name}" removed successfully.`);
      loadAllData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete equipment');
    }
  };

  const handleOpenReportModal = (item?: Equipment) => {

    setReportForm({
      equipment_id: item ? item.id : equipmentList[0]?.id || '',
      issue_description: '',
      priority: 'medium',
    });
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await createEquipmentReportApi(reportForm);
      setSuccessMessage('Equipment defect report submitted successfully.');
      setIsReportModalOpen(false);
      loadAllData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report');
    }
  };

  const handleUpdateReportStatus = async (reportId: string, newStatus: 'open' | 'in_progress' | 'resolved') => {
    try {
      await updateReportStatusApi(reportId, newStatus);
      setSuccessMessage(`Report status updated to ${newStatus}.`);
      loadAllData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update report status');
    }
  };

  const handleOpenMaintenanceModal = (item?: Equipment, resolveReportId?: string) => {
    const selected = item || equipmentList[0];

    setResolvingReportId(resolveReportId || null);
    setMaintenanceForm({
      equipment_id: selected ? selected.id : '',
      serviced_by: '',
      cost: 0,
      description: '',
      service_date: new Date().toISOString().split('T')[0],
      next_service_due: '',
    });
    setIsMaintenanceModalOpen(true);
  };

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await createMaintenanceLogApi({
        ...maintenanceForm,
        resolve_report_id: resolvingReportId,
      });
      setSuccessMessage('Maintenance operation recorded & equipment marked operational.');
      setIsMaintenanceModalOpen(false);
      loadAllData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record maintenance operation');
    }
  };

  const getStatusBadge = (status: Equipment['status']) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Operational
          </span>
        );
      case 'faulty':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5" /> Faulty / Defect
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wrench className="w-3.5 h-3.5" /> Under Service
          </span>
        );
      case 'decommissioned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <ShieldAlert className="w-3.5 h-3.5" /> Decommissioned
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: EquipmentReport['priority']) => {
    switch (priority) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white animate-bounce">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">MEDIUM</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">LOW</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Gym Equipment & Maintenance Management
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Active Portal</span>
                <span>•</span>
                <span className="text-amber-400/90 font-medium">
                  {formatEthiopianDate(new Date())} E.C. (ዓ.ም)
                </span>
                <span>•</span>
                <span className="capitalize">{userRole} access ({userName})</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-xs hover:underline">Dismiss</button>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-xs hover:underline">Dismiss</button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pt-4 pb-2">
          <div className="bg-zinc-800/40 border border-zinc-700/40 rounded-xl p-3">
            <div className="text-xs text-zinc-400 font-medium">Total Equipment</div>
            <div className="text-2xl font-black text-white mt-0.5">{equipmentList.length}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Gym inventory items</div>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
            <div className="text-xs text-emerald-400 font-medium">Operational</div>
            <div className="text-2xl font-black text-emerald-300 mt-0.5">{operationalCount}</div>
            <div className="text-[11px] text-emerald-500/70 mt-1">Ready for workout sessions</div>
          </div>
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3">
            <div className="text-xs text-rose-400 font-medium">Defective / In Service</div>
            <div className="text-2xl font-black text-rose-300 mt-0.5">{faultyCount}</div>
            <div className="text-[11px] text-rose-500/70 mt-1">Needs attention or repair</div>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
            <div className="text-xs text-amber-400 font-medium">Open Defect Reports</div>
            <div className="text-2xl font-black text-amber-300 mt-0.5">{openReportsCount}</div>
            <div className="text-[11px] text-amber-500/70 mt-1">Active staff/trainer logs</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-2 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'inventory'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Building className="w-4 h-4" />
            Equipment Inventory ({equipmentList.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'reports'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Defect Reports ({reportsList.length})
            {openReportsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] text-white font-bold">
                {openReportsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'maintenance'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Maintenance & Service History ({maintenanceList.length})
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: EQUIPMENT INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search equipment by name, code, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadAllData()}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-800/60 border border-zinc-700/60 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="operational">Operational</option>
                    <option value="faulty">Faulty</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="decommissioned">Decommissioned</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Free Weights">Free Weights</option>
                    <option value="Cable Machines">Cable Machines</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReportModal()}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Report Defect
                  </button>
                  {userRole === 'admin' && (
                    <button
                      onClick={handleOpenAdd}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold hover:from-amber-400 hover:to-yellow-500 shadow-md transition"
                    >
                      <Plus className="w-4 h-4" />
                      Add Equipment
                    </button>
                  )}
                  <button
                    onClick={loadAllData}
                    className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Equipment Grid/Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipmentList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-800/30 border border-zinc-700/50 hover:border-zinc-600/70 rounded-2xl p-4 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-700/60 text-amber-300 font-semibold border border-zinc-600">
                            {item.code}
                          </span>
                          <h3 className="text-base font-bold text-white mt-1.5">{item.name}</h3>
                          <div className="text-xs text-zinc-400 mt-0.5">{item.category} • {item.location || 'General Floor'}</div>
                        </div>
                        <div>{getStatusBadge(item.status)}</div>
                      </div>

                      {/* Service Dates */}
                      <div className="mt-4 pt-3 border-t border-zinc-700/40 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" /> Last Serviced:
                          </span>
                          <span className="text-zinc-300 font-medium">
                            {item.last_service_ec || item.last_service_date || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-500/80" /> Next Due:
                          </span>
                          <span className="text-amber-400 font-medium">
                            {item.next_service_ec || item.next_service_due || 'Scheduled routine'}
                          </span>
                        </div>
                        {item.open_reports_count && item.open_reports_count > 0 ? (
                          <div className="mt-2 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{item.open_reports_count} active defect report(s)</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-zinc-700/40 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenReportModal(item)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-800 text-rose-300 hover:bg-rose-500/20 border border-zinc-700 hover:border-rose-500/30 transition flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-400" /> Report Issue
                      </button>

                      <div className="flex items-center gap-1">
                        {userRole === 'admin' && (
                          <>
                            <button
                              onClick={() => handleOpenMaintenanceModal(item)}
                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-zinc-800 text-amber-300 hover:bg-amber-500/20 border border-zinc-700 hover:border-amber-500/30 transition flex items-center gap-1"
                              title="Record Maintenance Service"
                            >
                              <Wrench className="w-3 h-3" /> Service
                            </button>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-700 transition"
                              title="Edit Equipment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEquipment(item.id, item.name)}
                              className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                              title="Delete Equipment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: DEFECT REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select
                    value={reportStatusFilter}
                    onChange={(e) => setReportStatusFilter(e.target.value)}
                    className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Report Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <button
                  onClick={() => handleOpenReportModal()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  File New Defect Report
                </button>
              </div>

              {reportsList.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 bg-zinc-800/20 border border-zinc-800 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/40" />
                  <p className="text-sm">No defect reports matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportsList.map((r) => (
                    <div
                      key={r.id}
                      className="bg-zinc-800/30 border border-zinc-700/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-700 text-amber-300 font-semibold">
                            {r.equipment_code}
                          </span>
                          <span className="font-bold text-white text-sm">{r.equipment_name}</span>
                          <span className="text-xs text-zinc-400">({r.equipment_location || 'Main Floor'})</span>
                          {getPriorityBadge(r.priority)}
                        </div>
                        <p className="text-sm text-zinc-200 mt-1">{r.issue_description}</p>
                        <div className="text-xs text-zinc-400 flex items-center gap-3 pt-1">
                          <span>Reported by: <strong className="text-zinc-300">{r.reporter_name}</strong> ({r.reporter_role})</span>
                          <span>•</span>
                          <span>{r.created_at_ec || new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Status / Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {r.status === 'resolved' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                          </span>
                        ) : (
                          <>
                            {(userRole === 'admin' || userRole === 'reception') && (
                              <div className="flex items-center gap-1.5">
                                {r.status === 'open' && (
                                  <button
                                    onClick={() => handleUpdateReportStatus(r.id, 'in_progress')}
                                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition"
                                  >
                                    Mark In Progress
                                  </button>
                                )}
                                {userRole === 'admin' && (
                                  <button
                                    onClick={() => {
                                      const equip = equipmentList.find((e) => e.id === r.equipment_id);
                                      handleOpenMaintenanceModal(equip, r.id);
                                    }}
                                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1"
                                  >
                                    <Wrench className="w-3 h-3" /> Service & Resolve
                                  </button>
                                )}
                              </div>
                            )}
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {r.status === 'in_progress' ? 'In Progress' : 'Open'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MAINTENANCE & SERVICE LOGS */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-400">
                  Comprehensive audit log of gym equipment repair, technician inspections, and servicing costs.
                </div>
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleOpenMaintenanceModal()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:from-amber-400 hover:to-yellow-500 shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    Record Maintenance Log
                  </button>
                )}
              </div>

              {maintenanceList.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 bg-zinc-800/20 border border-zinc-800 rounded-2xl">
                  <ClipboardList className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
                  <p className="text-sm">No maintenance operations recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-800/80 text-zinc-400 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Equipment</th>
                        <th className="px-4 py-3">Serviced By</th>
                        <th className="px-4 py-3">Work Description</th>
                        <th className="px-4 py-3">Cost (ETB)</th>
                        <th className="px-4 py-3">Service Date (E.C.)</th>
                        <th className="px-4 py-3">Next Due (E.C.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 bg-zinc-900/40">
                      {maintenanceList.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-800/40 transition">
                          <td className="px-4 py-3 font-medium text-white">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-700 text-amber-300 mr-2 font-semibold">
                              {log.equipment_code}
                            </span>
                            {log.equipment_name}
                          </td>
                          <td className="px-4 py-3 text-zinc-300">{log.serviced_by}</td>
                          <td className="px-4 py-3 text-zinc-300 max-w-xs">{log.description}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-400">
                            ETB {Number(log.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-zinc-300 text-xs">
                            {log.service_date_ec || log.service_date}
                          </td>
                          <td className="px-4 py-3 text-amber-400/90 text-xs">
                            {log.next_service_due_ec || log.next_service_due || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SUB-MODAL: Add / Edit Equipment */}
        {isAddEditModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <h3 className="text-lg font-bold text-white">
                  {editingEquipment ? 'Edit Equipment Item' : 'Add New Equipment'}
                </h3>
                <button
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEquipment} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    required
                    value={equipForm.name}
                    onChange={(e) => setEquipForm({ ...equipForm, name: e.target.value })}
                    placeholder="e.g. Life Fitness Olympic Bench"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Equipment Code *</label>
                    <input
                      type="text"
                      required
                      value={equipForm.code}
                      onChange={(e) => setEquipForm({ ...equipForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. EQ-BNCH-02"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white font-mono text-sm uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Category *</label>
                    <select
                      value={equipForm.category}
                      onChange={(e) => setEquipForm({ ...equipForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="Cardio">Cardio</option>
                      <option value="Strength">Strength</option>
                      <option value="Free Weights">Free Weights</option>
                      <option value="Cable Machines">Cable Machines</option>
                      <option value="Recovery / Mobility">Recovery / Mobility</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Gym Location</label>
                    <input
                      type="text"
                      value={equipForm.location}
                      onChange={(e) => setEquipForm({ ...equipForm, location: e.target.value })}
                      placeholder="e.g. Zone A - Cardio Deck"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Operational Status</label>
                    <select
                      value={equipForm.status}
                      onChange={(e) => setEquipForm({ ...equipForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="operational">Operational</option>
                      <option value="faulty">Faulty</option>
                      <option value="maintenance">Under Maintenance</option>
                      <option value="decommissioned">Decommissioned</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Last Service Date (Gregorian)</label>
                    <input
                      type="date"
                      value={equipForm.last_service_date}
                      onChange={(e) => setEquipForm({ ...equipForm, last_service_date: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Next Service Due (Gregorian)</label>
                    <input
                      type="date"
                      value={equipForm.next_service_due}
                      onChange={(e) => setEquipForm({ ...equipForm, next_service_due: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 rounded-xl transition"
                  >
                    {editingEquipment ? 'Save Changes' : 'Create Equipment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUB-MODAL: Report Defect */}
        {isReportModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-white">Report Machine Defect / Issue</h3>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Select Equipment *</label>
                  <select
                    required
                    value={reportForm.equipment_id}
                    onChange={(e) => setReportForm({ ...reportForm, equipment_id: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        [{eq.code}] {eq.name} ({eq.location || 'Floor'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Issue Severity / Priority *</label>
                  <select
                    value={reportForm.priority}
                    onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="low">Low (Cosmetic wear, minor noise)</option>
                    <option value="medium">Medium (Sticking cable, worn seat cushion)</option>
                    <option value="high">High (Faulty pin, slipping belt - will mark faulty)</option>
                    <option value="critical">Critical (Safety hazard, immediate stop required)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Issue Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={reportForm.issue_description}
                    onChange={(e) => setReportForm({ ...reportForm, issue_description: e.target.value })}
                    placeholder="Describe the malfunction, noise, or broken part in detail..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 placeholder-zinc-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition"
                  >
                    Submit Defect Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUB-MODAL: Record Maintenance Log */}
        {isMaintenanceModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-amber-400">
                  <Wrench className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-white">Record Service & Repair Operation</h3>
                </div>
                <button
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMaintenance} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Equipment *</label>
                  <select
                    required
                    value={maintenanceForm.equipment_id}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, equipment_id: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        [{eq.code}] {eq.name} ({eq.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Serviced By / Technician *</label>
                    <input
                      type="text"
                      required
                      value={maintenanceForm.serviced_by}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviced_by: e.target.value })}
                      placeholder="e.g. Addis Fitness Tech"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Repair Cost (ETB) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.01"
                      value={maintenanceForm.cost}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Work Description & Replaced Parts *</label>
                  <textarea
                    required
                    rows={3}
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                    placeholder="Describe parts replaced, adjustments made, safety calibration..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Service Date</label>
                    <input
                      type="date"
                      value={maintenanceForm.service_date}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, service_date: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Next Service Due</label>
                    <input
                      type="date"
                      value={maintenanceForm.next_service_due}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, next_service_due: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {resolvingReportId && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>This operation will automatically resolve the linked defect report and mark the machine operational.</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsMaintenanceModalOpen(false)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 rounded-xl transition"
                  >
                    Save & Restore Operational
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
