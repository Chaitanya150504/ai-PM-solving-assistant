import React, { useState } from 'react';
import { ProblemInput } from '../types';
import { PRESET_SCENARIOS, PresetScenario } from '../data/presets';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface ProblemInputFormProps {
  initialInput: ProblemInput;
  onSubmit: (input: ProblemInput) => void;
  isLoading: boolean;
}

export const ProblemInputForm: React.FC<ProblemInputFormProps> = ({
  initialInput,
  onSubmit,
  isLoading,
}) => {
  const [form, setForm] = useState<ProblemInput>(initialInput);

  const handleLoadPreset = (scenario: PresetScenario) => {
    setForm(scenario.input);
  };

  const handleClear = () => {
    setForm({
      problemStatement: '',
      productCompany: '',
      targetUsers: '',
      goal: '',
      additionalContext: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.problemStatement.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Centered Hero Heading */}
      <div className="text-center max-w-3xl mx-auto mb-8 pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
          Systematically Solve Product Problems
        </h1>
        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
          Deconstruct ambiguous product challenges, isolate root causes, formulate testable hypotheses, prioritize validation experiments, and construct defensible decision roadmaps.
        </p>
      </div>

      {/* Quick Load Sample Problem Scenarios */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Load Sample Problem Scenarios
          </h2>
          <span className="text-xs text-gray-400">Click a scenario to pre-fill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => handleLoadPreset(scenario)}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-sm cursor-pointer transition text-left group flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-2 group-hover:bg-blue-100 transition">
                  {scenario.badge}
                </span>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                  {scenario.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {scenario.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Problem Input Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Problem Statement */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="problemStatement" className="block text-sm font-semibold text-gray-900">
                Problem Statement <span className="text-red-500">*</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Explain the business problem.
            </p>
            <textarea
              id="problemStatement"
              rows={4}
              value={form.problemStatement}
              onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
              placeholder="Describe the product or business problem..."
              className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-400"
              required
            />
          </div>

          {/* Product / Company, Target Users, Desired Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="productCompany" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Product / Company
              </label>
              <input
                id="productCompany"
                type="text"
                value={form.productCompany}
                onChange={(e) => setForm({ ...form, productCompany: e.target.value })}
                placeholder="e.g. Acme Food Delivery, B2B CRM"
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-400"
              />
            </div>

            <div>
              <label htmlFor="targetUsers" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Target Users
              </label>
              <input
                id="targetUsers"
                type="text"
                value={form.targetUsers}
                onChange={(e) => setForm({ ...form, targetUsers: e.target.value })}
                placeholder="e.g. College students, Mid-market sales"
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-400"
              />
            </div>

            <div>
              <label htmlFor="goal" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Desired Goal
              </label>
              <input
                id="goal"
                type="text"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                placeholder="e.g. Increase repeat orders by 20%"
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-400"
              />
            </div>
          </div>

          {/* Additional Context */}
          <div>
            <label htmlFor="additionalContext" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Additional Context
            </label>
            <textarea
              id="additionalContext"
              rows={3}
              value={form.additionalContext}
              onChange={(e) => setForm({ ...form, additionalContext: e.target.value })}
              placeholder="Include any relevant background, observed metrics, customer quotes, recent feature launches, or known constraints..."
              className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-400"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || !form.problemStatement.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium text-sm rounded-lg transition shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Analyzing Problem...' : 'Analyze Problem'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Clear Form</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
