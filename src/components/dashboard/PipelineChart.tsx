
import { useMemo, useState } from 'react';
import { Deal, DealStage, stageProbability } from '@/types';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PipelineChartProps {
  deals: Deal[];
}

interface ChartData {
  name: string;
  value: number;
  weightedValue: number;
  fillColor: string;
}

type ValueType = 'dealValue' | 'annualRecurringRevenue';

const PipelineChart = ({ deals }: PipelineChartProps) => {
  const [showWeightedValue, setShowWeightedValue] = useState(false);
  const [valueType, setValueType] = useState<ValueType>('dealValue');

  const stageColors: Record<string, string> = {
    'Lead Identified': '#9b87f5',
    'Discovery Call': '#6e9aff',
    'RFP/RFI Submitted': '#4fb7ff',
    'Demo Presented': '#26d1ff',
    'Contract Negotiation': '#0ea5e9',
    'Closed Won': '#10b981',
    'Closed Lost': '#f43f5e',
  };
  
  const chartData = useMemo(() => {
    const activeStages: DealStage[] = [
      'Lead Identified',
      'Discovery Call',
      'RFP/RFI Submitted',
      'Demo Presented',
      'Contract Negotiation',
    ];
    
    return activeStages.map((stage) => {
      const stageDeals = deals.filter((deal) => deal.stage === stage);
      
      let totalValue = 0;
      let weightedValue = 0;
      
      stageDeals.forEach(deal => {
        // Handle missing ARR
        const value = valueType === 'annualRecurringRevenue' ? 
          deal.annualRecurringRevenue || deal.dealValue / 3 : // Estimate ARR if missing
          deal.dealValue;
        
        totalValue += value;
        weightedValue += value * (stageProbability[stage] / 100);
      });
      
      return {
        name: stage,
        value: totalValue,
        weightedValue: weightedValue,
        fillColor: stageColors[stage],
      };
    });
  }, [deals, valueType]);

  const formatYAxis = (value: number) => {
    if (value === 0) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };
  
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip bg-popover border border-border p-3 rounded-md shadow-sm">
          <p className="font-medium">{data.name}</p>
          {showWeightedValue ? (
            <>
              <p className="text-primary">
                Weighted: {formatTooltipValue(data.weightedValue)}
              </p>
              <p className="text-muted-foreground text-xs">
                Total: {formatTooltipValue(data.value)}
              </p>
            </>
          ) : (
            <p className="text-primary">
              {formatTooltipValue(data.value)}
            </p>
          )}
          <p className="text-muted-foreground text-xs">
            Probability: {stageProbability[data.name]}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Pipeline Value by Stage</CardTitle>
            <CardDescription>
              {showWeightedValue ? "Weighted value" : "Total value"} of deals in each stage
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label 
                htmlFor="weighted-toggle" 
                className={!showWeightedValue ? "font-medium" : "text-muted-foreground"}
              >
                Total
              </Label>
              <Switch 
                id="weighted-toggle" 
                checked={showWeightedValue}
                onCheckedChange={setShowWeightedValue}
              />
              <Label 
                htmlFor="weighted-toggle" 
                className={showWeightedValue ? "font-medium" : "text-muted-foreground"}
              >
                Weighted
              </Label>
            </div>
            
            <div className="flex rounded-md border overflow-hidden">
              <Button
                variant={valueType === 'dealValue' ? 'default' : 'outline'} 
                size="sm"
                className="rounded-none"
                onClick={() => setValueType('dealValue')}
              >
                SaaS Value
              </Button>
              <Button
                variant={valueType === 'annualRecurringRevenue' ? 'default' : 'outline'} 
                size="sm"
                className="rounded-none"
                onClick={() => setValueType('annualRecurringRevenue')}
              >
                ARR
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={formatYAxis} 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
              <Bar 
                dataKey={showWeightedValue ? "weightedValue" : "value"} 
                radius={[4, 4, 0, 0]} 
                barSize={35}
                name={showWeightedValue ? "Weighted Value" : "Value"}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fillColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineChart;
