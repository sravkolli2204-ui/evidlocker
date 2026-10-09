import {
  EvidenceItem,
  EvidenceStatus,
  EvidenceType,
  CrimeCase,
  ModificationRequest,
  User,
} from '../types';
import {
  loadEvidence,
  saveEvidence,
  loadCases,
  saveCases,
  loadModifications,
  saveModifications,
} from './storageService';
import { computeEvidenceRecordHash } from './cryptoService';
import { AuditService } from './auditService';
import { ApiService } from './apiService';

export class EvidenceService {
  // --- Case Operations ---
  static async fetchCases(): Promise<CrimeCase[]> {
    try {
      const serverCases = await ApiService.getCases();
      if (serverCases && Array.isArray(serverCases) && serverCases.length > 0) {
        saveCases(serverCases);
        return serverCases;
      }
    } catch {
      // Backend offline or starting, fall back to local storage
    }
    return loadCases();
  }

  static getCases(): CrimeCase[] {
    return loadCases();
  }

  static getCaseById(caseId: string): CrimeCase | undefined {
    return loadCases().find(c => c.id === caseId);
  }

  static async createCase(params: {
    title: string;
    crimeLocation: string;
    description: string;
    user: User;
  }): Promise<CrimeCase> {
    // 1. Try backend API first
    try {
      const created = await ApiService.createCase({
        title: params.title,
        crimeLocation: params.crimeLocation,
        description: params.description,
        userId: params.user.id,
      });
      if (created) {
        const cases = loadCases();
        cases.unshift(created);
        saveCases(cases);
        await AuditService.fetchAuditLogs();
        return created;
      }
    } catch (err) {
      console.warn('[EvidenceService] Backend createCase fallback to local:', err);
    }

    // Local fallback
    const cases = loadCases();
    const nextNum = cases.length + 1;
    const caseId = `CASE-2026-${String(nextNum).padStart(3, '0')}`;

    const newCase: CrimeCase = {
      id: caseId,
      title: params.title,
      crimeLocation: params.crimeLocation,
      openedDate: new Date().toISOString(),
      status: 'OPEN',
      leadInvestigator: {
        id: params.user.id,
        name: params.user.name,
        badgeNumber: params.user.badgeNumber,
      },
      description: params.description,
      evidenceCount: 0,
      isDemo: false,
    };

    cases.unshift(newCase);
    saveCases(cases);

    await AuditService.logAction({
      action: 'CASE_CREATED',
      user: params.user,
      caseId: newCase.id,
      description: `Case ${newCase.id} "${newCase.title}" established at location: ${newCase.crimeLocation}`,
    });

    return newCase;
  }

  // --- Evidence Operations ---
  static async fetchEvidenceList(): Promise<EvidenceItem[]> {
    try {
      const serverList = await ApiService.getEvidence();
      if (serverList && Array.isArray(serverList) && serverList.length > 0) {
        saveEvidence(serverList);
        return serverList;
      }
    } catch {
      // Fallback to local
    }
    return loadEvidence();
  }

  static getEvidenceList(): EvidenceItem[] {
    return loadEvidence();
  }

  static getEvidenceById(id: string): EvidenceItem | undefined {
    return loadEvidence().find(e => e.id === id);
  }

  static getEvidenceForCase(caseId: string): EvidenceItem[] {
    return loadEvidence().filter(e => e.caseId === caseId);
  }

  static generateEvidenceId(): string {
    const list = loadEvidence();
    const nextNum = list.length + 1;
    return `EV-2026-${String(nextNum).padStart(4, '0')}`;
  }

