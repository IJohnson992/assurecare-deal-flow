import { 
  User, 
  Deal, 
  DealStage, 
  ClientType, 
  LeadSource, 
  Contact, 
  Note, 
  Task,
  DealChange,
  Product,
  stageProbability
} from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Smith',
    email: 'john@assurecare.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 'user-2',
    name: 'Emily Davis',
    email: 'emily@assurecare.com',
    role: 'manager',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 'user-3',
    name: 'Michael Johnson',
    email: 'michael@assurecare.com',
    role: 'salesperson',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: 'Care Management Platform',
    description: 'End-to-end care management solution for health plans and providers'
  },
  {
    id: 'product-2',
    name: 'Population Health Analytics',
    description: 'Advanced analytics for population health management'
  },
  {
    id: 'product-3',
    name: 'Patient Engagement Suite',
    description: 'Tools to improve patient engagement and satisfaction'
  },
  {
    id: 'product-4',
    name: 'Revenue Cycle Management',
    description: 'Streamline billing and improve financial performance'
  }
];

// Helper function to create dates in the past
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Mock Contacts
const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    dealId: 'deal-1', // For backward compatibility
    dealIds: ['deal-1'],
    name: 'Robert Thompson',
    title: 'CTO',
    email: 'robert@healthsys.com',
    phone: '(555) 123-4567',
    isPrimary: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'contact-2',
    dealId: 'deal-1', // For backward compatibility
    dealIds: ['deal-1'],
    name: 'Sarah Wilson',
    title: 'Director of IT',
    email: 'sarah@healthsys.com',
    phone: '(555) 987-6543',
    isPrimary: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'contact-3',
    dealId: 'deal-2', // For backward compatibility
    dealIds: ['deal-2'],
    name: 'James Anderson',
    title: 'CEO',
    email: 'james@medicalgroup.com',
    phone: '(555) 456-7890',
    isPrimary: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'contact-4',
    dealId: 'deal-3', // For backward compatibility
    dealIds: ['deal-3'],
    name: 'Patricia Miller',
    title: 'Procurement Manager',
    email: 'patricia@statehealth.gov',
    phone: '(555) 789-0123',
    isPrimary: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'contact-5',
    dealId: 'deal-4', // For backward compatibility
    dealIds: ['deal-4'],
    name: 'Daniel Brown',
    title: 'CIO',
    email: 'daniel@caregroup.org',
    phone: '(555) 234-5678',
    isPrimary: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'contact-6',
    dealId: 'deal-5', // For backward compatibility
    dealIds: ['deal-5'],
    name: 'Linda Martinez',
    title: 'Director of Operations',
    email: 'linda@nationalhealth.com',
    phone: '(555) 345-6789',
    isPrimary: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Mock Notes
const mockNotes: Note[] = [
  {
    id: 'note-1',
    dealId: 'deal-1',
    userId: 'user-1',
    content: 'Initial call went well. They are interested in our care management platform.',
    createdAt: daysAgo(14),
  },
  {
    id: 'note-2',
    dealId: 'deal-1',
    userId: 'user-2',
    content: 'Discussed pricing options. They seem concerned about implementation timeline.',
    createdAt: daysAgo(10),
  },
  {
    id: 'note-3',
    dealId: 'deal-2',
    userId: 'user-3',
    content: 'They liked our data analytics capabilities. Need to prepare demo for next call.',
    createdAt: daysAgo(7),
  },
  {
    id: 'note-4',
    dealId: 'deal-3',
    userId: 'user-1',
    content: 'RFP submitted on time. We addressed all their requirements.',
    createdAt: daysAgo(5),
  },
  {
    id: 'note-5',
    dealId: 'deal-4',
    userId: 'user-2',
    content: 'Demo went extremely well. They were impressed with our population health features.',
    createdAt: daysAgo(3),
  }
];

// Mock Tasks
const mockTasks: Task[] = [
  {
    id: 'task-1',
    dealId: 'deal-1',
    title: 'Send proposal document',
    description: 'Prepare and send detailed proposal with pricing options',
    dueDate: daysAgo(-3), // 3 days in the future
    completed: false,
    assignedTo: 'user-1',
    createdBy: 'user-2',
    createdAt: daysAgo(2),
    reminderSent: false,
  },
  {
    id: 'task-2',
    dealId: 'deal-1',
    title: 'Schedule technical demonstration',
    description: 'Set up a call with their IT team to demonstrate integration capabilities',
    dueDate: daysAgo(-5), // 5 days in the future
    completed: false,
    assignedTo: 'user-3',
    createdBy: 'user-1',
    createdAt: daysAgo(1),
    reminderSent: false,
  },
  {
    id: 'task-3',
    dealId: 'deal-2',
    title: 'Prepare ROI analysis',
    description: 'Create ROI projection based on their patient volume',
    dueDate: daysAgo(-2), // 2 days in the future
    completed: true,
    assignedTo: 'user-2',
    createdBy: 'user-2',
    createdAt: daysAgo(4),
    completedAt: daysAgo(1),
    reminderSent: true,
  },
  {
    id: 'task-4',
    dealId: 'deal-3',
    title: 'Follow up on RFP questions',
    description: 'Contact procurement to clarify their questions about our security protocols',
    dueDate: daysAgo(-1), // 1 day in the future
    completed: false,
    assignedTo: 'user-1',
    createdBy: 'user-1',
    createdAt: daysAgo(2),
    reminderSent: true,
  },
  {
    id: 'task-5',
    dealId: 'deal-4',
    title: 'Send contract draft',
    description: 'Prepare and send initial contract draft with legal terms',
    dueDate: daysAgo(-4), // 4 days in the future
    completed: false,
    assignedTo: 'user-2',
    createdBy: 'user-3',
    createdAt: daysAgo(1),
    reminderSent: false,
  }
];

