import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { EvidenceItem } from '../../types';
import { truncateHash } from '../../services/cryptoService';
import { QrCode, Printer, X, Download, ShieldCheck, Check } from 'lucide-react';

interface QRCodeModalProps {
  evidence: EvidenceItem | null;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ evidence, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!evidence) return;
    // Generate QR code with error correction level H (30% recovery)
    QRCode.toDataURL(evidence.qrPayload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#020617',
        light: '#f8fafc',
      },
      errorCorrectionLevel: 'H',
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [evidence]);

  if (!evidence) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(evidence.qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white tracking-wide">
              Official Evidence QR Tag
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tag Body for display and print */}
        <div className="p-6">
          <div className="p-5 bg-white text-slate-950 rounded-lg shadow-inner flex flex-col items-center">
            {/* Header of the tag */}
            <div className="w-full text-center border-b-2 border-slate-900 pb-2 mb-3">
              <div className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-700">
                FORENSIC EVIDENCE IDENTIFIER
              </div>
              <div className="text-xl font-mono font-black text-slate-950 tracking-wider">
                {evidence.id}
              </div>
              <div className="text-xs font-mono font-medium text-slate-600">
                CASE: {evidence.caseId}
              </div>
            </div>

            {/* QR Code graphic */}
            <div className="my-2 p-2 bg-white rounded border border-slate-300">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${evidence.id}`}
                  className="w-48 h-48 block"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-100 text-xs text-slate-500">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Metadata on tag */}
            <div className="w-full text-left font-mono text-[11px] space-y-1 pt-2 border-t border-slate-300 text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">TYPE:</span>
                <span className="font-bold">{evidence.evidenceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">COLLECTED:</span>
                <span>{new Date(evidence.collectionTimestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">OFFICER:</span>
                <span>{evidence.collectingOfficer.name} ({evidence.collectingOfficer.badgeNumber})</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">HASH:</span>
                <span className="font-mono text-cyan-950">{truncateHash(evidence.recordHash, 6)}</span>
              </div>
            </div>

            <div className="mt-3 text-[9px] text-center font-mono text-slate-500 tracking-wider">
              DO NOT TAMPER • CHAIN OF CUSTODY ENFORCED
            </div>
          </div>

          {/* Payload reference & actions */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Encoded Payload:</span>
              <button
                onClick={handleCopyPayload}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : null}
                {copied ? 'Copied' : 'Copy string'}
              </button>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs font-mono text-slate-300 truncate select-all">
              {evidence.qrPayload}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2 px-4 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Evidence Bag Tag
              </button>
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`${evidence.id}-qr-tag.png`}
                  className="py-2 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Save PNG
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
