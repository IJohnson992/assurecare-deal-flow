
// User types
export type UserRole = 'admin' | 'manager' | 'salesperson';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Deal types
export type ClientType = 'Commercial' | 'Medicaid' | 'Medicare';
export type LeadSource = 'Referral' | 'Website' | 'Event' | 'LinkedIn' | 'Direct' | 'Other';
export type DealStage = 
  | 'Lead Identified' 
  | 'Discovery Call' 
  | 'RFP/RFI Submitted' 
  | 'Demo Presented' 
  | 'Contract Negotiation' 
  | 'Closed Won' 
  | 'Closed Lost';

export interface StageTimestamp {
  stage: DealStage;
  timestamp: Date;
}

export interface Note {
  id: string;
  dealId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  dealId: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  assignedTo: string; // userId
  createdBy: string; // userId
  createdAt: Date;
  completedAt?: Date;
  reminderSent: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
}

export interface ImplementationTimeline {
  startDate: Date;
  goLiveDate: Date;
  durationMonths: number; // Adding duration in months
}

export type ChangeType = 
  | 'stage_changed'
  | 'deal_added'
  | 'deal_closed'
  | 'arr_updated'
  | 'arr_year1_updated'
  | 'implementation_revenue_updated'
  | 'timeline_updated'
  | 'product_added'
  | 'owner_changed';

export interface DealChange {
  id: string;
  dealId: string;
  changeType: ChangeType;
  previousValue?: any;
  newValue?: any;
  timestamp: Date;
  userId: string;
}

export interface Deal {
  id: string;
  clientName: string;
  clientType: ClientType;
  dealValue: number; // SaaS Contract Value
  annualRecurringRevenue?: number;
  arrYear1?: number;
  implementationRevenue?: number;
  implementationTimeline?: ImplementationTimeline;
  leadSource: LeadSource;
  stage: DealStage;
  stageHistory: StageTimestamp[];
  changes: DealChange[];
  ownerId: string;
  contacts: Contact[];
  notes: Note[];
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  expectedCloseDate?: Date;
  isActive?: boolean;
}

// Contact types - independent from deal contacts
export interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  company?: string;
  linkedinUrl?: string;
  notes?: string;
  isPrimary: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  ownerId?: string;
  dealIds: string[]; // Links to multiple deals
  // Legacy compatibility field - used internally but not exposed in the interface
  dealId?: string; // For backwards compatibility
}

// Activity types
export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task' | 'stage_change';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  createdAt: Date;
  createdById: string; // User who created the activity
}

// Company types
export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  employeeCount?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  contactIds: string[]; // Links to multiple contacts
  dealIds: string[]; // Links to multiple deals
}

// Report types
export interface PipelineMetrics {
  totalDeals: number;
  totalValue: number;
  avgTimeInStage: Record<DealStage, number>; // in days
  closeRate: number;
  dealsByStage: Record<DealStage, number>;
  valueByStage: Record<DealStage, number>;
}

// Stage probability mapping - this will eventually be pulled from the database
export const stageProbability: Record<DealStage, number> = {
  'Lead Identified': 10,
  'Discovery Call': 25,
  'RFP/RFI Submitted': 40,
  'Demo Presented': 60,
  'Contract Negotiation': 80,
  'Closed Won': 100,
  'Closed Lost': 0
};

// New types for user preferences from Supabase
export interface UserPreferences {
  user_id: string;
  pipeline_view_type: 'card' | 'list';
  dashboard_value_type: 'total' | 'arr';
  created_at: Date;
  updated_at: Date;
}

// Supabase stage probability type
export interface StageProbability {
  id: number;
  stage: string;
  probability: number;
  created_at: Date;
  updated_at: Date;
}
