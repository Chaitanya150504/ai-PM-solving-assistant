import React, { useState, useRef } from 'react';
import {
  AnalysisReport,
  ProblemInput,
} from '../types';
import { PrioritizationSection } from './PrioritizationSection';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  FileDown,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  FileText,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Users,
  Compass,
  Database,
  FlaskConical,
  BarChart3,
  ListOrdered,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { generateMarkdownReport, downloadMarkdownFile } from '../utils/markdownExporter';
import { exportReportToPdf } from '../utils/pdfExporter';

interface ReportViewProps {
  input: ProblemInput;
  report: AnalysisReport;
  onNewAnalysis: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  input,
  report,
  onNewAnalysis,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('all');

  const sectionRefs = {
    executive: useRef<HTMLDivElement>(null),
    definition: useRef<HTMLDivElement>(null),
    breakdown: useRef<HTMLDivElement>(null),
    rootcauses: useRef<HTMLDivElement>(null),
    hypotheses: useRef<HTMLDivElement>(null),
    investigation: useRef<HTMLDivElement>(null),
    data: useRef<HTMLDivElement>(null),
    solutions: useRef<HTMLDivElement>(null),
    experiments: useRef<HTMLDivElement>(null),
    prioritization: useRef<HTMLDivElement>(null),
    metrics: useRef<HTMLDivElement>(null),
    risks: useRef<HTMLDivElement>(null),
    actionplan: useRef<HTMLDivElement>(null),
  };

