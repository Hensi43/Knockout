import DashboardLayout from "@/components/layout/dashboard-layout";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold gold-text-gradient">Manager Overview</h1>
                <p className="text-muted-foreground">Welcome back. Here's what's happening at your club today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Stats cards will go here */}
                {[
                    { label: "Active Tables", value: "8 / 12", color: "text-blue-400" },
                    { label: "Revenue Today", value: "₹42,050", color: "text-green-400" },
                    { label: "Ongoing Sessions", value: "6", color: "text-primary" },
                    { label: "Average Duration", value: "1h 20m", color: "text-purple-400" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 rounded-2xl border border-white/5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl min-h-[400px]">
                    <h3 className="text-lg font-semibold mb-6">Recent Sessions</h3>
                    <div className="text-muted-foreground text-sm text-center py-20 italic">
                        No recent sessions found.
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl h-fit">
                    <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
                    <div className="space-y-4">
                        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">Add New Table</button>
                        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">Generate Daily Report</button>
                        <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">Settings</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
