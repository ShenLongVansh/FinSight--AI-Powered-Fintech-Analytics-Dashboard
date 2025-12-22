import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization - only create client when actually used
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase environment variables');
        }

        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
    return supabaseInstance;
}

// Export getter for backward compatibility
export const supabase = {
    get client() { return getSupabase(); }
};

// Types for database tables
export interface DbTransaction {
    id: string;
    user_id: string;
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    category: string;
    bank_name?: string;
    created_at: string;
}

export interface DbPasswordProfile {
    id: string;
    user_id: string;
    name: string;
    encrypted_password: string;
    created_at: string;
}

// Helper functions
export async function getTransactions(userId: string): Promise<DbTransaction[]> {
    const { data, error } = await supabase.client
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
    return data || [];
}

export async function saveTransactions(userId: string, transactions: {
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    category: string;
    bank_name?: string;
}[]): Promise<{ success: boolean; count: number }> {
    const transactionsWithUser = transactions.map(t => ({
        ...t,
        user_id: userId,
    }));

    const { data, error } = await supabase.client
        .from('transactions')
        .insert(transactionsWithUser)
        .select();

    if (error) {
        console.error('Error saving transactions:', error);
        return { success: false, count: 0 };
    }
    return { success: true, count: data?.length || 0 };
}

export async function deleteAllTransactions(userId: string): Promise<boolean> {
    const { error } = await supabase.client
        .from('transactions')
        .delete()
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting transactions:', error);
        return false;
    }
    return true;
}

export async function getPasswordProfiles(userId: string): Promise<DbPasswordProfile[]> {
    const { data, error } = await supabase.client
        .from('password_profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching password profiles:', error);
        return [];
    }
    return data || [];
}

export async function savePasswordProfile(userId: string, profile: {
    name: string;
    encrypted_password: string;
}): Promise<DbPasswordProfile | null> {
    const { data, error } = await supabase.client
        .from('password_profiles')
        .insert({ ...profile, user_id: userId })
        .select()
        .single();

    if (error) {
        console.error('Error saving password profile:', error);
        return null;
    }
    return data;
}

export async function deletePasswordProfile(userId: string, profileId: string): Promise<boolean> {
    const { error } = await supabase.client
        .from('password_profiles')
        .delete()
        .eq('id', profileId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting password profile:', error);
        return false;
    }
    return true;
}
