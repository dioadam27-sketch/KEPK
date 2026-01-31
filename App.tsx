import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SubmissionForm } from './components/SubmissionForm';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { LandingPage } from './components/LandingPage';
import { ResearchSubmission, UserRole, SubmissionStatus, UserProfile, DocumentRequirement } from './types';
import { FileText, Clock, CheckCircle, XCircle, Eye, AlertTriangle, FileCheck, Download, User, ShieldCheck, Check, X, Building, Mail, Trash2, Plus, FolderCog, Phone, CreditCard, FileStack, ArrowLeft, DownloadCloud, Loader2 } from 'lucide-react';
import { apiService } from './services/apiService';

// --- DEFAULT STATE JIKA API KOSONG ---
const DEFAULT_DOC_REQS: DocumentRequirement[] = [
  { id: 'protocol', label: 'Protokol Lengkap (PDF)', isRequired: true },
  { id: 'consent', label: 'Informed Consent / PSP', isRequired: true },
];

const StatusBadge: React.FC<{ status: SubmissionStatus }> = ({ status }) => {
  const styles = {
    draft: 'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-100 text-blue-600',
    under_review: 'bg-amber-100 text-amber-700',
    revision_needed: 'bg-red-100 text-red-600',
    approved: 'bg-green-100 text-green-700',
    monitoring: 'bg-purple-100 text-purple-700',
  };

  const labels = {
    draft: 'Draft',
    submitted: 'Terkirim',
    under_review: 'Dalam Telaah',
    revision_needed: 'Perlu Revisi',
    approved: 'Disetujui (EC Terbit)',
    monitoring: 'Monitoring',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  // Current User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // Data State
  const [submissions, setSubmissions] = useState<ResearchSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ResearchSubmission | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [docRequirements, setDocRequirements] = useState<DocumentRequirement[]>(DEFAULT_DOC_REQS);
  
  // UI State
  const [activeView, setActiveView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  // --- FETCH DATA LOGIC ---
  const fetchData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // 1. Fetch Submissions (Filtered by backend based on role)
      const subRes = await apiService.getSubmissions(currentUser.role, currentUser.email);
      if (subRes.status === 'success') {
        setSubmissions(subRes.data);
      }

      // 2. Fetch Config (Master Documents)
      const configRes = await apiService.getConfig();
      if (configRes.status === 'success' && configRes.data.length > 0) {
        setDocRequirements(configRes.data);
      }

      // 3. Admin Only: Fetch Users
      if (currentUser.role === 'admin') {
        const usersRes = await apiService.getUsers();
        if (usersRes.status === 'success') {
          setUsers(usersRes.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch on login or view change
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchData();
    }
  }, [isLoggedIn, currentUser, activeView]);


  const handleEnterSystem = () => {
    setShowLanding(false);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setAuthView('login');
  };

  // Updated Login Handler using API
  const handleLogin = async (email: string, password: string, roleType: 'user' | 'admin', selectedRole?: UserRole) => {
    const response = await apiService.login(email, password);
    
    if (response.status === 'success') {
      const userData = response.data;
      
      // Validasi Role untuk User Login
      if (roleType === 'user' && userData.role !== selectedRole && userData.role !== 'admin') {
         // Jika role di DB tidak sesuai dengan tab yang dipilih (kecuali admin bisa login dimana saja)
         // Namun untuk simplifikasi, kita izinkan login jika kredensial benar, 
         // lalu set role sesuai data DB
      }

      setCurrentUser(userData);
      setIsLoggedIn(true);
      
      // Redirect View
      if (userData.role === 'researcher') setActiveView('dashboard');
      else if (userData.role === 'reviewer') setActiveView('admin-dashboard');
      else setActiveView('admin-users');

      return true;
    }
    return false;
  };

  const handleRegister = async (data: any) => {
    // Register via API
    await apiService.register(data);
    // Tidak auto login, user harus menunggu approval admin (sesuai logic Register.tsx yang menampilkan sukses)
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAuthView('login');
    setSelectedSubmission(null);
    setSubmissions([]); // Clear data
    setShowLanding(true);
  };

  const handleCreateSubmission = async (newSub: Omit<ResearchSubmission, 'id' | 'status' | 'submissionDate' | 'progressReports'>) => {
    setIsLoading(true);
    const submissionPayload = {
      ...newSub,
      id: `EC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`, // ID sementara, idealnya dr backend
      researcherEmail: currentUser?.email, // Penting untuk filter backend
      status: 'submitted',
      submissionDate: new Date().toISOString().split('T')[0],
      progressReports: []
    };

    const res = await apiService.createSubmission(submissionPayload);
    if (res.status === 'success') {
      await fetchData(); // Refresh data
      setActiveView('dashboard');
    } else {
      alert("Gagal membuat pengajuan: " + res.message);
    }
    setIsLoading(false);
  };

  const handleReviewAction = async (id: string, action: 'approve' | 'revise', feedback?: string) => {
    setIsLoading(true);
    const status = action === 'approve' ? 'approved' : 'revision_needed';
    const approvalDate = action === 'approve' ? new Date().toISOString().split('T')[0] : undefined;
    
    const res = await apiService.updateSubmissionStatus(id, status, feedback, approvalDate);
    if (res.status === 'success') {
      await fetchData();
      setSelectedSubmission(null);
      if (currentUser?.role === 'reviewer') setActiveView('admin-dashboard');
      else setActiveView('admin-submissions');
    }
    setIsLoading(false);
  };

  const handleMockDownload = (filename: string) => {
    alert(`Sedang mengunduh file: ${filename}\n(Simulasi Download - Fitur Real File Storage belum diimplementasi)`);
  };

  // --- ADMIN ACTIONS ---
  const handleUserApproval = async (userId: string, approved: boolean) => {
    setIsLoading(true);
    const status = approved ? 'active' : 'rejected';
    const res = await apiService.updateUserStatus(userId, status);
    if (res.status === 'success') {
      await fetchData(); // Refresh user list
    }
    setIsLoading(false);
  };

  const handleAddDocRequirement = async (label: string) => {
    setIsLoading(true);
    const id = label.toLowerCase().replace(/\s+/g, '-');
    const res = await apiService.addConfig(id, label, true);
    if (res.status === 'success') {
      await fetchData();
    }
    setIsLoading(false);
  };

  const handleDeleteDocRequirement = async (id: string) => {
    setIsLoading(true);
    const res = await apiService.deleteConfig(id);
    if (res.status === 'success') {
      await fetchData();
    }
    setIsLoading(false);
  };

  // --- VIEWS ---

  const AdminDocumentManagement = () => {
    const [newDocLabel, setNewDocLabel] = useState('');
    const [notification, setNotification] = useState<string | null>(null);

    const onSubmitNewDoc = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newDocLabel.trim()) {
        await handleAddDocRequirement(newDocLabel);
        setNewDocLabel('');
      }
    };

    const handleDelete = async (id: string) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus persyaratan dokumen ini?")) {
        await handleDeleteDocRequirement(id);
        setNotification("Dokumen berhasil dihapus.");
        setTimeout(() => setNotification(null), 3000);
      }
    };

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
             <div className="bg-blue-100 p-2 rounded-lg text-unair-blue">
               <FolderCog className="w-6 h-6"/>
             </div>
             <div>
               <h3 className="text-xl font-bold text-slate-800">Master Data Dokumen</h3>
               <p className="text-sm text-slate-500">Atur jenis dokumen yang wajib diunggah oleh peneliti.</p>
             </div>
          </div>

          {notification && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center text-sm animate-fadeIn">
              <CheckCircle className="w-4 h-4 mr-2" />
              {notification}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Tambah */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
              <h4 className="font-semibold text-slate-700 mb-4 flex items-center">
                <Plus className="w-4 h-4 mr-2"/> Tambah Jenis Dokumen
              </h4>
              <form onSubmit={onSubmitNewDoc} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nama Dokumen / Label Input</label>
                  <input 
                    type="text" 
                    value={newDocLabel}
                    onChange={(e) => setNewDocLabel(e.target.value)}
                    placeholder="Contoh: Surat Izin Lokasi"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={isLoading}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newDocLabel.trim() || isLoading}
                  className="w-full py-2 bg-unair-blue text-white rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Simpan ke Daftar'}
                </button>
              </form>
            </div>

            {/* Daftar Dokumen */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
                <span>Daftar Dokumen Aktif</span>
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{docRequirements.length} item</span>
              </h4>
              <div className="space-y-3">
                {isLoading && docRequirements.length === 0 ? (
                  <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400"/></div>
                ) : docRequirements.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center">
                       <FileText className="w-4 h-4 text-slate-400 mr-3"/>
                       <span className="text-sm font-medium text-slate-700">{doc.label}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-600 hover:text-white border border-red-200 transition-all duration-200 shadow-sm"
                      title="Hapus Dokumen Ini"
                      disabled={isLoading}
                    >
                      <span className="text-xs font-bold">Hapus</span>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {!isLoading && docRequirements.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                    Belum ada dokumen yang diatur.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- ADMIN SUBMISSION MONITORING VIEW ---
  const AdminSubmissionMonitoring = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Data Pengajuan</h3>
            <p className="text-sm text-slate-500">Monitoring seluruh protokol penelitian yang masuk.</p>
          </div>
          <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold">
            Total: {submissions.length} Protokol
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg">ID</th>
                <th className="px-6 py-3">Peneliti</th>
                <th className="px-6 py-3">Judul Protokol</th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 rounded-tr-lg text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && submissions.length === 0 ? (
                 <tr><td colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-unair-blue"/></td></tr>
              ) : submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-500 text-xs">{sub.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{sub.researcherName}</div>
                    <div className="text-xs text-slate-500">{sub.institution}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{sub.title}</td>
                  <td className="px-6 py-4 text-slate-500">{sub.submissionDate}</td>
                  <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setActiveView('admin-submission-detail');
                      }}
                      className="bg-blue-50 text-unair-blue px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-unair-blue hover:text-white transition-colors flex items-center justify-center mx-auto"
                    >
                      <Eye className="w-3 h-3 mr-1"/> Detail & File
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && submissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Belum ada data pengajuan yang masuk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // --- ADMIN SUBMISSION DETAIL & FILE VIEWER ---
  const AdminSubmissionDetail = () => {
    if (!selectedSubmission) return <div>Data not found</div>;

    return (
      <div className="space-y-6 animate-fadeIn">
        <button 
          onClick={() => setActiveView('admin-submissions')} 
          className="text-slate-500 hover:text-slate-800 mb-4 flex items-center text-sm font-medium transition-colors"
        >
           <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Pengajuan
        </button>

        {/* Header Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{selectedSubmission.id}</span>
                <StatusBadge status={selectedSubmission.status} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mt-2">{selectedSubmission.title}</h1>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-800">{selectedSubmission.researcherName}</div>
              <div className="text-xs text-slate-500">{selectedSubmission.institution}</div>
              <div className="text-xs text-slate-400 mt-1">Diajukan: {selectedSubmission.submissionDate}</div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-semibold text-slate-700 mb-2">Abstrak / Ringkasan</h4>
            <div className="bg-slate-50 p-4 rounded-lg text-slate-600 text-sm leading-relaxed border border-slate-100">
              {selectedSubmission.description}
            </div>
          </div>

          {/* File Repository Section */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <FileStack className="w-5 h-5 mr-2 text-unair-blue"/>
              Repository Dokumen
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSubmission.documents.length > 0 ? (
                selectedSubmission.documents.map((doc) => (
                  <div key={doc.id} className="group bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all flex justify-between items-center">
                    <div className="flex items-center overflow-hidden">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mr-3 shrink-0">
                         <FileText className="w-5 h-5"/>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{doc.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{doc.type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleMockDownload(doc.name)}
                      className="ml-4 p-2 text-slate-400 hover:text-unair-blue hover:bg-blue-50 rounded-full transition-colors"
                      title="Download File"
                    >
                      <DownloadCloud className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 italic">
                  Tidak ada dokumen yang dilampirkan.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Self Assessment Preview (Read Only) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Preview Self Assessment</h3>
           <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {selectedSubmission.selfAssessment.map((sa) => (
                <div key={sa.id} className="bg-slate-50 p-4 rounded-lg border-l-4 border-slate-300">
                  <p className="font-bold text-slate-700 text-sm mb-1">{sa.standard}</p>
                  <p className="text-slate-600 text-sm italic">"{sa.response}"</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  };


  const AdminUserManagement = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Manajemen Pengguna</h3>
            <p className="text-sm text-slate-500">Validasi pendaftaran akun peneliti & reviewer baru.</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
            {users.filter(u => u.status === 'pending').length} Permintaan Pending
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg">Nama Lengkap</th>
                <th className="px-6 py-3">Institusi</th>
                <th className="px-6 py-3">ID & Kontak</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 rounded-tr-lg text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && users.length === 0 ? (
                 <tr><td colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-unair-blue"/></td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center"><Building className="w-3 h-3 mr-1"/> {user.institution}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs font-medium text-slate-700">
                         <CreditCard className="w-3 h-3 mr-1 text-slate-400"/> {user.identityNumber || '-'}
                      </div>
                      <div className="flex items-center text-xs">
                         <Phone className="w-3 h-3 mr-1 text-slate-400"/> {user.phone || '-'}
                      </div>
                      <div className="flex items-center text-xs">
                         <Mail className="w-3 h-3 mr-1 text-slate-400"/> {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`flex items-center gap-1 ${user.role === 'reviewer' ? 'text-unair-blue font-bold' : ''}`}>
                      {user.role === 'reviewer' && <ShieldCheck className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' :
                      user.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? 'Aktif' : user.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.status === 'pending' && (
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleUserApproval(user.id, true)}
                          className="bg-green-100 text-green-700 p-1.5 rounded hover:bg-green-200 transition-colors" 
                          title="Setujui Akun"
                          disabled={isLoading}
                        >
                          <Check className="w-4 h-4"/>
                        </button>
                        <button 
                          onClick={() => handleUserApproval(user.id, false)}
                          className="bg-red-100 text-red-700 p-1.5 rounded hover:bg-red-200 transition-colors" 
                          title="Tolak Akun"
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                    )}
                    {user.status !== 'pending' && <span className="text-slate-300">-</span>}
                  </td>
                </tr>
              ))}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ResearcherDashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm">Total Pengajuan</h3>
            <div className="bg-blue-100 p-2 rounded-lg"><FileText className="w-5 h-5 text-blue-600"/></div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{submissions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-unair-yellow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm">Menunggu Review</h3>
            <div className="bg-yellow-100 p-2 rounded-lg"><Clock className="w-5 h-5 text-unair-yellow"/></div>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {submissions.filter(s => s.status === 'under_review' || s.status === 'submitted').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-green-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm">Disetujui (EC)</h3>
            <div className="bg-green-100 p-2 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600"/></div>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {submissions.filter(s => s.status === 'approved').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Riwayat Pengajuan</h3>
          <button 
            onClick={() => setActiveView('submission')}
            className="text-sm bg-unair-yellow text-slate-900 font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors shadow-sm"
          >
            + Buat Pengajuan
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-unair-blue text-white">
              <tr>
                <th className="px-6 py-3 font-semibold">ID Protokol</th>
                <th className="px-6 py-3 font-semibold">Judul</th>
                <th className="px-6 py-3 font-semibold">Tanggal</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && submissions.length === 0 ? (
                 <tr><td colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-unair-blue"/></td></tr>
              ) : submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-blue-50/50">
                  <td className="px-6 py-4 font-mono text-slate-500">{sub.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate">{sub.title}</td>
                  <td className="px-6 py-4 text-slate-500">{sub.submissionDate}</td>
                  <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                  <td className="px-6 py-4">
                    {sub.status === 'approved' ? (
                      <button className="flex items-center text-unair-blue font-semibold hover:text-blue-800">
                        <Download className="w-4 h-4 mr-1"/> Sertifikat EC
                      </button>
                    ) : (
                      <button className="text-slate-400 hover:text-unair-blue hover:font-semibold">Detail</button>
                    )}
                  </td>
                </tr>
              ))}
              {!isLoading && submissions.length === 0 && (
                 <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada pengajuan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const MonitoringView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fadeIn">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
        <FileCheck className="w-5 h-5 mr-2 text-unair-blue"/> 
        Laporan Kemajuan & Monitoring
      </h3>
      <div className="space-y-4">
        {submissions.filter(s => s.status === 'approved').map(sub => (
          <div key={sub.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                 <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{sub.id}</span>
                 <h4 className="font-semibold text-slate-800">{sub.title}</h4>
              </div>
              <p className="text-sm text-slate-500">Disetujui pada: {sub.approvalDate}</p>
            </div>
            <button className="border border-unair-blue text-unair-blue bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
              Upload Progress Report
            </button>
          </div>
        ))}
        {submissions.filter(s => s.status === 'approved').length === 0 && (
          <p className="text-slate-500 italic text-center py-8">Tidak ada penelitian aktif yang membutuhkan monitoring.</p>
        )}
      </div>
    </div>
  );

  const ReviewerDashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-gradient-to-br from-unair-blue to-slate-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="text-lg font-semibold mb-2">Selamat Datang, Reviewer</h3>
             <p className="text-blue-100 text-sm">Anda memiliki <span className="font-bold text-unair-yellow text-lg">{submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length}</span> protokol baru yang perlu ditelaah.</p>
           </div>
           <ShieldCheck className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/10" />
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Daftar Telaah Masuk</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-unair-blue text-white">
              <tr>
                <th className="px-6 py-3 font-semibold">Peneliti</th>
                <th className="px-6 py-3 font-semibold">Judul</th>
                <th className="px-6 py-3 font-semibold">Institusi</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && submissions.length === 0 ? (
                 <tr><td colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-unair-blue"/></td></tr>
              ) : submissions.filter(s => s.status !== 'draft').map(sub => (
                <tr key={sub.id} className="hover:bg-blue-50/50">
                  <td className="px-6 py-4 font-medium">{sub.researcherName}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{sub.title}</td>
                  <td className="px-6 py-4 text-slate-500">{sub.institution}</td>
                  <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setActiveView('admin-review-detail');
                      }}
                      className="text-unair-blue font-medium hover:text-blue-800 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1"/> Telaah
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ReviewDetail = () => {
    if (!selectedSubmission) return <div>Data not found</div>;
    const [feedback, setFeedback] = useState('');

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <button onClick={() => setActiveView('admin-dashboard')} className="text-slate-500 hover:text-slate-800 mb-4 flex items-center">
           &larr; Kembali ke Dashboard
        </button>

        <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">{selectedSubmission.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <span className="flex items-center"><User className="w-4 h-4 mr-1"/> {selectedSubmission.researcherName}</span>
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {selectedSubmission.submissionDate}</span>
              </div>
            </div>
            <StatusBadge status={selectedSubmission.status} />
          </div>

          <div className="space-y-6">
             <div>
               <h4 className="font-semibold text-slate-700 border-b pb-2 mb-2">Abstrak</h4>
               <p className="text-slate-600 leading-relaxed">{selectedSubmission.description}</p>
             </div>

             <div>
               <h4 className="font-semibold text-slate-700 border-b pb-2 mb-2">Dokumen Pendukung</h4>
               <div className="grid grid-cols-2 gap-4">
                 {selectedSubmission.documents.length > 0 ? selectedSubmission.documents.map(d => (
                   <div key={d.id} className="flex items-center p-3 bg-slate-50 rounded border border-slate-100">
                     <FileText className="w-4 h-4 text-slate-400 mr-2"/>
                     <span className="text-sm truncate flex-1">{d.name}</span>
                     <button className="text-unair-blue text-xs font-medium hover:underline">Download</button>
                   </div>
                 )) : <p className="text-slate-400 italic">Tidak ada dokumen.</p>}
               </div>
             </div>

             <div>
               <h4 className="font-semibold text-slate-700 border-b pb-2 mb-2">Self Assessment</h4>
               <div className="space-y-4">
                 {selectedSubmission.selfAssessment.length > 0 ? selectedSubmission.selfAssessment.map(sa => (
                   <div key={sa.id} className="bg-slate-50 p-4 rounded-lg border-l-4 border-unair-blue">
                     <p className="font-medium text-slate-800 text-sm mb-1">{sa.standard}</p>
                     <p className="text-slate-600 text-sm">{sa.response}</p>
                   </div>
                 )) : <p className="text-slate-400 italic">Belum ada data assessment.</p>}
               </div>
             </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">Keputusan Reviewer</h3>
          <textarea 
            className="w-full p-3 border border-slate-300 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none"
            rows={4}
            placeholder="Tuliskan catatan revisi atau komentar persetujuan..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex justify-end space-x-3">
             <button 
               onClick={() => {
                 handleReviewAction(selectedSubmission.id, 'revise', feedback);
               }}
               className="flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
               disabled={isLoading}
             >
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <><AlertTriangle className="w-4 h-4 mr-2"/> Minta Revisi</>}
             </button>
             <button 
               onClick={() => {
                handleReviewAction(selectedSubmission.id, 'approve', feedback);
               }}
               className="flex items-center px-6 py-2 bg-unair-blue text-white rounded-lg hover:bg-blue-800 transition-colors shadow"
               disabled={isLoading}
             >
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <><CheckCircle className="w-4 h-4 mr-2"/> Setujui (Terbitkan EC)</>}
             </button>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER LOGIC ---

  if (showLanding) {
    return <LandingPage onEnterSystem={handleEnterSystem} />;
  }

  if (!isLoggedIn) {
    if (authView === 'register') {
      return <Register onRegister={handleRegister} onLoginClick={() => setAuthView('login')} />;
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onRegisterClick={() => setAuthView('register')} 
        onBackToHome={handleBackToLanding} // New prop for back to home
      />
    );
  }

  return (
    <Layout 
      currentRole={currentUser?.role || 'researcher'} 
      onLogout={handleLogout}
      activeView={activeView}
      setActiveView={setActiveView}
    >
      {activeView === 'dashboard' && <ResearcherDashboard />}
      
      {/* Updated SubmissionForm usage with documentRequirements prop */}
      {activeView === 'submission' && (
        <SubmissionForm 
          onSubmit={handleCreateSubmission} 
          onCancel={() => setActiveView('dashboard')} 
          documentRequirements={docRequirements}
        />
      )}
      
      {activeView === 'monitoring' && <MonitoringView />}
      
      {/* Reviewer Views */}
      {activeView === 'admin-dashboard' && <ReviewerDashboard />}
      {activeView === 'admin-review' && <ReviewerDashboard />}
      {activeView === 'admin-review-detail' && <ReviewDetail />}

      {/* Admin Views */}
      {activeView === 'admin-users' && <AdminUserManagement />}
      {activeView === 'admin-documents' && <AdminDocumentManagement />}
      {activeView === 'admin-submissions' && <AdminSubmissionMonitoring />}
      {activeView === 'admin-submission-detail' && <AdminSubmissionDetail />}
      
      {activeView === 'admin-settings' && <div className="text-slate-500">Fitur Pengaturan sedang dalam pengembangan.</div>}
    </Layout>
  );
}