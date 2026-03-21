"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface AddKhataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddKhataModal({ isOpen, onClose, onSuccess }: AddKhataModalProps) {
    const [playerName, setPlayerName] = useState("");
    const [phone, setPhone] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/khata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName, phone })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to create account");
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

                <h2 className="text-2xl font-bold mb-6">New Khata Account</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Player Name *</label>
                        <input
                            type="text" required
                            value={playerName} onChange={e => setPlayerName(e.target.value)}
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="e.g. Rahul Sharma"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number (Optional)</label>
                        <input
                            type="tel"
                            value={phone} onChange={e => setPhone(e.target.value)}
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="e.g. 9876543210"
                        />
                    </div>

                    <button type="submit" disabled={submitting || !playerName} className="w-full py-4 rounded-xl font-bold text-black gold-gradient hover:opacity-90 disabled:opacity-50 mt-4 flex items-center justify-center">
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
                    </button>
                </form>
            </GlassCard>
        </div>
    );
}
