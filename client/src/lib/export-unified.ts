/**
 * Unified Export Module
 * Provides a single interface for all export functionality
 */

import type { CalculationResult } from '@/lib/types';
import type { MadhhabComparison } from '@/lib/madhab-comparison';
import { exportToExcel, exportComparisonToExcel, generateCSVContent } from './export-excel';
import { exportToWord, exportComparisonToWord, generateWordHTML, previewWord } from './export-word';
import { generatePDFHTML } from './pdf-export';

export type ExportFormat = 'pdf' | 'word' | 'excel' | 'csv' | 'json' | 'text';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeSummary?: boolean;
  includeDetails?: boolean;
  includeComparison?: boolean;
  preview?: boolean;
}

/**
 * Main export function - delegates to appropriate exporter
 */
export function exportCalculation(
  result: CalculationResult,
  options: ExportOptions
): void {
  const {
    format,
    filename,
    includeSummary = true,
    includeDetails = true,
    preview = false,
  } = options;

  switch (format) {
    case 'excel':
      exportToExcel(result, { filename, includeSummary, includeDetails });
      break;

    case 'csv':
      {
        const csvContent = generateCSVContent(result, { includeSummary, includeDetails });
        downloadFile(
          csvContent,
          filename || `inheritance-${new Date().toISOString().slice(0, 10)}.csv`,
          'text/csv'
        );
      }
      break;

    case 'word':
      if (preview) {
        previewWord(result, { includeSummary, includeDetails });
      } else {
        exportToWord(result, { filename, includeSummary, includeDetails });
      }
      break;

    case 'pdf':
      exportToPDF(result, filename);
      break;

    case 'json':
      downloadJSON(result, filename);
      break;

    case 'text':
      downloadText(result, filename);
      break;

    default:
      console.error(`Unknown export format: ${format}`);
  }
}

/**
 * Export comparison across madhabs
 */
export function exportComparison(
  comparisons: MadhhabComparison[],
  estate: number,
  heirs: any[],
  format: ExportFormat,
  filename?: string
): void {
  switch (format) {
    case 'excel':
      exportComparisonToExcel(comparisons, estate, heirs, filename);
      break;

    case 'word':
      exportComparisonToWord(comparisons, estate, heirs, filename);
      break;

    case 'json':
      downloadJSON(
        { comparisons, estate, heirs },
        filename || `madhabs-comparison-${new Date().toISOString().slice(0, 10)}.json`
      );
      break;

    default:
      console.error(`Export format ${format} not supported for comparisons`);
  }
}

/**
 * Export to PDF using existing PDF export functionality
 */
function exportToPDF(result: CalculationResult, filename?: string): void {
  const pdfHTML = generatePDFHTML(result, {
    title: 'حساب الميراث الشرعي',
    filename: filename || `inheritance-${new Date().toISOString().slice(0, 10)}.pdf`,
    includeDetails: true,
  });

  // For PDF, we would normally use a library like jsPDF or pdfkit
  // For now, we can open the HTML in a new window for printing
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(pdfHTML);
    newWindow.document.close();
    // Optionally trigger print dialog
    newWindow.print();
  }
}

/**
 * Download calculation as JSON
 */
function downloadJSON(data: any, filename: string = 'inheritance-data.json'): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Download calculation as plain text
 */
function downloadText(result: CalculationResult, filename: string = 'inheritance-report.txt'): void {
  let textContent = '';

  // Header
  textContent += 'حساب الميراث الشرعي\n';
  textContent += 'Islamic Inheritance Calculator\n';
  textContent += '='.repeat(50) + '\n\n';

  // Summary
  textContent += 'معلومات الملخص | Summary Information\n';
  textContent += '-'.repeat(50) + '\n';
  textContent += `المذهب | Madhab: ${result.madhhabName}\n`;
  textContent += `صافي التركة | Net Estate: ${result.netEstate.toDecimal()}\n`;
  textContent += `حالة خاصة | Special Case: ${result.specialCase || 'لا / No'}\n\n`;

  // Shares
  if (result.shares && result.shares.length > 0) {
    textContent += 'توزيع الميراث | Inheritance Distribution\n';
    textContent += '-'.repeat(50) + '\n';

    result.shares.forEach((share: any) => {
      const percentage = (share.fraction.toDecimal() * 100).toFixed(2);
      const amount = share.amount?.toLocaleString('ar-SA') || 0;
      const perPerson = share.count > 1 ? share.amountPerPerson?.toLocaleString('ar-SA') : '—';

      textContent += `${share.name}: ${percentage}% (${amount})\n`;
      if (share.count > 1) {
        textContent += `  حصة الفرد | Per Person: ${perPerson}\n`;
      }
    });
  }

  downloadFile(textContent, filename, 'text/plain');
}

/**
 * Generic file download utility
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const link = document.createElement('a');

  if (navigator.msSaveBlob) {
    // IE 10+
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
 * Get human-readable format name
 */
export function getFormatLabel(format: ExportFormat): string {
  const labels: Record<ExportFormat, string> = {
    pdf: 'PDF Document',
    word: 'Word Document',
    excel: 'Excel Spreadsheet',
    csv: 'CSV File',
    json: 'JSON Data',
    text: 'Text File',
  };
  return labels[format];
}

/**
 * Get format icon (emoji representation)
 */
export function getFormatIcon(format: ExportFormat): string {
  const icons: Record<ExportFormat, string> = {
    pdf: '📄',
    word: '📝',
    excel: '📊',
    csv: '📋',
    json: '{ }',
    text: '📃',
  };
  return icons[format];
}

/**
 * Check if format supports comparisons
 */
export function supportsComparison(format: ExportFormat): boolean {
  return ['excel', 'word', 'json'].includes(format);
}
