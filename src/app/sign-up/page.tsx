"use client";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const auth = getAuth(app);
            await createUserWithEmailAndPassword(auth, email, password);
            router.replace("/login");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Sign up failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen p-8 gap-4">
            <p className="md:text-4xl text-2xl font-bold">Sign Up</p>

            <Link href="/login" className="text-secondary underline">
                Already have an account? Log in
            </Link>
            <p>
                Please remember your password, we do not provide account
                retrieval service.
            </p>
            <form
                className="flex flex-col gap-4 max-w-sm"
                onSubmit={handleSignUp}
            >
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded"
                    required
                />
                <button
                    type="submit"
                    className="bg-secondary text-white p-2 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Signing up..." : "Sign Up"}
                </button>
                {error && <p className="text-red-600">{error}</p>}
            </form>
        </div>
    );
}
