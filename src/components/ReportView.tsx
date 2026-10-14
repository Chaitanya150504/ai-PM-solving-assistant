import React, { useState } from 'react';
import { AnalysisReport, ProblemInput } from '../types';
import { PrioritizationSection } from './PrioritizationSection';
import {
  Download,
  FileDown,
  Copy,
  Check,
  Plus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { generateMarkdownReport, downloadMarkdownFile } from '../utils/markdownExporter';
import { exportReportToPdf } from '../utils/pdfExporter';

interface ReportViewProps {
  input: ProblemInput;
  report: AnalysisReport;
  onNewInvestigation: () => void;
}

const SECTIONS_LIST = [
  { id: 'executive', num: '01', title: 'Executive Summary' },
  { id: 'definition', num: '02', title: 'Problem Definition' },
  { id: 'breakdown', num: '03', title: 'Problem Breakdown' },
  { id: 'rootcauses', num: '04', title: 'Root Cause Analysis' },
  { id: 'hypotheses', num: '05', title: 'Testable Hypotheses' },
  { id: 'investigation', num: '06', title: 'Investigation Questions' },
  { id: 'data', num: '07', title: 'Data & Signals Needed' },
  { id: 'solutions', num: '08', title: 'Potential Solutions' },
  { id: 'experiments', num: '09', title: 'Proposed Experiments' },
  { id: 'prioritization', num: '10', title: 'Experiment Prioritization' },
  { id: 'metrics', num: '11', title: 'Success Metrics' },
  { id: 'risks', num: '12', title: 'Risks & Assumptions' },
  { id: 'actionplan', num: '13', title: 'Recommended Action Plan' },
];

export const ReportView: React.FC<ReportViewProps> = ({
  input,
  report,
  onNewInvestigation,
}) => {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [viewAll, setViewAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const currentSection = SECTIONS_LIST[activeSectionIndex];

  const handleCopy = async () => {
    const md = generateMarkdownReport(input, report);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = md;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportMarkdown = () => {
    const slug = (input.productCompany || 'investigation')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const md = generateMarkdownReport(input, report);
    downloadMarkdownFile(md, `${slug}-problem-analysis.md`);
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

  const handleNextSection = () => {
    if (activeSectionIndex < SECTIONS_LIST.length - 1) {
      setActiveSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Section Content Renderers
  const renderSectionContent = (secId: string) => {
    switch (secId) {
      case 'executive':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
                  Problem Summary
                </span>
                <p className="text-stone-800 leading-relaxed">
                  {report.executiveSummary.problemSummary}
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-md border border-[#C85A32]/30 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C85A32] font-semibold block">
                  Recommended Direction
                </span>
                <p className="text-stone-900 leading-relaxed font-medium">
                  {report.executiveSummary.recommendedDirection}
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
                  Core Strategic Insight
                </span>
                <p className="text-stone-800 leading-relaxed">
                  {report.executiveSummary.coreInsight}
                </p>
              </div>
            </div>
          </div>
        );

      case 'definition':
        return (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 block">
                Reframed Problem Statement
              </span>
              <p className="text-sm font-semibold text-stone-900 bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 leading-relaxed">
                {report.problemDefinition.redefinedProblem}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 block">
                  Affected Stakeholder Cohorts
                </span>
                <ul className="space-y-1.5 text-stone-700">
                  {report.problemDefinition.affectedStakeholders.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#C85A32] font-bold">·</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 block">
                    Business Impact & Urgency
                  </span>
                  <p className="text-stone-700 leading-relaxed">
                    {report.problemDefinition.businessImpactAndUrgency}
                  </p>
                </div>
                <div className="space-y-1 pt-1 border-t border-stone-200/60">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500 block">
                    Why It Matters Now
                  </span>
                  <p className="text-stone-700 leading-relaxed">
                    {report.problemDefinition.whyItMatters}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'breakdown':
        return (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {report.problemBreakdown.dimensions.map((dim, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-stone-200 text-stone-800 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="font-semibold text-stone-900">{dim.dimensionName}</h4>
                  </div>
                  <p className="text-stone-600 leading-relaxed text-[11px]">
                    {dim.description}
                  </p>
                  <div className="pt-2 border-t border-stone-200/60">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">
                      Key Sub-Components
                    </span>
                    <ul className="space-y-1 text-stone-700">
                      {dim.subComponents.map((sub, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-stone-400">·</span>
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'rootcauses':
        return (
          <div className="space-y-4 text-xs">
            {/* Cautionary Note Banner */}
            {report.rootCauseAnalysis.cautionaryNote && (
              <div className="p-3 bg-[#FAF8F5] border border-amber-300/80 rounded-md text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-[11px]">
                  <strong>Factual Integrity Note:</strong> {report.rootCauseAnalysis.cautionaryNote}
                </span>
              </div>
            )}

            {/* Three-Way Partition */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
              {/* User-Provided Facts */}
              <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-stone-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="font-semibold text-stone-900 text-[11px] uppercase tracking-wider font-mono">
                    User-Provided Facts
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Confirmed facts directly stated in user input.
                </p>
                <ul className="space-y-2 pt-1 text-stone-800">
                  {report.rootCauseAnalysis.userProvidedFacts.map((fact, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed">
                      <span className="text-emerald-700 font-bold shrink-0">✓</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Possible Root Causes */}
              <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2 lg:col-span-2">
                <div className="flex items-center gap-2 pb-1.5 border-b border-stone-200/60">
                  <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
                  <span className="font-semibold text-stone-900 text-[11px] uppercase tracking-wider font-mono">
                    Possible Root Causes & Unconfirmed Mechanisms
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Candidate explanations requiring validation before intervention.
                </p>
                <div className="space-y-2.5 pt-1">
                  {report.rootCauseAnalysis.possibleRootCauses.map((cause, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded border border-stone-200/80 space-y-1"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-stone-900">
                          {cause.cause}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500">
                          <span>Category: <strong className="text-stone-700">{cause.category}</strong></span>
                          <span>·</span>
                          <span className="text-[#C85A32] font-semibold">{cause.statusLabel}</span>
                        </div>
                      </div>
                      <p className="text-stone-600 leading-relaxed text-[11px]">
                        <strong>Mechanism:</strong> {cause.mechanism}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hypotheses Requiring Validation */}
            <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2">
              <span className="font-semibold text-stone-900 text-[11px] uppercase tracking-wider font-mono block">
                Hypotheses Requiring Validation
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
                {report.rootCauseAnalysis.hypothesesRequiringValidation.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded border border-stone-200/70 text-[11px]">
                    <span className="text-[#C85A32] font-bold">·</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'hypotheses':
        return (
          <div className="space-y-3 text-xs">
            <div className="space-y-3">
              {report.hypotheses.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-stone-200 text-stone-800">
                        H{idx + 1}
                      </span>
                      <h4 className="font-semibold text-stone-900">
                        {item.hypothesis}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500">
                      <span>Confidence: <strong className="text-stone-800">{item.confidenceLevel}</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                    <div className="bg-white p-3 rounded border border-stone-200/70 space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">
                        Why It Could Be True
                      </span>
                      <p className="text-stone-700 leading-relaxed">
                        {item.whyItCouldBeTrue}
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded border border-stone-200/70 space-y-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400 block font-semibold">
                        Evidence Needed To Validate
                      </span>
                      <p className="text-stone-700 leading-relaxed">
                        {item.evidenceNeeded}
                      </p>
                    </div>
                  </div>

                  {item.confidenceRationale && (
                    <p className="text-[11px] text-stone-500 italic">
                      Rationale: {item.confidenceRationale}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'investigation':
        return (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.investigationQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-1.5"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C85A32] font-semibold block">
                    {q.category}
                  </span>
                  <h4 className="font-semibold text-stone-900 text-xs leading-relaxed">
                    "{q.question}"
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed pt-1 border-t border-stone-200/60">
                    <strong>Why ask:</strong> {q.whyAskThis}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-3 text-xs">
            <div className="border border-stone-200/90 rounded-md overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-stone-200 text-[10px] font-mono uppercase tracking-wider text-stone-500">
                    <th className="py-2.5 px-3.5 font-semibold">Source or Metric</th>
                    <th className="py-2.5 px-3 font-semibold">Category</th>
                    <th className="py-2.5 px-3.5 font-semibold">What to Look For</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-[11px]">
                  {report.dataAndSignalsNeeded.map((sig, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-2.5 px-3.5 font-semibold text-stone-900">
                        {sig.sourceOrMetric}
                      </td>
                      <td className="py-2.5 px-3 text-stone-500 font-mono text-[10px]">
                        {sig.category}
                      </td>
                      <td className="py-2.5 px-3.5 text-stone-700 leading-relaxed">
                        {sig.whatToLookFor}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-mono text-[10px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                          {sig.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'solutions':
        return (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {report.potentialSolutions.map((sol, idx) => (
                <div
                  key={sol.id || idx}
                  className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-stone-900 text-xs">
                        {sol.solutionName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500">
                        <span>Impact: <strong className="text-stone-800">{sol.expectedImpact}</strong></span>
                        <span>·</span>
                        <span>Effort: <strong className="text-stone-800">{sol.effort}</strong></span>
                      </div>
                    </div>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      {sol.description}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      <strong>Addresses:</strong> {sol.problemAddressed}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 text-[10px] text-stone-500 space-y-1">
                    <p>
                      <strong>Key Assumption:</strong> {sol.keyAssumption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'experiments':
        return (
          <div className="space-y-3 text-xs">
            <div className="space-y-3">
              {report.experiments.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-stone-200 text-stone-800 font-mono text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-semibold text-stone-900 text-xs">
                        {exp.experimentName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500">
                      <span>Impact: <strong className="text-stone-800">{exp.impactLevel}</strong></span>
                      <span>·</span>
                      <span>Effort: <strong className="text-stone-800">{exp.effortLevel}</strong></span>
                      <span>·</span>
                      <span>Duration: <strong className="text-stone-800">{exp.duration}</strong></span>
                    </div>
                  </div>

                  <p className="text-stone-700 leading-relaxed text-[11px]">
                    <strong>Hypothesis Tested:</strong> {exp.hypothesisTested}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded border border-stone-200/70">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">
                        Design & Target Users
                      </span>
                      <p className="text-stone-700 mt-0.5">
                        {exp.experimentDesign} (Target: {exp.targetUsers})
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">
                        Primary Metric & Decision Rule
                      </span>
                      <p className="text-stone-700 mt-0.5">
                        {exp.primaryMetric} — {exp.decisionRule}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'prioritization':
        return (
          <PrioritizationSection
            prioritization={report.experimentPrioritization}
            experiments={report.experiments}
          />
        );

      case 'metrics':
        return (
          <div className="space-y-4 text-xs">
            {/* Primary Metric Banner */}
            <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C85A32] font-semibold block">
                Primary North Star Metric
              </span>
              <h4 className="text-sm font-semibold text-stone-900">
                {report.successMetrics.primaryMetric.name}
              </h4>
              <p className="text-stone-700 leading-relaxed text-[11px]">
                {report.successMetrics.primaryMetric.definition}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/60 font-mono text-[11px]">
                <div>
                  <span className="text-stone-400 text-[10px] uppercase block">
                    Baseline Telemetry
                  </span>
                  <span className="text-stone-800 font-semibold">
                    {report.successMetrics.primaryMetric.baseline}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase block">
                    Suggested Target
                  </span>
                  <span className="text-stone-800 font-semibold">
                    {report.successMetrics.primaryMetric.targetSuggestion}
                  </span>
                </div>
              </div>
            </div>

            {/* Secondary & Guardrail Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
                  Secondary Observability Metrics
                </span>
                <ul className="space-y-2">
                  {report.successMetrics.secondaryMetrics.map((sec, idx) => (
                    <li key={idx} className="bg-white p-2.5 rounded border border-stone-200/70 space-y-0.5">
                      <span className="font-semibold text-stone-900 block">{sec.name}</span>
                      <p className="text-stone-500 text-[11px]">{sec.definition}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
                  Guardrail Health Metrics
                </span>
                <ul className="space-y-2">
                  {report.successMetrics.guardrailMetrics.map((g, idx) => (
                    <li key={idx} className="bg-white p-2.5 rounded border border-stone-200/70 space-y-0.5">
                      <span className="font-semibold text-stone-900 block">{g.name}</span>
                      <p className="text-rose-700 text-[11px] font-mono">{g.thresholdOrWarning}</p>
                      <p className="text-stone-500 text-[11px]">{g.whyCrucial}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'risks':
        return (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
                Key Strategic Risks & Mitigations
              </span>
              <div className="space-y-2">
                {report.risksAndAssumptions.risks.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAF8F5] rounded-md border border-stone-200/90 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-stone-900">{r.risk}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                        {r.severity} Severity
                      </span>
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      <strong>Mitigation:</strong> {r.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
                  Assumptions Requiring Validation
                </span>
                <ul className="space-y-1.5 text-stone-700 text-[11px]">
                  {report.risksAndAssumptions.assumptions.map((a, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#C85A32] font-bold">·</span>
                      <span>
                        {a.assumption}{' '}
                        <span className="text-stone-400 font-mono text-[10px]">
                          ({a.validationStatus})
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-md border border-stone-200/90 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
                  Dependencies & Known Unknowns
                </span>
                <ul className="space-y-1.5 text-stone-700 text-[11px]">
                  {report.risksAndAssumptions.dependencies.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-stone-400 font-bold">·</span>
                      <span>{d}</span>
                    </li>
                  ))}
                  {report.risksAndAssumptions.unknowns.map((u, idx) => (
                    <li key={`u-${idx}`} className="flex items-start gap-1.5">
                      <span className="text-stone-400 font-bold">·</span>
                      <span>Unknown: {u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'actionplan':
        return (
          <div className="space-y-3 text-xs">
            <div className="space-y-2.5">
              {report.recommendedActionPlan.steps.map((st) => (
                <div
                  key={st.stepNumber}
                  className="p-4 bg-[#FAF8F5] rounded-md border border-stone-200/90 space-y-1.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-stone-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {st.stepNumber}
                      </span>
                      <h4 className="font-semibold text-stone-900">
                        {st.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500">
                      <span>Owner: <strong className="text-stone-800">{st.ownerOrFocus}</strong></span>
                      <span>·</span>
                      <span>Timeframe: <strong className="text-stone-800">{st.timeframe}</strong></span>
                    </div>
                  </div>

                  <p className="text-stone-700 leading-relaxed text-[11px] pl-7">
                    {st.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1300px] mx-auto space-y-6">
      {/* Top Dossier Header Card & Action Bar */}
      <div className="bg-white border border-stone-200 rounded-md p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-stone-400">
              <span>Investigation Dossier</span>
              <span>·</span>
              <span className="text-[#C85A32] font-semibold">13 Sections</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-stone-900 tracking-tight">
              {input.problemStatement}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 pt-1">
              {input.productCompany && (
                <span>Product: <strong className="text-stone-800">{input.productCompany}</strong></span>
              )}
              {input.targetUsers && (
                <>
                  <span className="text-stone-300">·</span>
                  <span>Cohort: <strong className="text-stone-800">{input.targetUsers}</strong></span>
                </>
              )}
              {input.goal && (
                <>
                  <span className="text-stone-300">·</span>
                  <span>Goal: <strong className="text-stone-800">{input.goal}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                pdfSuccess
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{isGeneratingPdf ? 'Generating...' : pdfSuccess ? 'PDF Ready' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-md hover:bg-stone-50 hover:border-stone-300 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-stone-400" />
              <span>Export .MD</span>
            </button>

            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                copied
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={onNewInvestigation}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#C85A32] hover:bg-[#B34E29] rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {pdfError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{pdfError}</span>
        </div>
      )}

      {/* Main Results Workspace: Clean Vertical Numbered Index Rail + Section Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Clean Vertical Numbered Index (Within Report View Only) */}
        <aside className="w-full lg:w-64 bg-white border border-stone-200 rounded-md p-2.5 shrink-0 shadow-2xs">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-stone-100 mb-1.5">
            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">
              13 Report Sections
            </span>
            <button
              onClick={() => setViewAll(!viewAll)}
              className="text-[11px] font-medium text-[#C85A32] hover:underline cursor-pointer"
            >
              {viewAll ? 'Single View' : 'View All'}
            </button>
          </div>

          <nav className="space-y-0.5 max-h-[75vh] overflow-y-auto scrollbar-thin">
            {SECTIONS_LIST.map((sec, idx) => {
              const isSelected = !viewAll && activeSectionIndex === idx;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setViewAll(false);
                    setActiveSectionIndex(idx);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white font-medium shadow-2xs'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <span className="truncate">
                    <span className={`font-mono text-[10px] mr-2 ${isSelected ? 'text-[#E5855E]' : 'text-stone-400'}`}>
                      {sec.num}
                    </span>
                    {sec.title}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Section Content Area */}
        <div className="flex-1 w-full min-w-0">
          {viewAll ? (
            /* View All Sections */
            <div className="space-y-6">
              {SECTIONS_LIST.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-white border border-stone-200 rounded-md p-6 shadow-2xs space-y-3"
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                    <span className="font-mono text-xs font-bold text-[#C85A32]">{sec.num}</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      {sec.title}
                    </h3>
                  </div>
                  {renderSectionContent(sec.id)}
                </div>
              ))}
            </div>
          ) : (
            /* Single Section Focus View */
            <div className="bg-white border border-stone-200 rounded-md p-6 sm:p-7 shadow-2xs flex flex-col justify-between min-h-[500px]">
              <div>
                {/* Section Header */}
                <div className="flex items-center justify-between pb-3 mb-5 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-stone-100 text-stone-800 font-mono font-bold text-xs flex items-center justify-center">
                      {currentSection.num}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-stone-400 block">
                        Section {activeSectionIndex + 1} of {SECTIONS_LIST.length}
                      </span>
                      <h3 className="text-sm font-semibold tracking-tight text-stone-900">
                        {currentSection.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-stone-400">
                    {Math.round(((activeSectionIndex + 1) / SECTIONS_LIST.length) * 100)}% complete
                  </span>
                </div>

                {/* Section Content */}
                <div className="py-1">
                  {renderSectionContent(currentSection.id)}
                </div>
              </div>

              {/* Prev / Next Controls */}
              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between gap-3 text-xs">
                <button
                  onClick={handlePrevSection}
                  disabled={activeSectionIndex === 0}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-medium transition-colors cursor-pointer ${
                    activeSectionIndex === 0
                      ? 'text-stone-300 border-stone-100 cursor-not-allowed'
                      : 'text-stone-700 border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous: {activeSectionIndex > 0 ? SECTIONS_LIST[activeSectionIndex - 1].title : 'Start'}</span>
                </button>

                <span className="font-mono text-[11px] text-stone-400">
                  {activeSectionIndex + 1} / {SECTIONS_LIST.length}
                </span>

                <button
                  onClick={handleNextSection}
                  disabled={activeSectionIndex === SECTIONS_LIST.length - 1}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shadow-2xs ${
                    activeSectionIndex === SECTIONS_LIST.length - 1
                      ? 'text-stone-300 bg-stone-100 border border-stone-200 cursor-not-allowed'
                      : 'text-white bg-[#C85A32] hover:bg-[#B34E29]'
                  }`}
                >
                  <span>Next: {activeSectionIndex < SECTIONS_LIST.length - 1 ? SECTIONS_LIST[activeSectionIndex + 1].title : 'End'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
