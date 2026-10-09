import {
  User,
  UserRole,
  CrimeCase,
  EvidenceItem,
  ModificationRequest,
  AuditEntry,
} from '../types';

export class ApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const res = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || `HTTP error ${res.status}`);
      }

      return res.json();
    } catch (err) {
      console.warn(`[Backend API] Request to /api${endpoint} failed:`, err);
      throw err;
    }
  }

  // Health
  static async getHealth() {
    return this.request<{ status: string; totalCases: number; totalEvidence: number }>('/health');
  }

  // Users
  static async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  static async updateUserRole(userId: string, role: UserRole): Promise<User> {
    return this.request<User>(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  static async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<User> {
    return this.request<User>(`/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Biometric Fingerprint Access
  static async requestFingerprintChallenge(userId: string) {
    return this.request<{
      challenge: string;
      userId: string;
      badgeNumber: string;
      name: string;
      role: UserRole;
      biometricKeyId: string;
    }>('/auth/fingerprint/challenge', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  static async verifyFingerprint(params: {
    challenge: string;
    userId: string;
    signature?: string;
    actionName?: string;
  }) {
    return this.request<{
      success: boolean;
      verified: boolean;
      user: User;
      authProofToken: string;
      message: string;
    }>('/auth/fingerprint/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  static async enrollFingerprint(userId: string, templateData?: string) {
    return this.request<{
      success: boolean;
      user: User;
      fingerprintHash: string;
      biometricKeyId: string;
      message: string;
    }>('/auth/fingerprint/enroll', {
      method: 'POST',
      body: JSON.stringify({ userId, templateData }),
    });
  }

  // Cases
  static async getCases(): Promise<CrimeCase[]> {
    return this.request<CrimeCase[]>('/cases');
  }

  static async createCase(params: {
    title: string;
    crimeLocation: string;
    description: string;
    userId: string;
  }): Promise<CrimeCase> {
    return this.request<CrimeCase>('/cases', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Evidence
  static async getEvidence(): Promise<EvidenceItem[]> {
    return this.request<EvidenceItem[]>('/evidence');
  }

  static async registerEvidence(params: {
    caseId: string;
    name: string;
    evidenceType: string;
    description: string;
    address: string;
    roomOrSector?: string;
    coordinates?: string;
    storageLocation: string;
    imageUrl?: string;
    fileHash?: string;
    userId: string;
    biometricUsed?: boolean;
  }): Promise<EvidenceItem> {
    return this.request<EvidenceItem>('/evidence', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  static async updateEvidenceStatus(params: {
    id: string;
    newStatus: string;
    notes?: string;
    userId: string;
  }): Promise<EvidenceItem> {
    return this.request<EvidenceItem>(`/evidence/${params.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    });
  }

  static async transferCustody(params: {
    id: string;
    toCustodian: string;
    newStorageLocation: string;
    purpose: string;
    userId: string;
    biometricVerified?: boolean;
  }): Promise<EvidenceItem> {
    return this.request<EvidenceItem>(`/evidence/${params.id}/transfer`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Modifications
  static async getModifications(): Promise<ModificationRequest[]> {
    return this.request<ModificationRequest[]>('/modifications');
  }

  static async requestModification(params: {
    evidenceId: string;
    fieldToChange: string;
    fieldNameDisplay: string;
    originalValue: string;
    requestedValue: string;
    reason: string;
    userId: string;
    biometricUsed?: boolean;
  }): Promise<ModificationRequest> {
    return this.request<ModificationRequest>('/modifications', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  static async reviewModification(params: {
    id: string;
    status: 'APPROVED' | 'REJECTED';
    reviewNotes?: string;
    userId: string;
    biometricVerified?: boolean;
  }): Promise<ModificationRequest> {
    return this.request<ModificationRequest>(`/modifications/${params.id}/review`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Audit
  static async getAuditLogs(): Promise<AuditEntry[]> {
    return this.request<AuditEntry[]>('/audit');
  }

  static async verifyLedgerIntegrity() {
    return this.request<{
      valid: boolean;
      totalEntries: number;
      verifiedCount: number;
      tamperedIndex: number | null;
      tamperedEntryId?: string;
      message: string;
    }>('/audit/verify');
  }

  static async simulateTamperAttack() {
    return this.request<{ success: boolean; message: string }>('/audit/simulate-tamper', {
      method: 'POST',
    });
  }
}
