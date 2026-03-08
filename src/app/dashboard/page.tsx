"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import Link from "next/link";
import { Plus, FileText, Settings } from "lucide-react";
import { reportService } from "@/services/report-service";
import { GlassCard } from "@/components/ui/glass-card";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        activeTables: 0,
        totalTables: 0,
        revenueToday: 0,
        ongoingSessions: 0,
        averageSessionDuration: 0,
        loading: true
    });

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const data = await reportService.getDashboardStats();
            setStats({ ...data, loading: false });
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold gold-text-gradient">Manager Overview</h1>
                <p className="text-muted-foreground">Welcome back. Here's what's happening at your club today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="glass-card p-6 h-24 rounded-2xl animate-pulse" />)
                ) : (
                    <>
                        <GlassCard className="p-6 rounded-2xl border border-white/5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Active Tables</p>
                            <p className="text-2xl font-bold text-blue-400">{stats.activeTables} / {stats.totalTables}</p>
                        </GlassCard>
                        <GlassCard className="p-6 rounded-2xl border border-white/5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Revenue Today</p>
                            <p className="text-2xl font-bold text-green-400">₹{(stats.revenueToday || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </GlassCard>
                        <GlassCard className="p-6 rounded-2xl border border-white/5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Ongoing Sessions</p>
                            <p className="text-2xl font-bold text-primary">{stats.ongoingSessions}</p>
                        </GlassCard>
                        <GlassCard className="p-6 rounded-2xl border border-white/5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Average Duration</p>
                            <p className="text-2xl font-bold text-purple-400">
                                {Math.floor((stats.averageSessionDuration || 0) / 60)}h {(stats.averageSessionDuration || 0) % 60}m
                            </p>
                        </GlassCard>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl min-h-[400px]">
                    <h3 className="text-lg font-semibold mb-6">Recent Sessions</h3>
                    <div className="text-muted-foreground text-sm text-center py-20 italic">
                        No recent sessions found.
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl h-fit">
                    <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
                    <div className="space-y-4">
                        <Link href="/dashboard/tables" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">
                            <Plus size={16} /> Add New Table
                        </Link>
                        <Link href="/dashboard/reports" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">
                            <FileText size={16} /> Generate Daily Report
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">
                            <Settings size={16} /> Settings
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