  const handleCopy = async () => {
    const md = generateMarkdownReport(input, report);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = md;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleExport = () => {
    const slug = (input.productCompany || 'problem')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const md = generateMarkdownReport(input, report);
    downloadMarkdownFile(md, `${slug}-pm-analysis.md`);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfError(null);
      await exportReportToPdf(report, input);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 2500);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      setPdfError('Failed to generate PDF. Please try again.');
      setTimeout(() => setPdfError(null), 4000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const scrollTo = (refKey: keyof typeof sectionRefs) => {
    setActiveSection(refKey);
    sectionRefs[refKey]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getConfidenceBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const getImpactBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'medium':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEffortBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              PM Decision Report
            </span>
            {input.productCompany && (
              <span className="text-xs font-semibold text-gray-600">
                {input.productCompany}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {report.problemDefinition.redefinedProblem || input.problemStatement}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Report Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span>Copy Report</span>
              </>
            )}
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export .MD</span>
          </button>

          {/* Prominent Download PDF button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            title="Download complete 13-stage analysis report as a formatted PDF"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-white" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {pdfError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{pdfError}</span>
          </div>
          <button
            onClick={() => setPdfError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quick Jump Pills Nav */}
      <div className="sticky top-2 z-30 bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-xl p-2 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">
            Jump to:
          </span>
          <button
            onClick={() => scrollTo('executive')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            1. Exec Summary
          </button>
          <button
            onClick={() => scrollTo('definition')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            2. Definition
          </button>
          <button
            onClick={() => scrollTo('breakdown')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            3. Breakdown
          </button>
          <button
            onClick={() => scrollTo('rootcauses')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            4. Root Causes
          </button>
          <button
            onClick={() => scrollTo('hypotheses')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            5. Hypotheses
          </button>
          <button
            onClick={() => scrollTo('investigation')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            6. Investigation
          </button>
          <button
            onClick={() => scrollTo('data')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            7. Signals
          </button>
          <button
            onClick={() => scrollTo('solutions')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            8. Solutions
          </button>
          <button
            onClick={() => scrollTo('experiments')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            9. Experiments
          </button>
          <button
            onClick={() => scrollTo('prioritization')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            10. Prioritization
          </button>
          <button
            onClick={() => scrollTo('metrics')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            11. Metrics
          </button>
          <button
            onClick={() => scrollTo('risks')}
            className="px-2.5 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            12. Risks
          </button>
          <button
            onClick={() => scrollTo('actionplan')}
            className="px-2.5 py-1 rounded-md text-blue-700 bg-blue-50 font-semibold hover:bg-blue-100 transition-colors"
          >
            13. Action Plan
          </button>
        </div>
      </div>

      {/* ========================================================
          1. EXECUTIVE SUMMARY
         ======================================================== */}
      <div
        ref={sectionRefs.executive}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              1. Executive Summary
            </h2>
            <p className="text-xs text-gray-500">
              Concise problem synthesis and recommended strategic direction
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                Problem Summary
              </span>
              <p className="text-sm text-gray-800 leading-relaxed">
                {report.executiveSummary.problemSummary}
              </p>
            </div>

            <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                Recommended Direction
              </span>
              <p className="text-sm text-blue-900 leading-relaxed font-medium">
                {report.executiveSummary.recommendedDirection}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                Core Strategic Insight
              </span>
              <p className="text-xs text-indigo-950 leading-relaxed italic">
                "{report.executiveSummary.coreInsight}"
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-indigo-100/80 flex items-center justify-between text-[11px] text-indigo-700 font-semibold">
              <span>Goal: {input.goal || 'Retention / Growth'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. PROBLEM DEFINITION
         ======================================================== */}
      <div
        ref={sectionRefs.definition}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              2. Problem Definition
            </h2>
            <p className="text-xs text-gray-500">
              Framing the core problem statement, affected users, and why it matters
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-l-4 border-indigo-600 bg-indigo-50/40 p-4 rounded-r-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
              Redefined & Clarified Problem
            </span>
            <p className="text-sm text-gray-900 font-semibold leading-relaxed">
              {report.problemDefinition.redefinedProblem}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Who Is Affected
              </div>
              <ul className="space-y-1.5">
                {report.problemDefinition.affectedStakeholders.map((s, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                Business Impact & Urgency
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                {report.problemDefinition.businessImpactAndUrgency}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                <Compass className="w-3.5 h-3.5 text-purple-600" />
                Why It Matters
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                {report.problemDefinition.whyItMatters}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. PROBLEM BREAKDOWN
         ======================================================== */}
      <div
        ref={sectionRefs.breakdown}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              3. Problem Breakdown
            </h2>
            <p className="text-xs text-gray-500">
              Deconstructing the issue into specific functional and behavioral dimensions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.problemBreakdown.dimensions.map((dim, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl p-4 hover:border-sky-300 transition-colors bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded uppercase">
                    Dimension {idx + 1}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-gray-900 mb-1">
                  {dim.dimensionName}
                </h3>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  {dim.description}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">
                  Sub-components
                </span>
                <ul className="space-y-1">
                  {dim.subComponents.map((sub, sIdx) => (
                    <li key={sIdx} className="text-xs text-gray-700 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-sky-400 shrink-0" />
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          4. ROOT CAUSE ANALYSIS
         ======================================================== */}
      <div
        ref={sectionRefs.rootcauses}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              4. Root Cause Analysis
            </h2>
            <p className="text-xs text-gray-500">
              Rigorous separation of user-provided facts, possible root causes, and unvalidated hypotheses
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 1. User-Provided Facts */}
          <div className="border border-emerald-200/90 rounded-xl p-4 bg-emerald-50/30">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                1. User-Provided Facts (Ground Truth)
              </h4>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                Supplied by User
              </span>
            </div>
            <p className="text-[11px] text-gray-600 mb-3">
              Only facts and observations explicitly provided by the user in the problem statement or context are treated as confirmed.
            </p>
            <ul className="space-y-2">
              {report.rootCauseAnalysis.userProvidedFacts && report.rootCauseAnalysis.userProvidedFacts.length > 0 ? (
                report.rootCauseAnalysis.userProvidedFacts.map((fact, idx) => (
                  <li key={idx} className="bg-white border border-emerald-200/80 rounded-lg p-2.5 text-xs text-gray-800 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))
              ) : (
                <li className="bg-white border border-emerald-200/80 rounded-lg p-2.5 text-xs text-gray-800 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>
                    Reported problem statement: "{input.problemStatement}"
                    {input.additionalContext ? ` | Context: "${input.additionalContext}"` : ''}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 2. Possible Root Causes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  2. Possible Root Causes
                </h4>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Unconfirmed Possibilities
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Plausible underlying mechanisms that could explain the problem. These are not confirmed facts.
              </p>
              <div className="space-y-2.5">
                {(report.rootCauseAnalysis.possibleRootCauses || report.rootCauseAnalysis.probableRootCauses || []).map((rc, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-xl p-3.5 text-xs hover:border-indigo-300 transition-colors shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-gray-900">{rc.cause}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {rc.category}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          {rc.statusLabel || 'Assumption'}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1 leading-relaxed">
                      <span className="font-medium text-gray-800">Possible Mechanism:</span>{' '}
                      {rc.mechanism}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Hypotheses Requiring Validation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  3. Hypotheses Requiring Validation
                </h4>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                  Must Be Empirically Tested
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Key testable assertions that need data or user signals before committing product solutions.
              </p>
              <div className="space-y-2.5">
                {report.rootCauseAnalysis.hypothesesRequiringValidation && report.rootCauseAnalysis.hypothesesRequiringValidation.length > 0 ? (
                  report.rootCauseAnalysis.hypothesesRequiringValidation.map((hypoStr, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-50/40 border border-purple-200/80 rounded-xl p-3.5 text-xs text-purple-950 flex items-start gap-2"
                    >
                      <span className="font-bold text-purple-700 shrink-0">H{idx + 1}:</span>
                      <span className="leading-relaxed">{hypoStr}</span>
                    </div>
                  ))
                ) : (
                  (report.hypotheses || []).slice(0, 3).map((h, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-50/40 border border-purple-200/80 rounded-xl p-3.5 text-xs text-purple-950 flex items-start gap-2"
                    >
                      <span className="font-bold text-purple-700 shrink-0">H{idx + 1}:</span>
                      <span className="leading-relaxed">{h.hypothesis}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cautionary Note */}
        {report.rootCauseAnalysis.cautionaryNote && (
          <div className="mt-5 p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900">PM Rigor Reminder: </span>
              {report.rootCauseAnalysis.cautionaryNote}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          5. HYPOTHESES
         ======================================================== */}
      <div
        ref={sectionRefs.hypotheses}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              5. Testable Hypotheses
            </h2>
            <p className="text-xs text-gray-500">
              Formulated as falsifiable assertions with explicit evidence requirements
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {report.hypotheses.map((hypo, idx) => (
            <div
              key={hypo.id || idx}
              className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-all bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    H{idx + 1}
                  </span>
                  <h3 className="text-xs font-bold text-gray-900">
                    {hypo.hypothesis}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${getConfidenceBadge(
                      hypo.confidenceLevel
                    )}`}
                  >
                    Confidence: {hypo.confidenceLevel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="font-bold text-gray-700 block mb-0.5">
                    Why It Could Be True:
                  </span>
                  <p className="text-gray-600">{hypo.whyItCouldBeTrue}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-700 block mb-0.5">
                    Evidence Needed to Validate:
                  </span>
                  <p className="text-gray-600">{hypo.evidenceNeeded}</p>
                </div>
              </div>

              {hypo.confidenceRationale && (
                <div className="mt-2 text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded">
                  Rationale for confidence: {hypo.confidenceRationale}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          6. INVESTIGATION QUESTIONS
         ======================================================== */}
      <div
        ref={sectionRefs.investigation}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              6. Investigation Questions
            </h2>
            <p className="text-xs text-gray-500">
              Crucial discovery questions to answer before jumping to solution commitments
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {report.investigationQuestions.map((iq, idx) => (
            <div
              key={idx}
              className="bg-gray-50/60 border border-gray-200/90 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
                  {iq.category}
                </span>
                <p className="text-xs font-bold text-gray-900 mb-2">
                  "{iq.question}"
                </p>
              </div>
              <div className="pt-2 border-t border-gray-200/50 text-[11px] text-gray-600">
                <span className="font-semibold text-gray-700">Why PMs ask this:</span>{' '}
                {iq.whyAskThis}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          7. DATA & SIGNALS NEEDED
         ======================================================== */}
      <div
        ref={sectionRefs.data}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              7. Data & Signals Needed
            </h2>
            <p className="text-xs text-gray-500">
              Quantitative funnels, qualitative interviews, and behavioral telemetry
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {report.dataAndSignalsNeeded.map((signal, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-emerald-300 transition-colors bg-white"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">
                    {signal.sourceOrMetric}
                  </span>
                  <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {signal.category}
                  </span>
                </div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-700">What to inspect:</span>{' '}
                  {signal.whatToLookFor}
                </p>
              </div>

              <div className="shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    signal.priority.toLowerCase().includes('p0') ||
                    signal.priority.toLowerCase().includes('immediate')
                      ? 'bg-rose-100 text-rose-700'
                      : signal.priority.toLowerCase().includes('p1')
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {signal.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          8. POTENTIAL SOLUTIONS
         ======================================================== */}
      <div
        ref={sectionRefs.solutions}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              8. Potential Solutions
            </h2>
            <p className="text-xs text-gray-500">
              Multiple candidate intervention vectors evaluated across impact, effort, and assumptions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.potentialSolutions.map((sol, idx) => (
            <div
              key={sol.id || idx}
              className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col justify-between hover:border-blue-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xs font-bold text-gray-900">
                    {sol.solutionName}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold border px-1.5 py-0.5 rounded ${getImpactBadge(
                        sol.expectedImpact
                      )}`}
                    >
                      Impact: {sol.expectedImpact}
                    </span>
                    <span
                      className={`text-[10px] font-bold border px-1.5 py-0.5 rounded ${getEffortBadge(
                        sol.effort
                      )}`}
                    >
                      Effort: {sol.effort}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {sol.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="font-semibold text-gray-700">Problem Addressed:</span>{' '}
                  <span className="text-gray-600">{sol.problemAddressed}</span>
                </div>
                <div className="bg-amber-50/60 p-2 rounded text-[11px] text-amber-900">
                  <span className="font-bold">Key Assumption:</span> {sol.keyAssumption}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          9. EXPERIMENTS
         ======================================================== */}
      <div
        ref={sectionRefs.experiments}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              9. Proposed Experiments
            </h2>
            <p className="text-xs text-gray-500">
              Structured validation tests with defined targets, durations, and go/no-go decision rules
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {report.experiments.map((exp, idx) => (
            <div
              key={exp.id || idx}
              className="border border-gray-200 rounded-xl p-5 bg-white hover:border-indigo-300 transition-colors shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                    Exp {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900">
                    {exp.experimentName}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {exp.quadrant}
                  </span>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    ⏱ {exp.duration}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-bold text-gray-700 block mb-0.5">
                    Hypothesis Tested:
                  </span>
                  <span className="text-gray-600">{exp.hypothesisTested}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-bold text-gray-700 block mb-0.5">
                    Target Users / Cohort:
                  </span>
                  <span className="text-gray-600">{exp.targetUsers}</span>
                </div>
              </div>

              <div className="text-xs space-y-1.5 mb-3">
                <div>
                  <span className="font-bold text-gray-800">Experiment Design:</span>{' '}
                  <span className="text-gray-700">{exp.experimentDesign}</span>
                </div>
                <div className="flex flex-wrap gap-4 pt-1">
                  <div>
                    <span className="font-bold text-blue-700">Primary Metric:</span>{' '}
                    <span className="text-gray-800 font-semibold">{exp.primaryMetric}</span>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-700">Expected Result:</span>{' '}
                    <span className="text-gray-700">{exp.expectedResult}</span>
                  </div>
                </div>
              </div>

              {/* Decision Rule Callout */}
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-lg p-3 text-xs text-indigo-950 flex items-start gap-2">
                <Target className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Decision Rule (Go / No-Go):</span>{' '}
                  <span>{exp.decisionRule}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          10. EXPERIMENT PRIORITIZATION
         ======================================================== */}
      <div
        ref={sectionRefs.prioritization}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              10. Experiment Prioritization
            </h2>
            <p className="text-xs text-gray-500">
              Clear text-based prioritization analysis and execution recommendations
            </p>
          </div>
        </div>

        <PrioritizationSection
          prioritization={report.experimentPrioritization}
          experiments={report.experiments}
        />
      </div>

      {/* ========================================================
          11. SUCCESS METRICS
         ======================================================== */}
      <div
        ref={sectionRefs.metrics}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              11. Success Metrics & Guardrails
            </h2>
            <p className="text-xs text-gray-500">
              Primary North Star metric, supporting secondary indicators, and business guardrails
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Primary Metric Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-2 py-0.5 rounded-full">
                  Primary Success Metric (North Star)
                </span>
                <h3 className="text-lg font-bold mt-1">
                  {report.successMetrics.primaryMetric.name}
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <span className="text-xs text-blue-100 bg-white/15 px-2.5 py-1 rounded-md font-medium border border-white/20">
                  {report.successMetrics.primaryMetric.baseline || 'Baseline: Not provided'}
                </span>
                <span className="text-xs text-blue-100 bg-white/15 px-2.5 py-1 rounded-md font-medium border border-white/20">
                  {report.successMetrics.primaryMetric.targetSuggestion ||
                    report.successMetrics.primaryMetric.targetOrBaselineSuggestion ||
                    'Suggested target: Define after establishing the baseline'}
                </span>
              </div>
            </div>

            <p className="text-xs text-blue-100 leading-relaxed">
              <strong className="text-white">Definition:</strong>{' '}
              {report.successMetrics.primaryMetric.definition}
            </p>
            <p className="text-xs text-blue-100/90 leading-relaxed italic">
              <strong className="text-white">Why Chosen:</strong>{' '}
              {report.successMetrics.primaryMetric.whyChosen}
            </p>
            {report.successMetrics.primaryMetric.measurementMethod && (
              <p className="text-xs text-blue-100/90 leading-relaxed pt-2 border-t border-white/10">
                <strong className="text-white">Measurement Method:</strong>{' '}
                {report.successMetrics.primaryMetric.measurementMethod}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Secondary Metrics */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Secondary Metrics (Supporting Indicators)
              </h4>
              <div className="space-y-2.5">
                {report.successMetrics.secondaryMetrics.map((sec, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200/80 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-bold text-gray-900">{sec.name}</span>
                      <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {sec.baselineStatus || 'Baseline: Not provided'}
                      </span>
                    </div>
                    <div className="text-gray-600 mb-1">{sec.definition}</div>
                    <div className="text-[11px] text-blue-700 font-medium">
                      Relevance: {sec.relevance}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guardrail Metrics */}
            <div className="border border-amber-200 rounded-xl p-4 bg-amber-50/30">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Guardrail Metrics (Do Not Harm)
              </h4>
              <div className="space-y-2.5">
                {report.successMetrics.guardrailMetrics.map((g, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-amber-200 text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-gray-900">{g.name}</span>
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        Threshold: {g.thresholdOrWarning}
                      </span>
                    </div>
                    <div className="text-gray-600 mb-1">{g.definition}</div>
                    <div className="text-[11px] text-gray-500">
                      <strong>Why Crucial:</strong> {g.whyCrucial}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          12. RISKS & ASSUMPTIONS
         ======================================================== */}
      <div
        ref={sectionRefs.risks}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              12. Risks, Assumptions & Dependencies
            </h2>
            <p className="text-xs text-gray-500">
              Proactive vulnerability assessment and unknown factors
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Risks & Mitigations */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Key Risks & Mitigations
            </h4>
            {report.risksAndAssumptions.risks.map((r, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-xl p-3.5 text-xs bg-white"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-gray-900">{r.risk}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.severity.toLowerCase() === 'high'
                        ? 'bg-rose-100 text-rose-700'
                        : r.severity.toLowerCase() === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {r.severity}
                  </span>
                </div>
                <div className="text-gray-600">
                  <span className="font-semibold text-emerald-700">Mitigation:</span>{' '}
                  {r.mitigation}
                </div>
              </div>
            ))}
          </div>

          {/* Critical Assumptions */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Critical Assumptions & Status
            </h4>
            {report.risksAndAssumptions.assumptions.map((a, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-xl p-3.5 text-xs bg-white flex flex-col justify-between"
              >
                <div className="font-medium text-gray-800 mb-2">
                  {a.assumption}
                </div>
                <div className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-1 rounded inline-block self-start">
                  Validation Status: {a.validationStatus}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-xs">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-800 block mb-2 uppercase text-[10px] tracking-wide">
              External Dependencies
            </span>
            <ul className="space-y-1 text-gray-600">
              {report.risksAndAssumptions.dependencies.map((d, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-800 block mb-2 uppercase text-[10px] tracking-wide">
              Current Unknowns
            </span>
            <ul className="space-y-1 text-gray-600">
              {report.risksAndAssumptions.unknowns.map((u, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-purple-500 font-bold">•</span>
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ========================================================
          13. RECOMMENDED ACTION PLAN
         ======================================================== */}
      <div
        ref={sectionRefs.actionplan}
        className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-xs scroll-mt-20"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              13. Recommended Action Plan
            </h2>
            <p className="text-xs text-gray-500">
              Sequential implementation roadmap and execution steps
            </p>
          </div>
        </div>

        {/* Action Steps */}
        <div className="space-y-3 mb-6">
          {report.recommendedActionPlan.steps.map((st) => (
            <div
              key={st.stepNumber}
              className="border border-gray-200 rounded-xl p-4 bg-white hover:border-emerald-300 transition-colors flex items-start gap-3.5"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {st.stepNumber}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-gray-900">
                    {st.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      Focus: {st.ownerOrFocus}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {st.timeframe}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {st.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
