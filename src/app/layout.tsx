import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
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
        <html lang="en" className="dark">
            <body className={`${spaceGrotesk.variable} ${dmSans.variable} font-body antialiased bg-background min-h-screen`}>
                <div className="bg-gradient-mesh min-h-screen">
                    {children}
                </div>
            </body>
        </html>
    );
}
