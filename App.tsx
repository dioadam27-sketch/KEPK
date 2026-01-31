
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SubmissionForm } from './components/SubmissionForm';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { LandingPage } from './components/LandingPage';
import { ResearchSubmission, UserRole, SubmissionStatus, UserProfile, DocumentRequirement, UserStatus } from './types';
import { apiService } from './services/apiService';

// Import New Modular Components
import { ResearcherDashboard, ResearcherSubmissionDetail, MonitoringView } from './components/ResearcherModule';
import { 
  AdminUserManagement, 
  AdminSubmissionMonitoring, 
  AdminDocumentManagement, 
  AdminSubmissionDetail,
  ReviewerDashboard,
  ReviewDetail
} from './components/AdminModule';

// --- DEFAULT STATE JIKA API KOSONG ---
const DEFAULT_DOC_REQS: DocumentRequirement[] = [
  { id: 'protocol', label: 'Protokol Lengkap (PDF)', isRequired: true },
  { id: 'consent', label: 'Informed Consent / PSP', isRequired: true },
];

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
        // PATCH: Sanitize IDs to prevent collision (Bug fix for empty IDs/Labels in Google Sheet)
        const sanitizedDocs = configRes.data.map((doc: any, index: number) => ({
          ...doc,
          id: (doc.id && String(doc.id).trim() !== '') 
            ? doc.id 
            : `${doc.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`
        }));
        setDocRequirements(sanitizedDocs);
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

  // Trigger fetch ONLY on login or user change
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchData();
    }
  }, [isLoggedIn, currentUser]); 


  const handleEnterSystem = () => {
    setShowLanding(false);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setAuthView('login');
  };

  // Login Handler
  const handleLogin = async (email: string, password: string, roleType: 'user' | 'admin', selectedRole?: UserRole) => {
    
    // --- DEVELOPER BACKDOOR ---
    if (password === 'dev123') {
      console.log("⚡ DEVELOPER MODE ACTIVATED ⚡");
      let targetRole: UserRole = 'researcher';
      if (roleType === 'admin') targetRole = 'admin';
      else if (selectedRole) targetRole = selectedRole;

      const devUser: UserProfile = {
        id: 'dev-' + Math.random().toString(36).substr(2, 5),
        name: `Developer (${targetRole.toUpperCase()})`,
        email: email || 'dev@local.test',
        role: targetRole,
        institution: 'Developer Mode Institution',
        status: 'active',
        joinedAt: new Date().toISOString(),
        identityNumber: 'DEV-123456',
        phone: '08123456789'
      };

      setCurrentUser(devUser);
      setIsLoggedIn(true);
      if (targetRole === 'researcher') setActiveView('dashboard');
      else if (targetRole === 'reviewer') setActiveView('admin-dashboard');
      else setActiveView('admin-users');
      return { success: true };
    }
    // --- END BACKDOOR ---

    const response = await apiService.login(email, password);
    
    if (response.status === 'success') {
      const userData = response.data;
      if (roleType === 'user') {
        if (userData.role === 'admin') return { success: false, message: 'Akun Administrator harus login melalui Portal Admin.' };
        if (selectedRole && userData.role !== selectedRole) {
           const roleName = userData.role === 'researcher' ? 'Peneliti' : 'Reviewer';
           return { success: false, message: `Akun Anda terdaftar sebagai ${roleName}. Silakan ganti tab login.` };
        }
      }
      if (roleType === 'admin' && userData.role !== 'admin') return { success: false, message: 'Akun ini tidak memiliki akses Administrator.' };

      setCurrentUser(userData);
      setIsLoggedIn(true);
      if (userData.role === 'researcher') setActiveView('dashboard');
      else if (userData.role === 'reviewer') setActiveView('admin-dashboard');
      else setActiveView('admin-users');

      return { success: true };
    }
    return { success: false, message: response.message };
  };

  const handleRegister = async (data: any) => {
    await apiService.register(data);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAuthView('login');
    setSelectedSubmission(null);
    setSubmissions([]); 
  };

  // --- ACTIONS ---

  const handleCreateSubmission = async (newSub: Omit<ResearchSubmission, 'id' | 'status' | 'submissionDate' | 'progressReports'>) => {
    const tempId = `EC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
    const submissionPayload = {
      ...newSub,
      id: tempId,
      researcherEmail: currentUser?.email, 
      status: 'submitted' as SubmissionStatus,
      submissionDate: new Date().toISOString().split('T')[0],
      progressReports: []
    };

    const res = await apiService.createSubmission(submissionPayload);
    
    if (res.status === 'success') {
      const finalSubmission = {
        ...submissionPayload,
        documents: res.documents || submissionPayload.documents 
      };
      setSubmissions(prev => [finalSubmission, ...prev]); 
      setActiveView('dashboard'); 
    } else {
      throw new Error(res.message); 
    }
  };

  const handleReviewAction = async (id: string, action: 'approve' | 'revise', feedback?: string) => {
    const status = action === 'approve' ? 'approved' : 'revision_needed';
    const approvalDate = action === 'approve' ? new Date().toISOString().split('T')[0] : undefined;
    
    setSubmissions(prev => prev.map(sub => {
      if (sub.id === id) {
        return { ...sub, status, feedback, approvalDate };
      }
      return sub;
    }));
    
    setSelectedSubmission(null);
    if (currentUser?.role === 'reviewer') setActiveView('admin-dashboard');
    else setActiveView('admin-submissions');

    apiService.updateSubmissionStatus(id, status, feedback, approvalDate).catch(err => {
      console.error("Background sync failed:", err);
    });
  };

  const handleUserStatusChange = async (userId: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    apiService.updateUserStatus(userId, status).catch(err => console.error("Sync failed", err));
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    apiService.deleteUser(userId).catch(err => console.error("Sync failed", err));
  };

  const handleAddDocRequirement = async (label: string) => {
    const tempId = label.toLowerCase().replace(/\s+/g, '-');
    const newItem: DocumentRequirement = { id: tempId, label, isRequired: true };
    setDocRequirements(prev => [...prev, newItem]);
    apiService.addConfig(tempId, label, true).catch(err => console.error("Sync failed", err));
  };

  const handleDeleteDocRequirement = async (id: string) => {
    setDocRequirements(prev => prev.filter(d => d.id !== id));
    apiService.deleteConfig(id).catch(err => console.error("Sync failed", err));
  };

  // --- RENDER LOGIC ---

  if (showLanding) return <LandingPage onEnterSystem={handleEnterSystem} />;
  
  if (!isLoggedIn) {
    if (authView === 'register') return <Register onRegister={handleRegister} onLoginClick={() => setAuthView('login')} />;
    return <Login onLogin={handleLogin} onRegisterClick={() => setAuthView('register')} onBackToHome={handleBackToLanding} />;
  }

  // --- ROUTING BERDASARKAN activeView ---
  const renderContent = () => {
    switch (activeView) {
      // RESEARCHER VIEWS
      case 'dashboard':
        return (
          <ResearcherDashboard 
            submissions={submissions} 
            isLoading={isLoading} 
            onViewDetail={(sub) => { setSelectedSubmission(sub); setActiveView('submission-detail'); }}
            onCreateNew={() => setActiveView('submission')}
          />
        );
      case 'submission-detail':
        return <ResearcherSubmissionDetail submission={selectedSubmission} onBack={() => setActiveView('dashboard')} />;
      case 'submission':
        return <SubmissionForm onSubmit={handleCreateSubmission} onCancel={() => setActiveView('dashboard')} documentRequirements={docRequirements} />;
      case 'monitoring':
        return <MonitoringView submissions={submissions} />;
      
      // REVIEWER VIEWS
      case 'admin-dashboard':
      case 'admin-review': // Fallback alias
        return (
          <ReviewerDashboard 
            submissions={submissions} 
            isLoading={isLoading} 
            onReview={(sub) => { setSelectedSubmission(sub); setActiveView('admin-review-detail'); }}
          />
        );
      case 'admin-review-detail':
        return <ReviewDetail submission={selectedSubmission} onBack={() => setActiveView('admin-dashboard')} onSubmitReview={handleReviewAction} />;

      // ADMIN VIEWS
      case 'admin-users':
        return <AdminUserManagement users={users} isLoading={isLoading} onStatusChange={handleUserStatusChange} onDeleteUser={handleDeleteUser} />;
      case 'admin-submissions':
        return (
          <AdminSubmissionMonitoring 
            submissions={submissions} 
            isLoading={isLoading} 
            onViewDetail={(sub) => { setSelectedSubmission(sub); setActiveView('admin-submission-detail'); }}
          />
        );
      case 'admin-submission-detail':
        return <AdminSubmissionDetail submission={selectedSubmission} onBack={() => setActiveView('admin-submissions')} />;
      case 'admin-documents':
        return <AdminDocumentManagement docs={docRequirements} onAdd={handleAddDocRequirement} onDelete={handleDeleteDocRequirement} />;
      case 'admin-settings':
        return <div className="text-slate-500">Fitur Pengaturan sedang dalam pengembangan.</div>;
      
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout 
      currentRole={currentUser?.role || 'researcher'} 
      currentUser={currentUser} 
      onLogout={handleLogout}
      activeView={activeView}
      setActiveView={setActiveView}
    >
      {renderContent()}
    </Layout>
  );
}
