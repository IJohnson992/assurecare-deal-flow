
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Deal, DealStage, Note, Task, Contact } from '@/types';
import { mockDeals } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

interface DealContextProps {
  deals: Deal[];
  isLoading: boolean;
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'stageHistory'>) => void;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  updateDealStage: (dealId: string, newStage: DealStage) => void;
  deleteDeal: (dealId: string) => void;
  addNote: (dealId: string, content: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'reminderSent'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  completeTask: (taskId: string) => void;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  deleteContact: (contactId: string) => void;
}

const DealContext = createContext<DealContextProps>({
  deals: [],
  isLoading: true,
  addDeal: () => {},
  updateDeal: () => {},
  updateDealStage: () => {},
  deleteDeal: () => {},
  addNote: () => {},
  addTask: () => {},
  updateTask: () => {},
  completeTask: () => {},
  addContact: () => {},
  updateContact: () => {},
  deleteContact: () => {},
});

export const useDeal = () => useContext(DealContext);

export const DealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Load deals from mock data
  useEffect(() => {
    // In a real app, this would be an API call
    setDeals(mockDeals);
    setIsLoading(false);
  }, []);

  // Add a new deal
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'stageHistory'>) => {
    if (!currentUser) return;
    
    const now = new Date();
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      stageHistory: [{ stage: dealData.stage, timestamp: now }],
      createdAt: now,
      updatedAt: now,
    };

    setDeals(prev => [...prev, newDeal]);
    toast({
      title: "Deal Added",
      description: `${newDeal.clientName} has been added to your pipeline.`,
    });
  };

  // Update an existing deal
  const updateDeal = (dealId: string, updates: Partial<Deal>) => {
    setDeals(prev => 
      prev.map(deal => 
        deal.id === dealId 
          ? { ...deal, ...updates, updatedAt: new Date() }
          : deal
      )
    );
    toast({
      title: "Deal Updated",
      description: "The deal has been updated successfully.",
    });
  };

  // Update a deal's stage and record the timestamp
  const updateDealStage = (dealId: string, newStage: DealStage) => {
    setDeals(prev => 
      prev.map(deal => {
        if (deal.id === dealId) {
          const now = new Date();
          return {
            ...deal,
            stage: newStage,
            stageHistory: [...deal.stageHistory, { stage: newStage, timestamp: now }],
            updatedAt: now,
          };
        }
        return deal;
      })
    );
    toast({
      title: "Deal Stage Updated",
      description: `Deal moved to ${newStage} stage.`,
    });
  };

  // Delete a deal
  const deleteDeal = (dealId: string) => {
    setDeals(prev => prev.filter(deal => deal.id !== dealId));
    toast({
      title: "Deal Deleted",
      description: "The deal has been removed from your pipeline.",
    });
  };

  // Add a note to a deal
  const addNote = (dealId: string, content: string) => {
    if (!currentUser) return;
    
    const newNote: Note = {
      id: `note-${Date.now()}`,
      dealId,
      userId: currentUser.id,
      content,
      createdAt: new Date(),
    };

    setDeals(prev => 
      prev.map(deal => {
        if (deal.id === dealId) {
          return {
            ...deal,
            notes: [...deal.notes, newNote],
            updatedAt: new Date(),
          };
        }
        return deal;
      })
    );
  };

  // Add a task
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'reminderSent'>) => {
    if (!currentUser) return;
    
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      completed: false,
      reminderSent: false,
    };

    setDeals(prev => 
      prev.map(deal => {
        if (deal.id === taskData.dealId) {
          return {
            ...deal,
            tasks: [...deal.tasks, newTask],
            updatedAt: new Date(),
          };
        }
        return deal;
      })
    );

    toast({
      title: "Task Created",
      description: `"${newTask.title}" has been added.`,
    });
  };

  // Update a task
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setDeals(prev => 
      prev.map(deal => ({
        ...deal,
        tasks: deal.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        ),
        updatedAt: new Date(),
      }))
    );
  };

  // Complete a task
  const completeTask = (taskId: string) => {
    setDeals(prev => 
      prev.map(deal => ({
        ...deal,
        tasks: deal.tasks.map(task => 
          task.id === taskId 
            ? { ...task, completed: true, completedAt: new Date() } 
            : task
        ),
        updatedAt: new Date(),
      }))
    );
  };

  // Add a contact to a deal
  const addContact = (contactData: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `contact-${Date.now()}`,
    };

    setDeals(prev => 
      prev.map(deal => {
        if (deal.id === contactData.dealId) {
          // If this is marked as primary, make all others non-primary
          const updatedContacts = contactData.isPrimary 
            ? deal.contacts.map(c => ({ ...c, isPrimary: false }))
            : [...deal.contacts];
          
          return {
            ...deal,
            contacts: [...updatedContacts, newContact],
            updatedAt: new Date(),
          };
        }
        return deal;
      })
    );
  };

  // Update a contact
  const updateContact = (contactId: string, updates: Partial<Contact>) => {
    setDeals(prev => 
      prev.map(deal => {
        // Check if we're setting this contact as primary
        if (updates.isPrimary) {
          return {
            ...deal,
            contacts: deal.contacts.map(contact => {
              if (contact.id === contactId) {
                return { ...contact, ...updates };
              }
              return { ...contact, isPrimary: false };
            }),
            updatedAt: new Date(),
          };
        }
        
        // Regular update without changing primary status
        return {
          ...deal,
          contacts: deal.contacts.map(contact => 
            contact.id === contactId ? { ...contact, ...updates } : contact
          ),
          updatedAt: new Date(),
        };
      })
    );
  };

  // Delete a contact
  const deleteContact = (contactId: string) => {
    setDeals(prev => 
      prev.map(deal => ({
        ...deal,
        contacts: deal.contacts.filter(contact => contact.id !== contactId),
        updatedAt: new Date(),
      }))
    );
  };

  const value = {
    deals,
    isLoading,
    addDeal,
    updateDeal,
    updateDealStage,
    deleteDeal,
    addNote,
    addTask,
    updateTask,
    completeTask,
    addContact,
    updateContact,
    deleteContact,
  };

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
};
