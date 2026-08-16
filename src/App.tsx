import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Navbar } from './components/common/Navbar';
import { AppSkeleton, GlobalLoadingOverlay } from './components/common/GlobalLoadingOverlay';
import { PublicLanding } from './components/public/PublicLanding';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { TenantDashboard } from './components/tenant/TenantDashboard';
import { MemberDashboard } from './components/member/MemberDashboard';
import { MobileSimulator } from './components/member/MobileSimulator';
import { AuthPages } from './components/auth/AuthPages';
import { SystemDocumentation } from './components/common/SystemDocumentation';

const MainContent: React.FC = () => {
  const { activeRole, userAuth, themeColor, isInitializing } = useApp();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeColor);
    document.documentElement.classList.remove('theme-emerald', 'theme-indigo', 'theme-sapphire', 'theme-sunset', 'theme-ruby');
    document.documentElement.classList.add(`theme-${themeColor}`);
  }, [themeColor]);

  // Render high-fidelity skeleton screen during initial platform hydration
  if (isInitializing) {
    return <AppSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      <Navbar />
      
      <main className="flex-1">
        {(!activeRole || activeRole === 'public') && <PublicLanding />}
        
        {activeRole === 'superadmin' && (
          userAuth?.role === 'superadmin'
            ? <SuperAdminDashboard />
            : <AuthPages initialPortal="superadmin" />
        )}

        {activeRole === 'tenantadmin' && (
          (userAuth?.role === 'tenantadmin' || userAuth?.role === 'superadmin')
            ? <TenantDashboard />
            : <AuthPages initialPortal="tenantadmin" />
        )}

        {activeRole === 'member' && (
          (userAuth?.role === 'member' || userAuth?.role === 'tenantadmin' || userAuth?.role === 'superadmin')
            ? <MemberDashboard />
            : <AuthPages initialPortal="member" />
        )}

        {activeRole === 'auth' && <AuthPages />}
        {activeRole === 'docs' && <SystemDocumentation />}
      </main>

      {/* Global Async Operation Feedback Overlay */}
      <GlobalLoadingOverlay />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

