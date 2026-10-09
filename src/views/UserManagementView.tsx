import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { AuthService, ROLE_DETAILS } from '../services/authService';
import { FingerprintModal } from '../components/common/FingerprintModal';
import {
  Users,
  Shield,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  KeyRound,
  ShieldAlert,
  Fingerprint,
} from 'lucide-react';

interface UserManagementViewProps {
  currentUser: User;
  onRefreshData: () => void;
  onSwitchUser: (userId: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onRefreshData,
  onSwitchUser,
}) => {
  const [users, setUsers] = useState<User[]>(AuthService.getAllUsers());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [testingBiometricsForUser, setTestingBiometricsForUser] = useState<User | null>(null);

  const canManage = AuthService.canManageUsers(currentUser);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const updated = await AuthService.updateUserRole(userId, newRole);
    if (updated) {
      setUsers(AuthService.getAllUsers());
      onRefreshData();
      setSuccessMsg(`Role for ${updated.name} updated to ${ROLE_DETAILS[newRole].label}`);
      setTimeout(() => setSuccessMsg(null), 2500);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: 'ACTIVE' | 'SUSPENDED') => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated = await AuthService.updateUserStatus(userId, nextStatus);
    if (updated) {
      setUsers(AuthService.getAllUsers());
      onRefreshData();
      setSuccessMsg(`Status for ${updated.name} set to ${nextStatus}`);
      setTimeout(() => setSuccessMsg(null), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            <span>Personnel & Role-Based Access Control (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Law enforcement identity management, division assignments, and granular operational privilege allocation.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* RBAC Privilege Matrix Overview */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
          System Privilege Matrix by Operational Role
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Create Case</th>
                <th className="py-2.5 px-3">Register Evidence</th>
                <th className="py-2.5 px-3">Request Modification</th>
                <th className="py-2.5 px-3">Approve/Reject Modification</th>
                <th className="py-2.5 px-3">Verify Ledger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
              <tr>
                <td className="py-2.5 px-3 text-amber-400 font-bold">Field Officer</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
                <td className="py-2.5 px-3 text-rose-400">DENIED</td>
                <td className="py-2.5 px-3 text-slate-500">VIEW ONLY</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-cyan-400 font-bold">Investigator</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
                <td className="py-2.5 px-3 text-slate-500">RESTRICTED</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
                <td className="py-2.5 px-3 text-rose-400">DENIED</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Higher Official</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
                <td className="py-2.5 px-3 text-slate-500">SUPERVISORY</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">AUTHORITY</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-purple-400 font-bold">Administrator</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">AUTHORITY</td>
                <td className="py-2.5 px-3 text-emerald-400">ALLOWED</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Registered Personnel Records</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map(u => {
            const isSelf = u.id === currentUser.id;
            const rConfig = ROLE_DETAILS[u.role];

            return (
              <div
                key={u.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-white">{u.name}</h4>
                      {isSelf && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Badge: {u.badgeNumber} · {u.email}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {u.department}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {u.status}
                  </span>
                </div>

                {/* Role description */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-mono text-cyan-400 font-semibold">
                    {rConfig.label}
                  </div>
                  <div>{rConfig.description}</div>
                </div>

                {/* Biometric Credentials Badge & Action */}
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-white font-mono text-[10px] font-bold">
                        BIOMETRIC SENSOR: ENROLLED
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Hardware Key: bio-key-{u.badgeNumber.toLowerCase()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setTestingBiometricsForUser(u)}
                    className="py-1 px-2.5 rounded bg-cyan-950/80 border border-cyan-800/80 hover:bg-cyan-900 text-cyan-300 font-mono text-[10px] transition-colors cursor-pointer"
                  >
                    Test Sensor
                  </button>
                </div>

                {/* Role Selector */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-[11px] text-slate-400 font-mono">Role:</label>
                    <select
                      value={u.role}
                      disabled={!canManage && !isSelf}
                      onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                    >
                      <option value="FIELD_OFFICER">Field Officer</option>
                      <option value="INVESTIGATOR">Investigator</option>
                      <option value="HIGHER_OFFICIAL">Higher Official</option>
                      <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isSelf && (
                      <button
                        onClick={() => onSwitchUser(u.id)}
                        className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] transition-colors cursor-pointer"
                      >
                        Switch To
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Biometric Sensor Diagnostic Modal */}
      {testingBiometricsForUser && (
        <FingerprintModal
          isOpen={!!testingBiometricsForUser}
          user={testingBiometricsForUser}
          actionTitle="Biometric Thumb Sensor Hardware Test"
          actionDescription={`Testing live optical thumb verification and epidermal ridge recognition sensor for ${testingBiometricsForUser.name}.`}
          onClose={() => setTestingBiometricsForUser(null)}
          onSuccess={(token) => {
            setSuccessMsg(`Biometric thumb scan passed with 99.4% confidence for ${testingBiometricsForUser.name} (Proof: ${token.slice(0, 12)}...)`);
            setTestingBiometricsForUser(null);
            setTimeout(() => setSuccessMsg(null), 4000);
          }}
        />
      )}
    </div>
  );
};
