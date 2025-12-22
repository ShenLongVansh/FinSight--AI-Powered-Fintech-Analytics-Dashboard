import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { extractTransactionsWithAI } from '@/lib/ai/gemini';

const execAsync = promisify(exec);

// Temporary directory for processing PDFs
const TEMP_DIR = '/tmp/bank-statements';

export async function POST(request: NextRequest) {
    try {
        // Ensure temp directory exists
        if (!existsSync(TEMP_DIR)) {
            await mkdir(TEMP_DIR, { recursive: true });
        }

        // Get form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const password = formData.get('password') as string | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalPath = path.join(TEMP_DIR, `original-${timestamp}.pdf`);
        const decryptedPath = path.join(TEMP_DIR, `decrypted-${timestamp}.pdf`);

        // Save uploaded file
        const bytes = await file.arrayBuffer();
        await writeFile(originalPath, Buffer.from(bytes));

        let pdfPath = originalPath;

        // If password provided, decrypt the PDF using qpdf
        if (password) {
            try {
                // Use local qpdf binary (works on Vercel)
                const qpdfPath = path.join(process.cwd(), 'bin', 'qpdf');
                await execAsync(
                    `"${qpdfPath}" --password="${password}" --decrypt "${originalPath}" "${decryptedPath}"`
                );
                pdfPath = decryptedPath;
            } catch (decryptError) {
                // Clean up
                await unlink(originalPath).catch(() => { });

                return NextResponse.json(
                    {
                        error: 'Failed to decrypt PDF. Please check the password.',
                        needsPassword: true
                    },
                    { status: 400 }
                );
            }
        }

        // Extract text from PDF
        let extractedText = '';
        try {
            const dataBuffer = await readFile(pdfPath);
            const pdfData = await pdf(dataBuffer);
            extractedText = pdfData.text;
        } catch (extractError) {
            // Try without password first
            if (!password) {
                await unlink(originalPath).catch(() => { });
                return NextResponse.json(
                    {
                        error: 'PDF may be password protected',
                        needsPassword: true
                    },
                    { status: 400 }
                );
            }
            throw extractError;
        }

        // Clean up temporary files
        await unlink(originalPath).catch(() => { });
        if (password) {
            await unlink(decryptedPath).catch(() => { });
        }

        if (!extractedText || extractedText.trim().length < 100) {
            return NextResponse.json(
                { error: 'Could not extract text from PDF. The file may be an image-based PDF.' },
                { status: 400 }
            );
        }

        // Use Gemini AI to extract transactions
        const statementId = `stmt-${timestamp}`;
        const result = await extractTransactionsWithAI(extractedText, statementId);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: result.error || 'Failed to extract transactions',
                    rawText: extractedText.substring(0, 2000) // For debugging
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            fileName: file.name,
            transactionCount: result.transactions.length,
            transactions: result.transactions,
            extractedTextLength: extractedText.length,
        });

    } catch (error) {
        console.error('Upload processing error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Processing failed' },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false, // Required for file uploads
    },
};
