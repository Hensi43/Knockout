"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Plus, PackageSearch, Tag, Edit, Trash2 } from "lucide-react";
import { inventoryService } from "@/services/inventory-service";
import { Product } from "@/types/database";

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddMode, setIsAddMode] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: 'snack' });

    useEffect(() => {
        fetchProducts();
    }, []);

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

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price) return;

        try {
            const added = await inventoryService.addProduct({
                name: newProduct.name,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock) || 0,
                category: newProduct.category
            });
            setProducts([...products, added]);
            setIsAddMode(false);
            setNewProduct({ name: '', price: '', stock: '', category: 'snack' });
        } catch (error) {
            console.error("Failed to add product:", error);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await inventoryService.deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete product:", error);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient font-serif">Inventory & Snacks</h1>
                    <p className="text-muted-foreground mt-1">Manage food, drinks, and club merchandise.</p>
                </div>
                <Button onClick={() => setIsAddMode(!isAddMode)} className="flex items-center gap-2">
                    <Plus size={18} /> Add New Item
                </Button>
            </div>

            {isAddMode && (
                <GlassCard className="p-6 mb-8 border border-primary/30">
                    <h3 className="text-lg font-bold mb-4">Add New Item</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Product Name"
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary w-full"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price (₹)"
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary w-full"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Initial Stock"
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary w-full"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        />
                        <select
                            className="bg-[#111] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary w-full"
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        >
                            <option value="snack">Snack</option>
                            <option value="drink">Drink</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="ghost" onClick={() => setIsAddMode(false)}>Cancel</Button>
                        <Button onClick={handleAddProduct}>Save Product</Button>
                    </div>
                </GlassCard>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="glass-card p-6 h-32 rounded-2xl animate-pulse" />)
                ) : products.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground glass-card rounded-2xl">
                        <PackageSearch size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No products found in inventory.</p>
                        <p className="text-sm mt-1">Click "Add New Item" to create your first product.</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <GlassCard key={product.id} className="p-5 flex flex-col group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 flex gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all bg-black/60 backdrop-blur-sm rounded-bl-xl">
                                <button className="text-blue-400 hover:text-blue-300">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-300">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="p-3 bg-white/5 w-fit rounded-lg mb-4 text-primary">
                                <Tag size={20} />
                            </div>

                            <h3 className="font-bold text-lg leading-tight mb-1">{product.name}</h3>
                            <div className="flex justify-between items-end mt-auto pt-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price</p>
                                    <p className="font-mono text-green-400 font-bold">₹{product.price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Stock</p>
                                    <p className={`font-mono font-bold ${product.stock > 10 ? 'text-white' : 'text-amber-400'}`}>
                                        {product.stock}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
