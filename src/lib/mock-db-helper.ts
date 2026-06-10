import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'src/lib/mock-db.json');

export interface MockDb {
    users: any[];
    snooker_tables: any[];
    sessions: any[];
    products: any[];
    order_items: any[];
    staff_shifts: any[];
    customers: any[];
    payments: any[];
}

export function getDb(): MockDb {
    if (!fs.existsSync(DB_FILE)) {
        const now = new Date().toISOString();
        const seed: MockDb = {
            users: [
                {
                    id: "mock-user-id",
                    full_name: "Hensi Baghel",
                    email: "hensibaghel43@gmail.com",
                    role: "owner",
                    created_at: now
                }
            ],
            snooker_tables: [
                { id: "t1", name: "Table 1 (Standard)", hourly_rate: 150.00, status: "available", created_at: now },
                { id: "t2", name: "Table 2 (Standard)", hourly_rate: 150.00, status: "available", created_at: now },
                { id: "t3", name: "Table 3 (Standard)", hourly_rate: 150.00, status: "available", created_at: now },
                { id: "t4", name: "Table 4 (VIP Snooker)", hourly_rate: 250.00, status: "available", created_at: now },
                { id: "t5", name: "Table 5 (Russian Pyramid)", hourly_rate: 300.00, status: "available", created_at: now }
            ],
            sessions: [],
            products: [
                { id: "p1", name: "Coca-Cola", price: 40.00, category: "beverage", stock: 50, created_at: now },
                { id: "p2", name: "Red Bull", price: 120.00, category: "beverage", stock: 24, created_at: now },
                { id: "p3", name: "French Fries", price: 90.00, category: "snack", stock: 30, created_at: now },
                { id: "p4", name: "Club Sandwich", price: 150.00, category: "snack", stock: 15, created_at: now },
                { id: "p5", name: "Black Coffee", price: 60.00, category: "beverage", stock: 40, created_at: now }
            ],
            order_items: [],
            staff_shifts: [],
            customers: [
                { id: "c1", name: "Rohan Sharma", phone: "9876543210", total_visits: 15, last_visit: now, created_at: now },
                { id: "c2", name: "Priya Patel", phone: "8765432109", total_visits: 8, last_visit: now, created_at: now },
                { id: "c3", name: "Amit Kumar", phone: "7654321098", total_visits: 22, last_visit: now, created_at: now }
            ],
            payments: []
        };
        const dir = path.dirname(DB_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
        return seed;
    }
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.error("Error reading mock-db.json, recreating seed data", e);
        return {
            users: [],
            snooker_tables: [],
            sessions: [],
            products: [],
            order_items: [],
            staff_shifts: [],
            customers: [],
            payments: []
        };
    }
}

export function saveDb(data: MockDb) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
