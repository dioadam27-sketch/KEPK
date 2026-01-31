
import React from 'react';
import { ResearchSubmission } from '../types';
import { FileText, Clock, CheckCircle, Download, FileCheck, ArrowLeft, AlertTriangle, FileStack, Eye } from 'lucide-react';
import { StatusBadge, CardSkeleton, TableSkeleton, DetailSkeleton, formatDate } from './Shared';

// --- DASHBOARD ---
interface ResearcherDashboardProps {
  submissions: ResearchSubmission[];
  isLoading: boolean;
  onViewDetail: (sub: ResearchSubmission) => void;
  onCreateNew: () => void;
}

export const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({ submissions, isLoading, onViewDetail, onCreateNew }) => {
  if (isLoading && submissions.length === 0) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            onClick={onCreateNew}
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
              {submissions.map(sub => (
                <tr key={sub.id} className="hover:bg-blue-50/50">
                  <td className="px-6 py-4 font-mono text-slate-500">{sub.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800 max-w-xs truncate">{sub.title}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(sub.submissionDate)}</td>
                  <td className="px-6 py-4"><StatusBadge status={sub.status} /></td>
                  <td className="px-6 py-4">
                    {sub.status === 'approved' ? (
                      <button className="flex items-center text-unair-blue font-semibold hover:text-blue-800">
                        <Download className="w-4 h-4 mr-1"/> Sertifikat EC
                      </button>
                    ) : (
                      <button 
                        onClick={() => onViewDetail(sub)}
                        className="text-slate-400 hover:text-unair-blue hover:font-semibold"
                      >
                        Detail
                      </button>
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
};

// --- MONITORING ---
export const MonitoringView: React.FC<{ submissions: ResearchSubmission[] }> = ({ submissions }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
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
            <p className="text-sm text-slate-500">Disetujui pada: {formatDate(sub.approvalDate)}</p>
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

// --- DETAIL VIEW ---
interface ResearcherDetailProps {
  submission: ResearchSubmission | null;
  onBack: () => void;
}

export const ResearcherSubmissionDetail: React.FC<ResearcherDetailProps> = ({ submission, onBack }) => {
  if (!submission) return <DetailSkeleton />;

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack} 
        className="text-slate-500 hover:text-slate-800 mb-4 flex items-center text-sm font-medium transition-colors"
      >
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Dashboard
      </button>

      {/* Header Information */}
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

        {/* Feedback Section */}
        {submission.feedback && (
            <div className="mb-8 bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <h4 className="font-bold text-amber-800 mb-2 flex items-center"><AlertTriangle className="w-4 h-4 mr-2"/> Catatan Reviewer:</h4>
              <p className="text-amber-900 text-sm">{submission.feedback}</p>
            </div>
        )}

        <div className="mb-8">
          <h4 className="font-semibold text-slate-700 mb-2">Abstrak / Ringkasan</h4>
          <div className="bg-slate-50 p-4 rounded-lg text-slate-600 text-sm leading-relaxed border border-slate-100">
            {submission.description}
          </div>
        </div>

        {/* File Repository Section */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <FileStack className="w-5 h-5 mr-2 text-unair-blue"/>
            Dokumen yang Dilampirkan
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submission.documents.length > 0 ? (
              submission.documents.map((doc) => (
                <div key={doc.id} className="group bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all flex justify-between items-center">
                  <div className="flex items-center overflow-hidden">
                    <div className="w-10 h-10 bg-blue-50 text-unair-blue rounded-lg flex items-center justify-center mr-3 shrink-0">
                        <FileText className="w-5 h-5"/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{doc.type}</p>
                    </div>
                  </div>
                  {doc.url ? (
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-auto px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all flex items-center"
                    >
                      <Eye className="w-3 h-3 mr-2" />
                      Lihat
                    </a>
                  ) : (
                      <span className="text-xs text-slate-400 italic">Processing...</span>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 italic">
                Tidak ada dokumen.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Self Assessment Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Self Assessment</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {submission.selfAssessment.map((sa) => (
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
