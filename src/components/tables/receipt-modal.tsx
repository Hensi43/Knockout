"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { X, Printer, CheckCircle2 } from "lucide-react";

export interface ReceiptData {
    session: any;
    breakdown: {
        hours: number;
        hourlyRate: number;
        timeCost: number;
        snacks: {
            name: string;
            quantity: number;
            price: number;
            total: number;
        }[];
        snacksTotal: number;
        subtotal: number;
        discount: number;
        finalAmount: number;
    }
}

interface ReceiptModalProps {
    receipt: ReceiptData;
    tableName: string;
    onClose: () => void;
}

export function ReceiptModal({ receipt, tableName, onClose }: ReceiptModalProps) {
    const { breakdown } = receipt;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0 text-white print:text-black">
            <GlassCard className="w-full max-w-sm p-6 relative border border-white/10 animate-in fade-in zoom-in duration-300 print:shadow-none print:border-none print:text-black">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors print:hidden"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-3 print:hidden">
                        <CheckCircle2 size={24} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-wider gold-text-gradient print:text-black">Snooker Elite</h2>
                    <p className="text-xs text-muted-foreground mt-1 print:text-gray-500">Official Receipt</p>
                </div>

                <div className="space-y-4 mb-6 text-sm">
                    <div className="flex justify-between border-b border-white/10 print:border-gray-200 pb-2">
                        <span className="text-muted-foreground print:text-gray-600">Table</span>
                        <span className="font-bold">{tableName}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 print:border-gray-200 pb-2">
                        <span className="text-muted-foreground print:text-gray-600">Date</span>
                        <span className="font-mono">{new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="pt-2">
                        <h4 className="font-bold mb-2 uppercase text-xs tracking-wider text-primary print:text-black">Table Time</h4>
                        <div className="flex justify-between pl-2 border-l-2 border-primary/30 print:border-gray-300">
                            <span>{Math.floor(breakdown.hours)}h {Math.round((breakdown.hours % 1) * 60)}m @ ₹{breakdown.hourlyRate}/hr</span>
                            <span className="font-mono">₹{breakdown.timeCost.toFixed(2)}</span>
                        </div>
                    </div>

                    {breakdown.snacks.length > 0 && (
                        <div className="pt-2">
                            <h4 className="font-bold mb-2 uppercase text-xs tracking-wider text-primary print:text-black">Snacks & Drinks</h4>
                            <div className="space-y-2 border-l-2 border-primary/30 print:border-gray-300 pl-2">
                                {breakdown.snacks.map((snack, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span>{snack.quantity}x {snack.name}</span>
                                        <span className="font-mono">₹{snack.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t-2 border-dashed border-white/20 print:border-gray-300 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground print:text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-mono">₹{breakdown.subtotal.toFixed(2)}</span>
                    </div>
                    {breakdown.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-400">
                            <span>Discount</span>
                            <span className="font-mono">-₹{breakdown.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-end pt-2">
                        <span className="text-lg font-bold">Total Paid</span>
                        <span className="text-3xl font-black text-white print:text-black">₹{breakdown.finalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-8 text-center text-[10px] text-muted-foreground print:text-gray-500 uppercase tracking-widest">
                    Thank you for playing!
                </div>

                <div className="mt-6 flex gap-3 print:hidden">
                    <Button variant="outline" className="flex-1" onClick={handlePrint}>
                        <Printer size={16} className="mr-2" /> Print
                    </Button>
                    <Button variant="primary" className="flex-1" onClick={onClose}>
                        Done
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
}
