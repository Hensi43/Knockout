"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trophy, Plus, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface Tournament {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    entryFee: number;
    prizePool: number;
    status: string;
    participants: any[];
}

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // Form state
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [entryFee, setEntryFee] = useState('');
    const [prizePool, setPrizePool] = useState('');

    const fetchTournaments = async () => {
        try {
            const res = await fetch('/api/tournaments');
            const data = await res.json();
            if (res.ok) {
                setTournaments(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleCreateTournament = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/tournaments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    startDate,
                    endDate,
                    entryFee,
                    prizePool
                })
            });

            if (res.ok) {
                toast({ title: "Tournament Created", description: `${name} is ready for registrations.` });
                setIsAddOpen(false);
                fetchTournaments();
                // Reset form
                setName(''); setStartDate(''); setEndDate(''); setEntryFee(''); setPrizePool('');
            } else {
                toast({ title: "Error", description: "Could not create tournament", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient font-serif flex items-center gap-3">
                        <Trophy className="text-[#d4af37]" />
                        Tournaments
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage leagues, tournaments, and prize pools.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black hover:opacity-90">
                            <Plus size={18} /> Create Tournament
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-white/10 text-white max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Tournament</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTournament} className="space-y-4 mt-4">
                            <div>
                                <Label>Tournament Name</Label>
                                <Input 
                                    required 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white/5 border-white/10" 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Start Date</Label>
                                    <Input 
                                        type="date"
                                        required 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-white/5 border-white/10" 
                                    />
                                </div>
                                <div>
                                    <Label>End Date</Label>
                                    <Input 
                                        type="date"
                                        required 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-white/5 border-white/10" 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Entry Fee (INR)</Label>
                                    <Input 
                                        type="number"
                                        required 
                                        value={entryFee}
                                        onChange={(e) => setEntryFee(e.target.value)}
                                        className="bg-white/5 border-white/10" 
                                    />
                                </div>
                                <div>
                                    <Label>Prize Pool (INR)</Label>
                                    <Input 
                                        type="number"
                                        required 
                                        value={prizePool}
                                        onChange={(e) => setPrizePool(e.target.value)}
                                        className="bg-white/5 border-white/10" 
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-[#d4af37] text-black hover:bg-[#aa8c2c]">
                                Create
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-white/5 rounded-xl w-full"></div>
                    <div className="h-12 bg-white/5 rounded-xl w-full"></div>
                </div>
            ) : (
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-muted-foreground">Tournament Name</TableHead>
                                <TableHead className="text-muted-foreground">Dates</TableHead>
                                <TableHead className="text-muted-foreground">Entry / Prize</TableHead>
                                <TableHead className="text-muted-foreground">Players</TableHead>
                                <TableHead className="text-muted-foreground">Status</TableHead>
                                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tournaments.length === 0 ? (
                                <TableRow className="border-white/5">
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No tournaments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tournaments.map((t) => (
                                    <TableRow key={t.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                        <TableCell className="font-medium text-white">{t.name}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            ₹{t.entryFee} / ₹{t.prizePool}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{t.participants?.length || 0}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                t.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                t.status === 'ongoing' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                            }`}>
                                                {t.status.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="border-white/10 hover:bg-white/5"
                                                onClick={() => router.push(`/dashboard/tournaments/${t.id}`)}
                                            >
                                                <Eye size={16} className="mr-2" /> Manage
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </DashboardLayout>
    );
}
