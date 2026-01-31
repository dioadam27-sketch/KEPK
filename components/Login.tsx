
import React, { useState } from 'react';
import { UserRole } from '../types';
import { ShieldCheck, User, ArrowRight, Lock, Mail, AlertCircle, Settings, ChevronLeft, Users, AlertTriangle, Home } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string, roleType: 'user' | 'admin', selectedRole?: UserRole) => Promise<boolean>;
  onRegisterClick: () => void;
  onBackToHome?: () => void;
}

type LoginView = 'selection' | 'user' | 'admin';

export const Login: React.FC<LoginProps> = ({ onLogin, onRegisterClick, onBackToHome }) => {
  const [view, setView] = useState<LoginView>('selection');

  // State for User Login (Researcher/Reviewer)
  const [activeUserRole, setActiveUserRole] = useState<UserRole>('researcher');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  
  // State for Admin Login
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ section: 'user' | 'admin', msg: string } | null>(null);

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Panggil fungsi onLogin yang diteruskan dari App.tsx (yang akan memanggil API)
      const success = await onLogin(userEmail, userPassword, 'user', activeUserRole);
      if (!success) {
        setError({ section: 'user', msg: 'Email atau Password salah, atau akun belum aktif.' });
      }
    } catch (err) {
      setError({ section: 'user', msg: 'Terjadi kesalahan jaringan.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await onLogin(adminEmail, adminPassword, 'admin');
      if (!success) {
        setError({ section: 'admin', msg: 'Kredensial Admin tidak valid.' });
      }
    } catch (err) {
      setError({ section: 'admin', msg: 'Terjadi kesalahan jaringan.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 1. TAMPILAN PEMILIHAN PORTAL
  if (view === 'selection') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-[#003B73] z-0"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl z-0"></div>
        
        {/* Back to Home Button */}
        {onBackToHome && (
          <button 
            onClick={onBackToHome}
            className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white hover:text-unair-blue transition-all font-medium text-sm group"
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </button>
        )}
        
        <div className="z-10 text-center mb-10 mt-16 md:mt-0">
          <div className="flex items-center justify-center space-x-4 mb-4 text-white">
            <img 
              src="https://ppk2ipe.unair.ac.id/gambar/UNAIR_BRANDMARK_2025-02.png" 
              alt="Logo UNAIR" 
              className="h-16 bg-white rounded-lg p-1.5" 
            />
            <span className="text-3xl font-bold tracking-wide border-l border-white/30 pl-4">SIM KEPK</span>
          </div>
          <p className="text-blue-100 text-lg">Sistem Informasi Manajemen Komisi Etik Penelitian Kesehatan</p>
        </div>

        <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
          
          <button 
            onClick={() => setView('user')}
            className="group bg-[#FFFAF0] rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-blue-100 text-[#003B73] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Portal Pengguna</h3>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Akses untuk <strong>Peneliti</strong> mengajukan protokol dan <strong>Reviewer</strong> melakukan telaah etik.
            </p>
            <div className="mt-auto px-6 py-2 bg-white border border-slate-300 rounded-full text-sm font-semibold text-slate-600 group-hover:bg-[#003B73] group-hover:text-white group-hover:border-transparent transition-colors flex items-center">
              Masuk sebagai Pengguna <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>

          <button 
            onClick={() => setView('admin')}
            className="group bg-[#05111D] rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-800 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
            <div className="w-20 h-20 bg-slate-800 text-[#FFC107] rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
              <Settings className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Administrator</h3>
            <p className="text-slate-400 mb-6 leading-relaxed relative z-10">
              Panel kontrol khusus pengelola sistem untuk validasi akun, monitoring, dan konfigurasi.
            </p>
            <div className="mt-auto px-6 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm font-semibold text-slate-300 group-hover:bg-[#FFC107] group-hover:text-slate-900 group-hover:border-transparent transition-colors flex items-center relative z-10">
              Masuk Dashboard Admin <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>
        </div>
        
        <p className="mt-12 text-white/60 text-xs z-10">
          &copy; {new Date().getFullYear()} Komisi Etik Penelitian Kesehatan
        </p>
      </div>
    );
  }

  // 2. TAMPILAN LOGIN USER
  if (view === 'user') {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-[#FFFAF0] rounded-2xl shadow-2xl overflow-hidden relative animate-fadeIn">
          <button 
            type="button"
            onClick={() => setView('selection')}
            className="absolute top-4 left-4 flex items-center gap-1 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-lg transition-all font-bold text-sm z-20 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[3]" />
            Kembali
          </button>

          <div className="p-8 md:p-10 pt-16">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 p-4 border border-blue-100">
                 <img 
                   src="https://ppk2ipe.unair.ac.id/gambar/UNAIR_BRANDMARK_2025-02.png" 
                   alt="Logo UNAIR" 
                   className="w-full h-full object-contain" 
                 />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Portal Pengguna</h2>
              <p className="text-slate-500 text-sm mt-1">Silakan masuk sesuai peran Anda</p>
            </div>

            <div className="bg-[#F1F5F9] p-1 rounded-lg flex mb-6">
              <button
                type="button"
                onClick={() => { setActiveUserRole('researcher'); setError(null); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeUserRole === 'researcher' 
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Peneliti</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveUserRole('reviewer'); setError(null); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeUserRole === 'reviewer' 
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Reviewer</span>
              </button>
            </div>

            {error?.section === 'user' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm text-red-600 animate-fadeIn">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {error.msg}
              </div>
            )}

            <form onSubmit={handleUserLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email / Username</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent outline-none text-slate-800 font-medium placeholder:text-slate-400"
                    placeholder="nama@institusi.ac.id"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FFC107] focus:border-transparent outline-none text-slate-800 font-medium placeholder:text-slate-400"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-[#FFC107] text-slate-900 font-bold hover:bg-yellow-400 transition-colors shadow-md hover:shadow-lg"
              >
                {isLoading ? <span className="animate-pulse">Memproses...</span> : (
                  <><span>Masuk Portal</span> <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-400">
               <span>Belum punya akun? <button onClick={onRegisterClick} className="text-[#003B73] font-bold hover:underline">Daftar Akun Baru</button></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. TAMPILAN LOGIN ADMIN
  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-[#0F1E2E] flex items-center justify-center p-4 font-sans relative">
        {/* MODAL CONFIRMATION */}
        {showBackConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-[#05111D] border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl relative">
              <div className="w-12 h-12 bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Konfirmasi Kembali</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Apakah Anda yakin ingin kembali ke halaman utama pemilihan portal?
              </p>
              <div className="flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowBackConfirm(false)} 
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={() => { setShowBackConfirm(false); setView('selection'); }} 
                  className="flex-1 px-4 py-2 rounded-lg bg-[#003B73] text-white hover:bg-blue-800 transition-colors font-medium text-sm shadow-lg shadow-blue-900/20"
                >
                  Ya, Kembali
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md bg-[#05111D] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative animate-fadeIn">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowBackConfirm(true);
            }}
            className="absolute top-4 left-4 flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all z-20 font-bold text-sm cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[3]" />
            Kembali
          </button>

          <div className="p-8 md:p-10 pt-16 relative z-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-800 text-[#FFC107] rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <Settings className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Administrator</h2>
              <p className="text-slate-400 text-sm mt-1">Manajemen Sistem KEPK</p>
            </div>

            {error?.section === 'admin' && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center text-sm text-red-200 animate-fadeIn">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                {error.msg}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Admin Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 bg-[#0F1E2E] border border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-white placeholder-slate-600 transition-colors"
                    placeholder="Username"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Secret Key / Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                  <input
                    type="password"
                    className="block w-full pl-10 pr-3 py-2.5 bg-[#0F1E2E] border border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-white placeholder-slate-600 transition-colors"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-[#003B73] hover:bg-blue-800 text-white font-bold transition-all shadow-lg shadow-blue-900/20 border border-blue-800/50"
              >
                {isLoading ? <span className="animate-pulse">Verifikasi...</span> : (
                  <><span>Masuk Admin</span> <Settings className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
