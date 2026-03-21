"use client";

import { useState } from "react";
import { Loader2, DollarSign, X } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface EndShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    shiftId: string;
    onSuccess: () => void;
}

export function EndShiftModal({ isOpen, onClose, shiftId, onSuccess }: EndShiftModalProps) {
    const [declaredCash, setDeclaredCash] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!declaredCash) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/shifts/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shiftId, declaredCash: Number(declaredCash) })
            });
            const data = await res.json();

            if (res.ok) {
                setResult(data);
                // Wait a moment then log out
                setTimeout(() => {
                    onSuccess();
                }, 4000);
            } else {
                alert(data.error || "Failed to end shift");
            }
        } catch (error) {
            console.error("Error ending shift:", error);
            alert("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!result ? onClose : undefined} />

            <GlassCard className="w-full max-w-md p-6 rounded-3xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
                {!result && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={20} className="text-muted-foreground" />
                    </button>
                )}

                {result ? (
                    <div className="text-center py-6">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 ${result.shortage <= 0 ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            <DollarSign size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Shift Closed</h3>

                        <div className="space-y-4 my-8 text-left bg-white/5 p-4 rounded-xl">
                            <div className="flex justify-between">
                                <span className="text-gray-400">System Expected:</span>
                                <span className="font-bold">₹{result.expected_system_cash}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">You Declared:</span>
                                <span className="font-bold">₹{result.declared_cash}</span>
                            </div>
                            <div className="h-px bg-white/10 my-2" />
                            <div className="flex justify-between text-lg">
                                <span className="text-gray-400">Difference:</span>
                                <span className={`font-bold ${result.shortage > 0 ? 'text-red-400' : result.shortage < 0 ? 'text-green-400' : 'text-white'}`}>
                                    {result.shortage > 0 ? `-₹${result.shortage}` : result.shortage < 0 ? `+₹${Math.abs(result.shortage)}` : '₹0'}
                                </span>
                            </div>
                        </div>

                        <p className="text-muted-foreground animate-pulse">Logging out safely...</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-2xl font-bold mb-2 pt-2">Blind Cash Drop</h2>
                        <p className="text-muted-foreground mb-6">Count the cash in your drawer and enter the total amount to close your shift.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Total Cash Counted (₹)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-bold">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={declaredCash}
                                        onChange={(e) => setDeclaredCash(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-mono text-lg"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !declaredCash}
                                className="w-full py-4 rounded-xl font-bold text-white bg-red-500/80 hover:bg-red-500 border border-red-500/50 transition-all flex justify-center items-center disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : "Declare & Close Shift"}
                            </button>
                        </form>
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
