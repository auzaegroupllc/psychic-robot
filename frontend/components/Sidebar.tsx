import React from 'react';
import { LayoutDashboard, Users, FileText, Settings, ShieldAlert, User as UserIcon, Globe, Plane, Shield } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentView: 'dashboard' | 'leads' | 'settings';
  setCurrentView: (view: 'dashboard' | 'leads' | 'settings') => void;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, currentUser }) => {
  return (
    <div className="w-72 bg-primary text-white h-screen flex flex-col fixed left-0 top-0 shadow-2xl z-20 border-r border-white/5">
      {/* Logo Section */}
      <div className="p-8 flex flex-col items-center border-b border-white/10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/20 rounded-full blur-3xl"></div>
        
        {/* Attractive CSS-based Logo Composition */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-5 transition-transform hover:scale-105 duration-300">
          {/* Shield Background */}
          <Shield size={110} className="absolute text-accent drop-shadow-lg" strokeWidth={1.5} fill="#0B132B" />
          
          {/* Globe Center */}
          <Globe size={64} className="absolute text-accent/90" strokeWidth={1.5} />
          
          {/* Plane Orbiting */}
          <div className="absolute w-full h-full animate-[spin_10s_linear_infinite]">
            <Plane size={24} className="absolute top-2 right-2 text-white drop-shadow-md rotate-45" fill="#ffffff" />
          </div>
        </div>

        <h1 className="text-xl font-bold tracking-widest text-accent uppercase text-center drop-shadow-md">
          Auzae Group
        </h1>
        <p className="text-[10px] text-slate-400 tracking-[0.2em] mt-1 text-center uppercase">
          Beyond Borders
        </p>
      </div>
      
      {/* User Profile Section */}
      <div className="px-6 py-5 border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-1.5">
          {currentUser.role === 'ADMIN' ? (
            <ShieldAlert size={16} className="text-accent" />
          ) : (
            <UserIcon size={16} className="text-blue-300" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {currentUser.role} PORTAL
          </span>
        </div>
        <div className="text-sm font-medium text-slate-100 truncate" title={currentUser.email}>
          {currentUser.email}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
            currentView === 'dashboard' 
              ? 'bg-accent/10 text-accent border-l-4 border-accent shadow-inner' 
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-4 border-transparent'
          }`}
        >
          <LayoutDashboard size={20} className={currentView === 'dashboard' ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'} />
          <span className="font-medium tracking-wide">Dashboard</span>
        </button>
        
        <button
          onClick={() => setCurrentView('leads')}
          className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
            currentView === 'leads' 
              ? 'bg-accent/10 text-accent border-l-4 border-accent shadow-inner' 
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-4 border-transparent'
          }`}
        >
          <Users size={20} className={currentView === 'leads' ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'} />
          <span className="font-medium tracking-wide">Leads Pipeline</span>
        </button>

        <button className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-4 border-transparent transition-all duration-200 group">
          <FileText size={20} className="text-slate-500 group-hover:text-slate-300" />
          <span className="font-medium tracking-wide">Invoices</span>
        </button>
      </nav>

      {/* Settings Footer */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        <button 
          onClick={() => setCurrentView('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
            currentView === 'settings' 
              ? 'bg-accent/10 text-accent border-l-4 border-accent shadow-inner' 
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-4 border-transparent'
          }`}
        >
          <Settings size={20} className={currentView === 'settings' ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'} />
          <span className="font-medium tracking-wide">Settings</span>
        </button>
      </div>
    </div>
  );
};
