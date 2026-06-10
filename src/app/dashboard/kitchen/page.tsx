"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, Play, AlertTriangle, RefreshCcw, Trash2, Soup } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface KOTItem {
    id: string;
    session_id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    status: 'pending' | 'preparing' | 'served';
    created_at: string;
    products?: {
        name: string;
    };
    sessions?: {
        id: string;
        table_id: string;
        snooker_tables?: {
            name: string;
        } | null;
    } | null;
}

export default function KitchenKOTPage() {
    const [kotItems, setKotItems] = useState<KOTItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingIds, setUpdatingIds] = useState<string[]>([]);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchKOTItems = async () => {
        try {
            setError(null);
            const res = await fetch('/api/kot');
            if (!res.ok) throw new Error('Failed to fetch KOT tickets');
            const data = await res.json();
            setKotItems(data || []);
        } catch (err: any) {
            console.error("Error fetching KOT:", err);
            setError(err.message || 'Failed to sync with kitchen queue.');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and auto polling every 10 seconds
    useEffect(() => {
        fetchKOTItems();
        
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchKOTItems, 10000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    // Hook to force re-render every minute to keep date-fns relative times fresh
    const [, setTimeTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTimeTick(prev => prev + 1), 30000);
        return () => clearInterval(timer);
    }, []);

    const handleUpdateStatus = async (itemId: string, currentStatus: string, action: 'next' | 'cancel') => {
        let newStatus: 'pending' | 'preparing' | 'served' | 'cancelled';
        
        if (action === 'cancel') {
            newStatus = 'cancelled';
        } else {
            newStatus = currentStatus === 'pending' ? 'preparing' : 'served';
        }

        setUpdatingIds(prev => [...prev, itemId]);
        try {
            const res = await fetch(`/api/kot/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update order status');
            }

            // Instantly update local state for fast UI feedback
            if (newStatus === 'cancelled' || newStatus === 'served') {
                setKotItems(prev => prev.filter(item => item.id !== itemId));
            } else {
                setKotItems(prev => prev.map(item => 
                    item.id === itemId ? { ...item, status: newStatus } : item
                ));
            }
        } catch (err: any) {
            console.error("Failed to update KOT item:", err);
            alert(err.message || "Failed to update item status.");
        } finally {
            setUpdatingIds(prev => prev.filter(id => id !== itemId));
        }
    };

    // Group items by session / table
    const groupedTickets = kotItems.reduce<Record<string, { tableName: string, items: KOTItem[] }>>((acc, item) => {
        const sessionId = item.session_id;
        const tableName = item.sessions?.snooker_tables?.name || 'Unknown Table';
        
        if (!acc[sessionId]) {
            acc[sessionId] = { tableName, items: [] };
        }
        acc[sessionId].items.push(item);
        return acc;
    }, {});

    const ticketsList = Object.entries(groupedTickets).map(([sessionId, data]) => ({
        sessionId,
        ...data
    }));

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient flex items-center gap-2">
                        <Soup size={32} className="text-primary" /> Kitchen Queue & KOT
                    </h1>
                    <p className="text-muted-foreground mt-1">Live snack & beverage orders sent from snooker tables.</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-white/10 bg-white/5 text-primary focus:ring-0 focus:ring-offset-0"
                        />
                        Auto-poll (10s)
                    </label>

                    <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5" onClick={fetchKOTItems} disabled={loading}>
                        <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
                    <AlertTriangle size={20} />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card h-64 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : ticketsList.length === 0 ? (
                <div className="py-24 text-center glass-card rounded-2xl border-dashed border-white/10 flex flex-col items-center justify-center">
                    <CheckCircle2 size={48} className="text-green-500/30 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Kitchen is Clear!</h3>
                    <p className="text-muted-foreground max-w-sm">No pending or preparing orders. Staff can order items from Table details.</p>
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {ticketsList.map((ticket) => {
                            // Sort items so pending comes first, then preparing
                            const sortedItems = [...ticket.items].sort((a, b) => {
                                if (a.status === 'pending' && b.status === 'preparing') return -1;
                                if (a.status === 'preparing' && b.status === 'pending') return 1;
                                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                            });

                            // Get the oldest order time for this ticket
                            const oldestTime = new Date(
                                Math.min(...ticket.items.map(item => new Date(item.created_at).getTime()))
                            );

                            return (
                                <motion.div
                                    key={ticket.sessionId}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <GlassCard variant="premium" className="p-6 border-white/5 flex flex-col h-full">
                                        {/* Ticket Header */}
                                        <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{ticket.tableName}</h3>
                                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                    <Clock size={12} className="text-primary" />
                                                    Ordered {formatDistanceToNow(oldestTime, { addSuffix: true })}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                                                {ticket.items.length} {ticket.items.length === 1 ? 'Item' : 'Items'}
                                            </span>
                                        </div>

                                        {/* Ticket Items List */}
                                        <div className="flex-1 space-y-3">
                                            {sortedItems.map((item) => (
                                                <div 
                                                    key={item.id} 
                                                    className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 group relative overflow-hidden"
                                                >
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-bold text-primary text-sm">
                                                                {item.quantity}x
                                                            </span>
                                                            <p className="font-medium text-white truncate text-sm">
                                                                {item.products?.name || 'Unknown Snack'}
                                                            </p>
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 inline-block ${
                                                            item.status === 'pending' ? 'text-amber-400' : 'text-blue-400'
                                                        }`}>
                                                            {item.status}
                                                        </span>
                                                    </div>

                                                    {/* Action Buttons per Item */}
                                                    <div className="flex items-center gap-1">
                                                        {item.status === 'pending' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(item.id, 'pending', 'next')}
                                                                    disabled={updatingIds.includes(item.id)}
                                                                    className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors border border-amber-500/20"
                                                                    title="Start Preparing"
                                                                >
                                                                    <Play size={14} fill="currentColor" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(item.id, 'pending', 'cancel')}
                                                                    disabled={updatingIds.includes(item.id)}
                                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                                                                    title="Cancel Item"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleUpdateStatus(item.id, 'preparing', 'next')}
                                                                disabled={updatingIds.includes(item.id)}
                                                                className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors border border-green-500/20"
                                                                title="Mark Served"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}
        </DashboardLayout>
    );
}
