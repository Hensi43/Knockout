"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
    Settings2,
    Store,
    Bell,
    Shield,
    Palette,
    Save,
    CreditCard
} from "lucide-react";

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [clubName, setClubName] = useState("Snooker Elite");
    const [contactEmail, setContactEmail] = useState("admin@snookerelite.com");
    const [currency, setCurrency] = useState("₹ (INR)");

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000); // Mock save
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient">Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your club preferences and system configurations.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? (
                        <>Saving...</>
                    ) : (
                        <>
                            <Save size={16} />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings Navigation */}
                <div className="w-full lg:w-64 shrink-0 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl font-medium text-sm transition-all text-left">
                        <Store size={18} />
                        Club Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-xl font-medium text-sm transition-all text-left">
                        <CreditCard size={18} />
                        Billing & Rates
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-xl font-medium text-sm transition-all text-left">
                        <Bell size={18} />
                        Notifications
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-xl font-medium text-sm transition-all text-left">
                        <Palette size={18} />
                        Appearance
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-white/5 hover:text-white rounded-xl font-medium text-sm transition-all text-left">
                        <Shield size={18} />
                        Security
                    </button>
                </div>

                {/* Settings Content */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 space-y-6"
                >
                    <GlassCard className="p-8">
                        <div className="mb-6 pb-6 border-b border-white/10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Store className="text-primary" />
                                Club Profile
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Update your establishment's public-facing metadata.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Club Name</label>
                                    <Input
                                        value={clubName}
                                        onChange={(e) => setClubName(e.target.value)}
                                        className="h-12 bg-black/20 focus:border-primary/50 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact Email</label>
                                    <Input
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        className="h-12 bg-black/20 focus:border-primary/50 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Default Currency</label>
                                    <Input
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="h-12 bg-black/20 focus:border-primary/50 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timezone</label>
                                    <Input
                                        value="Asia/Kolkata (IST)"
                                        disabled
                                        className="h-12 bg-white/5 border-white/5 text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8">
                        <div className="mb-6 pb-6 border-b border-white/10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Settings2 className="text-primary" />
                                System Configuration
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Settings managed by the database schema and environment variables.
                            </p>
                        </div>

                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex gap-4">
                            <div className="text-orange-400 mt-0.5">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-orange-400 mb-1">Database Sync Notice</h4>
                                <p className="text-sm text-orange-400/80 leading-relaxed">
                                    Some system settings (like base rates, taxes, and shift constraints) are hardcoded into the Supabase database schema for performance reasons. To modify system-level policies, please update your `schema.sql`.
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
