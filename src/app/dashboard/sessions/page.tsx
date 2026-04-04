"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { sessionService } from "@/services/session-service";
import { Clock, Users, PlayCircle, IndianRupee, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceStrict, format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ActiveSessionsPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await sessionService.getActiveSessions();
            setSessions(data || []);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    // Real-time ticking for duration and cost
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient">Active Sessions</h1>
                    <p className="text-muted-foreground mt-1">Live tracking of all ongoing games across the club.</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={fetchSessions} disabled={loading}>
                    <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card h-48 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : sessions.length === 0 ? (
                <div className="py-24 text-center glass-card rounded-2xl border-dashed border-white/10 flex flex-col items-center justify-center">
                    <PlayCircle size={48} className="text-white/10 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Active Sessions</h3>
                    <p className="text-muted-foreground mb-6">There are currently no tables running games right now.</p>
                    <Link href="/dashboard/tables">
                        <Button variant="primary">Go to Tables</Button>
                    </Link>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {sessions.map((session) => {
                        const start = new Date(session.start_time);
                        const duration = formatDistanceStrict(start, currentTime);
                        const diffInMinutes = Math.max(0, (currentTime.getTime() - start.getTime()) / (1000 * 60));
                        const ratePerMin = session.snooker_tables?.hourly_rate || 0;
                        const currentCost = Math.round(diffInMinutes * ratePerMin); // Rounded to align with checkout policy

                        return (
                            <GlassCard key={session.id} variant="premium" className="p-6 border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors" />

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{session.snooker_tables?.name || 'Unknown Table'}</h3>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <PlayCircle size={12} className="text-green-500" />
                                            Started at {format(start, 'h:mm a')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-xs text-muted-foreground border border-white/5">
                                        <Users size={12} />
                                        <span>{session.player_count || 1} Players</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <Clock size={10} className="text-blue-400" /> Duration
                                        </p>
                                        <p className="font-mono font-medium text-white">{duration}</p>
                                    </div>

                                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <IndianRupee size={10} className="text-green-400" /> Accrued
                                        </p>
                                        <p className="font-mono font-medium text-white">₹{currentCost}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-2">
                                    <Link href="/dashboard/tables" className="w-full">
                                        <Button variant="ghost" className="w-full text-xs border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white">
                                            Manage Table
                                        </Button>
                                    </Link>
                                </div>
                            </GlassCard>
                        );
                    })}
                </motion.div>
            )}
        </DashboardLayout>
    );
}
