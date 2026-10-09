import React, { useState } from 'react';
import {
  CrimeCase,
  EvidenceItem,
  AuditEntry,
  EvidenceStatus,
  User,
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { truncateHash } from '../services/cryptoService';
import { QRScannerModal, QRScanResult } from '../components/common/QRScannerModal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  FolderArchive,
  Boxes,
  FileCheck2,
  ArrowRightLeft,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Layers,
  Camera,
} from 'lucide-react';

interface DashboardViewProps {
  cases: CrimeCase[];
  evidenceList: EvidenceItem[];
  auditLogs: AuditEntry[];
  pendingApprovalsCount: number;
  currentUser: User;
  onNavigate: (view: string, extra?: any) => void;
  onOpenIntegrityAudit: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  evidenceList,
  auditLogs,
  pendingApprovalsCount,
  currentUser,
  onNavigate,
  onOpenIntegrityAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [caseFilter, setCaseFilter] = useState<string>('ALL');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Metrics
  const totalCases = cases.length;
  const totalEvidence = evidenceList.length;
  const inTransferCount = evidenceList.filter(e => e.currentStatus === 'TRANSFERRED').length;
  const verifiedCount = evidenceList.filter(
    e => e.currentStatus === 'VERIFIED' || e.currentStatus === 'SUBMITTED TO COURT'
  ).length;

  // Filtered evidence for quick list
  const filteredEvidence = evidenceList.filter(item => {
    const matchesSearch =
      searchTerm === '' ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.collectingOfficer.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.currentStatus === statusFilter;
    const matchesCase = caseFilter === 'ALL' || item.caseId === caseFilter;

    return matchesSearch && matchesStatus && matchesCase;
  });

  // Lifecycle breakdown
  const statusCounts: Record<EvidenceStatus, number> = {
    COLLECTED: evidenceList.filter(e => e.currentStatus === 'COLLECTED').length,
    REGISTERED: evidenceList.filter(e => e.currentStatus === 'REGISTERED').length,
    STORED: evidenceList.filter(e => e.currentStatus === 'STORED').length,
    TRANSFERRED: evidenceList.filter(e => e.currentStatus === 'TRANSFERRED').length,
    'FORENSIC ANALYSIS': evidenceList.filter(e => e.currentStatus === 'FORENSIC ANALYSIS').length,
    VERIFIED: evidenceList.filter(e => e.currentStatus === 'VERIFIED').length,
    'SUBMITTED TO COURT': evidenceList.filter(e => e.currentStatus === 'SUBMITTED TO COURT').length,
  };

  const STATUS_CHART_CONFIG: { status: EvidenceStatus; label: string; short: string; color: string }[] = [
    { status: 'COLLECTED', label: 'Collected', short: 'Collected', color: '#fbbf24' },
    { status: 'REGISTERED', label: 'Registered', short: 'Registered', color: '#38bdf8' },
    { status: 'STORED', label: 'Stored (Vault)', short: 'Stored', color: '#60a5fa' },
    { status: 'TRANSFERRED', label: 'In Transit', short: 'Transfer', color: '#818cf8' },
    { status: 'FORENSIC ANALYSIS', label: 'Forensic Lab', short: 'Analysis', color: '#c084fc' },
    { status: 'VERIFIED', label: 'Verified', short: 'Verified', color: '#34d399' },
    { status: 'SUBMITTED TO COURT', label: 'Court Submission', short: 'Court', color: '#fb7185' },
  ];

  const barChartData = STATUS_CHART_CONFIG.map(item => ({
    status: item.status,
    label: item.label,
    short: item.short,
    count: statusCounts[item.status] || 0,
    color: item.color,
  }));

