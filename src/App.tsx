/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProblemInput, AnalysisReport, SavedAnalysis } from './types';
import { AppHeader } from './components/AppHeader';
import { ProblemInputForm } from './components/ProblemInputForm';
import { AnalysisLoading } from './components/AnalysisLoading';
import { ReportView } from './components/ReportView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'ai_problem_solving_assistant_history_v1';
const LEGACY_KEYS = [
  'product_diagnosis_studio_history_v1',
  'problem_lab_investigation_history_v1',
];

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
      let stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        for (const k of LEGACY_KEYS) {
          const legacy = localStorage.getItem(k);
          if (legacy) {
            stored = legacy;
            break;
          }
        }
      }
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
      const newId = `analysis-${Date.now()}`;
      const newEntry: SavedAnalysis = {
        id: newId,
        timestamp: Date.now(),
        input,
        report: generatedReport,
      };
      const updated = [
        newEntry,
        ...savedList
          .filter((item) => item.input.problemStatement !== input.problemStatement)
          .slice(0, 19),
      ];
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
    setIsHistoryOpen(false);
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
              'API endpoint /api/analyze was not found (404). If running on Vercel, verify that the api/analyze.ts serverless function is deployed.'
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
            ? `Server error (${response.status}). Please check serverless function logs and verify that GEMINI_API_KEY is configured in Vercel Project Settings.`
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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-800">
      {/* Simple Header */}
      <AppHeader
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedList.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 max-w-4xl mx-auto bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5 text-xs text-rose-800 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-rose-900 mb-0.5">
                  Analysis Failed
                </h4>
                <p className="text-rose-700 leading-relaxed mb-3">
                  {error}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAnalyze(inputData)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Analysis</span>
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-all cursor-pointer border border-gray-300"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Form</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <AnalysisLoading />}

        {/* Form State */}
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
            onNewInvestigation={handleNewAnalysis}
          />
        )}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 px-4 sm:px-6 text-xs text-gray-500 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-600">
            <strong>AI Problem-Solving Assistant</strong> · Structured product problem-solving &amp; decision-support tool
          </p>
          <p className="text-gray-400 text-[11px]">
            Designed for Product Managers
          </p>
        </div>
      </footer>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedList={savedList}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
      />
    </div>
  );
}
