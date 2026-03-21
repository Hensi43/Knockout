"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Users, Search, Phone, History, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchCustomers = async () => {
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            setCustomers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient flex items-center gap-3">
                        <Users className="text-primary" /> CRM & Marketing
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage players, track visits, and re-engage your customers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <GlassCard className="p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mx-10 -my-10" />
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Contacts</p>
                    <p className="text-3xl font-bold text-white">{customers.length}</p>
                </GlassCard>
                <GlassCard className="p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mx-10 -my-10" />
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Repeat Visitors</p>
                    <p className="text-3xl font-bold text-green-400">{customers.filter(c => c.total_visits > 1).length}</p>
                </GlassCard>
                <GlassCard className="p-6 rounded-2xl flex flex-col justify-center items-center text-center border-dashed border-primary/30 hover:bg-white/5 transition-all cursor-pointer">
                    <MessageSquare className="text-primary mb-2" size={24} />
                    <p className="font-bold">Send SMS Blast</p>
                    <p className="text-xs text-muted-foreground">Coming soon</p>
                </GlassCard>
            </div>

            <GlassCard className="p-6 rounded-2xl">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading customer database...</div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No customers found. Enable WhatsApp receipts during checkout to build your database!</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-muted-foreground text-sm">
                                    <th className="font-semibold p-4 pt-0">Name</th>
                                    <th className="font-semibold p-4 pt-0">Phone</th>
                                    <th className="font-semibold p-4 pt-0 text-center">Total Visits</th>
                                    <th className="font-semibold p-4 pt-0 text-right">Last Visit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-medium text-white group-hover:text-primary transition-colors">{customer.name}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Phone size={14} /> {customer.phone}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center justify-center bg-white/5 disabled:opacity-50 px-3 py-1 rounded-full text-sm font-medium border border-white/10">
                                                <History size={14} className="mr-2 opacity-70" /> {customer.total_visits}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(customer.last_visit), { addSuffix: true })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>
        </DashboardLayout>
    );
}
