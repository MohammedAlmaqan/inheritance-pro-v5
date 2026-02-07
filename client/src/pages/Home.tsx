import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { validateEstate, validateHeirs } from '@/lib/validation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calculateInheritance } from '@/lib/inheritance-engine';
import { FIQH_DATABASE, Madhab } from '@/lib/fiqh-database';
import { exportToPDF, downloadCSV, downloadJSON, shareAsText } from '@/lib/pdf-export';
import { compareAllMadhabs } from '@/lib/madhab-comparison';
import type { MadhhabComparison } from '@/lib/madhab-comparison';
import { ScenariosDialog } from '@/components/ScenariosDialog';
import { MadhhabComparisonCard } from '@/components/MadhhabComparisonCard';
import { AlertCircle, Calculator, Download, Printer, CheckCircle, FileText, Share2, Zap } from 'lucide-react';
import { createInputAriaAttributes, createButtonAriaAttributes, announceToScreenReader } from '@/lib/accessibility';
import { usePreventBodyScroll } from '@/hooks/useKeyboardNavigation';

export default function Home() {
  // Local state for error handling and UI
  const [errors, setErrors] = useState<string[]>([]);
  const [comparison, setComparison] = useState<MadhhabComparison | null>(null);

  // Store selectors
  const madhab = useAppStore((state) => state.madhab);
  const estate = useAppStore((state) => state.estate);
  const heirs = useAppStore((state) => state.heirs);
  const result = useAppStore((state) => state.result);
  const isCalculating = useAppStore((state) => state.isCalculating);

  // Store actions
  const setMadhab = useAppStore((state) => state.setMadhab);
  const setEstate = useAppStore((state) => state.setEstate);
  const setHeirs = useAppStore((state) => state.setHeirs);
  const setResult = useAppStore((state) => state.setResult);
  const setIsCalculating = useAppStore((state) => state.setIsCalculating);
  const resetAll = useAppStore((state) => state.resetAll);
  const addToHistory = useAppStore((state) => state.addToHistory);

  const handleEstateChange = (field: keyof typeof estate, value: number) => {
    const newEstate = { ...estate, [field]: Math.max(0, value) };
    setEstate(newEstate);

    // Validate on change
    const validation = validateEstate(newEstate);
    if (!validation.success && validation.errors) {
      setErrors(validation.errors.map((e) => `${e.field}: ${e.message}`));
    } else {
      setErrors([]);
    }
  };

  const handleHeirChange = (field: keyof typeof heirs, value: number) => {
    const newHeirs = { ...heirs, [field]: Math.max(0, value) };
    setHeirs(newHeirs);

    // Validate on change
    const validation = validateHeirs(newHeirs);
    if (!validation.success && validation.errors) {
      setErrors(validation.errors.map((e) => `${e.field}: ${e.message}`));
    } else {
      setErrors([]);
    }
  };

  const handleCalculate = async () => {
    // Clear previous errors
    setErrors([]);

    // Validate inputs
    const estateValidation = validateEstate(estate);
    const heirsValidation = validateHeirs(heirs);

    if (!estateValidation.success && estateValidation.errors) {
      setErrors(estateValidation.errors.map((e) => `التركة: ${e.message}`));
      return;
    }

    if (!heirsValidation.success && heirsValidation.errors) {
      setErrors(heirsValidation.errors.map((e) => `الورثة: ${e.message}`));
      return;
    }

    setIsCalculating(true);
    try {
      const calculationResult = calculateInheritance(madhab, estate, heirs);
      setResult(calculationResult);

      // Add to history if successful
      if (calculationResult.success) {
        addToHistory(calculationResult);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      setErrors([`خطأ في الحساب: ${errorMessage}`]);
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePrint = () => {
    if (!result) return;
    exportToPDF(result, { title: 'طباعة نتائج الميراث الشرعي' });
  };

  const handleDownloadCSV = () => {
    if (!result || !result.success) return;
    downloadCSV(result, { filename: `inheritance-${new Date().toISOString().split('T')[0]}.csv` });
  };

  const handleDownloadJSON = () => {
    if (!result || !result.success) return;
    downloadJSON(result, { filename: `inheritance-${new Date().toISOString().split('T')[0]}.json` });
  };

  const handleShare = () => {
    if (!result || !result.success) return;
    
    const text = shareAsText(result);
    if (navigator.share) {
      navigator.share({
        title: 'نتائج الميراث الشرعي',
        text: text,
      }).catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text).catch(() => {
        alert('تم نسخ النتائج إلى الحافظة');
      });
    }
  };

  const handleComparison = async () => {
    // Validate inputs first
    const estateValidation = validateEstate(estate);
    const heirsValidation = validateHeirs(heirs);

    if (!estateValidation.success || !heirsValidation.success) {
      setErrors(['يرجى إدخال بيانات صحيحة قبل المقارنة']);
      return;
    }

    try {
      setIsCalculating(true);
      const result = compareAllMadhabs(estate, heirs);
      setComparison(result);
      setErrors([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في المقارنة';
      setErrors([`خطأ: ${errorMessage}`]);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    resetAll();
    setErrors([]);
    setComparison(null);
  };

  const handleScenarioSelect = (state: { madhab: Madhab; estate: typeof estate; heirs: typeof heirs }) => {
    // Apply scenario data to state
    setMadhab(state.madhab);
    setEstate(state.estate);
    setHeirs(state.heirs);
    setErrors([]);
    // Clear previous result
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-2" id="page-title">نظام المواريث الإسلامية</h1>
          <p className="text-base sm:text-lg text-slate-600 px-2 sm:px-0" id="page-description">حاسبة دقيقة وشاملة لتوزيع الميراث وفقاً للمذاهب الفقهية الأربعة</p>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-4 sm:mb-6" role="alert" aria-live="polite" aria-labelledby="error-title">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription>
              <h2 id="error-title" className="font-bold text-sm mb-2">الأخطاء:</h2>
              <ul className="space-y-1">
                {errors.map((error: string, idx: number) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Start with Scenarios */}
            <ScenariosDialog onScenarioSelect={handleScenarioSelect} />

            {/* Madhab Selection */}
            <Card>
              <CardHeader>
                <CardTitle id="madhab-title">اختر المذهب الفقهي</CardTitle>
                <CardDescription>اختر المذهب الذي تريد تطبيق أحكامه</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:gap-3" role="radiogroup" aria-labelledby="madhab-title" aria-live="polite">
                  {Object.entries(FIQH_DATABASE.madhabs).map(([key, madhab_option]) => (
                    <Button
                      key={key}
                      variant={madhab_option.id === madhab ? 'default' : 'outline'}
                      className="text-right text-sm sm:text-base h-10 sm:h-11"
                      onClick={() => {
                        setMadhab(madhab_option.id as Madhab);
                        announceToScreenReader(`تم تحديد المذهب: ${madhab_option.name}`);
                      }}
                      role="radio"
                      aria-checked={madhab_option.id === madhab}
                      aria-label={madhab_option.name}
                    >
                      <span className="mr-1 sm:mr-2 text-lg">{madhab_option.icon}</span>
                      <span className="hidden sm:inline">{madhab_option.name}</span>
                      <span className="sm:hidden text-xs">{madhab_option.name.split(' ')[0]}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estate Input */}
            <Card>
              <CardHeader>
                <CardTitle id="estate-title">بيانات التركة</CardTitle>
                <CardDescription>أدخل قيمة التركة والخصومات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" role="group" aria-labelledby="estate-title">
                  <div>
                    <Label htmlFor="total" className="text-sm sm:text-base">إجمالي التركة</Label>
                    <Input
                      id="total"
                      type="number"
                      value={estate.total}
                      onChange={(e) => handleEstateChange('total', Number(e.target.value))}
                      className="mt-1 h-10 sm:h-11"
                      aria-describedby="total-help"
                      inputMode="decimal"
                    />
                    <small id="total-help" className="text-xs text-slate-500">ادخل المبلغ الكلي للتركة</small>
                  </div>
                  <div>
                    <Label htmlFor="funeral" className="text-sm sm:text-base">تكاليف التجهيز</Label>
                    <Input
                      id="funeral"
                      type="number"
                      value={estate.funeral}
                      onChange={(e) => handleEstateChange('funeral', Number(e.target.value))}
                      className="mt-1 h-10 sm:h-11"
                      aria-describedby="funeral-help"
                      inputMode="decimal"
                    />
                    <small id="funeral-help" className="text-xs text-slate-500">تكاليف تجهيز الميت</small>
                  </div>
                  <div>
                    <Label htmlFor="debts" className="text-sm sm:text-base">الديون</Label>
                    <Input
                      id="debts"
                      type="number"
                      value={estate.debts}
                      onChange={(e) => handleEstateChange('debts', Number(e.target.value))}
                      className="mt-1 h-10 sm:h-11"
                      aria-describedby="debts-help"
                      inputMode="decimal"
                    />
                    <small id="debts-help" className="text-xs text-slate-500">الديون التي على المتوفى</small>
                  </div>
                  <div>
                    <Label htmlFor="will" className="text-sm sm:text-base">الوصية</Label>
                    <Input
                      id="will"
                      type="number"
                      value={estate.will}
                      onChange={(e) => handleEstateChange('will', Number(e.target.value))}
                      className="mt-1 h-10 sm:h-11"
                      aria-describedby="will-help"
                      inputMode="decimal"
                    />
                    <small id="will-help" className="text-xs text-slate-500">قيمة الوصية اختياري</small>
                  </div>
                </div>
                <div className="bg-blue-50 p-2 sm:p-3 rounded-lg" aria-live="polite" aria-atomic="true">
                  <p className="text-xs sm:text-sm text-slate-700">
                    <strong>صافي التركة:</strong> <span aria-label="صافي التركة">{(estate.total - estate.funeral - estate.debts - estate.will).toLocaleString()}</span> ريال
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Heirs Input */}
            <Card>
              <CardHeader>
                <CardTitle id="heirs-title">الورثة</CardTitle>
                <CardDescription>أدخل عدد الورثة في كل فئة</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ascendants" className="w-full" aria-labelledby="heirs-title">
                  <TabsList className="grid w-full grid-cols-4" role="tablist">
                    <TabsTrigger value="ascendants" role="tab" aria-selected aria-controls="ascendants-content" id="ascendants-tab">الأصول</TabsTrigger>
                    <TabsTrigger value="descendants" role="tab" aria-controls="descendants-content" id="descendants-tab">الفروع</TabsTrigger>
                    <TabsTrigger value="siblings" role="tab" aria-controls="siblings-content" id="siblings-tab">الإخوة</TabsTrigger>
                    <TabsTrigger value="others" role="tab" aria-controls="others-content" id="others-tab">الآخرون</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ascendants" className="space-y-3 mt-4" role="tabpanel" id="ascendants-content" aria-labelledby="ascendants-tab">
                    <HeirInput label="الزوج" value={heirs.husband} onChange={(v) => handleHeirChange('husband', v)} id="heir-husband" />
                    <HeirInput label="الزوجة" value={heirs.wife} onChange={(v) => handleHeirChange('wife', v)} id="heir-wife" />
                    <HeirInput label="الأب" value={heirs.father} onChange={(v) => handleHeirChange('father', v)} id="heir-father" />
                    <HeirInput label="الأم" value={heirs.mother} onChange={(v) => handleHeirChange('mother', v)} id="heir-mother" />
                    <HeirInput label="الجد" value={heirs.grandfather} onChange={(v) => handleHeirChange('grandfather', v)} id="heir-grandfather" />
                    <HeirInput label="الجدة لأب" value={heirs.grandmother_father} onChange={(v) => handleHeirChange('grandmother_father', v)} id="heir-grandmother-father" />
                    <HeirInput label="الجدة لأم" value={heirs.grandmother_mother} onChange={(v) => handleHeirChange('grandmother_mother', v)} id="heir-grandmother-mother" />
                  </TabsContent>

                  <TabsContent value="descendants" className="space-y-3 mt-4" role="tabpanel" id="descendants-content" aria-labelledby="descendants-tab">
                    <HeirInput label="الابن" value={heirs.son} onChange={(v) => handleHeirChange('son', v)} id="heir-son" />
                    <HeirInput label="البنت" value={heirs.daughter} onChange={(v) => handleHeirChange('daughter', v)} id="heir-daughter" />
                    <HeirInput label="ابن الابن" value={heirs.grandson} onChange={(v) => handleHeirChange('grandson', v)} id="heir-grandson" />
                    <HeirInput label="بنت الابن" value={heirs.granddaughter} onChange={(v) => handleHeirChange('granddaughter', v)} id="heir-granddaughter" />
                  </TabsContent>

                  <TabsContent value="siblings" className="space-y-3 mt-4" role="tabpanel" id="siblings-content" aria-labelledby="siblings-tab">
                    <HeirInput label="الأخ الشقيق" value={heirs.full_brother} onChange={(v) => handleHeirChange('full_brother', v)} id="heir-full-brother" />
                    <HeirInput label="الأخت الشقيقة" value={heirs.full_sister} onChange={(v) => handleHeirChange('full_sister', v)} id="heir-full-sister" />
                    <HeirInput label="الأخ لأب" value={heirs.paternal_brother} onChange={(v) => handleHeirChange('paternal_brother', v)} id="heir-paternal-brother" />
                    <HeirInput label="الأخت لأب" value={heirs.paternal_sister} onChange={(v) => handleHeirChange('paternal_sister', v)} id="heir-paternal-sister" />
                    <HeirInput label="الأخ لأم" value={heirs.maternal_brother} onChange={(v) => handleHeirChange('maternal_brother', v)} id="heir-maternal-brother" />
                    <HeirInput label="الأخت لأم" value={heirs.maternal_sister} onChange={(v) => handleHeirChange('maternal_sister', v)} id="heir-maternal-sister" />
                  </TabsContent>

                  <TabsContent value="others" className="space-y-3 mt-4" role="tabpanel" id="others-content" aria-labelledby="others-tab">
                    <HeirInput label="ابن الأخ الشقيق" value={heirs.full_nephew} onChange={(v) => handleHeirChange('full_nephew', v)} id="heir-full-nephew" />
                    <HeirInput label="ابن الأخ لأب" value={heirs.paternal_nephew} onChange={(v) => handleHeirChange('paternal_nephew', v)} id="heir-paternal-nephew" />
                    <HeirInput label="العم الشقيق" value={heirs.full_uncle} onChange={(v) => handleHeirChange('full_uncle', v)} id="heir-full-uncle" />
                    <HeirInput label="العم لأب" value={heirs.paternal_uncle} onChange={(v) => handleHeirChange('paternal_uncle', v)} id="heir-paternal-uncle" />
                    <HeirInput label="ابن العم الشقيق" value={heirs.full_cousin} onChange={(v) => handleHeirChange('full_cousin', v)} id="heir-full-cousin" />
                    <HeirInput label="ابن العم لأب" value={heirs.paternal_cousin} onChange={(v) => handleHeirChange('paternal_cousin', v)} id="heir-paternal-cousin" />
                    <HeirInput label="الخال" value={heirs.maternal_uncle} onChange={(v) => handleHeirChange('maternal_uncle', v)} id="heir-maternal-uncle" />
                    <HeirInput label="الخالة" value={heirs.maternal_aunt} onChange={(v) => handleHeirChange('maternal_aunt', v)} id="heir-maternal-aunt" />
                    <HeirInput label="العمة" value={heirs.paternal_aunt} onChange={(v) => handleHeirChange('paternal_aunt', v)} id="heir-paternal-aunt" />
                    <HeirInput label="ابن البنت" value={heirs.daughter_son} onChange={(v) => handleHeirChange('daughter_son', v)} id="heir-daughter-son" />
                    <HeirInput label="بنت البنت" value={heirs.daughter_daughter} onChange={(v) => handleHeirChange('daughter_daughter', v)} id="heir-daughter-daughter" />
                    <HeirInput label="أولاد الأخت" value={heirs.sister_children ?? 0} onChange={(v) => handleHeirChange('sister_children', v)} id="heir-sister-children" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-3 flex-wrap" role="group" aria-label="إجراءات الحساب والميراث">
              <Button 
                onClick={handleCalculate} 
                disabled={isCalculating} 
                className="flex-1 min-w-[120px] sm:min-w-32 h-11 sm:h-12 text-sm sm:text-base" 
                size="lg"
                aria-busy={isCalculating}
                aria-label={isCalculating ? "جاري حساب الميراث" : "احسب توزيع الميراث"}
              >
                <Calculator className="mr-2 h-4 w-4 flex-shrink-0" />
                {isCalculating ? 'جاري الحساب...' : 'احسب الميراث'}
              </Button>
              <Button 
                onClick={handleComparison} 
                disabled={isCalculating} 
                variant="secondary" 
                className="flex-1 min-w-[120px] sm:min-w-32 h-11 sm:h-12 text-sm sm:text-base" 
                size="lg"
                aria-busy={isCalculating}
                aria-label="مقارنة التوزيع بين المذاهب الشرعية"
              >
                <Zap className="mr-2 h-4 w-4 flex-shrink-0" />
                مقارنة المذاهب
              </Button>
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="flex-1 min-w-[120px] sm:min-w-32 h-11 sm:h-12" 
                size="lg"
                aria-label="إعادة تعيين جميع البيانات"
              >
                إعادة تعيين
              </Button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            {result && (
              <div className="space-y-4">
                {result.success ? (
                  <>
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <CardTitle id="results-title">النتائج</CardTitle>
                            <CardDescription>{result.madhhabName}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-white p-3 rounded-lg border border-green-200" role="region" aria-labelledby="net-estate-label">
                          <p className="text-sm text-slate-600" id="net-estate-label">صافي التركة</p>
                          <p className="text-2xl font-bold text-green-700" aria-live="polite">
                            {result.netEstate.toLocaleString()} ريال
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-semibold text-slate-900" id="shares-title">توزيع الحصص:</h3>
                          <div className="space-y-2 max-h-96 overflow-y-auto" role="list" aria-labelledby="shares-title">
                            {result.shares.map((share: any, idx: number) => (
                              <div key={idx} className="bg-white p-2 rounded text-sm border border-green-100" role="listitem">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{share.name}</span>
                                  <span className="text-green-600" aria-label={`${share.name}: ${(share.fraction.toDecimal() * 100).toFixed(2)} في المائة`}>
                                    {(share.fraction.toDecimal() * 100).toFixed(2)}%
                                  </span>
                                </div>
                                <div className="text-xs text-slate-600">
                                  المبلغ: {(share.amount || 0).toLocaleString()} ريال
                                </div>
                                {share.count > 1 && (
                                  <div className="text-xs text-slate-600">
                                    للفرد: {(share.amountPerPerson || 0).toLocaleString()} ريال
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {result.specialCases && result.specialCases.length > 0 && (
                          <div className="bg-white p-3 rounded-lg border border-green-100" role="note" aria-labelledby="special-cases-title">
                            <h4 className="font-semibold text-slate-900 mb-2" id="special-cases-title">حالات خاصة:</h4>
                            <ul className="text-sm text-slate-700 space-y-1">
                              {result.specialCases.map((c: any, idx: number) => (
                                <li key={idx}>• {c.name}: {c.description}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-1 sm:gap-2 flex-wrap" role="group" aria-label="خيارات تحميل ومشاركة النتائج">
                          <Button 
                            onClick={handlePrint} 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 min-w-[100px] sm:min-w-20 h-10 sm:h-11 text-xs sm:text-sm"
                            aria-label="طباعة نتائج الحساب"
                          >
                            <Printer className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            طباعة
                          </Button>
                          <Button 
                            onClick={handleDownloadCSV} 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 min-w-[100px] sm:min-w-20 h-10 sm:h-11 text-xs sm:text-sm"
                            aria-label="تحميل النتائج كملف CSV"
                          >
                            <Download className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            CSV
                          </Button>
                          <Button 
                            onClick={handleDownloadJSON} 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 min-w-[100px] sm:min-w-20 h-10 sm:h-11 text-xs sm:text-sm"
                            aria-label="تحميل النتائج كملف JSON"
                          >
                            <FileText className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            JSON
                          </Button>
                          <Button 
                            onClick={handleShare} 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 min-w-[100px] sm:min-w-20 h-10 sm:h-11 text-xs sm:text-sm"
                            aria-label="مشاركة النتائج"
                          >
                            <Share2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            مشاركة
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Alert variant="destructive" role="alert" aria-labelledby="error-result-title">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription id="error-result-title">{result.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Comparison Panel */}
            {comparison && (
              <div className="space-y-4" role="region" aria-labelledby="comparison-title">
                <div id="comparison-title" className="sr-only">نتائج المقارنة بين المذاهب</div>
                <MadhhabComparisonCard comparison={comparison} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeirInput({ label, value, onChange, id }: { label: string; value: number; onChange: (v: number) => void; id?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="flex-1">{label}</Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20"
        min="0"
        inputMode="decimal"
        aria-label={label}
      />
    </div>
  );
}
