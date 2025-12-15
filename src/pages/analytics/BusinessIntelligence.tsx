import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';

const BusinessIntelligence = () => {
  const insights = [
    {
      type: 'opportunity',
      title: 'Cross-sell Opportunity',
      description: 'Customers who buy headphones are 65% likely to also purchase a carrying case.',
      impact: 'High',
      action: 'Create bundle offer',
    },
    {
      type: 'warning',
      title: 'Cart Abandonment Spike',
      description: 'Cart abandonment increased 15% this week. Most drop-offs occur at shipping selection.',
      impact: 'Critical',
      action: 'Review shipping options',
    },
    {
      type: 'trend',
      title: 'Mobile Traffic Surge',
      description: 'Mobile traffic increased 40% month-over-month. Mobile conversion rate is 2.1%.',
      impact: 'Medium',
      action: 'Optimize mobile UX',
    },
    {
      type: 'success',
      title: 'Top Performer',
      description: 'Smart Watch Pro sales increased 85% after price reduction. Consider restocking.',
      impact: 'High',
      action: 'Increase inventory',
    },
  ];

  const predictions = [
    { metric: 'Next Week Revenue', prediction: '$42,500', confidence: 87 },
    { metric: 'Holiday Season Sales', prediction: '+156%', confidence: 92 },
    { metric: 'Customer Lifetime Value', prediction: '$285', confidence: 78 },
    { metric: 'Churn Risk (30 days)', prediction: '8.2%', confidence: 84 },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Lightbulb className="h-5 w-5 text-primary" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-info" />;
      case 'success':
        return <Target className="h-5 w-5 text-success" />;
      default:
        return <Zap className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
          <p className="text-muted-foreground">
            AI-powered insights and predictions for your business.
          </p>
        </div>
        <Badge className="gradient-primary text-primary-foreground">
          <Brain className="mr-2 h-4 w-4" />
          AI Powered
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-muted/50 space-y-3 border border-border/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <span className="font-semibold">{insight.title}</span>
                    </div>
                    <Badge
                      variant={insight.impact === 'Critical' ? 'destructive' : insight.impact === 'High' ? 'default' : 'secondary'}
                    >
                      {insight.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <Button size="sm" variant="outline" className="w-full">
                    {insight.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent" />
              Predictive Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.map((pred) => (
                <div key={pred.metric} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{pred.metric}</span>
                    <span className="font-bold text-primary">{pred.prediction}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary rounded-full"
                        style={{ width: `${pred.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{pred.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="font-medium text-sm text-success">Increase Smart Watch Pro inventory</p>
                <p className="text-xs text-muted-foreground mt-1">Expected to sell out in 5 days</p>
              </div>
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="font-medium text-sm text-warning">Review shipping costs</p>
                <p className="text-xs text-muted-foreground mt-1">High abandonment at checkout</p>
              </div>
              <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                <p className="font-medium text-sm text-info">Launch email campaign</p>
                <p className="text-xs text-muted-foreground mt-1">Best time: Tuesday 10 AM</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="font-medium text-sm text-primary">Create product bundle</p>
                <p className="text-xs text-muted-foreground mt-1">Headphones + Case = +65% conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessIntelligence;
