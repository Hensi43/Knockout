import { NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsapp-service';

export async function POST(request: Request) {
    try {
        const { phone, name, sessionData } = await request.json();

        if (!phone || !name || !sessionData) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await WhatsAppService.sendReceipt(phone, name, sessionData);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
