export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    category: string;
    bankName?: string;
}

export interface MonthlyData {
    month: string;
    totalSpending: number;
    totalIncome: number;
    netFlow: number;
    transactionCount: number;
}

export interface CategoryData {
    category: string;
    amount: number;
    percentage: number;
    color: string;
}

export interface KPIMetrics {
    totalSpending: number;
    totalIncome: number;
    netCashFlow: number;
    transactionCount: number;
    avgTransactionSize: number;
    topCategory: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    createdAt?: string;
}

export interface PasswordProfile {
    id: string;
    name: string;
    encryptedPassword: string;
    createdAt: string;
}

export type ProcessingStage = 'queued' | 'uploading' | 'decrypting' | 'scanning' | 'extracting' | 'analyzing' | 'complete' | 'error';

export interface UploadedFile {
    id: string;
    fileName: string;
    status: 'pending' | 'processing' | 'completed' | 'error' | 'password_required';
    stage?: ProcessingStage;
    progress?: number;
    passwordProfileId?: string;
    error?: string;
    transactionCount?: number;
    estimatedTransactions?: number;
    estimatedSeconds?: number;
}