// Mock Deal Changes
const mockDealChanges: DealChange[] = [
  {
    id: 'change-1',
    dealId: 'deal-1',
    changeType: 'stage_changed',
    previousValue: 'Lead Identified',
    newValue: 'Discovery Call',
    timestamp: daysAgo(15),
    userId: 'user-1'
  },
  {
    id: 'change-2',
    dealId: 'deal-2',
    changeType: 'stage_changed',
    previousValue: 'RFP/RFI Submitted',
    newValue: 'Demo Presented',
    timestamp: daysAgo(7),
    userId: 'user-3'
  },
  {
    id: 'change-3',
    dealId: 'deal-4',
    changeType: 'stage_changed',
    previousValue: 'Demo Presented',
    newValue: 'Contract Negotiation',
    timestamp: daysAgo(20),
    userId: 'user-2'
  },
  {
    id: 'change-4',
    dealId: 'deal-5',
    changeType: 'deal_closed',
    previousValue: 'Contract Negotiation',
    newValue: 'Closed Won',
    timestamp: daysAgo(15),
    userId: 'user-2'
  },
  {
    id: 'change-5',
    dealId: 'deal-6',
    changeType: 'deal_closed',
    previousValue: 'Demo Presented',
    newValue: 'Closed Lost',
    timestamp: daysAgo(10),
    userId: 'user-3'
  },
  {
    id: 'change-6',
    dealId: 'deal-1',
    changeType: 'deal_added',
    timestamp: daysAgo(30),
    userId: 'user-1'
  },
  {
    id: 'change-7',
    dealId: 'deal-4',
    changeType: 'arr_updated',
    previousValue: 280000,
    newValue: 320000,
    timestamp: daysAgo(18),
    userId: 'user-2'
  }
];

