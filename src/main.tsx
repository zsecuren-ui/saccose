import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { SupabaseService } from './lib/supabase';
import './index.css';

// Anzisha auth listener kabla ya App ku-render
SupabaseService.setupAuthListener();

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// Expose a tiny helper for third-party components to update AppContext without prop-drilling.
// This is intentionally minimal and used only by the AdminInstitutionCreator to prepend server-created institutions.
// It will be assigned after App mounts via AppContext. If you prefer, we can wire this directly via context consumer.
declare global {
  interface Window { __APP_CONTEXT_PREPEND_INSTITUTION__?: (inst: any) => void }
}

