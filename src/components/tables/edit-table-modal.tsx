"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EditTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, rate: number) => void;
    initialName: string;
    initialRate: number;
    error?: string;
    isSubmitting?: boolean;
}

export function EditTableModal({ isOpen, onClose, onConfirm, initialName, initialRate, error, isSubmitting }: EditTableModalProps) {
    const [name, setName] = useState(initialName);
    const [rate, setRate] = useState(initialRate);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setRate(initialRate);
        }
    }, [isOpen, initialName, initialRate]);

    return (
        <AnimatePresence>
            {isOpen && (
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
                                <h2 className="text-2xl font-bold gold-text-gradient">Edit Table</h2>
                                <p className="text-sm text-muted-foreground mt-1">Update details for this snooker table.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Table Name / ID</label>
                                    <Input
                                        placeholder="e.g., Table 1, VIP Table"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Per Minute Rate (₹)</label>
                                    <Input
                                        type="number"
                                        placeholder="3.50"
                                        step="0.1"
                                        value={rate}
                                        onChange={(e) => setRate(Number(e.target.value))}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={() => onConfirm(name, rate)}
                                        disabled={!name || isSubmitting}
                                    >
                                        {isSubmitting ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
