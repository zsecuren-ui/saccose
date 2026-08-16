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
    const client = supabase || getSupabaseClient();
    if (!client) throw new Error('Supabase not configured');
    const { data, error } = await client.from('announcements').insert({ content }).select().single();
    if (error) throw error;
    return data as Announcement;
  },
};
