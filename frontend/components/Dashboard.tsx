import React, { useMemo } from 'react';
import { Lead, DashboardMetrics } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, DollarSign, Users, Archive, TrendingUp, CheckCircle } from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
  onNavigateToLeads: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ leads, onNavigateToLeads }) => {
  const metrics: DashboardMetrics = useMemo(() => {
    return leads.reduce(
      (acc, lead) => {
        acc.totalLeads++;
        if (lead.status !== 'Archived - Unresponsive' && lead.status !== 'Closed Won') {
          acc.totalPipeline += lead.pipelineValue;
        }
        if (lead.isEscalated) acc.escalatedCount++;
        if (lead.status === 'Archived - Unresponsive') acc.archivedCount++;
        return acc;
      },
      { totalLeads: 0, totalPipeline: 0, escalatedCount: 0, archivedCount: 0 }
    );
  }, [leads]);

  const chartData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    leads.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });
    return Object.entries(statusCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 statuses
  }, [leads]);

  const escalatedLeads = leads.filter(l => l.isEscalated);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back to the Auzae Group CRM.</p>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-primary/5 text-primary rounded-xl">
            <Users size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Leads</p>
            <p className="text-3xl font-bold text-primary mt-1">{metrics.totalLeads}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-accent/10">
            <TrendingUp size={100} strokeWidth={1} />
          </div>
          <div className="p-4 bg-accent/10 text-accent-dark rounded-xl relative z-10">
            <DollarSign size={28} strokeWidth={1.5} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Pipeline</p>
            <p className="text-3xl font-bold text-primary mt-1">${metrics.totalPipeline.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4 cursor-pointer hover:border-red-300 hover:shadow-md transition-all group" onClick={onNavigateToLeads}>
          <div className="p-4 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100 transition-colors">
            <AlertTriangle size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Escalated</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{metrics.escalatedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-slate-100 text-slate-600 rounded-xl">
            <Archive size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Archived</p>
            <p className="text-3xl font-bold text-primary mt-1">{metrics.archivedCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-primary mb-6 flex items-center">
            <TrendingUp className="mr-2 text-accent" size={20} />
            Leads by Status
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => {
                    let color = '#0B132B'; // Primary
                    if (entry.name.includes('Archived')) color = '#cbd5e1';
                    if (entry.name === 'New' || entry.name === 'Follow-Up') color = '#D4AF37'; // Accent
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Escalations List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary flex items-center">
              <AlertTriangle size={20} className="text-red-500 mr-2" />
              Action Required
            </h2>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {escalatedLeads.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {escalatedLeads.length === 0 ? (
              <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <p className="font-medium text-slate-900">No escalated leads.</p>
                <p className="text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              escalatedLeads.map(lead => (
                <div key={lead.id} className="p-4 border border-red-100 bg-red-50/50 rounded-xl hover:bg-red-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900">{lead.contactPerson}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-2 py-1 rounded-md">
                      {lead.escalationReason}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">Status: <span className="font-semibold text-slate-900">{lead.status}</span></p>
                  <p className="text-xs text-slate-500">
                    Last Call: {lead.lastCallTimestamp ? new Date(lead.lastCallTimestamp).toLocaleString() : 'Never'}
                  </p>
                  <button 
                    onClick={onNavigateToLeads}
                    className="mt-3 text-sm text-primary font-semibold hover:text-accent transition-colors flex items-center"
                  >
                    View Lead <span className="ml-1">&rarr;</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
