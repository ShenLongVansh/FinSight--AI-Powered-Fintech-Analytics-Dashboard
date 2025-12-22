import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <SignIn
                forceRedirectUrl="/dashboard"
                signUpUrl="/sign-up"
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
