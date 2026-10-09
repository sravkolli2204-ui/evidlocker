import {
  User,
  CrimeCase,
  EvidenceItem,
  ModificationRequest,
  AuditEntry,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'deg_users_v1',
  CASES: 'deg_cases_v1',
  EVIDENCE: 'deg_evidence_v2',
  MODIFICATIONS: 'deg_modifications_v2',
  AUDIT_LOGS: 'deg_audit_logs_v2',
  CURRENT_USER_ID: 'deg_current_user_v2',
  INITIALIZED: 'deg_initialized_v2',
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-officer-ravi',
    name: 'Inspector Vikram Rathore',
    badgeNumber: 'FO-8841',
    role: 'FIELD_OFFICER',
    email: 'vikram.rathore@forensics.gov.in',
    department: 'Crime Scene First Response & Evidence Intake Unit',
    status: 'ACTIVE',
  },
  {
    id: 'usr-det-sarah',
    name: 'Det. Ananya Sharma',
    badgeNumber: 'INV-4029',
    role: 'INVESTIGATOR',
    email: 'ananya.sharma@forensics.gov.in',
    department: 'Major Cyber & Forensic Investigation Division',
    status: 'ACTIVE',
  },
  {
    id: 'usr-insp-marcus',
    name: 'Superintendent Rajesh Verma',
    badgeNumber: 'HO-1002',
    role: 'HIGHER_OFFICIAL',
    email: 'rajesh.verma@forensics.gov.in',
    department: 'Judicial Liaison & Supervisory Oversight Division',
    status: 'ACTIVE',
  },
  {
    id: 'usr-admin-elena',
    name: 'Director Priya Deshmukh',
    badgeNumber: 'ADM-0001',
    role: 'ADMINISTRATOR',
    email: 'priya.deshmukh@cybersec.gov.in',
    department: 'Department of Digital Security & Cryptographic Forensics',
    status: 'ACTIVE',
  },
];

export const INITIAL_CASES: CrimeCase[] = [
  {
    id: 'CASE-2026-001',
    title: 'Downtown Vault Security Breach & Burglary',
    crimeLocation: '742 Grand Avenue, Downtown Metro Financial District',
    openedDate: '2026-10-05T08:15:00.000Z',
    status: 'UNDER_INVESTIGATION',
    leadInvestigator: {
      id: 'usr-det-sarah',
      name: 'Det. Ananya Sharma',
      badgeNumber: 'INV-4029',
    },
    description: 'Forced entry via secondary vault service shaft. Safe deposit boxes targeted with mechanical and electronic intrusion apparatus.',
    evidenceCount: 2,
  },
  {
    id: 'CASE-2026-002',
    title: 'Pier 14 Maritime Warehouse Contraband Interception',
    crimeLocation: 'Warehouse B, Terminal 3, Metro Seaport',
    openedDate: '2026-10-06T14:30:00.000Z',
    status: 'OPEN',
    leadInvestigator: {
      id: 'usr-det-sarah',
      name: 'Det. Ananya Sharma',
      badgeNumber: 'INV-4029',
    },
    description: 'Suspicious shipping container flagged during customs thermal imaging. Unregistered firearms and telecommunication jammers recovered.',
    evidenceCount: 1,
  },
  {
    id: 'CASE-2026-003',
    title: 'Apex Financial Cryptographic Ransomware Attack',
    crimeLocation: 'Server Room 4B, Apex Tower, Tech Corridor',
    openedDate: '2026-10-07T03:40:00.000Z',
    status: 'UNDER_INVESTIGATION',
    leadInvestigator: {
      id: 'usr-det-sarah',
      name: 'Det. Ananya Sharma',
      badgeNumber: 'INV-4029',
    },
    description: 'Core clearing database encrypted by state-sponsored malware variant. Air-gapped backup server drives seized for digital forensics.',
    evidenceCount: 1,
  },
];

