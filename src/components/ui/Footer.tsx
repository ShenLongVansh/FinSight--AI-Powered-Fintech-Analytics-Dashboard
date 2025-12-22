'use client';

import { Github, Linkedin, Globe } from 'lucide-react';

interface FooterProps {
    className?: string;
}

export function Footer({ className = '' }: FooterProps) {
    const socialLinks = [
        {
            name: 'GitHub',
            href: 'https://github.com/ShenLongVansh/',
            icon: Github,
        },
        {
            name: 'LinkedIn',
            href: 'https://www.linkedin.com/in/vansh-sharma-4a6882245/',
            icon: Linkedin,
        },
        {
            name: 'Portfolio',
            href: 'https://portfolio-five-lemon-yoqaqn1pf0.vercel.app/',
            icon: Globe,
        },
    ];

    return (
        <footer className={`py-6 border-t border-slate-800 ${className}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
                <p className="text-sm text-slate-500">
                    © 2025 <span className="text-slate-400 font-medium">Vansh Sharma</span>. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                    {socialLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800/50 transition-all"
                            title={link.name}
                        >
                            <link.icon size={18} />
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}
