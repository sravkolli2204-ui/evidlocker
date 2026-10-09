import React, { useState } from 'react';
import { AuditEntry, User, AuditActionType } from '../types';
import { truncateHash } from '../services/cryptoService';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Clock,
  UserCheck,
  Hash,
  Link2,
  FileSpreadsheet,
} from 'lucide-react';

interface AuditTrailViewProps {
  auditLogs: AuditEntry[];
  currentUser: User;
  onOpenIntegrityAudit: () => void;
  onNavigate: (view: string, extra?: any) => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditLogs,
  currentUser,
  onOpenIntegrityAudit,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [evidenceFilter, setEvidenceFilter] = useState('');

  const filteredLogs = [...auditLogs].reverse().filter(log => {
    const matchesSearch =
      searchTerm === '' ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.evidenceId && log.evidenceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.caseId && log.caseId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesEvidence =
      evidenceFilter === '' || (log.evidenceId && log.evidenceId.toLowerCase().includes(evidenceFilter.toLowerCase()));

    return matchesSearch && matchesAction && matchesEvidence;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `forensic-audit-ledger-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Block_ID', 'Timestamp', 'Action', 'Evidence_ID', 'Case_ID', 'User', 'Role', 'Badge', 'Description', 'Previous_Hash', 'Hash'];
    const rows = auditLogs.map(l => [
      l.id,
      l.timestamp,
      l.action,
      l.evidenceId || 'N/A',
      l.caseId || 'N/A',
      `"${l.userName}"`,
      l.userRole,
      l.badgeNumber,
      `"${l.description.replace(/"/g, '""')}"`,
      l.previousHash,
      l.hash,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `forensic-audit-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Cryptographic Audit Trail & Chain of Custody</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable timeline of every crime-scene record creation, view, transfer, and modification approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenIntegrityAudit}
            className="py-2 px-3.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Ledger Integrity</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            title="Export CSV for judicial filing"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search description, officer, case..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="ALL">Filter by Action: All Events</option>
            <option value="EVIDENCE_CREATED">Evidence Registered</option>
            <option value="EVIDENCE_VIEWED">Evidence Examined / Viewed</option>
            <option value="CUSTODY_TRANSFERRED">Custody Transferred</option>
            <option value="MODIFICATION_REQUESTED">Modification Requested</option>
            <option value="MODIFICATION_APPROVED">Modification Approved</option>
            <option value="MODIFICATION_REJECTED">Modification Rejected</option>
            <option value="STATUS_UPDATED">Status Progression</option>
            <option value="CASE_CREATED">Case Established</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Filter by Evidence ID (e.g. EV-2026-0001)..."
              value={evidenceFilter}
              onChange={e => setEvidenceFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
          <span>{filteredLogs.length} matching events in cryptographic sequence</span>
          <span className="text-cyan-400">Chained with SHA-256 blocks</span>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No audit records matching your filters.
          </div>
        ) : (
          filteredLogs.map(log => {
            const isApproved = log.action === 'MODIFICATION_APPROVED';
            const isRejected = log.action === 'MODIFICATION_REJECTED';
            const isReq = log.action === 'MODIFICATION_REQUESTED';
            const isCreated = log.action === 'EVIDENCE_CREATED';
            const isTransferred = log.action === 'CUSTODY_TRANSFERRED';

            let accentBorder = 'border-cyan-800/80';
            let dotColor = 'border-cyan-400';
            if (isApproved) {
              accentBorder = 'border-emerald-600/80';
              dotColor = 'border-emerald-400 bg-emerald-500';
            } else if (isRejected) {
              accentBorder = 'border-rose-600/80';
              dotColor = 'border-rose-400 bg-rose-500';
            } else if (isReq) {
              accentBorder = 'border-amber-600/80';
              dotColor = 'border-amber-400 bg-amber-500';
            }

            return (
              <div
                key={log.id}
                className="relative pl-8 border-l-2 pb-5 space-y-2 group"
                style={{ borderColor: isApproved ? '#059669' : isRejected ? '#e11d48' : isReq ? '#d97706' : '#0e7490' }}
              >
                {/* Node icon */}
                <div
                  className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 ${dotColor}`}
                />

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 group-hover:border-slate-700 transition-all space-y-3">
                  {/* Top Bar of the Log Block */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {log.id}
                      </span>
                      {log.evidenceId && (
                        <button
                          onClick={() => onNavigate('evidence-details', { evidenceId: log.evidenceId })}
                          className="text-[10px] font-mono text-cyan-300 hover:underline cursor-pointer"
                        >
                          {log.evidenceId}
                        </button>
                      )}
                      {log.caseId && (
                        <span className="text-[10px] font-mono text-slate-500">
                          [{log.caseId}]
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      <span className="text-slate-600">·</span>
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {log.description}
                  </p>

                  {/* Metadata Diff (for modifications) */}
                  {log.metadata && (log.metadata.originalValue || log.metadata.updatedValue) && (
                    <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs font-mono grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {log.metadata.originalValue && (
                        <div className="text-[11px]">
                          <span className="text-slate-500">ORIGINAL VALUE (PRESERVED): </span>
                          <span className="text-rose-300">{log.metadata.originalValue}</span>
                        </div>
                      )}
                      {log.metadata.updatedValue && (
                        <div className="text-[11px]">
                          <span className="text-slate-500">UPDATED VALUE: </span>
                          <span className="text-emerald-300 font-bold">{log.metadata.updatedValue}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cryptographic Chain Footer */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        Officer/Agent: <strong className="text-white">{log.userName}</strong> ({log.badgeNumber}) — {log.userRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                      <span title={`Previous Hash: ${log.previousHash}`}>
                        Prev: {truncateHash(log.previousHash, 4)}
                      </span>
                      <Link2 className="w-3 h-3 text-cyan-400" />
                      <span className="text-cyan-300" title={`Block Hash: ${log.hash}`}>
                        Hash: {truncateHash(log.hash, 6)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
