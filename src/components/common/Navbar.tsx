import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { SupabaseConnectModal } from './SupabaseConnectModal';
import { MemberEditProfileModal } from './MemberEditProfileModal';
import { CameraCaptureModal } from './CameraCaptureModal';
import { MemberAvatar } from './MemberAvatar';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  ShieldCheck,
  Building2,
  User,
  Globe2,
  Bell,
  RotateCcw,
  Sparkles,
  ChevronDown,
  LogIn,
  LogOut,
  BookOpen,
  Palette,
  Camera,
  Menu,
  X,
  Check,
  CheckCheck,
  Building,
  KeyRound,
  Compass,
  ArrowRight,
  Shield,
  Layers,
  Flame,
  Radio
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    lang,
    setLang,
    themeColor,
    setThemeColor,
    activeRole,
    setActiveRole,
    userAuth,
    logoutUser,
    institutions,
    currentInstitution,
    setCurrentInstitutionId,
    currentMember,
    updateMemberProfile,
    t,
    notifications,
    markAllNotificationsAsRead,
    resetAllData
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isNavCameraOpen, setIsNavCameraOpen] = useState(false);
  const [isNavProfileOpen, setIsNavProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifs(false);
      }
      if (paletteRef.current && !paletteRef.current.contains(target)) {
        setShowColorPalette(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on role change
  const handleSelectRole = (role: UserRole) => {
    setActiveRole(role);
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  const portalConfig: Record<
    UserRole,
    { title: string; shortTitle: string; subtitle: string; icon: React.ReactNode; badge?: string; color: string }
  > = {
    public: {
      title: 'Tovuti ya Umma',
      shortTitle: 'Umma',
      subtitle: 'Matangazo, Fursa & VICOBA Hub',
      icon: <Globe2 className="w-4 h-4" />,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    superadmin: {
      title: 'SuperAdmin',
      shortTitle: 'SuperAdmin',
      subtitle: 'Usimamizi Mkuu wa Zanzibar',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: 'Zanzibar HQ',
      color: 'text-indigo-600 dark:text-indigo-400'
    },
    tenantadmin: {
      title: 'Portal ya Instituti (Taasisi)',
      shortTitle: 'Instituti',
      subtitle: 'Uendeshaji wa Kikundi & Mikopo',
      icon: <Building2 className="w-4 h-4" />,
      color: 'text-sky-600 dark:text-sky-400'
    },
    member: {
      title: 'Portal ya Mwanachama',
      shortTitle: 'Mwanachama',
      subtitle: 'Akaunti Binafsi, Akiba & Rejesho',
      icon: <User className="w-4 h-4" />,
      color: 'text-amber-600 dark:text-amber-400'
    },
    auth: {
      title: userAuth ? 'Akaunti Yangu' : 'Ingia Portal',
      shortTitle: userAuth ? 'Akaunti' : 'Ingia',
      subtitle: userAuth ? `Umeingia kama ${userAuth.fullName}` : 'Thibitisha Utambulisho Wako',
      icon: <LogIn className="w-4 h-4" />,
      color: 'text-teal-600 dark:text-teal-400'
    },
    docs: {
      title: 'Miongozo & Sera',
      shortTitle: 'Miongozo',
      subtitle: 'Mwongozo wa Mfumo & Sheria za Ushirika',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'text-purple-600 dark:text-purple-400'
    }
  };

  const themeOptions = [
    { id: 'emerald', label: 'Zanzibar Emerald', desc: 'Kijani cha Asili cha Zanzibar', colorClass: 'bg-emerald-500', hex: '#10b981' },
    { id: 'indigo', label: 'Indigo Royal', desc: 'Bluu ya Kifalme ya Ushirika', colorClass: 'bg-indigo-500', hex: '#6366f1' },
    { id: 'sapphire', label: 'Ocean Sapphire', desc: 'Bluu ya Bahari Kuu ya Unguja', colorClass: 'bg-sky-500', hex: '#0ea5e9' },
    { id: 'sunset', label: 'Sunset Gold', desc: 'Dhahabu ya Machweo Kendwa', colorClass: 'bg-amber-500', hex: '#f59e0b' },
    { id: 'ruby', label: 'Ruby Velvet', desc: 'Nyekundu ya Kifahari', colorClass: 'bg-rose-500', hex: '#f43f5e' }
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200/90 dark:border-slate-800 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          
          {/* LEFT: BRAND / LOGO & ACTIVE INSTITUTION BADGE */}
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => handleSelectRole('public')}
              className="flex items-center space-x-2.5 sm:space-x-3 text-left group transition-transform active:scale-95 min-w-0"
            >
              {/* Emblem / Logo Icon */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md shadow-emerald-500/25 ring-2 ring-white dark:ring-slate-800">
                  Z
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    SACCOS PLATFORM
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 shrink-0">
                    LIVE
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[140px] sm:max-w-[220px] font-medium">
                    {userAuth && (userAuth.role === 'tenantadmin' || userAuth.role === 'member')
                      ? currentInstitution?.name
                      : userAuth?.role === 'superadmin'
                      ? 'Usimamizi Mkuu wa Zanzibar'
                      : 'Unguja & Pemba Hub'}
                  </span>
                  <span className="hidden md:inline text-slate-300 dark:text-slate-600">•</span>
                  <span className="hidden md:inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live 2026
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* CENTER: DESKTOP PORTAL NAVIGATION TABS */}
          <nav className="hidden xl:flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            {(['public', 'superadmin', 'tenantadmin', 'member'] as UserRole[]).map((r) => {
              const active = activeRole === r;
              const config = portalConfig[r];
              return (
                <button
                  key={r}
                  id={`nav-role-${r}`}
                  onClick={() => handleSelectRole(r)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800'
                  }`}
                  title={config.subtitle}
                >
                  <span className={active ? config.color : 'text-slate-400'}>
                    {config.icon}
                  </span>
                  <span>{config.shortTitle}</span>
                  {config.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {config.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT CONTROLS: INSTITUTION, THEME, LANG, NOTIFS, PROFILE, MOBILE HAMBURGER */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            
            {/* Authenticated Institution Badge (Visible ONLY when logged in as Tenant Admin or Member) */}
            {userAuth && (userAuth.role === 'tenantadmin' || userAuth.role === 'member') && currentInstitution && (
              <div
                id="auth-institution-badge"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-700/80 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-bold shadow-2xs"
                title={`Umeingia katika: ${currentInstitution.name} (${currentInstitution.type})`}
              >
                <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="max-w-[140px] lg:max-w-[190px] truncate">
                  {currentInstitution.name}
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                  {currentInstitution.type}
                </span>
              </div>
            )}

            {/* Language Switcher (SW / EN) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                id="lang-sw-header"
                onClick={() => setLang('sw')}
                className={`px-2 py-1 text-[11px] font-extrabold rounded-lg transition-all ${
                  lang === 'sw'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Badili lugha kuwa Kiswahili"
              >
                SW
              </button>
              <button
                id="lang-en-header"
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-[11px] font-extrabold rounded-lg transition-all ${
                  lang === 'en'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Switch language to English"
              >
                EN
              </button>
            </div>

            {/* Dynamic Color Theme Palette Selector */}
            <div className="relative" ref={paletteRef}>
              <button
                id="color-palette-btn"
                onClick={() => setShowColorPalette(!showColorPalette)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all flex items-center gap-1.5"
                title="Badilisha Rangi ya Mandhari (Theme Color)"
              >
                <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span
                  className={`w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                    themeColor === 'indigo'
                      ? 'bg-indigo-500'
                      : themeColor === 'sapphire'
                      ? 'bg-sky-500'
                      : themeColor === 'sunset'
                      ? 'bg-amber-500'
                      : themeColor === 'ruby'
                      ? 'bg-rose-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </button>

              {showColorPalette && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b pb-2 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Rangi za Mfumo (Themes)</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Chagua rangi unayoipenda</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {themeOptions.map((c) => {
                      const isSelected = themeColor === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setThemeColor(c.id as any);
                            setShowColorPalette(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded-full ${c.colorClass} shadow-xs ring-1 ring-slate-300 dark:ring-slate-600`} />
                            <div>
                              <p className="leading-none">{c.label}</p>
                              <p className="text-[9px] text-slate-400 font-normal mt-0.5">{c.desc}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                id="header-notif-btn"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
                title={t('notifications')}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div
                  id="notif-dropdown-box"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/80 rounded-lg text-emerald-600">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                          {t('notifications')}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {unreadCount} hazijasomwa kati ya {notifications.length}
                        </span>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Soma Zote</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-slate-400 font-medium">
                        Hakuna arifa kwa sasa.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl text-xs transition-colors border ${
                            n.read
                              ? 'bg-slate-50/70 dark:bg-slate-700/30 border-slate-200/50 dark:border-slate-700/50'
                              : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 font-semibold'
                          }`}
                        >
                          <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                            <span className="font-bold text-xs">{n.title}</span>
                            <span className="text-[9px] text-slate-400">{n.date}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* USER AUTH & PROFILE DROPDOWN */}
            {userAuth ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer"
                  title="Akaunti Yako"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {userAuth.fullName ? userAuth.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:block text-left pr-1">
                    <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight max-w-[100px] truncate">
                      {userAuth.fullName.split(' ')[0]}
                    </p>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                      {userAuth.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2.5 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {userAuth.fullName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {userAuth.username}
                      </p>
                      <span className="mt-1 inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {userAuth.role.toUpperCase()}
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {userAuth.role === 'member' && currentMember && (
                        <>
                          <button
                            onClick={() => {
                              setIsNavCameraOpen(true);
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4 text-emerald-500" />
                            <span>Piga Picha ya Wasifu</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsNavProfileOpen(true);
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 flex items-center gap-2"
                          >
                            <User className="w-4 h-4 text-teal-500" />
                            <span>Hariri Wasifu</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          logoutUser();
                          setShowUserMenu(false);
                          setActiveRole('public');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Toka Kwenye Mfumo (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => handleSelectRole('auth')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-sm shadow-emerald-600/20 transition-transform active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingia Portal</span>
              </button>
            )}

            {/* Reset Demo Data Button */}
            <button
              id="reset-demo-header-btn"
              onClick={() => {
                if (confirm('Je, unataka kurejesha data za awali za mfumo (Demo Data)?')) {
                  resetAllData();
                }
              }}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Rejesha Data za Onyesho (Reset Demo Data)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* MOBILE HAMBURGER MENU BUTTON */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* MOBILE SLIDE-DOWN DRAWER / MENU */}
        {isMobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-4 duration-200">
            
            {/* Portals Grid on Mobile */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                Chagua Portal ya Kufungua:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(['public', 'superadmin', 'tenantadmin', 'member', 'auth'] as UserRole[]).map((r) => {
                  const active = activeRole === r;
                  const config = portalConfig[r];
                  return (
                    <button
                      key={r}
                      onClick={() => handleSelectRole(r)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        active
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-600 text-slate-900 dark:text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${
                            active
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {config.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-tight">{config.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {config.subtitle}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 ${
                          active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Authenticated Institution Info (Visible ONLY when logged in as Tenant Admin or Member) */}
            {userAuth && (userAuth.role === 'tenantadmin' || userAuth.role === 'member') && currentInstitution && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300">
                      Taasisi Yako ya Ushirika
                    </p>
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      {currentInstitution.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {currentInstitution.type} • {currentInstitution.region}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                  Imethibitishwa
                </span>
              </div>
            )}

            {/* Mobile Quick Action Footer */}
            {userAuth && (
              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">Umeingia kama:</span>{' '}
                  <strong className="text-slate-900 dark:text-white">{userAuth.fullName}</strong>
                </div>
                <button
                  onClick={() => {
                    logoutUser();
                    setIsMobileMenuOpen(false);
                    setActiveRole('public');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Toka</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Supabase Connection Modal */}
      <SupabaseConnectModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Navbar Camera Capture Modal */}
      {currentMember && (
        <CameraCaptureModal
          isOpen={isNavCameraOpen}
          onClose={() => setIsNavCameraOpen(false)}
          onCapture={(capturedDataUrl) => {
            updateMemberProfile(currentMember.id, { photoUrl: capturedDataUrl });
            setIsNavCameraOpen(false);
          }}
          title={`Piga Picha ya Wasifu: ${currentMember.fullName.split(' ')[0]}`}
          subtitle="Picha itasasishwa moja kwa moja kwenye akaunti na kadi yako."
        />
      )}

      {/* Navbar Edit Profile Modal */}
      {currentMember && (
        <MemberEditProfileModal
          member={currentMember}
          isOpen={isNavProfileOpen}
          onClose={() => setIsNavProfileOpen(false)}
        />
      )}
    </header>
  );
};
