import { getSupabaseAdmin } from '@/lib/supabase-server';

export const ShiftService = {
    async startShift(userId: string, startingCash: number) {
        const supabase = getSupabaseAdmin();

        // Check for existing active shift
        const { data: existing } = await supabase
            .from('staff_shifts')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'ACTIVE')
            .single();

        if (existing) throw new Error('User already has an active shift');

        const { data, error } = await supabase
            .from('staff_shifts')
            .insert({ user_id: userId, starting_cash: startingCash })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async endShift(shiftId: string, declaredCash: number) {
        const supabase = getSupabaseAdmin();

        // 1. Calculate expected cash
        const { data: shift } = await supabase.from('staff_shifts').select('*').eq('id', shiftId).single();
        if (!shift) throw new Error('Invalid shift');
        if (shift.status === 'CLOSED') throw new Error('Shift is already closed');

        // 2. Fetch all cash payments made during this shift
        const { data: cashSales } = await supabase
            .from('payments')
            .select('amount')
            .eq('payment_mode', 'cash')
            .gte('created_at', shift.start_time);

        const totalCashSales = cashSales?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        const expectedSystemCash = Number(shift.starting_cash) + totalCashSales;

        // 3. Close shift
        const { data, error } = await supabase
            .from('staff_shifts')
            .update({
                status: 'CLOSED',
                end_time: new Date().toISOString(),
                declared_cash: declaredCash,
                expected_system_cash: expectedSystemCash
            })
            .eq('id', shiftId)
            .select()
            .single();

        if (error) throw error;
        return {
            ...data,
            shortage: expectedSystemCash - declaredCash // Positive means staff is short, negative means over
        };
    },

    async getCurrentShift(userId: string) {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from('staff_shifts')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'ACTIVE')
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        return data || null;
    }
};
