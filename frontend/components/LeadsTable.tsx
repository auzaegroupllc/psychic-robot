import React, { useState } from 'react';
import { Lead, User } from '../types';
import { Edit2, FileText, PhoneCall, AlertCircle, Plus, Download, Users } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onGenerateInvoice: (lead: Lead) => void;
  currentUser: User;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onEditLead, onGenerateInvoice, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leads.filter(l => 
    l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    if (status.includes('Archived')) return 'bg-slate-100 text-slate-600 border-slate-200';
    if (status === 'Closed Won') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (['New', 'Follow-Up'].includes(status)) return 'bg-accent/10 text-accent-dark border-accent/20';
    if (['No Answer', 'No Response', 'Busy'].includes(status)) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-primary/5 text-primary border-primary/10';
  };

  const handleExportCSV = () => {
    if (currentUser.role !== 'ADMIN') return;

    const headers = [
      'Lead ID', 'Date Added', 'Contact Person', 'Job Title', 'Email', 'Phone', 
      'Campaign', 'Pipeline Value', 'Service', 'Status', 'Call Outcome', 
      'Call Attempts', 'Last Call Timestamp', 'Assigned Rep Email'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(l => [
        l.id,
        l.dateAdded,
        `"${l.contactPerson || ''}"`,
        `"${l.jobTitle || ''}"`,
        l.email || '',
        l.phone || '',
        `"${l.campaign || ''}"`,
        l.pipelineValue,
        `"${l.service || ''}"`,
        `"${l.status}"`,
        `"${(l.callOutcome || '').replace(/"/g, '""')}"`,
        l.callAttempts,
        l.lastCallTimestamp || '',
        l.assignedRep
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auzae_leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Leads Pipeline</h1>
          <p className="text-slate-500 mt-1">Manage and track your client interactions.</p>
        </div>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search leads..."
            className="px-4 py-2.5 w-64 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Data Export: Admins Only */}
          {currentUser.role === 'ADMIN' && (
            <button 
              onClick={handleExportCSV}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center"
              title="Export visible leads to CSV"
            >
              <Download size={18} className="mr-1.5" />
              Export
            </button>
          )}

          <button 
            onClick={() => onEditLead({} as Lead)}
            className="bg-accent hover:bg-accent-dark text-primary px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center"
          >
            <Plus size={18} className="mr-1.5" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-widest font-semibold">
                <th className="p-5">Lead Info</th>
                <th className="p-5">Status & Outcome</th>
                <th className="p-5">Activity</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className={`hover:bg-slate-50/80 transition-colors ${lead.isEscalated ? 'bg-red-50/30' : ''}`}>
                  <td className="p-5">
                    <div className="flex items-center space-x-2">
                      {lead.isEscalated && <AlertCircle size={16} className="text-red-500" />}
                      <span className="font-bold text-primary text-base">{lead.contactPerson}</span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">{lead.id} • {lead.service}</div>
                    <div className="text-sm font-semibold text-accent-dark mt-1">${lead.pipelineValue.toLocaleString()}</div>
                  </td>
                  <td className="p-5">
                    <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold mb-2 border ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <div className="text-sm text-slate-600 truncate max-w-xs" title={lead.callOutcome}>
                      {lead.callOutcome || 'No outcome recorded'}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="text-sm text-slate-900">
                      <span className="font-medium text-slate-500">Attempts:</span> <span className="font-semibold">{lead.callAttempts}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1.5">
                      Last: {lead.lastCallTimestamp ? new Date(lead.lastCallTimestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </div>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <button 
                      onClick={() => onEditLead(lead)}
                      className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                      title="Log Call / Edit"
                    >
                      <PhoneCall size={18} />
                    </button>
                    <button 
                      onClick={() => onGenerateInvoice(lead)}
                      className="p-2.5 text-slate-400 hover:text-accent-dark hover:bg-accent/10 rounded-xl transition-colors"
                      title="Generate Proforma Invoice"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users size={48} className="text-slate-300 mb-4" />
                      <p className="text-lg font-medium text-slate-900">No leads found</p>
                      <p className="text-sm mt-1">Try adjusting your search terms.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
