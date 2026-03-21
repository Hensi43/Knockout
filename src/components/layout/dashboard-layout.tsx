import { Sidebar } from "./sidebar";
import { ShiftManager } from "@/components/features/shifts/shift-manager";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ShiftManager>
            <div className="min-h-screen bg-[#050505] flex">
                <Sidebar />
                <main className="flex-1 ml-64 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </ShiftManager>
    );
}
