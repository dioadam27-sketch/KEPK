
import React, { useState } from 'react';
import { ResearchSubmission, SEVEN_STANDARDS, DocumentFile, DocumentRequirement } from '../types';
import { UploadCloud, Check, AlertCircle, X } from 'lucide-react';

interface SubmissionFormProps {
  onSubmit: (submission: Omit<ResearchSubmission, 'id' | 'status' | 'submissionDate' | 'progressReports'>) => void;
  onCancel: () => void;
  // Menambahkan prop untuk menerima daftar kebutuhan dokumen yang dinamis
  documentRequirements: DocumentRequirement[];
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit, onCancel, documentRequirements }) => {
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    researcherName: '',
    institution: '',
    description: '',
  });

  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [assessment, setAssessment] = useState<{id: number, response: string}[]>(
    SEVEN_STANDARDS.map(s => ({ id: s.id, response: '' }))
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc: DocumentFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type,
        uploadedAt: new Date().toISOString()
      };
      setDocuments(prev => [...prev, newDoc]);
    }
  };

  const removeFile = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleAssessmentChange = (id: number, value: string) => {
    setAssessment(prev => prev.map(item => item.id === id ? { ...item, response: value } : item));
  };

  const handleSubmit = () => {
    // Map assessment back to format
    const fullAssessment = SEVEN_STANDARDS.map(std => ({
      ...std,
      response: assessment.find(a => a.id === std.id)?.response || ''
    }));

    onSubmit({
      ...formData,
      documents,
      selfAssessment: fullAssessment,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Stepper Header */}
      <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex space-x-4">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-unair-blue' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-unair-yellow text-slate-900' : 'bg-slate-200'}`}>1</div>
            <span className="hidden md:inline font-medium">Data & Dokumen</span>
          </div>
          <div className="h-px w-12 bg-slate-300 self-center"></div>
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-unair-blue' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-unair-yellow text-slate-900' : 'bg-slate-200'}`}>2</div>
            <span className="hidden md:inline font-medium">Self Assessment</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-800">1. Identitas Penelitian & Upload Dokumen</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Protokol</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Contoh: Pengaruh Pemberian Ekstrak Daun Kelor..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Peneliti Utama</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none"
                  value={formData.researcherName}
                  onChange={e => setFormData({...formData, researcherName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Institusi/Asal</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none"
                  value={formData.institution}
                  onChange={e => setFormData({...formData, institution: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Abstrak / Deskripsi Singkat</label>
                <textarea 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none h-32"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Jelaskan latar belakang, tujuan, dan metode secara singkat..."
                />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="font-semibold text-slate-700">Upload Kelengkapan Dokumen</h4>
                 <span className="text-xs text-slate-500">* Wajib diunggah</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rendering Dinamis Berdasarkan Props */}
                {documentRequirements.map((docItem) => {
                   const existing = documents.find(d => d.type === docItem.id);
                   return (
                    <div key={docItem.id} className="border border-dashed border-slate-300 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">
                          {docItem.label}
                          {docItem.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </span>
                        {!existing ? (
                          <label className="cursor-pointer bg-white border border-slate-300 text-slate-600 px-3 py-1 rounded text-sm hover:bg-yellow-50 hover:text-unair-blue hover:border-unair-yellow transition-all">
                            Upload
                            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => handleFileChange(e, docItem.id)} />
                          </label>
                        ) : (
                           <div className="flex items-center space-x-2">
                             <span className="text-xs text-unair-blue truncate max-w-[100px]">{existing.name}</span>
                             <button onClick={() => removeFile(existing.id)} className="text-red-400 hover:text-red-600">
                               <X className="w-4 h-4" />
                             </button>
                           </div>
                        )}
                      </div>
                    </div>
                   );
                })}
              </div>
              {documentRequirements.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg">
                  Belum ada persyaratan dokumen yang diatur oleh Admin.
                </p>
              )}
            </div>
            
            <div className="flex justify-end pt-6">
              <button 
                onClick={() => setStep(2)}
                className="bg-unair-yellow text-slate-900 px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-bold shadow-sm"
              >
                Lanjut ke Self Assessment
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-end mb-4">
              <div>
                 <h3 className="text-lg font-bold text-slate-800">2. Self Assessment (7 Standar Etik)</h3>
                 <p className="text-sm text-slate-500 mt-1">Lengkapi penilaian mandiri berikut sesuai protokol Anda.</p>
              </div>
            </div>

            <div className="space-y-6">
              {SEVEN_STANDARDS.map((std) => (
                <div key={std.id} className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="bg-unair-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {std.id}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{std.standard}</h4>
                      <p className="text-sm text-slate-500">{std.description}</p>
                    </div>
                  </div>
                  <textarea 
                    className="w-full mt-2 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-unair-yellow focus:border-transparent outline-none text-sm"
                    rows={3}
                    placeholder={`Jelaskan pemenuhan standar ${std.standard}...`}
                    value={assessment.find(a => a.id === std.id)?.response}
                    onChange={(e) => handleAssessmentChange(std.id, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-200 mt-8">
              <button 
                onClick={() => setStep(1)}
                className="text-slate-600 hover:text-slate-800 font-medium"
              >
                Kembali
              </button>
              <div className="space-x-3">
                 <button 
                  onClick={onCancel}
                  className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSubmit}
                  className="bg-unair-yellow text-slate-900 px-8 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-bold shadow-lg shadow-yellow-200"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};