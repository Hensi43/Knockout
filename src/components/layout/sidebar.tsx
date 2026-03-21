"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Table as TableIcon,
    Clock,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight,
    Package,
    BookText,
    Users
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { EndShiftModal } from "@/components/features/shifts/end-shift-modal";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tables", href: "/dashboard/tables", icon: TableIcon },
    { name: "Active Sessions", href: "/dashboard/sessions", icon: Clock },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    { name: "Khata (Ledger)", href: "/dashboard/khata", icon: BookText },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const supabase = createSupabaseBrowserClient();
    const [showEndShift, setShowEndShift] = useState(false);
    const [currentShiftId, setCurrentShiftId] = useState("");

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    const handleEndShiftClick = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            try {
                const res = await fetch(`/api/shifts/current?userId=${user.id}`);
                const shift = await res.json();
                if (shift && shift.id && !shift.error) {
                    setCurrentShiftId(shift.id);
                    setShowEndShift(true);
                    return;
                }
            } catch (err) {
                console.error("Error fetching shift", err);
            }
        }
        // Fallback if no active shift
        handleLogout();
    };

    return (
        <div className="w-64 h-screen glass border-r border-white/5 flex flex-col p-6 fixed left-0 top-0 z-50">
            <div className="mb-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                    <span className="text-black font-bold text-xs">SE</span>
                </div>
                <h2 className="text-xl font-bold gold-text-gradient">Snooker Elite</h2>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className={cn(isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            {isActive && <ChevronRight size={14} />}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <button
                    onClick={handleEndShiftClick}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all text-left"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">End Shift & Logout</span>
                </button>
            </div>

            <EndShiftModal
                isOpen={showEndShift}
                onClose={() => setShowEndShift(false)}
                shiftId={currentShiftId}
                onSuccess={handleLogout}
            />
        </div>
    );
}
