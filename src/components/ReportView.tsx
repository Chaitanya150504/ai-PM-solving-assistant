import React, { useState } from 'react';
import { AnalysisReport, ProblemInput } from '../types';
import { PrioritizationSection } from './PrioritizationSection';
import {
  Download,
  FileDown,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface ReportViewProps {
  input: ProblemInput;
  report: AnalysisReport;
  onNewInvestigation: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  input,
  report,
  onNewInvestigation,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('all');

  const handleCopyMarkdown = () => {
    const md = generateMarkdown(input, report);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown(input, report);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `problem-analysis-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const sectionsList = [
    { id: 'sec-definition', num: '01', title: 'Problem Definition' },
    { id: 'sec-breakdown', num: '02', title: 'Problem Breakdown' },
    { id: 'sec-rootcauses', num: '03', title: 'Root Causes' },
    { id: 'sec-hypotheses', num: '04', title: 'Hypotheses' },
    { id: 'sec-questions', num: '05', title: 'Investigation Questions' },
    { id: 'sec-datasignals', num: '06', title: 'Data / Signals Needed' },
    { id: 'sec-solutions', num: '07', title: 'Potential Solutions' },
    { id: 'sec-experiments', num: '08', title: 'Proposed Experiments' },
    { id: 'sec-prioritization', num: '09', title: 'Experiment Prioritization' },
    { id: 'sec-metrics', num: '10', title: 'Success Metrics' },
    { id: 'sec-risks', num: '11', title: 'Risks & Assumptions' },
    { id: 'sec-actionplan', num: '12', title: 'Recommended Action Plan' },
    { id: 'sec-summary', num: '13', title: 'Executive Summary' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sticky top-16 z-20">
        <button
          onClick={onNewInvestigation}
          className="w-full sm:w-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
          <span>New Analysis</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
            <span>{copied ? 'Copied!' : 'Copy Report'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-gray-500" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Horizontal Numbered Section Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-2.5 overflow-x-auto shadow-xs">
        <div className="flex items-center gap-1 min-w-max text-xs">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeSection === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All 13 Sections
          </button>
          {sectionsList.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                const el = document.getElementById(sec.id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="font-mono text-[10px] text-gray-400">{sec.num}</span>
              <span>{sec.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Executive Problem Brief */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Executive Problem Brief
          </span>
          {input.productCompany && (
            <span className="text-xs text-gray-500 font-medium">
              Product: {input.productCompany}
            </span>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
          {report.problemDefinition.redefinedProblem || input.problemStatement}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 mb-4">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Core Urgency &amp; Impact
            </span>
            <p className="text-xs text-gray-800 leading-relaxed">
              {report.problemDefinition.businessImpactAndUrgency || 'Critical impediment to core metrics.'}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Primary Affected Cohort
            </span>
            <p className="text-xs text-gray-800 leading-relaxed">
              {report.problemDefinition.affectedStakeholders?.join(', ') || input.targetUsers || 'Primary active user segments.'}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Desired Outcome
            </span>
            <p className="text-xs text-gray-800 leading-relaxed">
              {input.goal || report.problemDefinition.whyItMatters || 'Systematic metric recovery.'}
            </p>
          </div>
        </div>

        {report.executiveSummary && (
          <div className="text-sm text-gray-700 leading-relaxed space-y-2">
            <p><strong>Summary:</strong> {report.executiveSummary.problemSummary}</p>
            <p><strong>Core Insight:</strong> {report.executiveSummary.coreInsight}</p>
            <p><strong>Recommended Direction:</strong> {report.executiveSummary.recommendedDirection}</p>
          </div>
        )}
      </div>

      {/* 01. Problem Definition */}
      <div id="sec-definition" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            01
          </span>
          <h3 className="text-lg font-bold text-gray-900">Problem Definition</h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Reframed Problem Statement
            </h4>
            <p className="text-sm text-gray-900 font-medium leading-relaxed">
              {report.problemDefinition.redefinedProblem}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Target User &amp; Affected Stakeholders
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                {report.problemDefinition.affectedStakeholders?.join(', ')}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Why It Matters
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                {report.problemDefinition.whyItMatters}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Direct Business &amp; Product Impact
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              {report.problemDefinition.businessImpactAndUrgency}
            </p>
          </div>
        </div>
      </div>

      {/* 02. Problem Breakdown */}
      <div id="sec-breakdown" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            02
          </span>
          <h3 className="text-lg font-bold text-gray-900">Problem Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.problemBreakdown.dimensions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition">
              <h4 className="text-sm font-bold text-gray-900 mb-2">{item.dimensionName}</h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                {item.description}
              </p>
              {item.subComponents && item.subComponents.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-700 block mb-1">Sub-components:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.subComponents.map((sub, sIdx) => (
                      <span key={sIdx} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 03. Root Causes */}
      <div id="sec-rootcauses" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            03
          </span>
          <h3 className="text-lg font-bold text-gray-900">Root Causes</h3>
        </div>

        <div className="space-y-4">
          {report.rootCauseAnalysis.userProvidedFacts && report.rootCauseAnalysis.userProvidedFacts.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Confirmed Facts From Input
              </h4>
              <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                {report.rootCauseAnalysis.userProvidedFacts.map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.rootCauseAnalysis.possibleRootCauses.map((rc, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{rc.cause}</h4>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {rc.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3 pl-7">
                  {rc.mechanism}
                </p>
                {rc.isAssumption && (
                  <div className="pl-7">
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Hypothesis / Requires Validation
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {report.rootCauseAnalysis.cautionaryNote && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
              <strong>Cautionary Note:</strong> {report.rootCauseAnalysis.cautionaryNote}
            </div>
          )}
        </div>
      </div>

      {/* 04. Hypotheses */}
      <div id="sec-hypotheses" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            04
          </span>
          <h3 className="text-lg font-bold text-gray-900">Formulated Hypotheses</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.hypotheses.map((hyp, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {hyp.id || `HYP-0${idx + 1}`}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Confidence: {hyp.confidenceLevel}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 leading-snug">
                  {hyp.hypothesis}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  <strong className="text-gray-700">Why It Could Be True:</strong> {hyp.whyItCouldBeTrue}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                <strong className="text-gray-700">Evidence Needed:</strong> {hyp.evidenceNeeded}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 05. Investigation Questions */}
      <div id="sec-questions" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            05
          </span>
          <h3 className="text-lg font-bold text-gray-900">Investigation Questions</h3>
        </div>

        <div className="space-y-3">
          {report.investigationQuestions.map((q, idx) => (
            <div key={idx} className="p-3.5 rounded-lg border border-gray-200 hover:border-blue-300 transition">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-gray-900">
                  Q{idx + 1}. {q.question}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 shrink-0">
                  {q.category}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-700">Why Ask This:</strong> {q.whyAskThis}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 06. Data / Signals Needed */}
      <div id="sec-datasignals" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            06
          </span>
          <h3 className="text-lg font-bold text-gray-900">Data / Signals Needed</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Source / Metric</th>
                <th className="py-2.5 px-3 font-semibold">What To Look For</th>
                <th className="py-2.5 px-3 font-semibold">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.dataAndSignalsNeeded.map((sig, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="py-2.5 px-3 font-semibold text-gray-900">
                    {sig.category}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {sig.sourceOrMetric}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {sig.whatToLookFor}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {sig.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 07. Potential Solutions */}
      <div id="sec-solutions" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            07
          </span>
          <h3 className="text-lg font-bold text-gray-900">Potential Solutions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.potentialSolutions.map((sol, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-900">{sol.solutionName}</h4>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  Effort: {sol.effort}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                {sol.description}
              </p>
              <div className="p-2.5 bg-gray-50 rounded border border-gray-100 text-[11px] space-y-1">
                <div>
                  <strong className="text-gray-700">Expected Impact:</strong>{' '}
                  <span className="text-gray-600">{sol.expectedImpact}</span>
                </div>
                <div>
                  <strong className="text-gray-700">Key Assumption:</strong>{' '}
                  <span className="text-gray-600">{sol.keyAssumption}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 08. Proposed Experiments */}
      <div id="sec-experiments" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            08
          </span>
          <h3 className="text-lg font-bold text-gray-900">Proposed Experiments</h3>
        </div>

        <div className="space-y-4">
          {report.experiments.map((exp, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {exp.id || `EXP-0${idx + 1}`}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900">{exp.experimentName}</h4>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  Target: {exp.targetUsers}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                {exp.experimentDesign}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <strong className="text-gray-700 block mb-0.5">Hypothesis Tested:</strong>
                  <span className="text-gray-600">{exp.hypothesisTested}</span>
                </div>
                <div>
                  <strong className="text-gray-700 block mb-0.5">Primary Metric:</strong>
                  <span className="text-blue-700 font-medium">{exp.primaryMetric}</span>
                </div>
                <div>
                  <strong className="text-gray-700 block mb-0.5">Duration:</strong>
                  <span className="text-gray-600">{exp.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 09. Experiment Prioritization */}
      <div id="sec-prioritization" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            09
          </span>
          <h3 className="text-lg font-bold text-gray-900">Experiment Prioritization</h3>
        </div>

        <PrioritizationSection
          prioritization={report.experimentPrioritization}
          experiments={report.experiments}
        />
      </div>

      {/* 10. Success Metrics */}
      <div id="sec-metrics" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            10
          </span>
          <h3 className="text-lg font-bold text-gray-900">Success Metrics</h3>
        </div>

        <div className="space-y-4">
          {report.successMetrics.primaryMetric && (
            <div className="p-4 rounded-lg bg-blue-50/40 border border-blue-200">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white inline-block mb-2">
                Primary North Star Metric
              </span>
              <h4 className="text-sm font-bold text-gray-900 mb-1">
                {report.successMetrics.primaryMetric.name}
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                {report.successMetrics.primaryMetric.definition}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-blue-100">
                <div>
                  <strong className="text-gray-700">Target:</strong> {report.successMetrics.primaryMetric.targetSuggestion}
                </div>
                <div>
                  <strong className="text-gray-700">Why Chosen:</strong> {report.successMetrics.primaryMetric.whyChosen}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.successMetrics.secondaryMetrics?.map((met, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700 inline-block mb-1.5">
                  Secondary Metric
                </span>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{met.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{met.definition}</p>
                <div className="text-[11px] text-gray-500 pt-1.5 border-t border-gray-100">
                  <strong className="text-gray-700">Relevance:</strong> {met.relevance}
                </div>
              </div>
            ))}
          </div>

          {report.successMetrics.guardrailMetrics && report.successMetrics.guardrailMetrics.length > 0 && (
            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/30">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                Guardrail Metrics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.successMetrics.guardrailMetrics.map((g, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border border-amber-200 text-xs">
                    <strong className="text-gray-900 block mb-0.5">{g.name}</strong>
                    <p className="text-gray-600 mb-1">{g.definition}</p>
                    <div className="text-[11px] text-amber-800">
                      <strong>Threshold / Warning:</strong> {g.thresholdOrWarning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 11. Risks & Assumptions */}
      <div id="sec-risks" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            11
          </span>
          <h3 className="text-lg font-bold text-gray-900">Risks &amp; Assumptions</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.risksAndAssumptions.risks?.map((r, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-rose-200 bg-rose-50/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    Risk · Severity: {r.severity}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{r.risk}</h4>
                <div className="text-xs text-gray-600 pt-1.5 border-t border-rose-100">
                  <strong className="text-gray-700">Mitigation:</strong> {r.mitigation}
                </div>
              </div>
            ))}
          </div>

          {report.risksAndAssumptions.assumptions && report.risksAndAssumptions.assumptions.length > 0 && (
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Key Assumptions
              </h4>
              <div className="space-y-2">
                {report.risksAndAssumptions.assumptions.map((a, idx) => (
                  <div key={idx} className="text-xs text-gray-700 flex items-start justify-between gap-2">
                    <span>• {a.assumption}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">
                      {a.validationStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 12. Recommended Action Plan */}
      <div id="sec-actionplan" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            12
          </span>
          <h3 className="text-lg font-bold text-gray-900">Recommended Action Plan</h3>
        </div>

        <div className="space-y-3">
          {report.recommendedActionPlan.steps?.map((step, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {step.stepNumber || idx + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <h4 className="text-sm font-bold text-gray-900">{step.title || step.action}</h4>
                  <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {step.timeframe}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                  {step.action}
                </p>
                <div className="text-[11px] text-gray-500">
                  <strong className="text-gray-700">Owner/Focus:</strong> {step.ownerOrFocus}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 13. Executive Summary / Conclusion */}
      <div id="sec-summary" className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center">
            13
          </span>
          <h3 className="text-lg font-bold text-gray-900">Executive Summary &amp; Synthesis</h3>
        </div>

        <div className="p-5 rounded-lg bg-blue-50/50 border border-blue-100 text-gray-800 text-sm leading-relaxed space-y-3">
          <p><strong>Core Insight:</strong> {report.executiveSummary.coreInsight}</p>
          <p><strong>Recommended Strategic Direction:</strong> {report.executiveSummary.recommendedDirection}</p>
          <div className="pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs text-blue-800">
            <span>Generated via AI Problem-Solving Assistant</span>
            <span className="font-semibold">All 13 Diagnostic Sections Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateMarkdown(input: ProblemInput, report: AnalysisReport): string {
  return `# AI Problem-Solving Assistant: Diagnostic Report
Generated: ${new Date().toLocaleDateString()}
Product/Company: ${input.productCompany || 'N/A'}
Target Users: ${input.targetUsers || 'N/A'}
Goal: ${input.goal || 'N/A'}

## Executive Summary
${report.executiveSummary.problemSummary}
- **Core Insight:** ${report.executiveSummary.coreInsight}
- **Recommended Direction:** ${report.executiveSummary.recommendedDirection}

---

## 01. Problem Definition
- **Formal Statement:** ${report.problemDefinition.redefinedProblem}
- **Affected Users:** ${report.problemDefinition.affectedStakeholders?.join(', ')}
- **Core Urgency:** ${report.problemDefinition.businessImpactAndUrgency}
- **Why It Matters:** ${report.problemDefinition.whyItMatters}

## 02. Problem Breakdown
${report.problemBreakdown.dimensions
  .map(
    (b) =>
      `### ${b.dimensionName}\n${b.description}\n- Subcomponents: ${b.subComponents?.join(', ')}`
  )
  .join('\n\n')}

## 03. Root Causes
${report.rootCauseAnalysis.possibleRootCauses
  .map(
    (rc, i) =>
      `### ${i + 1}. ${rc.cause} [${rc.category}]\n- Mechanism: ${rc.mechanism}\n- Is Assumption: ${rc.isAssumption}`
  )
  .join('\n\n')}

## 04. Formulated Hypotheses
${report.hypotheses
  .map(
    (h, i) =>
      `### ${h.id || `HYP-${i + 1}`}: ${h.hypothesis}\n- Confidence: ${h.confidenceLevel}\n- Why It Could Be True: ${h.whyItCouldBeTrue}\n- Evidence Needed: ${h.evidenceNeeded}`
  )
  .join('\n\n')}

## 05. Investigation Questions
${report.investigationQuestions
  .map(
    (q, i) =>
      `${i + 1}. **${q.question}** [${q.category}]\n   - Why Ask This: ${q.whyAskThis}`
  )
  .join('\n\n')}

## 06. Data / Signals Needed
${report.dataAndSignalsNeeded
  .map(
    (s) =>
      `- **${s.sourceOrMetric}** [${s.category}]: ${s.whatToLookFor} (Priority: ${s.priority})`
  )
  .join('\n')}

## 07. Potential Solutions
${report.potentialSolutions
  .map(
    (s) =>
      `### ${s.solutionName} (Effort: ${s.effort})\n${s.description}\n- Expected Impact: ${s.expectedImpact}\n- Key Assumption: ${s.keyAssumption}`
  )
  .join('\n\n')}

## 08. Proposed Experiments
${report.experiments
  .map(
    (e) =>
      `### ${e.id}: ${e.experimentName}\n${e.experimentDesign}\n- Target Users: ${e.targetUsers}\n- Primary Metric: ${e.primaryMetric}\n- Duration: ${e.duration}`
  )
  .join('\n\n')}

## 09. Experiment Prioritization
- **Quick Wins:** ${report.experimentPrioritization.quickWins?.map((x) => `[${x.experimentName}] (${x.reason || ''})`).join('; ') || 'None'}
- **Strategic Bets:** ${report.experimentPrioritization.strategicBets?.map((x) => `[${x.experimentName}] (${x.reason || ''})`).join('; ') || 'None'}
- **Fill-ins:** ${report.experimentPrioritization.fillIns?.map((x) => `[${x.experimentName}] (${x.reason || ''})`).join('; ') || 'None'}
- **Reconsider:** ${report.experimentPrioritization.deprioritize?.map((x) => `[${x.experimentName}] (${x.reason || ''})`).join('; ') || 'None'}

## 10. Success Metrics
- **Primary Metric:** ${report.successMetrics.primaryMetric.name} - Target: ${report.successMetrics.primaryMetric.targetSuggestion}
${report.successMetrics.secondaryMetrics?.map((m) => `- Secondary: ${m.name} (${m.relevance})`).join('\n')}

## 11. Risks & Assumptions
${report.risksAndAssumptions.risks?.map((r) => `- [Risk - ${r.severity}] ${r.risk} (Mitigation: ${r.mitigation})`).join('\n')}
${report.risksAndAssumptions.assumptions?.map((a) => `- [Assumption] ${a.assumption} (${a.validationStatus})`).join('\n')}

## 12. Recommended Action Plan
${report.recommendedActionPlan.steps?.map((a) => `${a.stepNumber}. **${a.title || a.action}** [${a.timeframe}] - Owner: ${a.ownerOrFocus}\n   ${a.action}`).join('\n\n')}

## 13. Synthesis
${report.executiveSummary.coreInsight}
`;
}
