import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

const STAGES = [
  'Framing problem definition and core urgency...',
  'Deconstructing problem dimensions and affected cohorts...',
  'Identifying root causes and contributing factors...',
  'Formulating testable hypotheses and assumptions...',
  'Synthesizing investigation questions and data signals...',
  'Developing potential solutions and proposed experiments...',
  'Prioritizing experiments and structuring action plan...',
];

export const AnalysisLoading: React.FC = () => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Analyzing Product Problem
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Our AI model is synthesizing root causes, formulating hypotheses, and structuring validation experiments.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-left space-y-2.5 max-w-md mx-auto">
          {STAGES.map((stage, idx) => {
            const isDone = idx < stageIndex;
            const isCurrent = idx === stageIndex;
            return (
              <div
                key={stage}
                className={`flex items-center gap-2.5 text-xs transition-opacity ${
                  isCurrent
                    ? 'text-blue-600 font-semibold'
                    : isDone
                      ? 'text-gray-400'
                      : 'text-gray-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                )}
                <span>{stage}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
