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
    const [activeTab, setActiveTab] = useState("profile");
    const [isSaving, setIsSaving] = useState(false);
    const [clubName, setClubName] = useState("Snooker Elite");
    const [contactEmail, setContactEmail] = useState("admin@snookerelite.com");
    const [currency, setCurrency] = useState("₹ (INR)");

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000); // Mock save
    };
    
    // Quick helper hook for Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
    };

    const renderTabButton = (id: string, icon: any, label: string) => {
        const isActive = activeTab === id;
        const Icon = icon;
        return (
            <button 
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left ${isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
                <Icon size={18} />
                {label}
            </button>
        );
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
                    {renderTabButton("profile", Store, "Club Profile")}
                    {renderTabButton("billing", CreditCard, "Billing & Rates")}
                    {renderTabButton("notifications", Bell, "Notifications")}
                    {renderTabButton("appearance", Palette, "Appearance")}
                    {renderTabButton("security", Shield, "Security")}
                </div>

                {/* Settings Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 space-y-6"
                    onKeyDown={handleKeyDown}
                >
                    {activeTab === "profile" && (
                        <>
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
                                    <div className="text-orange-400 mt-0.5"><Shield size={20} /></div>
                                    <div>
                                        <h4 className="font-semibold text-orange-400 mb-1">Database Sync Notice</h4>
                                        <p className="text-sm text-orange-400/80 leading-relaxed">
                                            Some system settings (like base rates, taxes, and shift constraints) are hardcoded into the Supabase database schema for performance reasons. To modify system-level policies, please update your `schema.sql`.
                                        </p>
                                    </div>
                                </div>
                            </GlassCard>
                        </>
                    )}

                    {activeTab === "billing" && (
                        <GlassCard className="p-8">
                            <div className="mb-6 pb-6 border-b border-white/10">
                                <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-primary" /> Billing & Rates</h2>
                                <p className="text-sm text-muted-foreground mt-1">Configure global flat rates and discounts.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex justify-between items-center">
                                    <div><p className="font-medium text-white">Enable Happy Hour Pricing</p><p className="text-xs text-muted-foreground">Automatically apply 20% discounts between 2PM-5PM</p></div>
                                    <div className="w-10 h-6 bg-primary/20 rounded-full flex items-center p-1 cursor-pointer"><div className="bg-primary w-4 h-4 rounded-full shadow-md transform translate-x-4"></div></div>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex justify-between items-center">
                                    <div><p className="font-medium text-white">Staff Discount Rate</p><p className="text-xs text-muted-foreground">Percentage discount applied for staff accounts</p></div>
                                    <Input defaultValue="15" className="w-20 text-center h-8 bg-black/40" />
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {activeTab === "notifications" && (
                        <GlassCard className="p-8">
                            <div className="mb-6 pb-6 border-b border-white/10">
                                <h2 className="text-xl font-bold flex items-center gap-2"><Bell className="text-primary" /> Notifications</h2>
                                <p className="text-sm text-muted-foreground mt-1">Manage system alerts and WhatsApp configurations.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-lg flex justify-between items-center">
                                    <div><p className="font-medium text-white">WhatsApp Auto-Receipts</p><p className="text-xs text-muted-foreground">Send an automatic generic receipt to the player's number</p></div>
                                    <div className="w-10 h-6 bg-primary/20 rounded-full flex items-center p-1 cursor-pointer"><div className="bg-primary w-4 h-4 rounded-full shadow-md transform translate-x-4"></div></div>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">WhatsApp API Provider Key</label>
                                    <Input type="password" value="*************************" readOnly className="h-10 bg-black/20 focus:border-primary/50 text-muted-foreground" />
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {activeTab === "appearance" && (
                        <GlassCard className="p-8">
                            <div className="mb-6 pb-6 border-b border-white/10">
                                <h2 className="text-xl font-bold flex items-center gap-2"><Palette className="text-primary" /> Appearance</h2>
                                <p className="text-sm text-muted-foreground mt-1">Customize the platform theme.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border-2 border-primary bg-black rounded-xl p-4 text-center cursor-pointer">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center text-primary"><Palette /></div>
                                    <p className="font-medium">Dark Premium (Selected)</p>
                                </div>
                                <div className="border border-white/10 bg-white/5 rounded-xl p-4 text-center cursor-pointer opacity-50">
                                    <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-3 flex items-center justify-center text-white"><Store /></div>
                                    <p className="font-medium">Light Studio</p>
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {activeTab === "security" && (
                        <GlassCard className="p-8">
                            <div className="mb-6 pb-6 border-b border-white/10">
                                <h2 className="text-xl font-bold flex items-center gap-2"><Shield className="text-primary" /> Security</h2>
                                <p className="text-sm text-muted-foreground mt-1">Review active sessions and login policies.</p>
                            </div>
                            <div className="space-y-4 flex flex-col">
                                <Button variant="outline" className="w-full sm:w-auto self-start border-red-500/50 text-red-400 hover:bg-red-500/10">
                                    Force Logout All Devices
                                </Button>
                                <Button variant="outline" className="w-full sm:w-auto self-start border-white/10 hover:bg-white/5">
                                    Reset Admin Password
                                </Button>
                            </div>
                        </GlassCard>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
