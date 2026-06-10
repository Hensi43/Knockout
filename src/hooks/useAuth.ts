import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export interface AuthUser {
    id: string;
    email?: string;
    role?: string;
    full_name?: string;
    [key: string]: any;
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        // Get initial user session
        const getInitialSession = async () => {
            try {
                const { data: { user: initialUser } } = await supabase.auth.getUser();
                setUser(initialUser as AuthUser);
            } catch (error) {
                console.error("Error fetching initial session:", error);
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth state changes (sign-in, sign-out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser((session?.user as AuthUser) ?? null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const signOut = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            window.location.href = "/login";
        } catch (error) {
            console.error("Error logging out:", error);
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        signOut,
        isAuthenticated: !!user,
    };
}
