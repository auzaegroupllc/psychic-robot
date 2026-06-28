export type UserRole = 'ADMIN' | 'REP';

export interface User {
  email: string;
  role: UserRole;
}

export type LeadStatus = 
  | 'New' 
  | 'No Answer' 
  | 'No Response'
  | 'Busy' 
  | 'Call Back' 
  | 'Asked to WhatsApp' 
  | 'RNR' 
  | 'Follow-Up' 
  | 'Waiting for document' 
  | 'Documents Received' 
  | 'Asked for details' 
  | 'Sent Email' 
  | 'Wanted to visit' 
  | 'Archived - Unresponsive' 
  | 'Closed Won';

export interface Lead {
  id: string;
  contactPerson: string;
  jobTitle?: string;
  phone?: string;
  email?: string;
  campaign?: string;
  pipelineValue: number;
  service: string;
  status: LeadStatus;
  callOutcome: string;
  lastCallTimestamp: string | null;
  callAttempts: number;
  dateAdded: string;
  assignedRep: string;
  isEscalated?: boolean;
  escalationReason?: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  totalPipeline: number;
  escalatedCount: number;
  archivedCount: number;
}
