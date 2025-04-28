
import { useMemo } from 'react';
import { Deal, DealStage } from '@/types';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface PipelineChartProps {
  deals: Deal[];
}

interface ChartData {
  name: string;
  value: number;
  fillColor: string;
}

const PipelineChart = ({ deals }: PipelineChartProps) => {
  const stageColors: Record<string, string> = {
    'Lead Identified': '#9b87f5',
    'Discovery Call': '#6e9aff',
    'RFP/RFI Submitted': '#4fb7ff',
    'Demo Presented': '#26d1ff',
    'Contract Negotiation': '#0ea5e9',
    'Closed Won': '#10b981',
    'Closed Lost': '#f43f5e',
  };
  
  // Prepare data for chart
  const chartData = useMemo(() => {
    const activeStages: DealStage[] = [
      'Lead Identified',
      'Discovery Call',
      'RFP/RFI Submitted',
      'Demo Presented',
      'Contract Negotiation',
    ];
    
    // Group deals by stage and sum value
    return activeStages.map((stage) => {
      const stageDeals = deals.filter((deal) => deal.stage === stage);
      const totalValue = stageDeals.reduce(
        (sum, deal) => sum + deal.dealValue, 
        0
      );
      
      return {
        name: stage,
        value: totalValue,
        fillColor: stageColors[stage],
      };
    });
  }, [deals]);

  // Format y-axis ticks as currency
  const formatYAxis = (value: number) => {
    if (value === 0) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };
  
  // Format tooltip values
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
          <p className="text-primary">
            {formatTooltipValue(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Pipeline Value by Stage</CardTitle>
        <CardDescription>
          Total value of deals in each stage of the sales pipeline
        </CardDescription>
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
                dataKey="value" 
                radius={[4, 4, 0, 0]} 
                barSize={35}
                fill="#8884d8"
                dataKeyCircle="fillColor"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineChart;
