import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <SignUp
                forceRedirectUrl="/dashboard"
                signInUrl="/sign-in"
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl",
                    }
                }}
            />
        </div>
    );
}
