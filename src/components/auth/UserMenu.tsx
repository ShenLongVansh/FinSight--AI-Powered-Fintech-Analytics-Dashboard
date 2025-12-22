'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';

export default function UserMenu() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    if (loading) {
        return <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />;
    }

    if (!user) {
        return (
            <div className="flex items-center gap-4">
                <Link
                    href="/sign-in"
                    className="text-slate-300 hover:text-white transition-colors"
                >
                    Sign In
                </Link>
                <Link
                    href="/sign-up"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25"
                >
                    Get Started
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25"
            >
                <LayoutDashboard size={18} />
                Dashboard
            </Link>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white shadow-lg border-2 border-slate-700 transition-transform hover:scale-105 overflow-hidden"
                >
                    {user.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt={user.user_metadata?.full_name || 'User'}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        user.email ? user.email[0].toUpperCase() : <UserIcon size={20} />
                    )}
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden py-1">
                            <div className="px-4 py-3 border-b border-slate-800">
                                <p className="text-sm font-medium text-white truncate">
                                    {user.user_metadata?.full_name || user.email}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
