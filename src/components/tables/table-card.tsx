"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { SnookerTable, Session } from "@/types/database";
import { Circle, Play, StopCircle, MoreVertical, Clock, Plus, ArrowRightLeft, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddSnackModal } from "./add-snack-modal";

interface TableCardProps {
    table: SnookerTable;
    activeSession?: Session;
    onStartSession: (tableId: string) => void;
    onStopSession: (tableId: string) => void;
    onTransferSession?: (sessionId: string) => void;
    onCancelSession?: (sessionId: string) => void;
    onEditTable?: (tableId: string) => void;
    onDeleteTable?: (tableId: string) => void;
}

function LiveSessionTimer({ activeSession, hourlyRate }: { activeSession: Session; hourlyRate: number }) {
// ... existing LiveSessionTimer code ...
    const [elapsedMs, setElapsedMs] = useState<number>(0);

    useEffect(() => {
        const calculateElapsed = () => {
            const start = new Date(activeSession.start_time).getTime();
            const now = Date.now();
            setElapsedMs(Math.max(0, now - start));
        };

        calculateElapsed(); // Initial calculation
        const interval = setInterval(calculateElapsed, 1000);

        return () => clearInterval(interval);
    }, [activeSession.start_time]);

    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

    // Calculate cost based on exact milliseconds elapsed
    const cost = (elapsedMs / (1000 * 60)) * hourlyRate;

    return (
        <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center gap-1 text-sm font-medium text-amber-400">
                <Clock size={14} />
                <span className="tabular-nums">
                    {hours > 0 ? `${hours}h ` : ''}{String(minutes).padStart(2, '0')}m {String(seconds).padStart(2, '0')}s
                </span>
            </div>
            <div className="text-xs text-muted-foreground">
                Current: <span className="text-green-400 font-medium">₹{cost.toFixed(2)}</span>
            </div>
        </div>
    );
}

export function TableCard({ table, activeSession, onStartSession, onStopSession, onTransferSession, onCancelSession, onEditTable, onDeleteTable }: TableCardProps) {
    const isOccupied = table.status === 'occupied';
    const [showSnackModal, setShowSnackModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <GlassCard className="group relative">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:gold-text-gradient transition-all">{table.name}</h3>
                        {!isOccupied && <p className="text-sm text-muted-foreground mt-1">₹{table.hourly_rate}/min</p>}
                        {isOccupied && activeSession && (
                            <LiveSessionTimer activeSession={activeSession} hourlyRate={table.hourly_rate} />
                        )}
                    </div>
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        isOccupied ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"
                    )}>
                        <Circle size={8} fill="currentColor" />
                        {table.status}
                    </div>
                </div>

                <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-transparent rounded-xl mb-6 relative overflow-hidden flex items-center justify-center border border-white/5">
                    <div className={cn(
                        "w-3/4 h-1/2 rounded-md border-4 transition-all duration-500",
                        isOccupied ? "border-red-500/30 bg-red-500/10" : "border-green-500/30 bg-green-500/10"
                    )}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <TableIcon size={64} className={isOccupied ? "text-red-500" : "text-green-500"} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    {isOccupied ? (
                        <>
                            <Button
                                variant="outline"
                                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                                onClick={() => onStopSession(table.id)}
                            >
                                <StopCircle size={16} className="mr-2" /> Stop
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
                                onClick={() => setShowSnackModal(true)}
                            >
                                <Plus size={16} className="mr-2" /> Snack
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => onStartSession(table.id)}
                        >
                            <Play size={16} className="mr-2" /> Start Session
                        </Button>
                    )}
                    
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="px-2 h-full"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <MoreVertical size={16} />
                        </Button>
                        
                        {showDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-black/95 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                                    {isOccupied ? (
                                        <>
                                            <button className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2" onClick={() => { setShowDropdown(false); onTransferSession?.(activeSession!.id); }}>
                                                <ArrowRightLeft size={14} /> Transfer Session
                                            </button>
                                            <button className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-white/5" onClick={() => { setShowDropdown(false); onCancelSession?.(activeSession!.id); }}>
                                                <Trash2 size={14} /> Cancel Session
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2" onClick={() => { setShowDropdown(false); onEditTable?.(table.id); }}>
                                                <Edit2 size={14} /> Edit Details
                                            </button>
                                            <button className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-white/5" onClick={() => { setShowDropdown(false); onDeleteTable?.(table.id); }}>
                                                <Trash2 size={14} /> Delete Table
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showSnackModal && activeSession && (
                <AddSnackModal
                    sessionId={activeSession.id}
                    onClose={() => setShowSnackModal(false)}
                    onAdded={() => {
                        // In a real app we might refetch or show a success toast here
                    }}
                />
            )}
        </GlassCard>
    );
}

function TableIcon({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 3h18v14H3z" />
            <path d="M3 11h18" />
            <path d="M3 7h18" />
            <path d="M7 17v4" />
            <path d="M17 17v4" />
        </svg>
    )
}