  static async registerEvidence(params: {
    caseId: string;
    name: string;
    evidenceType: EvidenceType;
    description: string;
    address: string;
    roomOrSector?: string;
    coordinates?: string;
    storageLocation: string;
    imageUrl?: string;
    fileHash?: string;
    user: User;
    biometricUsed?: boolean;
  }): Promise<EvidenceItem> {
    // 1. Try server backend registration
    try {
      const registered = await ApiService.registerEvidence({
        caseId: params.caseId,
        name: params.name,
        evidenceType: params.evidenceType,
        description: params.description,
        address: params.address,
        roomOrSector: params.roomOrSector,
        coordinates: params.coordinates,
        storageLocation: params.storageLocation,
        imageUrl: params.imageUrl,
        fileHash: params.fileHash,
        userId: params.user.id,
        biometricUsed: params.biometricUsed,
      });

      if (registered) {
        const evidenceList = loadEvidence();
        evidenceList.unshift(registered);
        saveEvidence(evidenceList);

        const cases = loadCases();
        const targetCase = cases.find(c => c.id === params.caseId);
        if (targetCase) {
          targetCase.evidenceCount = (targetCase.evidenceCount || 0) + 1;
          saveCases(cases);
        }

        await AuditService.fetchAuditLogs();
        return registered;
      }
    } catch (err) {
      console.warn('[EvidenceService] Backend registerEvidence fallback to local:', err);
    }

    // Local fallback
    const evidenceList = loadEvidence();
    const id = this.generateEvidenceId();
    const collectionTimestamp = new Date().toISOString();

    const locationString = `${params.address}${params.roomOrSector ? ', ' + params.roomOrSector : ''}`;

    const recordHash = await computeEvidenceRecordHash({
      id,
      caseId: params.caseId,
      evidenceType: params.evidenceType,
      description: params.description,
      collectionTimestamp,
      location: locationString,
      collectingOfficerBadge: params.user.badgeNumber,
      fileHash: params.fileHash,
      version: 1,
    });

    const qrPayload = `DEG:${id}:${params.caseId}:${recordHash.slice(0, 16)}`;

    const newItem: EvidenceItem = {
      id,
      caseId: params.caseId,
      name: params.name,
      evidenceType: params.evidenceType,
      description: params.description,
      collectionTimestamp,
      collectionLocation: {
        address: params.address,
        roomOrSector: params.roomOrSector,
        coordinates: params.coordinates || '37.7749° N, 122.4194° W',
      },
      collectingOfficer: {
        id: params.user.id,
        name: params.user.name,
        badgeNumber: params.user.badgeNumber,
        department: params.user.department,
      },
      currentCustodian: `${params.user.name} (${params.user.badgeNumber}) - Crime Scene Response`,
      currentStatus: 'REGISTERED',
      storageLocation: params.storageLocation || 'Field Evidence Locker (In-Transit)',
      imageUrl: params.imageUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      fileHash: params.fileHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      recordHash,
      version: 1,
      qrPayload,
      isDemo: false,
    };

    evidenceList.unshift(newItem);
    saveEvidence(evidenceList);

    const cases = loadCases();
    const targetCase = cases.find(c => c.id === params.caseId);
    if (targetCase) {
      targetCase.evidenceCount = (targetCase.evidenceCount || 0) + 1;
      saveCases(cases);
    }

    await AuditService.logAction({
      action: 'EVIDENCE_CREATED',
      user: params.user,
      evidenceId: id,
      caseId: params.caseId,
      description: `Evidence ${id} (${newItem.name}) registered by ${params.user.name}. Type: ${newItem.evidenceType}. Immutable timestamp and initial SHA-256 hash locked.`,
      metadata: {
        recordHash,
        fileHash: params.fileHash,
        version: 1,
      },
    });

    return newItem;
  }

  // --- Modification Request Flow ---
  static async fetchModificationRequests(): Promise<ModificationRequest[]> {
    try {
      const serverMods = await ApiService.getModifications();
      if (serverMods && Array.isArray(serverMods)) {
        saveModifications(serverMods);
        return serverMods;
      }
    } catch {
      // Fallback to local
    }
    return loadModifications();
  }

  static getModificationRequests(): ModificationRequest[] {
    return loadModifications();
  }

  static getPendingModificationCount(): number {
    return loadModifications().filter(m => m.status === 'PENDING').length;
  }

  static async requestModification(params: {
    evidenceId: string;
    fieldToChange: 'evidenceType' | 'name' | 'description' | 'location' | 'storageLocation';
    fieldNameDisplay: string;
    originalValue: string;
    requestedValue: string;
    reason: string;
    user: User;
    biometricUsed?: boolean;
  }): Promise<ModificationRequest> {
    // 1. Try server backend
    try {
      const createdMod = await ApiService.requestModification({
        evidenceId: params.evidenceId,
        fieldToChange: params.fieldToChange,
        fieldNameDisplay: params.fieldNameDisplay,
        originalValue: params.originalValue,
        requestedValue: params.requestedValue,
        reason: params.reason,
        userId: params.user.id,
        biometricUsed: params.biometricUsed,
      });

      if (createdMod) {
        const mods = loadModifications();
        mods.unshift(createdMod);
        saveModifications(mods);
        await AuditService.fetchAuditLogs();
        return createdMod;
      }
    } catch (err) {
      console.warn('[EvidenceService] Backend requestModification fallback to local:', err);
    }

    // Local fallback
    const evidence = this.getEvidenceById(params.evidenceId);
    if (!evidence) {
      throw new Error(`Evidence with ID ${params.evidenceId} not found.`);
    }

    const mods = loadModifications();
    const id = `MOD-2026-${String(mods.length + 1).padStart(3, '0')}`;

    const newMod: ModificationRequest = {
      id,
      evidenceId: params.evidenceId,
      caseId: evidence.caseId,
      requestedBy: {
        id: params.user.id,
        name: params.user.name,
        badgeNumber: params.user.badgeNumber,
        role: params.user.role,
      },
      requestTimestamp: new Date().toISOString(),
      fieldToChange: params.fieldToChange,
      fieldNameDisplay: params.fieldNameDisplay,
      originalValue: params.originalValue,
      requestedValue: params.requestedValue,
      reason: params.reason,
      status: 'PENDING',
    };

    mods.unshift(newMod);
    saveModifications(mods);

    await AuditService.logAction({
      action: 'MODIFICATION_REQUESTED',
      user: params.user,
      evidenceId: params.evidenceId,
      caseId: evidence.caseId,
      description: `Officer ${params.user.name} submitted modification request ${id} for ${params.evidenceId}: field "${params.fieldNameDisplay}" from "${params.originalValue}" -> "${params.requestedValue}". Reason: "${params.reason}". Direct silent modification blocked.`,
      metadata: {
        requestId: id,
        fieldToChange: params.fieldToChange,
        originalValue: params.originalValue,
        requestedValue: params.requestedValue,
        reason: params.reason,
      },
    });

    return newMod;
  }

