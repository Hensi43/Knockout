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
import { ClipboardList, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WaitlistEntry {
    id: string;
    customerName: string;
    phone: string | null;
    estimatedDuration: number;
    status: string;
    createdAt: string;
}

export default function WaitlistPage() {
    const [entries, setEntries] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { toast } = useToast();

    // Form state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [duration, setDuration] = useState('60');

    const fetchWaitlist = async () => {
        try {
            const res = await fetch('/api/waitlist');
            const data = await res.json();
            if (res.ok) {
                setEntries(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaitlist();
    }, []);

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: name,
                    phone: phone || null,
                    estimatedDuration: parseInt(duration),
                    status: 'waiting'
                })
            });

            if (res.ok) {
                toast({ title: "Added to waitlist", description: `${name} has been added.` });
                setIsAddOpen(false);
                setName('');
                setPhone('');
                setDuration('60');
                fetchWaitlist();
            } else {
                toast({ title: "Error", description: "Could not add to waitlist", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/waitlist/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast({ title: "Status updated", description: `Marked as ${status}` });
                fetchWaitlist();
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not update status", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this entry from the waitlist?")) return;
        try {
            const res = await fetch(`/api/waitlist/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast({ title: "Removed", description: "Entry removed from waitlist" });
                fetchWaitlist();
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not remove entry", variant: "destructive" });
        }
    };

    const activeEntries = entries.filter(e => e.status === 'waiting');
    const seatedEntries = entries.filter(e => e.status === 'seated');

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient font-serif flex items-center gap-3">
                        <ClipboardList className="text-[#d4af37]" />
                        Waitlist & Reservations
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage customers waiting for a table.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 bg-gradient-to-r from-[#d4af37] to-[#aa8c2c] text-black hover:opacity-90">
                            <Plus size={18} /> Add to Waitlist
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle>Add Customer to Waitlist</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddEntry} className="space-y-4 mt-4">
                            <div>
                                <Label>Customer Name</Label>
                                <Input 
                                    required 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-white/5 border-white/10" 
                                />
                            </div>
                            <div>
                                <Label>Phone Number (Optional)</Label>
                                <Input 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="bg-white/5 border-white/10" 
                                />
                            </div>
                            <div>
                                <Label>Estimated Play Duration (Minutes)</Label>
                                <Input 
                                    type="number" 
                                    min="15" step="15"
                                    required 
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="bg-white/5 border-white/10" 
                                />
                            </div>
                            <Button type="submit" className="w-full bg-[#d4af37] text-black hover:bg-[#aa8c2c]">
                                Add Customer
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-white/5 rounded-xl w-full"></div>
                    <div className="h-12 bg-white/5 rounded-xl w-full"></div>
                    <div className="h-12 bg-white/5 rounded-xl w-full"></div>
                </div>
            ) : (
                <div className="space-y-10">
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-white">Currently Waiting ({activeEntries.length})</h2>
                        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/5 hover:bg-transparent">
                                        <TableHead className="text-muted-foreground">Name</TableHead>
                                        <TableHead className="text-muted-foreground">Phone</TableHead>
                                        <TableHead className="text-muted-foreground">Est. Duration</TableHead>
                                        <TableHead className="text-muted-foreground">Waiting Since</TableHead>
                                        <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeEntries.length === 0 ? (
                                        <TableRow className="border-white/5">
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No customers currently waiting.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        activeEntries.map((entry) => (
                                            <TableRow key={entry.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                                <TableCell className="font-medium text-white">{entry.customerName}</TableCell>
                                                <TableCell className="text-muted-foreground">{entry.phone || '-'}</TableCell>
                                                <TableCell className="text-muted-foreground">{entry.estimatedDuration} mins</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                                                            onClick={() => handleUpdateStatus(entry.id, 'seated')}
                                                        >
                                                            <CheckCircle2 size={16} className="mr-1" /> Seat
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                            onClick={() => handleDelete(entry.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {seatedEntries.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-white opacity-60">Recently Seated</h2>
                            <div className="glass rounded-2xl border border-white/5 overflow-hidden opacity-60">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-white/5 hover:bg-transparent">
                                            <TableHead className="text-muted-foreground">Name</TableHead>
                                            <TableHead className="text-muted-foreground">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {seatedEntries.map((entry) => (
                                            <TableRow key={entry.id} className="border-white/5">
                                                <TableCell className="font-medium text-white">{entry.customerName}</TableCell>
                                                <TableCell className="text-green-400">Seated</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}
