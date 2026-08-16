import React, { useState } from 'react';
import { X, Camera, Download, ZoomIn, ZoomOut, User, CheckCircle2, ShieldCheck, Edit3 } from 'lucide-react';
import { Member } from '../../types';

interface MemberPhotoModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEditModal?: (member: Member) => void;
}

export const MemberPhotoModal: React.FC<MemberPhotoModalProps> = ({
  member,
  isOpen,
  onClose,
  onOpenEditModal
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !member) return null;

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=0d9488&color=fff&size=512`;
  const displayPhoto = imageError || !member.photoUrl ? fallbackAvatar : member.photoUrl;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));

  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                <span>{member.fullName}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  {member.status || 'Active'}
                </span>
              </h3>
              <p className="text-slate-400 text-xs font-mono">
                {member.memberNumber} • {member.branch || 'Tawi Kuu'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Funga (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Canvas */}
        <div className="flex-1 min-h-[300px] sm:min-h-[400px] bg-slate-950 relative overflow-hidden flex items-center justify-center p-6">
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img
              src={displayPhoto}
              alt={member.fullName}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[55vh] max-w-full rounded-2xl object-contain shadow-2xl transition-transform duration-200 ring-2 ring-emerald-500/30"
            />
          </div>

          {/* Zoom Controls Overlay */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-900/90 border border-slate-700 p-1.5 rounded-2xl backdrop-blur-md shadow-lg">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.75}
              className="p-2 text-slate-300 hover:text-white disabled:opacity-40 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Punguza (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-emerald-400 font-bold px-1">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.5}
              className="p-2 text-slate-300 hover:text-white disabled:opacity-40 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Ongeza (Zoom In)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 text-[10px] bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors font-bold"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Footer info & Edit action */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-slate-400 text-xs text-center sm:text-left">
            <span className="text-white font-bold">{member.fullName}</span>
            <span className="mx-2">•</span>
            <span>Simu: {member.phone || 'N/A'}</span>
            {member.occupation && (
              <>
                <span className="mx-2">•</span>
                <span>Kazi: {member.occupation}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onOpenEditModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEditModal(member);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer w-full sm:w-auto"
              >
                <Camera className="w-4 h-4" />
                <span>Badilisha Picha Hii</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
