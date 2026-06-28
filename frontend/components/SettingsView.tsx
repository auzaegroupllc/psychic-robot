import React, { useState, useRef } from 'react';
import { TARGET_SPREADSHEET_ID, WEBHOOK_URL } from '../constants';
import { Database, ShieldCheck, FileCode2, UploadCloud, AlertCircle, Webhook, Code, FileText, Loader2, CheckCircle } from 'lucide-react';
import { User, Lead } from '../types';

interface SettingsViewProps {
  currentUser: User;
  onBulkUploadSuccess: (newLeads: Partial<Lead>[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onBulkUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        setUploadError("Please upload a valid .csv file.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const processUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim() !== '');
      
      if (lines.length < 2) {
        throw new Error("CSV must contain headers and at least one row of data.");
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rowsToProcess = lines.slice(1);
      
      setProgress({ current: 0, total: rowsToProcess.length });
      
      const successfullyParsedLeads: Partial<Lead>[] = [];

      // Loop through parsed rows and send POST request for each
      for (let i = 0; i < rowsToProcess.length; i++) {
        const values = rowsToProcess[i].split(',').map(v => v.trim());
        const rowData: Record<string, string> = {};
        
        headers.forEach((h, idx) => { 
          rowData[h] = values[idx] || ''; 
        });

        // Map to expected JSON payload
        const payload = {
          action: "create", // Strictly append to bottom
          contactPerson: rowData['contact person'] || '',
          email: rowData['email'] || '',
          phone: rowData['phone'] || '',
          campaign: rowData['campaign'] || '',
          repEmail: currentUser.email
        };

        try {
          // Send POST request to Google Apps Script Webhook
          // Note: Using text/plain to avoid CORS preflight issues common with GAS
          await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
          });

          // Store for local UI update
          successfullyParsedLeads.push({
            contactPerson: payload.contactPerson,
            email: payload.email,
            phone: payload.phone,
            campaign: payload.campaign,
            assignedRep: payload.repEmail,
            pipelineValue: 0,
            service: 'Consulting' // Default
          });

        } catch (err) {
          console.error(`Failed to upload row ${i + 1}:`, err);
          // Continue processing other rows even if one fails
        }

        setProgress(prev => ({ ...prev, current: i + 1 }));
      }

      // Update local UI state
      if (successfullyParsedLeads.length > 0) {
        onBulkUploadSuccess(successfullyParsedLeads);
      }
      
      setFile(null);
      setProgress({ current: 0, total: 0 });

    } catch (error: any) {
      setUploadError(error.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">System Settings</h1>
        <p className="text-slate-500 mt-1">Manage integrations and administrative tools.</p>
      </div>
      
      <div className="space-y-8">
        
        {/* Admin Bulk Upload Section */}
        {currentUser.role === 'ADMIN' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 border-t-4 border-t-accent">
            <h2 className="text-xl font-bold text-primary mb-3 flex items-center">
              <UploadCloud className="mr-2 text-accent" size={24} />
              Bulk Lead Upload (CSV)
            </h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Upload a CSV file to bulk insert new leads. Data will be sent securely to the Google Cloud Webhook and appended to the bottom of the database.
              <br/>
              Expected headers: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-primary font-semibold">Contact Person, Email, Phone, Campaign</code>.
            </p>
            
            {/* Drag and Drop Zone */}
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                isDragging 
                  ? 'border-accent bg-accent/5' 
                  : file ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isUploading}
              />

              {!file && !isUploading && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-700">Drag & drop your CSV file here</p>
                    <p className="text-sm text-slate-500 mt-1">or click to browse from your computer</p>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Select File
                  </button>
                </div>
              )}

              {file && !isUploading && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <FileText size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-800">{file.name}</p>
                    <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <div className="flex space-x-3 mt-2">
                    <button 
                      onClick={() => setFile(null)}
                      className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={processUpload}
                      className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-all shadow-md"
                    >
                      Start Upload
                    </button>
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="flex flex-col items-center justify-center space-y-5 py-4">
                  <Loader2 size={40} className="text-accent animate-spin" />
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                      <span>Processing rows...</span>
                      <span>{progress.current} / {progress.total}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-accent h-2.5 rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Sending data to Google Cloud Webhook...</p>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{uploadError}</p>
              </div>
            )}
          </div>
        )}

        {currentUser.role === 'REP' && (
          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6 flex items-start space-x-4">
            <AlertCircle className="text-orange-500 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-orange-800 text-lg">Restricted Access</h3>
              <p className="text-sm text-orange-700 mt-1 leading-relaxed">
                You are logged in as a Sales Rep. Administrative settings and bulk upload features are hidden.
              </p>
            </div>
          </div>
        )}

        {/* Webhook API Integration */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-primary mb-3 flex items-center">
            <Webhook className="mr-2 text-slate-400" size={24} />
            Google Cloud Webhook API
          </h2>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Use this endpoint to programmatically create or update leads from external applications. Send a <code>POST</code> request with a JSON payload.
          </p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Webhook URL</label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  readOnly
                  value={WEBHOOK_URL}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-mono text-sm focus:outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-5 text-slate-300 text-sm font-mono overflow-x-auto">
                <div className="flex items-center text-emerald-400 mb-3 font-sans font-bold">
                  <Code size={16} className="mr-2" /> Create Lead Payload
                </div>
                <pre>
{`{
  "action": "create",
  "contactPerson": "John Doe",
  "email": "john@example.com",
  "phone": "+1 555-0199",
  "campaign": "Website Form",
  "repEmail": "rep@auzaegroup.com"
}`}
                </pre>
              </div>

              <div className="bg-slate-900 rounded-xl p-5 text-slate-300 text-sm font-mono overflow-x-auto">
                <div className="flex items-center text-blue-400 mb-3 font-sans font-bold">
                  <Code size={16} className="mr-2" /> Update Lead Payload
                </div>
                <pre>
{`{
  "action": "update",
  "leadId": "L-1715000000000",
  "status": "Follow-Up",
  "notes": "Requested a callback."
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Database Integration Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-primary mb-3 flex items-center">
            <Database className="mr-2 text-slate-400" size={24} />
            Google Sheets Integration
          </h2>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Configure the connection to your Google Sheets database. The automation scripts are bound to this specific spreadsheet to prevent unauthorized edits.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target Spreadsheet ID</label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  readOnly
                  value={TARGET_SPREADSHEET_ID}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-mono text-sm focus:outline-none shadow-inner"
                />
                <div className="flex items-center text-emerald-700 text-sm font-bold px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200 whitespace-nowrap">
                  <ShieldCheck size={18} className="mr-1.5" />
                  Verified
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Security check enabled: <code className="bg-slate-100 px-1 py-0.5 rounded">if (e.source.getId() !== TARGET_SPREADSHEET_ID) return;</code>
              </p>
            </div>
          </div>
        </div>

        {/* Script Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-primary mb-6 flex items-center">
            <FileCode2 className="mr-2 text-slate-400" size={24} />
            Active Automations
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h3 className="font-bold text-primary">Real-Time Edits (onEdit)</h3>
                <p className="text-sm text-slate-500 mt-0.5">Tracks timestamps, call attempts, and triggers invoice generation.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md uppercase tracking-wider">Active</span>
            </div>
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h3 className="font-bold text-primary">Daily Scanner (Cron Job)</h3>
                <p className="text-sm text-slate-500 mt-0.5">Auto-archives unresponsive leads and sends escalation emails.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md uppercase tracking-wider">Active</span>
            </div>
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h3 className="font-bold text-primary">Role-Based Access Control (RBAC)</h3>
                <p className="text-sm text-slate-500 mt-0.5">Enforces row-level and field-level security based on user role.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md uppercase tracking-wider">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
