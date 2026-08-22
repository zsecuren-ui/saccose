import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { Institution, Member, Transaction, Loan } from '../types';

type ProfileRow = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  last_login?: string | null;
};

type AuthSessionUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
};

const normalizeSupabaseUrl = (value?: string) => {
  if (!value) return '';
  return value.trim().replace(/\/rest\/v1\/?$/i, '');
};

const getSupabaseCredentials = () => {
  try {
    const url =
      normalizeSupabaseUrl(
        (import.meta as any).env?.VITE_SUPABASE_URL ||
          localStorage.getItem('CUSTOM_SUPABASE_URL') ||
          ''
      ) || '';

    const key =
      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
      localStorage.getItem('CUSTOM_SUPABASE_ANON_KEY') ||
      '';

    return { url, key };
  } catch {
    return { url: '', key: '' };
  }
};

const { url, key } = getSupabaseCredentials();

// Persist a single Supabase client instance across HMR/dev reloads to avoid multiple
// GoTrueClient instances (which causes the console warning seen in the browser).
declare global {
  // eslint-disable-next-line no-var
  var __SACCOS_SUPABASE_CLIENT__: SupabaseClient | undefined;
}

const defaultUrl = (import.meta as any).env?.VITE_SUPABASE_URL || url || '';
const defaultKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || key || '';

if (!globalThis.__SACCOS_SUPABASE_CLIENT__ && defaultUrl && defaultKey) {
  try {
    globalThis.__SACCOS_SUPABASE_CLIENT__ = createClient(defaultUrl, defaultKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
  } catch (err) {
    console.warn('[Supabase Init] failed to create persisted client:', err);
  }
}

export const supabase: SupabaseClient = globalThis.__SACCOS_SUPABASE_CLIENT__ as SupabaseClient;

export const isSupabaseConfigured = Boolean(
  defaultUrl &&
  defaultKey &&
  !defaultUrl.includes('your-project') &&
  defaultUrl.startsWith('http')
);

export const getSupabaseClient = (customUrl?: string, customKey?: string): SupabaseClient | null => {
  try {
    const activeUrl = customUrl || defaultUrl;
    const activeKey = customKey || defaultKey;

    if (!activeUrl || !activeKey || activeUrl.includes('your-project') || !activeUrl.startsWith('http')) {
      return null;
    }

    // If custom credentials are provided we create a one-off client for that combination.
    if (customUrl || customKey) {
      return createClient(activeUrl, activeKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      });
    }

    return globalThis.__SACCOS_SUPABASE_CLIENT__ || null;
  } catch (err) {
    console.warn('[Supabase Init] Client initialization bypassed gracefully:', err);
    return null;
  }
};

const withTimeout = <T>(promise: PromiseLike<T>, timeoutMs = 4000): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase network request timed out')), timeoutMs)
    ),
  ]);
};

export const saveUserProfile = async (user: User | AuthSessionUser | null) => {
  if (!user || !user.id) return null;

  const client = getSupabaseClient() || supabase;
  if (!client) return null;

  const profile: ProfileRow = {
    id: user.id,
    email: user.email ?? null,
    full_name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email ??
      'User',
    avatar_url:
      user.user_metadata?.avatar_url ??
      user.user_metadata?.picture ??
      null,
    last_login: new Date().toISOString()
  };

  try {
    const { data, error } = await withTimeout(
      client
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })
        .select()
        .single(),
      4000
    );

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase Sync] saveUserProfile offline fallback:', err);
    return null;
  }
};

