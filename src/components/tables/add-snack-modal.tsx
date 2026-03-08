"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { X, Search, Plus } from "lucide-react";
import { inventoryService } from "@/services/inventory-service";
import { Product } from "@/types/database";

interface AddSnackModalProps {
    sessionId: string;
    onClose: () => void;
    onAdded: () => void;
}

export function AddSnackModal({ sessionId, onClose, onAdded }: AddSnackModalProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [addingId, setAddingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await inventoryService.getProducts();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAdd = async (product: Product) => {
        setAddingId(product.id);
        try {
            const res = await fetch('/api/sessions/add-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    productId: product.id,
                    quantity: 1,
                    priceAtTime: product.price
                })
            });
            if (!res.ok) throw new Error('Failed to add item');
            onAdded();
            onClose();
        } catch (error) {
            console.error("Error adding snack:", error);
            alert("Failed to add snack. Please try again.");
        } finally {
            setAddingId(null);
        }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <GlassCard className="w-full max-w-md p-6 relative border border-white/10 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">Add Snack to Session</h2>
                    <p className="text-sm text-muted-foreground mt-1">Select an item to add to the bill.</p>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading inventory...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No items found.</div>
                    ) : (
                        filtered.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div>
                                    <p className="font-medium text-white">{product.name}</p>
                                    <p className="text-sm text-primary font-mono">₹{product.price}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 border-primary/20 hover:bg-primary/20 text-primary"
                                    onClick={() => handleAdd(product)}
                                    disabled={addingId === product.id || product.stock <= 0}
                                >
                                    {addingId === product.id ? 'Adding...' : product.stock <= 0 ? 'Out of Stock' : <><Plus size={14} /> Add</>}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </div>
    );
}
