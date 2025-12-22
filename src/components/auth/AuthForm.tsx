'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui/Button';

interface AuthFormProps {
    onSuccess: (user: { id: string; email: string; name: string }) => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock successful auth
            onSuccess({
                id: 'user-' + Math.random().toString(36).substr(2, 9),
                email: formData.email,
                name: formData.name || formData.email.split('@')[0],
            });
        } catch (err) {
            setError('Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative"
            >
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-violet-500 mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    >
                        <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Bank Statement Analytics
                    </h1>
                    <p className="text-slate-400">
                        AI-powered insights into your spending
                    </p>
                </div>

                {/* Auth card */}
                <motion.div
                    className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    {/* Mode tabs */}
                    <div className="flex mb-6 p-1 bg-slate-800/50 rounded-xl">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'login'
                                    ? 'bg-slate-700 text-white shadow'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'signup'
                                    ? 'bg-slate-700 text-white shadow'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Input
                                    label="Full Name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    icon={<User size={18} />}
                                    required={mode === 'signup'}
                                />
                            </motion.div>
                        )}

                        <Input
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@example.com"
                            icon={<Mail size={18} />}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            icon={<Lock size={18} />}
                            required
                        />

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-rose-400 text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            loading={isLoading}
                            icon={<ArrowRight size={18} />}
                            iconPosition="right"
                        >
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </Button>
                    </form>

                    {mode === 'login' && (
                        <p className="text-center text-sm text-slate-500 mt-4">
                            <button className="text-emerald-400 hover:text-emerald-300">
                                Forgot your password?
                            </button>
                        </p>
                    )}
                </motion.div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </motion.div>
        </div>
    );
}