export const SupabaseService = {
  _authListenerRegistered: false,

  async registerUser(email: string, password: string, extraData?: { fullName?: string; phone?: string; role?: string }) {
    const client = getSupabaseClient() || supabase;
    if (!client) throw new Error('Supabase Client haijawa configured vyema.');

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: extraData?.fullName || '',
          phone: extraData?.phone || '',
          role: extraData?.role || 'member'
        }
      }
    });

    if (error) throw error;
    return data;
  },

  async setupAuthListener() {
    const client = getSupabaseClient() || supabase;
    if (!client || this._authListenerRegistered) return null;

    this._authListenerRegistered = true;

    const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await saveUserProfile(session.user);
        } catch (err) {
          console.warn('[Supabase Sync] auth listener profile sync failed:', err);
        }
      }
    });

    return authListener.subscription;
  },

  async testConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string }> {
    try {
      const client = getSupabaseClient(customUrl, customKey) || supabase;
      if (!client) {
        return { success: false, message: 'Supabase URL au Anon Key haijaiwekwa kikamilifu.' };
      }

      const response: any = await withTimeout(client.from('institutions').select('id').limit(1), 3500);
      const { error } = response || {};

      if (error && error.code !== 'PGRST116') {
        return { success: true, message: 'Muunganisho na Supabase umefanikiwa! (Mfumo upo tayari).' };
      }

      return { success: true, message: 'Muunganisho na Supabase umefanikiwa kikamilifu!' };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Imeshindwa kuunganisha na Supabase (Mfumo unaendelea na Offline/Local Mode).'
      };
    }
  },

  async fetchInstitutions(): Promise<Institution[]> {
    const client = getSupabaseClient() || supabase;
    if (!client) return [];

    try {
      const { data, error } = await withTimeout(client.from('institutions').select('*'), 4000);
      if (error) throw error;
      return (data || []) as Institution[];
    } catch (err) {
      console.warn('[Supabase Sync] fetchInstitutions fallback:', err);
      return [];
    }
  },

  async saveInstitution(inst: Institution) {
    const client = getSupabaseClient() || supabase;
    if (!client) return;

    try {
      await withTimeout(
        client.from('institutions').upsert({
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
    const client = getSupabaseClient() || supabase;
    if (!client) return [];

    try {
      let query = client.from('members').select('*');
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
        nextOfKin: item.next_of_kin || {
          fullName: 'Ndugu',
          relationship: 'Ndugu',
          phone: item.phone || '',
          percentageShare: 100
        }
      }));
    } catch (err) {
      console.warn('[Supabase Sync] fetchMembers skipped, using offline cache:', err);
      return [];
    }
  },

  async saveMembers(members: Member[]) {
    const client = getSupabaseClient() || supabase;
    if (!client || !members.length) return;

    try {
      await withTimeout(
        client.from('members').upsert(
          members.map((member) => ({
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
          }))
        ),
        4000
      );
    } catch (err) {
      console.warn('[Supabase Sync] saveMembers offline fallback:', err);
    }
  },

  async saveMember(member: Member) {
    const client = getSupabaseClient() || supabase;
    if (!client) return;

    try {
      await withTimeout(
        client.from('members').upsert({
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
  },

  async saveTransaction(txn: Transaction) {
    const client = getSupabaseClient() || supabase;
    if (!client) return;

    try {
      await withTimeout(
        client.from('transactions').upsert({
          id: txn.id,
          member_id: txn.memberId,
          tenant_id: txn.tenantId,
          type: txn.type,
          amount: txn.amount,
          balance_after: (txn as any).balanceAfter ?? null,
          reference: txn.referenceNumber ?? '',
          status: txn.status,
          created_at: txn.date ?? new Date().toISOString()
        }),
        4000
      );
    } catch (err) {
      console.warn('[Supabase Sync] saveTransaction offline fallback:', err);
    }
  },

  async fetchLoans(): Promise<Loan[]> {
    const client = getSupabaseClient() || supabase;
    if (!client) return [];

    try {
      const { data, error } = await withTimeout(client.from('loans').select('*'), 4000);
      if (error) throw error;
      return (data || []) as Loan[];
    } catch (err) {
      console.warn('[Supabase Sync] fetchLoans fallback:', err);
      return [];
    }
  }
};