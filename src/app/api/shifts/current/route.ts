import { NextResponse } from 'next/server';
import { ShiftService } from '@/services/shift-service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const shift = await ShiftService.getCurrentShift(userId);
        return NextResponse.json(shift);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
