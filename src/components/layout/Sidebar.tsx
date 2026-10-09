import React from 'react';
import { User } from '../../types';
import { AuthService } from '../../services/authService';
import {
  LayoutDashboard,
  FolderArchive,
  FilePlus2,
  Boxes,
  FileCheck2,
  History,
  QrCode,
  Users,
  ShieldAlert,
  Info,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User;
  pendingApprovalsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  pendingApprovalsCount,
}) => {
  const canRegister = AuthService.canRegisterEvidence(currentUser);
  const canManageUsers = AuthService.canManageUsers(currentUser);
  const canReview = AuthService.canReviewModifications(currentUser);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'cases',
      label: 'Case Management',
      icon: FolderArchive,
      badge: null,
    },
    {
      id: 'ai-timeline',
      label: 'AI Timeline & Analysis',
      icon: Sparkles,
      badge: 'Gemini',
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
    },
    {
      id: 'evidence-list',
      label: 'Evidence Vault',
      icon: Boxes,
      badge: null,
    },
    {
      id: 'register-evidence',
      label: 'Register Evidence',
      icon: FilePlus2,
      badge: canRegister ? 'Ready' : null,
      highlight: true,
    },
    {
      id: 'modifications',
      label: 'Modification Approvals',
      icon: FileCheck2,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'audit-trail',
      label: 'Audit Trail & Chain',
      icon: History,
      badge: null,
    },
    {
      id: 'verification',
      label: 'QR & Hash Verification',
      icon: QrCode,
      badge: null,
    },
    {
      id: 'users',
      label: 'Personnel & Roles',
      icon: Users,
      badge: canManageUsers ? 'Admin' : null,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'security',
      label: 'Security & Architecture',
      icon: ShieldAlert,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950/75 backdrop-blur-xl border-r border-slate-800/80 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 select-none">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navItems.map(item => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900/90 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-cyan-400' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      item.badgeColor ||
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Forensic System Specs Widget */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 font-mono space-y-1.5 shadow-lg backdrop-blur-md">
          <div className="text-white font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Forensic Ledger</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-800">
              v2.5.0
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            Hash Standard: <span className="text-cyan-400">SHA-256</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Bottleneck Radar: <span className="text-cyan-300">ACTIVE</span>
          </div>
          <div className="text-[10px] text-slate-400">
            RBAC Enforcement: <span className="text-emerald-400">ACTIVE</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Silent Edits: <span className="text-rose-400">BLOCKED</span>
          </div>
        </div>
      </div>

      {/* Role permission info card */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="text-[10px] text-slate-400 space-y-1">
          <div className="font-mono text-slate-400 uppercase tracking-wider">
            Current Permissions
          </div>
          <div className="text-slate-300 font-medium">
            {currentUser.name}
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            {currentUser.role === 'FIELD_OFFICER' &&
              'Can register evidence & request changes. Direct silent overwrite blocked.'}
            {currentUser.role === 'INVESTIGATOR' &&
              'Can track evidence movement, inspect custody and view history.'}
            {currentUser.role === 'HIGHER_OFFICIAL' &&
              'Can review, approve, or reject evidence modification requests.'}
            {currentUser.role === 'ADMINISTRATOR' &&
              'System management, RBAC access, and full audit authority.'}
          </div>
        </div>
      </div>
    </aside>
  );
};
