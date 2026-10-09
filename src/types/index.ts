export type UserRole = 'FIELD_OFFICER' | 'INVESTIGATOR' | 'HIGHER_OFFICIAL' | 'ADMINISTRATOR';

export interface User {
  id: string;
  name: string;
  badgeNumber: string;
  role: UserRole;
  email: string;
  department: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'SUSPENDED';
}

export type EvidenceStatus =
  | 'COLLECTED'
  | 'REGISTERED'
  | 'STORED'
  | 'TRANSFERRED'
  | 'FORENSIC ANALYSIS'
  | 'VERIFIED'
  | 'SUBMITTED TO COURT';

export type EvidenceType =
  | 'Metal Object / Weapon'
  | 'Firearm & Ballistics'
  | 'Digital Media / Storage'
  | 'Biological / DNA'
  | 'Chemical / Narcotics'
  | 'Documents / Records'
  | 'Trace Evidence'
  | 'Other Physical Evidence';

export interface EvidenceItem {
  id: string; // e.g. EV-2026-0001
  caseId: string; // e.g. CASE-2026-001
  name: string;
  evidenceType: EvidenceType;
  description: string;
  collectionTimestamp: string; // Locked after creation
  collectionLocation: {
    address: string;
    roomOrSector?: string;
    coordinates?: string;
  };
  collectingOfficer: {
    id: string;
    name: string;
    badgeNumber: string;
    department: string;
  };
  currentCustodian: string;
  currentStatus: EvidenceStatus;
  storageLocation: string;
  imageUrl?: string;
  fileHash?: string; // SHA-256 of attached photo/file
  recordHash: string; // SHA-256 of entire immutable record
  version: number;
  qrPayload: string;
  isDemo?: boolean;
}

export type ModificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ModificationRequest {
  id: string;
  evidenceId: string;
  caseId: string;
  requestedBy: {
    id: string;
    name: string;
    badgeNumber: string;
    role: UserRole;
  };
  requestTimestamp: string;
  fieldToChange: 'evidenceType' | 'name' | 'description' | 'location' | 'storageLocation';
  fieldNameDisplay: string;
  originalValue: string;
  requestedValue: string;
  reason: string;
  status: ModificationStatus;
  reviewedBy?: {
    id: string;
    name: string;
    badgeNumber: string;
    role: UserRole;
  };
  reviewTimestamp?: string;
  reviewNotes?: string;
}

export type AuditActionType =
  | 'EVIDENCE_CREATED'
  | 'EVIDENCE_VIEWED'
  | 'CUSTODY_TRANSFERRED'
  | 'MODIFICATION_REQUESTED'
  | 'MODIFICATION_APPROVED'
  | 'MODIFICATION_REJECTED'
  | 'STATUS_UPDATED'
  | 'CASE_CREATED'
  | 'INTEGRITY_VERIFIED'
  | 'USER_UPDATED';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditActionType;
  evidenceId?: string;
  caseId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  badgeNumber: string;
  description: string;
  metadata?: Record<string, any>;
  previousHash: string;
  hash: string; // cryptographic chaining
}

export type CaseStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'TRIAL_PENDING' | 'CLOSED';

export interface CrimeCase {
  id: string; // CASE-2026-001
  title: string;
  crimeLocation: string;
  openedDate: string;
  status: CaseStatus;
  leadInvestigator: {
    id: string;
    name: string;
    badgeNumber: string;
  };
  description: string;
  evidenceCount: number;
  isDemo?: boolean;
}

export interface CustodyTransferRecord {
  id: string;
  evidenceId: string;
  fromCustodian: string;
  toCustodian: string;
  purpose: string;
  transferTimestamp: string;
  authorizedBy: string;
  receivedBy?: string;
  status: 'PENDING' | 'COMPLETED';
}
