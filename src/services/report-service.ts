export const reportService = {
    async getDailyRevenue() {
        const res = await fetch('/api/reports/dashboard');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch');
        return data.revenueToday;
    },

    async getMonthlyRevenue() {
        const res = await fetch('/api/reports/stats');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch');
        return data.monthlyRevenue;
    },

    async getMostUsedTable() {
        const res = await fetch('/api/reports/stats');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch');
        return data.mostUsedTable;
    },

    async getRevenueStats() {
        const res = await fetch('/api/reports/stats');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch');
        return data.revenueStats;
    },

    async getDashboardStats() {
        const res = await fetch('/api/reports/dashboard');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch');
        return data;
    }
};
