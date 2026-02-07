/**
 * Madhab Comparison Card Component
 * Display inheritance calculation differences across all 4 madhabs
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MadhhabComparison } from '@/lib/madhab-comparison';
import { exportComparisonToPDF, downloadComparisonJSON, shareComparisonAsText } from '@/lib/pdf-export';
import { CheckCircle2, AlertCircle, Download, FileText, Share2, Printer } from 'lucide-react';
import { announceToScreenReader } from '@/lib/accessibility';

interface MadhhabComparisonCardProps {
  comparison: MadhhabComparison;
}

const MADHAB_COLORS: Record<string, string> = {
  hanafi: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-700',
  maliki: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-700',
  shafii: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-700',
  hanbali: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-700',
};

const MADHAB_BADGE_COLORS: Record<string, string> = {
  hanafi: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  maliki: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  shafii: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  hanbali: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
};

const MADHAB_NAMES: Record<string, string> = {
  hanafi: 'الحنفية',
  maliki: 'المالكية',
  shafii: 'الشافعية',
  hanbali: 'الحنابلة',
};

export function MadhhabComparisonCard({ comparison }: MadhhabComparisonCardProps) {
  const { madhabs, consistent, differences } = comparison;

  return (
    <Card className="w-full" role="region" aria-labelledby="comparison-title">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl" id="comparison-title">مقارنة المذاهب الفقهية</CardTitle>
            <CardDescription id="comparison-desc">
              مقارنة نتائج الحساب عبر المذاهب الفقهية الأربعة
            </CardDescription>
          </div>
          {consistent ? (
            <Badge 
              className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              aria-label="النتائج متسقة في جميع المذاهب"
            >
              <CheckCircle2 className="h-4 w-4" />
              متسق
            </Badge>
          ) : (
            <Badge 
              className="flex items-center gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
              aria-label="توجد اختلافات بين المذاهب"
            >
              <AlertCircle className="h-4 w-4" />
              اختلافات
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4" 
          role="grid" 
          aria-labelledby="summary-title"
          aria-describedby="comparison-desc"
        >
          <div id="summary-title" className="sr-only">ملخص النتائج للمذاهب الأربعة</div>
          {Object.entries(madhabs).map(([madhab, result]) => (
            <div
              key={madhab}
              className={`p-4 rounded-lg border ${MADHAB_COLORS[madhab as keyof typeof MADHAB_COLORS]}`}
              role="gridcell"
              aria-label={`${MADHAB_NAMES[madhab as keyof typeof MADHAB_NAMES]}: ${result.success ? `صافي التركة ${result.netEstate.toLocaleString('ar-SA')} ريال` : 'خطأ في الحساب'}`}
            >
              <div className="flex flex-col gap-2">
                <Badge 
                  className={MADHAB_BADGE_COLORS[madhab as keyof typeof MADHAB_BADGE_COLORS]}
                  aria-hidden="false"
                >
                  {MADHAB_NAMES[madhab as keyof typeof MADHAB_NAMES]}
                </Badge>

                {result.success ? (
                  <>
                    <div className="text-sm">
                      <p className="text-xs opacity-75 mb-1">صافي التركة</p>
                      <p className="font-semibold text-lg" aria-live="polite">
                        {result.netEstate.toLocaleString('ar-SA')}
                      </p>
                    </div>

                    <div className="text-sm border-t pt-2">
                      <p className="text-xs opacity-75">الوارثون</p>
                      <p className="font-semibold" aria-label={`عدد الوارثين: ${result.shares.length}`}>
                        {result.shares.length}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-red-600 dark:text-red-400" role="alert">
                    <p className="text-sm font-medium">خطأ في الحساب</p>
                    <p className="text-xs mt-1">{result.error}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Comparison Tabs */}
        {differences.length > 0 && (
          <div role="region" aria-labelledby="differences-title">
            <h3 className="font-semibold mb-3" id="differences-title">الاختلافات المكتشفة</h3>
            <p className="text-sm text-slate-600 mb-4" aria-live="polite">
              عدد الاختلافات: {differences.length}
            </p>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2" role="tablist">
                <TabsTrigger 
                  value="summary" 
                  role="tab"
                  aria-selected
                  aria-controls="summary-content"
                  id="summary-tab"
                >
                  ملخص
                </TabsTrigger>
                <TabsTrigger 
                  value="detailed"
                  role="tab"
                  aria-controls="detailed-content"
                  id="detailed-tab"
                >
                  تفصيلي
                </TabsTrigger>
              </TabsList>

              <TabsContent 
                value="summary" 
                className="space-y-2 mt-4"
                role="tabpanel"
                id="summary-content"
                aria-labelledby="summary-tab"
              >
                <div role="list" aria-label="ملخص الاختلافات">
                  {differences.slice(0, 5).map((diff, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30"
                      role="listitem"
                      aria-label={`${diff.heir}: ${diff.madhab} - الفرق ${diff.amount.toLocaleString('ar-SA')} ريال`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{diff.heir}</p>
                          <p className="text-xs opacity-75 mt-1">{diff.madhab}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-amber-700 dark:text-amber-300">
                            {diff.amount.toLocaleString('ar-SA')}
                          </p>
                          <p className="text-xs opacity-75">
                            {(diff.percentage * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {differences.length > 5 && (
                  <p className="text-xs text-center opacity-75 pt-2" aria-live="polite">
                    ... وهناك {differences.length - 5} اختلافات أخرى - اضغط على تفصيلي لعرض الكل
                  </p>
                )}
              </TabsContent>

              <TabsContent 
                value="detailed" 
                className="space-y-3 mt-4 max-h-96 overflow-y-auto"
                role="tabpanel"
                id="detailed-content"
                aria-labelledby="detailed-tab"
              >
                <div role="list" aria-label="الاختلافات المفصلة">
                  {differences.map((diff, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30"
                      role="listitem"
                      aria-label={`${diff.heir} في مذهب ${diff.madhab}: الفرق ${diff.amount.toLocaleString('ar-SA')} ريال بنسبة ${(diff.percentage * 100).toFixed(2)}%`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium">{diff.heir}</p>
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                          {diff.madhab}
                        </span>
                      </div>
                      <p className="text-sm">
                        الفرق:{' '}
                        <span className="font-semibold">
                          {diff.amount.toLocaleString('ar-SA')}
                        </span>
                      </p>
                      <p className="text-xs opacity-75 mt-1">
                        النسبة: {(diff.percentage * 100).toFixed(2)}%
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Consistency Message */}
        {consistent && (
          <div 
            className="p-3 rounded bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
            role="status"
            aria-live="polite"
            aria-label="تنبيه: النتائج متسقة"
          >
            <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              النتائج متسقة في جميع المذاهب الفقهية
            </p>
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex gap-2 flex-wrap pt-4 border-t" role="group" aria-label="خيارات التصدير والمشاركة">
          <Button 
            onClick={() => {
              exportComparisonToPDF(comparison);
              announceToScreenReader('تم تحضير المقارنة للطباعة');
            }}
            variant="outline" 
            size="sm" 
            className="flex-1 min-w-20"
            aria-label="طباعة مقارنة المذاهب"
          >
            <Printer className="mr-2 h-4 w-4" />
            طباعة
          </Button>
          <Button 
            onClick={() => {
              downloadComparisonJSON(comparison);
              announceToScreenReader('تم تحميل ملف JSON');
            }}
            variant="outline" 
            size="sm" 
            className="flex-1 min-w-20"
            aria-label="تحميل المقارنة كملف JSON"
          >
            <FileText className="mr-2 h-4 w-4" />
            JSON
          </Button>
          <Button 
            onClick={() => {
              const text = shareComparisonAsText(comparison);
              if (navigator.share) {
                navigator.share({
                  title: 'مقارنة المذاهب الفقهية',
                  text: text,
                }).catch(console.error);
              } else {
                navigator.clipboard.writeText(text).catch(() => {
                  alert('تم نسخ النتائج إلى الحافظة');
                });
              }
              announceToScreenReader('تم مشاركة المقارنة');
            }}
            variant="outline" 
            size="sm" 
            className="flex-1 min-w-20"
            aria-label="مشاركة المقارنة"
          >
            <Share2 className="mr-2 h-4 w-4" />
            مشاركة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
