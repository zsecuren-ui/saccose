import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { CameraCaptureModal } from './CameraCaptureModal';
import { compressDataUrl } from '../../lib/imageUtils';
import {
  X,
  Camera,
  Upload,
  User,
  CheckCircle2,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  Sparkles,
  RefreshCw,
  CreditCard,
  Image as ImageIcon,
  Video
} from 'lucide-react';

interface MemberEditProfileModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const PRESET_AVATARS = [
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', label: 'Mama / Mwanamke 1' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', label: 'Baba / Mwanaume 1' },
  { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', label: 'Meneja / Mtaalamu' },
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', label: 'Kijana / Mjasiriamali' },
  { url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80', label: 'Binti / Mfanyabiashara' },
  { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80', label: 'Mwanamke Professional' },
  { url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80', label: 'Mwanaume Professional' },
  { url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80', label: 'Mkurugenzi / Kiongozi' }
];

export const MemberEditProfileModal: React.FC<MemberEditProfileModalProps> = ({
  member,
  isOpen,
  onClose,
  title = "Badilisha Taarifa za Profile & Bank (Edit Profile)"
}) => {
  const { updateMemberProfile } = useApp();

  const [fullName, setFullName] = useState(member?.fullName || '');
  const [photoUrl, setPhotoUrl] = useState(member?.photoUrl || '');
  const [phone, setPhone] = useState(member?.phone || '');
  const [email, setEmail] = useState(member?.email || '');
  const [occupation, setOccupation] = useState(member?.occupation || '');
  const [branch, setBranch] = useState(member?.branch || '');
  const [bankName, setBankName] = useState(member?.bankName || 'CRDB Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState(member?.bankAccountNumber || '');
  const [bankAccountName, setBankAccountName] = useState(member?.bankAccountName || member?.fullName || '');

  React.useEffect(() => {
    if (member) {
      setFullName(member.fullName || '');
      setPhotoUrl(member.photoUrl || '');
      setPhone(member.phone || '');
      setEmail(member.email || '');
      setOccupation(member.occupation || '');
      setBranch(member.branch || '');
      setBankName(member.bankName || 'CRDB Bank');
      setBankAccountNumber(member.bankAccountNumber || '');
      setBankAccountName(member.bankAccountName || member.fullName || '');
    }
  }, [member, isOpen]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoType, setPhotoType] = useState<'upload' | 'camera' | 'preset' | 'url'>('upload');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen || !member) return null;

  // Handle local image upload from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Tafadhali chagua picha yenye ukubwa chini ya 5MB.');
        return;
      }
      // Compress file before setting as data URL to reduce LocalStorage usage
      compressDataUrl && compressDataUrl instanceof Function
        ? (async () => {
            try {
              const compressed = await compressDataUrl(await new Promise<string>((res, rej) => {
                const r = new FileReader();
                r.onloadend = () => res(r.result as string);
                r.onerror = rej;
                r.readAsDataURL(file);
              }), 800, 800, 0.8, 'image/jpeg');
              setPhotoUrl(compressed);
            } catch (err) {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string') setPhotoUrl(reader.result);
              };
              reader.readAsDataURL(file);
            }
          })()
        : (() => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') setPhotoUrl(reader.result);
            };
            reader.readAsDataURL(file);
          })();
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setPhotoUrl(customUrlInput.trim());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Tafadhali weka Jina Kamili.');
      return;
    }

    setSaving(true);
    updateMemberProfile(member.id, {
      fullName: fullName.trim(),
      photoUrl,
      phone: phone.trim(),
      email: email.trim(),
      occupation: occupation.trim(),
      branch: branch.trim(),
      bankName,
      bankAccountNumber: bankAccountNumber.trim(),
      bankAccountName: bankAccountName.trim()
    });

    setTimeout(() => {
      setSaving(false);
      alert('Taarifa, Bank Card na Picha vimesasishwa kikamilifu!');
      onClose();
    }, 300);
  };

  return (
    <div id="member-edit-profile-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">{title}</h3>
              <p className="text-xs text-emerald-300 font-mono">Namba: {member.memberNumber}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          
          {/* Photo Edit Section */}
          <div className="flex flex-col items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="relative group">
              <img
                src={photoUrl}
                alt={fullName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0d9488&color=fff&size=200`;
                }}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/30 shadow-md transition-transform group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg hover:bg-emerald-500 transition-transform active:scale-90"
                title="Badilisha Picha"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full space-y-3">
              <div className="flex flex-wrap justify-center gap-1.5 border-b pb-2 font-semibold text-[11px]">
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Piga Picha (Kamera Live)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoType('upload')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${photoType === 'upload' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  Pakia Picha
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoType('preset')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${photoType === 'preset' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  Chagua Avatars
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoType('url')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${photoType === 'url' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  Link (URL)
                </button>
              </div>

              {/* Live Camera Quick Trigger Panel */}
              <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 block">Kamera ya Kifaa (Device Camera)</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Tumia kamera ya mbele/selfie au ya nyuma.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Fungua Kamera</span>
                </button>
              </div>

              {photoType === 'upload' && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Chagua Picha Kutoka Kwenye Simu / Kompyuta</span>
                  </button>
                </div>
              )}

              {photoType === 'preset' && (
                <div className="grid grid-cols-4 gap-2 pt-1 max-h-40 overflow-y-auto p-1">
                  {PRESET_AVATARS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(preset.url)}
                      title={preset.label}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group ${
                        photoUrl === preset.url ? 'border-emerald-500 ring-4 ring-emerald-500/30 scale-95 shadow-md' : 'border-slate-200 dark:border-slate-700 opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      {photoUrl === preset.url && (
                        <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {photoType === 'url' && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Weka URL ya picha (https://...)"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 bg-emerald-600 text-white font-bold rounded-xl"
                  >
                    Weka
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Name & Personal Particulars */}
          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Jina Kamili la Mwanachama *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Simu</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Barua Pepe (Email)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kazi / Shughuli</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full pl-9 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tawi / Shehia</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full pl-9 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Bank Card / Account Info Section */}
            <div className="pt-2 border-t space-y-3">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Taarifa za Kadi / Akaunti ya Benki (PBZ, CRDB, NMB, NBC, n.k.)
              </label>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Chagua Benki</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="PBZ Bank">PBZ (People's Bank of Zanzibar)</option>
                  <option value="CRDB Bank">CRDB Bank</option>
                  <option value="NMB Bank">NMB Bank</option>
                  <option value="NBC Bank">NBC Bank</option>
                  <option value="Absa Bank Tanzania">Absa Bank Tanzania</option>
                  <option value="Exim Bank">Exim Bank</option>
                  <option value="Azania Bank">Azania Bank</option>
                  <option value="Equity Bank">Equity Bank</option>
                  <option value="Stanbic Bank">Stanbic Bank</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Namba ya Akaunti / Kadi</label>
                  <input
                    type="text"
                    placeholder="Mfano: 015022334455"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Jina la Akaunti</label>
                  <input
                    type="text"
                    placeholder="Jina kwenye kadi"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-colors"
            >
              Ghairi (Cancel)
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'Inahifadhi...' : 'Hifadhi Mabadiliko'}</span>
            </button>
          </div>

        </form>

        {/* Camera Live Capture Modal */}
        <CameraCaptureModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onCapture={(capturedDataUrl) => {
            setPhotoUrl(capturedDataUrl);
            setPhotoType('camera');
            setIsCameraModalOpen(false);
          }}
          title={`Piga Picha ya ${member.fullName.split(' ')[0] || 'Mwanachama'}`}
          subtitle="Picha itahifadhiwa kwenye wasifu na kitambulisho chako cha SACCOS."
        />

      </div>
    </div>
  );
};
