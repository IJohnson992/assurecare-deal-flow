
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Contact, Activity } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

// Mock data for contacts
const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'Jane Smith',
    title: 'VP of Marketing',
    email: 'jane.smith@acme.com',
    phone: '555-123-4567',
    company: 'ACME Corp',
    linkedinUrl: 'https://linkedin.com/in/janesmith',
    notes: 'Met at the industry conference last month',
    isPrimary: true,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
    ownerId: 'user-1',
    dealIds: ['deal-1', 'deal-2']
  },
  {
    id: 'contact-2',
    name: 'Michael Johnson',
    title: 'CTO',
    email: 'michael.johnson@techcorp.com',
    phone: '555-987-6543',
    company: 'Tech Corp',
    linkedinUrl: 'https://linkedin.com/in/michaeljohnson',
    notes: 'Technical decision maker, prefers detailed product specs',
    isPrimary: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-05'),
    ownerId: 'user-2',
    dealIds: ['deal-3']
  },
  {
    id: 'contact-3',
    name: 'Sara Lee',
    title: 'Procurement Manager',
    email: 'sara.lee@globex.com',
    phone: '555-456-7890',
    company: 'Globex',
    linkedinUrl: 'https://linkedin.com/in/saralee',
    isPrimary: true,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
    ownerId: 'user-1',
    dealIds: ['deal-4']
  },
];

// Mock data for activities
const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    type: 'call',
    title: 'Introductory Call',
    description: 'Discussed product features and pricing',
    contactId: 'contact-1',
    dealId: 'deal-1',
    createdAt: new Date('2024-03-01T10:30:00'),
    createdById: 'user-1'
  },
  {
    id: 'activity-2',
    type: 'email',
    title: 'Follow-up Email',
    description: 'Sent product brochure and case studies',
    contactId: 'contact-1',
    dealId: 'deal-1',
    createdAt: new Date('2024-03-03T14:15:00'),
    createdById: 'user-1'
  },
  {
    id: 'activity-3',
    type: 'meeting',
    title: 'Product Demo',
    description: 'Showed the platform to the technical team',
    contactId: 'contact-2',
    dealId: 'deal-3',
    createdAt: new Date('2024-03-10T11:00:00'),
    createdById: 'user-2'
  }
];

interface ContactContextProps {
  contacts: Contact[];
  activities: Activity[];
  isLoading: boolean;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Contact;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
  deleteContact: (contactId: string) => void;
  getContactById: (contactId: string) => Contact | undefined;
  getContactsByDeal: (dealId: string) => Contact[];
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  getActivitiesByContact: (contactId: string) => Activity[];
  getActivitiesByDeal: (dealId: string) => Activity[];
  linkContactToDeal: (contactId: string, dealId: string) => void;
  unlinkContactFromDeal: (contactId: string, dealId: string) => void;
}

const ContactContext = createContext<ContactContextProps>({
  contacts: [],
  activities: [],
  isLoading: true,
  addContact: () => ({ 
    id: '', 
    name: '', 
    title: '', 
    email: '', 
    isPrimary: false, 
    createdAt: new Date(), 
    updatedAt: new Date(), 
    ownerId: '', 
    dealIds: [] 
  }),
  updateContact: () => {},
  deleteContact: () => {},
  getContactById: () => undefined,
  getContactsByDeal: () => [],
  addActivity: () => {},
  getActivitiesByContact: () => [],
  getActivitiesByDeal: () => [],
  linkContactToDeal: () => {},
  unlinkContactFromDeal: () => {},
});

export const useContact = () => useContext(ContactContext);

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Load contacts and activities from mock data
  useEffect(() => {
    setContacts(mockContacts);
    setActivities(mockActivities);
    setIsLoading(false);
  }, []);

  // Add a new contact
  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact => {
    if (!currentUser) throw new Error("User not authenticated");
    
    const now = new Date();
    const newContact: Contact = {
      ...contactData,
      id: `contact-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    setContacts(prev => [...prev, newContact]);
    
    toast({
      title: "Contact Added",
      description: `${newContact.name} has been added to your contacts.`,
    });
    
    return newContact;
  };

  // Update a contact
  const updateContact = (contactId: string, updates: Partial<Contact>) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, ...updates, updatedAt: new Date() }
          : contact
      )
    );
    
    toast({
      title: "Contact Updated",
      description: "The contact has been updated successfully.",
    });
  };

  // Delete a contact
  const deleteContact = (contactId: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== contactId));
    
    // Also clean up activities related to this contact
    setActivities(prev => prev.filter(activity => activity.contactId !== contactId));
    
    toast({
      title: "Contact Deleted",
      description: "The contact has been removed.",
    });
  };

  // Get a contact by ID
  const getContactById = (contactId: string): Contact | undefined => {
    return contacts.find(contact => contact.id === contactId);
  };

  // Get contacts by deal ID
  const getContactsByDeal = (dealId: string): Contact[] => {
    return contacts.filter(contact => contact.dealIds.includes(dealId));
  };

  // Add an activity
  const addActivity = (activityData: Omit<Activity, 'id' | 'createdAt'>) => {
    if (!currentUser) throw new Error("User not authenticated");
    
    const newActivity: Activity = {
      ...activityData,
      id: `activity-${Date.now()}`,
      createdAt: new Date(),
      createdById: currentUser.id,
    };

    setActivities(prev => [...prev, newActivity]);
    
    toast({
      title: "Activity Logged",
      description: `${newActivity.title} has been logged.`,
    });
  };

  // Get activities by contact ID
  const getActivitiesByContact = (contactId: string): Activity[] => {
    return activities
      .filter(activity => activity.contactId === contactId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  // Get activities by deal ID
  const getActivitiesByDeal = (dealId: string): Activity[] => {
    return activities
      .filter(activity => activity.dealId === dealId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  // Link a contact to a deal
  const linkContactToDeal = (contactId: string, dealId: string) => {
    setContacts(prev => 
      prev.map(contact => {
        if (contact.id === contactId && !contact.dealIds.includes(dealId)) {
          return {
            ...contact,
            dealIds: [...contact.dealIds, dealId],
            updatedAt: new Date(),
          };
        }
        return contact;
      })
    );
    
    toast({
      title: "Contact Linked",
      description: "The contact has been linked to the deal.",
    });
  };

  // Unlink a contact from a deal
  const unlinkContactFromDeal = (contactId: string, dealId: string) => {
    setContacts(prev => 
      prev.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            dealIds: contact.dealIds.filter(id => id !== dealId),
            updatedAt: new Date(),
          };
        }
        return contact;
      })
    );
    
    toast({
      title: "Contact Unlinked",
      description: "The contact has been unlinked from the deal.",
    });
  };

  const value = {
    contacts,
    activities,
    isLoading,
    addContact,
    updateContact,
    deleteContact,
    getContactById,
    getContactsByDeal,
    addActivity,
    getActivitiesByContact,
    getActivitiesByDeal,
    linkContactToDeal,
    unlinkContactFromDeal,
  };

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
};
