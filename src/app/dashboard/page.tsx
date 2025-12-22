'use client';

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Upload,
    Settings,
    TrendingUp,
    Key,
    Menu,
    Loader2,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronUp,
    LogOut,
    User as UserIcon,
} from 'lucide-react';
import { PDFUploader } from '@/components/upload';
import {
    KPICards,
    SpendingTrendChart,
    CategoryBreakdownChart,
    DebitCreditChart,
    TransactionsTable
} from '@/components/dashboard';
import { Card, Modal, Button, Footer } from '@/components/ui';
import {
    calculateMonthlyTotals,
    calculateCategoryBreakdown,
    calculateKPIMetrics,
    getDateRange
} from '@/lib/analytics/engine';
import { Transaction, PasswordProfile } from '@/types';
import { playSuccessSound } from '@/lib/utils/sounds';

type View = 'dashboard' | 'upload' | 'settings';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user on mount
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setIsLoaded(true);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    // App state
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [passwordProfiles, setPasswordProfiles] = useState<PasswordProfile[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showPasswordManager, setShowPasswordManager] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [minLoadingComplete, setMinLoadingComplete] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Computed analytics data
    const monthlyData = useMemo(() => calculateMonthlyTotals(transactions), [transactions]);
    const categoryData = useMemo(() => calculateCategoryBreakdown(transactions), [transactions]);
    const kpiMetrics = useMemo(() => calculateKPIMetrics(transactions), [transactions]);
    const dateRange = useMemo(() => getDateRange(transactions), [transactions]);

    // Minimum loading delay for UX (so user can read the loading message)
    useEffect(() => {
        const timer = setTimeout(() => setMinLoadingComplete(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    // Fetch transactions on mount
    const fetchTransactions = useCallback(async () => {
        try {
            const response = await fetch('/api/transactions');
            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    // Fetch password profiles from database
    const fetchPasswordProfiles = useCallback(async () => {
        try {
            const response = await fetch('/api/password-profiles');
            if (response.ok) {
                const data = await response.json();
                setPasswordProfiles(data.profiles || []);
            }
        } catch (error) {
            console.error('Error fetching password profiles:', error);
        }
    }, []);

    useEffect(() => {
        if (isLoaded && user) {
            fetchTransactions();
            fetchPasswordProfiles();
        }
    }, [isLoaded, user, fetchTransactions, fetchPasswordProfiles]);

    // Handle file processing - save to DB and update local state
    const handleFilesProcessed = async (newTransactions: Transaction[]) => {
        if (newTransactions.length > 0) {
            setIsSaving(true);
            try {
                // Save to database
                const response = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactions: newTransactions }),
                });

                if (response.ok) {
                    // Refresh transactions from DB to get proper IDs
                    await fetchTransactions();
                    // Play success sound on completion!
                    playSuccessSound();
                } else {
                    // Fallback: just add to local state
                    setTransactions(prev => [...prev, ...newTransactions]);
                }
            } catch (error) {
                console.error('Error saving transactions:', error);
                // Fallback: just add to local state
                setTransactions(prev => [...prev, ...newTransactions]);
            } finally {
                setIsSaving(false);
            }
            setCurrentView('dashboard');
        }
    };

    // Clear all data
    const handleClearData = async () => {
        try {
            const response = await fetch('/api/transactions', { method: 'DELETE' });
            if (response.ok) {
                setTransactions([]);
            }
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    };

    // Add password profile (save to database)
    const handleAddPasswordProfile = async (profile: Omit<PasswordProfile, 'id' | 'createdAt'>) => {
        try {
            const response = await fetch('/api/password-profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile.name,
                    encryptedPassword: profile.encryptedPassword,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPasswordProfiles(prev => [...prev, data.profile]);
            }
        } catch (error) {
            console.error('Error saving password profile:', error);
        }
    };

    // Delete password profile (from database)
    const handleDeleteProfile = async (id: string) => {
        try {
            const response = await fetch(`/api/password-profiles?id=${id}`, { method: 'DELETE' });
            if (response.ok) {
                setPasswordProfiles(prev => prev.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Error deleting password profile:', error);
        }
    };

    // Full-screen loading overlay - show until data loaded AND minimum delay passed
    if (!isLoaded || isLoadingData || !minLoadingComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800" />
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                {/* Loading content */}
                <div className="relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                    >
                        {/* Logo */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>

                        {/* Spinner */}
                        <div className="relative mb-4">
                            <div className="w-12 h-12 border-4 border-slate-700 rounded-full" />
                            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">FinSight</h2>
                        <p className="text-slate-400 text-sm">Loading your financial data...</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 z-50 will-change-transform transition-transform duration-200 ease-out ${isSidebarCollapsed ? 'lg:-translate-x-full' : 'lg:translate-x-0'
                    } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo + Close button */}
                    <div className="h-[65px] flex items-center justify-between px-6 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white leading-tight">FinSight</h1>
                                <p className="text-xs text-slate-500 leading-tight">Analytics Dashboard</p>
                            </div>
                        </div>
                        {/* Close sidebar button (desktop) */}
                        <button
                            onClick={() => setIsSidebarCollapsed(true)}
                            className="hidden lg:flex p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Close sidebar"
                        >
                            <PanelLeftClose size={18} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        <NavItem
                            icon={<LayoutDashboard size={20} />}
                            label="Dashboard"
                            active={currentView === 'dashboard'}
                            onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }}
                        />
                        <NavItem
                            icon={<Upload size={20} />}
                            label="Upload Statements"
                            active={currentView === 'upload'}
                            onClick={() => { setCurrentView('upload'); setIsSidebarOpen(false); }}
                        />
                        <NavItem
                            icon={<Key size={20} />}
                            label="Password Manager"
                            onClick={() => setShowPasswordManager(true)}
                        />
                        <NavItem
                            icon={<Settings size={20} />}
                            label="Settings"
                            active={currentView === 'settings'}
                            onClick={() => { setCurrentView('settings'); setIsSidebarOpen(false); }}
                        />
                    </nav>

                    {/* User section with custom dropdown */}
                    <div className="p-4 border-t border-slate-800 relative" ref={userMenuRef}>
                        {/* Clickable user row */}
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group"
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {user?.user_metadata?.avatar_url ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt="Avatar"
                                        className="w-9 h-9 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-semibold text-sm">
                                        {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <ChevronUp
                                size={16}
                                className={`text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Dropdown menu */}
                        <AnimatePresence>
                            {isUserMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setIsUserMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut size={18} />
                                        <span className="text-sm">Sign Out</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main
                className={`flex flex-col min-h-screen will-change-[margin] transition-[margin-left] duration-200 ease-out ${isSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}
            >
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-background/95 border-b border-slate-800 h-[65px]">
                    <div className="flex items-center justify-between px-4 lg:px-8 h-full">
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"
                            >
                                <Menu size={20} />
                            </button>

                            {/* Open sidebar button (desktop - only when collapsed) */}
                            {isSidebarCollapsed && (
                                <button
                                    onClick={() => setIsSidebarCollapsed(false)}
                                    className="hidden lg:flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                    title="Open sidebar"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                    <PanelLeftOpen size={18} />
                                </button>
                            )}

                            <div>
                                <h2 className="text-lg font-bold text-white capitalize leading-tight">
                                    {currentView === 'upload' ? 'Upload Statements' : currentView}
                                </h2>
                                {currentView === 'dashboard' && (
                                    <p className="text-xs text-slate-500 leading-tight">{dateRange}</p>
                                )}
                            </div>
                        </div>

                        {currentView === 'dashboard' && transactions.length > 0 && (
                            <Button
                                variant="secondary"
                                size="sm"
                                icon={<Upload size={16} />}
                                onClick={() => setCurrentView('upload')}
                            >
                                Add More
                            </Button>
                        )}
                    </div>
                </header>

                {/* Content */}
                <div className="p-4 lg:p-8">
                    <AnimatePresence mode="wait">
                        {currentView === 'dashboard' && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {transactions.length === 0 ? (
                                    <EmptyState onUploadClick={() => setCurrentView('upload')} />
                                ) : (
                                    <>
                                        <KPICards metrics={kpiMetrics} />
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                            <Card className="p-6" hover={false}>
                                                <h3 className="text-lg font-semibold text-white mb-4">Spending Trends</h3>
                                                <SpendingTrendChart data={monthlyData} />
                                            </Card>
                                            <Card className="p-6" hover={false}>
                                                <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
                                                <CategoryBreakdownChart data={categoryData} />
                                            </Card>
                                        </div>
                                        <Card className="p-6" hover={false}>
                                            <h3 className="text-lg font-semibold text-white mb-4">Income vs Expenses</h3>
                                            <DebitCreditChart data={monthlyData} />
                                        </Card>
                                        <TransactionsTable transactions={transactions} />
                                    </>
                                )}
                            </motion.div>
                        )}

                        {currentView === 'upload' && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-2xl mx-auto"
                            >
                                <Card className="p-6">
                                    <PDFUploader
                                        onFilesProcessed={handleFilesProcessed}
                                        passwordProfiles={passwordProfiles}
                                        onAddPasswordProfile={handleAddPasswordProfile}
                                    />
                                </Card>
                            </motion.div>
                        )}

                        {currentView === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-2xl mx-auto space-y-6"
                            >
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
                                    <div className="space-y-4">
                                        <div
                                            className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 w-full"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {user?.user_metadata?.avatar_url ? (
                                                    <img
                                                        src={user.user_metadata.avatar_url}
                                                        alt="Avatar"
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white font-semibold text-lg">
                                                        {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{user?.user_metadata?.full_name || 'User'}</p>
                                                <p className="text-sm text-slate-500">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
                                    <p className="text-sm text-slate-400 mb-4">
                                        You have {transactions.length} transactions stored.
                                    </p>
                                    <Button variant="danger" size="sm" onClick={handleClearData}>
                                        Clear All Data
                                    </Button>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <Footer className="mt-auto border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm" />
            </main>

            {/* Password Manager Modal */}
            <Modal
                isOpen={showPasswordManager}
                onClose={() => setShowPasswordManager(false)}
                title="Password Manager"
                size="lg"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                        Save passwords for your bank statement PDFs to quickly unlock them during upload.
                    </p>

                    {passwordProfiles.length === 0 ? (
                        <div className="text-center py-8">
                            <Key className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-500">No saved passwords yet</p>
                            <p className="text-sm text-slate-600">
                                Add a password when uploading PDFs to save it here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {passwordProfiles.map(profile => (
                                <div
                                    key={profile.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-700/50">
                                            <Key size={16} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{profile.name}</p>
                                            <p className="text-xs text-slate-500">
                                                Added {new Date(profile.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteProfile(profile.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}

// Navigation item component
function NavItem({
    icon,
    label,
    active = false,
    onClick,
    collapsed = false
}: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
    collapsed?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            title={collapsed ? label : undefined}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} ${collapsed ? 'px-2' : 'px-4'} py-3 rounded-xl transition-all ${active
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
        >
            {icon}
            {!collapsed && <span className="font-medium">{label}</span>}
        </button>
    );
}

// Empty state component
function EmptyState({ onUploadClick }: { onUploadClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
        >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 flex items-center justify-center mb-6">
                <Upload className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No statements uploaded yet</h3>
            <p className="text-slate-500 mb-6 text-center max-w-md">
                Upload your bank statement PDFs to get AI-powered insights into your spending patterns
            </p>
            <Button onClick={onUploadClick} icon={<Upload size={18} />}>
                Upload Statements
            </Button>
        </motion.div>
    );
}
