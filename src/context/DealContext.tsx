import React, { createContext, useContext, useState, useEffect } from 'react';
import { Deal, DealStage, Note, Task, Contact, DealChange, ChangeType, Product } from '@/types';
import { mockDeals, mockProducts } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

interface DealContextProps {
  deals: Deal[];
  isLoading: boolean;
  dealChanges: DealChange[];
  products: Product[];
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'stageHistory' | 'changes'>) => void;
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
  getChangesByDateRange: (startDate: Date, endDate: Date) => DealChange[];
  addProduct: (product: Omit<Product, 'id'>) => Product;
  getProductById: (productId: string) => Product | undefined;
  assignProductToDeal: (dealId: string, productId?: string) => void;
}

const DealContext = createContext<DealContextProps>({
  deals: [],
  isLoading: true,
  dealChanges: [],
  products: [],
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
  getChangesByDateRange: () => [],
  addProduct: () => ({ id: '', name: '' }),
  getProductById: () => undefined,
  assignProductToDeal: () => {},
});

export const useDeal = () => useContext(DealContext);

export const DealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealChanges, setDealChanges] = useState<DealChange[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Load deals and products from mock data
  useEffect(() => {
    // Initialize deals with empty changes array if not present
    const dealsWithChanges = mockDeals.map(deal => ({
      ...deal,
      changes: deal.changes || [],
      annualRecurringRevenue: deal.annualRecurringRevenue || undefined,
      arrYear1: deal.arrYear1 || undefined,
      implementationRevenue: deal.implementationRevenue || undefined,
      implementationTimeline: deal.implementationTimeline || undefined,
      isActive: deal.isActive !== undefined ? deal.isActive : true,
    }));
    setDeals(dealsWithChanges);
    
    // Extract all changes for the changes feed
    const allChanges = dealsWithChanges.flatMap(deal => deal.changes || []);
    setDealChanges(allChanges);
    
    // Load products
    setProducts(mockProducts || []);
    
    setIsLoading(false);
  }, []);

  // Helper to record a change
  const recordChange = (dealId: string, changeType: ChangeType, previousValue?: any, newValue?: any) => {
    if (!currentUser) return;
    
    const change: DealChange = {
      id: `change-${Date.now()}`,
      dealId,
      changeType,
      previousValue,
      newValue,
      timestamp: new Date(),
      userId: currentUser.id,
    };
    
    // Add to the deal's changes array
    setDeals(prev => 
      prev.map(deal => {
        if (deal.id === dealId) {
          return {
            ...deal,
            changes: [...(deal.changes || []), change],
          };
        }
        return deal;
      })
    );
    
    // Add to global changes array
    setDealChanges(prev => [...prev, change]);
    
    return change;
  };

  // Add a new product
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`,
    };
    
    setProducts(prev => [...prev, newProduct]);
    
    toast({
      title: "Product Added",
      description: `${newProduct.name} has been added to your products.`,
    });
    
    return newProduct;
  };

  // Get a product by ID
  const getProductById = (productId: string): Product | undefined => {
    return products.find(product => product.id === productId);
  };

  // Add a new deal
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'stageHistory' | 'changes'>) => {
    if (!currentUser) return;
    
    const now = new Date();
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      stageHistory: [{ stage: dealData.stage, timestamp: now }],
      changes: [],
      createdAt: now,
      updatedAt: now,
    };

    setDeals(prev => [...prev, newDeal]);
    
    // Record the new deal creation
    const change = recordChange(newDeal.id, 'deal_added', null, { 
      clientName: newDeal.clientName,
      stage: newDeal.stage,
      dealValue: newDeal.dealValue
    });
    
    toast({
      title: "Deal Added",
      description: `${newDeal.clientName} has been added to your pipeline.`,
    });
  };

  // Update an existing deal
  const updateDeal = (dealId: string, updates: Partial<Deal>) => {
    // Find the deal before updating
    const dealToUpdate = deals.find(d => d.id === dealId);
    if (!dealToUpdate) return;
    
    // Check for specific field updates to track changes
    if (updates.annualRecurringRevenue !== undefined && 
        updates.annualRecurringRevenue !== dealToUpdate.annualRecurringRevenue) {
      recordChange(
        dealId, 
        'arr_updated', 
        dealToUpdate.annualRecurringRevenue, 
        updates.annualRecurringRevenue
      );
    }
    
    if (updates.arrYear1 !== undefined && 
        updates.arrYear1 !== dealToUpdate.arrYear1) {
      recordChange(
        dealId, 
        'arr_year1_updated', 
        dealToUpdate.arrYear1, 
        updates.arrYear1
      );
    }
    
    if (updates.implementationRevenue !== undefined && 
        updates.implementationRevenue !== dealToUpdate.implementationRevenue) {
      recordChange(
        dealId, 
        'implementation_revenue_updated', 
        dealToUpdate.implementationRevenue, 
        updates.implementationRevenue
      );
    }
    
    if (updates.implementationTimeline !== undefined && 
        JSON.stringify(updates.implementationTimeline) !== JSON.stringify(dealToUpdate.implementationTimeline)) {
      recordChange(
        dealId, 
        'timeline_updated', 
        dealToUpdate.implementationTimeline, 
        updates.implementationTimeline
      );
    }

    if (updates.ownerId !== undefined &&
        updates.ownerId !== dealToUpdate.ownerId) {
      recordChange(
        dealId,
        'owner_changed',
        dealToUpdate.ownerId,
        updates.ownerId
      );
    }

    if (updates.product !== undefined && 
        (dealToUpdate.product?.id !== updates.product?.id)) {
      recordChange(
        dealId,
        'product_added',
        dealToUpdate.product,
        updates.product
      );
    }

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
    const dealToUpdate = deals.find(d => d.id === dealId);
    if (!dealToUpdate) return;
    
    setDeals(prev => 
      prev.map(deal => {
        if (deal.id === dealId) {
          const now = new Date();
          
          // Record the stage change
          recordChange(
            dealId, 
            'stage_changed', 
            deal.stage, 
            newStage
          );
          
          // If moving to "Closed Won" or "Closed Lost"
          if ((newStage === 'Closed Won' || newStage === 'Closed Lost') && 
             !(deal.stage === 'Closed Won' || deal.stage === 'Closed Lost')) {
            recordChange(
              dealId,
              'deal_closed',
              deal.stage,
              newStage
            );
            
            // Also update isActive status
            return {
              ...deal,
              stage: newStage,
              stageHistory: [...deal.stageHistory, { stage: newStage, timestamp: now }],
              updatedAt: now,
              isActive: false
            };
          }
          
          // If moving from closed to non-closed
          if ((deal.stage === 'Closed Won' || deal.stage === 'Closed Lost') &&
             !(newStage === 'Closed Won' || newStage === 'Closed Lost')) {
            return {
              ...deal,
              stage: newStage,
              stageHistory: [...deal.stageHistory, { stage: newStage, timestamp: now }],
              updatedAt: now,
              isActive: true
            };
          }
          
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
      dealIds: contactData.dealId ? [contactData.dealId] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDeals(prev => 
      prev.map(deal => {
        if (contactData.dealId && deal.id === contactData.dealId) {
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

  // Get changes within a date range
  const getChangesByDateRange = (startDate: Date, endDate: Date) => {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    return dealChanges.filter(change => {
      const changeDate = new Date(change.timestamp);
      return changeDate >= startDate && changeDate <= endOfDay;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Add a product to a deal
  const assignProductToDeal = (dealId: string, productId?: string) => {
    const product = productId ? getProductById(productId) : undefined;
    
    setDeals(prev => 
      prev.map(deal => {
        if (deal.id === dealId) {
          // Record the change
          recordChange(
            dealId,
            'product_added',
            deal.product,
            product
          );
          
          return {
            ...deal,
            product,
            updatedAt: new Date(),
          };
        }
        return deal;
      })
    );
    
    if (product) {
      toast({
        title: "Product Assigned",
        description: `${product.name} has been assigned to the deal.`,
      });
    } else {
      toast({
        title: "Product Removed",
        description: "Product has been removed from the deal.",
      });
    }
  };

  const value = {
    deals,
    isLoading,
    dealChanges,
    products,
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
    getChangesByDateRange,
    addProduct,
    getProductById,
    assignProductToDeal,
  };

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
};
