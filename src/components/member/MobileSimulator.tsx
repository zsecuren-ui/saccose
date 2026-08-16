import React, { useState } from 'react';
import { MemberDashboard } from './MemberDashboard';
import { Smartphone, Fingerprint, QrCode, Wifi, Battery, Signal, Bell } from 'lucide-react';

export const MobileSimulator: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authMethod, setAuthMethod] = useState<'fingerprint' | 'qr'>('fingerprint');

  return (
    <div id="mobile-simulator-container" className="py-8 px-4 flex flex-col items-center justify-center min-h-[85vh]">
      
      {/* Mobile Smartphone Frame */}
      <div className="relative w-full max-w-[420px] bg-slate-900 rounded-[50px] p-4 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-900/50">
        
        {/* Top Notch & Camera Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Mobile Screen Area */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-[38px] overflow-hidden min-h-[720px] max-h-[800px] flex flex-col pt-6 text-slate-900 dark:text-slate-100 relative">
          
          {/* Status Bar */}
          <div className="px-6 py-1.5 flex justify-between items-center text-[11px] font-bold text-slate-700 dark:text-slate-300 z-40 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-xs">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Screen Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {isAuthenticated ? (
              <MemberDashboard />
            ) : (
              <div className="p-6 text-center space-y-6 pt-16">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
                  S
                </div>
                <h3 className="font-bold text-lg">Ingia kwenye Mobile App</h3>
                <p className="text-xs text-slate-500">SACCOS Mobile Banking & Savings App</p>

                <div className="pt-8">
                  <button
                    onClick={() => setIsAuthenticated(true)}
                    className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2"
                  >
                    <Fingerprint className="w-6 h-6" />
                    <span>Ingia kwa Fingerprint / Face ID</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Home Indicator */}
          <div className="p-2 flex justify-center bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="w-28 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
          </div>

        </div>

      </div>

    </div>
  );
};
