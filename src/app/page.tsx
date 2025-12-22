'use client';


import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth, UserButton } from '@clerk/nextjs';
import {
    TrendingUp,
    Shield,
    Zap,
    BarChart3,
    FileText,
    ArrowRight,
    Check,
    Sparkles,
    Brain,
    PieChart,
    CreditCard,
    LayoutDashboard,
    Menu,
    X
} from 'lucide-react';

export default function LandingPage() {
    const { isSignedIn, isLoaded } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-white">FinSight</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-8">
                            <a href="#use-cases" className="text-slate-400 hover:text-white transition-colors">
                                Use Cases
                            </a>
                            <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                                Features
                            </a>
                            <a href="#pricing" className="text-slate-400 hover:text-white transition-colors">
                                Pricing
                            </a>
                        </nav>

                        <div className="flex items-center gap-2 md:gap-4">
                            {/* Mobile Auth Controls (Visible when signed in) */}
                            {isLoaded && isSignedIn && (
                                <div className="flex md:hidden items-center gap-2 mr-1">
                                    <Link
                                        href="/dashboard"
                                        className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                        title="Dashboard"
                                    >
                                        <LayoutDashboard size={20} />
                                    </Link>
                                    <UserButton
                                        afterSignOutUrl="/"
                                        appearance={{
                                            elements: {
                                                avatarBox: "w-8 h-8",
                                                userButtonPopoverCard: "bg-slate-900 border border-slate-700",
                                                userButtonPopoverActions: "bg-slate-900",
                                                userButtonPopoverActionButton: "text-slate-300 hover:text-white hover:bg-slate-800",
                                                userButtonPopoverActionButtonText: "text-slate-300",
                                                userButtonPopoverActionButtonIcon: "text-slate-400",
                                                userButtonPopoverFooter: "hidden",
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>

                            {/* Desktop Auth Controls */}
                            <div className="hidden md:flex items-center gap-4">
                                {isLoaded && isSignedIn ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25"
                                        >
                                            <LayoutDashboard size={18} />
                                            Dashboard
                                        </Link>
                                        <UserButton
                                            afterSignOutUrl="/"
                                            appearance={{
                                                elements: {
                                                    userButtonPopoverCard: "bg-slate-900 border border-slate-700",
                                                    userButtonPopoverActions: "bg-slate-900",
                                                    userButtonPopoverActionButton: "text-slate-300 hover:text-white hover:bg-slate-800",
                                                    userButtonPopoverActionButtonText: "text-slate-300",
                                                    userButtonPopoverActionButtonIcon: "text-slate-400",
                                                    userButtonPopoverFooter: "hidden",
                                                }
                                            }}
                                        />
                                    </>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl overflow-hidden"
                        >
                            <nav className="flex flex-col p-4 gap-4">
                                <a
                                    href="#use-cases"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    Use Cases
                                </a>
                                <a
                                    href="#features"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    Features
                                </a>
                                <a
                                    href="#pricing"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    Pricing
                                </a>
                                {isLoaded && isSignedIn ? (
                                    // Signed in: No extra links needed in menu (already in header)
                                    null
                                ) : (
                                    <>
                                        <div className="border-t border-slate-800 my-2" />
                                        <div className="flex flex-col gap-4 pt-2">
                                            <Link
                                                href="/sign-in"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="px-4 py-3 text-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                href="/sign-up"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="px-4 py-3 text-center rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25"
                                            >
                                                Get Started
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Hero Section */}
            <section className="pt-24 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
                            <Sparkles size={16} />
                            AI-Powered Financial Analytics
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                            Understand Your
                            <span className="block bg-gradient-to-r from-emerald-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                                Financial Story
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10">
                            Upload your bank statements and let AI transform them into beautiful,
                            actionable insights. Track spending, discover patterns, and take control of your finances.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/sign-up"
                                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium text-lg hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25"
                            >
                                Start Free
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a
                                href="#features"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-800 text-white font-medium text-lg hover:bg-slate-700 transition-all border border-slate-700"
                            >
                                Learn More
                            </a>
                        </div>
                    </motion.div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-16 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
                        <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-emerald-500/10">
                            <div className="bg-slate-900/90 backdrop-blur p-4 sm:p-8">
                                {/* Mock Dashboard */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                    {[
                                        { label: 'Total Spending', value: '₹45,230', color: 'rose' },
                                        { label: 'Income', value: '₹85,000', color: 'emerald' },
                                        { label: 'Savings', value: '₹39,770', color: 'violet' },
                                        { label: 'Transactions', value: '127', color: 'blue' },
                                    ].map((stat, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                            <p className="text-xs text-slate-400">{stat.label}</p>
                                            <p className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-48 bg-slate-800/30 rounded-xl flex items-center justify-center border border-slate-700/30">
                                    <BarChart3 className="w-16 h-16 text-slate-600" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Perfect For Everyone
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Whether you're managing personal finances or tracking business expenses, FinSight adapts to your needs.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: CreditCard,
                                title: 'Personal Finance',
                                description: 'Track your daily spending, identify savings opportunities, and build better money habits.',
                                gradient: 'from-emerald-500 to-teal-500'
                            },
                            {
                                icon: BarChart3,
                                title: 'Small Business',
                                description: 'Monitor cash flow, categorize expenses, and get insights for smarter business decisions.',
                                gradient: 'from-violet-500 to-purple-500'
                            },
                            {
                                icon: FileText,
                                title: 'Freelancers',
                                description: 'Separate personal and professional expenses. Track income sources with ease.',
                                gradient: 'from-blue-500 to-cyan-500'
                            },
                            {
                                icon: PieChart,
                                title: 'Family Budgeting',
                                description: 'Combine multiple accounts, track family spending, and plan together.',
                                gradient: 'from-orange-500 to-amber-500'
                            },
                        ].map((useCase, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <useCase.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
                                <p className="text-sm text-slate-400">{useCase.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Powered by Intelligence
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Advanced AI technology makes understanding your finances effortless.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Brain,
                                title: 'AI-Powered Analysis',
                                description: 'Our AI reads your bank statements and automatically categorizes every transaction with incredible accuracy.',
                            },
                            {
                                icon: Shield,
                                title: 'Bank-Level Security',
                                description: 'Your data is encrypted end-to-end. We never store your PDFs - they are processed in memory and deleted immediately.',
                            },
                            {
                                icon: Zap,
                                title: 'Instant Insights',
                                description: 'Upload a statement and see beautiful charts and actionable insights in seconds, not hours.',
                            },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50"
                            >
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-violet-500/20 flex items-center justify-center mb-6">
                                    <feature.icon className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Start free and upgrade when you need more power.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Free Plan */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                            <p className="text-slate-400 mb-6">Perfect for getting started</p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold text-white">₹0</span>
                                <span className="text-slate-500">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Up to 5 statements/month',
                                    'Basic analytics dashboard',
                                    'Auto-categorization',
                                    'CSV export',
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300">
                                        <Check size={18} className="text-emerald-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/sign-up"
                                className="block text-center w-full py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-all border border-slate-700"
                            >
                                Get Started Free
                            </Link>
                        </motion.div>

                        {/* Pro Plan */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-violet-500/10 border border-emerald-500/30 relative overflow-hidden"
                        >
                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                                Popular
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                            <p className="text-slate-400 mb-6">For power users</p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold text-white">₹499</span>
                                <span className="text-slate-500">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Unlimited statements',
                                    'Advanced AI insights',
                                    'Multi-account support',
                                    'Priority support',
                                    'Custom categories',
                                    'API access',
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300">
                                        <Check size={18} className="text-emerald-400" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/sign-up"
                                className="block text-center w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/25"
                            >
                                Start Free Trial
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center gap-8">
                        {/* Logo and branding */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-white">FinSight</span>
                        </div>

                        {/* Social links */}
                        <div className="flex items-center gap-4">
                            <a
                                href="https://github.com/ShenLongVansh/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800/50 transition-all"
                                title="GitHub"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a
                                href="https://www.linkedin.com/in/vansh-sharma-4a6882245/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800/50 transition-all"
                                title="LinkedIn"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            <a
                                href="https://portfolio-five-lemon-yoqaqn1pf0.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800/50 transition-all"
                                title="Portfolio"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </a>
                        </div>

                        {/* Copyright */}
                        <p className="text-slate-500 text-sm">
                            © 2025 <span className="text-slate-400 font-medium">Vansh Sharma</span>. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
