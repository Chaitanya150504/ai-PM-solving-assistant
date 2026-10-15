import { AnalysisReport, ProblemInput } from '../types';

export function generateMarkdownReport(input: ProblemInput, report: AnalysisReport): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return `# Product Diagnosis Studio — Investigation & Decision Report
*Investigate. Validate. Improve.*
Generated: ${dateStr}

---

## Context
- **Problem Statement:** ${input.problemStatement}
- **Product / Company:** ${input.productCompany || 'Not specified'}
- **Target Users:** ${input.targetUsers || 'Not specified'}
- **Goal:** ${input.goal || 'Not specified'}
${input.additionalContext ? `- **Additional Context:** ${input.additionalContext}\n` : ''}

---

## 1. Executive Summary
**Summary:** ${report.executiveSummary.problemSummary}

**Recommended Direction:** ${report.executiveSummary.recommendedDirection}

**Core Strategic Insight:** ${report.executiveSummary.coreInsight}

---

## 2. Problem Definition
### Redefined Problem
${report.problemDefinition.redefinedProblem}

### Affected Stakeholders
${report.problemDefinition.affectedStakeholders.map((s) => `- ${s}`).join('\n')}

### Business Impact & Urgency
${report.problemDefinition.businessImpactAndUrgency}

### Why It Matters
${report.problemDefinition.whyItMatters}

---

## 3. Problem Breakdown
${report.problemBreakdown.dimensions
  .map(
    (d, i) => `### Dimension ${i + 1}: ${d.dimensionName}
*${d.description}*
Sub-components:
${d.subComponents.map((sub) => `- ${sub}`).join('\n')}`
  )
  .join('\n\n')}

---

## 4. Root Cause Analysis
### 1. User-Provided Facts (Ground Truth)
${
  report.rootCauseAnalysis.userProvidedFacts && report.rootCauseAnalysis.userProvidedFacts.length > 0
    ? report.rootCauseAnalysis.userProvidedFacts.map((f) => `- ${f}`).join('\n')
    : `- Problem Statement: "${input.problemStatement}"`
}

### 2. Possible Root Causes (Unconfirmed Mechanisms)
${
  (report.rootCauseAnalysis.possibleRootCauses || report.rootCauseAnalysis.probableRootCauses || [])
    .map(
      (rc) =>
        `- **[${rc.category}] ${rc.cause}** (${rc.statusLabel || 'Assumption - Pending Validation'})\n  *Possible Mechanism:* ${rc.mechanism}`
    )
    .join('\n\n')
}

### 3. Hypotheses Requiring Validation
${
  report.rootCauseAnalysis.hypothesesRequiringValidation &&
  report.rootCauseAnalysis.hypothesesRequiringValidation.length > 0
    ? report.rootCauseAnalysis.hypothesesRequiringValidation.map((h, i) => `- **H${i + 1}:** ${h}`).join('\n')
    : (report.hypotheses || []).map((h, i) => `- **H${i + 1}:** ${h.hypothesis}`).join('\n')
}

> **PM Cautionary Note:** ${report.rootCauseAnalysis.cautionaryNote}

---

## 5. Hypotheses
${report.hypotheses
  .map(
    (h, idx) => `### H${idx + 1}: ${h.hypothesis}
- **Confidence Level:** ${h.confidenceLevel} (${h.confidenceRationale})
- **Why It Could Be True:** ${h.whyItCouldBeTrue}
- **Evidence Needed to Validate:** ${h.evidenceNeeded}`
  )
  .join('\n\n')}

---

## 6. Investigation Questions
${report.investigationQuestions
  .map(
    (q) => `- **[${q.category}]** ${q.question}
  *Rationale:* ${q.whyAskThis}`
  )
  .join('\n\n')}

---

## 7. Data & Signals Needed
${report.dataAndSignalsNeeded
  .map(
    (sig) => `- **[${sig.priority}] ${sig.sourceOrMetric}** (${sig.category})
  *What to look for:* ${sig.whatToLookFor}`
  )
  .join('\n')}

---

## 8. Potential Solutions
${report.potentialSolutions
  .map(
    (sol) => `### ${sol.solutionName}
