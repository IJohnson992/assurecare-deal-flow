
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
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Zap
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
            setValueType(preferences.dashboard_value_type as 'total' | 'arr');
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
  
  // Calculate comprehensive SaaS KPIs
  const stats = useMemo(() => {
    // Only consider active deals (not closed)
    const activeDeals = deals.filter(
      (deal) => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost'
    );
    
    // Closed won deals for CAC calculation
    const wonDeals = deals.filter(deal => deal.stage === 'Closed Won');
    const lostDeals = deals.filter(deal => deal.stage === 'Closed Lost');
    
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
    
    // Win rate
    const closedDeals = wonDeals.length + lostDeals.length;
    const winRate = closedDeals > 0 ? (wonDeals.length / closedDeals) * 100 : 0;
    
    // Average Deal Size
    const avgDealSize = wonDeals.length > 0 
      ? wonDeals.reduce((sum, deal) => sum + (valueType === 'total' ? deal.dealValue : (deal.annualRecurringRevenue || 0)), 0) / wonDeals.length
      : 0;
    
    // Customer Acquisition Cost (CAC) - simplified calculation
    // In a real scenario, this would include marketing and sales costs
    // Here we'll use a simplified model: total sales effort / customers acquired
    const assumedMonthlySalesCost = 50000; // Placeholder for monthly sales team cost
    const monthlyWonDeals = wonDeals.filter(deal => {
      const dealDate = new Date(deal.updatedAt);
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return dealDate >= monthAgo;
    }).length;
    
    const cac = monthlyWonDeals > 0 ? assumedMonthlySalesCost / monthlyWonDeals : 0;
    
    // Monthly Recurring Revenue (MRR) from won deals
    const mrr = wonDeals.reduce((sum, deal) => {
      return sum + ((deal.annualRecurringRevenue || 0) / 12);
    }, 0);
    
    // Sales Velocity (deals moving through pipeline per month)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentlyMovedDeals = deals.filter(deal => {
      return deal.stageHistory.some(stage => 
        new Date(stage.timestamp) >= thirtyDaysAgo && 
        stage.stage !== 'Lead Identified'
      );
    }).length;
    
    // Lead to Customer conversion rate
    const totalLeads = deals.filter(deal => 
      deal.stageHistory.some(stage => stage.stage === 'Lead Identified')
    ).length;
    const leadConversionRate = totalLeads > 0 ? (wonDeals.length / totalLeads) * 100 : 0;
    
    return {
      totalValue,
      totalWeightedValue,
      totalDeals: activeDeals.length,
      dealsWon: wonDeals.length,
      dealsLost: lostDeals.length,
      winRate,
      avgDealSize,
      cac,
      mrr,
      recentlyMovedDeals,
      leadConversionRate,
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
            <CardTitle className="text-base font-medium">Avg Deal Size</CardTitle>
            <CardDescription>Average value of won deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center">
              <Target className="h-6 w-6 text-muted-foreground mr-1" />
              {formatCurrency(stats.avgDealSize)}
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            Based on {stats.dealsWon} closed deals
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Customer CAC</CardTitle>
            <CardDescription>Customer acquisition cost</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center">
              <Users className="h-6 w-6 text-muted-foreground mr-1" />
              {formatCurrency(stats.cac)}
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            Monthly sales cost per customer
          </CardFooter>
        </Card>
      </div>

      {/* Secondary KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Monthly MRR</CardTitle>
            <CardDescription>Monthly recurring revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <TrendingUp className="h-5 w-5 text-muted-foreground mr-1" />
              {formatCurrency(stats.mrr)}
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            From {stats.dealsWon} won deals
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Sales Velocity</CardTitle>
            <CardDescription>Deals advanced (30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Zap className="h-5 w-5 text-muted-foreground mr-1" />
              {stats.recentlyMovedDeals}
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            Deals moved through pipeline
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Lead Conversion</CardTitle>
            <CardDescription>Lead to customer rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <BarChart className="h-5 w-5 text-muted-foreground mr-1" />
              {formatPercentage(stats.leadConversionRate)}
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            Overall conversion efficiency
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Avg. Deal Time</CardTitle>
            <CardDescription>Days to close deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-1" />
              65
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-muted-foreground">
            Based on historical data
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;
