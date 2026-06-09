/**
 * ScenarioForm Component
 * Form for creating and editing scenarios
 */

import { useState, useEffect } from 'react';
import { useScenarios } from '@/hooks/useScenarios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Madhab } from '@/lib/fiqh-database';
import { X } from 'lucide-react';

interface ScenarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string;
  estate?: { value: number; debts?: number; gift?: number };
  heirs?: any[];
  madhab?: Madhab;
  onSuccess?: (scenario: any) => void;
}

export function ScenarioForm({
  isOpen,
  onClose,
  editingId,
  estate,
  heirs,
  madhab,
  onSuccess,
}: ScenarioFormProps) {
  const { createScenario, updateScenario, getScenario } = useScenarios();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMadhab, setSelectedMadhab] = useState<Madhab | ''>('');
  const [estateValue, setEstateValue] = useState('');
  const [estateDebts, setEstateDebts] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const madhabs: Madhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];

  // Load scenario if editing
  useEffect(() => {
    if (editingId && isOpen) {
      const scenario = getScenario(editingId);
      if (scenario) {
        setName(scenario.name);
        setDescription(scenario.description);
        setSelectedMadhab(scenario.madhab);
        setEstateValue(scenario.estate.value.toString());
        setEstateDebts(scenario.estate.debts?.toString() || '');
        setTags(scenario.tags);
      }
    } else if (isOpen && !editingId) {
      // Pre-fill with current values
      setEstateValue(estate?.value?.toString() || '');
      setEstateDebts(estate?.debts?.toString() || '');
      setSelectedMadhab(madhab || '');
    }
  }, [isOpen, editingId, estate, madhab]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!name.trim()) {
        setError('Scenario name is required');
        return;
      }

      if (!selectedMadhab) {
        setError('Please select a madhab');
        return;
      }

      const estateVal = Number(estateValue);
      if (!estateVal || estateVal <= 0) {
        setError('Estate value must be greater than 0');
        return;
      }

      const debts = Number(estateDebts) || 0;
      if (debts < 0) {
        setError('Debts cannot be negative');
        return;
      }

      if (debts >= estateVal) {
        setError('Debts must be less than estate value');
        return;
      }

      const scenarioData = {
        name: name.trim(),
        description: description.trim(),
        madhab: selectedMadhab as Madhab,
        estate: {
          value: estateVal,
          debts: debts || undefined,
        },
        heirs: heirs || [],
        tags,
      };

      let result;
      if (editingId) {
        result = updateScenario(editingId, scenarioData);
      } else {
        result = createScenario(scenarioData);
      }

      if (result) {
        if (onSuccess) onSuccess(result);
        resetForm();
        onClose();
      } else {
        setError('Failed to save scenario');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedMadhab('');
    setEstateValue('');
    setEstateDebts('');
    setTags([]);
    setTagInput('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingId ? '✏️ Edit Scenario' : '➕ New Scenario'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Scenario Name *</label>
            <Input
              placeholder="e.g., Simple Family Estate"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Add notes about this scenario..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Madhab Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Madhab (Islamic School) *</label>
            <Select value={selectedMadhab} onValueChange={(value) => setSelectedMadhab(value as Madhab)}>
              <SelectTrigger>
                <SelectValue placeholder="Select madhab..." />
              </SelectTrigger>
              <SelectContent>
                {madhabs.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estate Value */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estate Value (SAR) *</label>
              <Input
                type="number"
                placeholder="100000"
                value={estateValue}
                onChange={(e) => setEstateValue(e.target.value)}
                min="0"
                step="1000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Debts (SAR)</label>
              <Input
                type="number"
                placeholder="0"
                value={estateDebts}
                onChange={(e) => setEstateDebts(e.target.value)}
                min="0"
                step="1000"
              />
            </div>
          </div>

          {/* Tags Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (for organization)</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., simple, children, wife"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                size="sm"
                variant="outline"
              >
                Add
              </Button>
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
            💡 Save your current calculation setup for quick access later. You can load it
            anytime and modify it.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : editingId ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook for managing ScenarioForm dialog state
 */
export function useScenarioForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();

  return {
    isOpen,
    editingId,
    open: (id?: string) => {
      setEditingId(id);
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      setEditingId(undefined);
    },
  };
}
