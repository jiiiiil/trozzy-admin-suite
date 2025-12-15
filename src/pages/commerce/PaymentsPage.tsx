import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Shield, CreditCard, Store, Phone, Download, Eye, EyeOff, Save } from 'lucide-react';
import { initializeMockData, getPaymentSettings, setPaymentSettings, PaymentSettings } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const PaymentsPage = () => {
  const { toast } = useToast();
  const [settings, setSettingsState] = useState<PaymentSettings>({
    upiId: '',
    storeName: '',
    contactPhone: '',
  });
  const [showUpi, setShowUpi] = useState(false);

  useEffect(() => {
    initializeMockData();
    setSettingsState(getPaymentSettings());
  }, []);

  const handleSave = () => {
    setPaymentSettings(settings);
    toast({ title: 'Success', description: 'Payment settings saved' });
  };

  const settlementHistory = [
    { id: '1', date: '2024-12-15', amount: 4529.50, status: 'completed', reference: 'SET-2024-001' },
    { id: '2', date: '2024-12-08', amount: 3875.25, status: 'completed', reference: 'SET-2024-002' },
    { id: '3', date: '2024-12-01', amount: 5120.00, status: 'completed', reference: 'SET-2024-003' },
    { id: '4', date: '2024-11-24', amount: 2980.75, status: 'completed', reference: 'SET-2024-004' },
    { id: '5', date: '2024-11-17', amount: 4250.00, status: 'pending', reference: 'SET-2024-005' },
  ];

  const columns = [
    { key: 'reference', header: 'Reference' },
    { key: 'date', header: 'Date' },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: typeof settlementHistory[0]) => `$${item.amount.toFixed(2)}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: typeof settlementHistory[0]) => <StatusBadge status={item.status} />,
    },
  ];

  const maskUpi = (upi: string) => {
    if (!upi) return '***';
    const parts = upi.split('@');
    if (parts.length < 2) return '***';
    return `${parts[0].slice(0, 3)}***@${parts[1]}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage payment settings and view settlements.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Secure Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="upi" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                UPI ID (Encrypted)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="upi"
                  type={showUpi ? 'text' : 'password'}
                  value={settings.upiId}
                  onChange={(e) => setSettingsState({ ...settings, upiId: e.target.value })}
                  placeholder="yourstore@upi"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowUpi(!showUpi)}
                >
                  {showUpi ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Display: {maskUpi(settings.upiId)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Store Name
              </Label>
              <Input
                id="store"
                value={settings.storeName}
                onChange={(e) => setSettingsState({ ...settings, storeName: e.target.value })}
                placeholder="Your Store Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Phone
              </Label>
              <Input
                id="phone"
                value={settings.contactPhone}
                onChange={(e) => setSettingsState({ ...settings, contactPhone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>

            <Button onClick={handleSave} className="w-full gradient-primary text-primary-foreground">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">$20,755.50</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">$4,250.00</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">$8,404.75</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Settlements</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Settlement History</CardTitle>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Statement
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable data={settlementHistory} columns={columns} emptyMessage="No settlements yet" />
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsPage;
