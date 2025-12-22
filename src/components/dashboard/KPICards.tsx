'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowUpDown, CreditCard, PiggyBank } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { KPIMetrics } from '@/types';

interface KPICardsProps {
    metrics: KPIMetrics;
}

export function KPICards({ metrics }: KPICardsProps) {
    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        } else if (value >= 1000) {
            return `₹${(value / 1000).toFixed(1)}K`;
        }
        return `₹${value.toLocaleString()}`;
    };

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                }
            }}
        >
            <StatCard
                title="Total Spending"
                value={formatCurrency(metrics.totalSpending)}
                subtitle="This period"
                icon={<TrendingDown size={20} />}
                color="rose"
                delay={0}
            />

            <StatCard
                title="Total Income"
                value={formatCurrency(metrics.totalIncome)}
                subtitle="This period"
                icon={<TrendingUp size={20} />}
                color="emerald"
                delay={0.1}
            />

            <StatCard
                title="Net Cash Flow"
                value={formatCurrency(Math.abs(metrics.netCashFlow))}
                subtitle={metrics.netCashFlow >= 0 ? 'Positive flow' : 'Negative flow'}
                icon={<Wallet size={20} />}
                color={metrics.netCashFlow >= 0 ? 'emerald' : 'rose'}
                trend={metrics.netCashFlow !== 0 ? {
                    value: Math.round((metrics.netCashFlow / metrics.totalIncome) * 100),
                    positive: metrics.netCashFlow >= 0
                } : undefined}
                delay={0.2}
            />

            <StatCard
                title="Transactions"
                value={metrics.transactionCount.toLocaleString()}
                subtitle={`Avg ₹${Math.round(metrics.avgTransactionSize).toLocaleString()}`}
                icon={<ArrowUpDown size={20} />}
                color="violet"
                delay={0.3}
            />
        </motion.div>
    );
}

// Alternative detailed cards
interface DetailedKPIProps {
    metrics: KPIMetrics;
}

export function DetailedKPICards({ metrics }: DetailedKPIProps) {
    const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Main spending card */}
            <motion.div
                className="col-span-1 lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 backdrop-blur-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Financial Overview</h3>
                        <p className="text-3xl font-bold text-white">
                            {formatCurrency(metrics.netCashFlow)}
                        </p>
                        <p className={`text-sm mt-1 ${metrics.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {metrics.netCashFlow >= 0 ? 'Net positive this period' : 'Net negative this period'}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20">
                        <PiggyBank className="w-8 h-8 text-emerald-400" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown size={16} className="text-rose-400" />
                            <span className="text-sm text-slate-400">Spent</span>
                        </div>
                        <p className="text-xl font-semibold text-white">{formatCurrency(metrics.totalSpending)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={16} className="text-emerald-400" />
                            <span className="text-sm text-slate-400">Earned</span>
                        </div>
                        <p className="text-xl font-semibold text-white">{formatCurrency(metrics.totalIncome)}</p>
                    </div>
                </div>
            </motion.div>

            {/* Top category card */}
            <motion.div
                className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-slate-900/80 border border-violet-500/20 backdrop-blur-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-violet-500/20">
                        <CreditCard size={18} className="text-violet-400" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-400">Top Category</h3>
                </div>
                <p className="text-2xl font-bold text-white mb-2">{metrics.topCategory}</p>
                <p className="text-sm text-slate-500">Highest spending area</p>

                <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Total Transactions</span>
                        <span className="text-lg font-semibold text-white">{metrics.transactionCount}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
