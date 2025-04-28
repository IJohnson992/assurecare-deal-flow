
import { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { DealChange, ChangeType } from '@/types';
import { useDeal } from '@/context/DealContext';
import { formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  CheckCircle2,
  XCircle,
  DollarSign,
  Calendar,
  Clock
} from 'lucide-react';

interface PipelineChangesProps {}

// Predefined time ranges
const TIME_RANGES = {
  LAST_7_DAYS: 'last7Days',
  LAST_30_DAYS: 'last30Days',
  CUSTOM: 'custom',
};

const PipelineChanges = ({}: PipelineChangesProps) => {
  // State for tabs and date range
  const [activeTab, setActiveTab] = useState('changes');
  const [timeRange, setTimeRange] = useState(TIME_RANGES.LAST_7_DAYS);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  
  const { deals, dealChanges, getChangesByDateRange } = useDeal();
  
  // Update date range when preset range changes
  const handleTimeRangeChange = (range: string) => {
    const now = new Date();
    
    switch (range) {
      case TIME_RANGES.LAST_7_DAYS:
        setStartDate(subDays(now, 7));
        setEndDate(now);
        setTimeRange(range);
        break;
      case TIME_RANGES.LAST_30_DAYS:
        setStartDate(subDays(now, 30));
        setEndDate(now);
        setTimeRange(range);
        break;
      case TIME_RANGES.CUSTOM:
        setTimeRange(range);
        // When switching to custom, initialize with current date range
        if (!customStartDate) setCustomStartDate(startDate);
        if (!customEndDate) setCustomEndDate(endDate);
        break;
    }
  };
  
  // Apply custom date range
  const applyCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      setStartDate(customStartDate);
      setEndDate(customEndDate);
    }
  };
  
  // Get filtered changes based on date range
  const filteredChanges = useMemo(() => {
    return getChangesByDateRange(startDate, endDate);
  }, [getChangesByDateRange, startDate, endDate]);
  
  // Function to get deal name by ID
  const getDealName = (dealId: string): string => {
    const deal = deals.find((d) => d.id === dealId);
    return deal ? deal.clientName : 'Unknown Deal';
  };
  
  // Summary metrics for the activity tab
  const summaryMetrics = useMemo(() => {
    const stageProgressed = filteredChanges.filter(change => 
      change.changeType === 'stage_changed' && 
      getStageOrder(change.previousValue) < getStageOrder(change.newValue) &&
      change.newValue !== 'Closed Won' && change.newValue !== 'Closed Lost'
    ).length;
    
    const stageRegressed = filteredChanges.filter(change => 
      change.changeType === 'stage_changed' && 
      getStageOrder(change.previousValue) > getStageOrder(change.newValue)
    ).length;
    
    const newDeals = filteredChanges.filter(change => 
      change.changeType === 'deal_added'
    ).length;
    
    const closedWonDeals = filteredChanges.filter(change => 
      change.changeType === 'deal_closed' && change.newValue === 'Closed Won'
    );
    
    const closedLostDeals = filteredChanges.filter(change => 
      change.changeType === 'deal_closed' && change.newValue === 'Closed Lost'
    );
    
    const closedWonValue = closedWonDeals.reduce((total, change) => {
      const deal = deals.find(d => d.id === change.dealId);
      return total + (deal?.dealValue || 0);
    }, 0);
    
    const closedLostValue = closedLostDeals.reduce((total, change) => {
      const deal = deals.find(d => d.id === change.dealId);
      return total + (deal?.dealValue || 0);
    }, 0);
    
    // Calculate net revenue changes
    let netArrChange = 0;
    let netImplementationChange = 0;
    
    filteredChanges.forEach(change => {
      if (change.changeType === 'arr_updated' || change.changeType === 'arr_year1_updated') {
        const oldValue = change.previousValue || 0;
        const newValue = change.newValue || 0;
        netArrChange += (newValue - oldValue);
      }
      
      if (change.changeType === 'implementation_revenue_updated') {
        const oldValue = change.previousValue || 0;
        const newValue = change.newValue || 0;
        netImplementationChange += (newValue - oldValue);
      }
    });
    
    return {
      stageProgressed,
      stageRegressed,
      newDeals,
      closedWon: closedWonDeals.length,
      closedLost: closedLostDeals.length,
      closedWonValue,
      closedLostValue,
      netArrChange,
      netImplementationChange,
      totalNetChange: netArrChange + netImplementationChange + closedWonValue - closedLostValue
    };
  }, [filteredChanges, deals]);
  
  // Map change type to icon and description
  const getChangeIcon = (changeType: ChangeType) => {
    switch (changeType) {
      case 'stage_changed':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      case 'deal_added':
        return <PlusCircle className="h-4 w-4 text-green-500" />;
      case 'deal_closed':
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />;
      case 'arr_updated':
      case 'arr_year1_updated':
      case 'implementation_revenue_updated':
        return <DollarSign className="h-4 w-4 text-yellow-500" />;
      case 'timeline_updated':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Format change description
  const getChangeDescription = (change: DealChange): string => {
    const dealName = getDealName(change.dealId);
    
    switch (change.changeType) {
      case 'stage_changed':
        return `${dealName} moved from ${change.previousValue} to ${change.newValue}`;
      case 'deal_added':
        return `New deal added: ${dealName}`;
      case 'deal_closed':
        return `Deal closed ${change.newValue === 'Closed Won' ? 'WON' : 'LOST'}: ${dealName}`;
      case 'arr_updated':
        return `ARR updated for ${dealName}`;
      case 'arr_year1_updated':
        return `Year 1 ARR updated for ${dealName}`;
      case 'implementation_revenue_updated':
        return `Implementation revenue updated for ${dealName}`;
      case 'timeline_updated':
        const newTimeline = change.newValue;
        return `Implementation timeline updated for ${dealName}`;
      default:
        return `Change in ${dealName}`;
    }
  };
  
  // Format amount change for financial updates
  const getAmountChange = (change: DealChange): string | null => {
    const isFinancial = ['arr_updated', 'arr_year1_updated', 'implementation_revenue_updated'].includes(change.changeType);
    
    if (!isFinancial) return null;
    
    const oldValue = change.previousValue || 0;
    const newValue = change.newValue || 0;
    const diff = newValue - oldValue;
    
    return diff > 0 ? 
      `+${formatCurrency(diff)}` : 
      `${formatCurrency(diff)}`;
  };
  
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Pipeline Changes</CardTitle>
        <CardDescription>
          Recent changes in your sales pipeline
        </CardDescription>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="changes">Changes List</TabsTrigger>
              <TabsTrigger value="summary">Activity Summary</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {timeRange !== TIME_RANGES.CUSTOM ? (
              <div className="flex gap-1 w-full sm:w-auto">
                <Button 
                  variant={timeRange === TIME_RANGES.LAST_7_DAYS ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleTimeRangeChange(TIME_RANGES.LAST_7_DAYS)}
                  className="flex-1 sm:flex-none"
                >
                  Last 7 Days
                </Button>
                <Button 
                  variant={timeRange === TIME_RANGES.LAST_30_DAYS ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleTimeRangeChange(TIME_RANGES.LAST_30_DAYS)}
                  className="flex-1 sm:flex-none"
                >
                  Last 30 Days
                </Button>
                <Button 
                  variant={timeRange === TIME_RANGES.CUSTOM ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleTimeRangeChange(TIME_RANGES.CUSTOM)}
                  className="flex-1 sm:flex-none"
                >
                  Custom
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row w-full gap-2">
                <DateRangePicker
                  startDate={customStartDate}
                  endDate={customEndDate}
                  onStartDateChange={setCustomStartDate}
                  onEndDateChange={setCustomEndDate}
                  placeholder="Select date range"
                />
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    onClick={applyCustomDateRange} 
                    disabled={!customStartDate || !customEndDate}
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setTimeRange(TIME_RANGES.LAST_7_DAYS)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TabsContent value="changes" className="mt-0">
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Showing changes from {format(startDate, 'MMM d, yyyy')} to {format(endDate, 'MMM d, yyyy')}
            </div>
            
            {filteredChanges.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No changes found in the selected time period
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {filteredChanges.map((change) => (
                  <div key={change.id} className="flex items-start gap-3 border-b pb-3">
                    <div className="mt-0.5">
                      {getChangeIcon(change.changeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {getChangeDescription(change)}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(change.timestamp), 'MMM d, h:mm a')}
                      </div>
                    </div>
                    {getAmountChange(change) && (
                      <div className={`text-sm font-medium ${
                        (change.newValue || 0) > (change.previousValue || 0) 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {getAmountChange(change)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="summary" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Deal Progression</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Progressed Deals</span>
                    </div>
                    <span className="font-medium">{summaryMetrics.stageProgressed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm">Regressed Deals</span>
                    </div>
                    <span className="font-medium">{summaryMetrics.stageRegressed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <PlusCircle className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm">New Deals</span>
                    </div>
                    <span className="font-medium">{summaryMetrics.newDeals}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Closed Deals</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Won</span>
                    </div>
                    <div>
                      <span className="font-medium">{summaryMetrics.closedWon}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({formatCurrency(summaryMetrics.closedWonValue)})
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm">Lost</span>
                    </div>
                    <div>
                      <span className="font-medium">{summaryMetrics.closedLost}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({formatCurrency(summaryMetrics.closedLostValue)})
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="sm:col-span-2">
              <CardHeader className="py-4">
                <CardTitle className="text-base">Revenue Impact</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Net ARR Change</span>
                    <span className={`font-medium ${
                      summaryMetrics.netArrChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(summaryMetrics.netArrChange)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Net Implementation Revenue</span>
                    <span className={`font-medium ${
                      summaryMetrics.netImplementationChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(summaryMetrics.netImplementationChange)}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Net Pipeline Growth</span>
                      <span className={`font-bold ${
                        summaryMetrics.totalNetChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(summaryMetrics.totalNetChange)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
};

// Helper function to determine deal stage order for progression tracking
function getStageOrder(stage: string): number {
  const stageOrder = {
    'Lead Identified': 0,
    'Discovery Call': 1,
    'RFP/RFI Submitted': 2,
    'Demo Presented': 3,
    'Contract Negotiation': 4,
    'Closed Won': 5,
    'Closed Lost': 5
  };
  
  return stageOrder[stage as keyof typeof stageOrder] || 0;
}

export default PipelineChanges;
