"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { SnookerTable, Session } from "@/types/database";
import { Circle, Play, StopCircle, MoreVertical, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TableCardProps {
    table: SnookerTable;
    activeSession?: Session;
    onStartSession: (tableId: string) => void;
    onStopSession: (tableId: string) => void;
}

function LiveSessionTimer({ activeSession, hourlyRate }: { activeSession: Session; hourlyRate: number }) {
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
    const cost = (elapsedMs / (1000 * 60 * 60)) * hourlyRate;

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

export function TableCard({ table, activeSession, onStartSession, onStopSession }: TableCardProps) {
    const isOccupied = table.status === 'occupied';

    return (
        <GlassCard className="group relative">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:gold-text-gradient transition-all">{table.name}</h3>
                        {!isOccupied && <p className="text-sm text-muted-foreground mt-1">₹{table.hourly_rate}/hr</p>}
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
                        <Button
                            variant="outline"
                            className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                            onClick={() => onStopSession(table.id)}
                        >
                            <StopCircle size={16} className="mr-2" /> Stop Session
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => onStartSession(table.id)}
                        >
                            <Play size={16} className="mr-2" /> Start Session
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="px-2"
                        onClick={() => alert("More options coming soon!")}
                    >
                        <MoreVertical size={16} />
                    </Button>
                </div>
            </div>
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
