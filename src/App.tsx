import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  CrimeCase,
  EvidenceItem,
  ModificationRequest,
  AuditEntry,
} from './types';
import {
  initializeStorageIfEmpty,
  loadUsers,
} from './services/storageService';
import { AuthService } from './services/authService';
import { EvidenceService } from './services/evidenceService';
import { AuditService } from './services/auditService';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { IntegrityModal } from './components/common/IntegrityModal';
import { FingerprintModal } from './components/common/FingerprintModal';
import { QRScannerModal, QRScanResult } from './components/common/QRScannerModal';
import { CreativeBackground } from './components/common/CreativeBackground';

// Views
import { DashboardView } from './views/DashboardView';
import { CasesView } from './views/CasesView';
import { CaseDetailsView } from './views/CaseDetailsView';
import { AITimelineView } from './views/AITimelineView';
import { RegisterEvidenceView } from './views/RegisterEvidenceView';
import { EvidenceListView } from './views/EvidenceListView';
import { EvidenceDetailsView } from './views/EvidenceDetailsView';
import { ModificationRequestsView } from './views/ModificationRequestsView';
import { AuditTrailView } from './views/AuditTrailView';
import { VerificationView } from './views/VerificationView';
import { UserManagementView } from './views/UserManagementView';
import { SecurityView } from './views/SecurityView';
import { LoginView } from './views/LoginView';

