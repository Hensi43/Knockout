import { getSupabaseAdmin } from '@/lib/supabase-server';

export const KhataService = {
    async getAccounts() {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.from('khata_accounts').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async createAccount(playerName: string, phone: string = '') {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.from('khata_accounts').insert({ player_name: playerName, phone }).select().single();
        if (error) throw error;
        return data;
    },

    async addTransaction(accountId: string, amount: number, type: 'CREDIT' | 'SETTLEMENT', description: string, sessionId?: string) {
        if (amount <= 0) throw new Error("Amount must be greater than zero");

        const supabase = getSupabaseAdmin();

        // Get current due
        const { data: account, error: accErr } = await supabase.from('khata_accounts').select('total_due').eq('id', accountId).single();
        if (accErr) throw accErr;

        const currentDue = Number(account.total_due);
        const newDue = type === 'CREDIT' ? currentDue + amount : currentDue - amount;

        // Insert tx
        const { data: tx, error: txErr } = await supabase.from('khata_transactions').insert({
            account_id: accountId, amount, type, description, session_id: sessionId || null
        }).select().single();
        if (txErr) throw txErr;

        // Update account due
        const { error: updErr } = await supabase.from('khata_accounts').update({ total_due: newDue }).eq('id', accountId);
        if (updErr) throw updErr;

        return { transaction: tx, newDue };
    }
};
