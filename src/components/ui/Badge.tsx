'use client';

import { motion } from 'framer-motion';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
    className?: string;
}

const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
    return (
        <motion.span
            className={`inline-flex items-center rounded-full border font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
        >
            {children}
        </motion.span>
    );
}

// Category badge with custom color
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    'Food & Dining': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    'Shopping': { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
    'Travel': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    'Bills & Utilities': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    'Subscriptions': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    'Entertainment': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    'Health': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    'Income': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    'Transfer': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    'Other': { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export function CategoryBadge({ category }: { category: string }) {
    const colors = categoryColors[category] || categoryColors['Other'];

    return (
        <motion.span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
        >
            {category}
        </motion.span>
    );
}

// Status badge for file upload
const statusStyles = {
    pending: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Pending' },
    processing: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Processing' },
    completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Completed' },
    error: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Error' },
    password_required: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Password Required' },
};

export function StatusBadge({ status }: { status: keyof typeof statusStyles }) {
    const style = statusStyles[status];

    return (
        <motion.span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${style.bg} ${style.text} ${style.border}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {status === 'processing' && (
                <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-current"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}
            {style.label}
        </motion.span>
    );
}