- **Description:** ${sol.description}
- **Problem Addressed:** ${sol.problemAddressed}
- **Expected Impact:** ${sol.expectedImpact} (${sol.impactRationale})
- **Effort:** ${sol.effort} (${sol.effortRationale})
- **Key Assumption:** ${sol.keyAssumption}`
  )
  .join('\n\n')}

---

## 9. Proposed Experiments
${report.experiments
  .map(
    (exp) => `### Experiment: ${exp.experimentName} [${exp.quadrant}]
- **Hypothesis Tested:** ${exp.hypothesisTested}
- **Target Users:** ${exp.targetUsers}
- **Design:** ${exp.experimentDesign}
- **Duration:** ${exp.duration}
- **Primary Metric:** ${exp.primaryMetric}
- **Expected Result:** ${exp.expectedResult}
- **Decision Rule:** ${exp.decisionRule}`
  )
  .join('\n\n')}

---

## 10. Experiment Prioritization

### 1. Quick Wins (High Impact, Low Effort)
${
  report.experimentPrioritization.quickWins && report.experimentPrioritization.quickWins.length > 0
    ? report.experimentPrioritization.quickWins
        .map(
          (q) => `#### ${q.experimentName}
- **Impact:** ${q.impact}
- **Effort:** ${q.effort}
- **Priority:** ${q.priority}
- **Reason:** ${q.reason}
${q.categoryExplanation ? `- **Why Valuable:** ${q.categoryExplanation}` : ''}`
        )
        .join('\n\n')
    : report.experimentPrioritization.highImpactLowEffort && report.experimentPrioritization.highImpactLowEffort.length > 0
    ? report.experimentPrioritization.highImpactLowEffort.map((name) => `- ${name}`).join('\n')
    : '_None currently categorized under Quick Wins._'
}

### 2. Strategic Bets (High Impact, High Effort)
${
  report.experimentPrioritization.strategicBets && report.experimentPrioritization.strategicBets.length > 0
    ? report.experimentPrioritization.strategicBets
        .map(
          (s) => `#### ${s.experimentName}
- **Impact:** ${s.impact}
- **Effort:** ${s.effort}
- **Priority:** ${s.priority}
- **Reason:** ${s.reason}
${s.categoryExplanation ? `- **Why Worth Pursuing:** ${s.categoryExplanation}` : ''}`
        )
        .join('\n\n')
    : report.experimentPrioritization.highImpactHighEffort && report.experimentPrioritization.highImpactHighEffort.length > 0
    ? report.experimentPrioritization.highImpactHighEffort.map((name) => `- ${name}`).join('\n')
    : '_None currently categorized under Strategic Bets._'
}

### 3. Fill-ins (Low Impact, Low Effort)
${
  report.experimentPrioritization.fillIns && report.experimentPrioritization.fillIns.length > 0
    ? report.experimentPrioritization.fillIns
        .map(
          (f) => `#### ${f.experimentName}
- **Impact:** ${f.impact}
- **Effort:** ${f.effort}
- **Priority:** ${f.priority}
- **Reason:** ${f.reason}
${f.categoryExplanation ? `- **Why Considered Later:** ${f.categoryExplanation}` : ''}`
        )
        .join('\n\n')
    : report.experimentPrioritization.lowImpactLowEffort && report.experimentPrioritization.lowImpactLowEffort.length > 0
    ? report.experimentPrioritization.lowImpactLowEffort.map((name) => `- ${name}`).join('\n')
    : '_None currently categorized under Fill-ins._'
}

### 4. Deprioritize (Low Impact, High Effort)
${
  report.experimentPrioritization.deprioritize && report.experimentPrioritization.deprioritize.length > 0
    ? report.experimentPrioritization.deprioritize
        .map(
          (d) => `#### ${d.experimentName}
- **Impact:** ${d.impact}
- **Effort:** ${d.effort}
- **Priority:** ${d.priority}
- **Reason:** ${d.reason}
${d.categoryExplanation ? `- **Why Not Prioritized Now:** ${d.categoryExplanation}` : ''}`
        )
        .join('\n\n')
    : report.experimentPrioritization.lowImpactHighEffort && report.experimentPrioritization.lowImpactHighEffort.length > 0
    ? report.experimentPrioritization.lowImpactHighEffort.map((name) => `- ${name}`).join('\n')
    : '_None currently categorized under Deprioritize._'
}

### 5. Moderate Priority (Medium Impact or Medium Effort)
${
  report.experimentPrioritization.moderatePriority && report.experimentPrioritization.moderatePriority.length > 0
    ? report.experimentPrioritization.moderatePriority
        .map(
          (m) => `#### ${m.experimentName}
