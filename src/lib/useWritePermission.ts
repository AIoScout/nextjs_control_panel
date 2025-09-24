import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./firebase";
import { isAdmin } from "./firebase";
import { isDemoMode } from "./firebase";

export function useWritePermission() {
    const [canWrite, setCanWrite] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const demoMode = await isDemoMode();
                if (demoMode) {
                    // In demo mode, only admins can write
                    setCanWrite(isAdmin(currentUser));
                } else {
                    // In normal mode, all authenticated users can write
                    setCanWrite(true);
                }
            } else {
                setCanWrite(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { canWrite, loading };
}
