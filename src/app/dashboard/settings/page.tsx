'use client';

import { useState, useEffect } from 'react';
import { useLoanStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchAppConfig, AppConfigItem } from '@/lib/supabase/api';

export default function SettingsPage() {
  const { config, addConfigItem, deleteConfigItem } = useLoanStore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('LOAN_TYPE');
  const [newItemValue, setNewItemValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [dbItems, setDbItems] = useState<AppConfigItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load config on mount to get IDs for deletion
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
        const items = await fetchAppConfig();
        setDbItems(items);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const currentCategoryItems = dbItems.filter(item => item.category === activeTab);
  
  // Also fallback to store values if DB is empty - but for deletion we need ID.
  // If DB is empty (users haven't migrated), this UI will just be empty or show nothing usable for deletion.
  // That is acceptable as it forces them to run migration.
  
  const handleAdd = async () => {
    if (!newItemValue.trim()) return;
    setIsAdding(true);
    try {
        await addConfigItem(activeTab, newItemValue.trim());
        setNewItemValue('');
        toast({ title: 'Item added', description: 'Configuration updated successfully.' });
        loadConfig(); // Reload to get the ID
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to add item.', variant: 'destructive' });
    } finally {
        setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, value: string) => {
    try {
        await deleteConfigItem(id, activeTab, value);
        toast({ title: 'Item deleted', description: 'Configuration updated successfully.' });
        loadConfig();
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete item.', variant: 'destructive' });
    }
  };

  const tabs = [
    { id: 'LOAN_TYPE', label: 'Loan Types' },
    { id: 'CASE_STATUS', label: 'Statuses' },
    { id: 'BANK_NAME', label: 'Banks' },
    { id: 'TEAM_MEMBER', label: 'Team Members' },
  ];

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage application configurations and dropdown options.
        </p>
      </div>

      <Tabs defaultValue="LOAN_TYPE" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-4">
            {tabs.map(t => (
                <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
            ))}
        </TabsList>
        
        <Card>
            <CardHeader>
                <CardTitle>{tabs.find(t => t.id === activeTab)?.label} Configuration</CardTitle>
                <CardDescription>Add or remove options for this category.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Add new item..." 
                        value={newItemValue}
                        onChange={(e) => setNewItemValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <Button onClick={handleAdd} disabled={isAdding || !newItemValue.trim()}>
                        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        Add
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/></div>
                ) : (
                    <div className="grid gap-2">
                        {currentCategoryItems.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-4">
                                <p>No items found in database for this category.</p>
                                {dbItems.length === 0 && (
                                   <Button variant="outline" onClick={async () => {
                                       try {
                                           setIsLoading(true);
                                           await useLoanStore.getState().initConfig();
                                           toast({ title: 'Success', description: 'Default configuration initialized.' });
                                           loadConfig();
                                       } catch (e: any) {
                                           toast({ title: 'Error', description: e.message || 'Failed to initialize.', variant: 'destructive' });
                                           setIsLoading(false); // only if error, otherwise loadConfig will handle loading state
                                       }
                                   }}>
                                     Initialize Defaults
                                   </Button>
                                )}
                            </div>
                        ) : (
                            currentCategoryItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                                    <span>{item.value}</span>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.value)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}