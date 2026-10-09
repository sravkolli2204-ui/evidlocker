import React from 'react';
import { EvidenceStatus } from '../../types';

interface StatusBadgeProps {
  status: EvidenceStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const STATUS_CONFIG: Record<
  EvidenceStatus,
  { label: string; dotColor: string; textColor: string; borderAccent: string }
> = {
  COLLECTED: {
    label: 'COLLECTED',
    dotColor: 'bg-amber-400',
    textColor: 'text-amber-300',
    borderAccent: 'border-amber-500/30',
  },
  REGISTERED: {
    label: 'REGISTERED',
    dotColor: 'bg-sky-400',
    textColor: 'text-sky-300',
    borderAccent: 'border-sky-500/30',
  },
  STORED: {
    label: 'STORED IN VAULT',
    dotColor: 'bg-blue-400',
    textColor: 'text-blue-300',
    borderAccent: 'border-blue-500/30',
  },
  TRANSFERRED: {
    label: 'IN CUSTODY TRANSFER',
    dotColor: 'bg-indigo-400',
    textColor: 'text-indigo-300',
    borderAccent: 'border-indigo-500/30',
  },
  'FORENSIC ANALYSIS': {
    label: 'FORENSIC ANALYSIS',
    dotColor: 'bg-purple-400',
    textColor: 'text-purple-300',
    borderAccent: 'border-purple-500/30',
  },
  VERIFIED: {
    label: 'AUTHENTICITY VERIFIED',
    dotColor: 'bg-emerald-400',
    textColor: 'text-emerald-300',
    borderAccent: 'border-emerald-500/30',
  },
  'SUBMITTED TO COURT': {
    label: 'SUBMITTED TO COURT',
    dotColor: 'bg-rose-400',
    textColor: 'text-rose-300',
    borderAccent: 'border-rose-500/30',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-300',
    borderAccent: 'border-slate-700',
  };

  const textSize =
    size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold ${textSize} ${config.textColor}`}
    >
      {showDot && (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </div>
  );
};
