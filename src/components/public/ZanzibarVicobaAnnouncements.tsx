import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PublicAdvertisement } from '../../types';
import {
  Megaphone,
  Bell,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Award,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Anchor,
  X,
  Video,
  Image as ImageIcon,
  Play,
  Phone,
  ShieldCheck
} from 'lucide-react';

export const ZanzibarVicobaAnnouncements: React.FC = () => {
  const { publicAds } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'ALL' | 'image' | 'video'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalAnn, setActiveModalAnn] = useState<PublicAdvertisement | null>(null);

  const categories = ['ALL', 'Mikopo na Ruzuku', 'Biashara & Vifaa', 'Mafunzo & Semina', 'Bima & Fedha'];

  // Only show active advertisements on the public site (Active until SuperAdmin changes them)
  const activeAdsList = publicAds.filter(a => a.active);

  const filteredAnnouncements = activeAdsList.filter((ann) => {
    const matchesCategory = selectedCategory === 'ALL' || ann.category === selectedCategory;
    const matchesMediaType = mediaTypeFilter === 'ALL' || ann.mediaType === mediaTypeFilter;
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesMediaType && matchesSearch;
  });

  return (
    <div id="zanzibar-vicoba-announcements" className="space-y-8">
      
      {/* Dynamic Moving Ticker Bar (Matangazo ya Hivi Punde Zanzibar) */}
      <div className="bg-slate-900 text-white rounded-2xl p-3 border border-slate-800 shadow-md flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs shrink-0 animate-pulse">
          <Megaphone className="w-4 h-4" />
          <span>MATANGAZO ZANZIBAR</span>
        </div>

        {/* Scrolling Text Marquee */}
        <div className="overflow-hidden whitespace-nowrap text-xs font-medium text-slate-300 relative w-full">
          <div className="inline-block animate-marquee space-x-8">
            <span>🌊 **Uchumi wa Buluu**: Ruzuku ya TZS 800M kwa VICOBA vya Wakulima wa Mwani na Wavuvi Paje & Pemba!</span>
            <span>🎥 **Video & Picha Rasmi**: Matangazo yote ya biashara na taasisi yanahifadhiwa moja kwa moja na SuperAdmin.</span>
            <span>📍 **Stone Town**: Semina ya Bure ya Uhasibu ya VICOBA kuanzia 10 Agosti Ukumbi wa Bwawani.</span>
            <span>📱 **PBZ Integration**: Vikoba vyote vya Zanzibar sasa vinaweza kupokea ada kupitia PBZ & M-Pesa.</span>
            <span>✨ **ZAVICOBA**: Usajili wa VICOBA mpya kote Unguja na Pemba unaendelea kupitia Portal.</span>
          </div>
        </div>
      </div>

      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span>Matangazo & Fursa za VICOBA na SACCOS Zanzibar</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-300 dark:border-emerald-700">
                Picha & Video Rasmi
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Habari mpya, fursa za ruzuku, video za mafunzo na matangazo ya bidhaa yanayosimamiwa moja kwa moja na Uongozi wa SuperAdmin.
          </p>
        </div>

        {/* Search, Media Type & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-wrap">
          
          {/* Media Type Filter (Zote / Picha / Video) */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setMediaTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                mediaTypeFilter === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Zote
            </button>
            <button
              onClick={() => setMediaTypeFilter('image')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                mediaTypeFilter === 'image'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              <span>Picha</span>
            </button>
            <button
              onClick={() => setMediaTypeFilter('video')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                mediaTypeFilter === 'video'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>Video</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tafuta tangazo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'Makundi Yote' : cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Grid of Announcements Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnnouncements.map((ann) => (
          <div
            key={ann.id}
            className="group rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 overflow-hidden hover:shadow-xl transition-all hover:border-emerald-500/50 flex flex-col justify-between"
          >
            <div>
              {/* Card Banner Image or Video */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                {ann.mediaType === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={ann.mediaUrl}
                      className="w-full h-full object-cover opacity-90"
                      muted
                      loop
                      playsInline
                    />
                    <button
                      onClick={() => setActiveModalAnn(ann)}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 hover:bg-slate-950/20 transition group-hover:scale-105"
                    >
                      <div className="w-13 h-13 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-90">
                        <Play className="w-7 h-7 fill-current translate-x-0.5" />
                      </div>
                      <span className="mt-2 text-[11px] font-bold text-white bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                        Bofya Kutazama Video
                      </span>
                    </button>
                  </div>
                ) : (
                  <img
                    src={ann.mediaUrl}
                    alt={ann.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80";
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Badge Tag & Media Indicator */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                    {ann.mediaType === 'video' ? (
                      <>
                        <Video className="w-3 h-3 text-amber-400" /> VIDEO
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3 h-3 text-sky-400" /> PICHA
                      </>
                    )}
                  </span>
                  {ann.badge && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-md">
                      {ann.badge}
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="absolute bottom-3 left-3 text-white text-[11px] font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{ann.date}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    {ann.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-500" /> Imethibitishwa
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {ann.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {ann.summary}
                </p>

                {/* Location & Org */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ann.businessName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span className="truncate">{ann.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Button */}
            <div className="p-5 pt-0">
              <button
                onClick={() => setActiveModalAnn(ann)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  ann.mediaType === 'video'
                    ? 'bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-slate-950 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-slate-100 dark:bg-slate-700/80 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-800 dark:text-slate-200'
                }`}
              >
                {ann.mediaType === 'video' ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Tazama Video & Maelezo</span>
                  </>
                ) : (
                  <>
                    <span>Soma Maelezo Kamili</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
            Hakuna tangazo lililopatikana kulingana na utafutaji au aina uliyochagua.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Matangazo mapya ya picha na video yatawekwa na SuperAdmin.
          </p>
        </div>
      )}

      {/* Announcement Detail Modal */}
      {activeModalAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full overflow-hidden relative my-8">
            
            {/* Header Media in Modal */}
            <div className="relative h-64 bg-slate-950">
              {activeModalAnn.mediaType === 'video' ? (
                <video
                  src={activeModalAnn.mediaUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={activeModalAnn.mediaUrl}
                  alt={activeModalAnn.title}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={() => setActiveModalAnn(null)}
                className="absolute top-4 right-4 p-2.5 text-white bg-slate-900/80 hover:bg-rose-600 rounded-full transition shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  {activeModalAnn.mediaType === 'video' ? (
                    <Video className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                  )}
                  {activeModalAnn.badge || activeModalAnn.category}
                </span>
                <span className="text-xs text-slate-400">{activeModalAnn.date}</span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {activeModalAnn.title}
              </h3>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white mb-1">{activeModalAnn.summary}</p>
                <p>{activeModalAnn.description}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Taasisi / Biashara: <strong>{activeModalAnn.businessName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-500" />
                  <span>Eneo: <strong>{activeModalAnn.location}</strong></span>
                </div>
                {activeModalAnn.deadline && (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                    <Calendar className="w-4 h-4" />
                    <span>Tarehe ya Marejeleo / Ofa: {activeModalAnn.deadline}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:${activeModalAnn.contact}`}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Piga Simu ({activeModalAnn.contact})</span>
                </a>
                {activeModalAnn.linkUrl && (
                  <a
                    href={activeModalAnn.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-center text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Tovuti</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setActiveModalAnn(null)}
                  className="py-3 px-5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
                >
                  Funga
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

