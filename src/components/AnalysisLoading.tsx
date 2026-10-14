import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Layers } from 'lucide-react';

const STAGES = [
  { label: 'Framing Problem & Core Urgency', desc: 'Rewriting problem statement, isolating affected cohorts, and assessing business criticality.' },
  { label: 'Deconstructing Symptoms & Root Causes', desc: 'Isolating observed ground-truth facts from potential unconfirmed mechanisms.' },
  { label: 'Formulating Testable Hypotheses', desc: 'Establishing evidence requirements, investigation questions, and confidence rationale.' },
  { label: 'Structuring & Prioritizing Interventions', desc: 'Classifying proposed experiments into logical impact/effort tiers without 2x2 matrix.' },
  { label: 'Synthesizing Metrics & Action Roadmap', desc: 'Establishing North Star baseline rules, guardrail thresholds, and execution steps.' },
];

export const AnalysisLoading: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-xl mx-auto my-12 bg-white rounded-md border border-stone-200 p-8 shadow-2xs text-center space-y-5">
      <div className="w-10 h-10 mx-auto rounded-md bg-[#FAF8F5] border border-stone-200 flex items-center justify-center text-[#C85A32]">
        <Layers className="w-5 h-5 animate-pulse" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-stone-900 tracking-tight">
          Analyzing Product Problem
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
          Executing evidence-based investigation across root causes, hypotheses, prioritized experiments, and action milestones.
        </p>
      </div>

      {/* Progress Stages */}
      <div className="space-y-2 text-left max-w-md mx-auto bg-[#FAF8F5] p-4 rounded-md border border-stone-200/80">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;

          return (
            <div
              key={stage.label}
              className={`flex items-start gap-2.5 p-2 rounded-md transition-colors ${
                isCurrent ? 'bg-white border border-stone-200 shadow-2xs' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#C85A32] animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded border border-stone-300 bg-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs ${
                      isDone
                        ? 'text-stone-700 font-medium'
                        : isCurrent
                        ? 'text-stone-900 font-semibold'
                        : 'text-stone-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-[#C85A32] bg-[#C85A32]/10 px-1.5 py-0.2 rounded font-semibold">
                      In progress
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] font-mono text-stone-400">
        Estimated analysis time: 8–15 seconds for complete 13-stage dossier
      </div>
    </div>
  );
};
