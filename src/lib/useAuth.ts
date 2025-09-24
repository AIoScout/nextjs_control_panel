import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../lib/firebase";
import { initializeUserData } from "../lib/db-operations";

export function useRequireAuth() {
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.replace("/login");
            } else {
                // Initialize user data if it doesn't exist
                try {
                    await initializeUserData();
                } catch (error) {
                    console.error("Failed to initialize user data:", error);
                }
            }
        });
        return () => unsubscribe();
    }, [router]);
}
