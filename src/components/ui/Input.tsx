'use client';

import { motion } from 'framer-motion';
import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    icon?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, size = 'md', className = '', type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';

        const sizeStyles = {
            sm: 'px-3 py-2 text-sm',
            md: 'px-4 py-3 text-sm',
            lg: 'px-5 py-4 text-base',
        };

        return (
            <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {label && (
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={isPassword && showPassword ? 'text' : type}
                        className={`
              w-full rounded-xl bg-slate-900/50 border border-slate-700/50
              text-white placeholder-slate-500
              focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
              transition-all duration-200
              ${icon ? 'pl-12' : ''}
              ${isPassword ? 'pr-12' : ''}
              ${sizeStyles[size]}
              ${error ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20' : ''}
              ${className}
            `}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>
                {error && (
                    <motion.p
                        className="mt-2 text-sm text-rose-400"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error}
                    </motion.p>
                )}
            </motion.div>
        );
    }
);

Input.displayName = 'Input';

// Animated text area
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {label && (
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`
            w-full rounded-xl bg-slate-900/50 border border-slate-700/50
            text-white placeholder-slate-500 px-4 py-3
            focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
            transition-all duration-200 min-h-[100px] resize-y
            ${error ? 'border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20' : ''}
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <motion.p
                        className="mt-2 text-sm text-rose-400"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error}
                    </motion.p>
                )}
            </motion.div>
        );
    }
);

TextArea.displayName = 'TextArea';

// Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className = '', ...props }, ref) => {
        return (
            <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {label && (
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`
            w-full rounded-xl bg-slate-900/50 border border-slate-700/50
            text-white px-4 py-3
            focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
            transition-all duration-200 cursor-pointer
            ${error ? 'border-rose-500/50' : ''}
            ${className}
          `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-900">
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <motion.p
                        className="mt-2 text-sm text-rose-400"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error}
                    </motion.p>
                )}
            </motion.div>
        );
    }
);

Select.displayName = 'Select';
