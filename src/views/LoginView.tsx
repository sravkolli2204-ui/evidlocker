import React, { useState } from 'react';
import { User } from '../types';
import { ROLE_DETAILS } from '../services/authService';
import { FingerprintModal } from '../components/common/FingerprintModal';
import { CreativeBackground } from '../components/common/CreativeBackground';
import { Shield, ArrowRight, Lock, CheckCircle2, FileCheck2, Fingerprint, Sparkles } from 'lucide-react';

interface LoginViewProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onSelectUser }) => {
  const [biometricTargetUser, setBiometricTargetUser] = useState<User | null>(null);

  return (
    <div className="min-h-screen bg-[#030712] relative flex flex-col justify-center items-center p-4 selection:bg-cyan-500/20 selection:text-cyan-300">
      <CreativeBackground />

      <div className="max-w-3xl w-full space-y-8 animate-in fade-in duration-200 relative z-10">
        {/* Brand Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-2xl shadow-cyan-900/50 border border-cyan-400/40 mx-auto">
            <Shield className="w-8 h-8 text-cyan-100" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white font-mono">
                DIGITAL EVIDENCE GUARDIAN
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-600">
                v2.5-ENTERPRISE
              </span>
            </div>
            <p className="text-sm font-semibold text-cyan-400 font-mono tracking-wide">
              Secure. Verify. Trace. Trust.
            </p>
          </div>

          <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
            Forensic crime-scene evidence management system. Establishes cryptographic identity, immutable chain of custody, and dual-control modification approval.
          </p>
        </div>

        {/* Biometric Quick Touch Unlock Banner */}
        <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-500/40 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl shadow-cyan-950/30">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
              <Fingerprint className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                <span>BIOMETRIC FINGERPRINT ACCESS ACTIVE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-[11px] text-slate-300">
                Hardware Enclave sensor initialized. Quick login with biometric sensor.
              </div>
            </div>
          </div>

          <button
            onClick={() => setBiometricTargetUser(users[0])}
            className="py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-cyan-950/30 whitespace-nowrap"
          >
            <Fingerprint className="w-4 h-4" />
            <span>Scan Fingerprint</span>
          </button>
        </div>

        {/* User Selection Matrix */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Select Law Enforcement Identity (Biometric RBAC Authentication)
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              Role-Based Access Control
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {users.map(u => {
              const rConf = ROLE_DETAILS[u.role];
              return (
                <div
                  key={u.id}
                  onClick={() => onSelectUser(u)}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900/90 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {u.name}
                        </h3>
                        <div className="text-[11px] font-mono text-slate-400">
                          {u.badgeNumber} · {u.department}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-cyan-300">
                        {rConf.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      {rConf.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs text-cyan-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sign in as {u.name.split(' ')[0]}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center font-mono">
            Immutable timestamps · Real SHA-256 fingerprinting · Zero silent overwrites
          </div>
        </div>

        {/* Biometric Scanner Modal */}
        {biometricTargetUser && (
          <FingerprintModal
            isOpen={!!biometricTargetUser}
            user={biometricTargetUser}
            actionTitle="Biometric Login Authorization"
            actionDescription="Scan enrolled fingerprint to unlock law enforcement terminal access."
            onClose={() => setBiometricTargetUser(null)}
            onSuccess={() => {
              const u = biometricTargetUser;
              setBiometricTargetUser(null);
              onSelectUser(u);
            }}
          />
        )}
      </div>
    </div>
  );
};
