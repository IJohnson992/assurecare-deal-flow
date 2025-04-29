
import { useState, useMemo, useEffect } from 'react';
import { subDays, format, isAfter, startOfDay, endOfDay, parseISO } from 'date-fns';
import { useDeal } from '@/context/DealContext';
import { mockUsers } from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';
import { ChangeType, DealChange, Deal } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getUserPreferences } from '@/integrations/supabase/client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRight,
  ArrowDownRight,
  PlusIcon,
  CircleX,
} from 'lucide-react';

const timeRanges = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
];

const PipelineChanges = () => {
  const { dealChanges, deals, isLoading } = useDeal();
  const { currentUser } = useAuth();
  const [timeRange, setTimeRange] = useState('7');
  const [valueType, setValueType] = useState<'total' | 'arr'>('total');
  
  // Load user preferences
  useEffect(() => {
    if (currentUser) {
      const loadUserPreferences = async () => {
        try {
          const preferences = await getUserPreferences(currentUser.id);
          if (preferences) {
            // Fix: Parse the string to our typed value
            setValueType(preferences.dashboard_value_type as 'total' | 'arr');
          }
        } catch (error) {
          console.error("Error loading user preferences:", error);
        }
      };
      
      loadUserPreferences();
    }
  }, [currentUser]);
  
  // Filter changes based on the selected time range
  const filteredChanges = useMemo(() => {
    const daysToSubtract = parseInt(timeRange, 10);
    const startDate = startOfDay(subDays(new Date(), daysToSubtract));
    
    return dealChanges.filter(change => {
      const changeDate = typeof change.timestamp === 'string'
        ? parseISO(change.timestamp)
        : new Date(change.timestamp);
        
      return isAfter(changeDate, startDate);
    });
  }, [dealChanges, timeRange]);
  
  // Calculate the summary metrics
  const changeSummary = useMemo(() => {
    // Find deals added in the time range
    const newDealsChanges = filteredChanges.filter(change => change.changeType === 'deal_added');
    const newDealIds = new Set(newDealsChanges.map(change => change.dealId));
    const newDeals = deals.filter(deal => newDealIds.has(deal.id));
    
    // Find deals advanced to later stages
    const stageChanges = filteredChanges.filter(change => change.changeType === 'stage_changed');
    const advancedDeals = stageChanges.filter(change => {
      const previousStageIndex = getStageIndex(change.previousValue);
      const newStageIndex = getStageIndex(change.newValue);
      return newStageIndex > previousStageIndex && change.newValue !== 'Closed Lost';
    });
    
    // Find deals that were closed (won or lost)
    const closedWonChanges = stageChanges.filter(change => change.newValue === 'Closed Won');
    const closedLostChanges = stageChanges.filter(change => change.newValue === 'Closed Lost');
    
    // Get unique deal IDs for each category
    const advancedDealIds = new Set(advancedDeals.map(change => change.dealId));
    const closedWonDealIds = new Set(closedWonChanges.map(change => change.dealId));
    const closedLostDealIds = new Set(closedLostChanges.map(change => change.dealId));
    
    // Calculate financial impact
    const totalNewValue = getTotalValue(newDeals);
    const totalNewARR = getTotalARR(newDeals);
    
    // Get the deals that were advanced 
    const advancedDealsData = deals.filter(deal => advancedDealIds.has(deal.id));
    const totalAdvancedValue = getTotalValue(advancedDealsData);
    const totalAdvancedARR = getTotalARR(advancedDealsData);
    
    // Get the deals that were closed won
    const closedWonDealsData = deals.filter(deal => closedWonDealIds.has(deal.id));
    const totalClosedWonValue = getTotalValue(closedWonDealsData);
    const totalClosedWonARR = getTotalARR(closedWonDealsData);
    
    // Get the deals that were closed lost
    const closedLostDealsData = deals.filter(deal => closedLostDealIds.has(deal.id));
    const totalClosedLostValue = getTotalValue(closedLostDealsData);
    const totalClosedLostARR = getTotalARR(closedLostDealsData);
    
    // Calculate net changes
    const netValueGrowth = totalNewValue + totalClosedWonValue - totalClosedLostValue;
    const netARRGrowth = totalNewARR + totalClosedWonARR - totalClosedLostARR;
    
    return {
      newDealsCount: newDeals.length,
      advancedDealsCount: advancedDealIds.size,
      closedWonCount: closedWonDealIds.size,
      closedLostCount: closedLostDealIds.size,
      totalNewValue,
      totalNewARR,
      totalAdvancedValue,
      totalAdvancedARR,
      totalClosedWonValue,
      totalClosedWonARR,
      totalClosedLostValue,
      totalClosedLostARR,
      netValueGrowth,
      netARRGrowth,
    };
  }, [filteredChanges, deals]);
  
  // Helper function to get total value of deals
  function getTotalValue(deals: Deal[]): number {
    return deals.reduce((sum, deal) => sum + deal.dealValue, 0);
  }
  
  // Helper function to get total ARR of deals
  function getTotalARR(deals: Deal[]): number {
    return deals.reduce((sum, deal) => sum + (deal.annualRecurringRevenue || 0), 0);
  }
  
  // Helper function to get stage index for comparison
  function getStageIndex(stage: string): number {
    const stages = [
      'Lead Identified',
      'Discovery Call',
      'RFP/RFI Submitted',
      'Demo Presented',
      'Contract Negotiation',
      'Closed Won',
    ];
    return stages.indexOf(stage);
  }
  
  // Render the friendly date for a change
  const renderFriendlyDate = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
    return format(date, 'MMM d, h:mm a');
  };
  
  // Render the user name for a change
  const renderUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };
  
  // Render the change description
  const renderChangeDescription = (change: DealChange) => {
    const deal = deals.find(d => d.id === change.dealId);
    if (!deal) return 'Unknown change';
    
    switch (change.changeType) {
      case 'deal_added':
        return (
          <span>
            <strong>{deal.clientName}</strong> was added to the pipeline
          </span>
        );
      case 'stage_changed':
        return (
          <span>
            <strong>{deal.clientName}</strong> moved from <strong>{change.previousValue}</strong> to <strong>{change.newValue}</strong>
          </span>
        );
      case 'deal_closed':
        return (
          <span>
            <strong>{deal.clientName}</strong> was marked as <strong>{change.newValue}</strong>
          </span>
        );
      case 'arr_updated':
        return (
          <span>
            <strong>{deal.clientName}</strong> ARR updated to <strong>{formatCurrency(change.newValue)}</strong>
          </span>
        );
      default:
        return `${deal.clientName}: ${change.changeType}`;
    }
  };
  
  // Render change icon based on type
  const renderChangeIcon = (change: DealChange) => {
    switch (change.changeType) {
      case 'deal_added':
        return <PlusIcon className="h-4 w-4 text-green-600" />;
      case 'stage_changed':
        const previousStageIndex = getStageIndex(change.previousValue);
        const newStageIndex = getStageIndex(change.newValue);
        if (newStageIndex > previousStageIndex) {
          return <ArrowUpRight className="h-4 w-4 text-green-600" />;
        } else {
          return <ArrowDownRight className="h-4 w-4 text-amber-600" />;
        }
      case 'deal_closed':
        return change.newValue === 'Closed Won' 
          ? <CheckIcon className="h-4 w-4 text-green-600" />
          : <CircleX className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Pipeline Changes</CardTitle>
            <CardDescription>Recent changes to your pipeline</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-md border ${changeSummary.netValueGrowth >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="text-sm font-medium text-muted-foreground">Net {valueType === 'total' ? 'SaaS Value' : 'ARR'} Growth</div>
            <div className="text-2xl font-bold">
              {formatCurrency(valueType === 'total' ? changeSummary.netValueGrowth : changeSummary.netARRGrowth)}
            </div>
          </div>
          
          <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
            <div className="text-sm font-medium text-muted-foreground">Deal Activity</div>
            <div className="text-2xl font-bold">
              {changeSummary.newDealsCount + changeSummary.advancedDealsCount + changeSummary.closedWonCount + changeSummary.closedLostCount}
            </div>
          </div>
        </div>
        
        {/* Summary categories */}
        <div className="space-y-3">
          {changeSummary.newDealsCount > 0 && (
            <div className="border rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <PlusIcon className="h-4 w-4 text-green-600" />
                <h4 className="font-medium">{changeSummary.newDealsCount} New Deals Added</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">SaaS Value Added</div>
                  <div className="font-medium">{formatCurrency(changeSummary.totalNewValue)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">ARR Added</div>
                  <div className="font-medium">{formatCurrency(changeSummary.totalNewARR)}</div>
                </div>
              </div>
            </div>
          )}
          
          {changeSummary.advancedDealsCount > 0 && (
            <div className="border rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <h4 className="font-medium">{changeSummary.advancedDealsCount} Deals Advanced</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">SaaS Value</div>
                  <div className="font-medium">{formatCurrency(changeSummary.totalAdvancedValue)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">ARR</div>
                  <div className="font-medium">{formatCurrency(changeSummary.totalAdvancedARR)}</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            {changeSummary.closedWonCount > 0 && (
              <div className="border rounded-md p-3 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckIcon className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium">{changeSummary.closedWonCount} Deals Won</h4>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">SaaS Value</div>
                  <div className="font-medium">{formatCurrency(changeSummary.totalClosedWonValue)}</div>
                  <div className="mt-1 text-muted-foreground">ARR</div>
                  <div className="font-medium">{formatCurrency(changeSummary.totalClosedWonARR)}</div>
                </div>
              </div>
            )}
            
            {changeSummary.closedLostCount > 0 && (
              <div className="border rounded-md p-3 bg-red-50 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <CircleX className="h-4 w-4 text-red-600" />
                  <h4 className="font-medium">{changeSummary.closedLostCount} Deals Lost</h4>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">SaaS Value</div>
                  <div className="font-medium">{formatCurrency(changeSummary.totalClosedLostValue)}</div>
                  <div className="mt-1 text-muted-foreground">ARR</div>
                  <div className="font-medium">{formatCurrency(changeSummary.totalClosedLostARR)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent activity */}
        <div className="mt-4">
          <h4 className="font-medium mb-2">Recent Activity</h4>
          <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {filteredChanges.slice(0, 10).map(change => (
              <li key={change.id} className="border-b pb-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {renderChangeIcon(change)}
                  </div>
                  <div>
                    <div>{renderChangeDescription(change)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      by {renderUserName(change.userId)} · {renderFriendlyDate(change.timestamp)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for CheckIcon since it's missing from the imports
const CheckIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default PipelineChanges;
