import { User, UserRole, EvidenceItem } from '../types';
import { loadUsers, saveUsers, getCurrentUserId, setCurrentUserId } from './storageService';
import { ApiService } from './apiService';

export const ROLE_DETAILS: Record<UserRole, { label: string; badgeClass: string; description: string }> = {
  FIELD_OFFICER: {
    label: 'Field Officer',
    badgeClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    description: 'First responder at crime scene. Registers evidence, captures photos and locked timestamps. Cannot silently modify.',
  },
  INVESTIGATOR: {
    label: 'Investigator',
    badgeClass: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    description: 'Case detective. Analyzes evidence, tracks chain of custody movement, and views forensic history.',
  },
  HIGHER_OFFICIAL: {
    label: 'Higher Official',
    badgeClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'Judicial / Internal affairs official. Reviews, approves or rejects evidence modification requests and authorizes court submission.',
  },
  ADMINISTRATOR: {
    label: 'System Administrator',
    badgeClass: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    description: 'Security operator. Manages personnel roles, enforces RBAC policies, and audits cryptographic chain integrity.',
  },
};

export class AuthService {
  static async fetchUsers(): Promise<User[]> {
    try {
      const serverUsers = await ApiService.getUsers();
      if (serverUsers && Array.isArray(serverUsers) && serverUsers.length > 0) {
        saveUsers(serverUsers);
        return serverUsers;
      }
    } catch {
      // Fallback
    }
    return loadUsers();
  }

  static getCurrentUser(): User {
    const users = loadUsers();
    const currentId = getCurrentUserId();
    const found = users.find(u => u.id === currentId);
    return found || users[0];
  }

  static switchUser(userId: string): User {
    setCurrentUserId(userId);
    return this.getCurrentUser();
  }

  static getAllUsers(): User[] {
    return loadUsers();
  }

  static async updateUserRole(userId: string, newRole: UserRole): Promise<User | null> {
    try {
      const updated = await ApiService.updateUserRole(userId, newRole);
      if (updated) {
        const users = loadUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) users[idx] = updated;
        saveUsers(users);
        return updated;
      }
    } catch (err) {
      console.warn('[AuthService] Backend updateUserRole fallback to local:', err);
    }

    const users = loadUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    users[idx].role = newRole;
    saveUsers(users);
    return users[idx];
  }

  static async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<User | null> {
    try {
      const updated = await ApiService.updateUserStatus(userId, status);
      if (updated) {
        const users = loadUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx !== -1) users[idx] = updated;
        saveUsers(users);
        return updated;
      }
    } catch (err) {
      console.warn('[AuthService] Backend updateUserStatus fallback to local:', err);
    }

    const users = loadUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    users[idx].status = status;
    saveUsers(users);
    return users[idx];
  }

  // RBAC permission checks
  static canCreateCase(user: User): boolean {
    return user.status === 'ACTIVE' && (user.role === 'INVESTIGATOR' || user.role === 'HIGHER_OFFICIAL' || user.role === 'ADMINISTRATOR');
  }

  static canRegisterEvidence(user: User): boolean {
    return user.status === 'ACTIVE' && (user.role === 'FIELD_OFFICER' || user.role === 'ADMINISTRATOR');
  }

  static canRequestModification(user: User, _evidence?: EvidenceItem): boolean {
    return user.status === 'ACTIVE';
  }

  static canUpdateEvidenceStatus(user: User): boolean {
    return user.status === 'ACTIVE';
  }

  static canTransferCustody(user: User): boolean {
    return user.status === 'ACTIVE';
  }

  static canReviewModifications(user: User): boolean {
    return user.status === 'ACTIVE' && (user.role === 'HIGHER_OFFICIAL' || user.role === 'ADMINISTRATOR');
  }

  static canManageUsers(user: User): boolean {
    return user.status === 'ACTIVE' && user.role === 'ADMINISTRATOR';
  }
}
