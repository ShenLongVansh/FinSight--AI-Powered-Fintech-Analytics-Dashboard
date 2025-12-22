import { Transaction, MonthlyData, CategoryData, KPIMetrics } from '@/types';

// Calculate monthly totals from transactions
export function calculateMonthlyTotals(transactions: Transaction[]): MonthlyData[] {
    const monthlyMap = new Map<string, MonthlyData>();

    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, {
                month: monthKey,
                totalSpending: 0,
                totalIncome: 0,
                netFlow: 0,
                transactionCount: 0,
            });
        }

        const data = monthlyMap.get(monthKey)!;
        data.transactionCount++;

        if (transaction.type === 'debit') {
            data.totalSpending += transaction.amount;
        } else {
            data.totalIncome += transaction.amount;
        }
        data.netFlow = data.totalIncome - data.totalSpending;
    });

    // Sort by date
    return Array.from(monthlyMap.values()).sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
    });
}

// Calculate category breakdown
export function calculateCategoryBreakdown(transactions: Transaction[]): CategoryData[] {
    const categoryMap = new Map<string, number>();
    let totalSpending = 0;

    // Only count debits for category breakdown
    transactions
        .filter(t => t.type === 'debit')
        .forEach(transaction => {
            const current = categoryMap.get(transaction.category) || 0;
            categoryMap.set(transaction.category, current + transaction.amount);
            totalSpending += transaction.amount;
        });

    const colors = [
        '#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#64748b'
    ];

    return Array.from(categoryMap.entries())
        .map(([category, amount], index) => ({
            category,
            amount,
            percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
            color: colors[index % colors.length],
        }))
        .sort((a, b) => b.amount - a.amount);
}

// Calculate KPI metrics
export function calculateKPIMetrics(transactions: Transaction[]): KPIMetrics {
    let totalSpending = 0;
    let totalIncome = 0;

    transactions.forEach(transaction => {
        if (transaction.type === 'debit') {
            totalSpending += transaction.amount;
        } else {
            totalIncome += transaction.amount;
        }
    });

    const categoryBreakdown = calculateCategoryBreakdown(transactions);
    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'N/A';

    return {
        totalSpending,
        totalIncome,
        netCashFlow: totalIncome - totalSpending,
        transactionCount: transactions.length,
        avgTransactionSize: transactions.length > 0
            ? (totalSpending + totalIncome) / transactions.length
            : 0,
        topCategory,
    };
}

// Format currency for display
export function formatCurrency(amount: number, compact = false): string {
    if (compact) {
        if (Math.abs(amount) >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)}Cr`;
        }
        if (Math.abs(amount) >= 100000) {
            return `₹${(amount / 100000).toFixed(2)}L`;
        }
        if (Math.abs(amount) >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
    }
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

// Get date range string
export function getDateRange(transactions: Transaction[]): string {
    if (transactions.length === 0) return 'No data';

    const dates = transactions.map(t => new Date(t.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    const formatDate = (date: Date) =>
        date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

    if (minDate.getMonth() === maxDate.getMonth() && minDate.getFullYear() === maxDate.getFullYear()) {
        return formatDate(minDate);
    }

    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
}
