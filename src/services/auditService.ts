import { AuditEntry, AuditActionType, User } from '../types';
import { loadAuditLogs, saveAuditLogs } from './storageService';
import { computeAuditEntryHash } from './cryptoService';
import { ApiService } from './apiService';

const GENESIS_HASH = 'GENESIS_BLOCK_0000000000000000000000000000000000000000000000000000000000000000';

export class AuditService {
  static async fetchAuditLogs(): Promise<AuditEntry[]> {
    try {
      const serverLogs = await ApiService.getAuditLogs();
      if (serverLogs && Array.isArray(serverLogs) && serverLogs.length > 0) {
        saveAuditLogs(serverLogs);
        return serverLogs;
      }
    } catch {
      // Fallback
    }
    return loadAuditLogs();
  }

  static getAuditLogs(): AuditEntry[] {
    return loadAuditLogs();
  }

  static getLogsForEvidence(evidenceId: string): AuditEntry[] {
    const logs = loadAuditLogs();
    return logs.filter(l => l.evidenceId === evidenceId);
  }

  static getLogsForCase(caseId: string): AuditEntry[] {
    const logs = loadAuditLogs();
    return logs.filter(l => l.caseId === caseId);
  }

  static async logAction(params: {
    action: AuditActionType;
    user: User;
    description: string;
    evidenceId?: string;
    caseId?: string;
    metadata?: Record<string, any>;
  }): Promise<AuditEntry> {
    const logs = loadAuditLogs();
    const lastEntry = logs[logs.length - 1];
    const previousHash = lastEntry ? lastEntry.hash : GENESIS_HASH;
    const timestamp = new Date().toISOString();
    const id = `AUD-${String(logs.length + 1).padStart(4, '0')}`;

    const computedHash = await computeAuditEntryHash(
      previousHash,
      timestamp,
      params.action,
      params.user.id,
      params.evidenceId,
      params.description
    );

    const newEntry: AuditEntry = {
      id,
      timestamp,
      action: params.action,
      evidenceId: params.evidenceId,
      caseId: params.caseId,
      userId: params.user.id,
      userName: params.user.name,
      userRole: params.user.role,
      badgeNumber: params.user.badgeNumber,
      description: params.description,
      metadata: params.metadata,
      previousHash,
      hash: computedHash,
    };

    logs.push(newEntry);
    saveAuditLogs(logs);
    return newEntry;
  }

  /**
   * Verifies the cryptographic chain of all audit entries.
   * Leverages server backend validation with local cryptographic recomputation fallback.
   */
  static async verifyLedgerIntegrity(): Promise<{
    valid: boolean;
    totalEntries: number;
    verifiedCount: number;
    tamperedIndex: number | null;
    tamperedEntryId?: string;
    message: string;
  }> {
    // 1. Try server backend verification first
    try {
      const serverResult = await ApiService.verifyLedgerIntegrity();
      if (serverResult) {
        return serverResult;
      }
    } catch {
      // Fallback to local computation
    }

    const logs = loadAuditLogs();
    if (logs.length === 0) {
      return {
        valid: true,
        totalEntries: 0,
        verifiedCount: 0,
        tamperedIndex: null,
        message: 'Ledger is empty. No blocks to verify.',
      };
    }

    let expectedPrevHash = GENESIS_HASH;

    for (let i = 0; i < logs.length; i++) {
      const entry = logs[i];

      // Check linkage
      if (entry.previousHash !== expectedPrevHash) {
        return {
          valid: false,
          totalEntries: logs.length,
          verifiedCount: i,
          tamperedIndex: i,
          tamperedEntryId: entry.id,
          message: `Chain Broken at block #${i + 1} (${entry.id}). Previous hash mismatch. Possible record insertion, deletion, or modification detected.`,
        };
      }

      // Recompute and check self-hash
      const recomputedHash = await computeAuditEntryHash(
        entry.previousHash,
        entry.timestamp,
        entry.action,
        entry.userId,
        entry.evidenceId,
        entry.description
      );

      if (recomputedHash !== entry.hash) {
        return {
          valid: false,
          totalEntries: logs.length,
          verifiedCount: i,
          tamperedIndex: i,
          tamperedEntryId: entry.id,
          message: `Cryptographic Signature Invalid at block #${i + 1} (${entry.id}). Content was altered after recording.`,
        };
      }

      expectedPrevHash = entry.hash;
    }

    return {
      valid: true,
      totalEntries: logs.length,
      verifiedCount: logs.length,
      tamperedIndex: null,
      message: `All ${logs.length} audit blocks cryptographically verified with 100% integrity. Chain of custody is intact.`,
    };
  }

  // Demonstration method to simulate tamper attack
  static async simulateTamperAttack(): Promise<void> {
    try {
      await ApiService.simulateTamperAttack();
      await this.fetchAuditLogs();
      return;
    } catch {
      // Local fallback
    }

    const logs = loadAuditLogs();
    if (logs.length > 2) {
      logs[1].description = 'UNAUTHORIZED ALTERATION: Tampered description bypassing forensic controls';
      saveAuditLogs(logs);
    }
  }
}
