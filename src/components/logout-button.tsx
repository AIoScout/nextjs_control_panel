"use client";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            router.replace("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <button onClick={handleLogout} className="btn btn-secondary">
            Logout
        </button>
    );
}
