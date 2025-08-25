"use client";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const auth = getAuth(app);
            await signInWithEmailAndPassword(auth, email, password);
            router.replace("/");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen p-8 gap-4">
            <p className="md:text-4xl text-2xl font-bold">Login</p>
            <Link href="/sign-up" className="text-primary underline">
                Don&apos;t have an account? Sign up
            </Link>

            <form
                className="flex flex-col gap-4 max-w-sm"
                onSubmit={handleLogin}
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
                    className="bg-primary text-white p-2 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
                {error && <p className="text-error">{error}</p>}
            </form>
        </div>
    );
}
