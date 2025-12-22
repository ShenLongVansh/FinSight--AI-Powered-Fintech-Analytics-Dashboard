'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps,
    Legend,
    Cell,
    LabelList
} from 'recharts';
import { motion } from 'framer-motion';
import { MonthlyData } from '@/types';

interface DebitCreditChartProps {
    data: MonthlyData[];
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (active && payload && payload.length) {
        const formatAmount = (value: number) => {
            return `₹${Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        };

        const netFlow = (payload[1]?.value as number || 0) - (payload[0]?.value as number || 0);

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl p-4 shadow-2xl"
            >
                <p className="text-sm font-medium text-slate-300 mb-3">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-slate-400">
                                    {entry.name === 'totalSpending' ? 'Spending' : 'Income'}
                                </span>
                            </div>
                            <span className="text-sm font-semibold text-white">
                                {formatAmount(entry.value as number || 0)}
                            </span>
                        </div>
                    ))}
                </div>
                {payload.length === 2 && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Net Flow</span>
                            <span className={`text-sm font-semibold ${netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {netFlow >= 0 ? '+' : '-'}{formatAmount(netFlow)}
                            </span>
                        </div>
                    </div>
                )}
            </motion.div>
        );
    }
    return null;
}

function CustomLegend() {
    return (
        <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-rose-500" />
                <span className="text-sm text-slate-400">Spending</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-sm text-slate-400">Income</span>
            </div>
        </div>
    );
}

// Custom label component for bar values
const renderBarLabel = (props: any) => {
    const { x = 0, y = 0, width = 0, value = 0 } = props;
    if (!value || value === 0) return null;

    const formattedValue = value >= 1000
        ? `₹${(value / 1000).toFixed(1)}k`
        : `₹${value}`;

    return (
        <text
            x={x + width / 2}
            y={y - 8}
            fill="#94a3b8"
            textAnchor="middle"
            fontSize={11}
            fontWeight={500}
        >
            {formattedValue}
        </text>
    );
};

export function DebitCreditChart({ data }: DebitCreditChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full h-[350px]"
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 30, right: 30, left: 10, bottom: 10 }}
                    barGap={4}
                    barCategoryGap="20%"
                >
                    <defs>
                        <linearGradient id="spendingBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.6} />
                        </linearGradient>
                        <linearGradient id="incomeBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
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
                        tick={{ fill: '#e2e8f0', fontSize: 13, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        dx={-5}
                        width={55}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Legend content={<CustomLegend />} />
                    <Bar
                        dataKey="totalSpending"
                        fill="url(#spendingBarGradient)"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        maxBarSize={60}
                    >
                        <LabelList dataKey="totalSpending" content={renderBarLabel} />
                        {data.map((_, index) => (
                            <Cell key={`spending-${index}`} />
                        ))}
                    </Bar>
                    <Bar
                        dataKey="totalIncome"
                        fill="url(#incomeBarGradient)"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        maxBarSize={60}
                    >
                        <LabelList dataKey="totalIncome" content={renderBarLabel} />
                        {data.map((_, index) => (
                            <Cell key={`income-${index}`} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

