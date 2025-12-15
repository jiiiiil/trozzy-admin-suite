import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { Settings as SettingsIcon, Shield, Zap, Globe, Server } from 'lucide-react';
import { useState } from 'react';

const SettingsPage = () => {
  const [settings, setSettings] = useState([
    { id: 'maintenance', title: 'Maintenance Mode', description: 'Temporarily disable store', enabled: false },
    { id: 'debug', title: 'Debug Mode', description: 'Enable detailed logging', enabled: false },
    { id: 'cache', title: 'Cache Enabled', description: 'Improve performance with caching', enabled: true },
    { id: 'ssl', title: 'Force SSL', description: 'Redirect all traffic to HTTPS', enabled: true },
  ]);

  const systemHealth = [
    { name: 'Database', status: 'healthy', icon: Server },
    { name: 'Cache', status: 'healthy', icon: Zap },
    { name: 'API', status: 'healthy', icon: Globe },
    { name: 'Security', status: 'healthy', icon: Shield },
  ];

  const toggleSetting = (id: string) => setSettings(settings.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-3xl font-bold tracking-tight">Settings</h1><p className="text-muted-foreground">System configuration and health.</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5 text-primary" />Feature Flags</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div><p className="font-medium">{setting.title}</p><p className="text-sm text-muted-foreground">{setting.description}</p></div>
                <Switch checked={setting.enabled} onCheckedChange={() => toggleSetting(setting.id)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-success" />System Health</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3"><item.icon className="h-5 w-5 text-muted-foreground" /><span className="font-medium">{item.name}</span></div>
                <StatusBadge status={item.status === 'healthy' ? 'success' : 'warning'} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
