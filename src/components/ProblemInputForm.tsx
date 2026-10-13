import React, { useState } from 'react';
import { ProblemInput } from '../types';
import { PRESET_SCENARIOS, PresetScenario } from '../data/presets';
import { ArrowRight, Sparkles, HelpCircle, Layers, Lightbulb, RefreshCw } from 'lucide-react';

interface ProblemInputFormProps {
  initialInput?: ProblemInput;
  onSubmit: (input: ProblemInput) => void;
  isLoading: boolean;
}

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
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problemStatement.trim()) {
      setValidationError('Please enter a problem statement to analyze.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Intro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Product Management Decision Support
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Systematically Solve Product Problems
        </h1>
        <p className="mt-2.5 text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Move from ambiguous business challenges to rigorously deconstructed root causes, hypotheses, prioritized experiments, and an actionable execution plan.
        </p>
      </div>

      {/* Preset Problem Scenarios Picker */}
      <div className="mb-6 bg-white border border-gray-200/90 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Quick Load Sample Problem Scenarios
            </span>
          </div>
          <span className="text-xs text-gray-400">Click to autofill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mb-1">
                  {preset.badge}
                </span>
                <div className="text-xs font-semibold text-gray-900 group-hover:text-blue-700">
                  {preset.title}
                </div>
              </div>
              <div className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-6"
      >
        {/* 1. Problem Statement */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="problemStatement"
              className="text-sm font-bold text-gray-900 flex items-center gap-1.5"
            >
              <span>Problem Statement</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-gray-400 font-medium">Required</span>
          </div>
          <p className="text-xs text-gray-500">
            What friction, metric drop, or customer pain is occurring?
          </p>
          <textarea
            id="problemStatement"
            name="problemStatement"
            rows={4}
            value={formData.problemStatement}
            onChange={handleChange}
            placeholder="Describe the product or business problem... (e.g., Users of our food delivery app are placing fewer repeat orders after their initial month)"
            className={`w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors resize-y ${
              validationError
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          {validationError && (
            <p className="text-xs text-rose-600 font-medium">{validationError}</p>
          )}
        </div>

        {/* 2, 3, 4: Product / Company, Target Users, Goal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 2. Product / Company */}
          <div className="space-y-1.5">
            <label
              htmlFor="productCompany"
              className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center justify-between"
            >
              <span>Product / Company</span>
              <span className="text-[10px] text-gray-400 font-normal">Optional</span>
            </label>
            <input
              type="text"
              id="productCompany"
              name="productCompany"
              value={formData.productCompany}
              onChange={handleChange}
              placeholder="e.g. QuickBite, SaaS Dashboard"
              className="w-full px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            />
          </div>

          {/* 3. Target Users */}
          <div className="space-y-1.5">
            <label
              htmlFor="targetUsers"
              className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center justify-between"
            >
              <span>Target Users</span>
              <span className="text-[10px] text-gray-400 font-normal">Optional</span>
            </label>
            <input
              type="text"
              id="targetUsers"
              name="targetUsers"
              value={formData.targetUsers}
              onChange={handleChange}
              placeholder="e.g. College Students, Enterprise Admins"
              className="w-full px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            />
          </div>

          {/* 4. Goal */}
          <div className="space-y-1.5">
            <label
              htmlFor="goal"
              className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center justify-between"
            >
              <span>Goal</span>
              <span className="text-[10px] text-gray-400 font-normal">Optional</span>
            </label>
            <input
              type="text"
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              placeholder="e.g. Increase repeat orders, reduce churn"
              className="w-full px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            />
          </div>
        </div>

        {/* 5. Additional Context */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="additionalContext"
              className="text-xs font-bold text-gray-800 uppercase tracking-wide"
            >
              Additional Context
            </label>
            <span className="text-[10px] text-gray-400">Optional</span>
          </div>
          <p className="text-xs text-gray-500">
            Mention any known funnel data, recent releases, competitor shifts, customer feedback, or technical constraints.
          </p>
          <textarea
            id="additionalContext"
            name="additionalContext"
            rows={3}
            value={formData.additionalContext}
            onChange={handleChange}
            placeholder="e.g., We recently raised delivery fees by $1.50; customer satisfaction scores remain high but cohort repeat rates plummeted; competitors launched group buying."
            className="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-xl hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors resize-y"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Layers className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Generates complete 13-stage PM breakdown with prioritized experiments</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Problem...</span>
              </>
            ) : (
              <>
                <span>Analyze Problem</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
