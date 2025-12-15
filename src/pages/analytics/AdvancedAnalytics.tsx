import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, BarChart3, PieChart, Download, Filter } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
} from 'recharts';

const AdvancedAnalytics = () => {
  const cohortData = [
    { month: 'Jan', newUsers: 1200, returning: 800, churned: 150 },
    { month: 'Feb', newUsers: 1400, returning: 950, churned: 180 },
    { month: 'Mar', newUsers: 1100, returning: 1100, churned: 120 },
    { month: 'Apr', newUsers: 1600, returning: 1250, churned: 200 },
    { month: 'May', newUsers: 1800, returning: 1400, churned: 220 },
    { month: 'Jun', newUsers: 2100, returning: 1650, churned: 180 },
  ];

  const funnelData = [
    { stage: 'Visits', value: 10000, rate: 100 },
    { stage: 'Product View', value: 6500, rate: 65 },
    { stage: 'Add to Cart', value: 2800, rate: 28 },
    { stage: 'Checkout', value: 1200, rate: 12 },
    { stage: 'Purchase', value: 800, rate: 8 },
  ];

  const revenueBreakdown = [
    { category: 'Electronics', value: 45000, growth: 12 },
    { category: 'Accessories', value: 28000, growth: 8 },
    { category: 'Furniture', value: 18000, growth: 15 },
    { category: 'Home', value: 12000, growth: -3 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Deep dive into your store's performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-40 glass">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="glass">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button className="gradient-primary text-primary-foreground">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Cohort Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="newUsers" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} name="New Users" />
                <Bar dataKey="returning" fill="hsl(243, 75%, 59%)" radius={[4, 4, 0, 0]} name="Returning" />
                <Line type="monotone" dataKey="churned" stroke="hsl(0, 84%, 60%)" strokeWidth={2} name="Churned" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((item, index) => (
                <div key={item.stage} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.stage}</span>
                    <span className="text-muted-foreground">{item.value.toLocaleString()} ({item.rate}%)</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all duration-500"
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-success" />
            Revenue by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {revenueBreakdown.map((item) => (
              <div key={item.category} className="p-4 rounded-xl bg-muted/50 space-y-2">
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <p className="text-2xl font-bold">${(item.value / 1000).toFixed(0)}K</p>
                <div className={`text-sm font-medium ${item.growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {item.growth >= 0 ? '+' : ''}{item.growth}% vs last period
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
