
import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Deal, DealStage, stageProbability } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, 
  CheckCircle, 
  Clock, 
  DollarSign 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getUserPreferences, updateUserPreferences } from '@/integrations/supabase/client';

interface DashboardStatsProps {
  deals: Deal[];
}

const DashboardStats = ({ deals }: DashboardStatsProps) => {
  const { currentUser } = useAuth();
  const [valueType, setValueType] = useState<'total' | 'arr'>('total');
  
  // Load user preferences
  useEffect(() => {
    if (currentUser) {
      const loadUserPreferences = async () => {
        try {
          const preferences = await getUserPreferences(currentUser.id);
          if (preferences) {
            setValueType(preferences.dashboard_value_type);
          }
        } catch (error) {
          console.error("Error loading user preferences:", error);
        }
      };
      
      loadUserPreferences();
    }
  }, [currentUser]);
  
  // Handle value type change
  const handleValueTypeChange = async (newType: 'total' | 'arr') => {
    setValueType(newType);
    
    if (currentUser) {
      try {
        await updateUserPreferences(currentUser.id, {
          dashboard_value_type: newType
        });
      } catch (error) {
        console.error("Error updating user preferences:", error);
      }
    }
  };
  
  // Calculate summary statistics
  const stats = useMemo(() => {
    // Only consider active deals (not closed)
    const activeDeals = deals.filter(
      (deal) => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost'
    );
    
    // Total pipeline value - different calculation based on valueType
    const totalValue = activeDeals.reduce(
      (sum, deal) => sum + (valueType === 'total' ? deal.dealValue : (deal.annualRecurringRevenue || 0)), 
      0
    );
    
    // Total weighted pipeline value
    const totalWeightedValue = activeDeals.reduce(
      (sum, deal) => {
        const probability = stageProbability[deal.stage] / 100;
        const value = valueType === 'total' ? deal.dealValue : (deal.annualRecurringRevenue || 0);
        return sum + (value * probability);
      }, 
      0
    );
    
    // Count of deals in each stage
    const dealCountByStage = activeDeals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {} as Record<DealStage, number>);
    
    // Total active deals
    const totalDeals = activeDeals.length;
    
    // Count deals won
    const dealsWon = deals.filter(deal => deal.stage === 'Closed Won').length;
    
    // Count deals lost
    const dealsLost = deals.filter(deal => deal.stage === 'Closed Lost').length;
    
    // Win rate
    const closedDeals = dealsWon + dealsLost;
    const winRate = closedDeals > 0 ? (dealsWon / closedDeals) * 100 : 0;
    
    return {
      totalValue,
      totalWeightedValue,
      totalDeals,
      dealCountByStage,
      dealsWon,
      dealsLost,
      winRate,
    };
  }, [deals, valueType]);

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end items-center gap-2">
        <Label 
          htmlFor="value-type-toggle" 
          className={valueType === 'total' ? "font-medium" : "text-muted-foreground"}
        >
          SaaS Value
        </Label>
        <Switch 
          id="value-type-toggle" 
          checked={valueType === 'arr'}
          onCheckedChange={(checked) => handleValueTypeChange(checked ? 'arr' : 'total')}
        />
        <Label 
          htmlFor="value-type-toggle" 
          className={valueType === 'arr' ? "font-medium" : "text-muted-foreground"}
        >
          ARR
        </Label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Pipeline Value</CardTitle>
            <CardDescription>Total {valueType === 'total' ? 'SaaS' : 'ARR'} value of active deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center">
              <DollarSign className="h-6 w-6 text-muted-foreground mr-1" />
              {formatCurrency(stats.totalValue)}
            </div>
            <div className="text-sm text-muted-foreground">
              Weighted: {formatCurrency(stats.totalWeightedValue)}
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            Across {stats.totalDeals} active deals
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Active Deals</CardTitle>
            <CardDescription>Deals in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center">
              <BarChart className="h-6 w-6 text-muted-foreground mr-1" />
              {stats.totalDeals}
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex justify-between text-xs">
            <div className="text-stage-discovery font-medium">
              {stats.dealCountByStage['Discovery Call'] || 0} in Discovery
            </div>
            <div className="text-stage-negotiation font-medium">
              {stats.dealCountByStage['Contract Negotiation'] || 0} in Negotiation
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Win Rate</CardTitle>
            <CardDescription>Deals won vs. closed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center">
              <CheckCircle className="h-6 w-6 text-muted-foreground mr-1" />
              {formatPercentage(stats.winRate)}
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex justify-between text-xs">
            <div className="text-stage-closedwon font-medium">
              {stats.dealsWon} Won
            </div>
            <div className="text-stage-closedlost font-medium">
              {stats.dealsLost} Lost
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Avg. Deal Time</CardTitle>
            <CardDescription>Days to close deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center">
              <Clock className="h-6 w-6 text-muted-foreground mr-1" />
              65
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            Based on last 6 months data
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
