import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
    ? createMockBrowserClient()
    : createClient(supabaseUrl, supabaseAnonKey);

export function createSupabaseBrowserClient() {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
        return createMockBrowserClient();
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

function createMockBrowserClient(): any {
    const usersList = [
        { id: 'u1', email: 'hensibaghel43@gmail.com', password: 'ownerpassword', name: 'Hensi Baghel', role: 'owner' },
        { id: 'u2', email: 'amit.manager@snookerelite.com', password: 'managerpassword', name: 'Amit Sharma', role: 'owner' },
        { id: 'u3', email: 'priya.staff@snookerelite.com', password: 'staffpassword1', name: 'Priya Verma', role: 'staff' },
        { id: 'u4', email: 'rahul.staff@snookerelite.com', password: 'staffpassword2', name: 'Rahul Singh', role: 'staff' },
        { id: 'u5', email: 'vikram.staff@snookerelite.com', password: 'staffpassword3', name: 'Vikram Malhotra', role: 'staff' }
    ];

    const mockAuth = {
        signInWithPassword: async (credentials: any) => {
            const found = usersList.find(
                u => u.email === credentials.email && u.password === credentials.password
            );
            if (found) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("mock_session_user", JSON.stringify({
                        id: found.id,
                        email: found.email,
                        full_name: found.name,
                        role: found.role
                    }));
                }
                return {
                    data: {
                        user: {
                            id: found.id,
                            email: found.email,
                            role: found.role
                        }
                    },
                    error: null
                };
            }
            return {
                data: { user: null },
                error: { message: "Invalid credentials. Please use one of the 5 mock accounts (e.g. hensibaghel43@gmail.com / ownerpassword)" }
            };
        },
        signOut: async () => {
            if (typeof window !== "undefined") {
                localStorage.removeItem("mock_session_user");
            }
            return { error: null };
        },
        getUser: async () => {
            if (typeof window !== "undefined") {
                const sessionUser = localStorage.getItem("mock_session_user");
                if (sessionUser) {
                    const parsed = JSON.parse(sessionUser);
                    return { data: { user: parsed }, error: null };
                }
            }
            return {
                data: {
                    user: {
                        id: 'u1',
                        email: 'hensibaghel43@gmail.com',
                        full_name: 'Hensi Baghel',
                        role: 'owner'
                    }
                },
                error: null
            };
        }
    };

    return {
        auth: mockAuth,
        from: (table: string) => {
            return {
                select: () => ({
                    eq: () => Promise.resolve({ data: [], error: null }),
                    single: () => Promise.resolve({ data: null, error: null })
                })
            } as any;
        }
    };
}
