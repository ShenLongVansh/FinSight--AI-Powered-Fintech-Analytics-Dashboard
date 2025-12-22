'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { Transaction } from '@/types';
import { CategoryBadge } from '@/components/ui';

interface TransactionsTableProps {
    transactions: Transaction[];
    pageSize?: number;
}

type SortField = 'date' | 'amount' | 'description' | 'category';
type SortOrder = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function TransactionsTable({ transactions, pageSize: initialPageSize = 10 }: TransactionsTableProps) {
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isPageChanging, setIsPageChanging] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [pageSize, setPageSize] = useState(initialPageSize);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pageChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced search - 400ms delay
    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value);
        setIsSearching(true);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(value);
            setIsSearching(false);
            setCurrentPage(1);
        }, 400);
    }, []);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (pageChangeTimeoutRef.current) {
                clearTimeout(pageChangeTimeoutRef.current);
            }
        };
    }, []);

    // Get unique categories
    const categories = useMemo(() => {
        const unique = [...new Set(transactions.map(t => t.category))];
        return ['all', ...unique.sort()];
    }, [transactions]);

    // Filter and sort transactions
    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Search filter (using debounced value)
        if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase();
            filtered = filtered.filter(t =>
                t.description.toLowerCase().includes(query) ||
                t.category.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(t => t.category === selectedCategory);
        }

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'date':
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                    break;
                case 'amount':
                    comparison = a.amount - b.amount;
                    break;
                case 'description':
                    comparison = a.description.localeCompare(b.description);
                    break;
                case 'category':
                    comparison = a.category.localeCompare(b.category);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [transactions, debouncedSearch, selectedCategory, sortField, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / pageSize);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Handle page change with loading animation
    const handlePageChange = useCallback((newPage: number) => {
        if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;

        setIsPageChanging(true);

        // Brief delay for smooth transition feel
        if (pageChangeTimeoutRef.current) {
            clearTimeout(pageChangeTimeoutRef.current);
        }

        pageChangeTimeoutRef.current = setTimeout(() => {
            setCurrentPage(newPage);
            setIsPageChanging(false);
        }, 650);
    }, [currentPage, totalPages]);

    // Reset to page 1 when page size changes
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown size={14} className="text-slate-600" />;
        return sortOrder === 'asc'
            ? <ArrowUp size={14} className="text-emerald-400" />
            : <ArrowDown size={14} className="text-emerald-400" />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatAmount = (amount: number, type: 'debit' | 'credit') => {
        const formatted = `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        return type === 'debit' ? `-${formatted}` : `+${formatted}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl overflow-hidden"
        >
            {/* Header with search and filter */}
            <div className="p-4 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {/* Search input */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchInput}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 w-full sm:w-48 transition-colors"
                            />
                        </div>

                        {/* Category filter */}
                        <div className="relative">
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-9 pr-8 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-white appearance-none cursor-pointer focus:border-emerald-500/50 w-full sm:w-48"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="bg-slate-900">
                                        {cat === 'all' ? 'Filter by Category' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block relative overflow-x-auto">
                {/* Loading overlay with blur */}
                <AnimatePresence>
                    {(isSearching || isPageChanging) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={32} className="animate-spin text-emerald-400" />
                                <span className="text-sm text-slate-300">
                                    {isSearching ? 'Searching...' : 'Loading...'}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50">
                            <th className="text-left p-4">
                                <button
                                    onClick={() => handleSort('date')}
                                    className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                                >
                                    Date <SortIcon field="date" />
                                </button>
                            </th>
                            <th className="text-left p-4">
                                <button
                                    onClick={() => handleSort('description')}
                                    className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                                >
                                    Description <SortIcon field="description" />
                                </button>
                            </th>
                            <th className="text-left p-4">
                                <button
                                    onClick={() => handleSort('category')}
                                    className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
                                >
                                    Category <SortIcon field="category" />
                                </button>
                            </th>
                            <th className="text-right p-4">
                                <button
                                    onClick={() => handleSort('amount')}
                                    className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider hover:text-white transition-colors ml-auto"
                                >
                                    Amount <SortIcon field="amount" />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody className={isPageChanging ? 'opacity-30' : ''}>
                        <AnimatePresence mode="popLayout">
                            {paginatedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                paginatedTransactions.map((transaction) => (
                                    <motion.tr
                                        key={transaction.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.15 }}
                                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="p-4">
                                            <span className="text-sm text-slate-300">
                                                {formatDate(transaction.date)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-white font-medium truncate block max-w-xs">
                                                {transaction.description}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <CategoryBadge category={transaction.category} />
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`text-sm font-semibold ${transaction.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {formatAmount(transaction.amount, transaction.type)}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List View (Exonao Style) */}
            <div className="md:hidden relative min-h-[300px]">
                {/* Loading overlay for mobile */}
                <AnimatePresence>
                    {(isSearching || isPageChanging) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-b-2xl"
                        >
                            <Loader2 size={32} className="animate-spin text-emerald-400" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={`flex flex-col ${isPageChanging ? 'opacity-30' : ''}`}>
                    <AnimatePresence mode="popLayout">
                        {paginatedTransactions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                No transactions found
                            </div>
                        ) : (
                            paginatedTransactions.map((transaction) => (
                                <motion.div
                                    key={transaction.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 active:bg-slate-800/50 transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`shrink-0 p-2.5 rounded-xl ${transaction.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            {transaction.type === 'credit' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-white font-medium truncate pr-2 text-[15px]">
                                                {transaction.description}
                                            </span>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span>{formatDate(transaction.date)}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                <span className="truncate max-w-[100px]">{transaction.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <span className={`block font-bold whitespace-nowrap ${transaction.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {transaction.type === 'credit' ? '+' : '-'}{formatAmount(transaction.amount, 'debit').replace('-', '').replace('+', '')}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Enhanced Pagination */}
            {filteredTransactions.length > 0 && (
                <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Rows per page selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">Rows per page</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white appearance-none cursor-pointer focus:border-emerald-500/50 min-w-[70px]"
                        >
                            {PAGE_SIZE_OPTIONS.map(size => (
                                <option key={size} value={size} className="bg-slate-900">
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Page info and controls */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <div className="flex items-center gap-1">
                            {/* First page */}
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1 || isPageChanging}
                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="First page"
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            {/* Previous page */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || isPageChanging}
                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Previous page"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {/* Next page */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0 || isPageChanging}
                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Next page"
                            >
                                <ChevronRight size={16} />
                            </button>
                            {/* Last page */}
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages || totalPages === 0 || isPageChanging}
                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Last page"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
