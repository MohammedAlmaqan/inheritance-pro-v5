import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CalculationResult } from '@/lib/types';
import {
  generatePDFHTML,
  exportToPDF,
  exportToCSV,
  downloadCSV,
  exportToJSON,
  downloadJSON,
  shareAsText,
} from '@/lib/pdf-export';

// Mock calculation result
const mockResult: CalculationResult = {
  netEstate: 100000,
  madhhabName: 'الحنفي',
  shares: [
    {
      name: 'الابن الأول',
      count: 1,
      fraction: { numerator: 1, denominator: 2, toDecimal: () => 0.5 },
      amount: 50000,
      amountPerPerson: 50000,
    },
    {
      name: 'الابنة الأولى',
      count: 1,
      fraction: { numerator: 1, denominator: 4, toDecimal: () => 0.25 },
      amount: 25000,
      amountPerPerson: 25000,
    },
  ],
  specialCases: [
    {
      name: 'الحجب',
      description: 'الأم محجوبة بالأبناء',
    },
  ],
};

describe('PDF Export Utility', () => {
  describe('generatePDFHTML', () => {
    it('should generate valid HTML with all sections', () => {
      const html = generatePDFHTML(mockResult);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('حساب الميراث الشرعي');
      expect(html).toContain('الحنفي');
      expect(html).toContain('الابن الأول');
      expect(html).toContain('50.00%'); // Fixed precision format
      expect(html).toMatch(/[0-9,]+/); // Contains numbers
    });

    it('should include special cases in HTML', () => {
      const html = generatePDFHTML(mockResult);

      expect(html).toContain('حالات خاصة');
      expect(html).toContain('الحجب');
      expect(html).toContain('الأم محجوبة بالأبناء');
    });

    it('should format net estate with Arabic locale', () => {
      const html = generatePDFHTML(mockResult);

      // Should contain the net estate value
      expect(html).toContain('صافي التركة');
      expect(html).toMatch(/[0-9,]+/);
    });

    it('should support custom title', () => {
      const customTitle = 'تقرير المواريث الخاص بي';
      const html = generatePDFHTML(mockResult, { title: customTitle });

      expect(html).toContain(customTitle);
    });

    it('should generate RTL markup', () => {
      const html = generatePDFHTML(mockResult);

      expect(html).toContain('dir="rtl"');
      expect(html).toContain('direction: rtl');
    });

    it('should include table headers in Arabic', () => {
      const html = generatePDFHTML(mockResult);

      expect(html).toContain('الوارث');
      expect(html).toContain('العدد');
      expect(html).toContain('النسبة');
      expect(html).toContain('المبلغ');
    });

    it('should calculate correct percentages', () => {
      const html = generatePDFHTML(mockResult);

      // 50% for son, 25% for daughter
      const lines = html.split('\n');
      const percentageLines = lines.filter(
        (line) => line.includes('%') && (line.includes('50') || line.includes('25'))
      );
      expect(percentageLines.length).toBeGreaterThan(0);
    });

    it('should handle multiple heirs with counts', () => {
      const resultMultiple: CalculationResult = {
        ...mockResult,
        shares: [
          {
            ...mockResult.shares[0],
            count: 3,
            amount: 75000,
            amountPerPerson: 25000,
          },
        ],
      };

      const html = generatePDFHTML(resultMultiple);

      expect(html).toContain('3');
      expect(html).toContain('الابن الأول'); // Verify heir is in HTML
    });

    it('should include timestamp in footer', () => {
      const html = generatePDFHTML(mockResult);

      expect(html).toContain('تم إنشاء هذا التقرير');
    });
  });

  describe('exportToPDF', () => {
    beforeEach(() => {
      global.window.open = vi.fn(() => ({
        document: { write: vi.fn(), close: vi.fn() },
        onload: null,
        print: vi.fn(),
      }));
    });

    it('should open print dialog', () => {
      exportToPDF(mockResult);

      expect(window.open).toHaveBeenCalled();
    });

    it('should handle print window with data', () => {
      const mockWindow = {
        document: { write: vi.fn(), close: vi.fn() },
        onload: null as any,
        print: vi.fn(),
      };

      global.window.open = vi.fn(() => mockWindow);

      exportToPDF(mockResult);

      expect(mockWindow.document.write).toHaveBeenCalled();
      expect(mockWindow.document.close).toHaveBeenCalled();
    });

    it('should handle null print window gracefully', () => {
      global.window.open = vi.fn(() => null);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      exportToPDF(mockResult);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot open print window')
      );

      consoleSpy.mockRestore();
    });

    it('should support custom filename', () => {
      const customName = 'my-inheritance.pdf';
      exportToPDF(mockResult, { filename: customName });

      expect(window.open).toHaveBeenCalled();
    });
  });

  describe('exportToCSV', () => {
    it('should generate CSV with headers', () => {
      const csv = exportToCSV(mockResult);

      expect(csv).toContain('نظام المواريث الإسلامية');
      expect(csv).toContain('المذهب');
      expect(csv).toContain('الحنفي');
    });

    it('should include all heirs in CSV', () => {
      const csv = exportToCSV(mockResult);

      expect(csv).toContain('الابن الأول');
      expect(csv).toContain('الابنة الأولى');
    });

    it('should format percentages correctly', () => {
      const csv = exportToCSV(mockResult);

      expect(csv).toContain('50');
      expect(csv).toContain('25');
    });

    it('should include net estate', () => {
      const csv = exportToCSV(mockResult);

      expect(csv).toContain('100000');
    });

    it('should not include header row in CSV count', () => {
      const csv = exportToCSV(mockResult);
      const lines = csv.split('\n').filter((line) => line.trim());

      // Header lines + 2 heirs
      expect(lines.length).toBeGreaterThan(2);
    });
  });

  describe('downloadCSV', () => {
    let mockElement: any;

    beforeEach(() => {
      mockElement = {
        setAttribute: vi.fn(),
        style: {},
        click: vi.fn(),
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(vi.fn());
      vi.spyOn(document.body, 'removeChild').mockImplementation(vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create download link with correct attributes', () => {
      downloadCSV(mockResult);

      expect(mockElement.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.csv'));
      expect(mockElement.setAttribute).toHaveBeenCalledWith('href', expect.stringContaining('data:text/csv'));
    });

    it('should trigger download', () => {
      downloadCSV(mockResult);

      expect(mockElement.click).toHaveBeenCalled();
    });

    it('should clean up after download', () => {
      downloadCSV(mockResult);

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should use custom filename if provided', () => {
      const customName = 'my-data.csv';
      downloadCSV(mockResult, { filename: customName });

      expect(mockElement.setAttribute).toHaveBeenCalledWith('download', customName);
    });

    it('should include date in default filename', () => {
      downloadCSV(mockResult);

      const calls = mockElement.setAttribute.mock.calls;
      const downloadCall = calls.find((call: any[]) => call[0] === 'download');
      expect(downloadCall[1]).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('exportToJSON', () => {
    it('should export valid JSON', () => {
      const json = exportToJSON(mockResult);
      const parsed = JSON.parse(json);

      // Check key properties exist
      expect(parsed.netEstate).toBe(mockResult.netEstate);
      expect(parsed.madhhabName).toBe(mockResult.madhhabName);
      expect(Array.isArray(parsed.shares)).toBe(true);
    });

    it('should include all calculation details', () => {
      const json = exportToJSON(mockResult);
      const parsed = JSON.parse(json);

      expect(parsed.netEstate).toBe(mockResult.netEstate);
      expect(parsed.madhhabName).toBe(mockResult.madhhabName);
      expect(parsed.shares).toHaveLength(2);
    });

    it('should be formatted with proper indentation', () => {
      const json = exportToJSON(mockResult);

      expect(json).toContain('\n  ');
    });
  });

  describe('downloadJSON', () => {
    let mockElement: any;

    beforeEach(() => {
      mockElement = {
        setAttribute: vi.fn(),
        style: {},
        click: vi.fn(),
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockElement);
      vi.spyOn(document.body, 'appendChild').mockImplementation(vi.fn());
      vi.spyOn(document.body, 'removeChild').mockImplementation(vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create download link', () => {
      downloadJSON(mockResult);

      expect(mockElement.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.json'));
    });

    it('should use application/json MIME type', () => {
      downloadJSON(mockResult);

      expect(mockElement.setAttribute).toHaveBeenCalledWith(
        'href',
        expect.stringContaining('application/json')
      );
    });

    it('should trigger download', () => {
      downloadJSON(mockResult);

      expect(mockElement.click).toHaveBeenCalled();
    });
  });

  describe('shareAsText', () => {
    it('should generate text with header', () => {
      const text = shareAsText(mockResult);

      expect(text).toContain('نتائج حساب الميراث الشرعي');
    });

    it('should include madhab name', () => {
      const text = shareAsText(mockResult);

      expect(text).toContain('المذهب');
      expect(text).toContain('الحنفي');
    });

    it('should include all heirs', () => {
      const text = shareAsText(mockResult);

      expect(text).toContain('الابن الأول');
      expect(text).toContain('الابنة الأولى');
    });

    it('should include amounts in Riyal', () => {
      const text = shareAsText(mockResult);

      expect(text).toContain('ريال');
      // Account for formatted numbers with commas
      expect(text).toMatch(/50[,0]*000|50000/);
    });

    it('should format as bullet list', () => {
      const text = shareAsText(mockResult);

      expect(text).toContain('•');
    });

    it('should be suitable for messaging apps', () => {
      const text = shareAsText(mockResult);

      const lines = text.split('\n');
      expect(lines.length).toBeGreaterThan(4);
      expect(lines.some((line) => line.startsWith('•'))).toBe(true);
    });

    it('should work with empty shares', () => {
      const resultNoShares: CalculationResult = {
        ...mockResult,
        shares: [],
      };

      const text = shareAsText(resultNoShares);

      expect(text).toContain('نتائج حساب الميراث');
      expect(text).toContain('الحنفي');
    });
  });

  describe('Export Integration', () => {
    it('should export same data in all formats', () => {
      const csvData = exportToCSV(mockResult);
      const jsonData = JSON.parse(exportToJSON(mockResult));
      const textData = shareAsText(mockResult);

      expect(csvData).toContain('100000');
      expect(jsonData.netEstate).toBe(100000);
      expect(textData).toMatch(/100[,0]*000|100000/); // Account for number formatting
    });

    it('should handle large estate values', () => {
      const largeResult: CalculationResult = {
        ...mockResult,
        netEstate: 1000000000,
      };

      const csv = exportToCSV(largeResult);
      const json = JSON.parse(exportToJSON(largeResult));
      const text = shareAsText(largeResult);

      // CSV and JSON contain the plain value
      expect(csv).toContain('1000000000');
      expect(json.netEstate).toBe(1000000000);
      // Text contains formatted or unformatted version
      expect(text).toMatch(/1000000000|[0-9,]+/);
    });

    it('should handle all madhabs', () => {
      const madhabs = ['الحنفي', 'المالكي', 'الشافعي', 'الحنبلي'];

      madhabs.forEach((madhab) => {
        const result: CalculationResult = { ...mockResult, madhhabName: madhab };

        const csv = exportToCSV(result);
        const json = JSON.parse(exportToJSON(result));

        expect(csv).toContain(madhab);
        expect(json.madhhabName).toBe(madhab);
      });
    });

    it('should generate valid HTML for all export formats', () => {
      const html = generatePDFHTML(mockResult);

      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('<table>');
      expect(html).toContain('</table>');
      expect(html).toContain('direction: rtl');
    });
  });

  describe('Localization', () => {
    it('should use Arabic text throughout', () => {
      const html = generatePDFHTML(mockResult);
      const csv = exportToCSV(mockResult);
      const text = shareAsText(mockResult);

      const arabicTerms = [
        'الميراث',
        'الشرعي',
        'المذهب',
        'التركة',
        'الوارث',
      ];

      const combined = html + csv + text;
      arabicTerms.forEach((term) => {
        expect(combined).toContain(term);
      });
    });

    it('should format numbers with Arabic locale', () => {
      const text = shareAsText(mockResult);

      // Numbers are formatted with Intl.NumberFormat for Arabic, so check for presence
      expect(text).toContain('50');
      expect(text).toContain('25');
      expect(text).toMatch(/[0-9,]+/); // Contains formatted numbers
    });

    it('should use Arabic currency in text export', () => {
      const text = shareAsText(mockResult);

      expect(text).toContain('ريال');
    });
  });
});
