import { Lead, LeadStatus } from './types';

export const TARGET_SPREADSHEET_ID = "1zHyvd_FsgI6h578RUlQsdxG1GtYApHOXChzq6Es6wMc";

// Replace this with your actual deployed Google Apps Script Webhook URL
export const WEBHOOK_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec";

export const ADMIN_EMAILS = ["info@auzaegroup.com", "marketing@auzaegroup.com"];

// Strict Field-Level Security Rules for Reps
export const REP_READONLY_FIELDS = [
  "Lead ID", 
  "Date Added", 
  "Campaign", 
  "Contact Person", 
  "Email", 
  "Phone", 
  "Job Title", 
  "Assigned Rep Email", 
  "Call Attempts", 
  "Last Call Timestamp"
];

export const STATUS_OPTIONS: LeadStatus[] = [
  'New', 'No Answer', 'No Response', 'Busy', 'Call Back', 'Asked to WhatsApp', 'RNR', 
  'Follow-Up', 'Waiting for document', 'Documents Received', 'Asked for details', 
  'Sent Email', 'Wanted to visit', 'Archived - Unresponsive', 'Closed Won'
];

export const SERVICE_OPTIONS = [
  'Consulting', 'Software Development', 'Marketing', 'Design', 'Support'
];

// Helper to generate dates in the past
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const hoursAgo = (hours: number) => {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'LD-1001',
    contactPerson: 'Alice Johnson',
    jobTitle: 'CTO',
    email: 'alice@techcorp.com',
    phone: '+1 555-0101',
    campaign: 'Q3 Inbound',
    pipelineValue: 15000,
    service: 'Software Development',
    status: 'New',
    callOutcome: 'Pending initial outreach',
    lastCallTimestamp: null,
    callAttempts: 0,
    dateAdded: daysAgo(1),
    assignedRep: 'john@auzaegroup.com'
  },
  {
    id: 'LD-1002',
    contactPerson: 'Bob Smith',
    jobTitle: 'Marketing Director',
    email: 'bob.smith@retailer.net',
    phone: '+1 555-0102',
    campaign: 'Cold Outreach',
    pipelineValue: 5000,
    service: 'Consulting',
    status: 'No Answer',
    callOutcome: 'Left voicemail',
    lastCallTimestamp: hoursAgo(26), // Should trigger 24h escalation
    callAttempts: 2,
    dateAdded: daysAgo(2),
    assignedRep: 'sarah@auzaegroup.com'
  },
  {
    id: 'LD-1003',
    contactPerson: 'Charlie Davis',
    jobTitle: 'CEO',
    email: 'cdavis@startup.io',
    phone: '+1 555-0103',
    campaign: 'Webinar Signups',
    pipelineValue: 8500,
    service: 'Marketing',
    status: 'Waiting for document',
    callOutcome: 'Requested NDA',
    lastCallTimestamp: hoursAgo(50), // Should trigger 48h escalation
    callAttempts: 3,
    dateAdded: daysAgo(5),
    assignedRep: 'john@auzaegroup.com'
  },
  {
    id: 'LD-1004',
    contactPerson: 'Diana Prince',
    jobTitle: 'VP Operations',
    email: 'diana@logistics.com',
    phone: '+1 555-0104',
    campaign: 'Q3 Inbound',
    pipelineValue: 12000,
    service: 'Design',
    status: 'No Response',
    callOutcome: 'Emailed proposal, no reply',
    lastCallTimestamp: daysAgo(4),
    callAttempts: 4,
    dateAdded: daysAgo(4), // Should trigger 72h auto-archive
    assignedRep: 'sarah@auzaegroup.com'
  },
  {
    id: 'LD-1005',
    contactPerson: 'Evan Wright',
    jobTitle: 'Founder',
    email: 'evan@wrightinc.com',
    phone: '+1 555-0105',
    campaign: 'Referral',
    pipelineValue: 22000,
    service: 'Software Development',
    status: 'Follow-Up',
    callOutcome: 'Good chat, call back next week',
    lastCallTimestamp: hoursAgo(2),
    callAttempts: 1,
    dateAdded: daysAgo(1),
    assignedRep: 'john@auzaegroup.com'
  }
];