export const INITIAL_EVIDENCE: EvidenceItem[] = [
  {
    id: 'EV-2026-0001',
    caseId: 'CASE-2026-001',
    name: '36-inch Forged Alloy Prying Tool (Crowbar)',
    evidenceType: 'Metal Object / Weapon',
    description: 'Heavy duty steel crowbar with red oxidized paint scratches. Found adjacent to the north security door frame with visible paint transfer from door lock mechanism.',
    collectionTimestamp: '2026-10-05T09:12:44.000Z',
    collectionLocation: {
      address: '742 Grand Avenue, Floor -1, Service Hallway',
      roomOrSector: 'Vault Access Corridor North',
      coordinates: '37.7749° N, 122.4194° W',
    },
    collectingOfficer: {
      id: 'usr-officer-ravi',
      name: 'Inspector Vikram Rathore',
      badgeNumber: 'FO-8841',
      department: 'Crime Scene First Response Unit',
    },
    currentCustodian: 'Central Secure Evidence Locker Room 2, Bay C-14',
    currentStatus: 'STORED',
    storageLocation: 'Central Vault #2 - Bay C14',
    imageUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80',
    fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    recordHash: '8f7a93e2b104928bcf6270451a998b3fca40134bc57564d39e2482315b9cf412',
    version: 1,
    qrPayload: 'DEG:EV-2026-0001:CASE-2026-001:VERIFIED-AUTH',
  },
  {
    id: 'EV-2026-0002',
    caseId: 'CASE-2026-001',
    name: 'Encrypted Samsung 990 Pro 2TB NVMe SSD',
    evidenceType: 'Digital Media / Storage',
    description: 'Solid state drive recovered plugged into rogue hardware bypass TAP device attached to the security DVR switch.',
    collectionTimestamp: '2026-10-05T10:45:12.000Z',
    collectionLocation: {
      address: '742 Grand Avenue, Security Surveillance Room 102',
      roomOrSector: 'Rack Server 04, Port 22 Bypass',
      coordinates: '37.7751° N, 122.4196° W',
    },
    collectingOfficer: {
      id: 'usr-officer-ravi',
      name: 'Inspector Vikram Rathore',
      badgeNumber: 'FO-8841',
      department: 'Crime Scene First Response Unit',
    },
    currentCustodian: 'Cyber Forensics Unit - Hardware Lab 3',
    currentStatus: 'FORENSIC ANALYSIS',
    storageLocation: 'Forensics Lab 3 - Faraday Enclosure #7',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
    fileHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    recordHash: '3c9909afec25354d551dae21590bb26e38d53f2173b8d3dc3eee4c047e7ab1c1',
    version: 1,
    qrPayload: 'DEG:EV-2026-0002:CASE-2026-001:VERIFIED-AUTH',
  },
  {
    id: 'EV-2026-0003',
    caseId: 'CASE-2026-002',
    name: 'Glock 19 Gen5 9mm Semiautomatic Firearm',
    evidenceType: 'Firearm & Ballistics',
    description: 'Handgun with defaced serial number, fitted with threaded barrel. Magazine contained 14 rounds of 9mm Luger ball ammunition.',
    collectionTimestamp: '2026-10-06T15:20:00.000Z',
    collectionLocation: {
      address: 'Terminal 3, Pier 14, Warehouse B Office',
      roomOrSector: 'Supervisor Desk Lower Locked Drawer',
      coordinates: '37.7983° N, 122.3789° W',
    },
    collectingOfficer: {
      id: 'usr-officer-ravi',
      name: 'Inspector Vikram Rathore',
      badgeNumber: 'FO-8841',
      department: 'Crime Scene First Response Unit',
    },
    currentCustodian: 'Ballistics & Firearms Analysis Section',
    currentStatus: 'REGISTERED',
    storageLocation: 'Firearms Armory Evidence Safe #12',
    imageUrl: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80',
    fileHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    recordHash: '7d5668e27c1a851167732a32c695b7a5e01b1b463281ab7911b6441113ffef6c',
    version: 1,
    qrPayload: 'DEG:EV-2026-0003:CASE-2026-002:VERIFIED-AUTH',
  },
  {
    id: 'EV-2026-0004',
    caseId: 'CASE-2026-003',
    name: 'Forensic Memory Dump USB Key (SanDisk 128GB)',
    evidenceType: 'Digital Media / Storage',
    description: 'Volatile RAM image extracted from compromised Domain Controller prior to cold shutdown. Contains decrypted malware payload traces in memory space.',
    collectionTimestamp: '2026-10-07T04:15:30.000Z',
    collectionLocation: {
      address: 'Apex Tower, 1200 Silicon Expressway, Server Room 4B',
      roomOrSector: 'Rack Bay 12, Terminal A',
      coordinates: '37.7833° N, 122.4167° W',
    },
    collectingOfficer: {
      id: 'usr-det-sarah',
      name: 'Det. Ananya Sharma',
      badgeNumber: 'INV-4029',
      department: 'Major Crimes & Forensics Division',
    },
    currentCustodian: 'State Forensic Lab - Evidence Examiner Dr. Patel',
    currentStatus: 'VERIFIED',
    storageLocation: 'High-Security Cyber Safe #01',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    fileHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    recordHash: '9a2245b78d23414986c7104b9015c9d64f027c4b693245d826f4203da8e9e992',
    version: 1,
    qrPayload: 'DEG:EV-2026-0004:CASE-2026-003:VERIFIED-AUTH',
  },
];

