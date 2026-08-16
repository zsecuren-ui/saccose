import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  CheckCheck,
  Trash2,
  User,
  CreditCard,
  BookOpen,
  X,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Camera,
  Building2
} from 'lucide-react';

interface TenantGlobalHeaderProps {
  onNavigateTab: (tabId: string) => void;
}

export const TenantGlobalHeader: React.FC<TenantGlobalHeaderProps> = ({ onNavigateTab }) => {
  const {
    currentInstitution,
    members,
    loans,
    coa,
    formatTZS,
    setActiveRole,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications
  } = useApp();

  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'loan' | 'payment'>('all');

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Filter members, loans, COA for current institution
  const tenantMembers = useMemo(() => members.filter(m => m.tenantId === currentInstitution.id), [members, currentInstitution.id]);
  const tenantLoans = useMemo(() => loans.filter(l => l.tenantId === currentInstitution.id), [loans, currentInstitution.id]);

  // Real System Notifications for current tenant admin
  const tenantNotifications = useMemo(() => {
    return (notifications || []).filter(n => {
      const isTarget = n.targetRole === 'tenantadmin' || !n.targetRole;
      const isTenantMatch = !n.tenantId || n.tenantId === currentInstitution.id;
      return isTarget && isTenantMatch;
    });
  }, [notifications, currentInstitution.id]);

  const unreadCount = tenantNotifications.filter(n => !n.read).length;

  // Filtered notifications list
  const filteredNotifications = useMemo(() => {
    return tenantNotifications.filter(n => {
      if (notificationFilter === 'unread') return !n.read;
      if (notificationFilter === 'loan') return n.category === 'loan';
      if (notificationFilter === 'payment') return n.category === 'payment';
      return true;
    });
  }, [tenantNotifications, notificationFilter]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search results logic across Members, Loans, and Accounting Ledger
  const searchResults = useMemo(() => {
    if (!query.trim()) return { members: [], loans: [], accounting: [] };

    const q = query.toLowerCase().trim();

    // 1. Search Members
    const matchedMembers = tenantMembers.filter(m =>
      m.fullName.toLowerCase().includes(q) ||
      m.memberNumber.toLowerCase().includes(q) ||
      (m.phone && m.phone.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.idNumber && m.idNumber.toLowerCase().includes(q))
    ).slice(0, 5);

    // 2. Search Loans
    const matchedLoans = tenantLoans.filter(l =>
      l.memberName.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q) ||
      l.loanType.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q) ||
      String(l.amountRequested).includes(q) ||
      (l.amountApproved && String(l.amountApproved).includes(q))
    ).slice(0, 5);

    // 3. Search Accounting Ledger / COA
    const matchedAccounts = (coa || []).filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    ).slice(0, 5);

    return {
      members: matchedMembers,
      loans: matchedLoans,
      accounting: matchedAccounts
    };
  }, [query, tenantMembers, tenantLoans, coa]);

  const totalResultsCount =
    searchResults.members.length +
    searchResults.loans.length +
    searchResults.accounting.length;

  const handleNotificationClick = (notif: typeof tenantNotifications[0]) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
    }
    const targetTab = notif.linkTab || (
      notif.category === 'loan' ? 'loans' :
      notif.category === 'payment' ? 'receipts' :
      notif.category === 'member' ? 'members' :
      notif.category === 'fine' ? 'fines' :
      notif.category === 'audit' ? 'accounting' : 'overview'
    );
    onNavigateTab(targetTab);
    setIsNotificationsOpen(false);
  };

  const getNotificationIcon = (category?: string, type?: string) => {
    if (category === 'loan' || type === 'loan') {
      return <CreditCard className="w-4 h-4 text-amber-400" />;
    }
    if (category === 'payment' || type === 'payment') {
      return <DollarSign className="w-4 h-4 text-emerald-400" />;
    }
    if (category === 'member' || type === 'member') {
      return <User className="w-4 h-4 text-blue-400" />;
    }
    if (category === 'fine') {
      return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    }
    if (category === 'audit') {
      return <ShieldCheck className="w-4 h-4 text-purple-400" />;
    }
    if (type === 'success') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    if (type === 'alert' || type === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
    return <Info className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="w-full bg-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 transition-all relative">
      
      {/* Left Branding & Quick Nav */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          onClick={() => onNavigateTab('branding')}
          className="relative group cursor-pointer"
          title="Bofya kubadilisha picha au wasifu wa taasisi"
        >
          <img
            src={currentInstitution.logo}
            alt={currentInstitution.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentInstitution.name)}&background=0d9488&color=fff`;
            }}
            className="w-12 h-12 rounded-2xl object-cover bg-white p-1 shadow-md border border-slate-700 group-hover:border-emerald-500 transition-colors"
          />
          <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-emerald-300 transition-opacity">
            <Camera className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1
              onClick={() => onNavigateTab('branding')}
              className="text-base sm:text-lg font-black tracking-tight text-white hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {currentInstitution.name}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] border border-emerald-500/30">
              {currentInstitution.type}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
            <span>Reg: <strong className="text-slate-200">{currentInstitution.registrationNumber}</strong></span>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNavigateTab('branding')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Camera className="w-3 h-3" />
              <span>Hariri Wasifu & Picha</span>
            </button>
          </div>
        </div>
      </div>

      {/* Center & Right Controls: Global Search Bar + Notifications + Demo Portal Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 justify-end">
        
        {/* GLOBAL SEARCH BAR */}
        <div ref={searchRef} className="relative w-full sm:max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tafuta Wanachama, Mikopo, au Uhasibu..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown Popover */}
          {isSearchOpen && query.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto space-y-2 p-2">
              
              {totalResultsCount === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <Search className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                  Hakuna matokeo yaliyopatikana kwa &quot;<strong className="text-white">{query}</strong>&quot;
                </div>
              ) : (
                <>
                  {/* Category 1: Members */}
                  {searchResults.members.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 rounded-lg">
                        <User className="w-3 h-3" /> Wanachama ({searchResults.members.length})
                      </div>
                      {searchResults.members.map(m => (
                        <div
                          key={m.id}
                          onClick={() => {
                            onNavigateTab('members');
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={m.photoUrl}
                              alt={m.fullName}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName)}&background=0d9488&color=fff`;
                              }}
                              className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <span className="font-bold text-xs text-white group-hover:text-emerald-400 block">{m.fullName}</span>
                              <span className="text-[10px] text-slate-400">Namba: {m.memberNumber} • Simu: {m.phone}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-emerald-400 block">{formatTZS(m.totalSavings)}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">{m.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category 2: Loans */}
                  {searchResults.loans.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 bg-amber-950/40 rounded-lg">
                        <CreditCard className="w-3 h-3" /> Miamala ya Mikopo ({searchResults.loans.length})
                      </div>
                      {searchResults.loans.map(l => (
                        <div
                          key={l.id}
                          onClick={() => {
                            onNavigateTab('loans');
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <span className="font-bold text-xs text-white group-hover:text-amber-400 block">{l.memberName}</span>
                            <span className="text-[10px] text-slate-400">{l.loanType} • Hali: <strong className="text-amber-300">{l.status}</strong></span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-amber-400 block">{formatTZS(l.amountApproved || l.amountRequested)}</span>
                            <span className="text-[9px] text-slate-400">Baki: {formatTZS(l.remainingBalance)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category 3: Accounting Ledger & COA */}
                  {searchResults.accounting.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 bg-indigo-950/40 rounded-lg">
                        <BookOpen className="w-3 h-3" /> Akaunti za Uhasibu ({searchResults.accounting.length})
                      </div>
                      {searchResults.accounting.map(a => (
                        <div
                          key={a.code}
                          onClick={() => {
                            onNavigateTab('accounting');
                            setIsSearchOpen(false);
                          }}
                          className="p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <span className="font-bold text-xs text-white group-hover:text-indigo-400 block">{a.name} ({a.code})</span>
                            <span className="text-[10px] text-slate-400">Kipengele: {a.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-indigo-300 block">{formatTZS(a.balance)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

            </div>
          )}
        </div>

        {/* REAL SYSTEM NOTIFICATIONS BELL WITH LIVE POPPER */}
        <div ref={notifRef} className="relative shrink-0">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 text-slate-200 transition-all relative cursor-pointer flex items-center justify-center"
            title="Arifa Halisi za Mfumo"
          >
            <Bell className="w-5 h-5 text-emerald-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center animate-pulse border-2 border-slate-900 shadow-md">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 sm:right-0 top-12 z-50 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-80 sm:w-96 p-4 space-y-3">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-extrabold text-sm text-white">Arifa Halisi za Mfumo</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black text-[10px]">
                      {unreadCount} Mpya
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => markAllNotificationsAsRead(currentInstitution.id)}
                    title="Weka zote zimesomwa"
                    className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => clearAllNotifications(currentInstitution.id)}
                    title="Futa arifa zote za taasisi hii"
                    className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification Filter Category Pills */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl text-[11px] font-bold overflow-x-auto">
                <button
                  onClick={() => setNotificationFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                    notificationFilter === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Zote ({tenantNotifications.length})
                </button>
                <button
                  onClick={() => setNotificationFilter('unread')}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                    notificationFilter === 'unread' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Zisizosomwa ({unreadCount})
                </button>
                <button
                  onClick={() => setNotificationFilter('loan')}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                    notificationFilter === 'loan' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mikopo
                </button>
                <button
                  onClick={() => setNotificationFilter('payment')}
                  className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                    notificationFilter === 'payment' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Malipo
                </button>
              </div>

              {/* Notification Items List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                    Hakuna arifa katika kipengele hiki. Mfumo unajiendesha vyema!
                  </div>
                ) : (
                  filteredNotifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer relative flex items-start gap-3 group ${
                        !n.read
                          ? 'bg-slate-800/95 border-emerald-500/50 hover:border-emerald-400 shadow-md'
                          : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
                      }`}
                    >
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-3.5 right-3 animate-ping" />
                      )}
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        n.category === 'loan' ? 'bg-amber-500/20 text-amber-400' :
                        n.category === 'payment' ? 'bg-emerald-500/20 text-emerald-400' :
                        n.category === 'member' ? 'bg-blue-500/20 text-blue-400' :
                        n.category === 'fine' ? 'bg-rose-500/20 text-rose-400' :
                        n.category === 'audit' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {getNotificationIcon(n.category, n.type)}
                      </div>
                      <div className="space-y-0.5 flex-1 pr-4">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-extrabold text-xs leading-tight ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                            {n.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-300 font-normal leading-snug">{n.message}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] text-slate-400 font-medium">{n.date}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            title="Futa arifa hii"
                            className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>

        {/* DEMO MEMBER PORTAL SWITCH BUTTON */}
        <button
          onClick={() => setActiveRole('member')}
          className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-2xl shadow-md transition-all text-xs shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
        >
          <span>Portal ya Mwanachama</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
