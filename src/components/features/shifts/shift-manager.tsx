"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/glass-card";
import { Loader2, DollarSign, LogOut } from "lucide-react";

export function ShiftManager({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [hasActiveShift, setHasActiveShift] = useState(false);
    const [startingCash, setStartingCash] = useState("");
    const [starting, setStarting] = useState(false);

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        checkShift();
    }, []);

    const checkShift = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }
            setUserId(user.id);

            const res = await fetch(`/api/shifts/current?userId=${user.id}`);
            const shift = await res.json();

            if (shift && shift.id && !shift.error) {
                setHasActiveShift(true);
            } else {
                setHasActiveShift(false);
            }
        } catch (error) {
            console.error("Failed to check shift:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartShift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !startingCash) return;

        setStarting(true);
        try {
            const res = await fetch('/api/shifts/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, startingCash: Number(startingCash) })
            });
            const data = await res.json();

            if (res.ok && data.id) {
                setHasActiveShift(true);
            } else {
                alert(data.error || "Failed to start shift");
            }
        } catch (error) {
            console.error("Error starting shift:", error);
            alert("An error occurred");
        } finally {
            setStarting(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
                <Loader2 className="animate-spin text-primary mb-4" size={32} />
                <p className="text-muted-foreground">Checking shift status...</p>
            </div>
        );
    }

    if (!userId) {
        // Not logged in, layout will handle redirect
        return <>{children}</>;
    }

    if (!hasActiveShift) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <div className="absolute top-8 right-8">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm text-muted-foreground"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>

                <GlassCard className="w-full max-w-md p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mx-20 -my-20 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-primary/30">
                            <DollarSign className="text-primary" size={32} />
                        </div>

                        <h2 className="text-3xl font-bold mb-2">Start Your Shift</h2>
                        <p className="text-muted-foreground mb-8">Enter the starting cash in your drawer to begin.</p>

                        <form onSubmit={handleStartShift} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Starting Cash (₹)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-bold">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={startingCash}
                                        onChange={(e) => setStartingCash(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                        placeholder="e.g. 500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={starting || !startingCash}
                                className="w-full py-4 rounded-xl font-bold text-black bg-primary hover:bg-primary/90 transition-all flex justify-center items-center disabled:opacity-50"
                            >
                                {starting ? <Loader2 className="animate-spin" size={20} /> : "Start Shift"}
                            </button>
                        </form>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return <>{children}</>;
}
