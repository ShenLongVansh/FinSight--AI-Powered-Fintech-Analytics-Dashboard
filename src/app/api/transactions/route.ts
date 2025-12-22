import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getTransactions, saveTransactions, deleteAllTransactions } from '@/lib/supabase/client';

// GET: Fetch all transactions for the current user
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const transactions = await getTransactions(userId);

        // Transform to match frontend Transaction type
        const formattedTransactions = transactions.map(t => ({
            id: t.id,
            date: t.date,
            description: t.description,
            amount: t.amount,
            type: t.type,
            category: t.category,
            bankName: t.bank_name,
        }));

        return NextResponse.json({ transactions: formattedTransactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

// POST: Save new transactions
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactions } = await req.json();

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return NextResponse.json({ error: 'No transactions provided' }, { status: 400 });
        }

        // Transform to match database schema
        const dbTransactions = transactions.map((t: {
            date: string;
            description: string;
            amount: number;
            type: 'debit' | 'credit';
            category: string;
            bankName?: string;
        }) => ({
            date: t.date,
            description: t.description,
            amount: t.amount,
            type: t.type,
            category: t.category,
            bank_name: t.bankName,
        }));

        const result = await saveTransactions(userId, dbTransactions);

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to save transactions' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Saved ${result.count} transactions`
        });
    } catch (error) {
        console.error('Error saving transactions:', error);
        return NextResponse.json({ error: 'Failed to save transactions' }, { status: 500 });
    }
}

// DELETE: Clear all transactions for the current user
export async function DELETE() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const success = await deleteAllTransactions(userId);

        if (!success) {
            return NextResponse.json({ error: 'Failed to delete transactions' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'All transactions deleted' });
    } catch (error) {
        console.error('Error deleting transactions:', error);
        return NextResponse.json({ error: 'Failed to delete transactions' }, { status: 500 });
    }
}
