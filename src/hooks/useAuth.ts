import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

export interface AuthUser {
    id: string;
    email?: string;
    role?: string;
    full_name?: string;
    [key: string]: unknown;
}

export function useAuth() {
    const { data: session, status } = useSession();

    const user: AuthUser | null = session?.user ? {
        id: (session.user as any).id,
        email: session.user.email || undefined,
        role: (session.user as any).role,
        full_name: session.user.name || undefined,
    } : null;

    const signOut = async () => {
        await nextAuthSignOut({ callbackUrl: "/login" });
    };

    return {
        user,
        loading: status === "loading",
        signOut,
        isAuthenticated: status === "authenticated",
    };
}
