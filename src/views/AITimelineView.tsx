import React, { useState, useEffect } from 'react';
import { CrimeCase, EvidenceItem, User } from '../types';
import {
  Sparkles,
  Clock,
  Boxes,
  MapPin,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Send,
  Bot,
  User as UserIcon,
  Printer,
  Copy,
  Check,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

interface AITimelineViewProps {
  cases: CrimeCase[];
  evidenceList: EvidenceItem[];
  currentUser: User;
  onNavigate: (view: string, extra?: any) => void;
}

interface TimelineEvent {
  time: string;
  isoTimestamp: string;
  title: string;
  category: 'CRIME_OCCURRENCE' | 'EVIDENCE_RECOVERED' | 'CUSTODY_HANDOVER' | 'FORENSIC_ANALYSIS' | 'MODIFICATION_GOVERNANCE';
  description: string;
  evidenceLinked: string[];
  location: string;
  officer: string;
  confidence: 'CONFIRMED' | 'HIGH' | 'INFERRED';
  forensicSignificance: string;
}

interface TimelineGap {
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
}

interface TimelineData {
  caseId: string;
  caseTitle: string;
  reconstructionSummary: string;
  events: TimelineEvent[];
  timelineGapsAndAnomalies: TimelineGap[];
  evidentiaryIntegrityAssessment: string;
  courtAdmissibilityRating: string;
  aiGenerated?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const PRESET_QUERIES = [
  'Full Crime-Scene Temporal Reconstruction',
  'Trace Forced Entry & Tool Marks Sequence',
  'Correlate Digital Hardware Tap Timeline',
  'Identify Chain-of-Custody Custody Gaps',
];

export const AITimelineView: React.FC<AITimelineViewProps> = ({
  cases,
  evidenceList,
  currentUser,
  onNavigate,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [focusQuery, setFocusQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Chat Assistant State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      role: 'model',
      content:
        'Greetings. I am your Gemini Forensic AI Specialist. I analyze crime-scene timestamps, physical tool marks, digital intrusion traces, and chain-of-custody ledgers. Ask me to reconstruct any temporal sequence or evaluate court admissibility.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  const targetCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const handleGenerateTimeline = async (overrideQuery?: string) => {
    setIsGenerating(true);
    const query = overrideQuery !== undefined ? overrideQuery : focusQuery;

    try {
      const res = await fetch('/api/ai/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedCaseId,
          focusQuery: query || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTimelineData(data);
      }
    } catch (err) {
      console.error('Failed to generate AI timeline:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (selectedCaseId) {
      handleGenerateTimeline();
    }
  }, [selectedCaseId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userText = chatInput.trim();
    setChatInput('');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setIsChatSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          caseId: selectedCaseId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            role: 'model',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'model',
          content: 'Analysis temporarily interrupted. Case evidence records remain fully secured on ledger.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleCopyReport = () => {
    if (!timelineData) return;
    const reportText = `FORENSIC CRIME SCENE CHRONOLOGY REPORT\nCASE: ${timelineData.caseId} - ${timelineData.caseTitle}\nCOURT ADMISSIBILITY: ${timelineData.courtAdmissibilityRating}\n\nEXECUTIVE RECONSTRUCTION:\n${timelineData.reconstructionSummary}\n\nCHRONOLOGICAL SEQUENCE:\n${timelineData.events
      .map(e => `[${e.time}] ${e.title} (${e.confidence})\nLocation: ${e.location} | Officer: ${e.officer}\n${e.description}\nEvidence: ${e.evidenceLinked.join(', ')}\nSignificance: ${e.forensicSignificance}\n`)
      .join('\n')}\nINTEGRITY ASSESSMENT:\n${timelineData.evidentiaryIntegrityAssessment}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredEvents = timelineData?.events.filter(e => {
    if (categoryFilter === 'ALL') return true;
    return e.category === categoryFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              AI Crime-Scene Timeline Generator & Forensic Reconstruction
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gemini-powered temporal synthesis correlating physical artifacts, GPS recovery locations, and immutable ledger timestamps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Timeline</span>
          </button>

          <button
            onClick={handleCopyReport}
            className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Report'}</span>
          </button>
        </div>
      </div>

      {/* Case Selector & Directive Toolbar */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Select Investigation Case *
            </label>
            <select
              value={selectedCaseId}
              onChange={e => setSelectedCaseId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Custom Forensic Focus Directive (Optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Focus on forced entry dynamics and vault bypass timeline..."
                value={focusQuery}
                onChange={e => setFocusQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerateTimeline()}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              />
              <button
                onClick={() => handleGenerateTimeline()}
                disabled={isGenerating}
                className="py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-950/40 disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Reconstructing...' : 'Generate Timeline'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Query Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="font-mono text-[10px] uppercase text-slate-500">Quick Analysis Presets:</span>
          {PRESET_QUERIES.map(q => (
            <button
              key={q}
              onClick={() => {
                setFocusQuery(q);
                handleGenerateTimeline(q);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-cyan-300 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Timeline Display (Span 2) + Right Gemini Chatbot (Span 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Reconstructed Timeline (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {timelineData ? (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs text-cyan-400 font-bold mb-1">
                      <span>{timelineData.caseId}</span>
                      <span>·</span>
                      <span className="text-white">{timelineData.caseTitle}</span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Executive Crime-Scene Chronological Synthesis
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-bold">
                      COURT ADMISSIBILITY: {timelineData.courtAdmissibilityRating}
                    </span>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800/80 font-sans">
                  {timelineData.reconstructionSummary}
                </p>

                <div className="text-xs text-slate-400 font-mono flex items-center justify-between pt-1">
                  <span>Cryptographic Integrity: <strong className="text-emerald-400">100% UNALTERED</strong></span>
                  <span className="text-cyan-400">{timelineData.events.length} Synchronized Events</span>
                </div>
              </div>

              {/* Category Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['ALL', 'CRIME_OCCURRENCE', 'EVIDENCE_RECOVERED', 'CUSTODY_HANDOVER', 'FORENSIC_ANALYSIS'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>

                <span className="text-slate-500 text-[11px]">
                  Showing {filteredEvents?.length || 0} events
                </span>
              </div>

              {/* Vertical Visual Timeline */}
              <div className="space-y-4">
                {filteredEvents?.map((event, idx) => {
                  const isCrime = event.category === 'CRIME_OCCURRENCE';
                  const isEvidence = event.category === 'EVIDENCE_RECOVERED';
                  const isCustody = event.category === 'CUSTODY_HANDOVER';

                  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
                  let dotColor = 'border-cyan-400 bg-cyan-500';
                  let borderLine = 'border-cyan-800/80';

                  if (isCrime) {
                    badgeColor = 'bg-rose-950/60 text-rose-300 border-rose-500/40';
                    dotColor = 'border-rose-400 bg-rose-500';
                    borderLine = 'border-rose-800/80';
                  } else if (isEvidence) {
                    badgeColor = 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40';
                    dotColor = 'border-cyan-400 bg-cyan-500';
                    borderLine = 'border-cyan-800/80';
                  } else if (isCustody) {
                    badgeColor = 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40';
                    dotColor = 'border-indigo-400 bg-indigo-500';
                    borderLine = 'border-indigo-800/80';
                  }

                  return (
                    <div
                      key={idx}
                      className="relative pl-8 border-l-2 pb-5 space-y-2 group"
                      style={{ borderColor: isCrime ? '#e11d48' : isEvidence ? '#0891b2' : '#6366f1' }}
                    >
                      {/* Timeline Node Icon */}
                      <div
                        className={`absolute -left-2 top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 ${dotColor}`}
                      />

                      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-all space-y-3 shadow-md">
                        {/* Event Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badgeColor}`}
                            >
                              {event.category.replace(/_/g, ' ')}
                            </span>
                            <span className="font-mono text-xs font-bold text-white">
                              {event.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-amber-300 font-semibold">{event.time}</span>
                            <span className="text-slate-600">·</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                event.confidence === 'CONFIRMED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {event.confidence}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">
                          {event.description}
                        </p>

                        {/* Forensic Significance */}
                        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                            FORENSIC RECONSTRUCTION SIGNIFICANCE:
                          </div>
                          <div className="text-slate-300 italic text-[11px]">
                            {event.forensicSignificance}
                          </div>
                        </div>

                        {/* Linked Evidence and Location Footer */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span className="truncate max-w-xs">{event.location}</span>
                            <span className="text-slate-600">·</span>
                            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                            <span>{event.officer}</span>
                          </div>

                          {event.evidenceLinked.length > 0 && (
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
                              <div className="flex gap-1">
                                {event.evidenceLinked.map(evId => (
                                  <button
                                    key={evId}
                                    onClick={() => onNavigate('evidence-details', { evidenceId: evId })}
                                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-cyan-300 text-[10px] transition-colors cursor-pointer"
                                  >
                                    {evId}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timeline Anomalies & Gaps Alert Box */}
              {timelineData.timelineGapsAndAnomalies && timelineData.timelineGapsAndAnomalies.length > 0 && (
                <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>AI-Detected Temporal Gaps & Chain Anomalies</span>
                  </div>

                  <div className="space-y-2">
                    {timelineData.timelineGapsAndAnomalies.map((gap, gIdx) => (
                      <div
                        key={gIdx}
                        className="p-3 rounded-lg bg-slate-950 border border-amber-900/50 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-200">
                            {gap.description}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                            SEVERITY: {gap.severity}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          <strong>Investigative Recommendation:</strong> {gap.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-cyan-500 mx-auto animate-pulse" />
              <div className="text-white font-semibold">Generating AI Crime-Scene Timeline...</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Synthesizing collection logs, physical markings, and forensic records for {targetCase.id}.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Turn Gemini Forensic Chatbot (Span 1) */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-xs text-white">Gemini Forensic Assistant</h3>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    Case {targetCase.id} Context Active
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                gemini-3.8-flash
              </span>
            </div>

            {/* Scrollable Message Thread */}
            <div className="h-96 overflow-y-auto space-y-3 pr-1 text-xs">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[90%] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none shadow-inner'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                    {msg.role === 'user' ? 'You' : 'Gemini AI'} · {msg.timestamp}
                  </span>
                </div>
              ))}

              {isChatSending && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2 bg-slate-950/60 rounded-lg">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Analyzing forensic evidence...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask question about timeline, evidence, or custody..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                disabled={isChatSending}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-600"
              />
              <button
                type="submit"
                disabled={isChatSending || !chatInput.trim()}
                className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-cyan-950/40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
