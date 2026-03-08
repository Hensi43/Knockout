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
import { BillingModal } from "@/components/billing/billing-modal";
import { StartSessionModal } from "@/components/tables/start-session-modal";
import { ReceiptModal, ReceiptData } from "@/components/tables/receipt-modal";

export default function TablesPage() {
    const [tables, setTables] = useState<SnookerTable[]>([]);
    const [activeSessions, setActiveSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
            await tableService.createTable(name, rate);
            setIsAddModalOpen(false);
            fetchTables();
        } catch (error) {
            console.error("Error adding table:", error);
        }
    };

    const handleStartSessionClick = (tableId: string) => {
        const table = tables.find(t => t.id === tableId);
        if (table) {
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
            await sessionService.startSession(startSessionModalData.tableId, playerCount);
            setStartSessionModalData(null);
            fetchTables();
        } catch (error) {
            console.error("Error starting session:", error);
        }
    };

    const handleStopSessionClick = async (tableId: string) => {
        try {
            const activeSessionsObj = await sessionService.getActiveSessions();
            const session = activeSessionsObj.find((s: Session) => s.table_id === tableId);
            const table = tables.find(t => t.id === tableId);

            if (session && table) {
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

    const handleConfirmBilling = async (total: number, discount: number) => {
        if (!billingModalData) return;

        try {
            const receipt = await sessionService.endSession(
                billingModalData.sessionId,
                billingModalData.tableId,
                total,
                discount
            );

            setReceiptData({
                receipt: receipt,
                tableName: billingModalData.tableName
            });

            setBillingModalData(null);
            fetchTables();
        } catch (error) {
            console.error("Error ending session:", error);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold gold-text-gradient">Snooker Tables</h1>
                    <p className="text-muted-foreground mt-1">Manage and monitor all tables in real-time.</p>
                </div>
                <Button className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
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
            />

            {startSessionModalData && (
                <StartSessionModal
                    isOpen={startSessionModalData.isOpen}
                    onClose={() => setStartSessionModalData(null)}
                    onConfirm={handleStartSessionConfirm}
                    tableName={startSessionModalData.tableName}
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
                />
            )}

            {receiptData && (
                <ReceiptModal
                    receipt={receiptData.receipt}
                    tableName={receiptData.tableName}
                    onClose={() => setReceiptData(null)}
                />
            )}
        </DashboardLayout>
    );
}