export const INITIAL_MODIFICATIONS: ModificationRequest[] = [
  {
    id: 'MOD-2026-001',
    evidenceId: 'EV-2026-0001',
    caseId: 'CASE-2026-001',
    requestedBy: {
      id: 'usr-officer-ravi',
      name: 'Inspector Vikram Rathore',
      badgeNumber: 'FO-8841',
      role: 'FIELD_OFFICER',
    },
    requestTimestamp: '2026-10-06T11:24:10.000Z',
    fieldToChange: 'evidenceType',
    fieldNameDisplay: 'Evidence Classification Type',
    originalValue: 'Metal Object / Weapon',
    requestedValue: 'Burglary Intrusion Tool / Weapon',
    reason: 'Initial intake classified item generically as metal weapon. Forensic metallurgist confirmed tool specifically matches vault mechanical lock pry markings.',
    status: 'PENDING',
  },
];

export const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'AUD-0001',
    timestamp: '2026-10-05T08:15:00.000Z',
    action: 'CASE_CREATED',
    caseId: 'CASE-2026-001',
    userId: 'usr-det-sarah',
    userName: 'Det. Ananya Sharma',
    userRole: 'INVESTIGATOR',
    badgeNumber: 'INV-4029',
    description: 'Case CASE-2026-001 "Downtown Vault Security Breach & Burglary" formally opened and assigned.',
    previousHash: 'GENESIS_BLOCK_0000000000000000000000000000000000000000000000000000000000000000',
    hash: '6a09e667f3bcc908a8e3d09a5b3a4a123f8b9d0e12a45b67c89d0e12f3456789',
  },
  {
    id: 'AUD-0002',
    timestamp: '2026-10-05T09:12:44.000Z',
    action: 'EVIDENCE_CREATED',
    evidenceId: 'EV-2026-0001',
    caseId: 'CASE-2026-001',
    userId: 'usr-officer-ravi',
    userName: 'Inspector Vikram Rathore',
    userRole: 'FIELD_OFFICER',
    badgeNumber: 'FO-8841',
    description: 'Evidence EV-2026-0001 registered at crime scene. SHA-256 fingerprint generated.',
    previousHash: '6a09e667f3bcc908a8e3d09a5b3a4a123f8b9d0e12a45b67c89d0e12f3456789',
    hash: 'bb67ae8584caa73b25712165b4c910f135b91b7d54e38e1467406a6821d3f9f4',
  },
  {
    id: 'AUD-0003',
    timestamp: '2026-10-05T10:45:12.000Z',
    action: 'EVIDENCE_CREATED',
    evidenceId: 'EV-2026-0002',
    caseId: 'CASE-2026-001',
    userId: 'usr-officer-ravi',
    userName: 'Inspector Vikram Rathore',
    userRole: 'FIELD_OFFICER',
    badgeNumber: 'FO-8841',
    description: 'Evidence EV-2026-0002 (Samsung 990 Pro SSD) registered and anti-static bagged.',
    previousHash: 'bb67ae8584caa73b25712165b4c910f135b91b7d54e38e1467406a6821d3f9f4',
    hash: '3c6ef372fe94f82bcf1b54a2e5b98a3e742a2e4b449e7b2f5678a9c012d34e56',
  },
  {
    id: 'AUD-0004',
    timestamp: '2026-10-05T13:00:00.000Z',
    action: 'CUSTODY_TRANSFERRED',
    evidenceId: 'EV-2026-0001',
    caseId: 'CASE-2026-001',
    userId: 'usr-officer-ravi',
    userName: 'Inspector Vikram Rathore',
    userRole: 'FIELD_OFFICER',
    badgeNumber: 'FO-8841',
    description: 'Evidence EV-2026-0001 transferred from Crime Scene to Central Secure Evidence Vault #2 Bay C14.',
    previousHash: '3c6ef372fe94f82bcf1b54a2e5b98a3e742a2e4b449e7b2f5678a9c012d34e56',
    hash: 'a54ff53a5f1d36f1c42f7c0018b87a8a14b09b5e56e0d9b4b9e28f729b43c6e1',
  },
  {
    id: 'AUD-0005',
    timestamp: '2026-10-06T11:24:10.000Z',
    action: 'MODIFICATION_REQUESTED',
    evidenceId: 'EV-2026-0001',
    caseId: 'CASE-2026-001',
    userId: 'usr-officer-ravi',
    userName: 'Inspector Vikram Rathore',
    userRole: 'FIELD_OFFICER',
    badgeNumber: 'FO-8841',
    description: 'Modification requested for EV-2026-0001 by Inspector Vikram Rathore: Classification change to "Burglary Intrusion Tool / Weapon".',
    previousHash: 'a54ff53a5f1d36f1c42f7c0018b87a8a14b09b5e56e0d9b4b9e28f729b43c6e1',
    hash: '9e7b2f5678a9c012d34e566a09e667f3bcc908a8e3d09a5b3a4a123f8b9d0e12',
  },
];

