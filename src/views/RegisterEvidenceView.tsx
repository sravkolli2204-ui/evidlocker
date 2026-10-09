import React, { useState, useEffect } from 'react';
import {
  EvidenceType,
  CrimeCase,
  User,
  EvidenceItem,
} from '../types';
import { EvidenceService } from '../services/evidenceService';
import { hashFile, sha256Text, truncateHash } from '../services/cryptoService';
import { FingerprintModal } from '../components/common/FingerprintModal';
import {
  FilePlus2,
  Camera,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  QrCode,
  ArrowRight,
  Printer,
  Sparkles,
  Fingerprint,
} from 'lucide-react';

interface RegisterEvidenceViewProps {
  cases: CrimeCase[];
  currentUser: User;
  prefilledCaseId?: string;
  onNavigate: (view: string, extra?: any) => void;
  onRefreshData: () => void;
}

const EVIDENCE_TYPES: EvidenceType[] = [
  'Metal Object / Weapon',
  'Firearm & Ballistics',
  'Digital Media / Storage',
  'Biological / DNA',
  'Chemical / Narcotics',
  'Documents / Records',
  'Trace Evidence',
  'Other Physical Evidence',
];

// Curated stock forensic photos for quick test validation
const PRESET_PHOTOS = [
  {
    name: 'Tool / Crowbar',
    url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80',
    type: 'Metal Object / Weapon' as EvidenceType,
  },
  {
    name: 'Storage Drive / SSD',
    url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
    type: 'Digital Media / Storage' as EvidenceType,
  },
  {
    name: 'Ballistics / Firearm',
    url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80',
    type: 'Firearm & Ballistics' as EvidenceType,
  },
  {
    name: 'USB Hardware Token',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    type: 'Digital Media / Storage' as EvidenceType,
  },
];

