'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        children,
        variant = 'primary',
        size = 'md',
        loading = false,
        icon,
        iconPosition = 'left',
        fullWidth = false,
        className = '',
        disabled,
        ...props
    }, ref) => {
        const baseStyles = 'relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';

        const variantStyles: Record<ButtonVariant, string> = {
            primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 focus:ring-emerald-500 shadow-lg shadow-emerald-500/25',
            secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 focus:ring-slate-500',
            ghost: 'bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white focus:ring-slate-500',
            danger: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-400 hover:to-rose-500 focus:ring-rose-500 shadow-lg shadow-rose-500/25',
        };

        const sizeStyles: Record<ButtonSize, string> = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-5 py-2.5 text-sm',
            lg: 'px-7 py-3.5 text-base',
        };

        return (
            <motion.button
                ref={ref}
                className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
                disabled={disabled || loading}
                whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
                whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
                {...props}
            >
                {/* Shimmer effect */}
                <motion.div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={!disabled && !loading ? { translateX: ['100%', '-100%'] } : {}}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: 'easeInOut'
                    }}
                />

                {loading ? (
                    <>
                        <Spinner size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
                        <span className="relative z-10">Loading...</span>
                    </>
                ) : (
                    <>
                        {icon && iconPosition === 'left' && <span className="relative z-10">{icon}</span>}
                        <span className="relative z-10">{children}</span>
                        {icon && iconPosition === 'right' && <span className="relative z-10">{icon}</span>}
                    </>
                )}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

// Animated spinner
function Spinner({ size = 16 }: { size?: number }) {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className="relative z-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-25"
            />
            <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </motion.svg>
    );
}

// Icon button variant
interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    icon: ReactNode;
    label: string;
    variant?: 'ghost' | 'filled';
    size?: 'sm' | 'md' | 'lg';
}

export function IconButton({
    icon,
    label,
    variant = 'ghost',
    size = 'md',
    className = '',
    ...props
}: IconButtonProps) {
    const sizeStyles = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
    };

    const variantStyles = {
        ghost: 'hover:bg-slate-800/50 text-slate-400 hover:text-white',
        filled: 'bg-slate-800 hover:bg-slate-700 text-slate-300',
    };

    return (
        <motion.button
            className={`rounded-xl transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={label}
            {...props}
        >
            {icon}
        </motion.button>
    );
}
