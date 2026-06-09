/**
 * ExportDialog Component
 * Provides UI for users to export calculation results in multiple formats
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { CalculationResult } from '@/lib/types';
import type { MadhhabComparison } from '@/lib/madhab-comparison';
import {
  exportCalculation,
  exportComparison,
  type ExportFormat,
  getFormatLabel,
  getFormatIcon,
  supportsComparison,
} from '@/lib/export-unified';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  comparisons?: MadhhabComparison[];
  estate?: number;
  heirs?: any[];
}

const EXPORT_FORMATS: ExportFormat[] = ['pdf', 'word', 'excel', 'csv', 'json', 'text'];

export function ExportDialog({
  isOpen,
  onClose,
  result,
  comparisons,
  estate,
  heirs,
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [filename, setFilename] = useState('');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeComparison, setIncludeComparison] = useState(!!comparisons?.length);
  const [preview, setPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      if (
        includeComparison &&
        comparisons?.length &&
        supportsComparison(selectedFormat) &&
        estate !== undefined &&
        heirs
      ) {
        // Export comparison
        exportComparison(comparisons, estate, heirs, selectedFormat, filename || undefined);
      } else {
        // Export single calculation
        exportCalculation(result, {
          format: selectedFormat,
          filename: filename || undefined,
          includeSummary,
          includeDetails,
          preview,
        });
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (!preview) {
          onClose();
        }
      }, 2000);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const defaultFilename = `inheritance-${new Date().toISOString().slice(0, 10)}`;
  const fileExtension = selectedFormat === 'excel' ? 'csv' : selectedFormat === 'word' ? 'doc' : selectedFormat;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تصدير النتائج | Export Results</DialogTitle>
            <DialogDescription>
              اختر صيغة التصدير والخيارات المطلوبة | Select format and options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">صيغة التصدير | Export Format</Label>
              <Select value={selectedFormat} onValueChange={(val) => setSelectedFormat(val as ExportFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_FORMATS.map((format) => (
                    <SelectItem key={format} value={format}>
                      <span className="flex items-center gap-2">
                        {getFormatIcon(format)} {getFormatLabel(format)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Format Description */}
              <p className="text-sm text-gray-600">
                {selectedFormat === 'pdf' &&
                  'يمكن الطباعة والمشاركة بسهولة | Easy to print and share'}
                {selectedFormat === 'word' &&
                  'يمكن التحرير في Microsoft Word | Editable in Microsoft Word'}
                {selectedFormat === 'excel' &&
                  'جداول منسقة للتحليل | Formatted tables for analysis'}
                {selectedFormat === 'csv' &&
                  'ملف نصي لاستيراد البيانات | Text file for data import'}
                {selectedFormat === 'json' &&
                  'بيانات منظمة للمبرمجين | Structured data for developers'}
                {selectedFormat === 'text' &&
                  'نص عادي بسيط | Simple plain text'}
              </p>
            </div>

            {/* Filename */}
            <div className="space-y-2">
              <Label htmlFor="filename">اسم الملف | Filename</Label>
              <div className="flex gap-2">
                <Input
                  id="filename"
                  placeholder={defaultFilename}
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 py-2">.{fileExtension}</span>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">خيارات التصدير | Export Options</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="summary"
                  checked={includeSummary}
                  onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
                />
                <Label htmlFor="summary" className="font-normal cursor-pointer">
                  تضمين الملخص | Include Summary
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="details"
                  checked={includeDetails}
                  onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
                />
                <Label htmlFor="details" className="font-normal cursor-pointer">
                  تضمين التفاصيل | Include Details
                </Label>
              </div>

              {comparisons?.length && supportsComparison(selectedFormat) && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="comparison"
                    checked={includeComparison}
                    onCheckedChange={(checked) => setIncludeComparison(checked as boolean)}
                  />
                  <Label htmlFor="comparison" className="font-normal cursor-pointer">
                    تضمين مقارنة المذاهب | Include Madhab Comparison
                  </Label>
                </div>
              )}

              {selectedFormat === 'word' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preview"
                    checked={preview}
                    onCheckedChange={(checked) => setPreview(checked as boolean)}
                  />
                  <Label htmlFor="preview" className="font-normal cursor-pointer">
                    معاينة قبل التصدير | Preview Before Export
                  </Label>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 نصيحة | Tip:</p>
              <p>
                {selectedFormat === 'excel'
                  ? 'استخدم Excel لإجراء مزيد من التحليلات والحسابات'
                  : selectedFormat === 'word'
                    ? 'استخدم Word لإنشاء تقارير احترافية مع تنسيق مخصص'
                    : 'يمكنك استخدام PDF لمشاركة النتائج بسهولة دون تعديل'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isExporting}
                className="flex-1"
              >
                إلغاء | Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isExporting ? 'جاري التصدير...' : 'تصدير | Export'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Message */}
      <AlertDialog open={showSuccess}>
        <AlertDialogContent>
          <AlertDialogTitle>✅ تم التصدير بنجاح | Export Successful</AlertDialogTitle>
          <AlertDialogDescription>
            تم تصدير النتائج بصيغة {getFormatLabel(selectedFormat).toLowerCase()} | Results exported
            as {getFormatLabel(selectedFormat)}
          </AlertDialogDescription>
          <AlertDialogAction onClick={() => setShowSuccess(false)}>
            حسناً | OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Hook for managing export dialog state
 */
export function useExportDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
