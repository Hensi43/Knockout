"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Clock, IndianRupee, Tag, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceStrict } from "date-fns";
import { inventoryService } from "@/services/inventory-service";
import { Product, OrderItem } from "@/types/database";

interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (total: number, discount: number, customer?: { name: string, phone: string, sendReceipt: boolean }) => void;
    sessionData: {
        id: string;
        startTime: string;
        hourlyRate: number;
        tableName: string;
    };
    error?: string;
    isSubmitting?: boolean;
}

export function BillingModal({ isOpen, onClose, onConfirm, sessionData, error, isSubmitting }: BillingModalProps) {
    const [duration, setDuration] = useState("");
    const [billingAmount, setBillingAmount] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [showSnackSelector, setShowSnackSelector] = useState(false);

    // WhatsApp CRM fields
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [sendReceipt, setSendReceipt] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const start = new Date(sessionData.startTime);
            const diffInMinutes = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60));

            const ratePerMin = sessionData.hourlyRate;
            const amount = Math.round(diffInMinutes * ratePerMin); // Round figures only

            setDuration(formatDistanceStrict(start, now));
            setBillingAmount(amount);

            // Initialize products and existing orders
            inventoryService.getProducts().then(setProducts);
            inventoryService.getSessionOrders(sessionData.id).then(setOrders);
        }
    }, [isOpen, sessionData]);

    const snackTotal = orders.reduce((acc, order) => acc + (order.price_at_time * order.quantity), 0);

    useEffect(() => {
        setFinalAmount(Math.max(0, (billingAmount + snackTotal) - discount));
    }, [discount, billingAmount, snackTotal]);

    const handleAddSnack = async (product: Product) => {
        try {
            const newOrder = await inventoryService.addOrderItem(sessionData.id, product.id, 1, product.price);
            setOrders([...orders, { ...newOrder, products: product }]);
        } catch (error) {
            console.error("Error adding snack:", error);
        }
    };

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

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

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
                                    <p className="font-semibold">₹{sessionData.hourlyRate}/min</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Table Charges</span>
                                    <span className="font-medium">₹{billingAmount}</span>
                                </div>

                                {orders.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Snacks & Drinks</span>
                                            <span className="font-medium">₹{snackTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="pl-4 space-y-1">
                                            {orders.map((order, idx) => (
                                                <div key={idx} className="flex justify-between text-[11px] text-muted-foreground">
                                                    <span>{order.products?.name} x {order.quantity}</span>
                                                    <span>₹{(order.price_at_time * order.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full h-8 border border-white/5 hover:bg-white/5 text-xs"
                                        onClick={() => setShowSnackSelector(!showSnackSelector)}
                                    >
                                        <Plus size={14} className="mr-1" /> Add Snacks/Drinks
                                    </Button>

                                    <AnimatePresence>
                                        {showSnackSelector && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden bg-white/5 rounded-lg mt-2 p-2 grid grid-cols-2 gap-2"
                                            >
                                                {products.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => handleAddSnack(p)}
                                                        className="text-[10px] p-2 rounded border border-white/5 hover:bg-white/10 text-left flex justify-between items-center"
                                                    >
                                                        <span className="truncate">{p.name}</span>
                                                        <span className="text-primary font-bold">₹{p.price}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-xs font-medium tracking-wider flex items-center gap-2 cursor-pointer" onClick={() => setSendReceipt(!sendReceipt)}>
                                            <span className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${sendReceipt ? 'bg-primary border-primary text-black' : 'border-white/20 bg-transparent'}`}>
                                                {sendReceipt && (
                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </span>
                                            Send WhatsApp Receipt & Save to CRM
                                        </label>
                                    </div>
                                    <AnimatePresence>
                                        {sendReceipt && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                                <Input
                                                    placeholder="Player Name"
                                                    value={customerName}
                                                    onChange={e => setCustomerName(e.target.value)}
                                                    className="h-10 bg-black/20 focus:border-primary/50 border-white/10 text-sm"
                                                />
                                                <Input
                                                    placeholder="Phone Number (e.g. 9876543210)"
                                                    value={customerPhone}
                                                    onChange={e => setCustomerPhone(e.target.value)}
                                                    className="h-10 bg-black/20 focus:border-primary/50 border-white/10 text-sm"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-lg font-bold">Total Amount</span>
                                    <span className="text-2xl font-black text-primary">₹{finalAmount}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={() => onConfirm(finalAmount, discount, { name: customerName, phone: customerPhone, sendReceipt })}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Processing..." : "Process Payment"}
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
