import React, { useState } from 'react';
import { CrimeCase, User } from '../types';
import { EvidenceService } from '../services/evidenceService';
import { AuthService } from '../services/authService';
import {
  FolderArchive,
  Plus,
  Search,
  MapPin,
  Calendar,
  UserCheck,
  Boxes,
  ChevronRight,
  X,
  CheckCircle2,
} from 'lucide-react';

interface CasesViewProps {
  cases: CrimeCase[];
  currentUser: User;
  onNavigate: (view: string, extra?: any) => void;
  onRefreshData: () => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  currentUser,
  onNavigate,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = AuthService.canCreateCase(currentUser);

  const filteredCases = cases.filter(c => {
    return (
      searchTerm === '' ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.crimeLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.leadInvestigator.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      setError('Please provide both case title and crime scene location.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const newCase = await EvidenceService.createCase({
        title: title.trim(),
        crimeLocation: location.trim(),
        description: description.trim() || 'Crime scene investigation initiated.',
        user: currentUser,
      });

      onRefreshData();
      setIsCreateModalOpen(false);
      setTitle('');
      setLocation('');
      setDescription('');
      onNavigate('case-details', { caseId: newCase.id });
    } catch (err: any) {
      setError(err?.message || 'Failed to create case');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-cyan-400" />
            <span>Case Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official crime investigations, associated forensic records, and chain of custody tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="py-2 px-3.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Establish New Case</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by case ID, title, location, or investigator..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono">
          {filteredCases.length} Cases On Record
        </div>
      </div>

      {/* Case Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map(c => (
          <div
            key={c.id}
            onClick={() => onNavigate('case-details', { caseId: c.id })}
            className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {c.id}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-300">
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                {c.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {c.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-[11px] truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{c.crimeLocation}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.leadInvestigator.name}</span>
                </div>

                <div className="flex items-center gap-1 font-mono text-cyan-400 font-semibold">
                  <Boxes className="w-3.5 h-3.5" />
                  <span>{c.evidenceCount} Items</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Case Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Establish New Case</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded bg-rose-950/50 border border-rose-500/50 text-rose-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Case Title / Incident Designation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metro Jewelry Vault Security Breach"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Crime Scene Location / Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 742 Grand Avenue, Downtown Metro Financial District"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Initial Incident Summary & Briefing
                </label>
                <textarea
                  rows={3}
                  placeholder="Initial observations, entry points, suspects, or seized property details..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs resize-none"
                />
              </div>

              <div className="p-3 rounded bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>
                  Establishing Officer: <span className="text-white font-medium">{currentUser.name}</span> ({currentUser.badgeNumber})
                </div>
                <div>
                  Assigned Department: <span className="text-cyan-300 font-medium">{currentUser.department}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="py-2 px-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2 px-4 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording Case...' : 'Create Case Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
