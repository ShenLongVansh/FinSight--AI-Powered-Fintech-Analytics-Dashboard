import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { countTransactions } from '@/lib/ai/gemini';

// POST: Count transactions in a PDF (quick scan for ETA)
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const password = formData.get('password') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF
        const options: { password?: string } = {};
        if (password) {
            options.password = password;
        }

        let pdfData;
        try {
            pdfData = await pdfParse(buffer, options);
        } catch (pdfError) {
            const errorMessage = pdfError instanceof Error ? pdfError.message : 'PDF parse error';
            if (errorMessage.includes('password')) {
                return NextResponse.json({ error: 'Incorrect password or password required' }, { status: 401 });
            }
            return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 400 });
        }

        // Quick count using Gemini
        const countResult = await countTransactions(pdfData.text);

        if (!countResult.success) {
            return NextResponse.json({
                error: countResult.error || 'Count failed',
                count: 0,
                estimatedSeconds: 60 // Default estimate
            }, { status: 200 }); // Return 200 so we can still proceed
        }

        return NextResponse.json({
            success: true,
            count: countResult.count,
            estimatedSeconds: countResult.estimatedSeconds,
        });

    } catch (error) {
        console.error('Count API error:', error);
        return NextResponse.json({
            error: 'Count failed',
            count: 0,
            estimatedSeconds: 60
        }, { status: 200 });
    }
}