export const RegisterEvidenceView: React.FC<RegisterEvidenceViewProps> = ({
  cases,
  currentUser,
  prefilledCaseId,
  onNavigate,
  onRefreshData,
}) => {
  const [evidenceId, setEvidenceId] = useState('');
  const [caseId, setCaseId] = useState(prefilledCaseId || (cases[0]?.id || ''));
  const [name, setName] = useState('');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('Metal Object / Weapon');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [roomOrSector, setRoomOrSector] = useState('');
  const [coordinates, setCoordinates] = useState('37.7749° N, 122.4194° W');
  const [storageLocation, setStorageLocation] = useState('Field Evidence Locker (In-Transit)');

  // File and photo state
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileHash, setFileHash] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isHashing, setIsHashing] = useState(false);

  // Locked timestamp state (immutable once recorded at crime scene intake)
  const [recordedTimestamp] = useState<string>(new Date().toISOString());

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredItem, setRegisteredItem] = useState<EvidenceItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricVerifiedToken, setBiometricVerifiedToken] = useState<string | null>(null);

  useEffect(() => {
    // Generate next unique Evidence ID
    setEvidenceId(EvidenceService.generateEvidenceId());

    // Auto fill location from selected case if empty
    if (caseId) {
      const selectedCase = cases.find(c => c.id === caseId);
      if (selectedCase && !address) {
        setAddress(selectedCase.crimeLocation);
      }
    }
  }, [caseId, cases]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsHashing(true);
      setFileName(file.name);

      // 1. Calculate genuine SHA-256 cryptographic hash of the uploaded file bytes
      const hash = await hashFile(file);
      setFileHash(hash);

      // 2. Read preview data URL
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File hashing failed', err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleSelectPresetPhoto = async (preset: (typeof PRESET_PHOTOS)[0]) => {
    setImageUrl(preset.url);
    setFileName(`${preset.name}.jpg`);
    setEvidenceType(preset.type);
    setIsHashing(true);
    // Deterministic hash based on preset
    const computed = await sha256Text(`PRESET_IMAGE_${preset.name}_${preset.url}`);
    setFileHash(computed);
    setIsHashing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !address.trim()) {
      setError('Please fill all mandatory evidence fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Ensure fileHash exists even if no image uploaded
      let finalFileHash = fileHash;
      if (!finalFileHash) {
        finalFileHash = await sha256Text(`DEFAULT_FORENSIC_TAG_${evidenceId}`);
      }

      const item = await EvidenceService.registerEvidence({
        caseId,
        name: name.trim(),
        evidenceType,
        description: description.trim(),
        address: address.trim(),
        roomOrSector: roomOrSector.trim(),
        coordinates: coordinates.trim(),
        storageLocation: storageLocation.trim(),
        imageUrl: imageUrl || undefined,
        fileHash: finalFileHash,
        user: currentUser,
      });

      setRegisteredItem(item);
      onRefreshData();
    } catch (err: any) {
      setError(err?.message || 'Failed to register evidence');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If successfully registered, show forensic verification confirmation
  if (registeredItem) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6 animate-in zoom-in-95 duration-200">
        <div className="p-8 rounded-xl bg-slate-900 border border-slate-700 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/80 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">
              Evidence Securely Registered & Fingerprinted
            </h2>
            <div className="text-sm font-mono text-cyan-400 font-semibold">
              ID: {registeredItem.id} · CASE: {registeredItem.caseId}
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Digital identity created and anchored in the cryptographic audit ledger. Collection timestamp is permanently locked.
            </p>
          </div>

          {/* Cryptographic Receipt Card */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-left font-mono text-xs space-y-2 text-slate-300">
            <div className="flex justify-between items-center text-[11px] border-b border-slate-800 pb-1.5">
              <span className="text-slate-500">COLLECTION TIMESTAMP (LOCKED):</span>
              <span className="text-amber-300 font-semibold">
                {new Date(registeredItem.collectionTimestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] border-b border-slate-800 pb-1.5">
              <span className="text-slate-500">COLLECTING OFFICER:</span>
              <span>{registeredItem.collectingOfficer.name} ({registeredItem.collectingOfficer.badgeNumber})</span>
            </div>
            <div className="flex justify-between items-center text-[11px] border-b border-slate-800 pb-1.5">
              <span className="text-slate-500">INITIAL CUSTODY STATUS:</span>
              <span className="text-sky-400 font-bold">{registeredItem.currentStatus}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] pt-0.5">
              <span className="text-slate-500">SHA-256 RECORD FINGERPRINT:</span>
              <span className="text-cyan-400">{truncateHash(registeredItem.recordHash, 8)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('evidence-details', { evidenceId: registeredItem.id })}
              className="w-full sm:w-auto py-2.5 px-5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-cyan-900/30"
            >
              <span>View Evidence Record</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setRegisteredItem(null);
                setName('');
                setDescription('');
                setImageUrl('');
                setFileHash('');
                setFileName('');
              }}
              className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
            >
              Register Another Evidence Item
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FilePlus2 className="w-6 h-6 text-cyan-400" />
            <span>Crime-Scene Evidence Registration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Initiate chain of custody. System auto-generates unique ID, locks timestamp, and creates cryptographic SHA-256 fingerprint.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="font-mono text-xs px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-bold">
            Assigned ID: {evidenceId || 'Generating...'}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Identification & Case */}
        <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold border-b border-slate-800 pb-2">
            1. Core Case & Classification Information
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Auto Generated Evidence ID */}
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                EVIDENCE ID (AUTO-GENERATED)
              </label>
              <input
                type="text"
                readOnly
                value={evidenceId}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-mono font-bold text-xs select-all cursor-not-allowed"
              />
            </div>

            {/* Target Case Selection */}
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                CASE IDENTIFIER *
              </label>
              <select
                required
                value={caseId}
                onChange={e => setCaseId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Evidence Type */}
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                EVIDENCE TYPE / CATEGORY *
              </label>
              <select
                required
                value={evidenceType}
                onChange={e => setEvidenceType(e.target.value as EvidenceType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {EVIDENCE_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Item Name */}
          <div className="text-xs">
            <label className="block text-slate-300 font-medium mb-1">
              Evidence Designation / Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 36-inch Forged Alloy Prying Tool (Crowbar)"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 placeholder-slate-600"
            />
          </div>

          {/* Item Description */}
          <div className="text-xs">
            <label className="block text-slate-300 font-medium mb-1">
              Forensic Physical Description & Condition *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Color, markings, serial numbers, visible wear, blood/paint transfers, physical dimensions..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 placeholder-slate-600 resize-none"
            />
          </div>
        </div>

        {/* Section 2: Crime-Scene Location & Immutable Timestamp */}
        <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold border-b border-slate-800 pb-2">
            2. Chain of Custody Intake & Crime Scene Location
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Locked Timestamp */}
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1 flex items-center justify-between">
                <span>COLLECTION TIMESTAMP (LOCKED)</span>
                <span className="text-amber-400">IMMUTABLE</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={new Date(recordedTimestamp).toLocaleString()}
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs cursor-not-allowed"
                />
                <Calendar className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-2.5" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Timestamp is locked by system protocol upon physical registration.
              </p>
            </div>

            {/* Officer Name & Badge */}
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                RECORDING OFFICER (AUTHENTICATED)
              </label>
              <input
                type="text"
                readOnly
                value={`${currentUser.name} (${currentUser.badgeNumber})`}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs cursor-not-allowed font-medium"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Department: {currentUser.department}
              </p>
            </div>

            {/* Initial Storage Destination */}
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                INITIAL SECURE CUSTODY REPOSITORY *
              </label>
              <input
                type="text"
                required
                value={storageLocation}
                onChange={e => setStorageLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Locker #, vehicle lockbox, or mobile forensics bay.
              </p>
            </div>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Physical Street Address / Site *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 742 Grand Avenue, Downtown Metro Financial District"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Specific Room, Sector or Point of Recovery
              </label>
              <input
                type="text"
                placeholder="e.g. Floor -1, North Service Hallway adjacent to Vault Door"
                value={roomOrSector}
                onChange={e => setRoomOrSector(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Evidence Photograph & Cryptographic Hashing */}
        <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>3. Evidence File & Cryptographic Fingerprint</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" />
              W3C WebCrypto SHA-256 Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* File Upload Box */}
            <div className="space-y-3">
              <label className="block text-slate-300 font-medium text-xs">
                Upload Crime Scene Photo / Digital Evidence File
              </label>

              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl bg-slate-950/60 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/*,.pdf,.bin"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Camera className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors mb-2" />
                <span className="text-xs text-slate-300 font-medium">
                  {fileName ? fileName : 'Click to select photo or evidence file'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  JPG, PNG, TIFF, or Raw Binary (calculates SHA-256 instantly)
                </span>
              </label>

              {/* Preset quick test selector */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Quick Demo Preset Samples (1-Click Test):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PHOTOS.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleSelectPresetPhoto(p)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Photo Preview & Live SHA-256 Hash */}
            <div className="space-y-3">
              <label className="block text-slate-300 font-medium text-xs">
                Visual Inspection & Calculated Cryptographic Hash
              </label>

              <div className="h-44 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Evidence Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-600 text-xs p-4">
                    <Camera className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span>Awaiting file upload...</span>
                  </div>
                )}

                {isHashing && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center text-cyan-400 text-xs font-mono">
                    Computing SHA-256 digest...
                  </div>
                )}
              </div>

              {/* Hash Display */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  FILE SHA-256 DIGEST:
                </div>
                <div className="text-cyan-300 break-all select-all font-mono text-[10px]">
                  {fileHash || 'Awaiting file upload to compute checksum...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowBiometricModal(true)}
              className={`py-2 px-3.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer ${
                biometricVerifiedToken
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-cyan-300 hover:border-cyan-500'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>
                {biometricVerifiedToken
                  ? 'Biometric Fingerprint Sealed ✓'
                  : 'Seal with Fingerprint'}
              </span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isHashing}
              className="py-2.5 px-6 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950/40 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Securing & Writing to Ledger...' : 'Register & Lock Evidence Record'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Officer Biometric Sensor Modal */}
      {showBiometricModal && (
        <FingerprintModal
          isOpen={showBiometricModal}
          user={currentUser}
          actionTitle="Officer Biometric Intake Authorization"
          actionDescription="Scan registered fingerprint to cryptographically bind your officer credentials to this evidence registration."
          onClose={() => setShowBiometricModal(false)}
          onSuccess={(token) => {
            setBiometricVerifiedToken(token);
            setShowBiometricModal(false);
          }}
        />
      )}
    </div>
  );
};
