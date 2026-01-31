
import React from 'react';
import { SubmissionStatus } from '../types';

// --- DATE FORMATTER (WIB / JAKARTA) ---
export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  // Cek validitas tanggal
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(date);
};

// --- STATUS BADGE ---
export const StatusBadge: React.FC<{ status: SubmissionStatus }> = ({ status }) => {
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

// --- SKELETON LOADERS ---

export const CardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-slate-200 h-32 rounded-xl"></div>
    ))}
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 h-14"></div>
    <div className="p-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border-b border-slate-100 flex p-4 items-center">
           <div className="h-4 bg-slate-200 rounded w-1/6 mr-4"></div>
           <div className="h-4 bg-slate-200 rounded w-1/4 mr-4"></div>
           <div className="h-4 bg-slate-200 rounded w-1/4 mr-auto"></div>
           <div className="h-6 bg-slate-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="space-y-6 animate-pulse">
     <div className="bg-white rounded-xl h-40 border border-slate-200"></div>
     <div className="bg-white rounded-xl h-64 border border-slate-200"></div>
  </div>
);
