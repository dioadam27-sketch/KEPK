
import React, { useState } from 'react';
import { UserProfile, ResearchSubmission, DocumentRequirement, UserStatus } from '../types';
import { ShieldCheck, Eye, Loader2, User, Clock, FileText, AlertTriangle, CheckCircle, ArrowLeft, FileStack, DownloadCloud, Building, CreditCard, Phone, Mail, Check, X, FolderCog, Plus, Trash2, Ban, RefreshCcw } from 'lucide-react';
import { StatusBadge, TableSkeleton, DetailSkeleton, formatDate } from './Shared';

// ================= REVIEWER COMPONENTS =================

// --- REVIEWER DASHBOARD ---
interface ReviewerDashboardProps {
  submissions: ResearchSubmission[];
  isLoading: boolean;
  onReview: (sub: ResearchSubmission) => void;
}

export const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({ submissions, isLoading, onReview }) => {
  if (isLoading && submissions.length === 0) return <TableSkeleton />;

  return (
    <div className="space-y-6">
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
              {submissions.filter(s => s.status !== 'draft').map(sub => (
                <tr key={sub.id} className="hover:bg-blue-50/50">
                  <td className="px-6 py-4 font-medium">{sub.researcherName}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{sub.title}</td>
                  <td className="px-6 py-4 text-slate-500">{sub.institution}</td>
                  <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onReview(sub)}
                      className="text-unair-blue font-medium hover:text-blue-800 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1"/> Telaah
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- REVIEWER DETAIL (ACTION) ---
interface ReviewDetailProps {
  submission: ResearchSubmission | null;
  onBack: () => void;
  onSubmitReview: (id: string, action: 'approve' | 'revise', feedback: string) => void;
}

export const ReviewDetail: React.FC<ReviewDetailProps> = ({ submission, onBack, onSubmitReview }) => {
  if (!submission) return <DetailSkeleton />;
  const [feedback, setFeedback] = useState('');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={onBack} className="text-slate-500 hover:text-slate-800 mb-4 flex items-center">
          &larr; Kembali ke Dashboard
      </button>

      <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{submission.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center"><User className="w-4 h-4 mr-1"/> {submission.researcherName}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {formatDate(submission.submissionDate)}</span>
            </div>
          </div>
          <StatusBadge status={submission.status} />
        </div>

        <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-700 border-b pb-2 mb-2">Abstrak</h4>
              <p className="text-slate-600 leading-relaxed">{submission.description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 border-b pb-2 mb-2">Dokumen Pendukung</h4>
              <div className="grid grid-cols-2 gap-4">
                {submission.documents.length > 0 ? submission.documents.map(d => (
                  <div key={d.id} className="flex items-center p-3 bg-slate-50 rounded border border-slate-100">
                    <FileText className="w-4 h-4 text-slate-400 mr-2"/>
                    <span className="text-sm truncate flex-1">{d.name}</span>
                    {d.url ? (
                      <a 
                        href={d.url} target="_blank" rel="noopener noreferrer" 
                        className="ml-auto px-4 py-2 bg-unair-blue text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-all flex items-center shadow-md hover:shadow-lg"
                      >
                        <Eye className="w-3 h-3 mr-2" /> Lihat Dokumen
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic ml-2 px-2 py-1 bg-slate-100 rounded">Link tdk tersedia</span>
                    )}
                  </div>
                )) : <p className="text-slate-400 italic">Tidak ada dokumen.</p>}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 border-b pb-2 mb-2">Self Assessment</h4>
              <div className="space-y-4">
                {submission.selfAssessment.length > 0 ? submission.selfAssessment.map(sa => (
                  <div key={sa.id} className="bg-slate-50 p-4 rounded-lg border-l-4 border-unair-blue">
                    <p className="font-medium text-slate-800 text-sm mb-1">{sa.standard}</p>
                    <p className="text-slate-600 text-sm">{sa.response}</p>
                  </div>
                )) : <p className="text-slate-400 italic">Belum ada data assessment.</p>}
              </div>
            </div>
        </div>
      </div>

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
              onClick={() => onSubmitReview(submission.id, 'revise', feedback)}
              className="flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 mr-2"/> Minta Revisi
            </button>
            <button 
              onClick={() => onSubmitReview(submission.id, 'approve', feedback)}
              className="flex items-center px-6 py-2 bg-unair-blue text-white rounded-lg hover:bg-blue-800 transition-colors shadow"
            >
              <CheckCircle className="w-4 h-4 mr-2"/> Setujui (Terbitkan EC)
            </button>
        </div>
      </div>
    </div>
  );
};

// ================= ADMIN COMPONENTS =================

// --- ADMIN SUBMISSION MONITORING ---
interface AdminSubmissionProps {
  submissions: ResearchSubmission[];
  isLoading: boolean;
  onViewDetail: (sub: ResearchSubmission) => void;
}

export const AdminSubmissionMonitoring: React.FC<AdminSubmissionProps> = ({ submissions, isLoading, onViewDetail }) => {
  if (isLoading && submissions.length === 0) return <TableSkeleton />;

  return (
    <div className="space-y-6">
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
              {submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-slate-500 text-xs">{sub.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{sub.researcherName}</div>
                    <div className="text-xs text-slate-500">{sub.institution}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{sub.title}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(sub.submissionDate)}</td>
                  <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onViewDetail(sub)}
                      className="bg-blue-50 text-unair-blue px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-unair-blue hover:text-white transition-colors flex items-center justify-center mx-auto"
                    >
                      <Eye className="w-3 h-3 mr-1"/> Detail & File
                    </button>
                  </td>
                </tr>
              ))}
               {submissions.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Belum ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN SUBMISSION DETAIL ---
interface AdminDetailProps {
  submission: ResearchSubmission | null;
  onBack: () => void;
}

export const AdminSubmissionDetail: React.FC<AdminDetailProps> = ({ submission, onBack }) => {
  if (!submission) return <DetailSkeleton />;

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack} 
        className="text-slate-500 hover:text-slate-800 mb-4 flex items-center text-sm font-medium transition-colors"
      >
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Pengajuan
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{submission.id}</span>
              <StatusBadge status={submission.status} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mt-2">{submission.title}</h1>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-800">{submission.researcherName}</div>
            <div className="text-xs text-slate-500">{submission.institution}</div>
            <div className="text-xs text-slate-400 mt-1">Diajukan: {formatDate(submission.submissionDate)}</div>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-semibold text-slate-700 mb-2">Abstrak / Ringkasan</h4>
          <div className="bg-slate-50 p-4 rounded-lg text-slate-600 text-sm leading-relaxed border border-slate-100">
            {submission.description}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <FileStack className="w-5 h-5 mr-2 text-unair-blue"/>
            Repository Dokumen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submission.documents.length > 0 ? (
              submission.documents.map((doc) => (
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
                  {doc.url ? (
                    <a 
                      href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="ml-auto px-4 py-2 bg-unair-blue text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-all flex items-center shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-3 h-3 mr-2" /> Lihat Dokumen
                    </a>
                  ) : (
                    <button 
                      onClick={() => alert("File ini belum memiliki link Google Drive.")}
                      className="ml-4 p-2 text-slate-400 hover:text-slate-600 cursor-help"
                    >
                      <DownloadCloud className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))
            ) : <div className="col-span-2 text-center py-8 text-slate-400 italic">Tidak ada dokumen.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN USER MANAGEMENT ---
interface AdminUserProps {
  users: UserProfile[];
  isLoading: boolean;
  onStatusChange: (userId: string, status: UserStatus) => void;
  onDeleteUser: (userId: string) => void;
}

export const AdminUserManagement: React.FC<AdminUserProps> = ({ users, isLoading, onStatusChange, onDeleteUser }) => {
  const handleDeleteClick = (userId: string, userName: string) => {
    if (window.confirm(`Yakin ingin menghapus pengguna "${userName}" secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
      onDeleteUser(userId);
    }
  };

  if (isLoading && users.length === 0) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Manajemen Pengguna</h3>
            <p className="text-sm text-slate-500">Validasi, nonaktifkan, atau hapus akun peneliti & reviewer.</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center">
              {users.filter(u => u.status === 'pending').length} Pending
            </div>
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center">
              {users.filter(u => u.status === 'active').length} Aktif
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg">Nama Lengkap</th>
                <th className="px-6 py-3">Institusi</th>
                <th className="px-6 py-3">ID & Kontak</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 rounded-tr-lg text-center" style={{ width: '180px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
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
                      user.status === 'suspended' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? 'Aktif' : 
                       user.status === 'pending' ? 'Menunggu' : 
                       user.status === 'suspended' ? 'Nonaktif' : 'Ditolak'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-1">
                      
                      {/* --- TOMBOL AKSI BERDASARKAN STATUS --- */}

                      {user.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => onStatusChange(user.id, 'active')}
                            className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all" 
                            title="Setujui (Approve)"
                          >
                            <Check className="w-4 h-4"/>
                          </button>
                          <button 
                            onClick={() => onStatusChange(user.id, 'rejected')}
                            className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all" 
                            title="Tolak (Reject)"
                          >
                            <X className="w-4 h-4"/>
                          </button>
                        </>
                      )}

                      {user.status === 'active' && (
                         <button 
                            onClick={() => onStatusChange(user.id, 'suspended')}
                            className="bg-orange-100 text-orange-600 p-2 rounded-lg hover:bg-orange-600 hover:text-white transition-all" 
                            title="Nonaktifkan (Suspend)"
                          >
                            <Ban className="w-4 h-4"/>
                          </button>
                      )}

                      {(user.status === 'suspended' || user.status === 'rejected') && (
                          <button 
                            onClick={() => onStatusChange(user.id, 'active')}
                            className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all" 
                            title="Aktifkan Kembali"
                          >
                            <RefreshCcw className="w-4 h-4"/>
                          </button>
                      )}

                      {/* --- TOMBOL HAPUS (SELALU MUNCUL) --- */}
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <button 
                        onClick={() => handleDeleteClick(user.id, user.name)}
                        className="bg-slate-100 text-slate-500 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all" 
                        title="Hapus Permanen"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
               {users.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Belum ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN DOCUMENT MANAGEMENT ---
interface AdminDocProps {
  docs: DocumentRequirement[];
  onAdd: (label: string) => void;
  onDelete: (id: string) => void;
}

export const AdminDocumentManagement: React.FC<AdminDocProps> = ({ docs, onAdd, onDelete }) => {
    const [newDocLabel, setNewDocLabel] = useState('');
    const [notification, setNotification] = useState<string | null>(null);

    const onSubmitNewDoc = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newDocLabel.trim()) {
        await onAdd(newDocLabel);
        setNewDocLabel('');
      }
    };

    const handleDelete = async (id: string) => {
      if (window.confirm("Apakah Anda yakin ingin menghapus persyaratan dokumen ini?")) {
        await onDelete(id);
        setNotification("Dokumen berhasil dihapus.");
        setTimeout(() => setNotification(null), 3000);
      }
    };

    return (
      <div className="space-y-6">
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
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newDocLabel.trim()}
                  className="w-full py-2 bg-unair-blue text-white rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                >
                  Simpan ke Daftar
                </button>
              </form>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
                <span>Daftar Dokumen Aktif</span>
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{docs.length} item</span>
              </h4>
              <div className="space-y-3">
                {docs.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-sm">Belum ada dokumen.</div>
                ) : docs.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center">
                       <FileText className="w-4 h-4 text-slate-400 mr-3"/>
                       <span className="text-sm font-medium text-slate-700">{doc.label}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-600 hover:text-white border border-red-200 transition-all duration-200 shadow-sm"
                      title="Hapus Dokumen Ini"
                    >
                      <span className="text-xs font-bold">Hapus</span>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};