export function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<CrimeCase[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [modifications, setModifications] = useState<ModificationRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [viewParams, setViewParams] = useState<any>({});
  const [isIntegrityModalOpen, setIsIntegrityModalOpen] = useState(false);
  const [isFingerprintModalOpen, setIsFingerprintModalOpen] = useState(false);
  const [isQRScannerModalOpen, setIsQRScannerModalOpen] = useState(false);
  const [biometricBanner, setBiometricBanner] = useState<string | null>(null);

  // Initialize and synchronize data with backend server
  const refreshAllData = useCallback(async () => {
    initializeStorageIfEmpty();

    // 1. Load immediate cached state to avoid UI flash
    const localUsers = loadUsers();
    setAllUsers(localUsers);
    const activeUser = AuthService.getCurrentUser();
    setCurrentUser(activeUser);

    setCases(EvidenceService.getCases());
    setEvidenceList(EvidenceService.getEvidenceList());
    setModifications(EvidenceService.getModificationRequests());
    setAuditLogs(AuditService.getAuditLogs());

    // 2. Asynchronously sync live state with Express backend
    try {
      const [remoteUsers, remoteCases, remoteEvidence, remoteMods, remoteLogs] = await Promise.all([
        AuthService.fetchUsers(),
        EvidenceService.fetchCases(),
        EvidenceService.fetchEvidenceList(),
        EvidenceService.fetchModificationRequests(),
        AuditService.fetchAuditLogs(),
      ]);

      if (remoteUsers && remoteUsers.length > 0) {
        setAllUsers(remoteUsers);
        const currentActive = AuthService.getCurrentUser();
        setCurrentUser(currentActive);
      }
      if (remoteCases) setCases(remoteCases);
      if (remoteEvidence) setEvidenceList(remoteEvidence);
      if (remoteMods) setModifications(remoteMods);
      if (remoteLogs) setAuditLogs(remoteLogs);
    } catch (err) {
      console.warn('[App] Backend synchronization notice:', err);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
    setIsInitialized(true);
  }, [refreshAllData]);

  const handleNavigate = (view: string, extra?: any) => {
    setCurrentView(view);
    setViewParams(extra || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchUser = (userId: string) => {
    const nextUser = AuthService.switchUser(userId);
    setCurrentUser(nextUser);
    refreshAllData();
  };

  const handleSwitchUserByRole = (role: UserRole) => {
    const targetUser = allUsers.find(u => u.role === role);
    if (targetUser) {
      handleSwitchUser(targetUser.id);
    }
  };

  if (!isInitialized || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
        Initializing Digital Evidence Guardian...
      </div>
    );
  }

  // If user selected login view
  if (currentView === 'login') {
    return (
      <LoginView
        users={allUsers}
        onSelectUser={u => {
          handleSwitchUser(u.id);
          handleNavigate('dashboard');
        }}
      />
    );
  }

  const pendingApprovalsCount = modifications.filter(m => m.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Creative Forensic Multi-Layer Background */}
      <CreativeBackground />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        pendingApprovalsCount={pendingApprovalsCount}
        onSwitchUser={handleSwitchUser}
        onOpenIntegrityAudit={() => setIsIntegrityModalOpen(true)}
        onOpenFingerprint={() => setIsFingerprintModalOpen(true)}
        onOpenQRScanner={() => setIsQRScannerModalOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Biometric Scan Toast notification */}
      {biometricBanner && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-4 py-2 text-center text-xs text-emerald-200 font-mono flex items-center justify-center gap-2 animate-in slide-in-from-top-1 duration-150 backdrop-blur-md relative z-30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{biometricBanner}</span>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          pendingApprovalsCount={pendingApprovalsCount}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              cases={cases}
              evidenceList={evidenceList}
              auditLogs={auditLogs}
              pendingApprovalsCount={pendingApprovalsCount}
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onOpenIntegrityAudit={() => setIsIntegrityModalOpen(true)}
            />
          )}

          {currentView === 'cases' && (
            <CasesView
              cases={cases}
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onRefreshData={refreshAllData}
            />
          )}

          {currentView === 'ai-timeline' && (
            <AITimelineView
              cases={cases}
              evidenceList={evidenceList}
              currentUser={currentUser}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'case-details' && (
            <CaseDetailsView
              caseItem={
                cases.find(c => c.id === viewParams.caseId) ||
                cases[0]
              }
              evidenceItems={evidenceList.filter(
                e => e.caseId === (viewParams.caseId || cases[0]?.id)
              )}
              auditLogs={auditLogs}
              currentUser={currentUser}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'register-evidence' && (
            <RegisterEvidenceView
              cases={cases}
              currentUser={currentUser}
              prefilledCaseId={viewParams.prefilledCaseId}
              onNavigate={handleNavigate}
              onRefreshData={refreshAllData}
            />
          )}

          {currentView === 'evidence-list' && (
            <EvidenceListView
              evidenceList={evidenceList}
              cases={cases}
              currentUser={currentUser}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'evidence-details' && (
            <EvidenceDetailsView
              evidence={
                evidenceList.find(e => e.id === viewParams.evidenceId) ||
                evidenceList[0]
              }
              auditLogs={auditLogs}
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onRefreshData={refreshAllData}
            />
          )}

          {currentView === 'modifications' && (
            <ModificationRequestsView
              modifications={modifications}
              currentUser={currentUser}
              onRefreshData={refreshAllData}
              onNavigate={handleNavigate}
              onSwitchUserByRole={handleSwitchUserByRole}
            />
          )}

          {currentView === 'audit-trail' && (
            <AuditTrailView
              auditLogs={auditLogs}
              currentUser={currentUser}
              onOpenIntegrityAudit={() => setIsIntegrityModalOpen(true)}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'verification' && (
            <VerificationView
              evidenceList={evidenceList}
              currentUser={currentUser}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'users' && (
            <UserManagementView
              currentUser={currentUser}
              onRefreshData={refreshAllData}
              onSwitchUser={handleSwitchUser}
            />
          )}

          {currentView === 'security' && <SecurityView />}
        </main>
      </div>

      {/* Global Cryptographic Audit Modal */}
      <IntegrityModal
        isOpen={isIntegrityModalOpen}
        onClose={() => setIsIntegrityModalOpen(false)}
        onRefreshData={refreshAllData}
      />

      {/* Global Biometric Fingerprint & Thumb Scanner */}
      {isFingerprintModalOpen && currentUser && (
        <FingerprintModal
          isOpen={isFingerprintModalOpen}
          user={currentUser}
          actionTitle="Officer Biometric Identity Verification"
          actionDescription={`Position thumb in optical camera view or sensor to verify physical presence and authenticate terminal access for ${currentUser.name} (${currentUser.badgeNumber}).`}
          onClose={() => setIsFingerprintModalOpen(false)}
          onSuccess={(token) => {
            setIsFingerprintModalOpen(false);
            setBiometricBanner(`✓ Biometric Thumb Scan Verified for ${currentUser.name} (Proof Token: ${token.slice(0, 16)}...)`);
            setTimeout(() => setBiometricBanner(null), 4000);
          }}
        />
      )}

      {/* Global Camera QR Code Scanner */}
      <QRScannerModal
        isOpen={isQRScannerModalOpen}
        onClose={() => setIsQRScannerModalOpen(false)}
        onScanSuccess={(result: QRScanResult) => {
          const targetId = result.evidenceId || result.raw;
          const found = evidenceList.find(e => e.id.toLowerCase() === targetId.toLowerCase());
          if (found) {
            handleNavigate('evidence-details', { evidenceId: found.id });
          } else {
            handleNavigate('verification');
          }
        }}
        title="Physical Evidence Tag QR Scanner"
        subtitle="Point camera at physical evidence tag to retrieve record and chain of custody"
      />
    </div>
  );
}
export default App;
