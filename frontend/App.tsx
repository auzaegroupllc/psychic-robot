import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LeadsTable } from './components/LeadsTable';
import { LeadModal } from './components/LeadModal';
import { InvoiceModal } from './components/InvoiceModal';
import { SettingsView } from './components/SettingsView';
import { Lead, User } from './types';
import { INITIAL_LEADS, ADMIN_EMAILS } from './constants';
import { Play, CheckCircle, LogOut } from 'lucide-react';

export default function App() {
  // Mock Authentication State
  const [currentUser, setCurrentUser] = useState<User>({ email: 'info@auzaegroup.com', role: 'ADMIN' });
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'leads' | 'settings'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  
  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceLead, setInvoiceLead] = useState<Lead | null>(null);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // =====================================================================
  // SCRIPT 3 REPLICA: GET DATA WITH ROW-LEVEL SECURITY
  // =====================================================================
  const visibleLeads = useMemo(() => {
    if (currentUser.role === 'ADMIN') {
      return leads;
    }
    // Reps only see their own leads
    return leads.filter(l => l.assignedRep.toLowerCase() === currentUser.email.toLowerCase());
  }, [leads, currentUser]);

  // =====================================================================
  // SCRIPT 4 REPLICA: UPDATE DATA WITH FIELD-LEVEL SECURITY
  // =====================================================================
  const handleSaveLead = (leadData: Partial<Lead>) => {
    if (editingLead?.id) {
      // Edit existing
      setLeads(prev => prev.map(l => {
        if (l.id === editingLead.id) {
          const isStatusEdited = leadData.status && leadData.status !== l.status;
          const isOutcomeEdited = leadData.callOutcome && leadData.callOutcome !== l.callOutcome;
          
          let newTimestamp = l.lastCallTimestamp;
          let newAttempts = l.callAttempts;

          // ACTION A: Update Timestamp & Call Attempts
          if (isStatusEdited || isOutcomeEdited) {
            newTimestamp = new Date().toISOString();
            newAttempts += 1;
          }

          // If status changed, clear escalation flag so it doesn't stay stuck
          const isEscalated = isStatusEdited ? false : l.isEscalated;
          const escalationReason = isStatusEdited ? undefined : l.escalationReason;

          return { 
            ...l, 
            ...leadData, 
            lastCallTimestamp: newTimestamp, 
            callAttempts: newAttempts,
            isEscalated,
            escalationReason
          } as Lead;
        }
        return l;
      }));
      showToast('Lead updated and call logged.');
    } else {
      // Add new
      const newLead: Lead = {
        ...leadData,
        id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
        dateAdded: new Date().toISOString(),
        lastCallTimestamp: null,
        callAttempts: 0,
      } as Lead;
      setLeads(prev => [newLead, ...prev]);
      showToast('New lead created.');
    }
    setIsLeadModalOpen(false);
  };

  // =====================================================================
  // SCRIPT 5 REPLICA: ADMIN BULK UPLOAD (Local State Update)
  // =====================================================================
  const handleBulkUploadSuccess = (newLeadsData: Partial<Lead>[]) => {
    setLeads(prev => {
      const newLeads = newLeadsData.map(data => ({
        ...data,
        id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'New',
        callOutcome: '',
        lastCallTimestamp: null,
        callAttempts: 0,
        dateAdded: new Date().toISOString(),
      } as Lead));
      // Append to top of local state so user sees them immediately
      return [...newLeads, ...prev]; 
    });
    showToast(`Successfully uploaded ${newLeadsData.length} leads.`);
  };

  // =====================================================================
  // SCRIPT 6 REPLICA: DAILY SCHEDULED SCANNER (Escalations & Auto-Archive)
  // =====================================================================
  const runDailyScanner = useCallback(() => {
    const now = new Date();
    let archivedCount = 0;
    let escalatedCount = 0;

    setLeads(prevLeads => prevLeads.map(lead => {
      let newStatus = lead.status;
      let isEscalated = false;
      let escalationReason = '';

      const dateAdded = new Date(lead.dateAdded);
      const lastCall = lead.lastCallTimestamp ? new Date(lead.lastCallTimestamp) : null;

      // Skip already archived or closed
      if (['Archived - Unresponsive', 'Closed Won'].includes(newStatus)) {
        return lead;
      }

      // RULE 1: Auto-Archive (72 hours since Date Added)
      if (['No Answer', 'No Response'].includes(newStatus)) {
        const hoursSinceAdded = (now.getTime() - dateAdded.getTime()) / (1000 * 60 * 60);
        if (hoursSinceAdded >= 72) {
          newStatus = 'Archived - Unresponsive';
          archivedCount++;
          return { ...lead, status: newStatus, isEscalated: false, escalationReason: '' };
        }
      }

      // RULE 2: Escalations (24/48 hours since Last Call)
      if (lastCall) {
        const hoursSinceLastCall = (now.getTime() - lastCall.getTime()) / (1000 * 60 * 60);
        const rule1Statuses = ['New', 'No Answer', 'Busy', 'Call Back', 'Asked to WhatsApp', 'RNR'];
        const rule2Statuses = ['Follow-Up', 'Waiting for document', 'Documents Received', 'Asked for details', 'Sent Email', 'Wanted to visit'];

        if (rule1Statuses.includes(newStatus) && hoursSinceLastCall >= 24) {
          isEscalated = true;
          escalationReason = '24-Hour Alert';
          escalatedCount++;
        } else if (rule2Statuses.includes(newStatus) && hoursSinceLastCall >= 48) {
          isEscalated = true;
          escalationReason = '48-Hour Alert';
          escalatedCount++;
        }
      }

      return { ...lead, status: newStatus, isEscalated, escalationReason };
    }));

    showToast(`Scanner complete: ${archivedCount} archived, ${escalatedCount} escalated.`);
  }, []);

  // Run scanner once on mount to initialize mock data states
  useEffect(() => {
    runDailyScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mock Login Switcher
  const toggleUserRole = () => {
    if (currentUser.role === 'ADMIN') {
      setCurrentUser({ email: 'john@auzaegroup.com', role: 'REP' });
      setCurrentView('dashboard'); // Reset view in case they were on settings
    } else {
      setCurrentUser({ email: 'info@auzaegroup.com', role: 'ADMIN' });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} />
      
      <main className="flex-1 ml-72">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          <div className="flex items-center space-x-5">
            <button 
              onClick={runDailyScanner}
              className="flex items-center space-x-2 text-sm font-bold text-primary bg-accent/10 hover:bg-accent/20 px-5 py-2.5 rounded-xl transition-colors"
              title="Simulates the daily cron job for escalations and archiving"
            >
              <Play size={16} className="text-accent-dark" />
              <span>Run Daily Scanner</span>
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            <button 
              onClick={toggleUserRole}
              className="flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors"
              title="Switch between Admin and Rep to test RBAC"
            >
              <LogOut size={18} />
              <span>Switch to {currentUser.role === 'ADMIN' ? 'Rep' : 'Admin'}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="pb-12 pt-4">
          {currentView === 'dashboard' ? (
            <Dashboard leads={visibleLeads} onNavigateToLeads={() => setCurrentView('leads')} />
          ) : currentView === 'leads' ? (
            <LeadsTable 
              leads={visibleLeads} 
              onEditLead={(lead) => {
                setEditingLead(lead.id ? lead : null);
                setIsLeadModalOpen(true);
              }}
              onGenerateInvoice={(lead) => {
                setInvoiceLead(lead);
                setIsInvoiceModalOpen(true);
              }}
              currentUser={currentUser}
            />
          ) : (
            <SettingsView currentUser={currentUser} onBulkUploadSuccess={handleBulkUploadSuccess} />
          )}
        </div>
      </main>

      {/* Modals */}
      <LeadModal 
        isOpen={isLeadModalOpen} 
        lead={editingLead} 
        onClose={() => setIsLeadModalOpen(false)} 
        onSave={handleSaveLead}
        currentUser={currentUser}
      />
      
      <InvoiceModal 
        isOpen={isInvoiceModalOpen} 
        lead={invoiceLead} 
        onClose={() => setIsInvoiceModalOpen(false)} 
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-primary text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-fade-in-up z-50 border border-white/10">
          <CheckCircle size={20} className="text-accent" />
          <span className="font-medium tracking-wide">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
