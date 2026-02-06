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
import { ScenariosDialog } from '@/components/ScenariosDialog';
import { AlertCircle, Calculator, Download, Printer, CheckCircle, FileText, Share2 } from 'lucide-react';

export default function Home() {
  // Local state for error handling and UI
  const [errors, setErrors] = useState<string[]>([]);

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

  const handleReset = () => {
    resetAll();
    setErrors([]);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">نظام المواريث الإسلامية</h1>
          <p className="text-lg text-slate-600">حاسبة دقيقة وشاملة لتوزيع الميراث وفقاً للمذاهب الفقهية الأربعة</p>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="mt-2 space-y-1">
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
                <CardTitle>اختر المذهب الفقهي</CardTitle>
                <CardDescription>اختر المذهب الذي تريد تطبيق أحكامه</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(FIQH_DATABASE.madhabs).map(([key, madhab_option]) => (
                    <Button
                      key={key}
                      variant={madhab_option.id === madhab ? 'default' : 'outline'}
                      className="text-right"
                      onClick={() => setMadhab(madhab_option.id as Madhab)}
                    >
                      <span className="mr-2">{madhab_option.icon}</span>
                      {madhab_option.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estate Input */}
            <Card>
              <CardHeader>
                <CardTitle>بيانات التركة</CardTitle>
                <CardDescription>أدخل قيمة التركة والخصومات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total">إجمالي التركة</Label>
                    <Input
                      id="total"
                      type="number"
                      value={estate.total}
                      onChange={(e) => handleEstateChange('total', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="funeral">تكاليف التجهيز</Label>
                    <Input
                      id="funeral"
                      type="number"
                      value={estate.funeral}
                      onChange={(e) => handleEstateChange('funeral', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="debts">الديون</Label>
                    <Input
                      id="debts"
                      type="number"
                      value={estate.debts}
                      onChange={(e) => handleEstateChange('debts', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="will">الوصية</Label>
                    <Input
                      id="will"
                      type="number"
                      value={estate.will}
                      onChange={(e) => handleEstateChange('will', Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-700">
                    <strong>صافي التركة:</strong> {(estate.total - estate.funeral - estate.debts - estate.will).toLocaleString()} ريال
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Heirs Input */}
            <Card>
              <CardHeader>
                <CardTitle>الورثة</CardTitle>
                <CardDescription>أدخل عدد الورثة في كل فئة</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ascendants" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="ascendants">الأصول</TabsTrigger>
                    <TabsTrigger value="descendants">الفروع</TabsTrigger>
                    <TabsTrigger value="siblings">الإخوة</TabsTrigger>
                    <TabsTrigger value="others">الآخرون</TabsTrigger>
                  </TabsList>

                  <TabsContent value="ascendants" className="space-y-3 mt-4">
                    <HeirInput label="الزوج" value={heirs.husband} onChange={(v) => handleHeirChange('husband', v)} />
                    <HeirInput label="الزوجة" value={heirs.wife} onChange={(v) => handleHeirChange('wife', v)} />
                    <HeirInput label="الأب" value={heirs.father} onChange={(v) => handleHeirChange('father', v)} />
                    <HeirInput label="الأم" value={heirs.mother} onChange={(v) => handleHeirChange('mother', v)} />
                    <HeirInput label="الجد" value={heirs.grandfather} onChange={(v) => handleHeirChange('grandfather', v)} />
                    <HeirInput label="الجدة لأب" value={heirs.grandmother_father} onChange={(v) => handleHeirChange('grandmother_father', v)} />
                    <HeirInput label="الجدة لأم" value={heirs.grandmother_mother} onChange={(v) => handleHeirChange('grandmother_mother', v)} />
                  </TabsContent>

                  <TabsContent value="descendants" className="space-y-3 mt-4">
                    <HeirInput label="الابن" value={heirs.son} onChange={(v) => handleHeirChange('son', v)} />
                    <HeirInput label="البنت" value={heirs.daughter} onChange={(v) => handleHeirChange('daughter', v)} />
                    <HeirInput label="ابن الابن" value={heirs.grandson} onChange={(v) => handleHeirChange('grandson', v)} />
                    <HeirInput label="بنت الابن" value={heirs.granddaughter} onChange={(v) => handleHeirChange('granddaughter', v)} />
                  </TabsContent>

                  <TabsContent value="siblings" className="space-y-3 mt-4">
                    <HeirInput label="الأخ الشقيق" value={heirs.full_brother} onChange={(v) => handleHeirChange('full_brother', v)} />
                    <HeirInput label="الأخت الشقيقة" value={heirs.full_sister} onChange={(v) => handleHeirChange('full_sister', v)} />
                    <HeirInput label="الأخ لأب" value={heirs.paternal_brother} onChange={(v) => handleHeirChange('paternal_brother', v)} />
                    <HeirInput label="الأخت لأب" value={heirs.paternal_sister} onChange={(v) => handleHeirChange('paternal_sister', v)} />
                    <HeirInput label="الأخ لأم" value={heirs.maternal_brother} onChange={(v) => handleHeirChange('maternal_brother', v)} />
                    <HeirInput label="الأخت لأم" value={heirs.maternal_sister} onChange={(v) => handleHeirChange('maternal_sister', v)} />
                  </TabsContent>

                  <TabsContent value="others" className="space-y-3 mt-4">
                    <HeirInput label="ابن الأخ الشقيق" value={heirs.full_nephew} onChange={(v) => handleHeirChange('full_nephew', v)} />
                    <HeirInput label="ابن الأخ لأب" value={heirs.paternal_nephew} onChange={(v) => handleHeirChange('paternal_nephew', v)} />
                    <HeirInput label="العم الشقيق" value={heirs.full_uncle} onChange={(v) => handleHeirChange('full_uncle', v)} />
                    <HeirInput label="العم لأب" value={heirs.paternal_uncle} onChange={(v) => handleHeirChange('paternal_uncle', v)} />
                    <HeirInput label="ابن العم الشقيق" value={heirs.full_cousin} onChange={(v) => handleHeirChange('full_cousin', v)} />
                    <HeirInput label="ابن العم لأب" value={heirs.paternal_cousin} onChange={(v) => handleHeirChange('paternal_cousin', v)} />
                    <HeirInput label="الخال" value={heirs.maternal_uncle} onChange={(v) => handleHeirChange('maternal_uncle', v)} />
                    <HeirInput label="الخالة" value={heirs.maternal_aunt} onChange={(v) => handleHeirChange('maternal_aunt', v)} />
                    <HeirInput label="العمة" value={heirs.paternal_aunt} onChange={(v) => handleHeirChange('paternal_aunt', v)} />
                    <HeirInput label="ابن البنت" value={heirs.daughter_son} onChange={(v) => handleHeirChange('daughter_son', v)} />
                    <HeirInput label="بنت البنت" value={heirs.daughter_daughter} onChange={(v) => handleHeirChange('daughter_daughter', v)} />
                    <HeirInput label="أولاد الأخت" value={heirs.sister_children ?? 0} onChange={(v) => handleHeirChange('sister_children', v)} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleCalculate} disabled={isCalculating} className="flex-1" size="lg">
                <Calculator className="mr-2 h-4 w-4" />
                {isCalculating ? 'جاري الحساب...' : 'احسب الميراث'}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
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
                            <CardTitle>النتائج</CardTitle>
                            <CardDescription>{result.madhhabName}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-white p-3 rounded-lg border border-green-200">
                          <p className="text-sm text-slate-600">صافي التركة</p>
                          <p className="text-2xl font-bold text-green-700">{result.netEstate.toLocaleString()}</p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-semibold text-slate-900">توزيع الحصص:</h3>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {result.shares.map((share: any, idx: number) => (
                              <div key={idx} className="bg-white p-2 rounded text-sm border border-green-100">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{share.name}</span>
                                  <span className="text-green-600">{(share.fraction.toDecimal() * 100).toFixed(2)}%</span>
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
                          <div className="bg-white p-3 rounded-lg border border-green-100">
                            <h4 className="font-semibold text-slate-900 mb-2">حالات خاصة:</h4>
                            <ul className="text-sm text-slate-700 space-y-1">
                              {result.specialCases.map((c: any, idx: number) => (
                                <li key={idx}>• {c.name}: {c.description}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-2 flex-wrap">
                          <Button onClick={handlePrint} variant="outline" size="sm" className="flex-1 min-w-20">
                            <Printer className="mr-2 h-4 w-4" />
                            طباعة
                          </Button>
                          <Button onClick={handleDownloadCSV} variant="outline" size="sm" className="flex-1 min-w-20">
                            <Download className="mr-2 h-4 w-4" />
                            CSV
                          </Button>
                          <Button onClick={handleDownloadJSON} variant="outline" size="sm" className="flex-1 min-w-20">
                            <FileText className="mr-2 h-4 w-4" />
                            JSON
                          </Button>
                          <Button onClick={handleShare} variant="outline" size="sm" className="flex-1 min-w-20">
                            <Share2 className="mr-2 h-4 w-4" />
                            مشاركة
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeirInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Label className="flex-1">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20"
        min="0"
      />
    </div>
  );
}
