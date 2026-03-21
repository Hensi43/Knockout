import { NextResponse } from 'next/server';
import { KhataService } from '@/services/khata-service';

export async function GET() {
    try {
        const accounts = await KhataService.getAccounts();
        return NextResponse.json(accounts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { playerName, phone } = await request.json();

        if (!playerName) {
            return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
        }

        const account = await KhataService.createAccount(playerName, phone || '');
        return NextResponse.json(account);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
