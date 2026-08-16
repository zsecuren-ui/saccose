import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { InstitutionType } from '../../types';
import { compressDataUrl } from '../../lib/imageUtils';
import {
  Building2,
  Camera,
  Upload,
  Image as ImageIcon,
  Palette,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Globe,
  Save,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Trash2,
  Info,
  Calendar
} from 'lucide-react';

const PRESET_LOGOS = [
  {
    name: 'Nembo ya Ushirika (Kijani & Dhahabu)',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Nembo ya Benki ya Jamii (Kizanzibari)',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Nembo ya Maendeleo & Uwekezaji',
    url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Nembo ya Kilimo na Ushirika (AMCOS)',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Nembo ya Fedha za Jamii (VICOBA Hub)',
    url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=200'
  }
];

const PRESET_BANNERS = [
  {
    name: 'Zanzibar Stone Town & Bahari',
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1200'
  },
  {
    name: 'Ushirika na Maendeleo ya Kifedha',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200'
  },
  {
    name: 'Uchumi wa Kijani na Kilimo Endelevu',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200'
  }
];

const COLOR_PALETTES = [
  { name: 'Emerald (Kijani cha Ushirika)', hex: '#0d9488' },
  { name: 'Sapphire (Bluu ya Kifalme)', hex: '#0284c7' },
  { name: 'Indigo (Zambarau ya Kisasa)', hex: '#6366f1' },
  { name: 'Sunset (Dhahabu ya Kizanzibari)', hex: '#d97706' },
  { name: 'Ruby (Nyekundu ya Kifahari)', hex: '#e11d48' },
  { name: 'Deep Navy (Kijeshi/Kiserikali)', hex: '#0f172a' }
];

