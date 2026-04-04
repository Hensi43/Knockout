"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { X, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SnookerTable } from "@/types/database";

interface TransferSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (newTableId: string) => void;
    availableTables: SnookerTable[];
    error?: string;
    isSubmitting?: boolean;
}

export function TransferSessionModal({ isOpen, onClose, onConfirm, availableTables, error, isSubmitting }: TransferSessionModalProps) {
    const [selectedTableId, setSelectedTableId] = useState<string>("");

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
                                <h2 className="text-2xl font-bold gold-text-gradient flex justify-center items-center gap-2">
                                    <ArrowRightLeft size={24} /> Transfer Session
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Move this active session to an available table.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select New Table</label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {availableTables.length === 0 ? (
                                            <p className="text-sm text-muted-foreground col-span-2 text-center py-4">No available tables right now.</p>
                                        ) : (
                                            availableTables.map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setSelectedTableId(t.id)}
                                                    className={`p-3 rounded border text-left flex flex-col transition-all ${selectedTableId === t.id ? 'border-primary bg-primary/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                                                >
                                                    <span className="font-bold">{t.name}</span>
                                                    <span className="text-xs text-muted-foreground">₹{t.hourly_rate}/min</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={() => onConfirm(selectedTableId)}
                                        disabled={!selectedTableId || isSubmitting}
                                    >
                                        {isSubmitting ? "Transferring..." : "Confirm Transfer"}
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
