import { useEffect, useState } from "react";
import { isAdmin } from "./firebase";
import { useRequireAuth } from "./useRequireAuth";
import { useRouter } from "next/navigation";

export function useRequireAdmin() {
    const { user, loading } = useRequireAuth();
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [adminCheckComplete, setAdminCheckComplete] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace("/login");
            return;
        }

        // Check if user is admin
        const adminStatus = isAdmin(user);
        setIsAdminUser(adminStatus);
        setAdminCheckComplete(true);

        // Redirect non-admin users
        if (!adminStatus) {
            router.replace("/");
        }
    }, [user, loading, router]);

    return { isAdmin: isAdminUser, loading: loading || !adminCheckComplete };
}
