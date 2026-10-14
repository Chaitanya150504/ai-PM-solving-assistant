/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProblemInput, AnalysisReport, SavedAnalysis } from './types';
import { Header } from './components/Header';
import { ProblemInputForm } from './components/ProblemInputForm';
import { AnalysisLoading } from './components/AnalysisLoading';
import { ReportView } from './components/ReportView';
import { SavedReportsModal } from './components/SavedReportsModal';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'ai_pm_problem_solving_history_v1';

export default function App() {
  const [inputData, setInputData] = useState<ProblemInput>({
    problemStatement: '',
    productCompany: '',
    targetUsers: '',
    goal: '',
    additionalContext: '',
  });

  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedList, setSavedList] = useState<SavedAnalysis[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedList(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load analysis history from localStorage:', e);
    }
  }, []);

  // Save analysis to history
  const saveToHistory = (input: ProblemInput, generatedReport: AnalysisReport) => {
    try {
      const newEntry: SavedAnalysis = {
        id: `analysis-${Date.now()}`,
        timestamp: Date.now(),
        input,
        report: generatedReport,
      };
      const updated = [newEntry, ...savedList.slice(0, 19)]; // Keep up to 20
      setSavedList(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  };

  const handleDeleteHistory = (id: string) => {
    const updated = savedList.filter((item) => item.id !== id);
    setSavedList(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist history deletion:', e);
    }
  };

  const handleSelectHistory = (item: SavedAnalysis) => {
    setInputData(item.input);
    setReport(item.report);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async (submittedInput: ProblemInput) => {
    setInputData(submittedInput);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submittedInput),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          // fallback if response was not valid JSON
        }
      }

      if (!response.ok || !data || !data.success) {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              'API endpoint /api/analyze was not found (404). Please ensure the api/analyze.ts serverless function is deployed on Vercel.'
            );
          }
          if (response.status === 500 && data?.error) {
            throw new Error(data.error);
          }
        }

        const rawText =
          data?.error ||
          (await response.text().catch(() => '')) ||
          `Request failed with status ${response.status}`;
        const cleanMsg =
          typeof rawText === 'string' && (rawText.startsWith('<') || rawText.startsWith('The page'))
            ? `Server error (${response.status}). Please check Vercel serverless function logs and verify that GEMINI_API_KEY is configured in Environment Variables.`
            : typeof rawText === 'string'
              ? rawText
              : 'Failed to analyze problem. Please try again.';

        throw new Error(cleanMsg);
      }

      setReport(data.report);
      saveToHistory(submittedInput, data.report);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(
        err.message || 'An unexpected error occurred while analyzing the problem. Please verify and retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setReport(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 flex flex-col font-sans">
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedList.length}
        onNewAnalysis={handleNewAnalysis}
        hasReport={Boolean(report)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-rose-900 mb-1">
                  Problem Analysis Failed
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed mb-3">
                  {error}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAnalyze(inputData)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Analysis</span>
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Edit Input</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <AnalysisLoading />}

        {/* Input Form State */}
        {!isLoading && !report && (
          <ProblemInputForm
            initialInput={inputData}
            onSubmit={handleAnalyze}
            isLoading={isLoading}
          />
        )}

        {/* Report View State */}
        {!isLoading && report && (
          <ReportView
            input={inputData}
            report={report}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            <span className="font-semibold text-gray-700">AI Problem-Solving Assistant</span>
            {' — '}
            Product Management decision-support engine.
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Root Causes</span>
            <span>•</span>
            <span>Hypotheses</span>
            <span>•</span>
            <span>Prioritized Experiments</span>
            <span>•</span>
            <span>Guardrails</span>
          </div>
        </div>
      </footer>

      {/* History Modal */}
      <SavedReportsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedList={savedList}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
      />
    </div>
  );
}
