import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PublicAdvertisement } from '../../types';
import {
  Megaphone,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Phone,
  ExternalLink,
  Tag,
  Upload,
  Play,
  Film,
  Sparkles,
  Info
} from 'lucide-react';

export const SuperAdminAdManager: React.FC = () => {
  const { publicAds, addPublicAd, updatePublicAd, deletePublicAd, togglePublicAdStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video' | 'active'>('all');
  const [showModal, setShowModal] = useState(false);
  const [previewAd, setPreviewAd] = useState<PublicAdvertisement | null>(null);
  const [editingAd, setEditingAd] = useState<PublicAdvertisement | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    businessName: '',
    category: 'Biashara & Vifaa',
    mediaType: 'image' as 'image' | 'video',
    mediaUrl: '',
    summary: '',
    description: '',
    badge: 'Ofa Mpya',
    location: 'Zanzibar Nzima',
    deadline: '',
    contact: '+255 ',
    linkUrl: '',
    active: true
  });

  const sampleImages = [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556742049-0a67dd37397c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'
  ];

  const sampleVideos = [
    'https://www.w3schools.com/html/mov_bbb.mp4',
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  ];

  const handleOpenAddModal = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      businessName: '',
      category: 'Biashara & Vifaa',
      mediaType: 'image',
      mediaUrl: sampleImages[0],
      summary: '',
      description: '',
      badge: 'Matangazo Rasmi',
      location: 'Zanzibar & Tanzania',
      deadline: '2026-12-31',
      contact: '+255 777 000 111',
      linkUrl: 'https://',
      active: true
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (ad: PublicAdvertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      businessName: ad.businessName,
      category: ad.category,
      mediaType: ad.mediaType,
      mediaUrl: ad.mediaUrl,
      summary: ad.summary,
      description: ad.description,
      badge: ad.badge || '',
      location: ad.location,
      deadline: ad.deadline || '',
      contact: ad.contact,
      linkUrl: ad.linkUrl || '',
      active: ad.active
    });
    setShowModal(true);
  };

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video');
      const mockUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        mediaType: isVid ? 'video' : 'image',
        mediaUrl: mockUrl
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.businessName || !formData.mediaUrl) {
      alert('Tafadhali jaza kichwa cha habari, jina la biashara na picha/video URL.');
      return;
    }

    if (editingAd) {
      updatePublicAd(editingAd.id, {
        title: formData.title,
        businessName: formData.businessName,
        category: formData.category,
        mediaType: formData.mediaType,
        mediaUrl: formData.mediaUrl,
        summary: formData.summary,
        description: formData.description,
        badge: formData.badge,
        location: formData.location,
        deadline: formData.deadline,
        contact: formData.contact,
        linkUrl: formData.linkUrl,
        active: formData.active
      });
    } else {
      addPublicAd({
        title: formData.title,
        businessName: formData.businessName,
        category: formData.category,
        mediaType: formData.mediaType,
        mediaUrl: formData.mediaUrl,
        summary: formData.summary,
        description: formData.description,
        badge: formData.badge,
        location: formData.location,
        deadline: formData.deadline,
        contact: formData.contact,
        linkUrl: formData.linkUrl,
        active: formData.active
      });
    }

    setShowModal(false);
  };

  const filteredAds = publicAds.filter(ad => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (mediaFilter === 'image') return ad.mediaType === 'image';
    if (mediaFilter === 'video') return ad.mediaType === 'video';
    if (mediaFilter === 'active') return ad.active;
    return true;
  });

  const totalAds = publicAds.length;
  const activeAds = publicAds.filter(a => a.active).length;
  const videoAds = publicAds.filter(a => a.mediaType === 'video').length;
  const imageAds = publicAds.filter(a => a.mediaType === 'image').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
              <Megaphone className="w-5 h-5 text-indigo-400" />
              <span>Usimamizi Mkuu wa Matangazo ya Biashara (Global Ad Hub)</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Matangazo ya Public Landing Site & Hero Carousel
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              SuperAdmin ana mamlaka ya pekee ya kuweka, kubadilisha, kusitisha, au kufuta matangazo ya picha na video. Matangazo haya <strong>hubaki hewani bila kufutika kiotomatiki</strong> hadi yatakapobadilishwa hapa.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition transform active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Weka Tangazo Jipya</span>
          </button>
        </div>

        {/* Permanent Guarantee Notice */}
        <div className="mt-4 p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-xl flex items-center gap-3 text-xs text-indigo-200">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>🔒 Kanuni ya Kudumu ya Mfumo:</strong> Picha na video zote zilizopo hapa zinaonekana moja kwa moja kwenye Hero Carousel na Zanzibar Matangazo Hub bila kuondoka zenyewe. Mabadiliko yoyote hufanywa na SuperAdmin tu.
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
            <span className="text-xs text-slate-300">Jumla ya Matangazo</span>
            <div className="text-2xl font-bold text-white">{totalAds}</div>
          </div>
          <div className="bg-emerald-500/10 backdrop-blur-md p-4 rounded-xl border border-emerald-500/20">
            <span className="text-xs text-emerald-300">Yaliyo Hewani (Active)</span>
            <div className="text-2xl font-bold text-emerald-400">{activeAds}</div>
          </div>
          <div className="bg-amber-500/10 backdrop-blur-md p-4 rounded-xl border border-amber-500/20">
            <span className="text-xs text-amber-300">Matangazo ya Video</span>
            <div className="text-2xl font-bold text-amber-400">{videoAds}</div>
          </div>
          <div className="bg-sky-500/10 backdrop-blur-md p-4 rounded-xl border border-sky-500/20">
            <span className="text-xs text-sky-300">Matangazo ya Picha</span>
            <div className="text-2xl font-bold text-sky-400">{imageAds}</div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tafuta kulingana na jina, biashara au aina..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setMediaFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              mediaFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Yote ({totalAds})
          </button>
          <button
            onClick={() => setMediaFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              mediaFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Hewa (Active) ({activeAds})
          </button>
          <button
            onClick={() => setMediaFilter('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              mediaFilter === 'image'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Picha ({imageAds})
          </button>
          <button
            onClick={() => setMediaFilter('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              mediaFilter === 'video'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Video ({videoAds})
          </button>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredAds.map(ad => (
          <div
            key={ad.id}
            className={`bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden shadow-md transition hover:shadow-xl ${
              ad.active
                ? 'border-slate-200 dark:border-slate-700'
                : 'border-rose-300 dark:border-rose-900/50 opacity-75'
            }`}
          >
            {/* Media Box */}
            <div className="relative h-48 bg-slate-900 group">
              {ad.mediaType === 'video' ? (
                <video
                  src={ad.mediaUrl}
                  controls={false}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={ad.mediaUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Media Overlay Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                  {ad.mediaType === 'video' ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-amber-400" /> VIDEO
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" /> PICHA
                    </>
                  )}
                </span>
                {ad.badge && (
                  <span className="bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                    {ad.badge}
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => togglePublicAdStatus(ad.id)}
                  title="Bofya kubadilisha hewani / zima"
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md transition ${
                    ad.active
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-rose-600 text-white hover:bg-rose-700'
                  }`}
                >
                  {ad.active ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" /> Inactive
                    </>
                  )}
                </button>
              </div>

              {/* Play Button Overlay for Videos */}
              {ad.mediaType === 'video' && (
                <button
                  onClick={() => setPreviewAd(ad)}
                  className="absolute inset-0 flex items-center justify-center bg-slate-900/40 hover:bg-slate-900/20 transition group-hover:scale-110"
                >
                  <div className="w-12 h-12 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  </div>
                </button>
              )}
            </div>

            {/* Body Info */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                <span className="bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  {ad.category}
                </span>
                <span className="text-slate-400">{ad.date}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
                {ad.title}
              </h3>

              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                🏢 {ad.businessName}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {ad.summary}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{ad.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{ad.contact}</span>
                </div>
                {ad.deadline && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Mwisho: {ad.deadline}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewAd(ad)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Kagua Details</span>
                </button>

                <button
                  onClick={() => handleOpenEditModal(ad)}
                  className="flex items-center gap-1 py-2 px-3 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-semibold rounded-lg transition border border-indigo-200 dark:border-indigo-800"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Badilisha</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Je, unao uhakika unataka kufuta tangazo la "${ad.title}"?`)) {
                      deletePublicAd(ad.id);
                    }
                  }}
                  className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg transition border border-rose-200 dark:border-rose-900/50"
                  title="Futa Tangazo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAds.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <Megaphone className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
            <p className="text-slate-600 dark:text-slate-300 font-bold">Hakuna matangazo yaliyopatikana</p>
            <p className="text-xs text-slate-400 mt-1">Bofya kitufe cha "+ Weka Tangazo Jipya" kuanzisha tangazo la biashara au shirika.</p>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT ADVERTISEMENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingAd ? 'Badilisha Tangazo la Umma' : 'Weka Tangazo Jipya la Biashara'}
                  </h3>
                  <p className="text-xs text-slate-500">Litaonekana kwenye Zanzibar VICOBA & Public Landing page</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kichwa cha Tangazo (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: Ofa ya Fursa ya Mikopo ya Mwani"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jina la Biashara / Shirika *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: Wizara ya Ushirika / Green Energy Ltd"
                    value={formData.businessName}
                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kipengele (Category)
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Biashara & Vifaa">Biashara & Vifaa</option>
                    <option value="Mikopo na Ruzuku">Mikopo na Ruzuku</option>
                    <option value="Mafunzo & Semina">Mafunzo & Semina</option>
                    <option value="Bima & Fedha">Bima & Fedha</option>
                    <option value="Kilimo & Uvuvi">Kilimo & Uvuvi</option>
                    <option value="Teknolojia & Mfumo">Teknolojia & Mfumo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Aina ya Media *
                  </label>
                  <select
                    value={formData.mediaType}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        mediaType: e.target.value as 'image' | 'video',
                        mediaUrl:
                          e.target.value === 'video'
                            ? sampleVideos[0]
                            : sampleImages[0]
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="image">📷 PICHA (Image Banner)</option>
                    <option value="video">🎥 VIDEO (MP4 Video Clip)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kipande cha Baji (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="Mfano: Ofa ya Wiki / Ruzuku"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Media URL / Upload Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Anwani ya Media URL au Pakia Faili la Picha/Video
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Weka URL ya picha au video..."
                    value={formData.mediaUrl}
                    onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <label className="cursor-pointer bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition">
                    <Upload className="w-4 h-4" />
                    <span>Pakia Faili</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUploadSim}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Suggestions */}
                <div className="mt-2 flex items-center gap-2 overflow-x-auto text-xs text-slate-500">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Sampuli:</span>
                  {formData.mediaType === 'image'
                    ? sampleImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, mediaUrl: img })}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300"
                        >
                          Picha #{idx + 1}
                        </button>
                      ))
                    : sampleVideos.map((vid, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, mediaUrl: vid })}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded hover:bg-amber-100 text-amber-600 dark:text-amber-300"
                        >
                          Video #{idx + 1}
                        </button>
                      ))}
                </div>

                {/* Live Media Test Preview Box */}
                {formData.mediaUrl && (
                  <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                      <span className="flex items-center gap-1.5">
                        {formData.mediaType === 'video' ? (
                          <>
                            <Video className="w-4 h-4 text-amber-500" />
                            <span>Uhakiki wa Video ya Moja kwa Moja (Live Test Player):</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-4 h-4 text-sky-500" />
                            <span>Uhakiki wa Picha (Live Test Image):</span>
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        ✓ Inafanya Kazi
                      </span>
                    </div>

                    <div className="h-44 w-full bg-slate-950 rounded-lg overflow-hidden relative flex items-center justify-center">
                      {formData.mediaType === 'video' ? (
                        <video
                          key={formData.mediaUrl}
                          src={formData.mediaUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={formData.mediaUrl}
                          alt="Live Preview"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80";
                          }}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Muhtasari Fupi (Summary) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Maelezo machache yatakayoonekana kwenye kadi ya tangazo..."
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Maelezo Kamili ya Tangazo (Full Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="Eleza kwa kina fursa au bidhaa, taratibu za kupata, n.k..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Eneo (Location)
                  </label>
                  <input
                    type="text"
                    placeholder="Unguja, Pemba, Stone Town..."
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nambari ya Simu ya Mawasiliano
                  </label>
                  <input
                    type="text"
                    placeholder="+255 777..."
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Siku ya Mwisho (Deadline)
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tovuti / Link ya Nje (Optional Website)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.linkUrl}
                  onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="adActiveCheck"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="adActiveCheck" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Tangazo liwe Hewani Mara Moja (Active)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-md transition"
                >
                  {editingAd ? 'Hifadhi Mabadiliko' : 'Chapisha Tangazo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW DETAILS */}
      {previewAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 overflow-hidden my-8">
            {/* Header Media */}
            <div className="relative h-64 bg-slate-950">
              {previewAd.mediaType === 'video' ? (
                <video
                  src={previewAd.mediaUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={previewAd.mediaUrl}
                  alt={previewAd.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
              <button
                onClick={() => setPreviewAd(null)}
                className="absolute top-4 right-4 bg-slate-900/80 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-rose-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
                  {previewAd.category}
                </span>
                <span className="text-xs text-slate-400">Tarehe: {previewAd.date}</span>
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {previewAd.title}
              </h2>

              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                🏛️ {previewAd.businessName}
              </p>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">{previewAd.summary}</p>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{previewAd.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Eneo</span>
                    <span className="font-bold">{previewAd.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mawasiliano</span>
                    <span className="font-bold">{previewAd.contact}</span>
                  </div>
                </div>
              </div>

              {previewAd.linkUrl && (
                <a
                  href={previewAd.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Tembelea Tovuti Rasmi</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
