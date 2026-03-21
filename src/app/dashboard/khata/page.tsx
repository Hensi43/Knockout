"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Plus, Search, BookText, ArrowRight } from "lucide-react";
import { AddKhataModal } from "@/components/features/khata/add-khata-modal";
import { KhataAccountModal } from "@/components/features/khata/khata-account-modal";

export default function KhataPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);

    const fetchAccounts = async () => {
        try {
            const res = await fetch('/api/khata');
            const data = await res.json();
            setAccounts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const filteredAccounts = accounts.filter(acc =>
        acc.player_name.toLowerCase().includes(search.toLowerCase()) ||
        (acc.phone && acc.phone.includes(search))
    );

    const totalOutstanding = accounts.reduce((sum, acc) => sum + Number(acc.total_due), 0);

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient flex items-center gap-3">
                        <BookText className="text-primary" /> Digital Khata
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage player tabs and unpaid balances.</p>
                </div>

                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black gold-gradient hover:opacity-90 transition-all"
                >
                    <Plus size={20} /> Add Account
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <GlassCard className="p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mx-10 -my-10" />
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Outstanding</p>
                    <p className="text-3xl font-bold text-orange-400">₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </GlassCard>
                <GlassCard className="p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mx-10 -my-10" />
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Active Accounts</p>
                    <p className="text-3xl font-bold text-primary">{accounts.filter(a => Number(a.total_due) > 0).length}</p>
                </GlassCard>
                <GlassCard className="p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mx-10 -my-10" />
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Accounts</p>
                    <p className="text-3xl font-bold text-white">{accounts.length}</p>
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
                    <div className="text-center py-12 text-muted-foreground">Loading accounts...</div>
                ) : filteredAccounts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No accounts found.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAccounts.map(account => (
                            <div
                                key={account.id}
                                onClick={() => setSelectedAccount(account)}
                                className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{account.player_name}</h3>
                                        {account.phone && <p className="text-sm text-muted-foreground">{account.phone}</p>}
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${Number(account.total_due) > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {Number(account.total_due) > 0 ? 'Due' : 'Clear'}
                                    </div>
                                </div>

                                <div className="flex items-end justify-between mt-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                                        <p className="text-xl font-bold text-white">₹{Number(account.total_due).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            <AddKhataModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={fetchAccounts}
            />

            {selectedAccount && (
                <KhataAccountModal
                    isOpen={!!selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                    account={selectedAccount}
                    onSuccess={() => {
                        fetchAccounts();
                        setSelectedAccount(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}
