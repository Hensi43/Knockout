-- Create roles enum
CREATE TYPE user_role AS ENUM ('owner', 'staff');

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    role user_role DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create snooker_tables table
CREATE TABLE IF NOT EXISTS public.snooker_tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id UUID REFERENCES public.snooker_tables ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    player_count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_mode TEXT DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'online', 'card')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snooker_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users: Owners can read all, users can read themselves
CREATE POLICY "Users can read their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Owners can read all users" ON public.users FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);

-- Tables: Everyone authenticated can read, only owners can manage
CREATE POLICY "All authenticated users can view tables" ON public.snooker_tables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can manage tables" ON public.snooker_tables FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);

-- Sessions: Everyone authenticated can manage sessions (staff & owner)
CREATE POLICY "All authenticated users can manage sessions" ON public.sessions FOR ALL TO authenticated USING (true);

-- Payments: Everyone authenticated can manage payments
CREATE POLICY "All authenticated users can manage payments" ON public.payments FOR ALL TO authenticated USING (true);

-- Products/Snacks Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT DEFAULT 'snack',
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for new tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies for new tables
CREATE POLICY "Everyone can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can manage products" ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);

CREATE POLICY "All authenticated can manage order items" ON public.order_items FOR ALL TO authenticated USING (true);
