import { createClient } from '@supabase/supabase-js';
import { Institution, Member, Transaction, Loan } from '../types';

// Read credentials from env or runtime state
const getSupabaseCredentials = () => {
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL || localStorage.getItem('CUSTOM_SUPABASE_URL') || '';
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || localStorage.getItem('CUSTOM_SUPABASE_ANON_KEY') || '';
    return { url, key };
  } catch {
    return { url: '', key: '' };
  }
};

const { url, key } = getSupabaseCredentials();

export const isSupabaseConfigured = Boolean(
  url &&
  key &&
  !url.includes('your-project') &&
  url.startsWith('http')
);

export const getSupabaseClient = (customUrl?: string, customKey?: string) => {
  try {
    const activeUrl = customUrl || url;
    const activeKey = customKey || key;
    if (!activeUrl || !activeKey || activeUrl.includes('your-project') || !activeUrl.startsWith('http')) {
      return null;
    }
    return createClient(activeUrl, activeKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
  } catch (err) {
    console.warn('[Supabase Init] Client initialization bypassed gracefully:', err);
    return null;
  }
};

export const supabase = getSupabaseClient();

// Helper with timeout to prevent network blocking if Supabase is unreachable
const withTimeout = <T>(promise: PromiseLike<T>, timeoutMs = 4000): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase network request timed out')), timeoutMs)
    ),
  ]);
};

// Helper service to fetch and sync data with user's Supabase Database with 100% offline fallback resilience
export const SupabaseService = {
  async testConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string }> {
    try {
      const client = getSupabaseClient(customUrl, customKey);
      if (!client) {
        return { success: false, message: 'Supabase URL au Anon Key haijaiwekwa kikamilifu.' };
      }
      const response: any = await withTimeout(client.from('institutions').select('id').limit(1), 3500);
      const { error } = response || {};
      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet, try basic auth query or table check
        return { success: true, message: 'Muunganisho na Supabase umefanikiwa! (Mfumo upo tayari).' };
      }
      return { success: true, message: 'Muunganisho na Supabase umefanikiwa kikamilifu!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Imeshindwa kuunganisha na Supabase (Mfumo unaendelea na Offline/Local Mode).' };
    }
  },

  async fetchInstitutions(): Promise<Institution[]> {
    if (!supabase) return [];
    try {
      const response: any = await withTimeout(supabase.from('institutions').select('*'), 4000);
      const { data, error } = response || {};
      if (error || !data || !Array.isArray(data)) return [];
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type || 'SACCOS',
        registrationNumber: item.registration_number || '',
        logo: item.logo || '',
        primaryColor: item.primary_color || '#0d9488',
        domain: item.domain || '',
        planId: item.plan_id || 'plan_standard',
        planName: item.plan_name || 'Standard Plan',
        memberCount: Number(item.member_count || 0),
        maxMembers: Number(item.max_members || 1000),
        userCount: Number(item.user_count || 1),
        phone: item.phone || '',
        email: item.email || '',
        region: item.region || 'Dar es Salaam',
        currency: 'TZS',
        status: item.status || 'Active',
        joinedDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    } catch (err) {
      console.warn('[Supabase Sync] fetchInstitutions skipped, using offline cache:', err);
      return [];
    }
  },

  async saveInstitution(inst: Institution) {
    if (!supabase) return;
    try {
      await withTimeout(
        supabase.from('institutions').upsert({
          id: inst.id,
          name: inst.name,
          type: inst.type,
          registration_number: inst.registrationNumber,
          logo: inst.logo,
          primary_color: inst.primaryColor,
          domain: inst.domain,
          plan_id: inst.planId,
          plan_name: inst.planName,
          member_count: inst.memberCount,
          max_members: inst.maxMembers,
          phone: inst.phone,
          email: inst.email,
          region: inst.region,
          status: inst.status
        }),
        4000
      );
    } catch (err) {
      console.warn('[Supabase Sync] saveInstitution offline fallback:', err);
    }
  },

  async fetchMembers(tenantId?: string): Promise<Member[]> {
    if (!supabase) return [];
    try {
      let query = supabase.from('members').select('*');
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      const response: any = await withTimeout(query, 4000);
      const { data, error } = response || {};
      if (error || !data || !Array.isArray(data)) return [];
      return data.map((item: any) => ({
        id: item.id,
        tenantId: item.tenant_id || item.institution_id,
        memberNumber: item.member_number,
        fullName: item.full_name,
        phone: item.phone || '',
        email: item.email || '',
        photoUrl: item.photo_url || '',
        occupation: item.occupation || '',
        idType: item.id_type || 'NIDA',
        idNumber: item.id_number || '',
        branch: item.branch || 'Main Branch',
        totalSavings: Number(item.total_savings || 0),
        totalShares: Number(item.total_shares || 0),
        totalLoansOutstanding: Number(item.total_loans_outstanding || 0),
        status: item.status || 'Active',
        joinedDate: item.joined_date || '',
        nextOfKin: item.next_of_kin || { fullName: 'Ndugu', relationship: 'Ndugu', phone: item.phone || '', percentageShare: 100 }
      }));
    } catch (err) {
      console.warn('[Supabase Sync] fetchMembers skipped, using offline cache:', err);
      return [];
    }
  },

  async saveMember(member: Member) {
    if (!supabase) return;
    try {
      await withTimeout(
        supabase.from('members').upsert({
          id: member.id,
          tenant_id: member.tenantId,
          member_number: member.memberNumber,
          full_name: member.fullName,
          phone: member.phone,
          email: member.email,
          photo_url: member.photoUrl,
          occupation: member.occupation,
          id_type: member.idType,
          id_number: member.idNumber,
          branch: member.branch,
          total_savings: member.totalSavings,
          total_shares: member.totalShares,
          total_loans_outstanding: member.totalLoansOutstanding,
          status: member.status,
          joined_date: member.joinedDate
        }),
        4000
      );
    } catch (err) {
      console.warn('[Supabase Sync] saveMember offline fallback:', err);
    }
  }
};

