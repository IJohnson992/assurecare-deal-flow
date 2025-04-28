
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

export interface ImplementationTimeline {
  startDate: Date;
  goLiveDate: Date;
}

export type ChangeType = 
  | 'stage_changed'
  | 'deal_added'
  | 'deal_closed'
  | 'arr_updated'
  | 'arr_year1_updated'
  | 'implementation_revenue_updated'
  | 'timeline_updated';

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
  dealValue: number;
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
}

export interface Contact {
  id: string;
  dealId: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
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
