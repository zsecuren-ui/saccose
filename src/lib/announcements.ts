import { supabase, SupabaseService, getSupabaseClient } from './supabase';

export type Announcement = {
  id: string;
  author_id?: string | null;
  content: string;
  status: 'published' | 'draft' | string;
  created_at: string;
  updated_at: string;
};

export const AnnouncementsService = {
  async list(): Promise<Announcement[]> {
    const client = supabase || getSupabaseClient();
    if (!client) return [];
    try {
      const { data, error } = await client.from('announcements').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Announcement[];
    } catch (err) {
      console.warn('[Announcements] list failed', err);
      return [];
    }
  },

  async create(content: string) {
    // Try server-side admin endpoint first (if deployed and Admin API key is set on server)
    try {
      const resp = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (resp.ok) {
        const json = await resp.json().catch(() => null);
        const created = json && (Array.isArray(json.data) ? json.data[0] : json.data);
        if (created) return created as Announcement;
      }
    } catch (err) {
      // ignore and fallback to client-side Supabase
      console.warn('[Announcements] admin endpoint failed, falling back to client:', err);
    }

    const client = supabase || getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');

    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData?.user) {
      throw new Error('User must be authenticated to create announcements');
    }

    const { data, error } = await client
      .from('announcements')
      .insert({
        content,
        author_id: userData.user.id,
        status: 'published'
      })
      .select()
      .single();

    if (error) throw error;
    return data as Announcement;
  },

};
