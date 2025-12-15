import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, ShoppingCart, DollarSign, Globe, Clock } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';

const RealTimeAnalytics = () => {
  const [liveData, setLiveData] = useState({
    activeUsers: 127,
    ordersPerMinute: 2.4,
    revenuePerMinute: 89.5,
    pageViews: 342,
  });

  const [realtimeChart, setRealtimeChart] = useState([
    { time: '0s', users: 120 },
    { time: '10s', users: 125 },
    { time: '20s', users: 122 },
    { time: '30s', users: 128 },
    { time: '40s', users: 124 },
    { time: '50s', users: 127 },
  ]);

  const activePages = [
    { page: '/products/headphones', users: 34, duration: '2m 45s' },
    { page: '/checkout', users: 28, duration: '1m 30s' },
    { page: '/products/smartwatch', users: 22, duration: '3m 12s' },
    { page: '/', users: 18, duration: '45s' },
    { page: '/cart', users: 15, duration: '1m 05s' },
  ];

  const locationData = [
    { country: 'United States', users: 45, flag: '🇺🇸' },
    { country: 'United Kingdom', users: 23, flag: '🇬🇧' },
    { country: 'Germany', users: 18, flag: '🇩🇪' },
    { country: 'Canada', users: 15, flag: '🇨🇦' },
    { country: 'Australia', users: 12, flag: '🇦🇺' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        ordersPerMinute: Math.max(0, prev.ordersPerMinute + (Math.random() * 0.6 - 0.3)),
        revenuePerMinute: Math.max(0, prev.revenuePerMinute + (Math.random() * 20 - 10)),
        pageViews: prev.pageViews + Math.floor(Math.random() * 15),
      }));

      setRealtimeChart((prev) => {
        const newData = [...prev.slice(1), {
          time: `${parseInt(prev[prev.length - 1].time) + 10}s`,
          users: Math.max(100, Math.floor(Math.random() * 50) + 110),
        }];
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time Analytics</h1>
          <p className="text-muted-foreground">
            Live activity on your store right now.
          </p>
        </div>
        <Badge className="gradient-primary text-primary-foreground animate-pulse">
          <Activity className="mr-2 h-4 w-4" />
          Live
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{liveData.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders/min</p>
                <p className="text-2xl font-bold">{liveData.ordersPerMinute.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue/min</p>
                <p className="text-2xl font-bold">${liveData.revenuePerMinute.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-2xl font-bold">{liveData.pageViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Live User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={realtimeChart}>
              <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} domain={['auto', 'auto']} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="hsl(262, 83%, 58%)"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Active Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePages.map((page) => (
                <div key={page.page} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{page.page}</p>
                    <p className="text-xs text-muted-foreground">Avg time: {page.duration}</p>
                  </div>
                  <Badge variant="secondary">{page.users} users</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-accent" />
              Users by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {locationData.map((loc) => (
                <div key={loc.country} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{loc.flag}</span>
                    <span className="font-medium text-sm">{loc.country}</span>
                  </div>
                  <Badge variant="secondary">{loc.users} active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeAnalytics;
