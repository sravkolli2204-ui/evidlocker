import React from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck2,
  Database,
  History,
  AlertTriangle,
  Fingerprint,
  CheckCircle2,
} from 'lucide-react';

export const SecurityView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <span>Security Architecture & Cryptographic Specifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Formal delineation of Authentication, Authorization, Cryptographic Data Fingerprinting, and Immutable Audit Trails.
          </p>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-white">
            Security Guarantee Disclosure Policy
          </div>
          <p className="text-slate-400 leading-relaxed">
            In compliance with forensic integrity principles, this system does not claim unverified end-to-end encryption guarantees. Instead, it implements verifiable cryptographic SHA-256 data fingerprinting, role-based boundary enforcement, and blockchain-style audit chaining across every evidence transition.
          </p>
        </div>
      </div>

      {/* 4 Pillars Separation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: Authentication */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>1. Authentication (Identity Verification)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every action requires an active authenticated session tied to a verified officer identity, badge number, and division.
          </p>
          <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Session bound to unique law enforcement credentials</li>
            <li>No anonymous evidence registration or viewing allowed</li>
            <li>Multi-role switching provided for rapid operational delegation</li>
          </ul>
        </div>

        {/* Pillar 2: Authorization (RBAC) */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>2. Authorization (Granular RBAC)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Strict separation of duties enforced at the service layer.
          </p>
          <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
            <li><strong>Field Officer:</strong> First responder; registers evidence, cannot directly overwrite.</li>
            <li><strong>Investigator:</strong> Tracks chain of custody movement across crime labs.</li>
            <li><strong>Higher Official:</strong> Sole authorization to approve or reject record modifications.</li>
            <li><strong>Administrator:</strong> Security policy, personnel management, audit authority.</li>
          </ul>
        </div>

        {/* Pillar 3: Cryptographic Integrity & File Fingerprinting */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Fingerprint className="w-4 h-4" />
            <span>3. Cryptographic Fingerprinting (SHA-256)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Real W3C Web Cryptography API computes deterministic SHA-256 digests.
          </p>
          <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Physical evidence photos and binaries hashed upon selection</li>
            <li>Evidence record fields combined into cryptographic composite digest</li>
            <li>Any unauthorized alteration produces an immediate checksum mismatch</li>
          </ul>
        </div>

        {/* Pillar 4: Tamper-Evident Chained Audit Logging */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>4. Chained Audit Ledger (Tamper-Evident)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every ledger block mathematically incorporates the previous block&apos;s SHA-256 hash.
          </p>
          <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Previous hash linking: <code className="text-cyan-400 font-mono">H_n = SHA256(H_n-1 + Data)</code></li>
            <li>Inserting, deleting, or editing any historical block breaks all subsequent links</li>
            <li>Built-in ledger audit tool mathematically verifies whole chain in milliseconds</li>
          </ul>
        </div>
      </div>

      {/* Modification Governance Protocol */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-semibold text-sm text-white flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-cyan-400" />
          <span>Non-Silent Modification Protocol (Zero Overwrite Policy)</span>
        </h3>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
          <div className="text-slate-400">
            [Field Officer Requests Correction] → [System Locks Request & Records Reason]
          </div>
          <div className="text-cyan-400 pl-4">
            ↓ Dual-Control Approval Required
          </div>
          <div className="text-slate-400">
            [Higher Official Evaluates Original vs Requested Diff]
          </div>
          <div className="text-emerald-400 pl-4">
            ├─ [IF APPROVED] → Advances Version to v2.0, preserves original entry in audit history
          </div>
          <div className="text-rose-400 pl-4">
            └─ [IF REJECTED] → Record remains unchanged, rejection reason logged
          </div>
        </div>
      </div>

      {/* System Version & Architecture Changelog */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm text-white font-mono">
              System Release Specification: v2.5.0-ENTERPRISE
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600">
            PRODUCTION READY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="font-bold text-cyan-400 font-mono">Recharts Forensic Bottleneck Radar</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Real-time interactive distribution across all 7 custody lifecycle stages. Automated detection of pipeline bottlenecks with one-click table filtering.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="font-bold text-cyan-400 font-mono">Creative Forensic Matrix HUD</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Tactical crime-scene coordinate grid, ultraviolet laser scanner, reticle crosshairs, and multi-atmosphere ambient presets (Forensic Grid, Cyber Enclave, UV Lab, Tactical HUD).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="font-bold text-cyan-400 font-mono">Biometric Fingerprint Hardware Enclave</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              WebAuthn cryptographic challenge-response protocol. Generates tamper-proof SHA-256 minutiae proofs for evidence intake, custody transfers, and supervisory approvals.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
            <div className="font-bold text-cyan-400 font-mono">Gemini AI Crime-Scene Reconstruction</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Temporal synthesis engine correlating physical evidence discovery timestamps with perimeter breach dynamics, audit chain events, and judicial court admissibility ratings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
