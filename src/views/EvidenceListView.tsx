import React, { useState } from 'react';
import { EvidenceItem, CrimeCase, User, EvidenceStatus, EvidenceType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { truncateHash } from '../services/cryptoService';
import { QRCodeModal } from '../components/common/QRCodeModal';
import { QRScannerModal, QRScanResult } from '../components/common/QRScannerModal';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  QrCode,
  LayoutGrid,
  List,
  ChevronRight,
  MapPin,
  Clock,
  ShieldCheck,
  Camera,
} from 'lucide-react';

interface EvidenceListViewProps {
  evidenceList: EvidenceItem[];
  cases: CrimeCase[];
  currentUser: User;
  onNavigate: (view: string, extra?: any) => void;
}

export const EvidenceListView: React.FC<EvidenceListViewProps> = ({
  evidenceList,
  cases,
  currentUser,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [caseFilter, setCaseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedForQR, setSelectedForQR] = useState<EvidenceItem | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const filtered = evidenceList.filter(item => {
    const matchesSearch =
      searchTerm === '' ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.collectingOfficer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.caseId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCase = caseFilter === 'ALL' || item.caseId === caseFilter;
    const matchesStatus = statusFilter === 'ALL' || item.currentStatus === statusFilter;
    const matchesType = typeFilter === 'ALL' || item.evidenceType === typeFilter;

    return matchesSearch && matchesCase && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-cyan-400" />
            <span>Digital Evidence Vault</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete inventory of authenticated crime-scene evidence records under strict chain of custody.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-cyan-950/30"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Scan Tag QR</span>
          </button>

          <button
            onClick={() => onNavigate('register-evidence')}
            className="py-2 px-3.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Evidence</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Evidence ID, title, officer, case or keywords..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 self-end md:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          {/* Case Filter */}
          <select
            value={caseFilter}
            onChange={e => setCaseFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="ALL">Filter by Case: All Cases</option>
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="ALL">Filter by Status: All Lifecycles</option>
            <option value="COLLECTED">COLLECTED</option>
            <option value="REGISTERED">REGISTERED</option>
            <option value="STORED">STORED</option>
            <option value="TRANSFERRED">TRANSFERRED</option>
            <option value="FORENSIC ANALYSIS">FORENSIC ANALYSIS</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="SUBMITTED TO COURT">SUBMITTED TO COURT</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="ALL">Filter by Classification: All Types</option>
            <option value="Metal Object / Weapon">Metal Object / Weapon</option>
            <option value="Firearm & Ballistics">Firearm & Ballistics</option>
            <option value="Digital Media / Storage">Digital Media / Storage</option>
            <option value="Biological / DNA">Biological / DNA</option>
            <option value="Chemical / Narcotics">Chemical / Narcotics</option>
            <option value="Documents / Records">Documents / Records</option>
          </select>
        </div>
      </div>

      {/* View Rendering */}
      {viewMode === 'table' ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Evidence ID</th>
                  <th className="py-3 px-3">Item Name & Classification</th>
                  <th className="py-3 px-3">Case ID</th>
                  <th className="py-3 px-3">Collection Date</th>
                  <th className="py-3 px-3">Collecting Officer</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No evidence records match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map(item => (
                    <tr
                      key={item.id}
                      onClick={() => onNavigate('evidence-details', { evidenceId: item.id })}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {item.id}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-white truncate max-w-xs">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.evidenceType}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-400">
                        {item.caseId}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {new Date(item.collectionTimestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-slate-200">
                          {item.collectingOfficer.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {item.collectingOfficer.badgeNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={item.currentStatus} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedForQR(item)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Generate Evidence QR Bag Tag"
                          >
                            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                          <button
                            onClick={() =>
                              onNavigate('evidence-details', { evidenceId: item.id })
                            }
                            className="py-1 px-2.5 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 text-[11px] font-medium transition-colors"
                          >
                            Examine
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">
              Showing {filtered.length} authenticated items
            </span>
            <span className="text-[11px] text-slate-500">
              Chain of custody guaranteed via SHA-256
            </span>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => onNavigate('evidence-details', { evidenceId: item.id })}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {item.id}
                  </span>
                  <StatusBadge status={item.currentStatus} size="sm" />
                </div>

                {/* Image */}
                <div className="h-40 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden mb-3 relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-xs text-slate-600">
                      NO ATTACHED PHOTO
                    </div>
                  )}
                  <div className="absolute top-2 left-2 font-mono text-[10px] bg-slate-950/80 px-1.5 py-0.5 rounded text-cyan-400 border border-slate-800">
                    {item.caseId}
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                  {item.name}
                </h3>
                <div className="text-xs text-slate-400 mb-2 truncate">
                  {item.evidenceType}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Officer: {item.collectingOfficer.name}</span>
                  <span className="font-mono text-[10px] text-cyan-400">
                    {truncateHash(item.recordHash, 4)}
                  </span>
                </div>

                <div
                  className="flex items-center justify-between pt-1"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedForQR(item)}
                    className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>QR Tag</span>
                  </button>

                  <button
                    onClick={() => onNavigate('evidence-details', { evidenceId: item.id })}
                    className="py-1 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Tag Modal */}
      {selectedForQR && (
        <QRCodeModal
          evidence={selectedForQR}
          onClose={() => setSelectedForQR(null)}
        />
      )}

      {/* Camera QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(result: QRScanResult) => {
          const targetId = result.evidenceId || result.raw;
          const found = evidenceList.find(e => e.id.toLowerCase() === targetId.toLowerCase());
          if (found) {
            onNavigate('evidence-details', { evidenceId: found.id });
          } else {
            // If not directly found in memory, navigate to verification view with query
            onNavigate('verification');
          }
        }}
        title="Scan Physical Evidence Tag"
        subtitle="Aim camera at tag QR code to instantly retrieve full chain of custody file"
      />
    </div>
  );
};