  static async reviewModification(params: {
    requestId: string;
    status: 'APPROVED' | 'REJECTED';
    reviewNotes?: string;
    user: User;
    biometricVerified?: boolean;
  }): Promise<ModificationRequest> {
    // 1. Try server backend
    try {
      const reviewed = await ApiService.reviewModification({
        id: params.requestId,
        status: params.status,
        reviewNotes: params.reviewNotes,
        userId: params.user.id,
        biometricVerified: params.biometricVerified,
      });

      if (reviewed) {
        // Sync fresh evidence & modifications from server
        await this.fetchEvidenceList();
        await this.fetchModificationRequests();
        await AuditService.fetchAuditLogs();
        return reviewed;
      }
    } catch (err) {
      console.warn('[EvidenceService] Backend reviewModification fallback to local:', err);
    }

    // Local fallback
    const mods = loadModifications();
    const modIndex = mods.findIndex(m => m.id === params.requestId);
    if (modIndex === -1) {
      throw new Error(`Modification request ${params.requestId} not found.`);
    }

    const mod = mods[modIndex];
    if (mod.status !== 'PENDING') {
      throw new Error(`Request has already been reviewed (${mod.status}).`);
    }

    mod.status = params.status;
    mod.reviewedBy = {
      id: params.user.id,
      name: params.user.name,
      badgeNumber: params.user.badgeNumber,
      role: params.user.role,
    };
    mod.reviewTimestamp = new Date().toISOString();
    mod.reviewNotes = params.reviewNotes || (params.status === 'APPROVED' ? 'Approved upon supervisory review.' : 'Declined. Insufficient justification.');

    saveModifications(mods);

    const evidenceList = loadEvidence();
    const evIndex = evidenceList.findIndex(e => e.id === mod.evidenceId);

    if (params.status === 'APPROVED' && evIndex !== -1) {
      const item = evidenceList[evIndex];

      if (mod.fieldToChange === 'evidenceType') {
        item.evidenceType = mod.requestedValue as EvidenceType;
      } else if (mod.fieldToChange === 'name') {
        item.name = mod.requestedValue;
      } else if (mod.fieldToChange === 'description') {
        item.description = mod.requestedValue;
      } else if (mod.fieldToChange === 'storageLocation') {
        item.storageLocation = mod.requestedValue;
      } else if (mod.fieldToChange === 'location') {
        item.collectionLocation.address = mod.requestedValue;
      }

      item.version += 1;

      const newHash = await computeEvidenceRecordHash({
        id: item.id,
        caseId: item.caseId,
        evidenceType: item.evidenceType,
        description: item.description,
        collectionTimestamp: item.collectionTimestamp,
        location: `${item.collectionLocation.address}${item.collectionLocation.roomOrSector ? ', ' + item.collectionLocation.roomOrSector : ''}`,
        collectingOfficerBadge: item.collectingOfficer.badgeNumber,
        fileHash: item.fileHash,
        version: item.version,
      });

      item.recordHash = newHash;
      saveEvidence(evidenceList);

      await AuditService.logAction({
        action: 'MODIFICATION_APPROVED',
        user: params.user,
        evidenceId: item.id,
        caseId: item.caseId,
        description: `Modification ${mod.id} APPROVED by ${params.user.name} (${params.user.role}). Field "${mod.fieldNameDisplay}" updated to "${mod.requestedValue}". Previous value "${mod.originalValue}" permanently preserved in audit record. Evidence version advanced to v${item.version}.`,
        metadata: {
          requestId: mod.id,
          field: mod.fieldToChange,
          originalValue: mod.originalValue,
          updatedValue: mod.requestedValue,
          approverBadge: params.user.badgeNumber,
          notes: mod.reviewNotes,
          newRecordHash: newHash,
        },
      });
    } else {
      await AuditService.logAction({
        action: 'MODIFICATION_REJECTED',
        user: params.user,
        evidenceId: mod.evidenceId,
        caseId: mod.caseId,
        description: `Modification ${mod.id} REJECTED by ${params.user.name} (${params.user.role}). Field "${mod.fieldNameDisplay}" remains unmodified as "${mod.originalValue}". Reason for rejection: "${mod.reviewNotes}".`,
        metadata: {
          requestId: mod.id,
          field: mod.fieldToChange,
          originalValue: mod.originalValue,
          requestedValue: mod.requestedValue,
          reviewerBadge: params.user.badgeNumber,
          notes: mod.reviewNotes,
        },
      });
    }

    return mod;
  }

