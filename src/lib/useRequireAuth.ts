import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./firebase";

export function useRequireAuth() {
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.replace("/login");
            }
        });
        return () => unsubscribe();
    }, [router]);
}