// Mock Deals
export const mockDeals: Deal[] = [
  {
    id: 'deal-1',
    clientName: 'Central Health System',
    clientType: 'Commercial' as ClientType,
    dealValue: 250000,
    leadSource: 'Referral' as LeadSource,
    stage: 'Discovery Call' as DealStage,
    stageHistory: [
      { stage: 'Lead Identified' as DealStage, timestamp: daysAgo(30) },
      { stage: 'Discovery Call' as DealStage, timestamp: daysAgo(15) },
    ],
    changes: mockDealChanges.filter(c => c.dealId === 'deal-1'),
    ownerId: 'user-1',
    contacts: mockContacts.filter(c => c.dealIds.includes('deal-1')),
    notes: mockNotes.filter(n => n.dealId === 'deal-1'),
    tasks: mockTasks.filter(t => t.dealId === 'deal-1'),
    createdAt: daysAgo(30),
    updatedAt: daysAgo(15),
    product: mockProducts[0],
    expectedCloseDate: daysAgo(-45), // 45 days in the future
    isActive: true,
  },
  {
    id: 'deal-2',
    clientName: 'Western Medical Group',
    clientType: 'Medicare' as ClientType,
    dealValue: 180000,
    annualRecurringRevenue: 60000,
    leadSource: 'LinkedIn' as LeadSource,
    stage: 'Demo Presented' as DealStage,
    stageHistory: [
      { stage: 'Lead Identified' as DealStage, timestamp: daysAgo(45) },
      { stage: 'Discovery Call' as DealStage, timestamp: daysAgo(30) },
      { stage: 'RFP/RFI Submitted' as DealStage, timestamp: daysAgo(20) },
      { stage: 'Demo Presented' as DealStage, timestamp: daysAgo(7) },
    ],
    changes: mockDealChanges.filter(c => c.dealId === 'deal-2'),
    ownerId: 'user-3',
    contacts: mockContacts.filter(c => c.dealIds.includes('deal-2')),
    notes: mockNotes.filter(n => n.dealId === 'deal-2'),
    tasks: mockTasks.filter(t => t.dealId === 'deal-2'),
    createdAt: daysAgo(45),
    updatedAt: daysAgo(7),
    product: mockProducts[1],
    expectedCloseDate: daysAgo(-30), // 30 days in the future
    isActive: true,
  },
  {
    id: 'deal-3',
    clientName: 'State Health Department',
    clientType: 'Medicaid' as ClientType,
    dealValue: 420000,
    annualRecurringRevenue: 140000,
    leadSource: 'Event' as LeadSource,
    stage: 'RFP/RFI Submitted' as DealStage,
    stageHistory: [
      { stage: 'Lead Identified' as DealStage, timestamp: daysAgo(60) },
      { stage: 'Discovery Call' as DealStage, timestamp: daysAgo(45) },
      { stage: 'RFP/RFI Submitted' as DealStage, timestamp: daysAgo(5) },
    ],
    changes: mockDealChanges.filter(c => c.dealId === 'deal-3'),
    ownerId: 'user-1',
    contacts: mockContacts.filter(c => c.dealIds.includes('deal-3')),
    notes: mockNotes.filter(n => n.dealId === 'deal-3'),
    tasks: mockTasks.filter(t => t.dealId === 'deal-3'),
    createdAt: daysAgo(60),
    updatedAt: daysAgo(5),
    product: mockProducts[2],
    expectedCloseDate: daysAgo(-60), // 60 days in the future
    isActive: true,
  },
  {
    id: 'deal-4',
    clientName: 'Community Care Group',
    clientType: 'Commercial' as ClientType,
    dealValue: 320000,
    annualRecurringRevenue: 120000,
    leadSource: 'Website' as LeadSource,
    stage: 'Contract Negotiation' as DealStage,
    stageHistory: [
      { stage: 'Lead Identified' as DealStage, timestamp: daysAgo(90) },
      { stage: 'Discovery Call' as DealStage, timestamp: daysAgo(75) },
      { stage: 'RFP/RFI Submitted' as DealStage, timestamp: daysAgo(50) },
      { stage: 'Demo Presented' as DealStage, timestamp: daysAgo(35) },
      { stage: 'Contract Negotiation' as DealStage, timestamp: daysAgo(20) },
    ],
    changes: mockDealChanges.filter(c => c.dealId === 'deal-4'),
    ownerId: 'user-2',
    contacts: mockContacts.filter(c => c.dealIds.includes('deal-4')),
    notes: mockNotes.filter(n => n.dealId === 'deal-4'),
    tasks: mockTasks.filter(t => t.dealId === 'deal-4'),
    createdAt: daysAgo(90),
    updatedAt: daysAgo(20),
    product: mockProducts[3],
    expectedCloseDate: daysAgo(-15), // 15 days in the future
    isActive: true,
  },
  {
    id: 'deal-5',
    clientName: 'National Healthcare Alliance',
    clientType: 'Medicare' as ClientType,
    dealValue: 575000,
    annualRecurringRevenue: 230000,
    leadSource: 'Direct' as LeadSource,
    stage: 'Closed Won' as DealStage,
    stageHistory: [
      { stage: 'Lead Identified' as DealStage, timestamp: daysAgo(120) },
      { stage: 'Discovery Call' as DealStage, timestamp: daysAgo(100) },
      { stage: 'RFP/RFI Submitted' as DealStage, timestamp: daysAgo(85) },
      { stage: 'Demo Presented' as DealStage, timestamp: daysAgo(65) },
      { stage: 'Contract Negotiation' as DealStage, timestamp: daysAgo(40) },
      { stage: 'Closed Won' as DealStage, timestamp: daysAgo(15) },
    ],
    changes: mockDealChanges.filter(c => c.dealId === 'deal-5'),
    ownerId: 'user-2',
    contacts: mockContacts.filter(c => c.dealIds.includes('deal-5')),
    notes: [],
    tasks: [],
    createdAt: daysAgo(120),
    updatedAt: daysAgo(15),
    product: mockProducts[0],
    expectedCloseDate: daysAgo(15), // 15 days in the past (already closed)
    isActive: false,
  },
  {
    id: 'deal-6',
    clientName: 'Regional Hospital Network',
    clientType: 'Commercial' as ClientType,
    dealValue: 225000,
    annualRecurringRevenue: 75000,
    leadSource: 'Event' as LeadSource,
    stage: 'Closed Lost' as DealStage,
    stageHistory: [
      { stage: 'Lead Identified' as DealStage, timestamp: daysAgo(75) },
      { stage: 'Discovery Call' as DealStage, timestamp: daysAgo(60) },
      { stage: 'RFP/RFI Submitted' as DealStage, timestamp: daysAgo(45) },
      { stage: 'Demo Presented' as DealStage, timestamp: daysAgo(30) },
      { stage: 'Closed Lost' as DealStage, timestamp: daysAgo(10) },
    ],
    changes: mockDealChanges.filter(c => c.dealId === 'deal-6'),
    ownerId: 'user-3',
    contacts: [],
    notes: [],
    tasks: [],
    createdAt: daysAgo(75),
    updatedAt: daysAgo(10),
    product: mockProducts[2],
    expectedCloseDate: daysAgo(10), // 10 days in the past (already closed)
    isActive: false,
  },
];
