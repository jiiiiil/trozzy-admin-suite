import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Upload, Download, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataManagementPage = () => {
  const { toast } = useToast();
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold tracking-tight">Data Management</h1><p className="text-muted-foreground">Import, export, and backup your data.</p></div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass"><CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" />Import Data</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Import products, orders, or users from CSV/JSON files.</p><Button className="w-full" variant="outline" onClick={() => toast({ title: 'Import', description: 'Select a file to import' })}>Select File</Button></CardContent></Card>
        <Card className="glass"><CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5 text-accent" />Export Data</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Export your data to CSV or JSON format.</p><Button className="w-full" variant="outline" onClick={() => toast({ title: 'Exported', description: 'Data exported successfully' })}>Export All</Button></CardContent></Card>
        <Card className="glass"><CardHeader><CardTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5 text-success" />Backup</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Create and restore backups of your store.</p><Button className="w-full gradient-primary text-primary-foreground" onClick={() => toast({ title: 'Backup Created', description: 'Your data has been backed up' })}>Create Backup</Button></CardContent></Card>
      </div>
    </div>
  );
};

export default DataManagementPage;
