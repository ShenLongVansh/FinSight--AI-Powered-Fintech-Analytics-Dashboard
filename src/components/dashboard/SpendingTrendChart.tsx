'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps
} from 'recharts';
import { motion } from 'framer-motion';
import { MonthlyData } from '@/types';

interface SpendingTrendChartProps {
    data: MonthlyData[];
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (active && payload && payload.length) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl p-4 shadow-2xl"
            >
                <p className="text-sm font-medium text-slate-300 mb-2">{label}</p>
                <div className="space-y-1">
                    <p className="text-sm">
                        <span className="inline-block w-3 h-3 rounded-full bg-rose-500 mr-2" />
                        <span className="text-slate-400">Spending: </span>
                        <span className="text-white font-semibold">
                            ₹{payload[0]?.value?.toLocaleString()}
                        </span>
                    </p>
                    {payload[1] && (
                        <p className="text-sm">
                            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-2" />
                            <span className="text-slate-400">Income: </span>
                            <span className="text-white font-semibold">
                                ₹{payload[1]?.value?.toLocaleString()}
                            </span>
                        </p>
                    )}
                </div>
            </motion.div>
        );
    }
    return null;
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full h-[350px]"
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="totalSpending"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fill="url(#spendingGradient)"
                        animationDuration={1500}
                        animationEasing="ease-out"
                    />
                    <Area
                        type="monotone"
                        dataKey="totalIncome"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#incomeGradient)"
                        animationDuration={1500}
                        animationEasing="ease-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
