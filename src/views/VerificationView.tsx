import React, { useState } from 'react';
import { EvidenceItem, User } from '../types';
import { computeEvidenceRecordHash, truncateHash } from '../services/cryptoService';
import { StatusBadge } from '../components/common/StatusBadge';
import { QRScannerModal, QRScanResult } from '../components/common/QRScannerModal';
import {
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Search,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Fingerprint,
  Camera,
} from 'lucide-react';

interface VerificationViewProps {
  evidenceList: EvidenceItem[];
  currentUser: User;
  onNavigate: (view: string, extra?: any) => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  evidenceList,
  currentUser,
  onNavigate,
}) => {
  const [lookupInput, setLookupInput] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'AUTHENTIC' | 'TAMPERED' | 'NOT_FOUND' | null;
    item?: EvidenceItem;
    computedHash?: string;
    details?: string;
  }>({ status: null });
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsVerifying(true);
    setVerificationResult({ status: null });

    setTimeout(async () => {
      // 1. Check if input is a raw Evidence ID or QR payload like "DEG:EV-2026-0001:CASE-2026-001:..."
      let targetId = trimmed;
      if (trimmed.startsWith('DEG:')) {
        const parts = trimmed.split(':');
        targetId = parts[1] || trimmed;
      }

      const found = evidenceList.find(
        e => e.id.toLowerCase() === targetId.toLowerCase()
      );

      if (!found) {
        setVerificationResult({
          status: 'NOT_FOUND',
          details: `No record matching identifier "${trimmed}" was found in the authoritative forensic registry.`,
        });
        setIsVerifying(false);
        return;
      }

      // 2. Perform live mathematical SHA-256 integrity recomputation
      const locationString = `${found.collectionLocation.address}${
        found.collectionLocation.roomOrSector ? ', ' + found.collectionLocation.roomOrSector : ''
      }`;

      const computedHash = await computeEvidenceRecordHash({
        id: found.id,
        caseId: found.caseId,
        evidenceType: found.evidenceType,
        description: found.description,
        collectionTimestamp: found.collectionTimestamp,
        location: locationString,
        collectingOfficerBadge: found.collectingOfficer.badgeNumber,
        fileHash: found.fileHash,
        version: found.version,
      });

      if (computedHash === found.recordHash) {
        setVerificationResult({
          status: 'AUTHENTIC',
          item: found,
          computedHash,
          details: `Cryptographic fingerprint matches recorded state 100%. Chain of custody is intact. Verified under case ${found.caseId}.`,
        });
      } else {
        setVerificationResult({
          status: 'TAMPERED',
          item: found,
          computedHash,
          details: `CRITICAL INTEGRITY FAILURE: Recomputed SHA-256 fingerprint (${computedHash.slice(0, 8)}...) deviates from immutable stored hash (${found.recordHash.slice(0, 8)}...). The record content has been altered outside authorized governance channels.`,
        });
      }

      setIsVerifying(false);
    }, 450);
  };

  const handleQuickLookup = (id: string) => {
    setLookupInput(id);
    handleVerify(id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-cyan-400" />
            <span>Forensic Evidence Verification & QR Scanner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Independently verify physical evidence bag QR codes against the authoritative cryptographic ledger.
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950/50 self-start sm:self-auto border border-cyan-400/30"
        >
          <Camera className="w-4 h-4 text-cyan-200" />
          <span>Launch Camera QR Scanner</span>
        </button>
      </div>

      {/* Verification Query Input */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Scan QR Code or Enter Safe Evidence Identifier
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <ScanLine className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Scan QR payload or enter ID (e.g. EV-2026-0001)..."
                value={lookupInput}
                onChange={e => setLookupInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerify(lookupInput)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              title="Open video camera scanner"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Camera</span>
            </button>

            <button
              onClick={() => handleVerify(lookupInput)}
              disabled={isVerifying || !lookupInput.trim()}
              className="w-full sm:w-auto py-2.5 px-6 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-950/40 disabled:opacity-50"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying...' : 'Authenticate'}</span>
            </button>
          </div>
        </div>

        {/* Quick Test Samples */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-mono text-[11px]">Quick Samples:</span>
          {evidenceList.slice(0, 4).map(e => (
            <button
              key={e.id}
              onClick={() => handleQuickLookup(e.id)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] transition-colors cursor-pointer border border-slate-700"
            >
              {e.id}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Result Display */}
      {verificationResult.status && (
        <div className="space-y-4 animate-in zoom-in-95 duration-200">
          {verificationResult.status === 'AUTHENTIC' && verificationResult.item && (
            <div className="p-6 rounded-xl bg-slate-900 border border-emerald-500/50 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-emerald-400 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-7 h-7" />
                <div>
                  <h3 className="font-bold text-base text-white">
                    Evidence Authenticity & Integrity Verified
                  </h3>
                  <div className="text-xs text-emerald-300 font-mono">
                    Official Specimen • 100% Cryptographic Match
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {verificationResult.details}
              </p>

              {/* Verified Evidence Details Card */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">EVIDENCE IDENTIFIER:</span>
                  <span className="text-cyan-400 font-bold text-sm">
                    {verificationResult.item.id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CASE NUMBER:</span>
                  <span className="text-white font-bold">
                    {verificationResult.item.caseId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ITEM DESIGNATION:</span>
                  <span className="text-slate-200 font-sans font-medium">
                    {verificationResult.item.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CURRENT CUSTODY STATUS:</span>
                  <div className="pt-0.5">
                    <StatusBadge status={verificationResult.item.currentStatus} size="sm" />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">COLLECTED BY:</span>
                  <span className="text-slate-300 font-sans">
                    {verificationResult.item.collectingOfficer.name} ({verificationResult.item.collectingOfficer.badgeNumber})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">COLLECTION TIMESTAMP:</span>
                  <span className="text-amber-300">
                    {new Date(verificationResult.item.collectionTimestamp).toLocaleString()}
                  </span>
                </div>
                <div className="md:col-span-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block text-[10px]">VERIFIED SHA-256 FINGERPRINT:</span>
                  <span className="text-cyan-300 text-[10px] break-all select-all">
                    {verificationResult.computedHash}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() =>
                    onNavigate('evidence-details', { evidenceId: verificationResult.item!.id })
                  }
                  className="py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open Full Forensic Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {verificationResult.status === 'NOT_FOUND' && (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 space-y-3">
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-bold text-sm text-white">Record Not Found</h3>
              </div>
              <p className="text-xs text-slate-400">{verificationResult.details}</p>
            </div>
          )}

          {verificationResult.status === 'TAMPERED' && (
            <div className="p-6 rounded-xl bg-rose-950/40 border border-rose-500/60 text-rose-200 space-y-3">
              <div className="flex items-center gap-3 text-rose-400">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-bold text-sm text-white">Integrity Verification Failed</h3>
              </div>
              <p className="text-xs leading-relaxed">{verificationResult.details}</p>
            </div>
          )}
        </div>
      )}

      {/* Camera QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(result: QRScanResult) => {
          const query = result.evidenceId || result.raw;
          setLookupInput(query);
          handleVerify(query);
        }}
        title="Physical Evidence Tag QR Scanner"
        subtitle="Point camera at evidence bag QR code to verify cryptographic authenticity"
      />
    </div>
  );
};
