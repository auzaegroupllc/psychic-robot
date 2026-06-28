import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { FileText, CheckCircle, Loader2, X } from 'lucide-react';

interface InvoiceModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ lead, isOpen, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'success'>('idle');

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen || !lead) return null;

  const handleGenerate = () => {
    setStatus('generating');
    // Simulate the Google Apps Script PDF generation delay
    setTimeout(() => {
      setStatus('success');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-primary flex items-center">
            <FileText className="mr-2 text-accent" size={20} />
            Generate Proforma Invoice
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8">
          {status === 'idle' && (
            <>
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                This will generate a PDF invoice using the Google Docs template and save it to the <strong>Auzae Invoices</strong> folder.
              </p>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-8 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Contact:</span>
                  <span className="font-bold text-primary">{lead.contactPerson}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Service:</span>
                  <span className="font-bold text-primary">{lead.service}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Amount:</span>
                  <span className="font-bold text-accent-dark text-lg">${lead.pipelineValue.toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={handleGenerate}
                className="w-full py-3 bg-accent text-primary font-bold rounded-xl hover:bg-accent-dark transition-all shadow-md hover:shadow-lg"
              >
                Generate PDF
              </button>
            </>
          )}

          {status === 'generating' && (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <Loader2 className="animate-spin text-accent mb-5" size={48} />
              <h3 className="text-xl font-bold text-primary mb-2">Generating Invoice...</h3>
              <p className="text-sm text-slate-500">Merging template variables and converting to PDF.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                <CheckCircle className="text-emerald-500" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">Invoice Created!</h3>
              <p className="text-sm text-slate-600 mb-8">
                Proforma Invoice - {lead.contactPerson}.pdf has been saved to your Drive.
              </p>
              <button 
                onClick={onClose}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-all shadow-md hover:shadow-lg"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
