
import { useMemo } from 'react';
import { useDeal } from '@/context/DealContext';
import Layout from '@/components/layout/Layout';
import { formatCurrency, calculateAverageTimeInStage } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DealStage } from '@/types';

const Reports = () => {
  const { deals, isLoading } = useDeal();
  
  const reportData = useMemo(() => {
    if (!deals.length) return null;
    
    // Deal stages for reporting
    const stages: DealStage[] = [
      'Lead Identified',
      'Discovery Call',
      'RFP/RFI Submitted',
      'Demo Presented',
      'Contract Negotiation',
      'Closed Won',
      'Closed Lost',
    ];
    
    // Stage colors
    const stageColors: Record<string, string> = {
      'Lead Identified': '#9b87f5',
      'Discovery Call': '#6e9aff',
      'RFP/RFI Submitted': '#4fb7ff',
      'Demo Presented': '#26d1ff',
      'Contract Negotiation': '#0ea5e9',
      'Closed Won': '#10b981',
      'Closed Lost': '#f43f5e',
    };
    
    // Count deals and sum values by stage
    const dealsByStage = stages.map(stage => {
      const stageDeals = deals.filter(deal => deal.stage === stage);
      
      return {
        name: stage,
        value: stageDeals.length,
        dealValue: stageDeals.reduce((sum, deal) => sum + deal.dealValue, 0),
        color: stageColors[stage],
      };
    });
    
    // Calculate total pipeline value
    const totalPipelineValue = dealsByStage.reduce((sum, item) => sum + item.dealValue, 0);
    
    // Count by client type
    const clientTypes = ['Commercial', 'Medicaid', 'Medicare'];
    const dealsByType = clientTypes.map(type => {
      const typeDeals = deals.filter(deal => deal.clientType === type);
      
      return {
        name: type,
        value: typeDeals.length,
        dealValue: typeDeals.reduce((sum, deal) => sum + deal.dealValue, 0),
      };
    });
    
    // Count by lead source
    const leadSources = ['Referral', 'Website', 'Event', 'LinkedIn', 'Direct', 'Other'];
    const dealsBySource = leadSources.map(source => {
      const sourceDeals = deals.filter(deal => deal.leadSource === source);
      
      return {
        name: source,
        value: sourceDeals.length,
        dealValue: sourceDeals.reduce((sum, deal) => sum + deal.dealValue, 0),
      };
    }).sort((a, b) => b.value - a.value);
    
    // Win rate calculation
    const closedDeals = deals.filter(
      deal => deal.stage === 'Closed Won' || deal.stage === 'Closed Lost'
    );
    const wonDeals = deals.filter(deal => deal.stage === 'Closed Won');
    
    const winRate = closedDeals.length > 0 
      ? (wonDeals.length / closedDeals.length) * 100 
      : 0;
    
    // Average time in stages
    const avgTimeInStage = calculateAverageTimeInStage(deals);
    
    const timeInStageData = stages
      .filter(stage => avgTimeInStage[stage]) // Only include stages with data
      .map(stage => ({
        name: stage,
        days: avgTimeInStage[stage] || 0,
        color: stageColors[stage],
      }));
    
    return {
      dealsByStage,
      totalPipelineValue,
      dealsByType,
      dealsBySource,
      winRate,
      timeInStageData,
    };
  }, [deals]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-popover border border-border p-3 rounded-md shadow-sm">
          <p className="font-medium">{label || payload[0].name}</p>
          <p className="text-primary">
            {payload[0].dataKey === 'dealValue' 
              ? formatCurrency(payload[0].value) 
              : payload[0].dataKey === 'days'
                ? `${payload[0].value} days`
                : `${payload[0].value} deals`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : !reportData ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No data available</h3>
            <p className="text-muted-foreground mt-1">
              Start adding deals to see reports and analytics
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Pipeline Value</CardTitle>
                  <CardDescription>Total value of all deals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {formatCurrency(reportData.totalPipelineValue)}
                  </div>
                  <div className="mt-4 space-y-2">
                    {reportData.dealsByStage.slice(0, 3).map(item => (
                      <div key={item.name} className="flex justify-between items-center">
                        <span className="text-sm">{item.name}</span>
                        <span className="font-medium">{formatCurrency(item.dealValue)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Win Rate</CardTitle>
                  <CardDescription>Closed won vs. total closed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {reportData.winRate.toFixed(1)}%
                  </div>
                  <div className="mt-4">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-stage-closedwon" 
                        style={{ width: `${reportData.winRate}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-muted-foreground">0%</span>
                      <span className="text-xs text-muted-foreground">100%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Deal Flow</CardTitle>
                  <CardDescription>Distribution by client type</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.dealsByType}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          label
                        >
                          {reportData.dealsByType.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={['#9b87f5', '#6e9aff', '#0ea5e9'][index % 3]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="pipeline" className="mt-8">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
                <TabsTrigger value="source">Lead Sources</TabsTrigger>
                <TabsTrigger value="time">Time in Stage</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pipeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Deal Distribution by Stage</CardTitle>
                    <CardDescription>
                      Number and value of deals in each stage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reportData.dealsByStage}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60,
                          }}
                        >
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            height={70} 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                          <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            tickFormatter={(value) => `$${value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value}`}
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar yAxisId="left" dataKey="value" name="Deal Count" fill="#9b87f5" radius={[4, 4, 0, 0]} barSize={30} />
                          <Bar yAxisId="right" dataKey="dealValue" name="Deal Value" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="source">
                <Card>
                  <CardHeader>
                    <CardTitle>Lead Source Distribution</CardTitle>
                    <CardDescription>
                      Number of deals by lead source
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reportData.dealsBySource}
                          layout="vertical"
                          margin={{
                            top: 20,
                            right: 30,
                            left: 60,
                            bottom: 20,
                          }}
                        >
                          <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" name="Deal Count" fill="#9b87f5" radius={[0, 4, 4, 0]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="time">
                <Card>
                  <CardHeader>
                    <CardTitle>Average Time in Stage</CardTitle>
                    <CardDescription>
                      Average number of days deals spend in each stage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reportData.timeInStageData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60,
                          }}
                        >
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            height={70} 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="days" name="Days" radius={[4, 4, 0, 0]} barSize={30}>
                            {reportData.timeInStageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
