'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Sector } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryData } from '@/types';

interface CategoryBreakdownChartProps {
    data: CategoryData[];
}

const COLORS = [
    '#10b981', // emerald
    '#8b5cf6', // violet  
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#64748b', // slate
];

// Simple hover shape - just pops out slightly with vibrancy
const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, payload } = props;

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius - 3}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={payload.color}
                stroke="#fff"
                strokeWidth={2}
                style={{
                    filter: 'saturate(1.3) brightness(1.1)',
                }}
            />
        </g>
    );
};

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

    // Add colors to data
    const coloredData = data.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
    }));

    // Get active item for info display
    const activeItem = activeIndex !== undefined ? coloredData[activeIndex] : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full relative flex flex-col md:flex-row h-auto md:h-[350px]"
        >
            {/* Pie Chart Container */}
            <div className="relative w-full h-[300px] md:h-full md:flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 0, bottom: 20, left: 0 }}>
                        <defs>
                            {COLORS.map((color, index) => (
                                <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                                </linearGradient>
                            ))}
                        </defs>
                        <Pie
                            data={coloredData}
                            cx="50%"
                            cy="50%"
                            innerRadius="50%"
                            outerRadius="80%"
                            paddingAngle={3}
                            dataKey="amount"
                            nameKey="category"
                            animationBegin={200}
                            animationDuration={1000}
                            animationEasing="ease-out"
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(undefined)}
                            style={{ cursor: 'pointer', outline: 'none' }}
                        >
                            {coloredData.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={`url(#gradient-${index % COLORS.length})`}
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth={2}
                                    style={{
                                        opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.5,
                                        transition: 'opacity 0.2s ease',
                                        outline: 'none',
                                    }}
                                />
                            ))}
                        </Pie>
                        <Legend content={<CustomLegend />} layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Info Card - Responsive Positioning */}
            <div className="w-full md:w-40 flex items-center md:items-start justify-center md:justify-start pt-4 md:pt-12 pb-4 md:pb-0 px-4 md:px-0">
                <AnimatePresence mode="wait">
                    {activeItem ? (
                        <motion.div
                            key={activeItem.category}
                            initial={{ opacity: 0, y: 10, x: 0 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, y: 10, x: 0 }}
                            transition={{ duration: 0.15 }}
                            className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50 w-full max-w-xs md:max-w-none"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: activeItem.color }}
                                />
                                <p className="text-white font-semibold text-sm truncate">{activeItem.category}</p>
                            </div>
                            <p className="text-emerald-400 font-bold text-lg">
                                ₹{activeItem.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-slate-400 text-xs">{activeItem.percentage.toFixed(1)}% of total</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="hint"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-slate-500 text-xs text-center md:text-left"
                        >
                            Tap/Hover a slice for details
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// Custom legend
function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string; payload?: { color?: string } }> }) {
    return (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
            {payload?.map((entry, index) => {
                const dotColor = entry.payload?.color || entry.color || COLORS[index % COLORS.length];
                return (
                    <div
                        key={`legend-${index}`}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/50"
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: dotColor }}
                        />
                        <span className="text-xs text-slate-300">{entry.value}</span>
                    </div>
                );
            })}
        </div>
    );
}
