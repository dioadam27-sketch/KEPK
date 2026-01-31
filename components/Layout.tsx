
import React from 'react';
import { LayoutDashboard, FileText, CheckCircle, ShieldCheck, UserCircle, LogOut, Users, Settings, FolderCog, FileStack } from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentRole, 
  onLogout,
  activeView,
  setActiveView 
}) => {
  
  let menuItems: {id: string, label: string, icon: any}[] = [];

  if (currentRole === 'researcher') {
    menuItems = [
      { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
      { id: 'submission', label: 'Pengajuan Baru', icon: FileText },
      { id: 'monitoring', label: 'Monitoring', icon: CheckCircle },
    ];
  } else if (currentRole === 'reviewer') {
    menuItems = [
      { id: 'admin-dashboard', label: 'Dashboard Reviewer', icon: ShieldCheck },
      { id: 'admin-review', label: 'Daftar Telaah', icon: FileText },
    ];
  } else if (currentRole === 'admin') {
    menuItems = [
      { id: 'admin-users', label: 'Manajemen User', icon: Users },
      { id: 'admin-submissions', label: 'Data Pengajuan', icon: FileStack }, // Menu Baru
      { id: 'admin-documents', label: 'Master Dokumen', icon: FolderCog },
      { id: 'admin-settings', label: 'Pengaturan Sistem', icon: Settings },
    ];
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className={`w-64 flex flex-col shadow-xl z-10 ${currentRole === 'admin' ? 'bg-slate-900 text-white' : 'bg-unair-blue text-white'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <img 
              src="https://ppk2ipe.unair.ac.id/gambar/UNAIR_BRANDMARK_2025-02.png" 
              alt="Logo UNAIR" 
              className="h-10 w-auto bg-white rounded p-1" 
            />
            <span className="text-xl font-bold tracking-wide text-white">SIM KEPK</span>
          </div>
          <p className="text-xs text-white/60 mt-2">
            {currentRole === 'admin' ? 'Administrator Panel' : 'Sistem Informasi Kaji Etik'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-white/10 text-white shadow-lg font-semibold border-l-4 border-yellow-400' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-yellow-400' : ''}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className={`${currentRole === 'admin' ? 'bg-blue-500' : 'bg-unair-yellow'} rounded-full p-1`}>
              <UserCircle className="w-6 h-6 text-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentRole === 'researcher' ? 'Dr. Budi Santoso' : currentRole === 'reviewer' ? 'Prof. Reviewer' : 'Super Admin'}
              </p>
              <p className="text-xs text-white/60 capitalize">{currentRole}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full text-xs flex items-center justify-center space-x-2 border border-white/20 rounded p-2 text-white/70 hover:bg-red-500/80 hover:text-white hover:border-red-500/80 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm sticky top-0 z-10 px-8 py-4 flex justify-between items-center border-b border-gray-100">
          <h2 className={`text-xl font-bold ${currentRole === 'admin' ? 'text-slate-800' : 'text-unair-blue'}`}>
            {menuItems.find(i => i.id === activeView)?.label || (activeView.includes('detail') ? 'Detail Data' : 'Dashboard')}
          </h2>
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
