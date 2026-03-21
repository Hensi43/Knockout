"use client";

import { useState } from "react";
import { Loader2, X, PlusCircle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface KhataAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: any;
    onSuccess: () => void;
}

export function KhataAccountModal({ isOpen, onClose, account, onSuccess }: KhataAccountModalProps) {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<'CREDIT' | 'SETTLEMENT'>('SETTLEMENT');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !account) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/khata/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: account.id,
                    amount: Number(amount),
                    type,
                    description: description || (type === 'CREDIT' ? 'Manual Credit Addition' : 'Manual Settlement')
                })
            });

            if (res.ok) {
                onSuccess();
            } else {
                const data = await res.json();
                alert(data.error || "Transaction failed");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <GlassCard className="w-full max-w-md p-6 rounded-3xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors">
                    <X size={20} className="text-muted-foreground" />
                </button>

                <h2 className="text-2xl font-bold mb-1">{account.player_name}</h2>
                <p className="text-muted-foreground mb-6">Current Due: <span className="font-bold text-white">₹{Number(account.total_due).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setType('SETTLEMENT')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${type === 'SETTLEMENT' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10'}`}
                    >
                        <CheckCircle2 size={18} /> Receive Pymt
                    </button>
                    <button
                        onClick={() => setType('CREDIT')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${type === 'CREDIT' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'bg-white/5 text-muted-foreground border border-transparent hover:bg-white/10'}`}
                    >
                        <PlusCircle size={18} /> Add Credit
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Amount (₹) *</label>
                        <input
                            type="number" min="1" required
                            value={amount} onChange={e => setAmount(e.target.value)}
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-lg"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Description (Optional)</label>
                        <input
                            type="text"
                            value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder={type === 'SETTLEMENT' ? "e.g. Paid via UPI" : "e.g. Previous unpaid snacks"}
                        />
                    </div>

                    <button type="submit" disabled={submitting || !amount} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${type === 'SETTLEMENT' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'} disabled:opacity-50`}>
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : (type === 'SETTLEMENT' ? 'Record Payment' : 'Add to Tab')}
                    </button>
                </form>
            </GlassCard>
        </div>
    );
}
