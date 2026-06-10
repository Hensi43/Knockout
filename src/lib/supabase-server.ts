import { createClient } from '@supabase/supabase-js';
import { getDb, saveDb, MockDb } from './mock-db-helper';
import crypto from 'crypto';

class MockQueryBuilder {
    private table: keyof MockDb;
    private filters: Array<(item: any) => boolean> = [];
    private sortField: string | null = null;
    private sortAscending = true;
    private limitCount: number | null = null;
    private isSingle = false;
    private insertData: any = null;
    private updateData: any = null;
    private isDelete = false;
    private selectCountExact = false;

    constructor(table: keyof MockDb) {
        this.table = table;
    }

    select(columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated', head?: boolean }) {
        if (options?.count === 'exact') {
            this.selectCountExact = true;
        }
        return this;
    }

    eq(column: string, value: any) {
        this.filters.push(item => {
            return item[column] === value;
        });
        return this;
    }

    gte(column: string, value: any) {
        this.filters.push(item => {
            if (!item[column]) return false;
            return new Date(item[column]) >= new Date(value);
        });
        return this;
    }

    order(column: string, options?: { ascending?: boolean }) {
        this.sortField = column;
        this.sortAscending = options?.ascending !== false;
        return this;
    }

    limit(count: number) {
        this.limitCount = count;
        return this;
    }

    single() {
        this.isSingle = true;
        return this;
    }

    insert(data: any) {
        this.insertData = data;
        return this;
    }

    update(data: any) {
        this.updateData = data;
        return this;
    }

    delete() {
        this.isDelete = true;
        return this;
    }

    private execute() {
        const db = getDb();
        let list = [...(db[this.table] || [])];

        // 1. Filter
        for (const filter of this.filters) {
            list = list.filter(filter);
        }

        // 2. Sort
        if (this.sortField) {
            list.sort((a, b) => {
                const valA = a[this.sortField!];
                const valB = b[this.sortField!];
                if (valA === valB) return 0;
                const comparison = valA > valB ? 1 : -1;
                return this.sortAscending ? comparison : -comparison;
            });
        }

        // 3. Limit
        if (this.limitCount !== null) {
            list = list.slice(0, this.limitCount);
        }

        const count = list.length;

        // Perform Mutation
        if (this.insertData) {
            const dataToInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
            const insertedRecords = dataToInsert.map(item => {
                const newRecord = {
                    id: item.id || crypto.randomUUID(),
                    created_at: new Date().toISOString(),
                    ...item
                };
                db[this.table].push(newRecord);
                return newRecord;
            });
            saveDb(db);
            list = insertedRecords;
        } else if (this.updateData) {
            db[this.table] = db[this.table].map(item => {
                const matches = this.filters.every(filter => filter(item));
                if (matches) {
                    return {
                        ...item,
                        ...this.updateData,
                        updated_at: new Date().toISOString()
                    };
                }
                return item;
            });
            saveDb(db);
            list = db[this.table].filter(item => this.filters.every(filter => filter(item)));
        } else if (this.isDelete) {
            db[this.table] = db[this.table].filter(item => {
                const matches = this.filters.every(filter => filter(item));
                return !matches;
            });
            saveDb(db);
            list = [];
        }

        // Join relations
        if (this.table === 'sessions') {
            list = list.map(session => {
                const table = db.snooker_tables.find(t => t.id === session.table_id);
                return {
                    ...session,
                    snooker_tables: table ? { name: table.name } : null
                };
            });
        } else if (this.table === 'order_items') {
            list = list.map(item => {
                const product = db.products.find(p => p.id === item.product_id);
                return {
                    ...item,
                    products: product ? { name: product.name, price: product.price } : null
                };
            });
        }

        const resultData = this.isSingle ? list[0] || null : list;
        let error = null;
        if (this.isSingle && !resultData) {
            error = { code: 'PGRST116', message: 'No rows found' };
        }

        return {
            data: resultData,
            error,
            count: this.selectCountExact ? count : undefined
        };
    }

    then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
        try {
            const result = this.execute();
            if (onfulfilled) {
                return Promise.resolve(onfulfilled(result));
            }
            return Promise.resolve(result);
        } catch (err) {
            if (onrejected) {
                return Promise.reject(onrejected(err));
            }
            return Promise.reject(err);
        }
    }
}

export function getSupabaseAdmin() {
    if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
        const mockClient = {
            from: (table: keyof MockDb) => {
                return new MockQueryBuilder(table);
            }
        };
        return mockClient as any;
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}
