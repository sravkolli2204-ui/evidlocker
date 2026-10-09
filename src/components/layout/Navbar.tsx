import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { ROLE_DETAILS } from '../../services/authService';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Bell,
  ChevronDown,
  Layers,
  Lock,
  LogOut,
  Sparkles,
  Camera,
  QrCode,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  pendingApprovalsCount: number;
  onSwitchUser: (userId: string) => void;
  onOpenIntegrityAudit: () => void;
  onOpenFingerprint: () => void;
  onOpenQRScanner?: () => void;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  pendingApprovalsCount,
  onSwitchUser,
  onOpenIntegrityAudit,
  onOpenFingerprint,
  onOpenQRScanner,
  onNavigate,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleConfig = ROLE_DETAILS[currentUser.role];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 border-b border-slate-800/80 backdrop-blur-xl select-none shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-cyan-900/30 border border-cyan-400/30 group-hover:border-cyan-300 transition-all">
            <Shield className="w-5 h-5 text-cyan-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-base text-white">
                DIGITAL EVIDENCE GUARDIAN
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('security');
                }}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-600/70 hover:bg-cyan-900/80 transition-colors shadow-sm cursor-pointer"
                title="System Version 2.5.0-ENTERPRISE: Recharts Bottleneck Analytics + AI Timeline + Biometrics + Forensic HUD"
              >
                v2.5-ENTERPRISE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 tracking-wide font-medium flex items-center gap-2">
              <span>Secure</span>
              <span className="text-slate-600">·</span>
              <span>Verify</span>
              <span className="text-slate-600">·</span>
              <span>Trace</span>
              <span className="text-slate-600">·</span>
              <span>Trust</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Camera QR Code Scanner Button */}
          {onOpenQRScanner && (
            <button
              onClick={onOpenQRScanner}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-md bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-xs font-mono text-cyan-300 transition-colors cursor-pointer shadow-sm shadow-cyan-950/50"
              title="Camera QR Code Scanner: Scan physical evidence bag tag"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-semibold">QR Scanner</span>
            </button>
          )}

          {/* Biometric Thumbprint Sensor Button */}
          <button
            onClick={onOpenFingerprint}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-md bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
            title="Biometric Optical Thumb Scanner (Laptop / Desktop / Mobile)"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Thumb Biometrics</span>
          </button>

          {/* Quick Ledger Check Button */}
          <button
            onClick={onOpenIntegrityAudit}
            className="hidden sm:flex items-center gap-2 py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
            title="Cryptographic chain of custody validation"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Ledger Integrity</span>
          </button>

          {/* Pending Approvals quick badge */}
          {pendingApprovalsCount > 0 && (
            <button
              onClick={() => onNavigate('modifications')}
              className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-md bg-amber-950/60 border border-amber-600/40 text-amber-300 text-xs font-mono transition-colors cursor-pointer hover:bg-amber-900/50"
              title={`${pendingApprovalsCount} pending evidence modification approvals`}
            >
              <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{pendingApprovalsCount} Pending</span>
            </button>
          )}

          {/* User Profile & Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-cyan-400">
                {currentUser.badgeNumber.slice(0, 2)}
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-medium text-white flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[10px] font-mono text-cyan-400">
                  {roleConfig.label} ({currentUser.badgeNumber})
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="p-3 border-b border-slate-800 bg-slate-950/60">
                  <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    Duty Personnel Profile Switcher
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Toggle active officer profile to operate under role-based governance and custody privileges.
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  {allUsers.map(user => {
                    const isSelected = user.id === currentUser.id;
                    const rConf = ROLE_DETAILS[user.role];
                    return (
                      <button
                        key={user.id}
                        onClick={() => onSwitchUser(user.id)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-500/60 text-white'
                            : 'bg-transparent border-transparent hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="w-7 h-7 shrink-0 rounded bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-200 mt-0.5">
                          {user.badgeNumber.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-white">
                              {user.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {user.badgeNumber}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-cyan-400">
                            {rConf.label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {user.department}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 font-mono text-center">
                  RBAC Matrix Active · Silent Modifications Blocked
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
