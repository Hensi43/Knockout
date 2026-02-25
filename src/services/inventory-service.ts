import { supabase } from '@/lib/supabase';
import { Product, OrderItem } from '@/types/database';

export const inventoryService = {
    async getProducts() {
        if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
            return [
                { id: 'p1', name: 'Water Bottle', price: 20, category: 'drink', stock: 100, created_at: new Date().toISOString() },
                { id: 'p2', name: 'Lays Chips', price: 30, category: 'snack', stock: 50, created_at: new Date().toISOString() },
                { id: 'p3', name: 'Coke', price: 40, category: 'drink', stock: 30, created_at: new Date().toISOString() },
                { id: 'p4', name: 'Sandwich', price: 80, category: 'snack', stock: 15, created_at: new Date().toISOString() },
            ] as Product[];
        }
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        if (error) throw error;
        return data as Product[];
    },

    async addOrderItem(sessionId: string, productId: string, quantity: number, price: number) {
        if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
            return { id: Math.random().toString(), session_id: sessionId, product_id: productId, quantity, price_at_time: price };
        }
        const { data, error } = await supabase
            .from('order_items')
            .insert([{ session_id: sessionId, product_id: productId, quantity, price_at_time: price }])
            .select();
        if (error) throw error;
        return data[0];
    },

    async getSessionOrders(sessionId: string) {
        if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
            return [] as OrderItem[];
        }
        const { data, error } = await supabase
            .from('order_items')
            .select('*, products(*)')
            .eq('session_id', sessionId);
        if (error) throw error;
        return data as OrderItem[];
    }
};
