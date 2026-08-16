import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Building2,
  User,
  Compass,
  Lock,
  BookOpen,
  Scale,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Database,
  Layers,
  Search,
  Printer,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const SystemDocumentation: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState<'overview' | 'superadmin' | 'tenant' | 'member' | 'terms' | 'privacy' | 'apikeys'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto my-6 p-4 sm:p-6 text-xs space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/50 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-black tracking-tight">
                Hati Kamili za Mfumo, Menyu & Sera (Full System Documentation & Policies)
              </h2>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed max-w-3xl">
              Mwongozo rasmi wa matumizi ya Mfumo wa Zanzibar Multi-Tenant VICOBA & SACCOS. Unajumuisha maelekezo ya menyu, haki za watumiaji, sheria na masharti, na sera za faragha za takwimu za kifedha.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Chapa / Hifadhi PDF</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 gap-1 pt-1">
          <button
            onClick={() => setActiveDocTab('overview')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeDocTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Muundo wa Menyu & Muhtasari</span>
          </button>

          <button
            onClick={() => setActiveDocTab('superadmin')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeDocTab === 'superadmin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Mwongozo wa SuperAdmin</span>
          </button>

          <button
            onClick={() => setActiveDocTab('tenant')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeDocTab === 'tenant'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>3. Mwongozo wa Admin wa Taasisi</span>
          </button>

          <button
            onClick={() => setActiveDocTab('member')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeDocTab === 'member'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>4. Mwongozo wa Mwanachama</span>
          </button>

          <button
            onClick={() => setActiveDocTab('terms')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeDocTab === 'terms'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>5. Sheria na Masharti</span>
          </button>

          <button
            onClick={() => setActiveDocTab('privacy')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeDocTab === 'privacy'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>6. Sera ya Faragha & Usalama</span>
          </button>

          <button
            onClick={() => setActiveDocTab('apikeys')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeDocTab === 'apikeys'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>7. Mwongozo wa API Keys & Supabase Auth</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* TAB 1: OVERVIEW & MENU STRUCTURE */}
        {activeDocTab === 'overview' && (
          <div className="space-y-6">
            <div className="border-b pb-4 dark:border-slate-700">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <span>Muundo wa Menyu na Miundombinu ya Mfumo (System Architecture & Navigation)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Mfumo umejengwa kwa mtindo wa Multi-Tenant Cloud Architecture ambapo kila SACCOS au VICOBA inapata eneo lake huru na salama la kiutawala.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-indigo-700 dark:text-indigo-300">
                  <ShieldCheck className="w-4 h-4" />
                  <span>1. Portal ya SuperAdmin</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Menyu ya usimamizi mkuu wa Mfumo wote:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <li>Usimamizi wa Taasisi na Sajili mpya</li>
                  <li>Uwekaji wa Username & Password za kila Taasisi</li>
                  <li>Audit Storage Bucket (24H Automated Daily Reports)</li>
                  <li>Usimamizi wa Bango na Matangazo ya Umma</li>
                  <li>System Logs na Usalama</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-blue-700 dark:text-blue-300">
                  <Building2 className="w-4 h-4" />
                  <span>2. Portal ya Admin wa Taasisi</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Menyu ya usimamizi wa kila siku wa VICOBA/SACCOS:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <li>Usimamizi wa Wanachama & Kutengeneza Passwords zao</li>
                  <li>Usimamizi wa Mikopo na Bodi ya Idhini</li>
                  <li>Uso wa Akiba, Hisa na Faini</li>
                  <li>Uhakiki wa Risiti na Kithibitisho cha Malipo</li>
                  <li>Utabiri wa Akiba (Predictive Analytics with Recharts)</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-emerald-700 dark:text-emerald-300">
                  <User className="w-4 h-4" />
                  <span>3. Portal ya Mwanachama</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Uso binafsi wa mwanachama wa VICOBA au SACCOS:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <li>Kuangalia Salio la Akiba na Hisa</li>
                  <li>Ombi la Mkopo Mpya na Kupendekeza Wadhamini</li>
                  <li>Wasilisha Risiti ya Malipo (M-Pesa, PBZ, Benki)</li>
                  <li>Utabiri wa Ukuaji wa Akiba Binafsi</li>
                  <li>Mobile Simulator ya Simu ya Mkononi</li>
                </ul>
              </div>

            </div>

            {/* Quick Flowchart Box */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Mtiririko wa Kazi wa Mfumo (System Operational Workflow)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black inline-flex items-center justify-center text-xs">1</span>
                  <span className="font-bold block text-slate-900 dark:text-white">SuperAdmin Registration</span>
                  <p className="text-[10px] text-slate-500">SuperAdmin anasajili Taasisi na kuweka Username/Password za Admin wake.</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black inline-flex items-center justify-center text-xs">2</span>
                  <span className="font-bold block text-slate-900 dark:text-white">Institution Setup</span>
                  <p className="text-[10px] text-slate-500">Admin wa Taasisi anaingia na kuweka Wanachama na kuwapa Credentials zao.</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black inline-flex items-center justify-center text-xs">3</span>
                  <span className="font-bold block text-slate-900 dark:text-white">Member Self-Service</span>
                  <p className="text-[10px] text-slate-500">Mwanachama anaingia kwa Password yake, anaweka akiba na kuomba mikopo.</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black inline-flex items-center justify-center text-xs">4</span>
                  <span className="font-bold block text-slate-900 dark:text-white">24H Audit & Analytics</span>
                  <p className="text-[10px] text-slate-500">Cron inafanya kazi kila masaa 24 na kuhifadhi ripoti kwenye Cloud Bucket.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUPERADMIN MANUAL */}
        {activeDocTab === 'superadmin' && (
          <div className="space-y-5">
            <div className="border-b pb-4 dark:border-slate-700">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Mwongozo Rasmi wa SuperAdmin (SuperAdmin Operational Manual)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Jinsi SuperAdmin anavyoweza kuendesha Mfumo, kusajili Taasisi, kuweka Password za Admin, na kagua Daily Audit Bucket Reports.
              </p>
            </div>

            <div className="space-y-4 leading-relaxed text-slate-700 dark:text-slate-300">
              
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                  Hatua ya 1: Kusajili na Kuweka Username na Password kwa kila Taasisi
                </h4>
                <p className="text-xs">
                  Ili kumpa uwezo Admin wa Taasisi mpya au iliyopo kuingia katika mfumo:
                </p>
                <ol className="list-decimal list-inside space-y-1 pl-2 text-xs">
                  <li>Fungua Tab ya <strong>"Taasisi (Tenants)"</strong> katika Portal ya SuperAdmin.</li>
                  <li>Bofya batani ya <strong>"Sajili Taasisi Mpya"</strong> au Bofya <strong>"Weka Neno la Siri"</strong> pembezoni mwa Taasisi husika.</li>
                  <li>Jaza <strong>Username</strong> ya Admin (mf. <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">admin_intelleza</code>) na <strong>Password</strong> ya ulinzi.</li>
                  <li>Bofya <strong>"Hifadhi Mabadiliko"</strong>. Mfumo utazalisha credentials na kuzihifadhi salama.</li>
                </ol>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                  Hatua ya 2: Usimamizi wa Cloud Storage Bucket (24H Daily Audit Engine)
                </h4>
                <p className="text-xs">
                  SuperAdmin anaweza kufuatilia ripoti za ukaguzi zilizohifadhiwa kila masaa 24:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                  <li>Fungua sehemu ya <strong>"24H Audit Reports Bucket"</strong>.</li>
                  <li>Tazama ripoti ya hivi karibuni, Health Score (0-100), na Risk Index (%).</li>
                  <li>Bofya <strong>"Kagua Analysis"</strong> ili kuona maelezo ya kina ya AI ya Swahili/English executive summary.</li>
                  <li>Pakua muhtasari kwa mfumo wa <strong>CSV</strong> au <strong>JSON</strong> kwa ajili ya Bodi.</li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: TENANT ADMIN MANUAL */}
        {activeDocTab === 'tenant' && (
          <div className="space-y-5">
            <div className="border-b pb-4 dark:border-slate-700">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Mwongozo wa Admin wa Taasisi (Institution Admin Manual)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Jinsi Admin wa SACCOS/VICOBA anavyoweka Wanachama, anavyowapa Username/Password, na kusimamia miamala.
              </p>
            </div>

            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                  Hatua ya 1: Kuweka Username na Password kwa kila Mwanachama
                </h4>
                <p className="text-xs">
                  Kama Admin wa Taasisi, una uwezo wa kuwapa wanachama wako taarifa za kuingilia katika Mfumo:
                </p>
                <ol className="list-decimal list-inside space-y-1 pl-2 text-xs">
                  <li>Aina katika Portal ya Taasisi yako na ufungue Tab ya <strong>"Wanachama"</strong>.</li>
                  <li>Katika orodha ya Wanachama, bofya icon ya ufunguo 🔑 au <strong>"Set Credentials"</strong> kwenye mstari wa mwanachama husika.</li>
                  <li>Weka <strong>Username</strong> ya Mwanachama (mf. <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">juma_kassim</code>) na <strong>Password</strong> (mf. <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">Password123!</code>).</li>
                  <li>Bofya <strong>"Hifadhi & Tuma SMS Notification"</strong>. Mwanachama atapokea taarifa zake na ataweza kuingia kwenye Portal yake.</li>
                </ol>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                  Hatua ya 2: Usimamizi wa Mikopo & Recharts Predictive Analytics
                </h4>
                <p className="text-xs">
                  Uso wa Dashboard ya Admin unajumuisha chati ya kisasa ya <strong>Predictive Analytics (Recharts)</strong> inayotabiri ukuaji wa akiba kwa miezi 6 ijayo, kukusaidia kupanga mikopo iliyosalia.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: MEMBER MANUAL */}
        {activeDocTab === 'member' && (
          <div className="space-y-5">
            <div className="border-b pb-4 dark:border-slate-700">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                <span>Mwongozo wa Mwanachama (Member Self-Service Manual)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Jinsi mwanachama anavyoingia katika Portal yake, anavyoweka akiba, na kuomba mikopo.
              </p>
            </div>

            <div className="space-y-4 text-slate-700 dark:text-slate-300">
              
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  1. Kuingia Katika Portal
                </h4>
                <p className="text-xs">
                  Ingia kwa kutumia Username/Namba ya Mwanachama na Password uliyopewa na VICOBA/SACCOS yako. Unaweza pia kutumia Simu Simulator kwenye kioo cha kulia.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  2. Kuwasilisha Kithibitisho cha Malipo (Receipt Proof Upload)
                </h4>
                <p className="text-xs">
                  Baada ya kulipia Akiba au Mkopo kupitia M-Pesa au PBZ, bofya <strong>"Wasilisha Risiti"</strong>, weka namba ya Muamala na picha/kielelezo cha risiti. Admin ataipitia na kuidhinisha.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: TERMS OF SERVICE */}
        {activeDocTab === 'terms' && (
          <div className="space-y-5 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
            <div className="border-b pb-4 dark:border-slate-700">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <span>Sheria na Masharti ya Matumizi ya Mfumo (Terms of Service - Zanzibar)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Ilisasishwa rasmi: 26 Julai 2026 • Inazingatia Sheria za Vyama vya Ushirika Zanzibar (Cooperative Societies Act).
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white">1. Kazi na Haki za SuperAdmin</h4>
              <p>
                SuperAdmin ndiye msimamizi mkuu wa miundombinu ya teknolojia na anawajibika kuhakikisha mfumo unapatikana 99.9% (Uptime Availability). SuperAdmin ndiye pekee mwenye uwezo wa kusajili na kuweka taarifa za uingiaji za kila Admin wa Taasisi.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white">2. Wajibu wa Admin wa Taasisi (SACCOS / VICOBA)</h4>
              <p>
                Admin wa Taasisi anawajibika kwa usahihi wa taarifa za wanachama, marejesho ya mikopo, na kuweka credentials za uingiaji za kila mwanachama husika. Ni marufuku kutoa password za uongozi kwa mtu asiyehusika.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white">3. Miamala ya Kifedha na Risiti</h4>
              <p>
                Miamala yote inayopitia M-Pesa, PBZ Bank, GePG, na benki nyingine lazima ithibitishwe na kithibitisho halali cha muamala kabla ya salio kuongezwa kwenye akaunti ya mwanachama.
              </p>
            </div>
          </div>
        )}

        {/* TAB 6: PRIVACY POLICY */}
        {activeDocTab === 'privacy' && (
          <div className="space-y-5 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
            <div className="border-b pb-4 dark:border-slate-700">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <span>Sera ya Faragha na Usalama wa Takwimu (Data Privacy & Protection Policy)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Inalinda takwimu binafsi na za kifedha kwa mujibu wa Sheria ya Hifadhi ya Takwimu Binafsi.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white">1. Ulinzi wa Takwimu za Wanachama</h4>
              <p>
                Takwimu zote za Wanachama (NIDA, Namba za Simu, Akiba na Mikopo) zimehifadhiwa kwenye Cloud Storage zikiwa na usimbaji fiche wa <strong>AES-256 Bit Encryption</strong>.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white">2. Usalama wa Cloud Audit Storage Bucket</h4>
              <p>
                Ripoti za kila masaa 24 zinazozalishwa na Mfumo zinalindwa kwa Google Cloud IAM Security Policies, na hakuna Taasisi inayoweza kuona data au miamala ya Taasisi nyingine (Strict Multi-Tenant Isolation).
              </p>
            </div>
          </div>
        )}

        {/* TAB 7: API KEYS & SUPABASE AUTH SPECS */}
        {activeDocTab === 'apikeys' && (
          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
            <div className="border-b pb-4 dark:border-slate-700">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Mwongozo wa API Keys, Integrations & Supabase Auth Specifications</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Maelekezo rasmi ya kiufundi ya miundombinu ya REST API Keys, C2B Paygateways, na Supabase Auth Password Reset.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>1. Supabase Auth REST Client & Password Recovery</span>
                </h4>
                <p className="text-[11px]">
                  Mfumo unatumia Supabase REST Auth Endpoint kwa ajili ya independent password recovery kwa Tenant Admins na Wanachama:
                </p>
                <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto space-y-1">
                  <p>VITE_SUPABASE_URL=https://app-isaccos-v1.supabase.co</p>
                  <p>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
                </div>
                <p className="text-[10px] text-slate-500">
                  Urejesho unatuma 6-digit verification code au SSL Magic Link moja kwa moja kwenye Barua Pepe ya mtumiaji, bila kuhitaji SuperAdmin kuweka upya.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>2. GePG & Mobile Money C2B API Gateway</span>
                </h4>
                <p className="text-[11px]">
                  Inadhibiti uzalishaji wa GePG Control Numbers na malipo ya M-Pesa, PBZ Bank, Tigo Pesa na Airtel Money:
                </p>
                <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto space-y-1">
                  <p>GEPG_SP_CODE=SP99201</p>
                  <p>GEPG_SYSTEM_ID=ZNZ-VICOBA-SYS-2026</p>
                  <p>MPESA_SHORTCODE=550201</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>3. NIDA Citizen Verification API</span>
                </h4>
                <p className="text-[11px]">
                  Uhakiki wa NIDA wa wanachama wapya unakwenda kwa NIDA REST Endpoint kupitia NIDA Bearer Token SSL encrypted channel:
                </p>
                <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto space-y-1">
                  <p>NIDA_API_ENDPOINT=https://api.nida.go.tz/v1/verify</p>
                  <p>NIDA_AUTH_TOKEN=nd_sec_live_992012026...</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>4. Gemini AI Predictive Engine Key</span>
                </h4>
                <p className="text-[11px]">
                  Inatumika server-side proxied pekee kwa ajili ya kufanya Swahili Executive Summaries na 24H Audit Reports:
                </p>
                <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl overflow-x-auto space-y-1">
                  <p>GEMINI_API_KEY=AIzaSyA2026_LiveKey...</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
