/**
 * Word Document Export Utility
 * Generates formatted DOCX documents with inheritance calculation results
 * Fallback to HTML Word format if DOCX library not available
 */

import type { CalculationResult } from '@/lib/types';
import type { MadhhabComparison } from '@/lib/madhab-comparison';

export interface WordExportOptions {
  filename?: string;
  includeComparison?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
  includeCharts?: boolean;
}

/**
 * Format a fraction as a percentage
 */
function formatPercentage(decimal: number): string {
  return `${(decimal * 100).toFixed(2)}%`;
}

/**
 * Format currency in Arabic locale
 */
function formatCurrency(amount: number): string {
  return amount.toLocaleString('ar-SA', { maximumFractionDigits: 2 });
}

/**
 * Generate HTML content formatted for Word document
 * Can be opened in Microsoft Word, Google Docs, etc.
 */
export function generateWordHTML(
  result: CalculationResult,
  options: WordExportOptions = {}
): string {
  const {
    title = 'حساب الميراث الشرعي - Islamic Inheritance Calculator',
    includeSummary = true,
    includeDetails = true,
  } = options;

  const styles = `
    <style>
      * {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        direction: rtl;
        text-align: right;
      }
      body {
        margin: 2cm;
        line-height: 1.6;
        background: white;
      }
      .header {
        text-align: center;
        border-bottom: 3px solid #333;
        padding-bottom: 20px;
        margin-bottom: 20px;
      }
      .header h1 {
        margin: 0;
        color: #1f2937;
        font-size: 28px;
        margin-bottom: 5px;
      }
      .header p {
        margin: 5px 0;
        color: #666;
        font-size: 12px;
      }
      .section {
        margin: 20px 0;
        page-break-inside: avoid;
      }
      .section-title {
        background: #f3f4f6;
        padding: 10px 15px;
        margin: 15px 0 10px 0;
        border-right: 4px solid #3b82f6;
        font-weight: bold;
        font-size: 14px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      th {
        background: #e5e7eb;
        padding: 10px;
        text-align: right;
        border: 1px solid #d1d5db;
        font-weight: bold;
        font-size: 12px;
      }
      td {
        padding: 8px 10px;
        border: 1px solid #e5e7eb;
        font-size: 11px;
      }
      tr:nth-child(even) {
        background: #f9fafb;
      }
      .summary-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #e5e7eb;
      }
      .summary-label {
        font-weight: bold;
        width: 40%;
      }
      .summary-value {
        width: 60%;
        text-align: left;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        font-size: 10px;
        color: #666;
        text-align: center;
      }
      .special-case {
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 10px;
        margin: 10px 0;
        border-radius: 3px;
      }
      .amount-highlight {
        background: #dbeafe;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: bold;
      }
    </style>
  `;

  let htmlContent = '';

  // Header
  htmlContent += `
    <div class="header">
      <h1>${title}</h1>
      <p>Islamic Inheritance Distribution Calculator</p>
      <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
    </div>
  `;

  // Summary Section
  if (includeSummary) {
    htmlContent += `
      <div class="section">
        <div class="section-title">معلومات الملخص | Summary Information</div>
        <div class="summary-item">
          <span class="summary-label">المذهب الفقهي | Madhab:</span>
          <span class="summary-value">${result.madhhabName}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">صافي التركة | Net Estate:</span>
          <span class="summary-value"><span class="amount-highlight">${formatCurrency(result.netEstate.toDecimal())}</span></span>
        </div>
        <div class="summary-item">
          <span class="summary-label">حالة خاصة | Special Case:</span>
          <span class="summary-value">${result.specialCase ? `نعم - ${result.specialCase}` : 'لا'}</span>
        </div>
      </div>
    `;
  }

  // Shares Distribution Table
  if (result.shares && result.shares.length > 0) {
    htmlContent += `
      <div class="section">
        <div class="section-title">توزيع الميراث | Inheritance Distribution</div>
        <table>
          <thead>
            <tr>
              <th>الوارث | Heir</th>
              <th>العدد | Count</th>
              <th>النسبة | Share %</th>
              <th>المبلغ الإجمالي | Total Amount</th>
              <th>حصة الفرد | Per Person</th>
            </tr>
          </thead>
          <tbody>
    `;

    result.shares.forEach((share: any) => {
      const perPersonAmount = share.count > 1 ? formatCurrency(share.amountPerPerson || 0) : '—';
      htmlContent += `
        <tr>
          <td>${share.name}</td>
          <td>${share.count || 1}</td>
          <td>${formatPercentage(share.fraction.toDecimal())}</td>
          <td><span class="amount-highlight">${formatCurrency(share.amount || 0)}</span></td>
          <td>${perPersonAmount}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
      </div>
    `;
  }

  // Special Cases Explanation
  if (result.specialCase && result.specialCaseExplanation) {
    htmlContent += `
      <div class="section">
        <div class="special-case">
          <strong>حالة خاصة | Special Case: ${result.specialCase}</strong>
          <p>${result.specialCaseExplanation}</p>
        </div>
      </div>
    `;
  }

  // Details Section
  if (includeDetails && result.details) {
    htmlContent += `
      <div class="section">
        <div class="section-title">التفاصيل | Details</div>
        <table>
          <thead>
            <tr>
              <th>الخاصية | Property</th>
              <th>القيمة | Value</th>
            </tr>
          </thead>
          <tbody>
    `;

    Object.entries(result.details).forEach(([key, value]: [string, any]) => {
      htmlContent += `
        <tr>
          <td>${key}</td>
          <td>${String(value)}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
      </div>
    `;
  }

  // Footer
  htmlContent += `
    <div class="footer">
      <p>تم إنشاء هذا التقرير بواسطة Inheritance Pro v5.0</p>
      <p>Generated by Inheritance Pro v5.0 - ${new Date().toLocaleString('ar-SA')}</p>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${styles}
</head>
<body>
  ${htmlContent}
</body>
</html>`;
}

/**
 * Generate comparison document in Word format
 */
export function generateComparisonWordHTML(
  comparisons: MadhhabComparison[],
  estate: number,
  heirs: any[]
): string {
  const styles = `
    <style>
      * {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        direction: rtl;
        text-align: right;
      }
      body {
        margin: 2cm;
        line-height: 1.6;
      }
      .header {
        text-align: center;
        border-bottom: 3px solid #333;
        padding-bottom: 20px;
        margin-bottom: 20px;
      }
      .header h1 {
        margin: 0 0 10px 0;
        color: #1f2937;
      }
      .section-title {
        background: #f3f4f6;
        padding: 10px 15px;
        margin: 15px 0 10px 0;
        border-right: 4px solid #3b82f6;
        font-weight: bold;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      th {
        background: #e5e7eb;
        padding: 10px;
        border: 1px solid #d1d5db;
        font-weight: bold;
      }
      td {
        padding: 8px 10px;
        border: 1px solid #e5e7eb;
      }
      tr:nth-child(even) {
        background: #f9fafb;
      }
      .difference {
        background: #fef3c7;
        font-weight: bold;
      }
    </style>
  `;

  let htmlContent = `
    <div class="header">
      <h1>مقارنة المذاهب الإسلامية | Islamic Madhabs Comparison</h1>
      <p>التركة | Estate: ${estate.toLocaleString('ar-SA')}</p>
      <p>التاريخ | Date: ${new Date().toLocaleDateString('ar-SA')}</p>
    </div>
  `;

  // Build comparison table
  htmlContent += `
    <div class="section">
      <div class="section-title">توزيع الميراث حسب المذاهب | Distribution by Madhab</div>
      <table>
        <thead>
          <tr>
            <th>الوارث | Heir</th>
  `;

  comparisons.forEach((c) => {
    htmlContent += `<th>${c.madhab}</th>`;
  });

  htmlContent += `
          </tr>
        </thead>
        <tbody>
  `;

  // Collect all heirs
  const allHeirs = new Set<string>();
  comparisons.forEach((comp) => {
    if (comp.result.shares) {
      comp.result.shares.forEach((share: any) => {
        allHeirs.add(share.name);
      });
    }
  });

  // Add row for each heir
  Array.from(allHeirs).forEach((heirName) => {
    htmlContent += `<tr><td>${heirName}</td>`;
    comparisons.forEach((comp) => {
      const share = comp.result.shares?.find((s: any) => s.name === heirName);
      if (share) {
        const percentage = formatPercentage(share.fraction.toDecimal());
        const amount = formatCurrency(share.amount || 0);
        htmlContent += `<td>${percentage} (${amount})</td>`;
      } else {
        htmlContent += `<td>—</td>`;
      }
    });
    htmlContent += `</tr>`;
  });

  htmlContent += `
        </tbody>
      </table>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>مقارنة المذاهب</title>
  ${styles}
</head>
<body>
  ${htmlContent}
</body>
</html>`;
}

/**
 * Download Word-compatible HTML file
 */
export function downloadWordFile(
  content: string,
  filename: string = 'inheritance-report.doc'
): void {
  const blob = new Blob([content], { type: 'application/msword;charset=utf-8;' });
  const link = document.createElement('a');

  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export calculation result as Word document
 */
export function exportToWord(
  result: CalculationResult,
  options: WordExportOptions = {}
): void {
  const filename = options.filename || `inheritance-${new Date().toISOString().slice(0, 10)}.doc`;
  const htmlContent = generateWordHTML(result, options);
  downloadWordFile(htmlContent, filename);
}

/**
 * Export madhab comparison as Word document
 */
export function exportComparisonToWord(
  comparisons: MadhhabComparison[],
  estate: number,
  heirs: any[],
  filename?: string
): void {
  const finalFilename = filename || `madhabs-comparison-${new Date().toISOString().slice(0, 10)}.doc`;
  const htmlContent = generateComparisonWordHTML(comparisons, estate, heirs);
  downloadWordFile(htmlContent, finalFilename);
}

/**
 * Preview Word document in new window
 * Useful for testing before export
 */
export function previewWord(
  result: CalculationResult,
  options: WordExportOptions = {}
): void {
  const htmlContent = generateWordHTML(result, options);
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  }
}
