// Gemini AI client for bank statement processing
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction } from '@/types';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Structured prompt for transaction extraction
const EXTRACTION_PROMPT = `You are a financial document parser. Analyze the following bank statement text and extract all transactions.

For each transaction, extract:
- date: The transaction date in YYYY-MM-DD format
- description: The merchant/payee name (clean, human-readable)
- amount: The transaction amount as a positive number
- type: Either "debit" (money spent/sent) or "credit" (money received)
- category: One of these categories based on the merchant/description:
  - "Food & Dining" (restaurants, cafes, food delivery, sweets, ice cream)
  - "Shopping" (retail, provisions, mobile shops, general stores)
  - "Health" (hospitals, medical stores, pharmacies)
  - "Bills & Utilities" (phone recharge, electricity, internet, water)
  - "Travel" (auto, cab, petrol, fuel, metro)
  - "Transfer" (money received from family/friends, bank transfers)
  - "Entertainment" (movies, games, streaming)
  - "Subscriptions" (Netflix, Spotify, Amazon Prime)
  - "Other" (anything that doesn't fit above)

Return ONLY a valid JSON array of transactions. No explanations, no markdown, just the JSON array.
Example format:
[
  {"date": "2025-10-01", "description": "Swiggy Food Order", "amount": 456.00, "type": "debit", "category": "Food & Dining"},
  {"date": "2025-10-02", "description": "Salary from TechCorp", "amount": 50000.00, "type": "credit", "category": "Transfer"}
]

IMPORTANT:
- Extract ALL transactions from the statement
- For UPI transactions, extract the merchant name (e.g., "UPI/ROMS PIZZA/..." → "Roms Pizza")
- For transfers like "RECEIVED FROM ATUL SHARMA", the type is "credit"
- Amounts with "-" or in DEBIT column are debits
- Amounts with "+" or in CREDIT column are credits
- Skip opening/closing balance lines, only extract actual transactions

Bank Statement Text:
`;

export interface ExtractionResult {
    success: boolean;
    transactions: Transaction[];
    error?: string;
    rawResponse?: string;
}

export interface CountResult {
    success: boolean;
    count: number;
    estimatedSeconds: number;
    error?: string;
}

// Lightweight prompt for quick transaction counting
const COUNT_PROMPT = `You are analyzing a bank statement. Count ONLY the number of actual transactions (debits and credits).

DO NOT count:
- Opening balance
- Closing balance  
- Statement headers
- Account summaries

Return ONLY a single number representing the transaction count. No text, no explanation, just the number.

Bank Statement Text:
`;

/**
 * Extract transactions from bank statement text using Gemini AI
 */