export function initializeStorageIfEmpty(): void {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      resetToDefaultData();
    }
  } catch (err) {
    console.error('Failed to access localStorage:', err);
  }
}

export function resetToDefaultData(): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
  localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(INITIAL_EVIDENCE));
  localStorage.setItem(STORAGE_KEYS.MODIFICATIONS, JSON.stringify(INITIAL_MODIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id); // Default to Inspector Vikram Rathore
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

export function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function loadCases(): CrimeCase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CASES);
    return raw ? JSON.parse(raw) : INITIAL_CASES;
  } catch {
    return INITIAL_CASES;
  }
}

export function saveCases(cases: CrimeCase[]): void {
  localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
}

export function loadEvidence(): EvidenceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
    return raw ? JSON.parse(raw) : INITIAL_EVIDENCE;
  } catch {
    return INITIAL_EVIDENCE;
  }
}

export function saveEvidence(evidence: EvidenceItem[]): void {
  localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(evidence));
}

export function loadModifications(): ModificationRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MODIFICATIONS);
    return raw ? JSON.parse(raw) : INITIAL_MODIFICATIONS;
  } catch {
    return INITIAL_MODIFICATIONS;
  }
}

export function saveModifications(mods: ModificationRequest[]): void {
  localStorage.setItem(STORAGE_KEYS.MODIFICATIONS, JSON.stringify(mods));
}

export function loadAuditLogs(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveAuditLogs(logs: AuditEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
}

export function getCurrentUserId(): string {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || INITIAL_USERS[0].id;
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
}
