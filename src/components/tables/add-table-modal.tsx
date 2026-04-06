"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Layout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, rate: number) => void;
    error?: string;
    isSubmitting?: boolean;
}

export function AddTableModal({ isOpen, onClose, onConfirm, error, isSubmitting }: AddTableModalProps) {
    const [name, setName] = useState("");
    const [rate, setRate] = useState(3.5);

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
                                <h2 className="text-2xl font-bold gold-text-gradient">Add New Table</h2>
                                <p className="text-sm text-muted-foreground mt-1">Configure a new table for your club.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6" onKeyDown={(e) => {
                                if (e.key === 'Enter' && name && !isSubmitting) {
                                    onConfirm(name, rate);
                                }
                            }}>
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
                                        {isSubmitting ? "Creating..." : "Create Table"}
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
