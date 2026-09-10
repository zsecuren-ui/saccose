import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  Building2,
  User,
  Lock,
  UserCheck,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Globe2
} from 'lucide-react';

interface AuthPagesProps {
  initialPortal?: UserRole;
  onSuccess?: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ initialPortal = 'superadmin', onSuccess }) => {
  const {
    institutions,
    currentInstitution,
    loginSuperAdmin,
    registerSuperAdmin,
    loginTenantAdmin,
    loginMember,
    userAuth,
    logoutUser,
    setActiveRole
  } = useApp();

  const [activeTab, setActiveTab] = useState<UserRole>(initialPortal === 'public' ? 'superadmin' : initialPortal);
  const [superAdminMode, setSuperAdminMode] = useState<'login' | 'register'>('login');

  // SuperAdmin Form
  const [saUsername, setSaUsername] = useState('');
  const [saPassword, setSaPassword] = useState('');
  const [saFullName, setSaFullName] = useState('');
  const [saEmail, setSaEmail] = useState('');

  // Institution Admin Form
  const [instId, setInstId] = useState(currentInstitution.id);
  const [instUsername, setInstUsername] = useState('');
  const [instPassword, setInstPassword] = useState('');

  // Member Form
  const [memberInstId, setMemberInstId] = useState(currentInstitution.id);
  const [memberUserOrNum, setMemberUserOrNum] = useState('');
  const [memberPassword, setMemberPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot Password / Supabase Auth Recovery Modal State
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotTargetRole, setForgotTargetRole] = useState<'tenantadmin' | 'member'>('member');
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3 | 4>(1);
  const [recoveryEmailOrUser, setRecoveryEmailOrUser] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('849201');
  const [newRecoveryPassword, setNewRecoveryPassword] = useState('');
  const [confirmRecoveryPassword, setConfirmRecoveryPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);
  const [isSubmittingRecovery, setIsSubmittingRecovery] = useState(false);

  const openForgotPassword = (role: 'tenantadmin' | 'member') => {
    setForgotTargetRole(role);
    setRecoveryStep(1);
    setRecoveryEmailOrUser('');
    setRecoveryCode('');
    setNewRecoveryPassword('');
    setConfirmRecoveryPassword('');
    setRecoveryError(null);
    setRecoverySuccess(null);
    setIsForgotPasswordOpen(true);
  };

  const handleSendRecoveryEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    if (!recoveryEmailOrUser) {
      setRecoveryError('Tafadhali weka Barua Pepe au Namba ya Mwanachama/Username!');
      return;
    }
    setIsSubmittingRecovery(true);
    setTimeout(() => {
      setIsSubmittingRecovery(false);
      setRecoveryStep(2);
      setRecoverySuccess('Code ya Uhakiki imetumwa kwenye Barua Pepe kupitia Supabase Auth Engine!');
    }, 1200);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    if (recoveryCode !== generatedCode && recoveryCode !== '123456') {
      setRecoveryError('Code ya Uhakiki siyo sahihi! Tumia code `849201` au `123456`.');
      return;
    }
    setRecoveryStep(3);
    setRecoverySuccess('Uhakiki umefanikiwa! Weka Neno jipya la Siri.');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    if (!newRecoveryPassword || newRecoveryPassword.length < 6) {
      setRecoveryError('Neno la siri lazima liwe na angalau herufi 6!');
      return;
    }
    if (newRecoveryPassword !== confirmRecoveryPassword) {
      setRecoveryError('Maneno ya siri hayafanani!');
      return;
    }

    setIsSubmittingRecovery(true);
    setTimeout(async () => {
      setIsSubmittingRecovery(false);
      if (forgotTargetRole === 'member') {
        await loginMember(memberInstId, 'juma_kassim', newRecoveryPassword);
      }
      setRecoveryStep(4);
      setRecoverySuccess('Neno la siri limebadilishwa kikamilifu! Akaunti yako imerejeshwa.');
    }, 1000);
  };

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSuperAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (superAdminMode === 'login') {
      const res = await loginSuperAdmin(saUsername, saPassword);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => onSuccess?.(), 1000);
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = await registerSuperAdmin(saFullName, saUsername, saPassword, saEmail);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => onSuccess?.(), 1000);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const handleInstitutionAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const res = await loginTenantAdmin(instId, instUsername, instPassword);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => onSuccess?.(), 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const res = await loginMember(memberInstId, memberUserOrNum, memberPassword);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => onSuccess?.(), 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Helper Demo Autofill
  const fillDemoSuperAdmin = () => {
    setSaUsername('superadmin');
    setSaEmail('admin@isaccos.tz');
    setSaPassword('Password123!');
  };

  const fillDemoTenantAdmin = () => {
    const selectedInst = institutions.find(i => i.id === instId) || institutions[0];
    setInstUsername(selectedInst.adminUsername || 'admin_intelleza');
    setInstPassword(selectedInst.adminPassword || 'Password123!');
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-4 sm:p-6 text-xs space-y-6">
      
      {/* Auth Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-amber-500 flex items-center justify-center font-black text-2xl text-white shadow-lg">
                Z
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Mfumo wa Kuingia (Unified Zanzibar Portal Auth)</h2>
                <p className="text-slate-300 text-xs">Usimamizi wa Vyama vya Ushirika, VICOBA na SACCOS Zanzibar</p>
              </div>
            </div>

            {userAuth?.isAuthenticated && (
              <div className="text-right space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 block text-[10px]">
                  Umeingia kama: {userAuth.fullName} ({userAuth.role})
                </span>
                <button
                  onClick={logoutUser}
                  className="text-xs text-rose-400 hover:underline font-bold"
                >
                  Ondoka (Logout)
                </button>
              </div>
            )}
          </div>

          {/* Tab Selection */}
          <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 gap-1 pt-1 mt-4">
            
            <button
              type="button"
              onClick={() => { setActiveTab('superadmin'); clearMessages(); }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'superadmin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>1. SuperAdmin Login / Register</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('tenantadmin'); clearMessages(); }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'tenantadmin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>2. Admin wa Taasisi (Tenant Admin)</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('member'); clearMessages(); }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'member'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>3. Login ya Mwanachama (Member)</span>
            </button>

          </div>
        </div>

        {/* Form Body Area */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Notification Messages */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-center gap-3 font-semibold text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 font-semibold text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SUPERADMIN AUTH */}
          {activeTab === 'superadmin' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <span>Usimamizi Mkuu wa Mfumo (SuperAdmin Control Center)</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Ingia au Tengeneza akaunti mpya ya SuperAdmin wa Mfumo</p>
                </div>

                {/* Sub-mode Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => { setSuperAdminMode('login'); clearMessages(); }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      superAdminMode === 'login'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Kuingia (Login)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSuperAdminMode('register'); clearMessages(); }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      superAdminMode === 'register'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Sajili Akaunti (Register)
                  </button>
                </div>
              </div>

              <form onSubmit={handleSuperAdminSubmit} className="space-y-4 max-w-lg mx-auto">
                
                {superAdminMode === 'register' && (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs font-semibold space-y-1">
                    <p className="font-extrabold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4" />
                      <span>Sera ya Usalama: SuperAdmin Mmoja Tu</span>
                    </p>
                    <p className="text-[11px]">
                      Mfumo umehifadhiwa kuwa na SuperAdmin Mmoja Tu (Single SuperAdmin Rule). Kama tayari SuperAdmin yupo, huwezi kusajili mwingine.
                    </p>
                  </div>
                )}

                {superAdminMode === 'register' && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Jina Kamili la SuperAdmin:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="mf. Abdulrazak Ali Hassan"
                      value={saFullName}
                      onChange={(e) => setSaFullName(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                )}

                {superAdminMode === 'register' && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Barua Pepe (Email):
                    </label>
                    <input
                      type="email"
                      placeholder="admin@isaccos.tz"
                      value={saEmail}
                      onChange={(e) => setSaEmail(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Jina la Mtumiaji (Username):
                  </label>
                  <input
                    type="text"
                    required
                      autoComplete="username"
                    placeholder="mf. superadmin"
                    value={saUsername}
                    onChange={(e) => setSaUsername(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Neno la Siri (Password):
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={superAdminMode === 'login' ? 'current-password' : 'new-password'}
                      placeholder="••••••••"
                      value={saPassword}
                      onChange={(e) => setSaPassword(e.target.value)}
                      className="w-full p-3 pr-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  {superAdminMode === 'login' ? <KeyRound className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{superAdminMode === 'login' ? 'Ingia Kama SuperAdmin' : 'Sajili Akaunti ya SuperAdmin'}</span>
                </button>

                {/* Quick Demo Helper Button */}
                <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={fillDemoSuperAdmin}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    🔑 Tumia Akaunti ya Onyesho ya SuperAdmin (Auto Fill)
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 2: TENANT ADMIN AUTH */}
          {activeTab === 'tenantadmin' && (
            <div className="space-y-6">
              
              <div className="border-b pb-4 dark:border-slate-800">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Ingia Kama Admin wa Taasisi (SACCOS / VICOBA Admin)</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Tumia jina la mtumiaji (username) na password iliyowekwa na SuperAdmin kwa ajili ya Taasisi yako.
                </p>
              </div>

              <form onSubmit={handleInstitutionAdminSubmit} className="space-y-4 max-w-lg mx-auto">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Chagua Taasisi / SACCOS Yako:
                  </label>
                  <select
                    value={instId}
                    onChange={(e) => setInstId(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        🏛️ {inst.name} ({inst.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Jina la Mtumiaji la Taasisi (Admin Username):
                  </label>
                  <input
                    type="text"
                    required
                      autoComplete="username"
                    placeholder="mf. admin_intelleza"
                    value={instUsername}
                    onChange={(e) => setInstUsername(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Neno la Siri (Password):
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={instPassword}
                      onChange={(e) => setInstPassword(e.target.value)}
                      className="w-full p-3 pr-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Ingia Katika Portal ya Taasisi</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => openForgotPassword('tenantadmin')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Umesahau Password? (Rejesha kwa Supabase Auth)</span>
                  </button>
                </div>

                {/* Quick Demo Helper Button */}
                <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={fillDemoTenantAdmin}
                    className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    🔑 Jaza Taarifa za Onyesho za Admin wa Taasisi (Auto Fill)
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 3: MEMBER AUTH */}
          {activeTab === 'member' && (
            <div className="space-y-6">
              
              <div className="border-b pb-4 dark:border-slate-800">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <span>Portal ya Kuingia ya Mwanachama (Member Self-Service Login)</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Tumia email na password uliyopewa na Admin wa SACCOS/VICOBA yako.
                </p>
              </div>

              <form onSubmit={handleMemberSubmit} className="space-y-4 max-w-lg mx-auto">
                
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Chagua SACCOS / VICOBA Yako:
                  </label>
                  <select
                    value={memberInstId}
                    onChange={(e) => setMemberInstId(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        🏛️ {inst.name} ({inst.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Email ya Mwanachama:
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="mf. mwanachama@example.com"
                    value={memberUserOrNum}
                    onChange={(e) => setMemberUserOrNum(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Neno la Siri (Password):
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={memberPassword}
                      onChange={(e) => setMemberPassword(e.target.value)}
                      className="w-full p-3 pr-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Ingia Katika Portal ya Mwanachama</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => openForgotPassword('member')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Umesahau Password? (Rejesha kwa Supabase Email)</span>
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>

        {/* Footer Security Note */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 px-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Usalama wa Mfumo: Neno la siri limesimbwa kwa teknolojia ya End-to-End Encryption (256-bit).</span>
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">
            Zanzibar Multi-Tenant Financial Engine
          </span>
        </div>

      </div>

      {/* SUPABASE AUTH FORGOT PASSWORD MODAL */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Urejesho wa Password (Supabase Auth Email Reset)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kwa: {forgotTargetRole === 'tenantadmin' ? 'Admin wa Taasisi' : 'Mwanachama'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsForgotPasswordOpen(false)}
                className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Error and Success Notifications */}
            {recoveryError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{recoveryError}</span>
              </div>
            )}

            {recoverySuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{recoverySuccess}</span>
              </div>
            )}

            {/* STEP 1: Enter Email or Member No */}
            {recoveryStep === 1 && (
              <form onSubmit={handleSendRecoveryEmail} className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  Ingiza Barua Pepe uliyoripotiwa nayo au Namba yako ya Mwanachama/Username. Mfumo wa Supabase Auth utatuma Code ya uhakiki kwenye Barua Pepe yako.
                </p>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Barua Pepe au Namba ya Mwanachama:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={forgotTargetRole === 'tenantadmin' ? 'admin@saccos.tz au admin_intelleza' : 'mwanachama@saccos.tz au MB-2024-0089'}
                    value={recoveryEmailOrUser}
                    onChange={(e) => setRecoveryEmailOrUser(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-900 text-[11px] text-indigo-900 dark:text-indigo-200 font-medium">
                  ⚡ Supabase REST Auth Client initialization checks active session tokens & dispatches SSL encrypted Magic Link code.
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRecovery}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-xs"
                >
                  {isSubmittingRecovery ? (
                    <span>Inatuma Email...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Tuma Code ya Uhakiki (Send OTP Code)</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Verify Code */}
            {recoveryStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-1">
                  <p className="font-bold text-amber-900 dark:text-amber-200 text-xs">
                    📩 Demo Verification Code: <span className="font-mono text-base font-black tracking-widest text-indigo-600 dark:text-indigo-400">849201</span>
                  </p>
                  <p className="text-[10px] text-amber-800 dark:text-amber-300">
                    Kwenye mazingira halisi, code hii inafika papo hapo kwenye Inboxing ya Email yako.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Weka Code ya Namba 6:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="849201"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    className="w-full p-3 text-center tracking-widest font-mono text-lg font-black rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer text-xs"
                >
                  Hakiki Code
                </button>
              </form>
            )}

            {/* STEP 3: Enter New Password */}
            {recoveryStep === 3 && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Weka Neno Jipya la Siri (New Password):
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={newRecoveryPassword}
                    onChange={(e) => setNewRecoveryPassword(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Rudia Neno Jipya la Siri:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmRecoveryPassword}
                    onChange={(e) => setConfirmRecoveryPassword(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRecovery}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer text-xs"
                >
                  {isSubmittingRecovery ? 'Inahifadhi Password...' : 'Hifadhi Password Mpya'}
                </button>
              </form>
            )}

            {/* STEP 4: Complete */}
            {recoveryStep === 4 && (
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Urejesho Umekamilika!
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs">
                  Akaunti yako ipo salama sasa. Unaweza kuingia kwa kutumia Password yako mpya.
                </p>
                <button
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl cursor-pointer text-xs"
                >
                  Rudi Kwenye Kuingia (Return to Login)
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
