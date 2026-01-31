
import { ResearchSubmission, UserProfile, DocumentRequirement, UserRole } from '../types';

const API_URL = 'https://script.google.com/macros/s/AKfycbznGbzCIIyHTrBSMkjKlE7biJBsrsCfKL85k3ZfklP-BW1reCtCxlaZDqPdPDSLEv0N9g/exec';

// Folder ID Google Drive tujuan penyimpanan dokumen
// Link: https://drive.google.com/drive/folders/1GU-eTqxSextOVcieCDlzgkQpUj65RpTA?usp=sharing
const DRIVE_FOLDER_ID = '1GU-eTqxSextOVcieCDlzgkQpUj65RpTA';

// Helper untuk POST request (menggunakan text/plain untuk menghindari CORS Preflight pada GAS)
const postData = async (action: string, payload: any) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action, payload }),
      // Penting: Gunakan text/plain agar browser tidak mengirim OPTIONS request (Preflight)
      // yang sering gagal di Google Apps Script
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    return { status: 'error', message: 'Network error or CORS issue' };
  }
};

// Helper untuk GET request
const getData = async (action: string, params: Record<string, string> = {}) => {
  try {
    const url = new URL(API_URL);
    url.searchParams.append('action', action);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString());
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    return { status: 'error', message: 'Network error' };
  }
};

export const apiService = {
  // --- USER ---
  login: async (email: string, password: string) => {
    return await postData('login', { email, password });
  },

  register: async (userData: any) => {
    return await postData('register', userData);
  },

  getUsers: async () => {
    return await getData('getUsers');
  },

  updateUserStatus: async (id: string, status: string) => {
    return await postData('updateUserStatus', { id, status });
  },

  deleteUser: async (id: string) => {
    return await postData('deleteUser', { id });
  },

  // --- SUBMISSIONS ---
  getSubmissions: async (role: UserRole, email: string) => {
    return await getData('getSubmissions', { role, email });
  },

  createSubmission: async (submission: any) => {
    // Inject folder ID agar backend (Google Apps Script) tahu di mana harus menyimpan file
    const payload = {
      ...submission,
      driveFolderId: DRIVE_FOLDER_ID
    };
    return await postData('createSubmission', payload);
  },

  updateSubmissionStatus: async (id: string, status: string, feedback?: string, approvalDate?: string) => {
    return await postData('updateSubmissionStatus', { id, status, feedback, approvalDate });
  },

  // --- CONFIG (DOCUMENTS) ---
  getConfig: async () => {
    return await getData('getConfig');
  },

  addConfig: async (id: string, label: string, isRequired: boolean) => {
    return await postData('addConfig', { id, label, isRequired });
  },

  deleteConfig: async (id: string) => {
    return await postData('deleteConfig', { id });
  }
};
