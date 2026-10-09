import React, { useState } from 'react';
import { AuditService } from '../../services/auditService';
import { resetToDefaultData } from '../../services/storageService';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, X, Bug } from 'lucide-react';

interface IntegrityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const IntegrityModal: React.FC<IntegrityModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [running, setRunning] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    valid: boolean;
    totalEntries: number;
    verifiedCount: number;
    tamperedIndex: number | null;
    tamperedEntryId?: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRunAudit = async () => {
    setRunning(true);
    setAuditResult(null);
    // Simulate brief microsecond verification scan for visual feedback
    setTimeout(async () => {
      const res = await AuditService.verifyLedgerIntegrity();
      setAuditResult(res);
      setRunning(false);
    }, 400);
  };

  const handleSimulateAttack = () => {
    AuditService.simulateTamperAttack();
    if (onRefreshData) onRefreshData();
    handleRunAudit();
  };

  const handleRestoreLedger = () => {
    resetToDefaultData();
    if (onRefreshData) onRefreshData();
    setAuditResult(null);
    handleRunAudit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white tracking-wide">
              Cryptographic Ledger Integrity Audit
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-sm text-slate-300 leading-relaxed">
            This security engine verifies the entire digital evidence audit trail from Genesis Block to Present using SHA-256 cryptographic hash-chaining. Any silent alteration, deleted event, or inserted record breaks the mathematical chain.
          </div>

          {/* Audit Status Box */}
          {auditResult ? (
            <div
              className={`p-5 rounded-lg border ${
                auditResult.valid
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {auditResult.valid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-semibold text-base">
                    {auditResult.valid
                      ? 'Ledger Integrity Verified — 100% Tamper-Proof'
                      : 'TAMPER DETECTED — Cryptographic Chain Compromised!'}
                  </div>
                  <div className="text-sm opacity-90">{auditResult.message}</div>
                  <div className="text-xs font-mono pt-2 text-slate-300 flex items-center gap-4">
                    <span>Total Blocks: {auditResult.totalEntries}</span>
                    <span>Verified: {auditResult.verifiedCount}</span>
                    {auditResult.tamperedEntryId && (
                      <span className="text-rose-400 font-bold">
                        Failed Block: {auditResult.tamperedEntryId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center border border-slate-800 rounded-lg bg-slate-950/40 text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <div>Click &ldquo;Verify Ledger Now&rdquo; to execute full cryptographic hash audit.</div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunAudit}
                disabled={running}
                className="py-2 px-4 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
                {running ? 'Computing SHA-256...' : 'Verify Ledger Now'}
              </button>
            </div>

            {/* Test Simulation Controls for Judges */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateAttack}
                className="py-1.5 px-3 rounded border border-rose-500/40 hover:bg-rose-950/40 text-rose-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Secretly modifies record in storage to test if cryptographic audit catches the alteration"
              >
                <Bug className="w-3.5 h-3.5" />
                Simulate Tamper Attack
              </button>
              <button
                onClick={handleRestoreLedger}
                className="py-1.5 px-3 rounded border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
              >
                Reset Ledger
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
