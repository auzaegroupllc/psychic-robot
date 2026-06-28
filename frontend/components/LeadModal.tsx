import React, { useState, useEffect } from 'react';
import { Lead, User } from '../types';
import { STATUS_OPTIONS, SERVICE_OPTIONS, REP_READONLY_FIELDS } from '../constants';
import { X, Lock } from 'lucide-react';

interface LeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Partial<Lead>) => void;
  currentUser: User;
}

export const LeadModal: React.FC<LeadModalProps> = ({ lead, isOpen, onClose, onSave, currentUser }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (lead && isOpen) {
      setFormData(lead);
    } else {
      setFormData({
        contactPerson: '',
        jobTitle: '',
        email: '',
        phone: '',
        campaign: '',
        pipelineValue: 0,
        service: SERVICE_OPTIONS[0],
        status: 'New',
        callOutcome: '',
        assignedRep: currentUser.role === 'REP' ? currentUser.email : ''
      });
    }
  }, [lead, isOpen, currentUser]);

  if (!isOpen) return null;

  const isNew = !lead?.id;

  // Map frontend field names to the script's display names to check RBAC
  const fieldMap: Record<string, string> = {
    id: "Lead ID", 
    dateAdded: "Date Added", 
    contactPerson: "Contact Person",
    jobTitle: "Job Title", 
    phone: "Phone", 
    email: "Email", 
    campaign: "Campaign",
    assignedRep: "Assigned Rep Email", 
    lastCallTimestamp: "Last Call Timestamp"
  };

  const isFieldReadOnly = (fieldName: string) => {
    if (isNew) return false; // Can edit everything when creating a new lead
    return currentUser.role === 'REP' && REP_READONLY_FIELDS.includes(fieldMap[fieldName]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (isFieldReadOnly(name)) return; // Extra safety
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pipelineValue' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderInput = (name: keyof Lead, label: string, type: string = 'text', required = false) => {
    const readOnly = isFieldReadOnly(name);
    return (
      <div>
        <label className="flex items-center text-sm font-semibold text-slate-700 mb-1.5">
          {label}
          {readOnly && <Lock size={12} className="ml-1.5 text-slate-400" title="Read-only for Reps" />}
        </label>
        <input 
          required={required && !readOnly}
          type={type} 
          name={name}
          value={(formData[name] as string | number) || ''}
          onChange={handleChange}
          disabled={readOnly}
          className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-shadow ${
            readOnly ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' : 'border-slate-300 bg-white shadow-sm'
          }`}
        />
      </div>
    );
  };

  // Filter statuses: Reps cannot archive leads
  const availableStatuses = STATUS_OPTIONS.filter(opt => {
    if (currentUser.role === 'REP' && opt === 'Archived - Unresponsive') return false;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-primary">
            {isNew ? 'Add New Lead' : `Edit Lead: ${lead.id}`}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto flex-1">
          <form id="lead-form" onSubmit={handleSubmit} className="space-y-8">
            
            <div>
              <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {renderInput('contactPerson', 'Contact Person', 'text', true)}
                {renderInput('jobTitle', 'Job Title')}
                {renderInput('email', 'Email Address', 'email')}
                {renderInput('phone', 'Phone Number', 'tel')}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Lead Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {renderInput('campaign', 'Campaign Source')}
                {renderInput('assignedRep', 'Assigned Rep Email', 'email', true)}
                {renderInput('pipelineValue', 'Pipeline Value ($)', 'number', true)}
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service</label>
                  <select 
                    name="service"
                    value={formData.service || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white shadow-sm"
                  >
                    {SERVICE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Call Logging & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                  <select 
                    name="status"
                    value={formData.status || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white shadow-sm"
                  >
                    {availableStatuses.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Call Outcome / Notes</label>
                  <textarea 
                    name="callOutcome"
                    value={formData.callOutcome || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent bg-white shadow-sm resize-none"
                    placeholder="E.g., Left a voicemail, requested callback tomorrow..."
                  />
                </div>
              </div>
              
              {!isNew && (
                <div className="mt-6 bg-accent/5 p-4 rounded-xl border border-accent/20">
                  <p className="text-sm text-accent-dark">
                    <strong>Automation Note:</strong> Changing the Status or Call Outcome will automatically update the <em>Last Call Timestamp</em> to now and increment the <em>Call Attempts</em> counter.
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
        
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="lead-form"
            className="px-6 py-2.5 bg-primary text-white font-bold hover:bg-primary-light rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            {isNew ? 'Create Lead' : 'Save & Log Call'}
          </button>
        </div>
      </div>
    </div>
  );
};
