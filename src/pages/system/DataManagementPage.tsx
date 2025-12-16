import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Upload, Download, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

const DataManagementPage = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Merge imported data into localStorage
        Object.keys(data).forEach(key => {
          const existing = localStorage.getItem(key);
          if (existing) {
            const existingData = JSON.parse(existing);
            if (Array.isArray(existingData) && Array.isArray(data[key])) {
              localStorage.setItem(key, JSON.stringify([...data[key], ...existingData]));
            } else {
              localStorage.setItem(key, JSON.stringify(data[key]));
            }
          } else {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        });
        toast({ title: 'Imported', description: 'Data imported and merged successfully' });
      } catch (err) {
        toast({ title: 'Error', description: 'Invalid JSON file', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExport = () => {
    const exportData: Record<string, any> = {};
    const keys = ['trozzy_products', 'trozzy_orders', 'trozzy_users', 'trozzy_categories', 'trozzy_media', 'trozzy_reports', 'trozzy_audit_logs', 'trozzy_notifications', 'trozzy_settings'];
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) exportData[key] = JSON.parse(data);
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trozzy-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'All data exported as JSON' });
  };

  const handleBackup = () => {
    const backup: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('trozzy_')) {
        backup[key] = localStorage.getItem(key);
      }
    }
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trozzy-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    localStorage.setItem('trozzy_last_backup', new Date().toISOString());
    toast({ title: 'Backup Created', description: 'Full backup downloaded' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold tracking-tight">Data Management</h1><p className="text-muted-foreground">Import, export, and backup your data.</p></div>
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" />Import Data</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Import products, orders, or users from JSON files.</p>
            <Button className="w-full" variant="outline" onClick={() => fileInputRef.current?.click()}>Select JSON File</Button>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5 text-accent" />Export Data</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Export your data to JSON format.</p>
            <Button className="w-full" variant="outline" onClick={handleExport}>Export All Data</Button>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><Save className="h-5 w-5 text-success" />Backup</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Create and download a full backup.</p>
            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleBackup}>Create Backup</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataManagementPage;
