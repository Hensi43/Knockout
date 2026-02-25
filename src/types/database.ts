export type UserRole = 'owner' | 'staff';

export interface User {
    id: string;
    full_name: string | null;
    role: UserRole;
    created_at: string;
}

export interface SnookerTable {
    id: string;
    name: string;
    hourly_rate: number;
    status: 'available' | 'occupied';
    created_at: string;
}

export interface Session {
    id: string;
    table_id: string;
    user_id: string | null;
    start_time: string;
    end_time: string | null;
    total_amount: number;
    discount_amount: number;
    player_count: number;
    status: 'active' | 'completed' | 'cancelled';
    created_at: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    created_at: string;
}

export interface OrderItem {
    id: string;
    session_id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    products?: Product;
}

export interface Payment {
    id: string;
    session_id: string;
    amount: number;
    payment_mode: 'cash' | 'online' | 'card';
    created_at: string;
}

export type Database = {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Omit<User, 'created_at'>;
                Update: Partial<Omit<User, 'id' | 'created_at'>>;
            };
            snooker_tables: {
                Row: SnookerTable;
                Insert: Omit<SnookerTable, 'id' | 'created_at'>;
                Update: Partial<Omit<SnookerTable, 'id' | 'created_at'>>;
            };
            sessions: {
                Row: Session;
                Insert: Omit<Session, 'id' | 'created_at'>;
                Update: Partial<Omit<Session, 'id' | 'created_at'>>;
            };
            products: {
                Row: Product;
                Insert: Omit<Product, 'id' | 'created_at'>;
                Update: Partial<Omit<Product, 'id' | 'created_at'>>;
            };
            order_items: {
                Row: OrderItem;
                Insert: Omit<OrderItem, 'id' | 'created_at'>;
                Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>;
            };
            payments: {
                Row: Payment;
                Insert: Omit<Payment, 'id' | 'created_at'>;
                Update: Partial<Omit<Payment, 'id' | 'created_at'>>;
            };
        };
    };
};
