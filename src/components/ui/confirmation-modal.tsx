"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    isSubmitting?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = false,
    isSubmitting = false
}: ConfirmationModalProps) {
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
                                disabled={isSubmitting}
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-6 flex flex-col items-center">
                                {isDanger && (
                                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
                                        <AlertTriangle size={24} />
                                    </div>
                                )}
                                <h2 className="text-2xl font-bold gold-text-gradient">{title}</h2>
                                <p className="text-sm text-muted-foreground mt-2 px-2">{description}</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isSubmitting}>
                                    {cancelText}
                                </Button>
                                <Button
                                    variant={isDanger ? "outline" : "primary"}
                                    className={isDanger ? "flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10" : "flex-1"}
                                    onClick={onConfirm}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Processing..." : confirmText}
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
