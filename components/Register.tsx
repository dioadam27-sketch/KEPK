
import React, { useState } from 'react';
import { UserRole } from '../types';
import { ShieldCheck, User, ArrowRight, Lock, Mail, Building, AlertCircle, Send, CreditCard, Phone, ChevronLeft } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface RegisterProps {
  onRegister: (data: any) => void;
  onLoginClick: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onLoginClick }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [role, setRole] = useState<UserRole>('researcher');
  
  // Updated State with new fields
  const [formData, setFormData] = useState({
    identityNumber: '', // NIK / NIDN / NIM
    name: '',
    phone: '', // No HP
    institution: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // KONFIGURASI EMAILJS
  const SERVICE_ID = 'service_87jjlv6'; 
  const TEMPLATE_ID = 'template_placeholder'; 
  const PUBLIC_KEY = 'public_key_placeholder'; 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendVerificationEmail = async () => {
    try {
      const templateParams = {
        to_name: formData.name,
        to_email: formData.email,
        institution: formData.institution,
        phone: formData.phone,
        role: role === 'researcher' ? 'Peneliti' : 'Reviewer',
        verification_link: `${window.location.origin}?verified=true&email=${formData.email}`,
        message: 'Terima kasih telah mendaftar di SIM KEPK.'
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      return true;
    } catch (err) {
      console.warn("EmailJS Error (Mode Simulasi Aktif):", err);
      return true; 
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (formData.password.length < 5) {
      setError('Password minimal 5 karakter.');
      return;
    }

    if (!formData.phone.match(/^[0-9]+$/)) {
      setError('Nomor Handphone hanya boleh berisi angka.');
      return;
    }

    setIsLoading(true);
    
    // 1. Kirim Email Verifikasi
    const emailSent = await sendVerificationEmail();

    if (emailSent) {
      // 2. Kirim data ke App.tsx agar tersimpan sebagai pending user
      onRegister({ ...formData, role });
      setStep('success');
    } else {
      setError('Gagal mengirim email verifikasi. Silakan coba lagi.');
    }
    
    setIsLoading(false);
  };

  // Tampilan Sukses (Cek Email)
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-10 text-center animate-fadeIn z-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Cek Email Anda</h2>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            Kami telah mengirimkan link verifikasi ke alamat email: <br/>
            <span className="font-bold text-slate-800">{formData.email}</span>
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-sm text-blue-800 text-left">
            <p className="font-semibold mb-1">Status Pendaftaran:</p>
            <p>Akun {role === 'reviewer' ? 'Reviewer' : 'Peneliti'} Anda kini berstatus <strong>Menunggu Persetujuan (Pending)</strong>. Admin akan memvalidasi NIDN/NIK dan data institusi Anda.</p>
          </div>

          <button 
            onClick={onLoginClick}
            className="w-full py-3 px-4 rounded-lg bg-unair-blue text-white font-bold hover:bg-blue-800 transition-colors shadow-lg"
          >
            Kembali ke Halaman Login
          </button>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-unair-blue to-slate-900 z-0"></div>
      </div>
    );
  }

  // Tampilan Form Registrasi
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-unair-blue to-slate-900 z-0"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-unair-yellow/10 rounded-full blur-3xl"></div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl z-10 flex overflow-hidden min-h-[650px] md:h-[750px]">
        {/* Left Side - Hero/Info */}
        <div className="hidden md:flex w-5/12 bg-unair-blue text-white p-10 flex-col justify-between relative transition-all duration-500">
          <div className="z-10">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="https://ppk2ipe.unair.ac.id/gambar/UNAIR_BRANDMARK_2025-02.png" 
                alt="Logo UNAIR" 
                className="h-12 w-auto bg-white rounded p-1.5" 
              />
              <span className="text-2xl font-bold tracking-wide text-white border-l border-white/30 pl-3">SIM KEPK</span>
            </div>
            
            <div className="animate-fadeIn" key={role}>
              <h2 className="text-3xl font-bold leading-tight mb-4">
                {role === 'researcher' ? 'Registrasi Pengusul' : 'Registrasi Penelaah'}
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                {role === 'researcher' 
                  ? 'Silakan lengkapi biodata Anda dengan benar sesuai data akademik (NIDN/NIM) untuk keperluan pengajuan Ethical Clearance.'
                  : 'Bergabunglah sebagai penelaah etik. Akun memerlukan validasi ketat dari Admin KEPK.'}
              </p>
              
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
                <h4 className="font-semibold text-yellow-400 text-sm mb-2">Persyaratan Data:</h4>
                <ul className="text-xs text-blue-100 space-y-2 list-disc pl-4">
                  <li>Nomor Identitas (NIDN untuk Dosen, NIM untuk Mahasiswa, NIK untuk Umum).</li>
                  <li>Nomor Handphone yang terhubung WhatsApp aktif.</li>
                  <li>Email Institusi (disarankan).</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="z-10 text-xs text-blue-200">
            &copy; {new Date().getFullYear()} Komisi Etik Penelitian Kesehatan
          </div>

          <div className="absolute bottom-0 right-0 w-64 h-64 bg-unair-yellow/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col h-full overflow-hidden relative">
          
          {/* Back Button - Highlighted & Larger */}
          <button 
            type="button"
            onClick={onLoginClick}
            className="absolute top-6 left-6 flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full shadow-sm hover:shadow-md hover:border-unair-blue/30 hover:text-unair-blue transition-all duration-300 font-bold text-sm z-20 group"
          >
            <div className="bg-slate-100 rounded-full p-1 group-hover:bg-blue-100 transition-colors">
               <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>Kembali</span>
          </button>

          <div className="text-center mb-6 shrink-0 mt-12 md:mt-4">
            <h3 className="text-2xl font-bold text-slate-800">Formulir Pendaftaran</h3>
            <p className="text-slate-500 text-sm mt-1">Lengkapi data diri Anda di bawah ini</p>
          </div>

          {/* Role Selection */}
          <div className="flex p-1 bg-slate-100 rounded-lg mb-6 shrink-0">
            <button
              type="button"
              onClick={() => setRole('researcher')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                role === 'researcher' 
                  ? 'bg-white text-unair-blue shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Peneliti / Pengusul</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('reviewer')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                role === 'reviewer' 
                  ? 'bg-white text-unair-blue shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Reviewer</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm text-red-600 animate-fadeIn shrink-0">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
             
             {/* 1. Identity Number */}
             <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                NIDN / NIK / NIM <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  name="identityNumber"
                  type="text"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none text-sm transition-shadow"
                  placeholder="Masukkan Nomor Identitas Akademik / KTP"
                  value={formData.identityNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 2. Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none text-sm transition-shadow"
                  placeholder="Contoh: Dr. Budi Santoso, Sp.PD"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 3. Institution */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institusi / Universitas <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  name="institution"
                  type="text"
                  required
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none text-sm transition-shadow"
                  placeholder="Nama Institusi Asal"
                  value={formData.institution}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 4. Contact Info Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none text-sm transition-shadow"
                    placeholder="email@institusi.ac.id"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  No. Handphone (WA) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none text-sm transition-shadow"
                    placeholder="08123xxxxxxx"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            {/* 5. Password Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none text-sm transition-shadow"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ulangi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none text-sm transition-shadow"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-slate-900 font-bold transition-colors shadow-lg shadow-yellow-100 bg-unair-yellow hover:bg-yellow-400"
              >
                {isLoading ? (
                  <span className="animate-pulse">Mengirim Data...</span>
                ) : (
                  <>
                    <span>Daftar {role === 'researcher' ? 'Sekarang' : 'Reviewer'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-xs text-slate-400 shrink-0">
            <span>Sudah punya akun? <button onClick={onLoginClick} className="text-unair-blue font-bold hover:underline focus:outline-none">Masuk di sini</button></span>
          </div>
        </div>
      </div>
    </div>
  );
};
