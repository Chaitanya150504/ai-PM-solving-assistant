import React from 'react';
import { X, Layers, ShieldCheck } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHASES = [
  { step: '01', name: 'Diagnose', desc: 'Reframes symptom, identifies affected stakeholders, and establishes business urgency.' },
  { step: '02', name: 'Hypothesize', desc: 'Separates observed ground-truth facts from potential unconfirmed mechanisms.' },
  { step: '03', name: 'Investigate', desc: 'Formulates targeted discovery inquiries and quantitative telemetry checklists.' },
  { step: '04', name: 'Experiment', desc: 'Structures falsifiable tests with explicit Go/No-Go decision rules and duration.' },
  { step: '05', name: 'Measure', desc: 'Establishes primary North Star metrics (real baselines only) and guardrail thresholds.' },
  { step: '06', name: 'Act', desc: 'Sequences step-by-step execution milestones across team owners and timeframes.' },
];

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/30 backdrop-blur-2xs"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-md shadow-xl border border-stone-200 z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C85A32]" />
            <h3 className="font-semibold text-xs tracking-tight text-stone-900 uppercase">
              Product Diagnosis Studio — Methodology
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          <p className="text-stone-600 leading-relaxed">
            Product Diagnosis Studio provides an evidence-based decision workspace. Rather than rushing into premature feature specs or feature PRDs, it breaks ambiguous problem symptoms down into validated mechanisms, prioritized experiments, and actionable next steps.
          </p>

          {/* 6 Phases */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 block">
              The 6 Investigation Phases
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PHASES.map((p) => (
                <div
                  key={p.step}
                  className="p-3 bg-white border border-stone-200/90 rounded-md space-y-1 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#C85A32]">
                      {p.step}
                    </span>
                    <h4 className="font-semibold text-stone-900">{p.name}</h4>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Principles */}
          <div className="p-4 bg-white border border-stone-200 rounded-md space-y-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-700">
                Core Factual Integrity Standards
              </span>
            </div>
            <ul className="space-y-1.5 text-stone-600 text-[11px] leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-[#C85A32] font-bold">·</span>
                <span><strong>No Invented Numbers:</strong> When no baseline telemetry is provided, metrics strictly state "Baseline: Not provided".</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C85A32] font-bold">·</span>
                <span><strong>Assumption Labeling:</strong> Unconfirmed mechanisms are explicitly categorized as assumptions or hypotheses.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C85A32] font-bold">·</span>
                <span><strong>Strict Text-Based Prioritization:</strong> Experiments are classified by concrete impact & effort trade-offs without confusing 2x2 charts.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-stone-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34E29] rounded-md transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
