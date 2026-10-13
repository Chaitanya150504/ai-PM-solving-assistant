export interface ProblemInput {
  problemStatement: string;
  productCompany: string;
  targetUsers: string;
  goal: string;
  additionalContext: string;
}

export interface ExecutiveSummary {
  problemSummary: string;
  recommendedDirection: string;
  coreInsight: string;
}

export interface ProblemDefinition {
  redefinedProblem: string;
  affectedStakeholders: string[];
  businessImpactAndUrgency: string;
  whyItMatters: string;
}

export interface ProblemBreakdownDimension {
  dimensionName: string;
  description: string;
  subComponents: string[];
}

export interface ProblemBreakdown {
  dimensions: ProblemBreakdownDimension[];
}

export interface SymptomItem {
  description: string;
  surfaceObservation: string;
}

export interface RootCauseItem {
  cause: string;
  mechanism: string;
  category: string;
  isAssumption: boolean;
  statusLabel?: string;
}

export interface RootCauseAnalysis {
  userProvidedFacts: string[];
  possibleRootCauses: RootCauseItem[];
  hypothesesRequiringValidation: string[];
  cautionaryNote: string;
  // Legacy fields for backward compatibility
  symptoms?: SymptomItem[];
  probableRootCauses?: RootCauseItem[];
}

export interface Hypothesis {
  id: string;
  hypothesis: string;
  whyItCouldBeTrue: string;
  evidenceNeeded: string;
  confidenceLevel: 'High' | 'Medium' | 'Low' | string;
  confidenceRationale: string;
}

export interface InvestigationQuestion {
  category: string;
  question: string;
  whyAskThis: string;
}

export interface SignalNeeded {
  category: string;
  sourceOrMetric: string;
  whatToLookFor: string;
  priority: string;
}

export interface PotentialSolution {
  id: string;
  solutionName: string;
  description: string;
  problemAddressed: string;
  expectedImpact: string;
  impactRationale: string;
  effort: string;
  effortRationale: string;
  keyAssumption: string;
}

export interface Experiment {
  id: string;
  experimentName: string;
  hypothesisTested: string;
  targetUsers: string;
  experimentDesign: string;
  duration: string;
  primaryMetric: string;
  expectedResult: string;
  decisionRule: string;
  quadrant: 'Quick Win' | 'Strategic Bet' | 'Low Hanging' | 'Deprioritize' | string;
  impactLevel: 'High' | 'Low' | string;
  effortLevel: 'High' | 'Low' | string;
}

export interface PrioritizedExperimentItem {
  experimentName: string;
  impact: 'High' | 'Medium' | 'Low' | string;
  effort: 'High' | 'Medium' | 'Low' | string;
  priority: 'High' | 'Medium' | 'Low' | string;
  reason: string;
  categoryExplanation?: string;
}

export interface RecommendedFirstExperiment {
  experimentName: string;
  expectedImpact: string;
  requiredEffort: string;
  whyRunFirst: string;
  whatWeNeedToLearn: string;
}

export interface ExperimentPrioritization {
  quickWins: PrioritizedExperimentItem[];
  strategicBets: PrioritizedExperimentItem[];
  fillIns: PrioritizedExperimentItem[];
  deprioritize: PrioritizedExperimentItem[];
  moderatePriority: PrioritizedExperimentItem[];
  recommendedFirst: RecommendedFirstExperiment;
  // Optional legacy fields for backward compatibility
  recommendedFirstExperimentName?: string;
  recommendedFirstRationale?: string;
  highImpactLowEffort?: string[];
  highImpactHighEffort?: string[];
  lowImpactLowEffort?: string[];
  lowImpactHighEffort?: string[];
  frameworkSummary?: string;
}

export interface SuccessMetrics {
  primaryMetric: {
    name: string;
    definition: string;
    whyChosen: string;
    baseline: string;
    targetSuggestion: string;
    measurementMethod?: string;
    targetOrBaselineSuggestion?: string;
  };
  secondaryMetrics: Array<{
    name: string;
    definition: string;
    relevance: string;
    baselineStatus?: string;
  }>;
  guardrailMetrics: Array<{
    name: string;
    definition: string;
    thresholdOrWarning: string;
    whyCrucial: string;
  }>;
}

export interface RiskItem {
  risk: string;
  severity: 'High' | 'Medium' | 'Low' | string;
  mitigation: string;
}

export interface AssumptionItem {
  assumption: string;
  validationStatus: string;
}

export interface RisksAndAssumptions {
  risks: RiskItem[];
  assumptions: AssumptionItem[];
  dependencies: string[];
  unknowns: string[];
}

export interface ActionPlanStep {
  stepNumber: number;
  title: string;
  ownerOrFocus: string;
  action: string;
  timeframe: string;
}

export interface RecommendedActionPlan {
  steps: ActionPlanStep[];
  recommendedNextStep?: string;
}

export interface AnalysisReport {
  executiveSummary: ExecutiveSummary;
  problemDefinition: ProblemDefinition;
  problemBreakdown: ProblemBreakdown;
  rootCauseAnalysis: RootCauseAnalysis;
  hypotheses: Hypothesis[];
  investigationQuestions: InvestigationQuestion[];
  dataAndSignalsNeeded: SignalNeeded[];
  potentialSolutions: PotentialSolution[];
  experiments: Experiment[];
  experimentPrioritization: ExperimentPrioritization;
  successMetrics: SuccessMetrics;
  risksAndAssumptions: RisksAndAssumptions;
  recommendedActionPlan: RecommendedActionPlan;
}

export interface SavedAnalysis {
  id: string;
  timestamp: number;
  input: ProblemInput;
  report: AnalysisReport;
}
