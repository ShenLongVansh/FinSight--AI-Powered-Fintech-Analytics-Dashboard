// Kotak Mahindra Bank Statement Transaction Extractor
// Based on analysis of actual bank statements

import { Transaction } from '@/types';

// Transaction line pattern for Kotak statements
// Format: DATE TRANSACTION_DETAILS REFERENCE# DEBIT CREDIT BALANCE
const TRANSACTION_LINE_PATTERN = /^(\d{2}\s+\w{3},\s+\d{4})(.*?)(UPI-\d+|MB-\d+)(-?[\d,]+\.\d{2})?\s*([\d,]+\.\d{2})??\s*([\d,]+\.\d{2})$/;

// Simpler pattern that matches Kotak format
const DATE_PATTERN = /^(\d{2}\s+\w{3},\s+\d{4})/;

// Categories based on merchant/description patterns
const CATEGORY_PATTERNS: Record<string, RegExp[]> = {
    'Food & Dining': [
        /pizza/i, /sweets/i, /shake/i, /cafe/i, /ice cream/i, /food/i, /swiggy/i,
        /zomato/i, /restaurant/i, /taco bell/i, /donald/i, /grill/i, /dairy/i,
        /blinkit/i, /madan sw/i
    ],
    'Shopping': [
        /amazon/i, /flipkart/i, /shop/i, /provisi/i, /mobile/i, /hardware/i,
        /provision/i
    ],
    'Health': [
        /hospital/i, /medical/i, /pharmacy/i, /medicos/i, /tayal medical/i
    ],
    'Bills & Utilities': [
        /airtel/i, /jio/i, /electricity/i, /gas/i, /water/i, /bill/i
    ],
    'Travel': [
        /uber/i, /ola/i, /auto care/i, /petrol/i, /fuel/i
    ],
    'Transfer': [
        /received from/i, /trf to/i, /neft/i, /imps/i, /rtgs/i
    ],
    'Income': [
        /salary/i, /credit/i
    ],
};

/**
 * Parse a transaction line from Kotak bank statement
 */
export function parseKotakTransaction(line: string, index: number): Transaction | null {
    // Check if line starts with a date
    const dateMatch = line.match(/^(\d{2}\s+\w{3},\s+\d{4})/);
    if (!dateMatch) return null;

    const dateStr = dateMatch[1];

    // Skip opening/closing balance lines
    if (line.includes('OPENING BALANCE') || line.includes('CLOSING BALANCE')) {
        return null;
    }

    // Extract transaction details
    const parts = line.split(dateStr)[1];
    if (!parts) return null;

    // Find the reference number (UPI-xxx or MB-xxx)
    const refMatch = parts.match(/(UPI-\d+|MB-\d+)/);
    const reference = refMatch ? refMatch[1] : '';

    // Find amounts - look for patterns like -123.45 or +1,234.56 or just 1,234.56
    const amounts = parts.match(/[-+]?[\d,]+\.\d{2}/g) || [];

    // Determine debit/credit
    let amount = 0;
    let type: 'debit' | 'credit' = 'debit';

    if (amounts.length >= 1) {
        // Last amount is usually the balance, second-to-last is the transaction
        // Or look for explicit + or - signs
        const transactionAmounts = amounts.slice(0, -1); // Exclude balance

        for (const amt of transactionAmounts) {
            const cleanAmt = amt.replace(/,/g, '');
            if (cleanAmt.startsWith('+')) {
                amount = parseFloat(cleanAmt.replace('+', ''));
                type = 'credit';
            } else if (cleanAmt.startsWith('-')) {
                amount = parseFloat(cleanAmt.replace('-', ''));
                type = 'debit';
            } else if (parseFloat(cleanAmt) > 0) {
                // Context-based detection
                if (line.includes('RECEIVED') || line.includes('+')) {
                    type = 'credit';
                }
                amount = parseFloat(cleanAmt);
            }
        }
    }

    if (amount === 0) return null;

    // Extract description
    let description = parts
        .replace(reference, '')
        .replace(/[-+]?[\d,]+\.\d{2}/g, '')
        .replace(/CHEQUE\/REFERENCE#|DEBIT|CREDIT|BALANCE/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Clean up UPI prefix
    if (description.startsWith('UPI/')) {
        description = description.substring(4);
    }
    if (description.startsWith('MB:')) {
        description = description.substring(3);
    }

    // Extract merchant name (first part before /)
    const merchantMatch = description.match(/^([^/]+)/);
    const merchant = merchantMatch ? merchantMatch[1].trim() : description;

    // Categorize
    const category = categorizeTransaction(description);

    // Parse date
    const parsedDate = parseKotakDate(dateStr);

    return {
        id: `txn-${index}-${Date.now()}`,
        date: parsedDate.toISOString().split('T')[0],
        description: merchant,
        amount,
        type,
        category,
        bankName: 'Kotak Mahindra Bank'
    };
}

/**
 * Parse Kotak date format: "DD Mon, YYYY"
 */
function parseKotakDate(dateStr: string): Date {
    const months: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    const match = dateStr.match(/(\d{2})\s+(\w{3}),\s+(\d{4})/);
    if (!match) return new Date();

    const day = parseInt(match[1]);
    const month = months[match[2]] || 0;
    const year = parseInt(match[3]);

    return new Date(year, month, day);
}

/**
 * Categorize transaction based on description
 */
function categorizeTransaction(description: string): string {
    for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(description)) {
                return category;
            }
        }
    }
    return 'Other';
}

