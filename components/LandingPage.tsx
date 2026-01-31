
import React, { useState } from 'react';
import { ShieldCheck, FileText, Users, CheckCircle, ArrowRight, BookOpen, Activity, Phone, MapPin, Mail, List, FileSignature, Microscope, Scale } from 'lucide-react';

interface LandingPageProps {
  onEnterSystem: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterSystem }) => {
  const [activeTab, setActiveTab] = useState<'tugas' | 'ic' | 'jenis' | 'integritas'>('tugas');

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Area */}
            <div className="flex items-center space-x-3">
              <img 
                src="https://ppk2ipe.unair.ac.id/gambar/UNAIR_BRANDMARK_2025-02.png" 
                alt="Logo UNAIR" 
                className="h-12 w-auto" 
              />
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-unair-blue leading-tight">Fakultas Keperawatan</h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide">UNIVERSITAS AIRLANGGA</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#beranda" 
                onClick={(e) => scrollToSection(e, 'beranda')}
                className="text-sm font-medium text-slate-600 hover:text-unair-blue transition-colors"
              >
                Beranda
              </a>
              <a 
                href="#tentang" 
                onClick={(e) => scrollToSection(e, 'tentang')}
                className="text-sm font-medium text-slate-600 hover:text-unair-blue transition-colors"
              >
                Visi Misi Komisi Etik
              </a>
              <a 
                href="#prosedur" 
                onClick={(e) => scrollToSection(e, 'prosedur')}
                className="text-sm font-medium text-slate-600 hover:text-unair-blue transition-colors"
              >
                Alur Pengajuan
              </a>
              <button 
                onClick={onEnterSystem}
                className="bg-unair-blue text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-blue-800 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Masuk SIM KEPK
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="beranda" className="relative pt-20 pb-32 overflow-hidden bg-slate-50 scroll-mt-24">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 skew-x-12 translate-x-20 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wider mb-2">
                Ethical Clearance System
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                Komisi Etik Penelitian <span className="text-unair-blue">Kesehatan</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Menjamin perlindungan hak, keselamatan, dan kesejahteraan subjek manusia dalam penelitian kesehatan di lingkungan Fakultas Keperawatan Universitas Airlangga.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={onEnterSystem}
                  className="px-8 py-4 bg-unair-yellow text-slate-900 rounded-lg font-bold shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
                >
                  Ajukan Etik Sekarang
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a 
                  href="#prosedur"
                  onClick={(e) => scrollToSection(e, 'prosedur')}
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  Pelajari Prosedur
                </a>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-unair-blue to-blue-600 rounded-2xl blur-lg opacity-30"></div>
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                alt="Medical Research" 
                className="relative rounded-2xl shadow-2xl border-4 border-white object-cover h-[500px] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION (UPDATED) */}
      <section id="tentang" className="py-20 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Visi Misi Komisi Etik</h2>
            <div className="w-20 h-1 bg-unair-yellow mx-auto mb-6"></div>
            <p className="text-slate-600 leading-relaxed">
              KEPK (Komisi Etik Penelitian Kesehatan) merupakan lembaga yang diberikan wewenang secara otonomi oleh pihak instansi atau pemerintah untuk melakukan kajian etik penelitian kesehatan melalui 3 prinsip etik, 7 standar etik dan 25 pedoman etik, yang terdiri para reviewer etik penelitian menggunakan subyek manusia sesuai bidang kepakarannya dan sekretariat.
            </p>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
             <button 
               onClick={() => setActiveTab('tugas')}
               className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'tugas' ? 'bg-unair-blue text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
               <List className="w-4 h-4" /> Tugas Pokok
             </button>
             <button 
               onClick={() => setActiveTab('ic')}
               className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'ic' ? 'bg-unair-blue text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
               <FileSignature className="w-4 h-4" /> Informed Consent
             </button>
             <button 
               onClick={() => setActiveTab('jenis')}
               className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'jenis' ? 'bg-unair-blue text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
               <Microscope className="w-4 h-4" /> Jenis Penelitian
             </button>
             <button 
               onClick={() => setActiveTab('integritas')}
               className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'integritas' ? 'bg-unair-blue text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
             >
               <Scale className="w-4 h-4" /> Integritas Peneliti
             </button>
          </div>

          {/* TAB CONTENT */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 min-h-[400px]">
            
            {/* TAB 1: TUGAS POKOK */}
            {activeTab === 'tugas' && (
              <div className="animate-fadeIn space-y-4">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <List className="w-6 h-6 text-unair-blue"/>
                  </div>
                  Tugas Pokok & Fungsi KEPK
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                  {[
                    "Melakukan kajian etik protokol penelitian kesehatan yang mengikutsertakan manusia dan/atau hewan percobaan.",
                    "Memberikan persetujuan etik (ethical clearance) terhadap protokol penelitian.",
                    "Melakukan monitoring dan evaluasi terhadap pelaksanaan penelitian.",
                    "Melakukan sosialisasi pedoman etik sesuai standar dan pedoman WHO.",
                    "Mengusulkan pemberhentian pelaksanaan penelitian yang menyimpang dari protokol.",
                    "Mengajukan kajian ulang protokol penelitian kesehatan yang bersengketa.",
                    "Melakukan akreditasi kompetensi komisi etik / Lembaga kaji etik.",
                    "Melakukan pelatihan Etik penelitian kesehatan.",
                    "Membuat laporan kegiatan Komisi Etik kepada Fakultas Keperawatan."
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* TAB 2: INFORMED CONSENT */}
            {activeTab === 'ic' && (
              <div className="animate-fadeIn">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Definisi</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">
                        Informed consent adalah persetujuan yang diberikan oleh klien atau subjek penelitian tentang segala tindakan/perlakuan yang hendak dilakukan terhadap dirinya, setelah memperoleh penjelasan adekuat dari tenaga kesehatan atau pelaksana penelitian.
                      </p>
                    </div>
                    <div className="bg-blue-50 border-l-4 border-unair-blue p-4 rounded-r-lg">
                      <h4 className="font-bold text-unair-blue text-sm mb-1">Pentingnya Informed Consent</h4>
                      <p className="text-slate-700 text-sm">
                        Harus memperoleh perhatian dan kedudukan yang lebih tinggi dibanding informed consent pelayanan kesehatan, karena subyek penelitian tidak memperoleh manfaat langsung dari keikutsertaannya.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Aspek Hukum</h3>
                      <p className="text-slate-600 text-sm">
                        Selain mengandung aspek etik, Informed consent juga mempunyai implikasi hukum dalam peraturan perundang-undangan di Indonesia. Pelanggaran dapat berdampak sanksi hukum pidana, perdata, maupun administratif.
                      </p>
                    </div>
                  </div>
                  <div className="md:w-1/3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <FileSignature className="w-12 h-12 text-unair-yellow mb-4" />
                    <h4 className="font-bold text-slate-800 mb-2">Dokumen Wajib</h4>
                    <p className="text-xs text-slate-500 mb-4">
                      Informed consent harus selalu ada sebelum dilaksanakan penelitian yang menggunakan subjek manusia, data rekam medik, dan spesimen biologik.
                    </p>
                    <div className="text-xs font-semibold bg-slate-100 p-2 rounded text-center text-slate-600">
                      Dokumen melekat pada Ethical Clearance
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: JENIS PENELITIAN */}
            {activeTab === 'jenis' && (
              <div className="animate-fadeIn">
                 <p className="text-sm text-slate-600 mb-6 bg-white p-4 rounded-lg border border-slate-200">
                   Penelitian kesehatan merupakan bentuk penelitian yang sarat dengan rambu-rambu etika karena melibatkan subjek manusia yang dipaparkan pada rasa tidak enak dan risiko. Metode penelitian yang kurang baik adalah tidak etis karena akan memberikan hasil yang tidak akurat.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                     <h4 className="font-bold text-slate-800 mb-4 flex items-center border-b pb-2">
                       <Activity className="w-4 h-4 mr-2 text-unair-blue"/> Aspek Umum
                     </h4>
                     <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>Penelitian Genetika & Sel Punca (Stem Cell)</li>
                        <li className="flex items-center"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>Pemanfaatan Bahan Biologik Tersimpan (BBT)</li>
                        <li className="flex items-center"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>Uji Klinik</li>
                        <li className="flex items-center"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>Penelitian Epidemiologi</li>
                        <li className="flex items-center"><div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>Penggunaan Hewan Percobaan</li>
                     </ul>
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-800 mb-4 flex items-center border-b pb-2">
                       <Users className="w-4 h-4 mr-2 text-unair-blue"/> Bidang Keperawatan
                     </h4>
                     <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                        <div className="flex items-center"><div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mr-2"></div>Kep. Anak</div>
                        <div className="flex items-center"><div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mr-2"></div>Kep. Maternitas</div>
                        <div className="flex items-center"><div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mr-2"></div>Kep. Jiwa</div>
                        <div className="flex items-center"><div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mr-2"></div>Kep. Medikal Bedah</div>
                        <div className="flex items-center"><div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mr-2"></div>Kep. Onkologi</div>
                        <div className="flex items-center"><div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mr-2"></div>Kep. Kardiovaskuler</div>
                        <div className="flex items-center"><div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mr-2"></div>Kep. Kritis</div>
                        <div className="flex items-center"><div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mr-2"></div>Kep. Komunitas</div>
                        <div className="flex items-center"><div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mr-2"></div>Kep. Gerontik</div>
                        <div className="flex items-center"><div className="w-1.5 h-1.5 bg-unair-yellow rounded-full mr-2"></div>Manajemen Kep.</div>
                     </div>
                   </div>
                 </div>
              </div>
            )}

            {/* TAB 4: INTEGRITAS PENELITI */}
            {activeTab === 'integritas' && (
              <div className="animate-fadeIn space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 text-center">5 Pilar Integritas Akademis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    {['Honesty', 'Trust', 'Fairness', 'Respect', 'Responsibility'].map((pilar, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                         <div className="text-unair-blue font-bold text-sm">{pilar}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">Selama Penelitian</h4>
                     <p className="text-sm text-slate-600 leading-relaxed mb-3">
                       Sesuai Deklarasi Helsinki, peneliti wajib menjaga hidup, kesehatan, privasi, dan martabat subjek manusia.
                     </p>
                     <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-xs text-yellow-800">
                       <strong>Perhatian Khusus:</strong> Subjek vulnerable (anak-anak, ibu hamil, lansia, disabilitas, dll).
                     </div>
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">Sesudah Penelitian</h4>
                     <ul className="text-sm text-slate-600 space-y-2">
                       <li className="flex items-start gap-2">
                         <span className="text-unair-blue font-bold">•</span>
                         <span><strong>Akses Hasil:</strong> Pastikan hasil bermanfaat bagi populasi peserta.</span>
                       </li>
                       <li className="flex items-start gap-2">
                         <span className="text-unair-blue font-bold">•</span>
                         <span><strong>Pengarsipan:</strong> Data asli harus disimpan untuk klarifikasi.</span>
                       </li>
                       <li className="flex items-start gap-2">
                         <span className="text-unair-blue font-bold">•</span>
                         <span><strong>Publikasi & Intelectual Property:</strong> Menghormati kepemilikan data (Patent, Copyrights, dll).</span>
                       </li>
                     </ul>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ALUR PENGAJUAN */}
      <section id="prosedur" className="py-20 bg-slate-900 text-white relative overflow-hidden scroll-mt-24">
        {/* Decorative BG */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Alur Pengajuan Etik</h2>
            <p className="text-blue-200">Langkah mudah mengajukan Ethical Clearance melalui SIM KEPK</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-white/10 z-0"></div>

            {[
              { step: "01", title: "Registrasi Akun", desc: "Buat akun peneliti di SIM KEPK dan lengkapi profil." },
              { step: "02", title: "Upload Protokol", desc: "Unggah dokumen protokol & isi self-assessment." },
              { step: "03", title: "Proses Telaah", desc: "Reviewer melakukan telaah (Expedited/Full Board)." },
              { step: "04", title: "Terbit EC", desc: "Sertifikat Ethical Clearance diterbitkan digital." },
            ].map((item, idx) => (
              <div key={idx} className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center mb-6 shadow-xl relative">
                   <span className="text-3xl font-bold text-unair-yellow">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed px-4">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <button 
              onClick={onEnterSystem}
              className="bg-unair-blue border border-white/20 text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-slate-900 transition-all"
            >
              Mulai Pengajuan Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} Fakultas Keperawatan Universitas Airlangga. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