- **Impact:** ${m.impact}
- **Effort:** ${m.effort}
- **Priority:** ${m.priority}
- **Reason:** ${m.reason}
${m.categoryExplanation ? `- **Why Moderate Priority:** ${m.categoryExplanation}` : ''}`
        )
        .join('\n\n')
    : '_None currently categorized under Moderate Priority._'
}

### 🎯 Recommended First Experiment
${
  report.experimentPrioritization.recommendedFirst
    ? `- **Experiment Name:** ${report.experimentPrioritization.recommendedFirst.experimentName}
- **Expected Impact:** ${report.experimentPrioritization.recommendedFirst.expectedImpact}
- **Required Effort:** ${report.experimentPrioritization.recommendedFirst.requiredEffort}
- **Why It Should Be Run First:** ${report.experimentPrioritization.recommendedFirst.whyRunFirst}
- **What We Need to Learn From It:** ${report.experimentPrioritization.recommendedFirst.whatWeNeedToLearn}`
    : `- **Experiment Name:** ${report.experimentPrioritization.recommendedFirstExperimentName || 'Initial Test'}
- **Why Start Here:** ${report.experimentPrioritization.recommendedFirstRationale || 'Fastest validation path'}`
}

---

## 11. Success Metrics
### Primary Success Metric
- **Metric:** ${report.successMetrics.primaryMetric.name}
- **Definition:** ${report.successMetrics.primaryMetric.definition}
- **Why Chosen:** ${report.successMetrics.primaryMetric.whyChosen}
- **Baseline:** ${report.successMetrics.primaryMetric.baseline || 'Baseline: Not provided'}
- **Target:** ${
  report.successMetrics.primaryMetric.targetSuggestion ||
  report.successMetrics.primaryMetric.targetOrBaselineSuggestion ||
  'Suggested target: Define after establishing the baseline'
}
${
  report.successMetrics.primaryMetric.measurementMethod
    ? `- **Measurement Method:** ${report.successMetrics.primaryMetric.measurementMethod}\n`
    : ''
}
### Secondary Metrics
${report.successMetrics.secondaryMetrics
  .map(
    (m) =>
      `- **${m.name}:** ${m.definition} *(Relevance: ${m.relevance} | ${
        m.baselineStatus || 'Baseline: Not provided'
      })*`
  )
  .join('\n')}

### Guardrail Metrics
${report.successMetrics.guardrailMetrics
  .map(
    (g) =>
      `- **${g.name}:** ${g.definition}\n  *Threshold/Warning:* ${g.thresholdOrWarning}\n  *Why Crucial:* ${g.whyCrucial}`
  )
  .join('\n')}

---

## 12. Risks & Assumptions
### Key Risks & Mitigations
${report.risksAndAssumptions.risks
  .map((r) => `- **[Severity: ${r.severity}] ${r.risk}**\n  *Mitigation:* ${r.mitigation}`)
  .join('\n')}

### Critical Assumptions
${report.risksAndAssumptions.assumptions
  .map((a) => `- ${a.assumption} *(Status: ${a.validationStatus})*`)
  .join('\n')}

### Dependencies
${report.risksAndAssumptions.dependencies.map((d) => `- ${d}`).join('\n')}

### Key Unknowns
${report.risksAndAssumptions.unknowns.map((u) => `- ${u}`).join('\n')}

---

## 13. Recommended Action Plan
${report.recommendedActionPlan.steps
  .map(
    (s) => `### Step ${s.stepNumber}: ${s.title} (${s.timeframe})
- **Owner / Focus:** ${s.ownerOrFocus}
- **Action:** ${s.action}`
  )
  .join('\n\n')}
${report.recommendedActionPlan.recommendedNextStep ? `\n\n### 🎯 Recommended Next Step\n${report.recommendedActionPlan.recommendedNextStep}` : ''}
`;
}

export function downloadMarkdownFile(content: string, filename = 'pm-problem-solving-report.md') {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
