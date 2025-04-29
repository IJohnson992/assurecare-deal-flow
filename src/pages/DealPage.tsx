
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '@/context/DealContext';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { mockUsers } from '@/data/mockData';
import { DealStage, stageProbability } from '@/types';
import DealStageDropdown from '@/components/deals/DealStageDropdown';
import DealStageProgress from '@/components/deals/DealStageProgress';
import DealDetailsForm from '@/components/deals/DealDetailsForm';
import DealNoteList from '@/components/deals/DealNoteList';
import DealTaskList from '@/components/deals/DealTaskList';
import DealContactList from '@/components/deals/DealContactList';
import ProductSelect from '@/components/products/ProductSelect';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const DealPage = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { deals, updateDealStage, isLoading } = useDeal();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Find the requested deal
  const deal = deals.find(d => d.id === dealId);
  
  // Get the deal owner
  const dealOwner = mockUsers.find(user => user.id === deal?.ownerId);
  
  // Calculate weighted values
  const getWeightedValue = () => {
    if (!deal) return 0;
    const probability = stageProbability[deal.stage] / 100;
    return deal.dealValue * probability;
  };
  
  const getWeightedARR = () => {
    if (!deal) return 0;
    const probability = stageProbability[deal.stage] / 100;
    return (deal.annualRecurringRevenue || 0) * probability;
  };
  
  // Redirect to pipeline if deal not found
  useEffect(() => {
    if (!isLoading && !deal) {
      navigate('/pipeline');
    }
  }, [deal, isLoading, navigate]);
  
  // Handle stage change
  const handleStageChange = (newStage: DealStage) => {
    if (deal) {
      updateDealStage(deal.id, newStage);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-40 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  if (!deal) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/pipeline')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{deal.clientName}</h1>
            <p className="text-muted-foreground">
              {deal.clientType} • Added {format(new Date(deal.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Deal stage progress */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-muted-foreground">Current Stage</h3>
              <DealStageDropdown currentStage={deal.stage} onStageChange={handleStageChange} />
            </div>
            
            <div className="flex items-center gap-10">
              <div>
                <p className="text-sm text-muted-foreground">Probability</p>
                <p className="font-medium">{stageProbability[deal.stage]}%</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Deal Value</p>
                <p className="font-medium">{formatCurrency(deal.dealValue)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Weighted Value</p>
                <p className="font-medium">{formatCurrency(getWeightedValue())}</p>
              </div>
            </div>
          </div>
          
          <DealStageProgress deal={deal} />
        </div>
        
        {/* Main content */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Company Name</dt>
                      <dd className="font-medium">{deal.clientName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Client Type</dt>
                      <dd>{deal.clientType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Lead Source</dt>
                      <dd>{deal.leadSource}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">SaaS Value</dt>
                      <dd className="font-medium">{formatCurrency(deal.dealValue)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Annual Recurring Revenue</dt>
                      <dd>{formatCurrency(deal.annualRecurringRevenue || 0)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Weighted ARR</dt>
                      <dd>{formatCurrency(getWeightedARR())}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Created</dt>
                      <dd>{format(new Date(deal.createdAt), 'MMMM d, yyyy')}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Last Updated</dt>
                      <dd>{format(new Date(deal.updatedAt), 'MMMM d, yyyy')}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Expected Close Date</dt>
                      <dd>
                        {deal.expectedCloseDate 
                          ? format(new Date(deal.expectedCloseDate), 'MMMM d, yyyy')
                          : 'Not set'}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> People
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Deal Owner</dt>
                      <dd className="font-medium">{dealOwner?.name || 'Unassigned'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Primary Contact</dt>
                      <dd>
                        {deal.contacts.find(c => c.isPrimary)?.name || 'None assigned'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Total Contacts</dt>
                      <dd>{deal.contacts.length}</dd>
                    </div>
                  </dl>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("contacts")}
                  >
                    Manage Contacts
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductSelect 
                    value={deal.product?.id} 
                    dealId={deal.id}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
                <CardDescription>
                  Update the financial information for this deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DealDetailsForm deal={deal} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
                <CardDescription>
                  Manage contacts associated with this deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DealContactList dealId={deal.id} contacts={deal.contacts} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                  Add and view notes for this deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DealNoteList dealId={deal.id} notes={deal.notes} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  Manage tasks for this deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DealTaskList dealId={deal.id} tasks={deal.tasks} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DealPage;
