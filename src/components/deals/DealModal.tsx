
import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Deal, 
  DealStage, 
  Contact as ContactType
} from '@/types';
import { useDeal } from '@/context/DealContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DealStageProgress from './DealStageProgress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  CalendarIcon, 
  ClockIcon, 
  PlusIcon, 
  TrashIcon
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DealTaskList from './DealTaskList';
import DealNoteList from './DealNoteList';
import DealContactList from './DealContactList';

interface DealModalProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DealModal = ({ deal, open, onOpenChange }: DealModalProps) => {
  const { currentUser } = useAuth();
  const { addNote, addTask, addContact } = useDeal();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Contact form state
  const [contactForm, setContactForm] = useState<Omit<ContactType, 'id'>>({
    dealId: deal.id,
    name: '',
    title: '',
    email: '',
    phone: '',
    isPrimary: false,
  });

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !currentUser) return;
    
    addNote(deal.id, newNote.trim());
    setNewNote('');
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDueDate || !currentUser) return;
    
    addTask({
      dealId: deal.id,
      title: newTaskTitle.trim(),
      dueDate: new Date(newTaskDueDate),
      completed: false,
      assignedTo: currentUser.id,
      createdBy: currentUser.id,
    });
    
    setNewTaskTitle('');
    setNewTaskDueDate('');
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim()) return;
    
    addContact({
      ...contactForm,
      dealId: deal.id,
    });
    
    // Reset form
    setContactForm({
      dealId: deal.id,
      name: '',
      title: '',
      email: '',
      phone: '',
      isPrimary: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{deal.clientName}</DialogTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-2">{deal.clientType}</span>
            <span className="mr-2">•</span>
            <span>${formatCurrency(deal.dealValue)}</span>
            <span className="mr-2">•</span>
            <span>Source: {deal.leadSource}</span>
          </div>
        </DialogHeader>
        
        <DealStageProgress deal={deal} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client</span>
                    <span className="font-medium">{deal.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-medium">${formatCurrency(deal.dealValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{deal.clientType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-medium">{deal.leadSource}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{format(new Date(deal.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stage Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-40 overflow-auto">
                  {deal.stageHistory.map((history, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStageColorClass(history.stage)}`}></div>
                      <div className="text-sm flex-1">
                        <div className="font-medium">{history.stage}</div>
                        <div className="text-muted-foreground text-xs">
                          {format(new Date(history.timestamp), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Notes</CardTitle>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto">
                  <DealNoteList notes={deal.notes.slice(0, 3)} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto">
                  <DealTaskList tasks={deal.tasks.filter(t => !t.completed).slice(0, 3)} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deal Notes</CardTitle>
                <CardDescription>
                  Add and view all notes for this deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNoteSubmit} className="mb-6">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="mb-2"
                    rows={3}
                  />
                  <Button type="submit" disabled={!newNote.trim()}>
                    Add Note
                  </Button>
                </form>
                
                <DealNoteList notes={deal.notes} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deal Tasks</CardTitle>
                <CardDescription>
                  Manage tasks and reminders for this deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTaskSubmit} className="mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taskTitle">Task Title</Label>
                      <Input
                        id="taskTitle"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="What needs to be done?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={!newTaskTitle.trim() || !newTaskDueDate}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Task
                  </Button>
                </form>
                
                <DealTaskList tasks={deal.tasks} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
                <CardDescription>
                  Manage contacts for this deal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Name</Label>
                      <Input
                        id="contactName"
                        name="name"
                        value={contactForm.name}
                        onChange={handleContactChange}
                        placeholder="Contact name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactTitle">Title</Label>
                      <Input
                        id="contactTitle"
                        name="title"
                        value={contactForm.title}
                        onChange={handleContactChange}
                        placeholder="Job title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        name="email"
                        type="email"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        placeholder="Email address"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input
                        id="contactPhone"
                        name="phone"
                        value={contactForm.phone}
                        onChange={handleContactChange}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      id="isPrimary"
                      name="isPrimary"
                      type="checkbox"
                      checked={contactForm.isPrimary}
                      onChange={handleContactChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isPrimary">Primary Contact</Label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={!contactForm.name.trim() || !contactForm.email.trim()}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add Contact
                  </Button>
                </form>
                
                <DealContactList contacts={deal.contacts} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to get color class for stage
const getStageColorClass = (stage: DealStage): string => {
  const stageMap: Record<string, string> = {
    'Lead Identified': 'bg-stage-lead',
    'Discovery Call': 'bg-stage-discovery',
    'RFP/RFI Submitted': 'bg-stage-rfp',
    'Demo Presented': 'bg-stage-demo',
    'Contract Negotiation': 'bg-stage-negotiation',
    'Closed Won': 'bg-stage-closedwon',
    'Closed Lost': 'bg-stage-closedlost',
  };
  
  return stageMap[stage] || 'bg-gray-400';
};

export default DealModal;
