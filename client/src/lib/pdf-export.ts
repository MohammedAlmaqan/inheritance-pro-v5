/**
 * PDF Export Utility
 * Generates formatted PDF documents with inheritance calculation results
 */

import type { CalculationResult } from '@/lib/types';
import type { MadhhabComparison } from '@/lib/madhab-comparison';

export interface PDFOptions {
  title?: string;
  filename?: string;
  includeDetails?: boolean;
  includeHistory?: boolean;
}

/**
 * Generate HTML for PDF rendering
 * Includes detailed calculation results with formatting
 */
export function generatePDFHTML(result: CalculationResult, options: PDFOptions = {}): string {
  const {
    title = 'حساب الميراث الشرعي',
    includeDetails = true,
  } = options;

  const netEstate = result.netEstate.toLocaleString('ar-SA');
  const madhab = result.madhhabName;

  let sharesHTML = '';
  if (result.shares && result.shares.length > 0) {
    sharesHTML = result.shares
      .map((share: any) => {
        const percentage = (share.fraction.toDecimal() * 100).toFixed(2);
        const amount = (share.amount || 0).toLocaleString('ar-SA');
        const perPerson = share.count > 1 ? (share.amountPerPerson || 0).toLocaleString('ar-SA') : '—';

        return `
          <tr>
            <td>${share.name}</td>
            <td>${share.count || 1}</td>
            <td>${percentage}%</td>
            <td>${amount}</td>
            <td>${perPerson}</td>
          </tr>
        `;
      })
      .join('');
  }

  let specialCasesHTML = '';
  if (result.specialCases && result.specialCases.length > 0) {
    specialCasesHTML = `
      <div class="special-cases">
        <h3>حالات خاصة:</h3>
        <ul>
          ${result.specialCases
            .map((c: any) => `<li><strong>${c.name}:</strong> ${c.description}</li>`)
            .join('')}
        </ul>
      </div>
    `;
  }

  const timestamp = new Date().toLocaleString('ar-SA');

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; }
        body {
          font-family: 'Arial', sans-serif;
          background: white;
          padding: 40px;
          direction: rtl;
          color: #1f2937;
          line-height: 1.6;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #10b981;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 28px;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .header p {
          font-size: 14px;
          color: #6b7280;
        }
        .madhab-info {
          background: #f3f4f6;
          padding: 15px;
          border-right: 4px solid #10b981;
          margin-bottom: 25px;
          border-radius: 4px;
        }
        .madhab-info h3 {
          color: #10b981;
          margin-bottom: 5px;
        }
        .madhab-info p {
          font-size: 14px;
          color: #1f2937;
        }
        .estate-summary {
          background: #ecfdf5;
          padding: 20px;
          border-radius: 4px;
          margin-bottom: 25px;
          text-align: center;
        }
        .estate-summary h3 {
          color: #065f46;
          margin-bottom: 10px;
        }
        .net-estate {
          font-size: 24px;
          font-weight: bold;
          color: #10b981;
        }
        .net-estate-label {
          font-size: 14px;
          color: #6b7280;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        table thead {
          background: #10b981;
          color: white;
        }
        table th {
          padding: 12px;
          text-align: right;
          font-weight: 600;
          font-size: 14px;
        }
        table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          text-align: right;
          font-size: 14px;
        }
        table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        table tbody tr:hover {
          background: #f3f4f6;
        }
        .special-cases {
          background: #eff6ff;
          padding: 15px;
          border-right: 4px solid #3b82f6;
          border-radius: 4px;
          margin-bottom: 25px;
        }
        .special-cases h3 {
          color: #1e40af;
          margin-bottom: 10px;
        }
        .special-cases ul {
          list-style: none;
          padding-right: 0;
        }
        .special-cases li {
          padding: 8px 0;
          color: #1f2937;
          font-size: 14px;
        }
        .footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        .timestamp {
          margin-top: 10px;
          font-size: 12px;
          color: #9ca3af;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
          <p>نظام حساب المواريث الشرعي</p>
        </div>

        <div class="madhab-info">
          <h3>المذهب الفقهي:</h3>
          <p>${madhab}</p>
        </div>

        <div class="estate-summary">
          <h3>صافي التركة</h3>
          <div class="net-estate">${netEstate}</div>
          <div class="net-estate-label">ريال سعودي</div>
        </div>

        <h2 style="margin-bottom: 15px; color: #1f2937; font-size: 18px;">توزيع الحصص</h2>
        <table>
          <thead>
            <tr>
              <th>الوارث</th>
              <th>العدد</th>
              <th>النسبة</th>
              <th>المبلغ</th>
              <th>للفرد الواحد</th>
            </tr>
          </thead>
          <tbody>
            ${sharesHTML}
          </tbody>
        </table>

        ${specialCasesHTML}

        <div class="footer">
          <p>تم إنشاء هذا التقرير باستخدام تطبيق حساب المواريث الشرعي</p>
          <div class="timestamp">${timestamp}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Export calculation as PDF
 * Opens print dialog or downloads as PDF
 */
export function exportToPDF(result: CalculationResult, options: PDFOptions = {}) {
  const { filename = `inheritance-${new Date().toISOString().split('T')[0]}.pdf` } = options;

  const html = generatePDFHTML(result, options);
  const printWindow = window.open('', '', 'width=1200,height=800');

  if (!printWindow) {
    console.error('Cannot open print window. Check browser pop-up settings.');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Export as CSV for spreadsheet applications
 */
export function exportToCSV(result: CalculationResult, options: PDFOptions = {}): string {
  const { filename = `inheritance-${new Date().toISOString().split('T')[0]}.csv` } = options;

  let csv = 'نظام المواريث الإسلامية\n';
  csv += `المذهب,${result.madhhabName}\n`;
  csv += `صافي التركة,${result.netEstate}\n`;
  csv += `التاريخ,${new Date().toLocaleString('ar-SA')}\n\n`;
  csv += 'الوارث,العدد,النسبة,المبلغ,المبلغ للفرد\n';

  if (result.shares && result.shares.length > 0) {
    result.shares.forEach((share: any) => {
      const percentage = (share.fraction.toDecimal() * 100).toFixed(2);
      const amount = share.amount || 0;
      const perPerson = share.amountPerPerson || 0;
      csv += `${share.name},${share.count || 1},${percentage}%,${amount},${perPerson}\n`;
    });
  }

  return csv;
}

/**
 * Download CSV file
 */
export function downloadCSV(result: CalculationResult, options: PDFOptions = {}) {
  const { filename = `inheritance-${new Date().toISOString().split('T')[0]}.csv` } = options;

  const csv = exportToCSV(result, options);
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(csv)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Export as JSON for data backup/sharing
 */
export function exportToJSON(result: CalculationResult, options: PDFOptions = {}): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Download JSON file
 */
export function downloadJSON(result: CalculationResult, options: PDFOptions = {}) {
  const { filename = `inheritance-${new Date().toISOString().split('T')[0]}.json` } = options;

  const json = exportToJSON(result, options);
  const element = document.createElement('a');
  element.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(json)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Share calculation via text format (for messaging apps, email, etc)
 */
export function shareAsText(result: CalculationResult): string {
  let text = `نتائج حساب الميراث الشرعي\n`;
  text += `المذهب: ${result.madhhabName}\n`;
  text += `صافي التركة: ${result.netEstate.toLocaleString()}\n\n`;
  text += `توزيع الحصص:\n`;

  if (result.shares && result.shares.length > 0) {
    result.shares.forEach((share: any) => {
      const percentage = (share.fraction.toDecimal() * 100).toFixed(2);
      const amount = share.amount || 0;
      text += `• ${share.name}: ${percentage}% (${amount.toLocaleString()} ريال)\n`;
    });
  }

  return text;
}

export function generateComparisonPDFHTML(comparison: MadhhabComparison, options: PDFOptions = {}): string {
  const { title = 'مقارنة نتائج الحساب عبر المذاهب الفقهية الأربعة' } = options;

  let html = `<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Traditional Arabic', Arial; direction: rtl; margin: 20px; }
    h1 { text-align: center; color: #1f2937; }
    h2 { color: #374151; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
    th { background-color: #f3f4f6; font-weight: bold; }
    .madhab-header { background-color: #e8eaf6; font-weight: bold; }
    .consistent { color: green; font-weight: bold; }
    .inconsistent { color: #d97706; font-weight: bold; }
    .difference { background-color: #fef3c7; }
  </style>
</head>
<body>
  <h1>${title}</h1>`;

  // Summary section
  html += '<h2>ملخص المقارنة</h2>';
  html += '<table>';
  html += '<tr><th>المذهب</th><th>الحالة</th><th>صافي التركة</th><th>عدد الورثة</th></tr>';

  Object.entries(comparison.madhabs).forEach(([_key, result]) => {
    const status = result.success ? 'نجح' : `فشل: ${result.error}`;
    html += `<tr>
      <td class="madhab-header">${result.madhhabName}</td>
      <td>${status}</td>
      <td>${result.netEstate.toLocaleString()}</td>
      <td>${result.shares.length}</td>
    </tr>`;
  });

  html += '</table>';

  // Consistency section
  html += '<h2>التحليل الشامل</h2>';
  html += `<p><strong>النتيجة:</strong> 
    <span class="${comparison.consistent ? 'consistent' : 'inconsistent'}">
      ${comparison.consistent ? 'النتائج متسقة' : 'هناك اختلافات بين المذاهب'}
    </span>
  </p>`;

  // Differences section
  if (comparison.differences.length > 0) {
    html += '<h2>الاختلافات المكتشفة</h2>';
    html += '<table>';
    html += '<tr><th>الوارث</th><th>المذهب</th><th>المبلغ</th><th>النسبة</th></tr>';

    comparison.differences.forEach((diff) => {
      html += `<tr class="difference">
        <td>${diff.heir}</td>
        <td>${diff.madhab}</td>
        <td>${diff.amount.toLocaleString()}</td>
        <td>${(diff.percentage * 100).toFixed(2)}%</td>
      </tr>`;
    });

    html += '</table>';
  }

  html += '</body></html>';
  return html;
}

export function exportComparisonToPDF(comparison: MadhhabComparison, options: PDFOptions = {}) {
  const html = generateComparisonPDFHTML(comparison, options);
  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

export function exportComparisonToJSON(comparison: MadhhabComparison, options: PDFOptions = {}): string {
  return JSON.stringify(comparison, null, 2);
}

export function downloadComparisonJSON(comparison: MadhhabComparison, options: PDFOptions = {}) {
  const json = exportComparisonToJSON(comparison, options);
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(json)}`);
  element.setAttribute('download', `madhab-comparison-${new Date().toISOString().split('T')[0]}.json`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export function shareComparisonAsText(comparison: MadhhabComparison): string {
  let text = 'مقارنة نتائج الحساب عبر المذاهب الفقهية الأربعة\n\n';
  text += `النتيجة: ${comparison.consistent ? 'متسقة' : 'هناك اختلافات'}\n\n`;

  text += 'ملخص المذاهب:\n';
  Object.entries(comparison.madhabs).forEach(([_key, result]) => {
    if (result.success) {
      text += `${result.madhhabName}: صافي التركة ${result.netEstate.toLocaleString()}, عدد الورثة ${result.shares.length}\n`;
    }
  });

  if (comparison.differences.length > 0) {
    text += `\nالاختلافات المكتشفة (${comparison.differences.length}):\n`;
    comparison.differences.forEach((diff) => {
      text += `• ${diff.heir} - ${diff.madhab}: ${diff.amount.toLocaleString()} (${(diff.percentage * 100).toFixed(2)}%)\n`;
    });
  }

  return text;
}

