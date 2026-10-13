import React, { useEffect, useState } from 'react';
import { Brain, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

const STAGES = [
  { label: 'Framing Problem & Stakeholders', desc: 'Rewriting statement and identifying who is impacted and business urgency.' },
  { label: 'Deconstructing Dimensions & Root Causes', desc: 'Separating surface symptoms from underlying systemic drivers.' },
  { label: 'Formulating Testable Hypotheses', desc: 'Establishing evidence requirements, investigation questions, and confidence ratings.' },
  { label: 'Structuring Experiments & Prioritization', desc: 'Mapping interventions to a 2x2 Impact vs Effort framework.' },
  { label: 'Synthesizing Guardrails & Action Plan', desc: 'Finalizing primary/guardrail metrics and immediate recommended next step.' },
];

export const AnalysisLoading: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 animate-pulse">
          <Brain className="w-8 h-8" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-xs">
          <Sparkles className="w-3 h-3" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Systematically Analyzing Product Problem
      </h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
        Applying rigorous product management frameworks to dissect root causes, form hypotheses, and construct prioritized experiments.
      </p>

      {/* Progress Stages */}
      <div className="space-y-3 text-left max-w-lg mx-auto bg-gray-50/70 p-4 rounded-xl border border-gray-100">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;
          const isPending = idx > currentStage;

          return (
            <div
              key={stage.label}
              className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                isCurrent ? 'bg-white shadow-xs border border-blue-100' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-300 bg-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isDone
                        ? 'text-gray-700'
                        : isCurrent
                        ? 'text-blue-700 font-bold'
                        : 'text-gray-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Processing...
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-gray-400">
        Estimated analysis time: 8-15 seconds for complete 13-section PM breakdown
      </div>
    </div>
  );
};
