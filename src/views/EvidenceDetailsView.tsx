import React, { useState, useEffect } from 'react';
import {
  EvidenceItem,
  AuditEntry,
  User,
  EvidenceStatus,
  EvidenceType,
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { EvidenceService } from '../services/evidenceService';
import { AuthService } from '../services/authService';
import { truncateHash } from '../services/cryptoService';
import { QRCodeModal } from '../components/common/QRCodeModal';
import {
  ShieldCheck,
  ArrowLeft,
  QrCode,
  Printer,
  History,
  Lock,
  Edit3,
  ArrowRightLeft,
  Calendar,
  MapPin,
  UserCheck,
  Building,
  CheckCircle2,
  X,
  AlertTriangle,
  FileCheck,
  Maximize2,
  FileText,
  BadgeAlert,
} from 'lucide-react';

interface EvidenceDetailsViewProps {
  evidence: EvidenceItem;
  auditLogs: AuditEntry[];
  currentUser: User;
  onNavigate: (view: string, extra?: any) => void;
  onRefreshData: () => void;
}

const LIFECYCLE_STAGES: EvidenceStatus[] = [
  'COLLECTED',
  'REGISTERED',
  'STORED',
  'TRANSFERRED',
  'FORENSIC ANALYSIS',
  'VERIFIED',
  'SUBMITTED TO COURT',
];

export const EvidenceDetailsView: React.FC<EvidenceDetailsViewProps> = ({
  evidence,
  auditLogs,
  currentUser,
  onNavigate,
  onRefreshData,
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showModModal, setShowModModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Modification Request Form State
  const [fieldToChange, setFieldToChange] = useState<
    'evidenceType' | 'name' | 'description' | 'location' | 'storageLocation'
  >('evidenceType');
  const [requestedValue, setRequestedValue] = useState('');
  const [modReason, setModReason] = useState('');
  const [isSubmittingMod, setIsSubmittingMod] = useState(false);
  const [modSuccess, setModSuccess] = useState<string | null>(null);
  const [modError, setModError] = useState<string | null>(null);

  // Transfer Custody Form State
  const [toCustodian, setToCustodian] = useState('');
  const [newStorageLocation, setNewStorageLocation] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Status Change State
  const [selectedNextStatus, setSelectedNextStatus] = useState<EvidenceStatus>(evidence.currentStatus);
  const [statusNotes, setStatusNotes] = useState('');

  // Log that this evidence was accessed/viewed (for chain of custody!)
  useEffect(() => {
    EvidenceService.logEvidenceView(evidence.id, currentUser).then(() => {
      onRefreshData();
    });
  }, [evidence.id, currentUser.id]);

  const canRequestMod = AuthService.canRequestModification(currentUser, evidence);
  const canUpdateStatus = AuthService.canUpdateEvidenceStatus(currentUser);
  const canTransfer = AuthService.canTransferCustody(currentUser);

  // Pre-fill original value based on selected field
  const getOriginalFieldValue = () => {
    switch (fieldToChange) {
      case 'evidenceType':
        return evidence.evidenceType;
      case 'name':
        return evidence.name;
      case 'description':
        return evidence.description;
      case 'storageLocation':
        return evidence.storageLocation;
      case 'location':
        return evidence.collectionLocation.address;
      default:
        return '';
    }
  };

  const getFieldNameDisplay = () => {
    switch (fieldToChange) {
      case 'evidenceType':
        return 'Evidence Classification Type';
      case 'name':
        return 'Item Designation / Name';
      case 'description':
        return 'Forensic Description';
      case 'storageLocation':
        return 'Current Storage Location';
      case 'location':
        return 'Crime Scene Address';
      default:
        return fieldToChange;
    }
  };

  const handleOpenModModal = (field?: typeof fieldToChange) => {
    if (field) setFieldToChange(field);
    setRequestedValue('');
    setModReason('');
    setModError(null);
    setModSuccess(null);
    setShowModModal(true);
  };

  const handleSubmitModification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedValue.trim() || !modReason.trim()) {
      setModError('Both the requested value and mandatory justification reason are required.');
      return;
    }

    try {
      setIsSubmittingMod(true);
      setModError(null);

      await EvidenceService.requestModification({
        evidenceId: evidence.id,
        fieldToChange,
        fieldNameDisplay: getFieldNameDisplay(),
        originalValue: getOriginalFieldValue(),
        requestedValue: requestedValue.trim(),
        reason: modReason.trim(),
        user: currentUser,
      });

      setModSuccess(
        'Modification request officially submitted! Sent to Higher Official queue for authorization. Direct silent edits are prevented.'
      );
      onRefreshData();
      setTimeout(() => {
        setShowModModal(false);
      }, 2200);
    } catch (err: any) {
      setModError(err?.message || 'Failed to submit modification request');
    } finally {
      setIsSubmittingMod(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toCustodian.trim() || !newStorageLocation.trim() || !transferPurpose.trim()) {
      return;
    }

    try {
      setIsTransferring(true);
      await EvidenceService.transferCustody({
        evidenceId: evidence.id,
        toCustodian: toCustodian.trim(),
        newStorageLocation: newStorageLocation.trim(),
        purpose: transferPurpose.trim(),
        user: currentUser,
      });

      setShowTransferModal(false);
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await EvidenceService.updateEvidenceStatus({
        evidenceId: evidence.id,
        newStatus: selectedNextStatus,
        notes: statusNotes,
        user: currentUser,
      });
      setShowStatusModal(false);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const itemLogs = auditLogs.filter(l => l.evidenceId === evidence.id);
  const currentStageIndex = LIFECYCLE_STAGES.indexOf(evidence.currentStatus);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Bar with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <button
          onClick={() => onNavigate('evidence-list')}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Evidence Vault</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* QR Code Tag Button */}
          <button
            onClick={() => setShowQRModal(true)}
            className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate QR Tag</span>
          </button>

          {/* Custody Transfer Button */}
          {canTransfer && (
            <button
              onClick={() => {
                setToCustodian('');
                setNewStorageLocation('');
                setTransferPurpose('');
                setShowTransferModal(true);
              }}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
              <span>Transfer Custody</span>
            </button>
          )}

          {/* Status Progression Button */}
          {canUpdateStatus && (
            <button
              onClick={() => {
                setSelectedNextStatus(evidence.currentStatus);
                setStatusNotes('');
                setShowStatusModal(true);
              }}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Advance Status</span>
            </button>
          )}

          {/* Request Modification Button */}
          {canRequestMod && (
            <button
              onClick={() => handleOpenModModal()}
              className="py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-950/40"
              title="Official evidence correction protocol (requires Higher Official approval)"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Request Modification</span>
            </button>
          )}

          {/* Print Forensic Certificate Button */}
          <button
            onClick={() => window.print()}
            className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Forensic Lifecycle Stepper Pipeline */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Official Evidence Lifecycle Pipeline</span>
          <span className="text-cyan-400">Current Phase: {evidence.currentStatus}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {LIFECYCLE_STAGES.map((st, idx) => {
            const isPassed = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={st}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                    : isPassed
                    ? 'bg-slate-950/80 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-950/30 border-slate-800 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono">STEP 0{idx + 1}</span>
                  {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>
                <div className="text-[10px] font-mono uppercase font-bold truncate">
                  {st}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Digital Evidence Record */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Forensic Photo & Cryptographic Proof (Span 1) */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Attached Evidence Artifact</span>
              <span className="text-cyan-400 font-mono text-[10px]">v{evidence.version}.0</span>
            </div>

            {/* Photo */}
            <div className="rounded-lg bg-slate-950 border border-slate-800 overflow-hidden relative group">
              {evidence.imageUrl ? (
                <img
                  src={evidence.imageUrl}
                  alt={evidence.name}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-600">
                  NO PHOTOGRAPH FILED
                </div>
              )}
            </div>

            {/* File SHA-256 Digest */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>ATTACHMENT SHA-256 CHECKSUM</span>
                <span className="text-emerald-400">UNALTERED</span>
              </div>
              <div className="text-[10px] text-cyan-300 break-all select-all leading-tight">
                {evidence.fileHash || 'NONE'}
              </div>
            </div>

            {/* Complete Record Hash */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>RECORD IMMUTABLE DIGEST</span>
                <span className="text-cyan-400">CRYPTOGRAPHIC</span>
              </div>
              <div className="text-[10px] text-slate-300 break-all select-all leading-tight">
                {evidence.recordHash}
              </div>
            </div>

            {/* Current Custodian Widget */}
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-500">
                CURRENT PHYSICAL CUSTODIAN
              </div>
              <div className="text-white font-medium">{evidence.currentCustodian}</div>
              <div className="text-[11px] text-slate-400">
                Repository: {evidence.storageLocation}
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Forensic Details & Chain of Custody (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Evidence Header & Metadata Box */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xl font-black text-cyan-400 tracking-wider">
                    {evidence.id}
                  </span>
                  <StatusBadge status={evidence.currentStatus} size="md" />
                  {evidence.isDemo && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-cyan-800 bg-cyan-950 text-cyan-400">
                      DEMO SPECIMEN
                    </span>
                  )}
                </div>

                <h1 className="text-lg font-bold text-white">{evidence.name}</h1>
                <div className="text-xs text-cyan-300 font-mono mt-0.5">
                  Case ID: {evidence.caseId}
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <div className="text-slate-500 text-[10px]">RECORD REVISION</div>
                <div className="text-white font-bold">VERSION {evidence.version}.0</div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="text-xs font-mono uppercase text-slate-400 font-semibold flex items-center justify-between">
                <span>Forensic Description & Condition Analysis</span>
                {canRequestMod && (
                  <button
                    onClick={() => handleOpenModModal('description')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-sans flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Request Edit</span>
                  </button>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                {evidence.description}
              </p>
            </div>

            {/* Forensic Attribute Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Evidence Type */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center justify-between">
                  <span>CLASSIFICATION TYPE</span>
                  {canRequestMod && (
                    <button
                      onClick={() => handleOpenModModal('evidenceType')}
                      className="text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="text-white font-semibold">{evidence.evidenceType}</div>
              </div>

              {/* Locked Collection Timestamp */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center justify-between">
                  <span>COLLECTION TIMESTAMP (LOCKED)</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    IMMUTABLE
                  </span>
                </div>
                <div className="text-amber-300 font-mono font-medium">
                  {new Date(evidence.collectionTimestamp).toLocaleString()}
                </div>
              </div>

              {/* Crime Scene Location */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center justify-between">
                  <span>CRIME SCENE RECOVERY LOCATION</span>
                  {canRequestMod && (
                    <button
                      onClick={() => handleOpenModModal('location')}
                      className="text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="text-slate-200">
                  {evidence.collectionLocation.address}
                </div>
                {evidence.collectionLocation.roomOrSector && (
                  <div className="text-[11px] text-slate-400">
                    Sector: {evidence.collectionLocation.roomOrSector}
                  </div>
                )}
                {evidence.collectionLocation.coordinates && (
                  <div className="text-[10px] font-mono text-slate-500">
                    GPS: {evidence.collectionLocation.coordinates}
                  </div>
                )}
              </div>

              {/* Collecting Officer */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-500 uppercase">
                  INITIAL COLLECTING FIRST RESPONDER
                </div>
                <div className="text-white font-semibold">
                  {evidence.collectingOfficer.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Badge: {evidence.collectingOfficer.badgeNumber} · {evidence.collectingOfficer.department}
                </div>
              </div>
            </div>
          </div>

          {/* Activity History & Chain of Custody Timeline */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Complete Chain of Custody & Activity History</span>
              </h3>
              <span className="font-mono text-xs text-slate-400">
                {itemLogs.length} Cryptographic Ledger Events
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {itemLogs.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">
                  No audit events recorded for this item yet.
                </div>
              ) : (
                itemLogs.map((log, idx) => (
                  <div
                    key={log.id}
                    className="relative pl-6 border-l-2 border-cyan-800/80 space-y-1.5 pb-2"
                  >
                    {/* Circle marker on timeline */}
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-slate-950 border-2 border-cyan-400" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="font-mono text-cyan-400">
                          {log.action.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {log.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                      {log.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>
                        Officer/Agent: {log.userName} ({log.badgeNumber}) — {log.userRole}
                      </span>
                      <span>Hash: {truncateHash(log.hash, 4)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Tag Modal */}
      {showQRModal && (
        <QRCodeModal
          evidence={evidence}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* Modification Request Modal */}
      {showModModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-white">
                  Formal Evidence Modification Request
                </h3>
              </div>
              <button
                onClick={() => setShowModModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModification} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
                <strong>Forensic Integrity Rule:</strong> Silent record alterations are strictly prohibited. Your requested correction will be dispatched to a Higher Official for judicial/supervisory review. Both original and modified values are permanently recorded in the immutable audit trail.
              </div>

              {modError && (
                <div className="p-3 rounded bg-rose-950/50 border border-rose-500/50 text-rose-300">
                  {modError}
                </div>
              )}

              {modSuccess && (
                <div className="p-3 rounded bg-emerald-950/50 border border-emerald-500/50 text-emerald-300">
                  {modSuccess}
                </div>
              )}

              {/* Target Field to Change */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Field Requiring Correction *
                </label>
                <select
                  value={fieldToChange}
                  onChange={e => setFieldToChange(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="evidenceType">Evidence Classification Type</option>
                  <option value="name">Evidence Designation / Name</option>
                  <option value="description">Forensic Description</option>
                  <option value="location">Crime Scene Address</option>
                  <option value="storageLocation">Storage Vault Location</option>
                </select>
              </div>

              {/* Current Original Value (Read Only) */}
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">
                  ORIGINAL VERIFIED VALUE (PRESERVED)
                </label>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs select-all">
                  {getOriginalFieldValue()}
                </div>
              </div>

              {/* Requested New Value */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Requested New Value *
                </label>
                {fieldToChange === 'evidenceType' ? (
                  <select
                    value={requestedValue}
                    onChange={e => setRequestedValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">Select corrected classification...</option>
                    <option value="Metal Object / Weapon">Metal Object / Weapon</option>
                    <option value="Burglary Intrusion Tool / Weapon">Burglary Intrusion Tool / Weapon</option>
                    <option value="Firearm & Ballistics">Firearm & Ballistics</option>
                    <option value="Digital Media / Storage">Digital Media / Storage</option>
                    <option value="Biological / DNA">Biological / DNA</option>
                    <option value="Chemical / Narcotics">Chemical / Narcotics</option>
                    <option value="Documents / Records">Documents / Records</option>
                    <option value="Trace Evidence">Trace Evidence</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter corrected value..."
                    value={requestedValue}
                    onChange={e => setRequestedValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>

              {/* Mandatory Reason for Change */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Mandatory Justification / Reason for Modification *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Laboratory metallurgist confirmed tool matches intrusion markings rather than blunt force weapon..."
                  value={modReason}
                  onChange={e => setModReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModModal(false)}
                  className="py-2 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMod}
                  className="py-2 px-4 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmittingMod ? 'Submitting...' : 'Dispatch Request to Higher Official'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custody Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-white">
                  Formal Chain of Custody Transfer
                </h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500 font-mono">CURRENT CUSTODIAN:</div>
                <div className="text-white font-semibold">{evidence.currentCustodian}</div>
                <div className="text-slate-400 text-[11px]">Location: {evidence.storageLocation}</div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Recipient Individual or Department *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Forensic Ballistics Lab - Examiner Dr. Vance"
                  value={toCustodian}
                  onChange={e => setToCustodian(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  New Secure Storage Facility / Room *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Forensic Lab 3 - Evidence Locker #8B"
                  value={newStorageLocation}
                  onChange={e => setNewStorageLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Transfer Purpose & Mission Order *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Handover for metallurgical fracture match analysis..."
                  value={transferPurpose}
                  onChange={e => setTransferPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="py-2 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="py-2 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isTransferring ? 'Recording...' : 'Authorize Custody Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advance Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white">
                  Advance Evidence Lifecycle Status
                </h3>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Select Target Status Phase *
                </label>
                <select
                  value={selectedNextStatus}
                  onChange={e => setSelectedNextStatus(e.target.value as EvidenceStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                >
                  {LIFECYCLE_STAGES.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Official Notation / Reason for Transition
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ballistics matching complete; verified authentic by senior examiner."
                  value={statusNotes}
                  onChange={e => setStatusNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="py-2 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  className="py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
                >
                  Confirm Status Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
