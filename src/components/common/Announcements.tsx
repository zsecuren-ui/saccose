import React from 'react';
import { useApp } from '../../context/AppContext';

export const Announcements: React.FC = () => {
  const { announcements } = useApp();

  if (!announcements || announcements.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 72, left: 0, right: 0, zIndex: 60, display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 980, width: '100%', pointerEvents: 'auto' }}>
        {announcements.slice(0, 3).map(a => (
          <div key={a.id} style={{ background: '#f1f5f9', padding: 8, marginBottom: 6, borderRadius: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 13, color: '#0f172a' }}>{a.content}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{new Date(a.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
