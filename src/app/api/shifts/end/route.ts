import { NextResponse } from 'next/server';
import { ShiftService } from '@/services/shift-service';

export async function POST(request: Request) {
    try {
        const { shiftId, declaredCash } = await request.json();

        if (!shiftId) {
            return NextResponse.json({ error: 'Shift ID is required' }, { status: 400 });
        }
        if (declaredCash === undefined || declaredCash < 0) {
            return NextResponse.json({ error: 'Valid declared cash is required' }, { status: 400 });
        }

        const result = await ShiftService.endShift(shiftId, Number(declaredCash));
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
