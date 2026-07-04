"use client";

import { useEffect, useState, use } from "react";
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
import { Trophy, Plus, ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // Form state for participant
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [seed, setSeed] = useState('');

    const fetchTournament = async () => {
        try {
            const res = await fetch(`/api/tournaments/${id}`);
            const data = await res.json();
            if (res.ok) {
                setTournament(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournament();
    }, [id]);

    const handleAddParticipant = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/tournaments/${id}/participants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: name,
                    phone: phone || null,
                    seed: seed || null
                })
            });

            if (res.ok) {
                toast({ title: "Player Added", description: `${name} has been added.` });
                setIsAddPlayerOpen(false);
                fetchTournament();
                setName(''); setPhone(''); setSeed('');
            } else {
                toast({ title: "Error", description: "Could not add player", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        }
    };

    const handleDeleteTournament = async () => {
        if(!confirm("Are you sure you want to delete this tournament? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/tournaments/${id}`, {
                method: 'DELETE'
            });
            if(res.ok) {
                toast({ title: "Deleted", description: "Tournament deleted successfully." });
                router.push('/dashboard/tournaments');
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete tournament", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-white/5 rounded-xl w-1/3"></div>
                    <div className="h-64 bg-white/5 rounded-xl w-full"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!tournament) {
        return (
            <DashboardLayout>
                <div className="text-center py-20 text-white">Tournament not found</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-white" onClick={() => router.push('/dashboard/tournaments')}>
                        <ArrowLeft size={16} className="mr-2" /> Back to Tournaments
                    </Button>
                    <h1 className="text-3xl font-bold gold-text-gradient font-serif flex items-center gap-3">
                        <Trophy className="text-[#d4af37]" />
                        {tournament.name}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {new Date(tournament.startDate).toLocaleDateString()} to {new Date(tournament.endDate).toLocaleDateString()} | 
                        Prize Pool: ₹{tournament.prizePool} | Entry Fee: ₹{tournament.entryFee}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black hover:opacity-90">
                                <Plus size={18} /> Register Player
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-white/10 text-white max-w-md">
                            <DialogHeader>
                                <DialogTitle>Register Player</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddParticipant} className="space-y-4 mt-4">
                                <div>
                                    <Label>Player Name</Label>
                                    <Input 
                                        required 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-white/5 border-white/10" 
                                    />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="bg-white/5 border-white/10" 
                                    />
                                </div>
                                <div>
                                    <Label>Seed / Rank (Optional)</Label>
                                    <Input 
                                        type="number"
                                        value={seed}
                                        onChange={(e) => setSeed(e.target.value)}
                                        className="bg-white/5 border-white/10" 
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-[#d4af37] text-black hover:bg-[#aa8c2c]">
                                    Register
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={handleDeleteTournament}>
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Participants List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold text-white">Registered Players ({tournament.participants.length})</h2>
                    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-muted-foreground w-16">Seed</TableHead>
                                    <TableHead className="text-muted-foreground">Name</TableHead>
                                    <TableHead className="text-muted-foreground">Payment Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tournament.participants.length === 0 ? (
                                    <TableRow className="border-white/5">
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            No players registered yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tournament.participants.map((p: any) => (
                                        <TableRow key={p.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-medium text-white">{p.seed || '-'}</TableCell>
                                            <TableCell className="text-white">{p.customerName}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    p.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                    {p.paymentStatus.toUpperCase()}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Match Generation / Standings Panel */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Matches</h2>
                    <div className="glass rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
                        <Trophy size={48} className="text-white/20 mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">Tournament Bracket</h3>
                        <p className="text-muted-foreground text-sm mb-6">
                            Register all players before generating the initial tournament bracket.
                        </p>
                        <Button className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10" disabled={tournament.participants.length < 2}>
                            Generate Bracket
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
