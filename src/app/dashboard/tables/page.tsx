"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { TableCard } from "@/components/tables/table-card";
import { tableService } from "@/services/table-service";
import { sessionService } from "@/services/session-service";
import { SnookerTable, Session } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { AddTableModal } from "@/components/tables/add-table-modal";
import { EditTableModal } from "@/components/tables/edit-table-modal";
import { TransferSessionModal } from "@/components/tables/transfer-session-modal";
import { BillingModal } from "@/components/billing/billing-modal";
import { StartSessionModal } from "@/components/tables/start-session-modal";
import { ReceiptModal, ReceiptData } from "@/components/tables/receipt-modal";

export default function TablesPage() {
    const [tables, setTables] = useState<SnookerTable[]>([]);
    const [activeSessions, setActiveSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddingTable, setIsAddingTable] = useState(false);
    const [addTableError, setAddTableError] = useState("");
    const [isStartingSession, setIsStartingSession] = useState(false);
    const [startSessionError, setStartSessionError] = useState("");
    const [isBilling, setIsBilling] = useState(false);
    const [billingError, setBillingError] = useState("");
    const [startSessionModalData, setStartSessionModalData] = useState<{
        isOpen: boolean;
        tableId: string;
        tableName: string;
    } | null>(null);
    const [billingModalData, setBillingModalData] = useState<{
        isOpen: boolean;
        tableId: string;
        tableName: string;
        hourlyRate: number;
        startTime: string;
        sessionId: string;
    } | null>(null);

    const [receiptData, setReceiptData] = useState<{
        receipt: ReceiptData;
        tableName: string;
    } | null>(null);

    const [editTableModalData, setEditTableModalData] = useState<{ isOpen: boolean; tableId: string; name: string; rate: number } | null>(null);
    const [isEditingTable, setIsEditingTable] = useState(false);
    const [editTableError, setEditTableError] = useState("");

    const [transferModalData, setTransferModalData] = useState<{ isOpen: boolean; sessionId: string } | null>(null);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferError, setTransferError] = useState("");

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const [tablesData, sessionsData] = await Promise.all([
                tableService.getTables(),
                sessionService.getActiveSessions()
            ]);
            setTables(tablesData);
            setActiveSessions(sessionsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTable = async (name: string, rate: number) => {
        try {
            setIsAddingTable(true);
            setAddTableError("");
            await tableService.createTable(name, rate);
            setIsAddModalOpen(false);
            fetchTables();
        } catch (error: any) {
            console.error("Error adding table:", error);
            setAddTableError(error.message || "Failed to add table. Check your connection or verify that the database is running.");
        } finally {
            setIsAddingTable(false);
        }
    };

    const handleStartSessionClick = (tableId: string) => {
        const table = tables.find(t => t.id === tableId);
        if (table) {
            setStartSessionError("");
            setStartSessionModalData({
                isOpen: true,
                tableId,
                tableName: table.name
            });
        }
    };

    const handleStartSessionConfirm = async (playerCount: number) => {
        if (!startSessionModalData) return;
        try {
            setIsStartingSession(true);
            setStartSessionError("");
            await sessionService.startSession(startSessionModalData.tableId, playerCount);
            setStartSessionModalData(null);
            fetchTables();
        } catch (error: any) {
            console.error("Error starting session:", error);
            setStartSessionError(error.message || "Failed to start session. Check if your database schema is up to date (e.g., player_count column).");
        } finally {
            setIsStartingSession(false);
        }
    };

    const handleStopSessionClick = async (tableId: string) => {
        try {
            const activeSessionsObj = await sessionService.getActiveSessions();
            const session = activeSessionsObj.find((s: Session) => s.table_id === tableId);
            const table = tables.find(t => t.id === tableId);

            if (session && table) {
                setBillingError("");
                setBillingModalData({
                    isOpen: true,
                    tableId,
                    tableName: table.name,
                    hourlyRate: table.hourly_rate,
                    startTime: session.start_time,
                    sessionId: session.id
                });
            }
        } catch (error) {
            console.error("Error fetching active session:", error);
        }
    };

    const handleConfirmBilling = async (total: number, discount: number, customer?: { name: string, phone: string, sendReceipt: boolean }) => {
        if (!billingModalData) return;

        try {
            setIsBilling(true);
            setBillingError("");
            const receipt = await sessionService.endSession(
                billingModalData.sessionId,
                billingModalData.tableId,
                total,
                discount
            );

            if (customer && customer.sendReceipt && customer.phone) {
                try {
                    await fetch('/api/whatsapp/receipt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            phone: customer.phone,
                            name: customer.name || 'Player',
                            sessionData: { total_amount: total }
                        })
                    });
                } catch (err) {
                    console.error("Failed to send WhatsApp receipt", err);
                }
            }

            setReceiptData({
                receipt: receipt,
                tableName: billingModalData.tableName
            });

            setBillingModalData(null);
            fetchTables();
        } catch (error: any) {
            console.error("Error ending session:", error);
            setBillingError(error.message || "Failed to process payment.");
        } finally {
            setIsBilling(false);
        }
    };

    const handleEditTableConfirm = async (name: string, rate: number) => {
        if (!editTableModalData) return;
        try {
            setIsEditingTable(true);
            setEditTableError("");
            await tableService.updateTableDetails(editTableModalData.tableId, { name, hourly_rate: rate });
            setEditTableModalData(null);
            fetchTables();
        } catch (error: any) {
            setEditTableError(error.message || "Failed to edit table.");
        } finally {
            setIsEditingTable(false);
        }
    };

    const handleTransferConfirm = async (newTableId: string) => {
        if (!transferModalData) return;
        try {
            setIsTransferring(true);
            setTransferError("");
            await sessionService.transferSession(transferModalData.sessionId, newTableId);
            setTransferModalData(null);
            fetchTables();
        } catch (error: any) {
            setTransferError(error.message || "Failed to transfer session.");
        } finally {
            setIsTransferring(false);
        }
    };

    const handleDeleteTable = async (tableId: string) => {
        if (!confirm("Are you sure you want to permanently delete this table?")) return;
        try {
            await tableService.deleteTable(tableId);
            fetchTables();
        } catch (error) {
            console.error("Delete table failed:", error);
            alert("Failed to delete table. Check if active sessions depend on it.");
        }
    };

    const handleCancelSession = async (sessionId: string) => {
        if (!confirm("Are you sure you want to VOID this session? This action deletes the session entirely and cannot be undone.")) return;
        try {
            await sessionService.cancelSession(sessionId);
            fetchTables();
        } catch (error) {
            console.error("Cancel session failed:", error);
            alert("Failed to void session.");
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient">Snooker Tables</h1>
                    <p className="text-muted-foreground mt-1">Manage and monitor all tables in real-time.</p>
                </div>
                <Button className="flex items-center gap-2" onClick={() => {
                    setAddTableError("");
                    setIsAddModalOpen(true);
                }}>
                    <Plus size={18} /> Add New Table
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card h-80 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {tables.map((table) => (
                        <TableCard
                            key={table.id}
                            table={table}
                            activeSession={activeSessions.find(s => s.table_id === table.id)}
                            onStartSession={handleStartSessionClick}
                            onStopSession={handleStopSessionClick}
                            onTransferSession={(sessionId) => setTransferModalData({ isOpen: true, sessionId })}
                            onCancelSession={handleCancelSession}
                            onEditTable={() => setEditTableModalData({ isOpen: true, tableId: table.id, name: table.name, rate: table.hourly_rate })}
                            onDeleteTable={handleDeleteTable}
                        />
                    ))}

                    {tables.length === 0 && (
                        <div className="col-span-full py-20 text-center glass-card rounded-2xl border-dashed border-white/10">
                            <p className="text-muted-foreground">No tables found. Add your first table to get started.</p>
                        </div>
                    )}
                </motion.div>
            )}

            <AddTableModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onConfirm={handleAddTable}
                error={addTableError}
                isSubmitting={isAddingTable}
            />

            {startSessionModalData && (
                <StartSessionModal
                    isOpen={startSessionModalData.isOpen}
                    onClose={() => setStartSessionModalData(null)}
                    onConfirm={handleStartSessionConfirm}
                    tableName={startSessionModalData.tableName}
                    error={startSessionError}
                    isSubmitting={isStartingSession}
                />
            )}

            {billingModalData && (
                <BillingModal
                    isOpen={billingModalData.isOpen}
                    onClose={() => setBillingModalData(null)}
                    onConfirm={handleConfirmBilling}
                    sessionData={{
                        id: billingModalData.sessionId,
                        startTime: billingModalData.startTime,
                        hourlyRate: billingModalData.hourlyRate,
                        tableName: billingModalData.tableName
                    }}
                    error={billingError}
                    isSubmitting={isBilling}
                />
            )}

            {receiptData && (
                <ReceiptModal
                    receipt={receiptData.receipt}
                    tableName={receiptData.tableName}
                    onClose={() => setReceiptData(null)}
                />
            )}

            {editTableModalData && (
                <EditTableModal
                    isOpen={editTableModalData.isOpen}
                    onClose={() => setEditTableModalData(null)}
                    onConfirm={handleEditTableConfirm}
                    initialName={editTableModalData.name}
                    initialRate={editTableModalData.rate}
                    error={editTableError}
                    isSubmitting={isEditingTable}
                />
            )}

            {transferModalData && (
                <TransferSessionModal
                    isOpen={transferModalData.isOpen}
                    onClose={() => setTransferModalData(null)}
                    onConfirm={handleTransferConfirm}
                    availableTables={tables.filter(t => t.status === 'available')}
                    error={transferError}
                    isSubmitting={isTransferring}
                />
            )}
        </DashboardLayout>
    );
}