export const BrandingSettings: React.FC = () => {
  const { currentInstitution, updateInstitution, updateInstitutionCredentials, addNotification } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'contact' | 'branding' | 'bank' | 'security'>('profile');

  // Form states
  const [name, setName] = useState(currentInstitution.name || '');
  const [type, setType] = useState<InstitutionType>(currentInstitution.type || 'SACCOS');
  const [registrationNumber, setRegistrationNumber] = useState(currentInstitution.registrationNumber || '');
  const [motto, setMotto] = useState(currentInstitution.motto || 'Umoja ni Nguvu • Akiba na Maendeleo');
  const [description, setDescription] = useState(currentInstitution.description || 'Taasisi ya kifedha inayojitolea kukuza uchumi na ustawi wa wanachama wake visiwani Zanzibar.');
  const [foundedYear, setFoundedYear] = useState(currentInstitution.foundedYear || '2019');
  
  // Photo & Banner states
  const [logo, setLogo] = useState(currentInstitution.logo || '');
  const [bannerUrl, setBannerUrl] = useState(currentInstitution.bannerUrl || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1200');
  const [logoInputType, setLogoInputType] = useState<'upload' | 'url' | 'presets'>('upload');
  
  // Contact & Location states
  const [phone, setPhone] = useState(currentInstitution.phone || '+255 777 000 111');
  const [email, setEmail] = useState(currentInstitution.email || 'info@saccos.co.tz');
  const [region, setRegion] = useState(currentInstitution.region || 'Mjini Magharibi, Unguja');
  const [address, setAddress] = useState(currentInstitution.address || 'Barabara ya Mlandege, Mjini Zanzibar');
  const [website, setWebsite] = useState(currentInstitution.website || `https://${currentInstitution.domain || 'saccos.co.tz'}`);

  // Branding states
  const [primaryColor, setPrimaryColor] = useState(currentInstitution.primaryColor || '#0d9488');

  // Bank states
  const [bankName, setBankName] = useState(currentInstitution.bankName || 'PBZ (People\'s Bank of Zanzibar)');
  const [bankAccountNumber, setBankAccountNumber] = useState(currentInstitution.bankAccountNumber || '');
  const [bankAccountName, setBankAccountName] = useState(currentInstitution.bankAccountName || currentInstitution.name);

  // Security / Admin Credentials state
  const [adminUsername, setAdminUsername] = useState(currentInstitution.adminUsername || 'admin');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image File Upload (Logo)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Tafadhali chagua picha yenye ukubwa usiozidi 3MB.');
        return;
      }
      // Compress logo to reasonable dimensions before storing
      (async () => {
        try {
          const data = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.onerror = rej;
            r.readAsDataURL(file);
          });
          const compressed = await compressDataUrl(data, 800, 800, 0.8, 'image/jpeg');
          setLogo(compressed);
        } catch (err) {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') setLogo(reader.result);
          };
          reader.readAsDataURL(file);
        }
      })();
    }
  };

  // Handle Banner File Upload
  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Tafadhali chagua picha ya jalada isiyozidi 5MB.');
        return;
      }
      (async () => {
        try {
          const data = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.onerror = rej;
            r.readAsDataURL(file);
          });
          const compressed = await compressDataUrl(data, 1400, 700, 0.85, 'image/jpeg');
          setBannerUrl(compressed);
        } catch (err) {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') setBannerUrl(reader.result);
          };
          reader.readAsDataURL(file);
        }
      })();
    }
  };

  // Handle Save All Profile Settings
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Handle Password Change if entered
    if (newPassword.trim() || adminUsername !== currentInstitution.adminUsername) {
      if (newPassword.trim() && newPassword.length < 6) {
        setPasswordError('Nenosiri lazima liwe na angalau herufi 6.');
        return;
      }
      if (newPassword && newPassword !== confirmPassword) {
        setPasswordError('Nenosiri jipya na uthibitisho havilingani!');
        return;
      }
      if (newPassword.trim()) {
        updateInstitutionCredentials(currentInstitution.id, adminUsername, newPassword);
      }
    }

    // Update entire institution object
    updateInstitution(currentInstitution.id, {
      name: name.trim(),
      type,
      registrationNumber: registrationNumber.trim(),
      motto: motto.trim(),
      description: description.trim(),
      foundedYear: foundedYear.trim(),
      logo: logo || currentInstitution.logo,
      bannerUrl: bannerUrl || currentInstitution.bannerUrl,
      phone: phone.trim(),
      email: email.trim(),
      region: region.trim(),
      address: address.trim(),
      website: website.trim(),
      primaryColor,
      bankName,
      bankAccountNumber: bankAccountNumber.trim(),
      bankAccountName: bankAccountName.trim(),
      adminUsername: adminUsername.trim()
    });

    addNotification({
      title: 'Wasifu wa Taasisi Umeboreshwa',
      message: `Taarifa, picha na mipangilio ya ${name} zimehifadhiwa kikamilifu.`,
      type: 'success',
      targetRole: 'tenantadmin',
      tenantId: currentInstitution.id,
      category: 'member',
      linkTab: 'branding'
    });

    setSavedMessage('Wasifu, picha na taarifa zote za taasisi zimehifadhiwa kikamilifu!');
    setTimeout(() => {
      setSavedMessage(null);
    }, 4500);
  };

  return (
    <div id="institution-profile-settings-view" className="space-y-6 text-xs max-w-6xl mx-auto pb-12">
      
      {/* Top Banner & Header Information */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        
        {/* Cover Photo Banner */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-800 overflow-hidden group">
          <img
            src={bannerUrl || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1200'}
            alt="Jalada la Taasisi"
            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
          
          <button
            type="button"
            onClick={() => bannerFileInputRef.current?.click()}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all border border-white/20 shadow-lg cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Badilisha Picha ya Jalada (Cover)</span>
          </button>
          <input
            type="file"
            ref={bannerFileInputRef}
            onChange={handleBannerFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Profile Identity Bar */}
        <div className="p-6 sm:px-8 pb-8 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          
          {/* Logo & Basic Titles */}
          <div className="flex items-end gap-4 z-10">
            <div className="relative group shrink-0">
              <img
                src={logo || currentInstitution.logo}
                alt={name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'SACCOS')}&background=0d9488&color=fff&size=200`;
                }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover bg-white dark:bg-slate-900 p-1.5 shadow-2xl border-4 border-white dark:border-slate-800"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold transition-opacity cursor-pointer backdrop-blur-xs"
              >
                <Camera className="w-5 h-5 mb-0.5 text-emerald-300" />
                <span>Pakia Picha</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="space-y-1 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {name || 'Jina la Taasisi'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-300 dark:border-emerald-700">
                  {type}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                  Reg: {registrationNumber || 'Haina Namba'}
                </span>
              </div>
              <p className="text-xs italic text-slate-500 dark:text-slate-400 max-w-xl">
                &ldquo;{motto || 'Umoja ni Nguvu'}&rdquo;
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {region}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-600" /> {phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> Ilianzishwa: {foundedYear}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="sm:self-end shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveProfile}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Hifadhi Mabadiliko</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-2 overflow-x-auto">
          {[
            { id: 'profile', label: 'Wasifu & Picha ya Taasisi', icon: <Building2 className="w-4 h-4" /> },
            { id: 'contact', label: 'Mawasiliano na Eneo', icon: <MapPin className="w-4 h-4" /> },
            { id: 'branding', label: 'Rangi & Chapa', icon: <Palette className="w-4 h-4" /> },
            { id: 'bank', label: 'Akaunti za Benki (PBZ/CRDB)', icon: <CreditCard className="w-4 h-4" /> },
            { id: 'security', label: 'Nenosiri la Admin', icon: <Lock className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3.5 font-bold text-xs border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 rounded-2xl font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{savedMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono tracking-wider">
            Imehifadhiwa
          </span>
        </div>
      )}

      {/* Main Settings Body */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* TAB 1: WASIFU & PICHA YA TAASISI */}
        {activeSubTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Photo & Logo Manager */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-5 lg:col-span-1 shadow-sm">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  Picha & Nembo ya Taasisi
                </h3>
              </div>

              {/* Current Preview */}
              <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="relative">
                  <img
                    src={logo || currentInstitution.logo}
                    alt="Logo Preview"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'SACCOS')}&background=0d9488&color=fff&size=200`;
                    }}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md bg-white p-1"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-full shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{name || 'Picha Rasmi'}</p>
                  <p className="text-[10px] text-slate-500">Inaonekana kwenye risiti, ripoti na kadi za wanachama</p>
                </div>
              </div>

              {/* Upload or Choose Input Type */}
              <div className="space-y-3">
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setLogoInputType('upload')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${logoInputType === 'upload' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Pakia Faili
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoInputType('url')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${logoInputType === 'url' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Weka Link (URL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoInputType('presets')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${logoInputType === 'presets' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs' : 'text-slate-500'}`}
                  >
                    Nembo Tayari
                  </button>
                </div>

                {logoInputType === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/50 group"
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">Bofya hapa kupakia picha</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, au WEBP (Isizidi 3MB)</p>
                  </div>
                )}

                {logoInputType === 'url' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">URL ya Picha / Logo:</label>
                    <input
                      type="url"
                      placeholder="https://mfano.com/picha-ya-saccos.png"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {logoInputType === 'presets' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Chagua Nembo ya Mfano:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_LOGOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLogo(p.url)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 hover:border-emerald-500 transition-all cursor-pointer ${logo === p.url ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-bold' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'}`}
                        >
                          <img src={p.url} alt={p.name} className="w-7 h-7 rounded-lg object-cover" />
                          <span className="text-[10px] truncate text-slate-800 dark:text-slate-200">{p.name.split('(')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reset to Avatar */}
              <button
                type="button"
                onClick={() => setLogo(`https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'SACCOS')}&background=0d9488&color=fff&size=200`)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 text-[11px] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Weka Nembo ya Kiotomatiki (Auto Avatar)</span>
              </button>
            </div>

            {/* Right 2 Cols: Main Institution Profile Details */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-5 lg:col-span-2 shadow-sm">
              <div className="border-b pb-3 border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Maelezo ya Msingi ya Taasisi (Institutional Identity)
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Taarifa Rasmi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Jina Rasmi la Taasisi / Kikundi *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mfano: Intelleza SACCOS Ltd"
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Institution Type */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Aina ya Taasisi ya Ushirika *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as InstitutionType)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="SACCOS">SACCOS (Chama cha Ushirika cha Akiba na Mikopo)</option>
                    <option value="VICOBA">VICOBA (Kikundi cha Benki ya Jamii Vijijini)</option>
                    <option value="AMCOS">AMCOS (Chama cha Ushirika cha Kilimo)</option>
                    <option value="MICROFINANCE">MICROFINANCE (Taasisi Ndogo ya Kifedha)</option>
                  </select>
                </div>

                {/* Registration Number */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Namba ya Usajili wa Serikali / Vyama *</label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="Mfano: ZNZ/SACCOS/2024/0082"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                {/* Slogan / Motto */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Kaulimbiu / Wito wa Taasisi (Motto / Slogan)</label>
                  <input
                    type="text"
                    value={motto}
                    onChange={(e) => setMotto(e.target.value)}
                    placeholder="Mfano: Umoja ni Nguvu, Akiba ni Maendeleo ya Zanzibar"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Maelezo na Dira ya Taasisi (About / Mission)</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Eleza kwa ufupi malengo ya SACCOS/VICOBA yako..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed"
                  />
                </div>

                {/* Founded Year */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Mwaka wa Kuanzishwa</label>
                  <input
                    type="text"
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value)}
                    placeholder="2020"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                {/* Default Currency */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Sarafu Kuu ya Hesabu</label>
                  <input
                    type="text"
                    disabled
                    value="TZS (Tanzanian Shilling)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 text-slate-500 font-bold"
                  />
                </div>

              </div>

              {/* Bottom Quick Save Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Hifadhi Wasifu wa Taasisi
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MAWASILIANO & ENEO LA OFISI */}
        {activeSubTab === 'contact' && (
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
            <div className="border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Mawasiliano na Eneo la Kijiografia (Office Location & Contacts)
              </h3>
              <p className="text-slate-500 text-xs mt-1">Taarifa hizi zinaonekana kwenye taarifa za wanachama na risiti za malipo.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Namba Rasmi ya Simu (Official Phone) *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 777 123 456"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  Barua Pepe Rasmi (Official Email) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@saccos.co.tz"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  Mkoa & Eneo (Region / Island) *
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Mjini Magharibi, Unguja">Mjini Magharibi, Unguja</option>
                  <option value="Kaskazini Unguja">Kaskazini Unguja</option>
                  <option value="Kusini Unguja">Kusini Unguja</option>
                  <option value="Chake Chake, Pemba">Chake Chake, Pemba</option>
                  <option value="Wete, Pemba Kaskazini">Wete, Pemba Kaskazini</option>
                  <option value="Mkoani, Pemba Kusini">Mkoani, Pemba Kusini</option>
                  <option value="Dar es Salaam">Dar es Salaam</option>
                  <option value="Arusha">Arusha</option>
                  <option value="Mkoa Mwingine">Mkoa Mwingine</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  Anwani ya Ofisi & Mtaa (Street & Building Address)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mfano: Jengo la Ushirika, Mlandege Ghorofa ya 2, Zanzibar"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  Tovuti / Tovuti ya Taasisi (Website URL)
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://saccos-yako.co.tz"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs"
                />
              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                Hifadhi Mawasiliano & Eneo
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: RANGI & CHAPA (BRANDING) */}
        {activeSubTab === 'branding' && (
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
            <div className="border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-600" />
                Rangi ya Chapa na Muonekano wa Mfumo (Brand Theme & Styling)
              </h3>
              <p className="text-slate-500 text-xs mt-1">Chagua rangi inayotambulisha taasisi yako (White-label).</p>
            </div>

            <div className="space-y-4">
              <label className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                Chagua Palette ya Rangi za Ushirika:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COLOR_PALETTES.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrimaryColor(c.hex)}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                      primaryColor === c.hex
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-slate-50 dark:bg-slate-900 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full shadow-inner border border-white shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="text-left">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{c.name.split('(')[0]}</p>
                      <p className="font-mono text-[10px] text-slate-400">{c.hex}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <label className="font-bold text-slate-700 dark:text-slate-300">Au Chagua Rangi Nyingine:</label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent p-0.5"
                />
                <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border">
                  {primaryColor}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                Hifadhi Rangi za Chapa
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: AKAUNTI ZA BENKI */}
        {activeSubTab === 'bank' && (
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
            <div className="border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Taarifa za Benki Kuu ya Taasisi (Bank Accounts & Disbursals)
              </h3>
              <p className="text-slate-500 text-xs mt-1">Akaunti hizi hutumika kupokea amana za akiba na kutoa mikopo kwa wanachama.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Jina la Benki ya Ushirika *</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                >
                  <option value="PBZ (People's Bank of Zanzibar)">PBZ (People's Bank of Zanzibar) - Benki ya Watu wa Zanzibar</option>
                  <option value="CRDB Bank">CRDB Bank</option>
                  <option value="NMB Bank">NMB Bank</option>
                  <option value="NBC Bank">NBC Bank (National Bank of Commerce)</option>
                  <option value="Absa Bank Tanzania">Absa Bank Tanzania</option>
                  <option value="Exim Bank">Exim Bank</option>
                  <option value="Azania Bank">Azania Bank</option>
                  <option value="Equity Bank">Equity Bank</option>
                  <option value="Stanbic Bank">Stanbic Bank</option>
                  <option value="Benki Nyingine ya Ushirika">Benki Nyingine ya Ushirika</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Namba ya Akaunti ya Benki *</label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: 040098765432"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-black text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Jina la Akaunti ya Benki (Account Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: INTELLEZA SACCOS LIMITED"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                Hifadhi Taarifa za Benki
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: USALAMA NA NENOSIRI LA ADMIN */}
        {activeSubTab === 'security' && (
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm max-w-2xl">
            <div className="border-b pb-3 border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Usalama na Taarifa za Kuingia za Admin (Admin Credentials)
              </h3>
              <p className="text-slate-500 text-xs mt-1">Badilisha Username au Nenosiri la kuingia kwenye Portal ya Taasisi hii.</p>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 rounded-xl font-bold text-xs">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Jina la Mtumiaji (Username ya Admin)</label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Nenosiri Jipya (Acha tupu kama hubadilishi)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Weka nenosiri jipya..."
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {newPassword.trim().length > 0 && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Thibitisha Nenosiri Jipya</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Andika tena nenosiri jipya..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}

            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                Hifadhi Usalama wa Admin
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};