  // --- Status and Custody Lifecycle ---
  static async updateEvidenceStatus(params: {
    evidenceId: string;
    newStatus: EvidenceStatus;
    notes?: string;
    user: User;
  }): Promise<EvidenceItem> {
    try {
      const serverItem = await ApiService.updateEvidenceStatus({
        id: params.evidenceId,
        newStatus: params.newStatus,
        notes: params.notes,
        userId: params.user.id,
      });
      if (serverItem) {
        const list = loadEvidence();
        const idx = list.findIndex(e => e.id === serverItem.id);
        if (idx !== -1) list[idx] = serverItem;
        saveEvidence(list);
        await AuditService.fetchAuditLogs();
        return serverItem;
      }
    } catch (err) {
      console.warn('[EvidenceService] Backend updateEvidenceStatus fallback to local:', err);
    }

    const list = loadEvidence();
    const item = list.find(e => e.id === params.evidenceId);
    if (!item) throw new Error(`Evidence ${params.evidenceId} not found.`);

    const oldStatus = item.currentStatus;
    item.currentStatus = params.newStatus;
    saveEvidence(list);

    await AuditService.logAction({
      action: 'STATUS_UPDATED',
      user: params.user,
      evidenceId: item.id,
      caseId: item.caseId,
      description: `Evidence ${item.id} lifecycle status transitioned: [${oldStatus}] → [${params.newStatus}] by ${params.user.name}. ${params.notes ? 'Notes: ' + params.notes : ''}`,
      metadata: {
        oldStatus,
        newStatus: params.newStatus,
        notes: params.notes,
      },
    });

    return item;
  }

  static async transferCustody(params: {
    evidenceId: string;
    toCustodian: string;
    newStorageLocation: string;
    purpose: string;
    user: User;
    biometricVerified?: boolean;
  }): Promise<EvidenceItem> {
    try {
      const serverItem = await ApiService.transferCustody({
        id: params.evidenceId,
        toCustodian: params.toCustodian,
        newStorageLocation: params.newStorageLocation,
        purpose: params.purpose,
        userId: params.user.id,
        biometricVerified: params.biometricVerified,
      });
      if (serverItem) {
        const list = loadEvidence();
        const idx = list.findIndex(e => e.id === serverItem.id);
        if (idx !== -1) list[idx] = serverItem;
        saveEvidence(list);
        await AuditService.fetchAuditLogs();
        return serverItem;
      }
    } catch (err) {
      console.warn('[EvidenceService] Backend transferCustody fallback to local:', err);
    }

    const list = loadEvidence();
    const item = list.find(e => e.id === params.evidenceId);
    if (!item) throw new Error(`Evidence ${params.evidenceId} not found.`);

    const previousCustodian = item.currentCustodian;
    item.currentCustodian = params.toCustodian;
    item.storageLocation = params.newStorageLocation;
    item.currentStatus = 'TRANSFERRED';
    saveEvidence(list);

    await AuditService.logAction({
      action: 'CUSTODY_TRANSFERRED',
      user: params.user,
      evidenceId: item.id,
      caseId: item.caseId,
      description: `Chain of Custody Handover: ${item.id} transferred from [${previousCustodian}] to [${params.toCustodian}]. Location: [${params.newStorageLocation}]. Purpose: "${params.purpose}". Authorized by ${params.user.name}.`,
      metadata: {
        fromCustodian: previousCustodian,
        toCustodian: params.toCustodian,
        storageLocation: params.newStorageLocation,
        purpose: params.purpose,
      },
    });

    return item;
  }

  static async logEvidenceView(evidenceId: string, user: User): Promise<void> {
    const item = this.getEvidenceById(evidenceId);
    if (!item) return;

    await AuditService.logAction({
      action: 'EVIDENCE_VIEWED',
      user,
      evidenceId,
      caseId: item.caseId,
      description: `Digital Evidence Record ${evidenceId} accessed and reviewed by ${user.name} (${user.role}, Badge: ${user.badgeNumber}).`,
    });
  }
}
