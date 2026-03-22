import { Product } from "@/types/database";

export const inventoryService = {
    async getProducts(): Promise<Product[]> {
        const res = await fetch('/api/inventory');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
        return data;
    },

    async addProduct(product: Partial<Product>): Promise<Product> {
        const res = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add product');
        return data;
    },

    async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
        const res = await fetch(`/api/inventory/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update product');
        return data;
    },

    async deleteProduct(id: string): Promise<void> {
        const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete product');
        }
    },

    async getSessionOrders(sessionId: string): Promise<any[]> {
        const res = await fetch(`/api/sessions/${sessionId}/orders`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch session orders');
        return data;
    },

    async addOrderItem(sessionId: string, productId: string, quantity: number, priceAtTime: number): Promise<any> {
        const res = await fetch('/api/sessions/add-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, productId, quantity, priceAtTime }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add order item');
        return data;
    }
};
