/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProblemInput, AnalysisReport, SavedAnalysis } from './types';
import { TopNav } from './components/TopNav';
import { ProblemInputForm } from './components/ProblemInputForm';
import { AnalysisLoading } from './components/AnalysisLoading';
import { ReportView } from './components/ReportView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { HowItWorksModal } from './components/HowItWorksModal';
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

const STORAGE_KEY = 'product_diagnosis_studio_history_v1';
const LEGACY_STORAGE_KEY = 'problem_lab_investigation_history_v1';

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
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Load history from localStorage (with legacy fallback)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans antialiased selection:bg-[#C85A32]/20 selection:text-[#C85A32]">
      {/* Slim Horizontal Top Navigation Bar */}
      <TopNav
        onNewAnalysis={handleNewAnalysis}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHowItWorks={() => setIsHelpOpen(true)}
        savedCount={savedList.length}
        hasReport={!!report}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 max-w-4xl mx-auto bg-rose-50 border border-rose-200 rounded-md p-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-rose-100 text-rose-800 rounded shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-rose-950 mb-0.5">
                  Investigation Diagnostic Failed
                </h4>
                <p className="text-rose-800 leading-relaxed mb-3">
                  {error}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAnalyze(inputData)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-white bg-[#C85A32] hover:bg-[#B34E29] rounded-md transition-colors cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Analysis</span>
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-stone-700 bg-white hover:bg-stone-100 rounded-md transition-colors cursor-pointer border border-stone-200"
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

        {/* Workspace Input State */}
        {!isLoading && !report && (
          <ProblemInputForm
            initialInput={inputData}
            onSubmit={handleAnalyze}
            isLoading={isLoading}
          />
        )}

        {/* Analysis Results Experience */}
        {!isLoading && report && (
          <ReportView
            input={inputData}
            report={report}
            onNewInvestigation={handleNewAnalysis}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-stone-200 bg-[#FAF8F5] py-4 px-4 sm:px-6 lg:px-8 text-xs text-stone-500">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800">Product Diagnosis Studio</span>
            <span className="text-stone-300">·</span>
            <span>Product Strategy Workspace</span>
          </div>
          <div className="text-stone-400 text-[11px] font-mono">
            Diagnose → Hypothesize → Investigate → Experiment → Measure → Act
          </div>
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

      {/* How It Works Modal */}
      <HowItWorksModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