  // Identify bottleneck stage (highest count in active processing)
  const activeStages = barChartData.filter(d => d.status !== 'SUBMITTED TO COURT');
  const bottleneckStage = activeStages.reduce(
    (max, item) => (item.count > max.count ? item : max),
    activeStages[0] || barChartData[0]
  );

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalEvidence > 0 ? ((data.count / totalEvidence) * 100).toFixed(0) : '0';
      return (
        <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-2xl text-xs font-mono space-y-1">
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.status}</span>
          </div>
          <div className="text-cyan-300 font-bold">Volume: {data.count} items</div>
          <div className="text-slate-400 text-[11px]">{pct}% of total registered evidence</div>
          <div className="text-[10px] text-cyan-400/80 pt-1 border-t border-slate-800">
            Click bar to filter records table
          </div>
        </div>
      );
    }
    return null;
  };

  const recentLogs = auditLogs.slice(-6).reverse();

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Evidence Management Operations Center</span>
          </h1>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Cryptographic Chain of Custody Active</span>
            <span className="text-slate-600">·</span>
            <span>Logged in as {currentUser.name}</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-cyan-400">{currentUser.badgeNumber}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer border border-slate-700 shadow-sm"
            title="Scan physical evidence bag tag"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Scan QR Tag</span>
          </button>
          <button
            onClick={() => onNavigate('register-evidence')}
            className="py-2 px-3.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Evidence</span>
          </button>
          <button
            onClick={() => onNavigate('cases')}
            className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
          >
            <FolderArchive className="w-4 h-4 text-slate-400" />
            <span>View Cases</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cases */}
        <div
          onClick={() => onNavigate('cases')}
          className="p-4 rounded-xl bg-slate-900/75 backdrop-blur-xl border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-lg shadow-black/30"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono tracking-wider">
              Total Active Cases
            </span>
            <FolderArchive className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalCases}</div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>All investigations</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
          </div>
        </div>

        {/* Total Evidence */}
        <div
          onClick={() => onNavigate('evidence-list')}
          className="p-4 rounded-xl bg-slate-900/75 backdrop-blur-xl border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer group shadow-lg shadow-black/30"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono tracking-wider">
              Registered Evidence
            </span>
            <Boxes className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalEvidence}</div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>{verifiedCount} verified for court</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => onNavigate('modifications')}
          className="p-4 rounded-xl bg-slate-900/75 backdrop-blur-xl border border-slate-800/80 hover:border-amber-500/50 transition-all cursor-pointer group shadow-lg shadow-black/30"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono tracking-wider">
              Pending Approvals
            </span>
            <FileCheck2
              className={`w-4 h-4 ${
                pendingApprovalsCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'
              }`}
            />
          </div>
          <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-2">
            <span>{pendingApprovalsCount}</span>
            {pendingApprovalsCount > 0 && (
              <span className="text-xs text-amber-400 font-sans font-normal">
                requires review
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Modification requests</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </div>
        </div>

        {/* In-Transit Transfers */}
        <div
          onClick={() => onNavigate('audit-trail')}
          className="p-4 rounded-xl bg-slate-900/75 backdrop-blur-xl border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-lg shadow-black/30"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono tracking-wider">
              Active In-Transit
            </span>
            <ArrowRightLeft className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{inTransferCount}</div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Custody handovers</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>
      </div>

      {/* Recharts Evidence Distribution & Bottleneck Analysis Chart */}
      <div className="p-5 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-sm text-white">
                Evidence Status Distribution & Bottleneck Identification
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Recharts visualization across forensic custody stages. Click any bar to instantly filter evidence records below.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {bottleneckStage && bottleneckStage.count > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Primary Bottleneck: <strong>{bottleneckStage.label}</strong> ({bottleneckStage.count} items)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pipeline Balanced · No Critical Bottlenecks</span>
              </div>
            )}

            {statusFilter !== 'ALL' && (
              <button
                onClick={() => setStatusFilter('ALL')}
                className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
              >
                Clear Filter ({statusFilter})
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Recharts Bar Chart (Span 3) */}
          <div className="lg:col-span-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 15, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="short"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                  interval={0}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar
                  dataKey="count"
                  radius={[5, 5, 0, 0]}
                  onClick={(entry: any) => {
                    if (entry && entry.status) {
                      setStatusFilter(statusFilter === entry.status ? 'ALL' : entry.status);
                    }
                  }}
                  cursor="pointer"
                >
                  {barChartData.map((entry, index) => {
                    const isSelected = statusFilter === entry.status;
                    const isDimmed = statusFilter !== 'ALL' && !isSelected;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={isDimmed ? 0.3 : 1}
                        stroke={isSelected ? '#ffffff' : 'transparent'}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Diagnostic Bottleneck Insight Box (Span 1) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="font-mono text-cyan-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Custody Diagnostics</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-1.5">
                <span>Total Active Inventory:</span>
                <span className="font-mono text-white font-bold">{totalEvidence}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-1.5">
                <span>Court Submitted:</span>
                <span className="font-mono text-emerald-400 font-bold">{statusCounts['SUBMITTED TO COURT']}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-1.5">
                <span>In-Lab Analysis:</span>
                <span className="font-mono text-purple-400 font-bold">{statusCounts['FORENSIC ANALYSIS']}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-0.5">
                <span>Vault Backlog:</span>
                <span className="font-mono text-amber-400 font-bold">{statusCounts['STORED']}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 leading-relaxed italic">
              Tip: Items sitting in &ldquo;Stored&rdquo; or &ldquo;Forensic Analysis&rdquo; represent processing lag before judicial readiness.
            </div>
          </div>
        </div>
      </div>

      {/* Lifecycle Status Pipeline Overview */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Evidence Lifecycle Pipeline</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Sequential Custody Progression
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {(
            [
              'COLLECTED',
              'REGISTERED',
              'STORED',
              'TRANSFERRED',
              'FORENSIC ANALYSIS',
              'VERIFIED',
              'SUBMITTED TO COURT',
            ] as EvidenceStatus[]
          ).map((st, idx) => {
            const count = statusCounts[st] || 0;
            return (
              <div
                key={st}
                onClick={() => setStatusFilter(statusFilter === st ? 'ALL' : st)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-cyan-950/60 border-cyan-500 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-500">
                    Step {idx + 1}
                  </span>
                  <span className="font-mono font-bold text-xs text-white">
                    {count}
                  </span>
                </div>
                <div className="text-[10px] font-mono uppercase font-semibold text-slate-300 truncate">
                  {st}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Evidence Vault Table & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Filterable Evidence Records Table (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">
                Evidence Records
              </h2>
              <div className="text-xs text-slate-400">
                Showing {filteredEvidence.length} of {evidenceList.length} total items
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search ID, name, officer..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 sm:w-56"
                />
              </div>

              <select
                value={caseFilter}
                onChange={e => setCaseFilter(e.target.value)}
                className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Cases</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Evidence ID</th>
                    <th className="py-3 px-3">Item Name & Type</th>
                    <th className="py-3 px-3">Case ID</th>
                    <th className="py-3 px-3">Officer</th>
                    <th className="py-3 px-3">Current Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredEvidence.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No evidence records matching the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEvidence.map(item => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                        onClick={() =>
                          onNavigate('evidence-details', { evidenceId: item.id })
                        }
                      >
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                          {item.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-white truncate max-w-xs">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.evidenceType}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {item.caseId}
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-200">
                            {item.collectingOfficer.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {item.collectingOfficer.badgeNumber}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={item.currentStatus} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onNavigate('evidence-details', { evidenceId: item.id });
                            }}
                            className="py-1 px-2.5 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-[11px] font-medium transition-colors"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">
                Each record is secured with cryptographic SHA-256 fingerprint.
              </span>
              <button
                onClick={() => onNavigate('evidence-list')}
                className="text-cyan-400 hover:text-cyan-300 text-xs font-medium flex items-center gap-1"
              >
                <span>View Full Vault</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Audit Activity Feed (Span 1) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Audit Trail</span>
            </h2>
            <button
              onClick={() => onNavigate('audit-trail')}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Full Ledger
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="space-y-3.5">
              {recentLogs.map(log => (
                <div
                  key={log.id}
                  className="relative pl-4 border-l-2 border-cyan-800/60 pb-1 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-semibold text-cyan-400">
                      {log.action.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                    {log.description}
                  </p>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                    <span>By: {log.userName}</span>
                    <span className="font-mono text-[9px] text-slate-400">
                      {truncateHash(log.hash, 4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={onOpenIntegrityAudit}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Verify Audit Chain Integrity</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(result: QRScanResult) => {
          const targetId = result.evidenceId || result.raw;
          const found = evidenceList.find(e => e.id.toLowerCase() === targetId.toLowerCase());
          if (found) {
            onNavigate('evidence-details', { evidenceId: found.id });
          } else {
            onNavigate('verification');
          }
        }}
        title="Physical Evidence Tag QR Scanner"
        subtitle="Aim camera at physical evidence tag to retrieve record and chain of custody"
      />
    </div>
  );
};
