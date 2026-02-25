"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { reportService } from "@/services/report-service";
import { BarChart3, TrendingUp, Calendar, Trophy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ReportsPage() {
    const [stats, setStats] = useState({
        daily: 0,
        monthly: 0,
        mostUsed: { name: 'N/A', count: 0 },
        loading: true
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const daily = await reportService.getDailyRevenue();
            const monthly = await reportService.getMonthlyRevenue();
            const mostUsed = await reportService.getMostUsedTable();
            setStats({ daily, monthly, mostUsed, loading: false });
        } catch (error) {
            console.error("Error fetching stats:", error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient font-serif">Financial Reports</h1>
                    <p className="text-muted-foreground mt-1">Detailed insights into your club's performance.</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download size={18} /> Export CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <GlassCard className="p-8 border-l-4 border-l-primary">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Today's Revenue</span>
                        </div>
                        <h2 className="text-4xl font-black text-white">₹{stats.daily.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                        <p className="text-xs text-green-400 mt-2 font-medium">+12% from yesterday</p>
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <GlassCard className="p-8 border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                <Calendar size={24} />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Monthly Revenue</span>
                        </div>
                        <h2 className="text-4xl font-black text-white">₹{stats.monthly.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                        <p className="text-xs text-blue-400 mt-2 font-medium">Progress: 85% of target</p>
                    </GlassCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <GlassCard className="p-8 border-l-4 border-l-purple-500">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                <Trophy size={24} />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Most Used Table</span>
                        </div>
                        <h2 className="text-4xl font-black text-white">{stats.mostUsed.name}</h2>
                        <p className="text-xs text-purple-400 mt-2 font-medium">{stats.mostUsed.count} sessions this month</p>
                    </GlassCard>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard className="p-8 min-h-[400px]">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-primary" /> Revenue Growth
                    </h3>
                    <div className="h-64 flex items-end gap-3 px-4">
                        {[40, 60, 45, 90, 65, 80, 55, 70, 85, 95].map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-primary/20 to-primary/60 rounded-t-md transition-all hover:to-primary"
                                style={{ height: `${h}%` }}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 px-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        <span>Week 1</span>
                        <span>Week 2</span>
                        <span>Week 3</span>
                        <span>Week 4</span>
                    </div>
                </GlassCard>

                <GlassCard className="p-8">
                    <h3 className="text-lg font-bold mb-6">Recent Performance Details</h3>
                    <div className="space-y-4">
                        {[
                            { label: "Total Online Payments", value: "65%", color: "bg-blue-500" },
                            { label: "Morning vs Night Usage", value: "45/55", color: "bg-purple-500" },
                            { label: "Customer Return Rate", value: "78%", color: "bg-green-500" },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{item.label}</span>
                                    <span className="font-bold text-white">{item.value}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} opacity-60 w-3/4`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
