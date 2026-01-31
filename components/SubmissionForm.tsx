
import React, { useState } from 'react';
import { ResearchSubmission, SEVEN_STANDARDS, DocumentFile, DocumentRequirement } from '../types';
import { UploadCloud, Check, AlertCircle, X, Loader2, AlertTriangle, Send, FileText } from 'lucide-react';

interface SubmissionFormProps {
  // Ubah return type menjadi Promise<void> agar bisa menunggu proses selesai
  onSubmit: (submission: Omit<ResearchSubmission, 'id' | 'status' | 'submissionDate' | 'progressReports'>) => Promise<void>;
  onCancel: () => void;
  documentRequirements: DocumentRequirement[];
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit, onCancel, documentRequirements }) => {
  const [step, setStep] = useState(1);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // State baru untuk loading pengiriman
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("Menyiapkan data...");
  
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, typeId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file terlalu besar. Maksimal 10MB per file.");
        e.target.value = ''; 
        return;
      }

      setIsProcessingFile(true);

      try {
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });

        const rawBase64 = base64String.split(',')[1];

        // Gunakan typeId yang dipastikan unik
        const newDoc: DocumentFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: typeId, 
          uploadedAt: new Date().toISOString(),
          content: rawBase64, 
          mimeType: file.type
        };

        setDocuments(prev => {
          // Strict filtering based on typeId
          const filtered = prev.filter(d => d.type !== typeId);
          return [...filtered, newDoc];
        });

      } catch (error) {
        console.error("Gagal memproses file:", error);
        alert("Terjadi kesalahan saat membaca file.");
      } finally {
        setIsProcessingFile(false);
        // Penting: Reset input value agar user bisa re-upload file yang sama jika perlu
        e.target.value = '';
      }
    }
  };

  const removeFile = (typeId: string) => {
    // Hapus berdasarkan tipe dokumen
    setDocuments(prev => prev.filter(d => d.type !== typeId));
  };

  const handleAssessmentChange = (id: number, value: string) => {
    setAssessment(prev => prev.map(item => item.id === id ? { ...item, response: value } : item));
  };

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    setUploadStatus("Mengunggah dokumen ke Google Drive...");
    setShowConfirmModal(false);

    try {
      const fullAssessment = SEVEN_STANDARDS.map(std => ({
        ...std,
        response: assessment.find(a => a.id === std.id)?.response || ''
      }));

      await onSubmit({
        ...formData,
        documents,
        selfAssessment: fullAssessment,
      });
      
    } catch (error) {
      console.error("Submission error:", error);
      alert("Gagal mengirim pengajuan. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative min-h-[600px]">
      
      {/* --- FULL SCREEN LOADING OVERLAY --- */}
      {isSubmitting && (
        <div className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center max-w-sm w-full text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-unair-blue rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
              <UploadCloud className="w-8 h-8 text-unair-blue absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Mengirim Pengajuan</h3>
            <p className="text-slate-500 text-sm mb-6">{uploadStatus}</p>
            
            <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
              <div className="bg-unair-yellow h-2 rounded-full animate-pulse w-full"></div>
            </div>
            <p className="text-xs text-slate-400 italic">Mohon jangan tutup halaman ini...</p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && !isSubmitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 transform scale-100 transition-transform">
             <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-yellow-50 text-unair-yellow rounded-full flex items-center justify-center mb-4 border-4 border-yellow-100">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Konfirmasi Pengajuan</h3>
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                  Pastikan dokumen sudah benar. Sistem akan mengunggah file Anda ke server.
                </p>
             </div>
             <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowConfirmModal(false)} 
                  className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit} 
                  className="flex-1 py-2.5 bg-unair-blue text-white rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Ya, Kirim
                </button>
             </div>
          </div>
        </div>
      )}

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
                 <div className="flex items-center gap-2">
                   {isProcessingFile && <span className="text-xs text-blue-600 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1"/> Memproses file...</span>}
                   <span className="text-xs text-slate-500">* Maks. 10MB/file</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentRequirements.map((docItem) => {
                   // Gunakan ID unik yang sudah di-sanitize di App.tsx
                   const reqId = docItem.id; 
                   const existing = documents.find(d => d.type === reqId);
                   
                   return (
                    <div key={reqId} className="border border-dashed border-slate-300 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600 flex-1 mr-4">
                          {docItem.label}
                          {docItem.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </span>
                        
                        {!existing ? (
                          <label 
                            htmlFor={`file-upload-${reqId}`}
                            className={`cursor-pointer bg-white border border-slate-300 text-slate-600 px-3 py-1 rounded text-sm hover:bg-yellow-50 hover:text-unair-blue hover:border-unair-yellow transition-all flex items-center gap-2 ${isProcessingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <UploadCloud className="w-4 h-4" />
                            Upload
                            <input 
                              id={`file-upload-${reqId}`}
                              type="file" 
                              className="hidden" 
                              accept=".pdf,.doc,.docx,.jpg,.png" 
                              onChange={(e) => handleFileChange(e, reqId)} 
                              disabled={isProcessingFile}
                            />
                          </label>
                        ) : (
                           <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                             <FileText className="w-4 h-4 text-unair-blue" />
                             <span className="text-xs text-slate-700 font-medium truncate max-w-[150px]" title={existing.name}>
                               {existing.name}
                             </span>
                             <button 
                               type="button" 
                               onClick={() => removeFile(reqId)} 
                               className="text-red-400 hover:text-red-600 ml-2 p-1 rounded hover:bg-red-50"
                             >
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
                type="button"
                onClick={() => setStep(2)}
                disabled={isProcessingFile}
                className="bg-unair-yellow text-slate-900 px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-600 hover:text-slate-800 font-medium"
              >
                Kembali
              </button>
              <div className="space-x-3">
                 <button 
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
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
