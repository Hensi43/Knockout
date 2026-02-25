"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    const handleMockLogin = () => {
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 -right-20 w-72 h-72 bg-blue-500/5 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <GlassCard variant="premium" className="w-[400px] p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold gold-text-gradient mb-2">Snooker Elite</h1>
                        <p className="text-muted-foreground text-sm">Professional Club Management</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
                            <Input
                                type="email"
                                placeholder="Manager@snookerelite.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-xs text-center">{error}</p>
                        )}

                        <Button type="submit" className="w-full h-11 mt-4" disabled={loading}>
                            {loading ? "Authenticating..." : "Sign In"}
                        </Button>

                        {process.env.NEXT_PUBLIC_MOCK_MODE === 'true' && (
                            <div className="pt-4 border-t border-white/5 mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-11 bg-white/5 hover:bg-white/10"
                                    onClick={handleMockLogin}
                                >
                                    Login with Mock Mode
                                </Button>
                                <p className="text-[10px] text-center text-muted-foreground mt-2">
                                    Developer Bypass Active
                                </p>
                            </div>
                        )}
                    </form>

                    <p className="mt-8 text-center text-xs text-muted-foreground">
                        Trusted by premium snooker clubs worldwide.
                    </p>
                </GlassCard>
            </motion.div>
        </div>
    );
}
