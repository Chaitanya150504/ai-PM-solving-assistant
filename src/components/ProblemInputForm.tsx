import React, { useState } from 'react';
import { ProblemInput } from '../types';
import { PRESET_SCENARIOS, PresetScenario } from '../data/presets';
import {
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

interface ProblemInputFormProps {
  initialInput?: ProblemInput;
  onSubmit: (input: ProblemInput) => void;
  isLoading: boolean;
}

const SIX_PHASES = [
  'Diagnose',
  'Hypothesize',
  'Investigate',
  'Experiment',
  'Measure',
  'Act',
];

const METHODOLOGY_STEPS = [
  {
    phase: '01. Diagnose',
    desc: 'Reframes symptom, stakeholders, business urgency, and core mechanisms.',
  },
  {
    phase: '02. Hypothesize',
    desc: 'Separates observed ground-truth facts from unconfirmed assumptions.',
  },
  {
    phase: '03. Investigate',
    desc: 'Formulates targeted discovery inquiries and quantitative telemetry needs.',
  },
  {
    phase: '04. Experiment',
    desc: 'Structures falsifiable tests with explicit Go/No-Go decision rules.',
  },
  {
    phase: '05. Measure',
    desc: 'Defines North Star metrics without fabricating synthetic baselines.',
  },
  {
    phase: '06. Act',
    desc: 'Sequences step-by-step execution milestones across team owners.',
  },
];

export const ProblemInputForm: React.FC<ProblemInputFormProps> = ({
  initialInput,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<ProblemInput>(
    initialInput || {
      problemStatement: '',
      productCompany: '',
      targetUsers: '',
      goal: '',
      additionalContext: '',
    }
  );

  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'problemStatement' && value.trim()) {
      setValidationError(null);
    }
  };

  const handleApplyPreset = (preset: PresetScenario) => {
    setFormData({ ...preset.input });
    setActiveScenarioId(preset.id);
    setValidationError(null);
  };

  const handleReset = () => {
    setFormData({
      problemStatement: '',
      productCompany: '',
      targetUsers: '',
      goal: '',
      additionalContext: '',
    });
    setActiveScenarioId(null);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problemStatement.trim()) {
      setValidationError('Please provide a problem statement to initiate diagnosis.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="max-w-[1300px] mx-auto space-y-6">
      {/* Top Six-Phases Progress Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-stone-500 font-mono scrollbar-none">
        <span className="text-stone-400 font-semibold tracking-wider uppercase text-[10px] shrink-0">
          Six Phases:
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {SIX_PHASES.map((phase, idx) => (
            <React.Fragment key={phase}>
              <span className="hover:text-stone-800 transition-colors">
                {phase}
              </span>
              {idx < SIX_PHASES.length - 1 && (
                <span className="text-stone-300 select-none">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Editorial Heading & Subtitle */}
      <div className="space-y-1.5 pt-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
          Understand the problem before building the solution.
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
          Turn ambiguous product challenges into evidence-driven hypotheses, experiments, and action plans.
        </p>
      </div>

      {/* Compact Sample Scenarios Selector */}
      <div className="bg-white border border-stone-200 rounded-md p-3.5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold">
            Sample Scenarios
          </span>
          <span className="text-[11px] text-stone-400">
            Click to autofill the investigation form
          </span>
        </div>

        {/* Compact Horizontal List / Segmented Row */}
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = activeScenarioId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-left px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-[#FAF8F5] text-stone-800 border-stone-200/90 hover:border-stone-300 hover:bg-stone-100/80'
                }`}
              >
                <span
                  className={`text-[10px] font-mono tracking-wide ${
                    isSelected ? 'text-[#E5855E]' : 'text-[#C85A32]'
                  }`}
                >
                  {preset.badge}
                </span>
                <span className="text-stone-300 select-none">·</span>
                <span className="font-medium truncate max-w-[220px] sm:max-w-none">
                  {preset.title}
                </span>
                {isSelected && (
                  <Check className="w-3 h-3 text-[#E5855E] shrink-0 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Problem Input Form + Narrower Information Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Problem-Input Form (approx. 65% width) */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-md p-6 sm:p-7 shadow-2xs space-y-5">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">
              Problem Intake
            </h2>
            <span className="text-[11px] font-mono text-stone-400">
              Field inputs & context
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Problem Statement (Primary Input) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="problemStatement"
                  className="text-xs font-semibold text-stone-800 flex items-center gap-1"
                >
                  <span>Problem Statement</span>
                  <span className="text-[#C85A32]">*</span>
                </label>
                <span className="text-[11px] font-mono text-stone-400">
                  Required
                </span>
              </div>
              <textarea
                id="problemStatement"
                name="problemStatement"
                rows={4}
                value={formData.problemStatement}
                onChange={handleChange}
                placeholder="What friction, metric drop, or customer breakdown are you investigating? (e.g., Many users add products to their shopping carts but leave without completing their purchases...)"
                className={`w-full px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 bg-white border rounded-md focus:outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32] transition-colors resize-y leading-relaxed ${
                  validationError
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              />
              {validationError && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {validationError}
                </p>
              )}
            </div>

            {/* Product or Company & Target Users */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="productCompany"
                  className="text-xs font-semibold text-stone-800 block"
                >
                  Product or Company
                </label>
                <input
                  type="text"
                  id="productCompany"
                  name="productCompany"
                  value={formData.productCompany}
                  onChange={handleChange}
                  placeholder="e.g. Food Delivery App or TaskFlow"
                  className="w-full px-3 py-2 text-xs text-stone-900 placeholder-stone-400 bg-white border border-stone-200 rounded-md hover:border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="targetUsers"
                  className="text-xs font-semibold text-stone-800 block"
                >
                  Target Users
                </label>
                <input
                  type="text"
                  id="targetUsers"
                  name="targetUsers"
                  value={formData.targetUsers}
                  onChange={handleChange}
                  placeholder="e.g. Online Shoppers or Mid-Market PMs"
                  className="w-full px-3 py-2 text-xs text-stone-900 placeholder-stone-400 bg-white border border-stone-200 rounded-md hover:border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32] transition-colors"
                />
              </div>
            </div>

            {/* Goal */}
            <div className="space-y-1.5">
              <label
                htmlFor="goal"
                className="text-xs font-semibold text-stone-800 block"
              >
                Goal / Target Outcome
              </label>
              <input
                type="text"
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                placeholder="e.g. Identify reasons for cart abandonment and improve checkout conversion"
                className="w-full px-3 py-2 text-xs text-stone-900 placeholder-stone-400 bg-white border border-stone-200 rounded-md hover:border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32] transition-colors"
              />
            </div>

            {/* Additional Context */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="additionalContext"
                  className="text-xs font-semibold text-stone-800"
                >
                  Additional Context
                </label>
                <span className="text-[11px] text-stone-400">Optional</span>
              </div>
              <textarea
                id="additionalContext"
                name="additionalContext"
                rows={3}
                value={formData.additionalContext}
                onChange={handleChange}
                placeholder="Mention any known constraints, recent release changes, customer quotes, or operational observations..."
                className="w-full px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 bg-white border border-stone-200 rounded-md hover:border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#C85A32] focus:border-[#C85A32] transition-colors resize-y leading-relaxed"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors cursor-pointer py-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Form</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer shadow-2xs ${
                  isLoading
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                    : 'bg-[#C85A32] hover:bg-[#B34E29] text-white active:bg-[#9E421E]'
                }`}
              >
                <span>Analyze Problem</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Narrower Information Panel on Desktop (approx. 35% width) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Methodology Card */}
          <div className="bg-white border border-stone-200 rounded-md p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-900">
                Diagnostic Framework
              </span>
            </div>
            <div className="space-y-2.5">
              {METHODOLOGY_STEPS.map((m) => (
                <div key={m.phase} className="space-y-0.5">
                  <span className="text-[11px] font-mono font-medium text-stone-800 block">
                    {m.phase}
                  </span>
                  <p className="text-[11px] text-stone-500 leading-snug">
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Dossier Contents Checklist */}
          <div className="bg-white border border-stone-200 rounded-md p-5 shadow-2xs space-y-2.5 text-xs">
            <span className="text-xs font-semibold text-stone-900 block pb-1 border-b border-stone-100">
              13 Output Deliverables
            </span>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Produces a complete diagnostic report with root causes, testable hypotheses, discovery questions, candidate interventions, text-based experiment prioritization (Quick Wins, Strategic Bets, Moderate Priority, Fill-ins, Deprioritize), North Star metrics, and an execution roadmap.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-stone-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
              <span>Evidence-based · No synthetic metrics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
