
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useContact } from '@/context/ContactContext';
import { useAuth } from '@/context/AuthContext';
import { useDeal } from '@/context/DealContext';
import Layout from '@/components/layout/Layout';
import { mockUsers } from '@/data/mockData';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Link as LinkIcon,
  User,
  Calendar,
  Plus,
  Edit,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ActivityTimeline from '@/components/contacts/ActivityTimeline';
import LogActivityDialog from '@/components/contacts/LogActivityDialog';
import EditContactDialog from '@/components/contacts/EditContactDialog';

const ContactPage = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getContactById, activities, isLoading, getActivitiesByContact } = useContact();
  const { deals } = useDeal();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogActivityDialog, setShowLogActivityDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Find the contact
  const contact = contactId ? getContactById(contactId) : undefined;
  
  // Get all activities for this contact
  const contactActivities = contactId ? getActivitiesByContact(contactId) : [];
  
  // Get the contact owner
  const contactOwner = contact ? mockUsers.find(user => user.id === contact.ownerId) : undefined;
  
  // Get associated deals
  const associatedDeals = contact ? deals.filter(deal => contact.dealIds.includes(deal.id)) : [];
  
  // Redirect to contacts list if contact not found
  useEffect(() => {
    if (!isLoading && !contact) {
      navigate('/contacts');
    }
  }, [contact, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-40 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  if (!contact) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <Layout>
      <div className="space-y-6 pb-10">
        {/* Header with back button */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/contacts')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{contact.name}</h1>
              <p className="text-muted-foreground">
                {contact.title}{contact.company ? ` at ${contact.company}` : ''}
              </p>
            </div>
          </div>
          
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
        
        {/* Main content */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    {contact.email && (
                      <div className="flex items-center">
                        <dt className="w-6">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </dt>
                        <dd className="ml-2">
                          <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                            {contact.email}
                          </a>
                        </dd>
                      </div>
                    )}
                    
                    {contact.phone && (
                      <div className="flex items-center">
                        <dt className="w-6">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </dt>
                        <dd className="ml-2">
                          <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                            {contact.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    
                    {contact.company && (
                      <div className="flex items-center">
                        <dt className="w-6">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </dt>
                        <dd className="ml-2">{contact.company}</dd>
                      </div>
                    )}
                    
                    {contact.linkedinUrl && (
                      <div className="flex items-center">
                        <dt className="w-6">
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        </dt>
                        <dd className="ml-2">
                          <a 
                            href={contact.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            LinkedIn Profile
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Created</dt>
                      <dd>{format(new Date(contact.createdAt), 'MMMM d, yyyy')}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Last Updated</dt>
                      <dd>{format(new Date(contact.updatedAt), 'MMMM d, yyyy')}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Owner</dt>
                      <dd>{contactOwner?.name || 'Unassigned'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Associated Deals</dt>
                      <dd>{contact.dealIds.length}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
            
            {/* Notes section */}
            {contact.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{contact.notes}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Recent activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowLogActivityDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Log Activity
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityTimeline 
                  activities={contactActivities.slice(0, 5)} 
                  showDealInfo={true}
                />
                
                {contactActivities.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No activities recorded yet
                  </div>
                )}
              </CardContent>
              {contactActivities.length > 5 && (
                <CardFooter>
                  <Button 
                    variant="ghost" 
                    className="w-full text-center" 
                    onClick={() => setActiveTab('activities')}
                  >
                    View All Activities
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Activity History</span>
                  <Button onClick={() => setShowLogActivityDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Activity
                  </Button>
                </CardTitle>
                <CardDescription>
                  All interactions with this contact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityTimeline 
                  activities={contactActivities} 
                  showDealInfo={true}
                />
                
                {contactActivities.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    No activities recorded yet. Log your first interaction with this contact.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="deals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Associated Deals</span>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Link to Deal
                  </Button>
                </CardTitle>
                <CardDescription>
                  Deals associated with this contact
                </CardDescription>
              </CardHeader>
              <CardContent>
                {associatedDeals.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No deals associated with this contact yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {associatedDeals.map(deal => (
                      <Card key={deal.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`/deal/${deal.id}`)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium">{deal.clientName}</h3>
                              <p className="text-sm text-muted-foreground">{deal.stage}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${new Intl.NumberFormat().format(deal.dealValue)}</p>
                              <p className="text-sm text-muted-foreground">
                                {deal.expectedCloseDate ? 
                                  format(new Date(deal.expectedCloseDate), 'MMM d, yyyy') : 
                                  'No close date'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                  Notes about {contact.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* This would be implemented with a notes system in a future enhancement */}
                {!contact.notes ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No notes recorded yet
                  </div>
                ) : (
                  <div className="p-4 border rounded-md whitespace-pre-line">
                    {contact.notes}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                  Edit Notes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Activity logging dialog */}
      <LogActivityDialog
        open={showLogActivityDialog}
        onOpenChange={setShowLogActivityDialog}
        contactId={contact.id}
      />
      
      {/* Edit contact dialog */}
      {contact && (
        <EditContactDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          contact={contact}
        />
      )}
    </Layout>
  );
};

export default ContactPage;