/**
 * Parse entire bank statement text
 */
export function parseKotakStatement(text: string): Transaction[] {
    const lines = text.split('\n');
    const transactions: Transaction[] = [];
    let currentLine = '';
    let index = 0;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Check if this is a new transaction (starts with date)
        if (DATE_PATTERN.test(trimmedLine)) {
            // Process previous accumulated line
            if (currentLine) {
                const txn = parseKotakTransaction(currentLine, index++);
                if (txn) transactions.push(txn);
            }
            currentLine = trimmedLine;
        } else {
            // Continuation of previous line
            currentLine += ' ' + trimmedLine;
        }
    }

    // Don't forget the last line
    if (currentLine) {
        const txn = parseKotakTransaction(currentLine, index);
        if (txn) transactions.push(txn);
    }

    return transactions;
}

/**
 * Extract account summary from statement
 */
export interface AccountSummary {
    accountNumber: string;
    holderName: string;
    branch: string;
    statementPeriod: string;
    openingBalance: number;
    closingBalance: number;
    totalDebited: number;
    totalCredited: number;
    debitCount: number;
    creditCount: number;
}

export function parseAccountSummary(text: string): Partial<AccountSummary> {
    const summary: Partial<AccountSummary> = {};

    // Account number
    const accMatch = text.match(/Account #(\d+)/);
    if (accMatch) summary.accountNumber = accMatch[1];

    // Statement period
    const periodMatch = text.match(/(\d{2}\s+\w{3},\s+\d{4})\s*-\s*(\d{2}\s+\w{3},\s+\d{4})/);
    if (periodMatch) summary.statementPeriod = `${periodMatch[1]} - ${periodMatch[2]}`;

    // Opening balance
    const openingMatch = text.match(/Opening balance([\d,]+\.\d{2})/);
    if (openingMatch) summary.openingBalance = parseFloat(openingMatch[1].replace(/,/g, ''));

    // Closing balance
    const closingMatch = text.match(/Closing balance([\d,]+\.\d{2})/);
    if (closingMatch) summary.closingBalance = parseFloat(closingMatch[1].replace(/,/g, ''));

    // Total debited
    const debitMatch = text.match(/Total debited(\d+)\s+Transactions-([\d,]+\.\d{2})/);
    if (debitMatch) {
        summary.debitCount = parseInt(debitMatch[1]);
        summary.totalDebited = parseFloat(debitMatch[2].replace(/,/g, ''));
    }

    // Total credited
    const creditMatch = text.match(/Total credited(\d+)\s+Transactions\+([\d,]+\.\d{2})/);
    if (creditMatch) {
        summary.creditCount = parseInt(creditMatch[1]);
        summary.totalCredited = parseFloat(creditMatch[2].replace(/,/g, ''));
    }

    return summary;
}
