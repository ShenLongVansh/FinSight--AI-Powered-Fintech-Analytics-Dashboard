import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary dark theme
                background: {
                    DEFAULT: "#0a0a0f",
                    secondary: "#12121a",
                    tertiary: "#1a1a24",
                },
                // Accent colors
                accent: {
                    primary: "#10b981",    // Emerald
                    secondary: "#8b5cf6",  // Violet
                    blue: "#3b82f6",       // Blue
                    amber: "#f59e0b",      // Amber
                },
                // Semantic colors
                positive: "#10b981",
                negative: "#ef4444",
                // Text colors
                text: {
                    primary: "#f1f5f9",
                    secondary: "#94a3b8",
                    muted: "#64748b",
                },
                // Border colors
                border: {
                    DEFAULT: "#1e293b",
                    light: "#334155",
                },
            },
            fontFamily: {
                heading: ['var(--font-heading)', 'Space Grotesk', 'system-ui', 'sans-serif'],
                body: ['var(--font-body)', 'DM Sans', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'glow-emerald': 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                'glow-violet': 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            },
            boxShadow: {
                'glow-sm': '0 0 20px rgba(16, 185, 129, 0.15)',
                'glow-md': '0 0 40px rgba(16, 185, 129, 0.2)',
                'glow-lg': '0 0 60px rgba(16, 185, 129, 0.25)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
