import { supabase } from '@/lib/supabase';
import { Product, OrderItem } from '@/types/database';

export const inventoryService = {
    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        if (error) throw error;
        return data as Product[];
    },

    async addOrderItem(sessionId: string, productId: string, quantity: number, price: number) {
        const { data, error } = await supabase
            .from('order_items')
            .insert([{ session_id: sessionId, product_id: productId, quantity, price_at_time: price }])
            .select();
        if (error) throw error;
        return data[0];
    },

    async getSessionOrders(sessionId: string) {
        const { data, error } = await supabase
            .from('order_items')
            .select('*, products(*)')
            .eq('session_id', sessionId);
        if (error) throw error;
        return data as OrderItem[];
    }
};
