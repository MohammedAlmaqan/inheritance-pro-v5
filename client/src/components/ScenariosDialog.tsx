import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Sparkles, Zap } from 'lucide-react';
import {
  INHERITANCE_SCENARIOS,
  searchScenarios,
  getScenariosByComplexity,
  getAllScenarioTags,
  applyScenario,
  InheritanceScenario,
} from '@/lib/scenarios';

interface ScenarioDialogProps {
  onScenarioSelect: (state: ReturnType<typeof applyScenario>) => void;
  disabled?: boolean;
}

export function ScenariosDialog({ onScenarioSelect, disabled = false }: ScenarioDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = getAllScenarioTags();

  const filteredScenarios = selectedTag
    ? INHERITANCE_SCENARIOS.filter((s) => s.tags.includes(selectedTag))
    : searchQuery
      ? searchScenarios(searchQuery)
      : INHERITANCE_SCENARIOS;

  const handleScenarioSelect = (scenario: InheritanceScenario) => {
    const state = applyScenario(scenario);
    onScenarioSelect(state);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          استخدم سيناريو جاهز
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>السيناريوهات الجاهزة</DialogTitle>
          <DialogDescription>
            اختر من بين السيناريوهات المعدة مسبقاً لتبدأ بسرعة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Box */}
          <Input
            placeholder="ابحث عن سيناريو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          {/* Tag Filter */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">التصنيفات:</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedTag === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
              >
                الكل
              </Badge>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedTag(tag);
                    setSearchQuery('');
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Scenarios List */}
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            {filteredScenarios.length > 0 ? (
              <div className="space-y-3">
                {filteredScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleScenarioSelect(scenario)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900">{scenario.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">{scenario.description}</p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium shrink-0 ml-2 ${
                          scenario.complexity === 'simple'
                            ? 'bg-green-100 text-green-700'
                            : scenario.complexity === 'moderate'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {scenario.complexity === 'simple'
                          ? 'بسيط'
                          : scenario.complexity === 'moderate'
                            ? 'معتدل'
                            : 'معقد'}
                      </div>
                    </div>

                    {/* Estate Summary */}
                    <div className="mb-2 p-2 bg-slate-100 rounded text-sm">
                      <p className="text-slate-700">
                        💰 التركة: <span className="font-semibold">{scenario.estate.total.toLocaleString()}</span> دل
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {scenario.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <AlertCircle className="h-8 w-8 text-slate-400" />
                <p className="text-slate-600">لا توجد سيناريوهات مطابقة</p>
              </div>
            )}
          </ScrollArea>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <Zap className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold">نصيحة:</p>
              <p>
                اختر سيناريو لملء البيانات تلقائياً، ثم عدّل الأرقام حسب حالتك الخاصة
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
