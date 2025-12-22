'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    children: ReactNode;
    variant?: 'default' | 'glow' | 'gradient';
    hover?: boolean;
    className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ children, variant = 'default', hover = true, className = '', ...props }, ref) => {
        const baseStyles = 'rounded-2xl p-6 glass glass-border';

        const variantStyles = {
            default: '',
            glow: 'glow-effect',
            gradient: 'bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10',
        };

        const hoverAnimation = hover ? {
            whileHover: {
                y: -4,
                transition: { duration: 0.2, ease: 'easeOut' }
            },
        } : {};

        return (
            <motion.div
                ref={ref}
                className={`${baseStyles} ${variantStyles[variant]} ${className}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                {...hoverAnimation}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = 'Card';

// Animated stat card with number counter
interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    trend?: { value: number; positive: boolean };
    color?: 'emerald' | 'violet' | 'blue' | 'rose' | 'amber';
    delay?: number;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    color = 'emerald',
    delay = 0
}: StatCardProps) {
    const colorMap = {
        emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
        violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
        blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
        rose: 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
        amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    };

    const iconColorMap = {
        emerald: 'text-emerald-400 bg-emerald-500/20',
        violet: 'text-violet-400 bg-violet-500/20',
        blue: 'text-blue-400 bg-blue-500/20',
        rose: 'text-rose-400 bg-rose-500/20',
        amber: 'text-amber-400 bg-amber-500/20',
    };

    return (
        <motion.div
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${colorMap[color]} p-6 backdrop-blur-xl`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
        >
            {/* Glow effect */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-radial from-white/5 to-transparent rounded-full blur-2xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">{title}</span>
                    {icon && (
                        <motion.div
                            className={`p-2 rounded-xl ${iconColorMap[color]}`}
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        >
                            {icon}
                        </motion.div>
                    )}
                </div>

                <motion.div
                    className="text-3xl font-bold text-white mb-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: delay + 0.2 }}
                >
                    {value}
                </motion.div>

                {(subtitle || trend) && (
                    <div className="flex items-center gap-2 mt-2">
                        {trend && (
                            <span className={`text-sm font-medium ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </span>
                        )}
                        {subtitle && (
                            <span className="text-sm text-slate-500">{subtitle}</span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
