"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { X, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StartSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (playerCount: number) => void;
    tableName: string;
    error?: string;
    isSubmitting?: boolean;
}

export function StartSessionModal({ isOpen, onClose, onConfirm, tableName, error, isSubmitting }: StartSessionModalProps) {
    const [playerCount, setPlayerCount] = useState(2);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm"
                >
                    <GlassCard variant="premium" className="p-8 border-white/10 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold gold-text-gradient">Start Session</h2>
                            <p className="text-sm text-muted-foreground mt-1">{tableName}</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block text-center">
                                    Number of Players
                                </label>
                                <div className="flex items-center justify-center gap-4">
                                    {[1, 2, 3, 4].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setPlayerCount(num)}
                                            className={`w-12 h-12 rounded-xl border transition-all flex items-center justify-center font-bold ${playerCount === num
                                                    ? "bg-primary text-black border-primary"
                                                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={() => onConfirm(playerCount)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Starting..." : "Start Playing"}
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
