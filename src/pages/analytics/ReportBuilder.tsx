import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileText, Plus, Calendar as CalendarIcon, Download, Trash2, Play } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ReportBuilder = () => {
  const { toast } = useToast();
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: new Date(2024, 11, 1),
    to: new Date(2024, 11, 15),
  });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'orders']);
  const [savedReports, setSavedReports] = useState([
    { id: '1', name: 'Monthly Sales Report', type: 'Sales', created: '2024-12-10', status: 'Ready' },
    { id: '2', name: 'Q4 Performance', type: 'Performance', created: '2024-12-08', status: 'Ready' },
    { id: '3', name: 'Customer Insights', type: 'Customer', created: '2024-12-05', status: 'Ready' },
  ]);

  const metrics = [
    { id: 'revenue', label: 'Revenue' },
    { id: 'orders', label: 'Orders' },
    { id: 'customers', label: 'Customers' },
    { id: 'products', label: 'Products Sold' },
    { id: 'conversion', label: 'Conversion Rate' },
    { id: 'avgOrder', label: 'Average Order Value' },
  ];

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId) ? prev.filter((m) => m !== metricId) : [...prev, metricId]
    );
  };

  const handleCreateReport = () => {
    if (!reportName.trim()) {
      toast({ title: 'Error', description: 'Please enter a report name', variant: 'destructive' });
      return;
    }

    const newReport = {
      id: Date.now().toString(),
      name: reportName,
      type: reportType.charAt(0).toUpperCase() + reportType.slice(1),
      created: format(new Date(), 'yyyy-MM-dd'),
      status: 'Ready',
    };

    setSavedReports([newReport, ...savedReports]);
    setReportName('');
    toast({ title: 'Report Created', description: `${reportName} has been created successfully.` });
  };

  const handleDeleteReport = (id: string) => {
    setSavedReports(savedReports.filter((r) => r.id !== id));
    toast({ title: 'Report Deleted', description: 'The report has been deleted.' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Builder</h1>
          <p className="text-muted-foreground">
            Create custom reports and export your data.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create New Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  placeholder="Enter report name..."
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="performance">Performance Report</SelectItem>
                    <SelectItem value="customer">Customer Report</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Metrics to Include</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleMetricToggle(metric.id)}
                  >
                    <Checkbox
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => handleMetricToggle(metric.id)}
                    />
                    <span className="text-sm">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCreateReport} className="gradient-primary text-primary-foreground">
                <Play className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Saved Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3 rounded-lg bg-muted/50 space-y-2 border border-border/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.type} • {report.created}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportBuilder;
