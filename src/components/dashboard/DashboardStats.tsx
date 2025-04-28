
import { useMemo } from 'react';
import { Deal, DealStage } from '@/types';
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

interface DashboardStatsProps {
  deals: Deal[];
}

const DashboardStats = ({ deals }: DashboardStatsProps) => {
  // Calculate summary statistics
  const stats = useMemo(() => {
    // Only consider active deals (not closed)
    const activeDeals = deals.filter(
      (deal) => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost'
    );
    
    // Total pipeline value
    const totalValue = activeDeals.reduce(
      (sum, deal) => sum + deal.dealValue, 
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
      totalDeals,
      dealCountByStage,
      dealsWon,
      dealsLost,
      winRate,
    };
  }, [deals]);

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Pipeline Value</CardTitle>
          <CardDescription>Total value of active deals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold flex items-center">
            <DollarSign className="h-6 w-6 text-muted-foreground mr-1" />
            {formatCurrency(stats.totalValue)}
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
  );
};

export default DashboardStats;
