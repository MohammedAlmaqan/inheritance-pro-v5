import { useState, useRef } from 'react';
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
import { useFocusManagement, useEscapeKey } from '@/hooks/useKeyboardNavigation';

interface ScenarioDialogProps {
  onScenarioSelect: (state: ReturnType<typeof applyScenario>) => void;
  disabled?: boolean;
}

export function ScenariosDialog({ onScenarioSelect, disabled = false }: ScenarioDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const scenariosContainerRef = useRef<HTMLDivElement>(null);

  const allTags = getAllScenarioTags();

  const filteredScenarios = selectedTag
    ? INHERITANCE_SCENARIOS.filter((s) => s.tags.includes(selectedTag))
    : searchQuery
      ? searchScenarios(searchQuery)
      : INHERITANCE_SCENARIOS;

  // Setup keyboard navigation for scenarios list
  useFocusManagement({
    enabled: open && filteredScenarios.length > 0,
    direction: 'vertical',
  });

  // Setup escape key to close dialog
  useEscapeKey(() => setOpen(false), {
    enabled: open,
  });

  const handleScenarioSelect = (scenario: InheritanceScenario) => {
    const state = applyScenario(scenario);
    onScenarioSelect(state);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled} 
          className="w-full"
          aria-label="استخدام سيناريو جاهز لملء البيانات"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          استخدم سيناريو جاهز
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh]" role="alertdialog" aria-modal="true">
        <DialogHeader>
          <DialogTitle id="scenarios-title">السيناريوهات الجاهزة</DialogTitle>
          <DialogDescription id="scenarios-desc">
            اختر من بين السيناريوهات المعدة مسبقاً لتبدأ بسرعة. استخدم الأسهم للتنقل والدخول للاختيار.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Box */}
          <Input
            placeholder="ابحث عن سيناريو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            aria-label="البحث عن سيناريو"
            aria-describedby="scenarios-desc"
          />

          {/* Tag Filter */}
          <div className="space-y-2" role="group" aria-labelledby="tags-label">
            <p className="text-sm font-medium text-slate-700" id="tags-label">التصنيفات:</p>
            <div className="flex flex-wrap gap-2" role="radiogroup">
              <Badge
                variant={selectedTag === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
                role="radio"
                aria-checked={selectedTag === null}
                aria-label="عرض جميع السيناريوهات"
                tabIndex={selectedTag === null ? 0 : -1}
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
                  role="radio"
                  aria-checked={selectedTag === tag}
                  aria-label={`تصنيف: ${tag}`}
                  tabIndex={selectedTag === tag ? 0 : -1}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Scenarios List */}
          <ScrollArea 
            className="h-[400px] border rounded-lg p-4"
            ref={scenariosContainerRef}
          >
            {filteredScenarios.length > 0 ? (
              <div className="space-y-3" role="listbox" aria-labelledby="scenarios-title">
                {filteredScenarios.map((scenario, index) => (
                  <div
                    key={scenario.id}
                    className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => handleScenarioSelect(scenario)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleScenarioSelect(scenario);
                      }
                    }}
                    role="option"
                    aria-selected={false}
                    tabIndex={index === 0 ? 0 : -1}
                    aria-label={`${scenario.name}: ${scenario.description}. التركة: ${scenario.estate.total.toLocaleString()}. المستوى: ${
                      scenario.complexity === 'simple'
                        ? 'بسيط'
                        : scenario.complexity === 'moderate'
                          ? 'معتدل'
                          : 'معقد'
                    }`}
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
                        aria-hidden="true"
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
                        💰 التركة: <span className="font-semibold">{scenario.estate.total.toLocaleString()}</span> ريال
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {scenario.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs" aria-hidden="true">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2" role="status" aria-live="polite">
                <AlertCircle className="h-8 w-8 text-slate-400" aria-hidden="true" />
                <p className="text-slate-600">لا توجد سيناريوهات مطابقة</p>
              </div>
            )}
          </ScrollArea>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2" role="note">
            <Zap className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
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
