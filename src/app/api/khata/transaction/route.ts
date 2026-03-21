import { NextResponse } from 'next/server';
import { KhataService } from '@/services/khata-service';

export async function POST(request: Request) {
    try {
        const { accountId, amount, type, description, sessionId } = await request.json();

        if (!accountId || !amount || !type || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (type !== 'CREDIT' && type !== 'SETTLEMENT') {
            return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
        }

        const result = await KhataService.addTransaction(accountId, Number(amount), type as 'CREDIT' | 'SETTLEMENT', description, sessionId);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
