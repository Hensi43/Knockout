import { NextResponse } from 'next/server';
import { ShiftService } from '@/services/shift-service';

export async function POST(request: Request) {
    try {
        const { userId, startingCash } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }
        if (startingCash === undefined || startingCash < 0) {
            return NextResponse.json({ error: 'Valid starting cash is required' }, { status: 400 });
        }

        const shift = await ShiftService.startShift(userId, Number(startingCash));
        return NextResponse.json(shift);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
