import React, { useState } from 'react';
import { ModificationRequest, User, UserRole } from '../types';
import { EvidenceService } from '../services/evidenceService';
import { AuthService } from '../services/authService';
import { FingerprintModal } from '../components/common/FingerprintModal';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Fingerprint,
} from 'lucide-react';

interface ModificationRequestsViewProps {
  modifications: ModificationRequest[];
  currentUser: User;
  onRefreshData: () => void;
  onNavigate: (view: string, extra?: any) => void;
  onSwitchUserByRole: (role: UserRole) => void;
}

export const ModificationRequestsView: React.FC<ModificationRequestsViewProps> = ({
  modifications,
  currentUser,
  onRefreshData,
  onNavigate,
  onSwitchUserByRole,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [reviewingRequest, setReviewingRequest] = useState<ModificationRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const canReview = AuthService.canReviewModifications(currentUser);

  const filtered = modifications.filter(m => {
    if (filter === 'ALL') return true;
    return m.status === filter;
  });

  const pendingCount = modifications.filter(m => m.status === 'PENDING').length;

  const handleOpenReview = (req: ModificationRequest, action: 'APPROVE' | 'REJECT') => {
    setReviewingRequest(req);
    setReviewAction(action);
    setReviewNotes(
      action === 'APPROVE'
        ? 'Reviewed forensic justification and confirmed match with metallurgical and investigative findings. Approved.'
        : 'Declined. Insufficient photographic or forensic documentation to support reclassification.'
    );
    setResultMessage(null);
  };

  const executeReview = async (biometricToken?: string) => {
    if (!reviewingRequest) return;

    try {
      setIsProcessing(true);
      await EvidenceService.reviewModification({
        requestId: reviewingRequest.id,
        status: reviewAction === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        reviewNotes: `${reviewNotes.trim()}${biometricToken ? ' [Biometric Fingerprint Verified & Sealed]' : ''}`,
        user: currentUser,
      });

      setResultMessage(
        reviewAction === 'APPROVE'
          ? `Modification ${reviewingRequest.id} has been APPROVED. Evidence record updated to v2 and original value permanently preserved in audit history.${
              biometricToken ? ' Signed with Higher Official Fingerprint.' : ''
            }`
          : `Modification ${reviewingRequest.id} has been REJECTED. Original evidence record remains unchanged.`
      );
      onRefreshData();

      setTimeout(() => {
        setReviewingRequest(null);
        setResultMessage(null);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-amber-400" />
            <span>Evidence Modification Governance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisory review portal. Prevent silent modification of verified evidence. Dual-control approval protocol.
          </p>
        </div>

        {/* Quick Role Notice for supervisory authorization */}
        {!canReview && (
          <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-600/50 flex items-center gap-3 text-xs text-amber-200">
            <span>Current role ({currentUser.role}) cannot approve requests. Supervisory authority required.</span>
            <button
              onClick={() => onSwitchUserByRole('HIGHER_OFFICIAL')}
              className="py-1 px-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-[11px] transition-colors cursor-pointer"
            >
              Switch to Higher Official
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs & Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-1.5">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab}</span>
              {tab === 'PENDING' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing {filtered.length} Requests ·{' '}
          <span className="text-amber-400 font-bold">{pendingCount} Awaiting Review</span>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No modification requests in this category.
          </div>
        ) : (
          filtered.map(req => {
            const isPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req.id}
                className={`p-6 rounded-xl border transition-all ${
                  isPending
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-950/10'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                {/* Header of Request Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-white">
                      {req.id}
                    </span>
                    <span className="text-xs font-mono text-cyan-400">
                      Evidence ID: {req.evidenceId}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Case: {req.caseId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isPending
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : isApproved
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(req.requestTimestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Diff Comparison Grid: Original vs Requested */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-300">
                    Target Field: <span className="text-white font-mono">{req.fieldNameDisplay}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Value */}
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        ORIGINAL VALUE (CURRENT RECORD)
                      </div>
                      <div className="text-xs text-rose-300 font-mono line-through opacity-80">
                        {req.originalValue}
                      </div>
                    </div>

                    {/* Requested Value */}
                    <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 space-y-1">
                      <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                        <span>REQUESTED NEW VALUE</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                      <div className="text-xs text-emerald-300 font-mono font-semibold">
                        {req.requestedValue}
                      </div>
                    </div>
                  </div>

                  {/* Officer Reason */}
                  <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      OFFICER JUSTIFICATION / REASON FOR MODIFICATION:
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      &ldquo;{req.reason}&rdquo;
                    </p>
                    <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        Requested by {req.requestedBy.name} ({req.requestedBy.badgeNumber}) — {req.requestedBy.role}
                      </span>
                    </div>
                  </div>

                  {/* If already reviewed, display official review statement */}
                  {!isPending && req.reviewedBy && (
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">
                        SUPERVISORY DECISION RECORD:
                      </div>
                      <div className="text-slate-300">
                        Reviewed by{' '}
                        <span className="text-white font-medium">{req.reviewedBy.name}</span>{' '}
                        ({req.reviewedBy.badgeNumber}) on{' '}
                        {req.reviewTimestamp && new Date(req.reviewTimestamp).toLocaleString()}
                      </div>
                      {req.reviewNotes && (
                        <div className="text-slate-400 text-[11px]">
                          Official Note: {req.reviewNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons for Higher Official */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => onNavigate('evidence-details', { evidenceId: req.evidenceId })}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>Examine Evidence Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      {canReview ? (
                        <>
                          <button
                            onClick={() => handleOpenReview(req, 'REJECT')}
                            className="py-1.5 px-3.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-600/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>REJECT</span>
                          </button>
                          <button
                            onClick={() => handleOpenReview(req, 'APPROVE')}
                            className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-950/30"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>APPROVE</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono italic">
                          Awaiting Higher Official Decision
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Supervisory Review Confirmation Modal */}
      {reviewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className={`w-5 h-5 ${
                    reviewAction === 'APPROVE' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                />
                <h3 className="font-semibold text-white">
                  Confirm Supervisory Decision ({reviewAction})
                </h3>
              </div>
              <button
                onClick={() => setReviewingRequest(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {resultMessage ? (
                <div
                  className={`p-4 rounded-lg border text-xs leading-relaxed ${
                    reviewAction === 'APPROVE'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 mb-2" />
                  {resultMessage}
                </div>
              ) : (
                <>
                  <div className="space-y-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                      <span>EVIDENCE ID:</span>
                      <span className="text-white font-bold">{reviewingRequest.evidenceId}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                      <span>FIELD TO UPDATE:</span>
                      <span className="text-cyan-400">{reviewingRequest.fieldNameDisplay}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                      <span>FROM:</span>
                      <span className="text-rose-300 line-through">{reviewingRequest.originalValue}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                      <span>TO:</span>
                      <span className="text-emerald-300 font-bold">{reviewingRequest.requestedValue}</span>
                    </div>
                  </div>

                  {reviewAction === 'APPROVE' ? (
                    <div className="p-3 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs">
                      <strong>Audit Ledger Rule:</strong> Approving will update the verified evidence record, advance its version number, generate a new cryptographic SHA-256 fingerprint, and preserve the original entry forever in the audit chain.
                    </div>
                  ) : (
                    <div className="p-3 rounded bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs">
                      <strong>Rejection Protocol:</strong> The evidence record will remain unaltered. A formal rejection record citing your explanation will be inscribed in the audit ledger.
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Official Supervisory Statement / Ruling *
                    </label>
                    <textarea
                      rows={3}
                      value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setReviewingRequest(null)}
                      className="py-2 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      Cancel
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => setShowBiometricModal(true)}
                        className="py-2 px-3.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-cyan-950/40"
                        title="Scan fingerprint to cryptographically seal authorization"
                      >
                        <Fingerprint className="w-4 h-4" />
                        <span>Biometric {reviewAction}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => executeReview()}
                        className={`py-2 px-4 rounded font-bold text-xs transition-colors cursor-pointer text-white disabled:opacity-50 ${
                          reviewAction === 'APPROVE'
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-rose-600 hover:bg-rose-500'
                        }`}
                      >
                        {isProcessing ? 'Recording...' : `Standard ${reviewAction}`}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Higher Official Fingerprint Scanner Modal */}
      {showBiometricModal && reviewingRequest && (
        <FingerprintModal
          isOpen={showBiometricModal}
          user={currentUser}
          actionTitle={`Biometric Supervisory Sign-Off: ${reviewAction}`}
          actionDescription={`Scan fingerprint to cryptographically authorize and seal modification of Evidence ${reviewingRequest.evidenceId} as ${currentUser.name}.`}
          onClose={() => setShowBiometricModal(false)}
          onSuccess={(token) => {
            setShowBiometricModal(false);
            executeReview(token);
          }}
        />
      )}
    </div>
  );
};
