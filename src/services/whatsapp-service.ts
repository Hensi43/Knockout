import { getSupabaseAdmin } from '@/lib/supabase-server';

export const WhatsAppService = {
    async sendReceipt(phone: string, name: string, sessionData: any) {
        const supabase = getSupabaseAdmin();

        // 1. Upsert Customer into CRM
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('*')
            .eq('phone', phone)
            .single();

        if (existingCustomer) {
            await supabase.from('customers').update({
                name: name, // User might have provided a totally new name for the same number
                total_visits: existingCustomer.total_visits + 1,
                last_visit: new Date().toISOString()
            }).eq('id', existingCustomer.id);
        } else {
            await supabase.from('customers').insert({ name, phone });
        }

        // 2. Dummy WhatsApp API call (In reality, Twilio or WATI API goes here)
        console.log(`[WHATSAPP API MOCK] Sending receipt to ${phone} (${name})`);
        console.log(`[WHATSAPP API TEXT] Hi ${name}, thanks for visiting Snooker Elite! Your total bill was ₹${sessionData.total_amount}.`);

        return { success: true, message: "Receipt queued for WhatsApp delivery" };
    }
};
