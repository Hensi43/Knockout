"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Clock, IndianRupee, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceStrict } from "date-fns";

interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (total: number, discount: number) => void;
    sessionData: {
        startTime: string;
        hourlyRate: number;
        tableName: string;
    };
}

export function BillingModal({ isOpen, onClose, onConfirm, sessionData }: BillingModalProps) {
    const [duration, setDuration] = useState("");
    const [billingAmount, setBillingAmount] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const start = new Date(sessionData.startTime);
            const diffInMinutes = Math.max(1, Math.floor((now.getTime() - start.getTime()) / (1000 * 60)));

            const ratePerMin = 3.5;
            const amount = Math.round(diffInMinutes * ratePerMin * 100) / 100;

            setDuration(formatDistanceStrict(start, now));
            setBillingAmount(amount);
            setFinalAmount(amount);
        }
    }, [isOpen, sessionData]);

    useEffect(() => {
        setFinalAmount(Math.max(0, billingAmount - discount));
    }, [discount, billingAmount]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md"
                >
                    <GlassCard variant="premium" className="p-8 border-white/10 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold gold-text-gradient">Finalize Billing</h2>
                            <p className="text-sm text-muted-foreground mt-1">Session summary for {sessionData.tableName}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Duration</p>
                                        <p className="font-semibold">{duration}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rate</p>
                                    <p className="font-semibold">₹3.5/min</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">₹{billingAmount.toFixed(2)}</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Tag size={12} /> Discount Amount (₹)
                                    </label>
                                    <Input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                        className="h-10 text-right font-mono"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-lg font-bold">Total Amount</span>
                                    <span className="text-2xl font-black text-primary">₹{finalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={() => onConfirm(finalAmount, discount)}
                                >
                                    Process Payment
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