export async function extractTransactionsWithAI(
    statementText: string,
    statementId: string
): Promise<ExtractionResult> {
    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return {
                success: false,
                transactions: [],
                error: 'GEMINI_API_KEY not configured. Please add it to your .env.local file.',
            };
        }

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Prepare the prompt with the statement text
        const fullPrompt = EXTRACTION_PROMPT + statementText;

        // Retry logic for 503 errors
        const maxRetries = 5;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Generate content
                const result = await model.generateContent(fullPrompt);
                const response = await result.response;
                const text = response.text();

                // Parse the JSON response
                let transactions: Transaction[] = [];

                try {
                    // Clean the response (remove any markdown code blocks if present)
                    let cleanedText = text.trim();
                    if (cleanedText.startsWith('```json')) {
                        cleanedText = cleanedText.slice(7);
                    }
                    if (cleanedText.startsWith('```')) {
                        cleanedText = cleanedText.slice(3);
                    }
                    if (cleanedText.endsWith('```')) {
                        cleanedText = cleanedText.slice(0, -3);
                    }
                    cleanedText = cleanedText.trim();

                    const parsed = JSON.parse(cleanedText);

                    // Validate and add IDs
                    transactions = parsed.map((txn: Record<string, unknown>, index: number) => ({
                        id: `${statementId}-${index}`,
                        date: String(txn.date || ''),
                        description: String(txn.description || 'Unknown'),
                        amount: Number(txn.amount) || 0,
                        type: txn.type === 'credit' ? 'credit' : 'debit',
                        category: String(txn.category || 'Other'),
                        bankName: 'Auto-detected',
                    }));

                } catch (parseError) {
                    return {
                        success: false,
                        transactions: [],
                        error: 'Failed to parse AI response as JSON',
                        rawResponse: text,
                    };
                }

                return {
                    success: true,
                    transactions,
                };

            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                const errorMessage = lastError.message.toLowerCase();

                // Check if it's a 503 or rate limit error that should be retried
                if ((errorMessage.includes('503') ||
                    errorMessage.includes('overloaded') ||
                    errorMessage.includes('resource exhausted') ||
                    errorMessage.includes('rate limit')) &&
                    attempt < maxRetries) {

                    // Exponential backoff: 3s, 6s, 12s, 24s
                    const waitTime = Math.min(3000 * Math.pow(2, attempt - 1), 30000);
                    console.log(`Gemini API retry ${attempt}/${maxRetries} - waiting ${waitTime / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }

                // Non-retryable error or max retries reached
                throw error;
            }
        }

        // If we get here, all retries failed
        console.error('Gemini API error after retries:', lastError);
        return {
            success: false,
            transactions: [],
            error: lastError?.message || 'Max retries exceeded',
        };

    } catch (error) {
        console.error('Gemini API error:', error);
        return {
            success: false,
            transactions: [],
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Recategorize transactions using AI (for bulk recategorization)
 */
export async function recategorizeTransactions(
    transactions: Transaction[]
): Promise<Transaction[]> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return transactions;
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Given these transactions, suggest better categories for each. Return a JSON array with just the id and new category.
    
Categories to choose from:
- Food & Dining
- Shopping
- Health
- Bills & Utilities
- Travel
- Transfer
- Entertainment
- Subscriptions
- Other

Transactions:
${JSON.stringify(transactions.map(t => ({ id: t.id, description: t.description, currentCategory: t.category })), null, 2)}

Return format: [{"id": "xxx", "category": "Food & Dining"}, ...]
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse and apply new categories
        const updates = JSON.parse(text.replace(/```json?|```/g, '').trim());
        const updateMap = new Map(updates.map((u: { id: string; category: string }) => [u.id, u.category]));

        return transactions.map(t => ({
            ...t,
            category: (updateMap.get(t.id) as string) || t.category,
        }));

    } catch (error) {
        console.error('Recategorization error:', error);
        return transactions;
    }
}

/**
 * Quick transaction count (for ETA estimation before full extraction)
 * ~2 seconds per transaction is a rough estimate
 */
export async function countTransactions(statementText: string): Promise<CountResult> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return {
                success: false,
                count: 0,
                estimatedSeconds: 0,
                error: 'GEMINI_API_KEY not configured',
            };
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const fullPrompt = COUNT_PROMPT + statementText;

        // Retry logic for counting
        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await model.generateContent(fullPrompt);
                const response = await result.response;
                const text = response.text().trim();

                // Parse the count - should be just a number
                const count = parseInt(text.replace(/[^0-9]/g, ''), 10);

                if (isNaN(count) || count < 0) {
                    return {
                        success: false,
                        count: 0,
                        estimatedSeconds: 0,
                        error: 'Could not parse transaction count',
                    };
                }

                // Estimate: ~2 seconds per transaction for full extraction
                const estimatedSeconds = Math.max(30, Math.round(count * 2));

                return {
                    success: true,
                    count,
                    estimatedSeconds,
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
                if ((errorMessage.includes('503') || errorMessage.includes('overloaded')) && attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 2000 * attempt));
                    continue;
                }
                throw error;
            }
        }

        return { success: false, count: 0, estimatedSeconds: 0, error: 'Max retries exceeded' };
    } catch (error) {
        console.error('Count error:', error);
        return {
            success: false,
            count: 0,
            estimatedSeconds: 0,
            error: error instanceof Error ? error.message : 'Count failed',
        };
    }
}
