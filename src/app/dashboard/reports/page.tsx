"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { reportService } from "@/services/report-service";
import { BarChart3, TrendingUp, Calendar, Trophy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
    const [stats, setStats] = useState({
        daily: 0,
        monthly: 0,
        mostUsed: { name: 'N/A', count: 0 },
        revenueStats: [],
        dashboardStats: { activeTables: 0, totalTables: 0, ongoingSessions: 0, averageSessionDuration: 0 },
        loading: true
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [daily, monthly, mostUsed, revenueStats, dashboardStats] = await Promise.all([
                reportService.getDailyRevenue(),
                reportService.getMonthlyRevenue(),
                reportService.getMostUsedTable(),
                reportService.getRevenueStats(),
                reportService.getDashboardStats()
            ]);
            setStats({ daily, monthly, mostUsed, revenueStats, dashboardStats, loading: false });
        } catch (error) {
            console.error("Error fetching stats:", error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    const handleExportCSV = () => {
        if (!stats.revenueStats || stats.revenueStats.length === 0) return;
        
        const headers = ["Date,Revenue (INR)"];
        const rows = stats.revenueStats.map((r: any) => `${r.date},${r.revenue}`);
        const csvContent = headers.concat(rows).join("\n");
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient font-serif">Financial Reports</h1>
                    <p className="text-muted-foreground mt-1">Detailed insights into your club's performance.</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2" onClick={handleExportCSV}>
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
                        <h2 className="text-4xl font-black text-white">₹{(stats.daily || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
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
                        <h2 className="text-4xl font-black text-white">₹{(stats.monthly || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
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
                        <BarChart3 size={20} className="text-primary" /> Revenue Growth (Last 30 Days)
                    </h3>
                    <div className="h-72 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenueStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="date"
                                    stroke="#525252"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => {
                                        const d = new Date(val);
                                        return `${d.getDate()}/${d.getMonth() + 1}`;
                                    }}
                                />
                                <YAxis
                                    stroke="#525252"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#d4af37' }}
                                    labelStyle={{ color: '#888' }}
                                    formatter={(value: any) => [`₹${value || 0}`, 'Revenue']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#d4af37"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard className="p-8">
                    <h3 className="text-lg font-bold mb-6">Recent Performance Details</h3>
                    <div className="space-y-4">
                        {[
                            { 
                                label: "Active vs Total Tables", 
                                value: `${stats.dashboardStats.activeTables} / ${stats.dashboardStats.totalTables}`, 
                                percentage: stats.dashboardStats.totalTables ? (stats.dashboardStats.activeTables / stats.dashboardStats.totalTables) * 100 : 0,
                                color: "bg-blue-500" 
                            },
                            { 
                                label: "Ongoing Sessions", 
                                value: stats.dashboardStats.ongoingSessions.toString(), 
                                percentage: stats.dashboardStats.activeTables ? (stats.dashboardStats.ongoingSessions / stats.dashboardStats.activeTables) * 100 : 0,
                                color: "bg-purple-500" 
                            },
                            { 
                                label: "Avg Session Duration", 
                                value: `${stats.dashboardStats.averageSessionDuration} mins`, 
                                percentage: Math.min((stats.dashboardStats.averageSessionDuration / 120) * 100, 100), // Assuming 2 hours is 100% for the bar
                                color: "bg-green-500" 
                            },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{item.label}</span>
                                    <span className="font-bold text-white">{item.value}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} opacity-60`} style={{ width: `${item.percentage}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}
