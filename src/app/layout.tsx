import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-heading",
    weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-body",
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "FinSight | AI-Powered Financial Analytics",
    description: "Upload your bank statements and get AI-powered insights into your spending patterns with beautiful visualizations.",
    keywords: ["bank statement", "analytics", "AI", "finance", "spending", "dashboard"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider
            appearance={{
                variables: {
                    colorPrimary: "#10b981",
                    colorBackground: "#0f172a",
                    colorInputBackground: "#1e293b",
                    colorInputText: "#f8fafc",
                    colorText: "#f8fafc",
                },
                elements: {
                    formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600",
                    card: "bg-slate-900 border-slate-800",
                    headerTitle: "text-white",
                    headerSubtitle: "text-slate-400",
                    socialButtonsBlockButton: "bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
                    formFieldLabel: "text-slate-300",
                    formFieldInput: "bg-slate-800 border-slate-700 text-white",
                    footerActionLink: "text-emerald-400 hover:text-emerald-300",
                },
            }}
        >
            <html lang="en" className="dark">
                <body className={`${spaceGrotesk.variable} ${dmSans.variable} font-body antialiased bg-background min-h-screen`}>
                    <div className="bg-gradient-mesh min-h-screen">
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    );
}
