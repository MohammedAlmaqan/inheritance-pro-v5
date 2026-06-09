/**
 * ScenarioManager Component
 * Main UI for managing scenarios with CRUD operations
 */

import { useState } from 'react';
import { useScenarios } from '@/hooks/useScenarios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Madhab } from '@/lib/fiqh-database';
import { Calendar, Download, Upload, Trash2, Heart, Search, Copy } from 'lucide-react';

interface ScenarioManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioLoad?: (scenario: any) => void;
}

export function ScenarioManager({ isOpen, onClose, onScenarioLoad }: ScenarioManagerProps) {
  const {
    scenarios,
    allScenarios,
    loading,
    error,
    searchQuery,
    search,
    filterByMadhab,
    filterByEstateRange,
    deleteScenario,
    toggleFavorite,
    exportScenarios,
    importScenarios,
    recordUsage,
    getStats,
  } = useScenarios();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedMadhab, setSelectedMadhab] = useState<Madhab | 'all'>('all');
  const [estateMin, setEstateMin] = useState('');
  const [estateMax, setEstateMax] = useState('');
  const [showStats, setShowStats] = useState(false);
  const stats = getStats();

  const madhabs: Madhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];

  const handleSearch = (query: string) => {
    search(query);
    setSelectedMadhab('all');
    setEstateMin('');
    setEstateMax('');
  };

  const handleFilterMadhab = (madhab: string) => {
    if (madhab === 'all') {
      setSelectedMadhab('all');
    } else {
      setSelectedMadhab(madhab as Madhab);
      filterByMadhab(madhab as Madhab);
    }
  };

  const handleFilterEstate = () => {
    const min = Number(estateMin) || 0;
    const max = Number(estateMax) || Infinity;
    filterByEstateRange(min, max);
  };

  const handleLoad = (scenario: any) => {
    recordUsage(scenario.id);
    if (onScenarioLoad) {
      onScenarioLoad(scenario);
    }
  };

  const handleDelete = (id: string) => {
    deleteScenario(id);
    setShowDeleteConfirm(null);
  };

  const handleExport = () => {
    const json = exportScenarios();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenarios-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const count = importScenarios(content);
          // Reset file input
          event.target.value = '';
        } catch (err) {
          console.error('Import error:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📋 Manage Scenarios</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search & Filter Bar */}
          <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
            <div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search scenarios..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Madhab Filter */}
            <div>
              <label className="text-sm font-medium">Filter by Madhab</label>
              <Select value={selectedMadhab} onValueChange={handleFilterMadhab}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Madhabs</SelectItem>
                  {madhabs.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estate Range Filter */}
            <div>
              <label className="text-sm font-medium">Filter by Estate Value</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={estateMin}
                  onChange={(e) => setEstateMin(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={estateMax}
                  onChange={(e) => setEstateMax(e.target.value)}
                />
                <Button onClick={handleFilterEstate} size="sm">
                  Apply
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleExport} size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <label>
                <Button size="sm" variant="outline" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <Button
                onClick={() => setShowStats(!showStats)}
                size="sm"
                variant="outline"
              >
                {showStats ? 'Hide' : 'Show'} Stats
              </Button>
            </div>

            {/* Stats */}
            {showStats && (
              <div className="text-sm space-y-1 mt-2 p-2 bg-white rounded border">
                <p>Total Scenarios: {stats.totalScenarios}</p>
                <p>Favorites: {stats.stats.totalFavorites}</p>
                <p>Storage: {stats.stats.storageSize} KB</p>
                {stats.isFull && <p className="text-red-600">⚠️ Storage is full!</p>}
              </div>
            )}
          </div>

          {/* Scenarios List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading scenarios...</div>
            ) : scenarios.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {allScenarios.length === 0
                  ? 'No scenarios saved yet'
                  : 'No scenarios match your filter'}
              </div>
            ) : (
              scenarios.map((scenario) => (
                <Card key={scenario.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{scenario.name}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(scenario.id)}
                          >
                            <Heart
                              className={`h-4 w-4 ${scenario.favorited ? 'fill-red-500 text-red-500' : ''}`}
                            />
                          </Button>
                        </div>
                        {scenario.description && (
                          <CardDescription>{scenario.description}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Scenario Details */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-600">Madhab:</span>
                        <p className="font-medium">{scenario.madhab.toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Estate:</span>
                        <p className="font-medium">SAR {scenario.estate.value.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Created:</span>
                        <p className="text-xs">{new Date(scenario.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Used:</span>
                        <p className="font-medium">{scenario.useCount} times</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {scenario.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {scenario.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleLoad(scenario)}
                        size="sm"
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Load
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(scenario.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Delete Confirmation */}
          <AlertDialog open={showDeleteConfirm !== null} onOpenChange={() => setShowDeleteConfirm(null)}>
            <AlertDialogContent>
              <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this scenario? This action cannot be undone.
              </AlertDialogDescription>
              <div className="flex gap-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                  className="bg-red-600"
                >
                  Delete
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook for managing ScenarioManager dialog state
 */
export function useScenarioManager() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
