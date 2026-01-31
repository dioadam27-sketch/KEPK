
export type UserRole = 'researcher' | 'reviewer' | 'admin';

export type SubmissionStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'revision_needed' 
  | 'approved' 
  | 'monitoring';

// Menambahkan status 'suspended' untuk fitur nonaktifkan user
export type UserStatus = 'active' | 'pending' | 'rejected' | 'suspended';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution: string;
  status: UserStatus;
  joinedAt: string;
  // New Fields for Registration Compliance
  identityNumber?: string; // NIK / NIDN / NIM
  phone?: string;
}

// Interface baru untuk pengaturan dokumen oleh Admin
export interface DocumentRequirement {
  id: string;
  label: string;
  isRequired: boolean;
}

export interface DocumentFile {
  id: string;
  name: string;
  // Type diubah menjadi string agar dinamis sesuai pengaturan admin
  type: string; 
  uploadedAt: string;
  // Fields for File Upload (Base64)
  content?: string; 
  mimeType?: string;
  // Field for Google Drive Link
  url?: string;
}

export interface SelfAssessmentItem {
  id: number;
  standard: string; // e.g., "Nilai Sosial"
  description: string;
  response: string;
}

export interface ResearchSubmission {
  id: string;
  title: string;
  researcherName: string;
  institution: string;
  description: string; // Abstract/Summary
  status: SubmissionStatus;
  documents: DocumentFile[];
  selfAssessment: SelfAssessmentItem[];
  submissionDate: string;
  approvalDate?: string;
  feedback?: string;
  progressReports: { date: string; content: string }[];
}

export const SEVEN_STANDARDS = [
  { id: 1, standard: "Nilai Sosial", description: "Apakah penelitian ini memiliki relevansi sosial dan memberikan kontribusi pada masalah kesehatan/sosial?" },
  { id: 2, standard: "Nilai Ilmiah", description: "Apakah desain penelitian valid dan mampu menjawab pertanyaan penelitian secara ilmiah?" },
  { id: 3, standard: "Pemerataan Beban & Manfaat", description: "Apakah pemilihan subjek penelitian adil dan merata?" },
  { id: 4, standard: "Potensi Risiko & Manfaat", description: "Apakah risiko telah diminimalisir dan sebanding dengan manfaat yang didapat?" },
  { id: 5, standard: "Bujukan & Eksploitasi", description: "Apakah ada unsur paksaan atau bujukan yang tidak wajar (undue inducement)?" },
  { id: 6, standard: "Kerahasiaan & Privasi", description: "Bagaimana perlindungan data dan privasi subjek dijaga?" },
  { id: 7, standard: "Informed Consent", description: "Apakah prosedur persetujuan setelah penjelasan (PSP) sudah sesuai standar?" },
];
