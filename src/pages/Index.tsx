
import { useDeal } from '@/context/DealContext';
import Layout from '@/components/layout/Layout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import PipelineChart from '@/components/dashboard/PipelineChart';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import PipelineChanges from '@/components/dashboard/PipelineChanges';
import { useIsMobile } from '@/hooks/use-mobile';
import DealCard from '@/components/deals/DealCard';
import { mockUsers } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { deals, isLoading } = useDeal();
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();

  const getRecentDeals = () => {
    if (!currentUser) return [];
    
    // Get user's own deals first, then other deals, sorted by recency
    return deals
      .filter(deal => 
        deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost'
      )
      .sort((a, b) => {
        // First sort by owner
        if (a.ownerId === currentUser.id && b.ownerId !== currentUser.id) return -1;
        if (a.ownerId !== currentUser.id && b.ownerId === currentUser.id) return 1;
        
        // Then sort by recency of update
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, 3);
  };

  const recentDeals = getRecentDeals();

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <DashboardStats deals={deals} />
            
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6`}>
              <PipelineChart deals={deals} />
              <ActivityFeed deals={deals} />
            </div>
            
            <PipelineChanges />
            
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Active Deals</h2>
                <a href="/pipeline" className="text-primary hover:underline text-sm">View all</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
