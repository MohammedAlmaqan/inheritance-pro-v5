/**
 * Excel Export Utility
 * Generates formatted XLSX documents with inheritance calculation results
 */

import type { CalculationResult } from '@/lib/types';
import type { MadhhabComparison } from '@/lib/madhab-comparison';

export interface ExcelExportOptions {
  filename?: string;
  includeComparison?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
}

/**
 * Format a fraction as a percentage string
 */
function formatPercentage(decimal: number): string {
  return `${(decimal * 100).toFixed(2)}%`;
}

/**
 * Format currency in Arabic numerals
 */
function formatCurrency(amount: number): string {
  return amount.toLocaleString('ar-SA', { maximumFractionDigits: 2 });
}

/**
 * Generate Excel data structure from calculation result
 * Returns CSV-compatible data that can be converted to Excel
 */
export function generateExcelData(
  result: CalculationResult,
  options: ExcelExportOptions = {}
): { rows: string[][]; headers: string[] } {
  const {
    includeSummary = true,
    includeDetails = true,
  } = options;

  const rows: string[][] = [];
  const headers: string[] = [];

  // ==========================================
  // HEADER SECTION
  // ==========================================
  rows.push(['حساب الميراث الشرعي']);
  rows.push(['Islamic Inheritance Calculator']);
  rows.push([]);

  // Summary Info
  if (includeSummary) {
    rows.push(['معلومات الملخص', 'Summary Information']);
    rows.push(['المذهب', 'Madhab', result.madhhabName]);
    rows.push(['صافي التركة', 'Net Estate', formatCurrency(result.netEstate.toDecimal())]);
    rows.push(['حالة خاصة', 'Special Case', result.specialCase ? 'نعم / Yes' : 'لا / No']);
    if (result.specialCase) {
      rows.push(['نوع الحالة', 'Case Type', result.specialCase]);
    }
    rows.push([]);
  }

  // ==========================================
  // SHARES SECTION
  // ==========================================
  if (result.shares && result.shares.length > 0) {
    rows.push(['توزيع الميراث', 'Inheritance Distribution']);
    rows.push([
      'الوارث',
      'Heir',
      'العدد',
      'Count',
      'النسبة',
      'Share %',
      'المبلغ الإجمالي',
      'Total Amount',
      'حصة الفرد',
      'Per Person',
    ]);

    result.shares.forEach((share: any) => {
      rows.push([
        share.name,
        share.name,
        String(share.count || 1),
        String(share.count || 1),
        formatPercentage(share.fraction.toDecimal()),
        formatPercentage(share.fraction.toDecimal()),
        formatCurrency(share.amount || 0),
        formatCurrency(share.amount || 0),
        share.count > 1 ? formatCurrency(share.amountPerPerson || 0) : '—',
        share.count > 1 ? formatCurrency(share.amountPerPerson || 0) : '—',
      ]);
    });
    rows.push([]);
  }

  // ==========================================
  // DETAILS SECTION
  // ==========================================
  if (includeDetails && result.details) {
    rows.push(['التفاصيل', 'Details']);
    rows.push(['الخاصية', 'Property', 'القيمة', 'Value']);

    const detailEntries = Object.entries(result.details);
    detailEntries.forEach(([key, value]: [string, any]) => {
      rows.push([key, key, String(value), String(value)]);
    });
    rows.push([]);
  }

  // ==========================================
  // METADATA SECTION
  // ==========================================
  rows.push(['معلومات المستند', 'Document Information']);
  rows.push(['تاريخ الإنشاء', 'Created', new Date().toLocaleString('ar-SA')]);
  rows.push(['الإصدار', 'Version', '5.0']);
  rows.push(['التطبيق', 'Application', 'Inheritance Pro']);

  return {
    rows,
    headers: ['Column A', 'Column B', 'Column C', 'Column D'],
  };
}

/**
 * Convert Excel data to CSV format
 * CSV can be opened in Excel and other spreadsheet applications
 */
export function generateCSVContent(
  result: CalculationResult,
  options: ExcelExportOptions = {}
): string {
  const { rows } = generateExcelData(result, options);

  return rows
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const escaped = cell.replace(/"/g, '""');
          if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
            return `"${escaped}"`;
          }
          return escaped;
        })
        .join(',')
    )
    .join('\n');
}

/**
 * Generate Excel comparison data (if comparing multiple madhabs)
 */
export function generateComparisonExcelData(
  comparisons: MadhhabComparison[],
  estate: number,
  heirs: any[]
): string {
  const rows: string[][] = [];

  rows.push(['مقارنة المذاهب الإسلامية', 'Islamic Madhabs Comparison']);
  rows.push([]);

  // Header row with madhab names
  const headers = ['الوارث / Heir', ...comparisons.map((c) => c.madhab)];
  rows.push(headers);

  // Build a map of heir results by madhab
  const heirsByName = new Map<string, Map<string, any>>();

  comparisons.forEach((comp) => {
    if (comp.result.shares) {
      comp.result.shares.forEach((share: any) => {
        if (!heirsByName.has(share.name)) {
          heirsByName.set(share.name, new Map());
        }
        heirsByName.get(share.name)!.set(comp.madhab, share);
      });
    }
  });

  // Add rows for each heir
  heirsByName.forEach((madhabs, heirName) => {
    const row = [heirName];
    comparisons.forEach((comp) => {
      const share = madhabs.get(comp.madhab);
      if (share) {
        row.push(`${formatPercentage(share.fraction.toDecimal())} - ${formatCurrency(share.amount || 0)}`);
      } else {
        row.push('—');
      }
    });
    rows.push(row);
  });

  return rows
    .map((row) =>
      row
        .map((cell) => {
          const escaped = String(cell).replace(/"/g, '""');
          if (escaped.includes(',') || escaped.includes('"')) {
            return `"${escaped}"`;
          }
          return escaped;
        })
        .join(',')
    )
    .join('\n');
}

/**
 * Download Excel/CSV file to user's device
 */
export function downloadExcelFile(
  content: string,
  filename: string = 'inheritance-calculation.csv'
): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
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
 * Generate Excel from calculation result and trigger download
 */
export function exportToExcel(
  result: CalculationResult,
  options: ExcelExportOptions = {}
): void {
  const filename = options.filename || `inheritance-${new Date().toISOString().slice(0, 10)}.csv`;
  const csvContent = generateCSVContent(result, options);
  downloadExcelFile(csvContent, filename);
}

/**
 * Generate comparison Excel from multiple madhabs and trigger download
 */
export function exportComparisonToExcel(
  comparisons: MadhhabComparison[],
  estate: number,
  heirs: any[],
  filename?: string
): void {
  const finalFilename = filename || `madhabs-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
  const csvContent = generateComparisonExcelData(comparisons, estate, heirs);
  downloadExcelFile(csvContent, finalFilename);
}
