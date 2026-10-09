import React from 'react';
import { CrimeCase, EvidenceItem, AuditEntry, User } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { truncateHash } from '../services/cryptoService';
import {
  FolderArchive,
  ArrowLeft,
  Plus,
  MapPin,
  Calendar,
  UserCheck,
  Boxes,
  Clock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface CaseDetailsViewProps {
  caseItem: CrimeCase;
  evidenceItems: EvidenceItem[];
  auditLogs: AuditEntry[];
  currentUser: User;
  onNavigate: (view: string, extra?: any) => void;
}

export const CaseDetailsView: React.FC<CaseDetailsViewProps> = ({
  caseItem,
  evidenceItems,
  auditLogs,
  currentUser,
  onNavigate,
}) => {
  const caseLogs = auditLogs.filter(l => l.caseId === caseItem.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <button
          onClick={() => onNavigate('cases')}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Cases</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('ai-timeline', { caseId: caseItem.id })}
            className="py-1.5 px-3 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Reconstruction Timeline</span>
          </button>

          <button
            onClick={() => onNavigate('register-evidence', { prefilledCaseId: caseItem.id })}
            className="py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-cyan-950/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Evidence to this Case</span>
          </button>
        </div>
      </div>

      {/* Case Overview Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-base font-bold text-cyan-400">
                {caseItem.id}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">
                {caseItem.status.replace('_', ' ')}
              </span>
              {caseItem.isDemo && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-cyan-800/60 bg-cyan-950 text-cyan-400">
                  DEMO RECORD
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-white">
              {caseItem.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800 shrink-0">
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Registered Evidence:</span>
            <span className="text-white font-bold">{evidenceItems.length} Items</span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-4xl">
          {caseItem.description}
        </p>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Crime Scene Location</span>
            </div>
            <div className="text-slate-200">{caseItem.crimeLocation}</div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Lead Investigator</span>
            </div>
            <div className="text-slate-200">
              {caseItem.leadInvestigator.name} ({caseItem.leadInvestigator.badgeNumber})
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Investigation Opened</span>
            </div>
            <div className="text-slate-200">
              {new Date(caseItem.openedDate).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Associated Evidence Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span>Associated Evidence Items ({evidenceItems.length})</span>
          </h2>
        </div>

        {evidenceItems.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No evidence records registered under this case yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidenceItems.map(item => (
              <div
                key={item.id}
                onClick={() => onNavigate('evidence-details', { evidenceId: item.id })}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex gap-4"
              >
                {/* Photo Thumbnail */}
                <div className="w-24 h-24 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-mono">
                      NO PHOTO
                    </div>
                  )}
                  <div className="absolute top-1 left-1 font-mono text-[9px] bg-slate-950/80 px-1 py-0.2 rounded text-cyan-400">
                    v{item.version}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {item.id}
                      </span>
                      <StatusBadge status={item.currentStatus} size="sm" />
                    </div>

                    <h4 className="font-semibold text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
                      {item.name}
                    </h4>

                    <div className="text-[11px] text-slate-400 truncate">
                      {item.evidenceType}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Officer: {item.collectingOfficer.name}</span>
                    <span>{truncateHash(item.recordHash, 4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Case Specific Audit History */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Case Chain of Custody & Audit Timeline</span>
        </h3>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          {caseLogs.length === 0 ? (
            <div className="text-xs text-slate-500">No logs for this case.</div>
          ) : (
            caseLogs.map(log => (
              <div
                key={log.id}
                className="pl-4 border-l-2 border-slate-700 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-semibold text-cyan-400">
                    {log.action.replace('_', ' ')}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {log.description}
                </p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Authorized by: {log.userName} ({log.userRole})</span>
                  <span className="font-mono text-[9px] text-slate-400">
                    Hash: {truncateHash(log.hash, 4)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
