import { jsPDF } from 'jspdf';
import { AnalysisReport, ProblemInput, PrioritizedExperimentItem } from '../types';

export const exportReportToPdf = async (
  report: AnalysisReport,
  input: ProblemInput
): Promise<void> => {
  // Create jsPDF document: A4 portrait, millimeter units
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 16;
  const rightMargin = 16;
  const topMargin = 20;
  const bottomMargin = 20;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 178mm
  const maxContentY = pageHeight - bottomMargin; // 277mm

  let currentY = topMargin;

  // Colors
  const COLOR_PRIMARY = [30, 58, 138]; // Deep Blue
  const COLOR_SECONDARY = [79, 70, 229]; // Indigo
  const COLOR_TEXT_DARK = [17, 24, 39]; // Gray 900
  const COLOR_TEXT_MUTED = [75, 85, 99]; // Gray 600
  const COLOR_TEXT_LIGHT = [107, 114, 128]; // Gray 500
  const COLOR_BORDER = [229, 231, 235]; // Gray 200
  const COLOR_BG_LIGHT = [249, 250, 251]; // Gray 50
  const COLOR_BG_BLUE = [239, 246, 255]; // Blue 50
  const COLOR_BG_EMERALD = [236, 253, 245]; // Emerald 50
  const COLOR_BG_AMBER = [255, 251, 235]; // Amber 50
  const COLOR_SUCCESS = [16, 185, 129];
  const COLOR_WARNING = [217, 119, 6];
  const COLOR_DANGER = [225, 29, 72];

  // Helper: check space and add page if needed
  const ensureSpace = (heightNeeded: number) => {
    if (currentY + heightNeeded > maxContentY) {
      doc.addPage();
      currentY = topMargin;
    }
  };

  // Helper: Section Header
  const addSectionHeader = (title: string, subtitle?: string) => {
    ensureSpace(subtitle ? 18 : 14);
    
    // Top spacing
    currentY += 4;
    
    // Title with left accent bar
    doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.rect(leftMargin, currentY, 3, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text(title, leftMargin + 5.5, currentY + 5.2);
    currentY += 8.5;

    if (subtitle) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
      const subLines = doc.splitTextToSize(subtitle, contentWidth - 6);
      doc.text(subLines, leftMargin + 5.5, currentY);
      currentY += subLines.length * 3.8 + 2;
    } else {
      currentY += 1.5;
    }
  };

  // Helper: Subheading
  const addSubheading = (title: string, badge?: string) => {
    ensureSpace(10);
    currentY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLOR_TEXT_DARK[0], COLOR_TEXT_DARK[1], COLOR_TEXT_DARK[2]);
    doc.text(title, leftMargin, currentY);

    if (badge) {
      const badgeWidth = doc.getTextWidth(badge) + 4;
      const titleWidth = doc.getTextWidth(title);
      const badgeX = Math.min(leftMargin + titleWidth + 4, pageWidth - rightMargin - badgeWidth);
      doc.setFillColor(COLOR_BG_BLUE[0], COLOR_BG_BLUE[1], COLOR_BG_BLUE[2]);
      doc.setDrawColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
      doc.roundedRect(badgeX, currentY - 3.2, badgeWidth, 4.2, 1, 1, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
      doc.text(badge, badgeX + 2, currentY - 0.3);
    }

    currentY += 5;
  };

  // Helper: Paragraph with wrapping
  const addParagraph = (
    text: string,
    options?: {
      boldPrefix?: string;
      fontSize?: number;
      textColor?: number[];
      fontStyle?: 'normal' | 'bold' | 'italic';
      indent?: number;
      lineHeight?: number;
    }
  ) => {
    const fontSize = options?.fontSize || 8.5;
    const fontStyle = options?.fontStyle || 'normal';
    const textColor = options?.textColor || COLOR_TEXT_DARK;
    const indent = options?.indent || 0;
    const lineHeight = options?.lineHeight || 4.2;

    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    const prefix = options?.boldPrefix || '';
    const fullText = prefix ? `${prefix} ${text}` : text;
    const availableWidth = contentWidth - indent;
    const lines: string[] = doc.splitTextToSize(fullText, availableWidth);

    ensureSpace(lines.length * lineHeight + 2);

    if (prefix) {
      // Print prefix bold, then remainder
      doc.setFont('helvetica', 'bold');
      doc.text(prefix, leftMargin + indent, currentY);
      const prefixWidth = doc.getTextWidth(`${prefix} `);
      doc.setFont('helvetica', fontStyle);
      
      const restLines: string[] = doc.splitTextToSize(text, availableWidth);
      if (restLines.length === 1 && doc.getTextWidth(`${prefix} ${text}`) <= availableWidth) {
        doc.text(text, leftMargin + indent + prefixWidth, currentY);
        currentY += lineHeight;
      } else {
        // Redraw full lines clean
        doc.setFont('helvetica', fontStyle);
        doc.text(lines, leftMargin + indent, currentY);
        currentY += lines.length * lineHeight;
      }
    } else {
      doc.text(lines, leftMargin + indent, currentY);
      currentY += lines.length * lineHeight;
    }

    currentY += 1;
  };

  // Helper: Bullet item
  const addBullet = (
    text: string,
    boldLabel?: string,
    options?: { bulletColor?: number[]; indent?: number }
  ) => {
    const indent = options?.indent || 4;
    const bulletX = leftMargin + indent;
    const textX = bulletX + 3.5;
    const availableWidth = contentWidth - indent - 3.5;
    const bulletColor = options?.bulletColor || COLOR_SECONDARY;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    const fullText = boldLabel ? `${boldLabel} ${text}` : text;
    const lines: string[] = doc.splitTextToSize(fullText, availableWidth);

    ensureSpace(lines.length * 4.2 + 2);

    // Draw bullet dot
    doc.setFillColor(bulletColor[0], bulletColor[1], bulletColor[2]);
    doc.circle(bulletX + 1, currentY - 1.2, 0.9, 'F');

    // Text with optional bold label
    if (boldLabel) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLOR_TEXT_DARK[0], COLOR_TEXT_DARK[1], COLOR_TEXT_DARK[2]);
      doc.text(boldLabel, textX, currentY);
      const labelWidth = doc.getTextWidth(`${boldLabel} `);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
      
      if (lines.length === 1 && doc.getTextWidth(fullText) <= availableWidth) {
        doc.text(text, textX + labelWidth, currentY);
        currentY += 4.5;
      } else {
        doc.text(lines, textX, currentY);
        currentY += lines.length * 4.2;
      }
    } else {
      doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
      doc.text(lines, textX, currentY);
      currentY += lines.length * 4.2;
    }

    currentY += 1;
  };

  // Helper: Callout Box (e.g. Executive Summary, Recommended First Experiment)
  const addCalloutBox = (
    title: string,
    items: Array<{ label?: string; text: string }>,
    bgColor = COLOR_BG_LIGHT,
    borderColor = COLOR_PRIMARY
  ) => {
    const boxPadding = 4;
    const innerX = leftMargin + boxPadding + 1;
    const innerWidth = contentWidth - boxPadding * 2 - 2;

    // Calculate required height
    let contentHeight = 7; // Title space
    const measuredItems: Array<{ label?: string; lines: string[]; singleLineRest?: string; labelWidth?: number }> = [];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    items.forEach((item) => {
      if (item.label) {
        doc.setFont('helvetica', 'bold');
        const lw = doc.getTextWidth(`${item.label}: `);
        doc.setFont('helvetica', 'normal');
        const textLines = doc.splitTextToSize(item.text, innerWidth - lw);
        if (textLines.length === 1 && lw + doc.getTextWidth(item.text) <= innerWidth) {
          contentHeight += 4.5;
          measuredItems.push({ label: item.label, lines: textLines, singleLineRest: item.text, labelWidth: lw });
        } else {
          const fullLines: string[] = doc.splitTextToSize(`${item.label}: ${item.text}`, innerWidth);
          contentHeight += fullLines.length * 4.2 + 1;
          measuredItems.push({ label: item.label, lines: fullLines });
        }
      } else {
        const fullLines: string[] = doc.splitTextToSize(item.text, innerWidth);
        contentHeight += fullLines.length * 4.2 + 1;
        measuredItems.push({ lines: fullLines });
      }
    });

    const boxHeight = contentHeight + boxPadding * 2;
    ensureSpace(boxHeight + 4);

    const boxStartY = currentY;

    // Draw box background and border
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(leftMargin, boxStartY, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    // Draw Title
    let writeY = boxStartY + boxPadding + 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.text(title, innerX, writeY);
    writeY += 5;

    // Draw Items
    measuredItems.forEach((m) => {
      if (m.label) {
        if (m.singleLineRest && m.labelWidth !== undefined) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(COLOR_TEXT_DARK[0], COLOR_TEXT_DARK[1], COLOR_TEXT_DARK[2]);
          doc.text(`${m.label}: `, innerX, writeY);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
          doc.text(m.singleLineRest, innerX + m.labelWidth, writeY);
          writeY += 4.5;
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
          doc.text(m.lines, innerX, writeY);
          writeY += m.lines.length * 4.2 + 1;
        }
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
        doc.text(m.lines, innerX, writeY);
        writeY += m.lines.length * 4.2 + 1;
      }
    });

    currentY = boxStartY + boxHeight + 4;
  };

  // Helper: Card for Solutions, Experiments, Root Causes
  const addContentCard = (
    title: string,
    badges: string[],
    fields: Array<{ label: string; value: string }>,
    accentColor = COLOR_PRIMARY
  ) => {
    const padding = 3.5;
    const innerX = leftMargin + padding;
    const innerWidth = contentWidth - padding * 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    // Calculate height
    let contentHeight = 7; // Title space
    const measuredFields: Array<{ label: string; lines: string[]; singleLineRest?: string; labelWidth?: number }> = [];

    fields.forEach((f) => {
      const labelText = `${f.label}: `;
      doc.setFont('helvetica', 'bold');
      const lw = doc.getTextWidth(labelText);
      doc.setFont('helvetica', 'normal');
      const lines: string[] = doc.splitTextToSize(f.value, innerWidth - lw);

      if (lines.length === 1 && lw + doc.getTextWidth(f.value) <= innerWidth) {
        contentHeight += 3.8;
        measuredFields.push({ label: f.label, lines, singleLineRest: f.value, labelWidth: lw });
      } else {
        const fullLines: string[] = doc.splitTextToSize(`${labelText}${f.value}`, innerWidth);
        contentHeight += fullLines.length * 3.8 + 0.5;
        measuredFields.push({ label: f.label, lines: fullLines });
      }
    });

    const cardHeight = contentHeight + padding * 2;
    ensureSpace(cardHeight + 3.5);

    const cardY = currentY;

    // Draw background and stroke
    doc.setFillColor(COLOR_BG_LIGHT[0], COLOR_BG_LIGHT[1], COLOR_BG_LIGHT[2]);
    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(leftMargin, cardY, contentWidth, cardHeight, 1.2, 1.2, 'FD');

    // Title
    let writeY = cardY + padding + 2.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLOR_TEXT_DARK[0], COLOR_TEXT_DARK[1], COLOR_TEXT_DARK[2]);
    doc.text(title, innerX, writeY);

    // Badges on right side
    if (badges.length > 0) {
      let badgeX = pageWidth - rightMargin - padding;
      // Position badges right-to-left
      for (let i = badges.length - 1; i >= 0; i--) {
        const b = badges[i];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        const bw = doc.getTextWidth(b) + 3;
        badgeX -= bw;

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
        doc.roundedRect(badgeX, writeY - 2.8, bw, 3.8, 0.8, 0.8, 'FD');

        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(b, badgeX + 1.5, writeY - 0.3);
        badgeX -= 1.5;
      }
    }

    writeY += 4.5;

    // Fields
    measuredFields.forEach((m) => {
      if (m.singleLineRest && m.labelWidth !== undefined) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(COLOR_TEXT_DARK[0], COLOR_TEXT_DARK[1], COLOR_TEXT_DARK[2]);
        doc.text(`${m.label}: `, innerX, writeY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
        doc.text(m.singleLineRest, innerX + m.labelWidth, writeY);
        writeY += 3.8;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
        doc.text(m.lines, innerX, writeY);
        writeY += m.lines.length * 3.8 + 0.5;
      }
    });

    currentY = cardY + cardHeight + 3.5;
  };

  // ==========================================
  // DOCUMENT HEADER / COVER BANNER
  // ==========================================
  // Brand Bar
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Application Name & Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
  doc.text('AI PROBLEM-SOLVING ASSISTANT', leftMargin, currentY + 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(COLOR_TEXT_LIGHT[0], COLOR_TEXT_LIGHT[1], COLOR_TEXT_LIGHT[2]);
  doc.text('CONFIDENTIAL PRODUCT STRATEGY REPORT', pageWidth - rightMargin - 66, currentY + 4);

  currentY += 10;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(COLOR_TEXT_DARK[0], COLOR_TEXT_DARK[1], COLOR_TEXT_DARK[2]);
  const titleLines: string[] = doc.splitTextToSize(
    report.problemDefinition.redefinedProblem || input.problemStatement,
    contentWidth
  );
  doc.text(titleLines, leftMargin, currentY);
  currentY += titleLines.length * 6 + 3;

  // Metadata Card (Input details)
  const metaItems = [
    `Product / Company: ${input.productCompany || 'Not specified'}`,
    `Target Cohort: ${input.targetUsers || 'Not specified'}`,
    `Primary Goal: ${input.goal || 'Not specified'}`,
    `Generated: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}`,
  ];
  if (input.additionalContext) {
    metaItems.push(`Context: ${input.additionalContext}`);
  }

  doc.setFillColor(COLOR_BG_LIGHT[0], COLOR_BG_LIGHT[1], COLOR_BG_LIGHT[2]);
  doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
  doc.setLineWidth(0.3);

  const metaStartY = currentY;
  let metaWriteY = metaStartY + 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);

  metaItems.forEach((item) => {
    const l = doc.splitTextToSize(item, contentWidth - 8);
    metaWriteY += l.length * 3.8;
  });
  const metaHeight = metaWriteY - metaStartY + 3;
  doc.roundedRect(leftMargin, metaStartY, contentWidth, metaHeight, 1.5, 1.5, 'FD');

  metaWriteY = metaStartY + 4;
  metaItems.forEach((item) => {
    const l = doc.splitTextToSize(item, contentWidth - 8);
    doc.text(l, leftMargin + 4, metaWriteY);
    metaWriteY += l.length * 3.8;
  });

  currentY = metaStartY + metaHeight + 6;

  // ==========================================
  // 1. EXECUTIVE SUMMARY
  // ==========================================
  addSectionHeader('1. Executive Summary', 'High-level distillation of core diagnosis and strategic vector');
  addCalloutBox(
    'Executive Summary & Core Strategic Insight',
    [
      { label: 'Problem Summary', text: report.executiveSummary.problemSummary },
      { label: 'Recommended Direction', text: report.executiveSummary.recommendedDirection },
      { label: 'Core Insight', text: report.executiveSummary.coreInsight },
    ],
    COLOR_BG_BLUE,
    COLOR_PRIMARY
  );

  // ==========================================
  // 2. PROBLEM DEFINITION
  // ==========================================
  addSectionHeader('2. Problem Definition', 'Redefined problem, affected cohorts, and business criticality');
  addParagraph(report.problemDefinition.redefinedProblem, { boldPrefix: 'Redefined Problem:' });
  addParagraph(report.problemDefinition.businessImpactAndUrgency, { boldPrefix: 'Business Impact & Urgency:' });
  addParagraph(report.problemDefinition.whyItMatters, { boldPrefix: 'Why It Matters:' });

  addSubheading('Affected Stakeholders & Cohorts:');
  report.problemDefinition.affectedStakeholders.forEach((sh) => {
    addBullet(sh);
  });

  // ==========================================
  // 3. PROBLEM BREAKDOWN
  // ==========================================
  addSectionHeader('3. Problem Breakdown', 'Decomposition into functional, behavioral, and market dimensions');
  report.problemBreakdown.dimensions.forEach((dim, idx) => {
    addSubheading(`${idx + 1}. ${dim.dimensionName}`);
    addParagraph(dim.description);
    dim.subComponents.forEach((sub) => {
      addBullet(sub, undefined, { indent: 6 });
    });
  });

  // ==========================================
  // 4. ROOT CAUSE ANALYSIS
  // ==========================================
  addSectionHeader('4. Root Cause Analysis', 'Separation of user facts, possible mechanisms, and unvalidated hypotheses');

  addSubheading('1. User-Provided Facts (Ground Truth)', 'Supplied by User');
  if (report.rootCauseAnalysis.userProvidedFacts && report.rootCauseAnalysis.userProvidedFacts.length > 0) {
    report.rootCauseAnalysis.userProvidedFacts.forEach((fact) => {
      addBullet(fact, undefined, { bulletColor: COLOR_SUCCESS });
    });
  } else {
    addBullet(`Reported statement: "${input.problemStatement}"`, undefined, { bulletColor: COLOR_SUCCESS });
  }

  addSubheading('2. Possible Root Causes', 'Unconfirmed Mechanisms');
  const possibleCauses = report.rootCauseAnalysis.possibleRootCauses || report.rootCauseAnalysis.probableRootCauses || [];
  possibleCauses.forEach((rc) => {
    addContentCard(
      rc.cause,
      [rc.category, rc.statusLabel || (rc.isAssumption ? 'Assumption' : 'Hypothesis')],
      [{ label: 'Possible Mechanism', value: rc.mechanism }],
      COLOR_SECONDARY
    );
  });

  addSubheading('3. Hypotheses Requiring Validation', 'Must Be Tested');
  const hypoValidation =
    report.rootCauseAnalysis.hypothesesRequiringValidation ||
    (report.hypotheses || []).map((h) => h.hypothesis);
  hypoValidation.forEach((h, idx) => {
    addBullet(h, `H${idx + 1}:`, { bulletColor: COLOR_SECONDARY });
  });

  if (report.rootCauseAnalysis.cautionaryNote) {
    addCalloutBox(
      'PM Rigor Reminder',
      [{ text: report.rootCauseAnalysis.cautionaryNote }],
      COLOR_BG_AMBER,
      COLOR_WARNING
    );
  }

  // ==========================================
  // 5. TESTABLE HYPOTHESES
  // ==========================================
  addSectionHeader('5. Testable Hypotheses', 'Falsifiable assertions with explicit evidence requirements');
  report.hypotheses.forEach((h, idx) => {
    addContentCard(
      `H${idx + 1}: ${h.hypothesis}`,
      [`Confidence: ${h.confidenceLevel}`],
      [
        { label: 'Why It Could Be True', value: h.whyItCouldBeTrue },
        { label: 'Evidence Needed to Validate', value: h.evidenceNeeded },
        { label: 'Confidence Rationale', value: h.confidenceRationale },
      ],
      COLOR_SECONDARY
    );
  });

  // ==========================================
  // 6. INVESTIGATION QUESTIONS
  // ==========================================
  addSectionHeader('6. Investigation Questions', 'Targeted qualitative and quantitative discovery inquiries');
  report.investigationQuestions.forEach((q) => {
    addContentCard(
      q.question,
      [q.category],
      [{ label: 'Investigation Rationale', value: q.whyAskThis }],
      COLOR_PRIMARY
    );
  });

  // ==========================================
  // 7. DATA & SIGNALS NEEDED
  // ==========================================
  addSectionHeader('7. Data & Signals Needed', 'Telemetry, qualitative metrics, and instrumentation requirements');
  report.dataAndSignalsNeeded.forEach((sig) => {
    addContentCard(
      sig.sourceOrMetric,
      [`Priority: ${sig.priority}`, sig.category],
      [{ label: 'What to Look For', value: sig.whatToLookFor }],
      sig.priority === 'P0' ? COLOR_DANGER : COLOR_PRIMARY
    );
  });

  // ==========================================
  // 8. POTENTIAL SOLUTIONS
  // ==========================================
  addSectionHeader('8. Potential Solutions', 'Candidate intervention vectors evaluated across impact, effort, and assumptions');
  report.potentialSolutions.forEach((sol) => {
    addContentCard(
      sol.solutionName,
      [`Impact: ${sol.expectedImpact}`, `Effort: ${sol.effort}`],
      [
        { label: 'Description', value: sol.description },
        { label: 'Problem Addressed', value: sol.problemAddressed },
        { label: 'Impact Rationale', value: sol.impactRationale },
        { label: 'Effort Rationale', value: sol.effortRationale },
        { label: 'Key Assumption', value: sol.keyAssumption },
      ],
      COLOR_PRIMARY
    );
  });

  // ==========================================
  // 9. PROPOSED EXPERIMENTS
  // ==========================================
  addSectionHeader('9. Proposed Experiments', 'Testing protocols with explicit metrics and Go/No-Go decision rules');
  report.experiments.forEach((exp) => {
    addContentCard(
      exp.experimentName,
      [`Impact: ${exp.impactLevel}`, `Effort: ${exp.effortLevel}`],
      [
        { label: 'Hypothesis Tested', value: exp.hypothesisTested },
        { label: 'Target Users', value: exp.targetUsers },
        { label: 'Design', value: exp.experimentDesign },
        { label: 'Duration', value: exp.duration },
        { label: 'Primary Metric', value: exp.primaryMetric },
        { label: 'Expected Result', value: exp.expectedResult },
        { label: 'Decision Rule (Go / No-Go)', value: exp.decisionRule },
      ],
      COLOR_SECONDARY
    );
  });

  // ==========================================
  // 10. EXPERIMENT PRIORITIZATION
  // ==========================================
  addSectionHeader('10. Experiment Prioritization', 'Text-based prioritization analysis and execution recommendations');

  // Align canonical experiments with categorization
  const prio = report.experimentPrioritization;
  const renderPriorityCategory = (
    categoryTitle: string,
    badgeText: string,
    items: PrioritizedExperimentItem[],
    emptyText: string,
    accentColor = COLOR_PRIMARY
  ) => {
    addSubheading(categoryTitle, badgeText);
    if (items && items.length > 0) {
      items.forEach((item) => {
        const fields = [
          { label: 'Impact / Effort / Priority', value: `${item.impact} / ${item.effort} / ${item.priority}` },
          { label: 'Reason', value: item.reason },
        ];
        if (item.categoryExplanation) {
          fields.push({ label: 'Category Justification', value: item.categoryExplanation });
        }
        addContentCard(item.experimentName, [`Priority: ${item.priority}`], fields, accentColor);
      });
    } else {
      addParagraph(emptyText, { fontStyle: 'italic', textColor: COLOR_TEXT_LIGHT });
    }
  };

  renderPriorityCategory(
    '1. Quick Wins (High Impact + Low Effort)',
    'High Leverage',
    prio.quickWins,
    'No proposed experiments meet both criteria of High Impact and Low Effort.',
    COLOR_SUCCESS
  );

  renderPriorityCategory(
    '2. Strategic Bets (High Impact + High Effort)',
    'Strategic Investment',
    prio.strategicBets,
    'No proposed experiments meet both criteria of High Impact and High Effort.',
    COLOR_SECONDARY
  );

  renderPriorityCategory(
    '3. Fill-ins (Low Impact + Low Effort)',
    'Opportunistic',
    prio.fillIns,
    'No proposed experiments meet both criteria of Low Impact and Low Effort.',
    COLOR_WARNING
  );

  renderPriorityCategory(
    '4. Deprioritize (Low Impact + High Effort)',
    'Do Not Prioritize',
    prio.deprioritize,
    'No proposed experiments meet both criteria of Low Impact and High Effort.',
    COLOR_DANGER
  );

  renderPriorityCategory(
    '5. Moderate Priority (Medium Impact or Medium Effort)',
    'Moderate Tier',
    prio.moderatePriority,
    'No proposed experiments have Medium impact or Medium effort.',
    COLOR_PRIMARY
  );

  // Recommended First Experiment Callout
  const recFirst = prio.recommendedFirst || {
    experimentName: prio.recommendedFirstExperimentName || 'Primary Test',
    expectedImpact: 'High',
    requiredEffort: 'Low',
    whyRunFirst: prio.recommendedFirstRationale || 'Fastest validation feedback loop.',
    whatWeNeedToLearn: 'Confirm demand signal before building heavy features.',
  };

  addCalloutBox(
    'RECOMMENDED FIRST EXPERIMENT',
    [
      { label: 'Experiment Name', text: recFirst.experimentName },
      { label: 'Expected Impact', text: recFirst.expectedImpact },
      { label: 'Required Effort', text: recFirst.requiredEffort },
      { label: 'Why It Should Be Run First', text: recFirst.whyRunFirst },
      { label: 'What We Need to Learn From It', text: recFirst.whatWeNeedToLearn },
    ],
    COLOR_BG_EMERALD,
    COLOR_SUCCESS
  );

  // ==========================================
  // 11. SUCCESS METRICS
  // ==========================================
  addSectionHeader('11. Success Metrics & Guardrails', 'Primary North Star, secondary indicators, and guardrails');

  addCalloutBox(
    'Primary Success Metric (North Star)',
    [
      { label: 'Metric Name', text: report.successMetrics.primaryMetric.name },
      { label: 'Baseline', text: report.successMetrics.primaryMetric.baseline || 'Baseline: Not provided' },
      {
        label: 'Target',
        text:
          report.successMetrics.primaryMetric.targetSuggestion ||
          report.successMetrics.primaryMetric.targetOrBaselineSuggestion ||
          'Suggested target: Define after establishing the baseline',
      },
      { label: 'Definition', text: report.successMetrics.primaryMetric.definition },
      { label: 'Why Chosen', text: report.successMetrics.primaryMetric.whyChosen },
      ...(report.successMetrics.primaryMetric.measurementMethod
        ? [{ label: 'Measurement Method', text: report.successMetrics.primaryMetric.measurementMethod }]
        : []),
    ],
    COLOR_BG_BLUE,
    COLOR_PRIMARY
  );

  addSubheading('Secondary Metrics (Supporting Indicators):');
  report.successMetrics.secondaryMetrics.forEach((sec) => {
    addContentCard(
      sec.name,
      [sec.baselineStatus || 'Baseline: Not provided'],
      [
        { label: 'Definition', value: sec.definition },
        { label: 'Relevance', value: sec.relevance },
      ],
      COLOR_SECONDARY
    );
  });

  addSubheading('Guardrail Metrics (Do Not Harm):');
  report.successMetrics.guardrailMetrics.forEach((g) => {
    addContentCard(
      g.name,
      [`Threshold: ${g.thresholdOrWarning}`],
      [
        { label: 'Definition', value: g.definition },
        { label: 'Why Crucial', value: g.whyCrucial },
      ],
      COLOR_WARNING
    );
  });

  // ==========================================
  // 12. RISKS & ASSUMPTIONS
  // ==========================================
  addSectionHeader('12. Risks & Assumptions', 'Risk mitigations, assumptions, dependencies, and unknowns');

  addSubheading('Key Risks & Mitigations:');
  report.risksAndAssumptions.risks.forEach((r) => {
    addContentCard(
      r.risk,
      [`Severity: ${r.severity}`],
      [{ label: 'Mitigation Plan', value: r.mitigation }],
      r.severity === 'High' ? COLOR_DANGER : COLOR_WARNING
    );
  });

  addSubheading('Critical Assumptions:');
  report.risksAndAssumptions.assumptions.forEach((a) => {
    addBullet(a.assumption, `[${a.validationStatus}]`, {
      bulletColor: COLOR_SECONDARY,
    });
  });

  if (report.risksAndAssumptions.dependencies && report.risksAndAssumptions.dependencies.length > 0) {
    addSubheading('Project Dependencies:');
    report.risksAndAssumptions.dependencies.forEach((d) => {
      addBullet(d);
    });
  }

  if (report.risksAndAssumptions.unknowns && report.risksAndAssumptions.unknowns.length > 0) {
    addSubheading('Key Unknowns to Investigate:');
    report.risksAndAssumptions.unknowns.forEach((u) => {
      addBullet(u, undefined, { bulletColor: COLOR_WARNING });
    });
  }

  // ==========================================
  // 13. RECOMMENDED ACTION PLAN
  // ==========================================
  addSectionHeader('13. Recommended Action Plan', 'Sequential execution roadmap across owners and milestones');

  report.recommendedActionPlan.steps.forEach((step) => {
    addContentCard(
      `Step ${step.stepNumber}: ${step.title}`,
      [`Timeframe: ${step.timeframe}`, `Owner: ${step.ownerOrFocus}`],
      [{ label: 'Key Action', value: step.action }],
      COLOR_PRIMARY
    );
  });

  // ==========================================
  // RUNNING HEADERS & FOOTERS ACROSS ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (pages > 1)
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(COLOR_TEXT_LIGHT[0], COLOR_TEXT_LIGHT[1], COLOR_TEXT_LIGHT[2]);
      doc.text('AI Problem-Solving Assistant • Product Management Decision Report', leftMargin, 11);

      // Subtle rule below header
      doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
      doc.setLineWidth(0.15);
      doc.line(leftMargin, 13.5, pageWidth - rightMargin, 13.5);
    }

    // Running Footer (all pages)
    doc.setDrawColor(COLOR_BORDER[0], COLOR_BORDER[1], COLOR_BORDER[2]);
    doc.setLineWidth(0.15);
    doc.line(leftMargin, pageHeight - 12, pageWidth - rightMargin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(COLOR_TEXT_LIGHT[0], COLOR_TEXT_LIGHT[1], COLOR_TEXT_LIGHT[2]);
    doc.text(`Generated on ${formattedDate} | Evidence-Based PM Report`, leftMargin, pageHeight - 7.5);

    const pageStr = `Page ${i} of ${totalPages}`;
    const pageStrWidth = doc.getTextWidth(pageStr);
    doc.text(pageStr, pageWidth - rightMargin - pageStrWidth, pageHeight - 7.5);
  }

  // Sanitize filename
  const sanitizedTitle = (report.problemDefinition.redefinedProblem || input.problemStatement || 'Report')
    .slice(0, 32)
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `AI-Problem-Solving-Report-${sanitizedTitle}.pdf`;

  // Download PDF with fallback
  try {
    doc.save(filename);
  } catch (saveErr) {
    console.warn('doc.save encountered error, falling back to blob anchor download:', saveErr);
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      throw saveErr;
    }
  }
};
