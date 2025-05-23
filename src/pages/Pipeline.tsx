
import { useState, useMemo, useEffect } from 'react';
import { useDeal } from '@/context/DealContext';
import Layout from '@/components/layout/Layout';
import DealCard from '@/components/deals/DealCard';
import PipelineTable from '@/components/deals/PipelineTable';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ClientType, Deal, DealStage } from '@/types';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getUserPreferences, updateUserPreferences } from '@/integrations/supabase/client';

const Pipeline = () => {
  const { deals, isLoading } = useDeal();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // View type state
  const [viewType, setViewType] = useState<'card' | 'list'>('card');
  
  // Filter state
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<string>("recent");
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  
  // Load user preferences
  useEffect(() => {
    if (currentUser) {
      const loadUserPreferences = async () => {
        try {
          const preferences = await getUserPreferences(currentUser.id);
          if (preferences) {
            // Fix: Parse the string to our typed value
            setViewType(preferences.pipeline_view_type as 'card' | 'list');
          }
        } catch (error) {
          console.error("Error loading user preferences:", error);
        }
      };
      
      loadUserPreferences();
    }
  }, [currentUser]);
  
  // Save user preferences when view type changes
  const handleViewTypeChange = async (newViewType: 'card' | 'list') => {
    setViewType(newViewType);
    
    if (currentUser) {
      try {
        await updateUserPreferences(currentUser.id, {
          pipeline_view_type: newViewType
        });
      } catch (error) {
        console.error("Error updating user preferences:", error);
        toast({
          title: "Error",
          description: "Could not save your view preference.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    if (!deals) return [];
    
    // Start with basic filters
    return deals
      .filter(deal => {
        // Active deals filter
        if (showActiveOnly && !deal.isActive) return false;
        
        // Stage filter
        if (stageFilter !== "all" && deal.stage !== stageFilter) return false;
        
        // Client type filter
        if (clientTypeFilter !== "all" && deal.clientType !== clientTypeFilter) return false;
        
        // Search filter (case insensitive)
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          if (!deal.clientName.toLowerCase().includes(term)) return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort logic
        if (sort === "value-high") return b.dealValue - a.dealValue;
        if (sort === "value-low") return a.dealValue - b.dealValue;
        if (sort === "alphabetical") return a.clientName.localeCompare(b.clientName);
        
        // Default: recent (by updated date)
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [deals, stageFilter, clientTypeFilter, searchTerm, sort, showActiveOnly]);

  // Get unique stages for filter
  const stages: DealStage[] = [
    'Lead Identified',
    'Discovery Call',
    'RFP/RFI Submitted',
    'Demo Presented',
    'Contract Negotiation',
    'Closed Won',
    'Closed Lost',
  ];
  
  // Client types for filter
  const clientTypes: ClientType[] = ['Commercial', 'Medicaid', 'Medicare'];
  
  // Sort options
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'value-high', label: 'Highest Value' },
    { value: 'value-low', label: 'Lowest Value' },
    { value: 'alphabetical', label: 'Alphabetical' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Deal Pipeline</h1>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search deals..."
                className="pl-10 pr-3 py-2 w-full sm:w-auto border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-2">
              <Switch 
                id="active-deals"
                checked={showActiveOnly}
                onCheckedChange={setShowActiveOnly}
              />
              <Label htmlFor="active-deals">Active Deals Only</Label>
            </div>
            
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectGroup>
                  <SelectLabel>Stages</SelectLabel>
                  {stages.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={clientTypeFilter} onValueChange={setClientTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {clientTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                variant={viewType === 'card' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none px-3"
                onClick={() => handleViewTypeChange('card')}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Cards
              </Button>
              <Button
                variant={viewType === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none px-3"
                onClick={() => handleViewTypeChange('list')}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
          </div>
          
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No deals found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        ) : viewType === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <PipelineTable deals={filteredDeals} />
        )}
      </div>
    </Layout>
  );
};

export default Pipeline;
