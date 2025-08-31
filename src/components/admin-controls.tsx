"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, isAdmin } from "../lib/firebase";
import { getDemoMode, setDemoMode } from "../lib/db-operations";

export function AdminControls() {
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [demoMode, setDemoModeState] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = () => {
            const user = getCurrentUser();
            setUserIsAdmin(isAdmin(user));
            setLoading(false);
        };

        // Check immediately if user is already loaded
        checkAdminStatus();

        // Also check on auth state changes
        const interval = setInterval(checkAdminStatus, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchDemoMode = async () => {
            try {
                const mode = await getDemoMode();
                setDemoModeState(mode);
            } catch (error) {
                console.error("Error fetching demo mode:", error);
            }
        };

        if (userIsAdmin) {
            fetchDemoMode();
        }
    }, [userIsAdmin]);

    const handleDemoModeToggle = async () => {
        try {
            const newMode = !demoMode;
            await setDemoMode(newMode);
            setDemoModeState(newMode);
        } catch (error) {
            console.error("Error toggling demo mode:", error);
            alert("Failed to toggle demo mode. Check console for details.");
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-gray-500">
                Loading admin controls...
            </div>
        );
    }

    if (!userIsAdmin) {
        return null; // Don't show anything for non-admin users
    }

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
                Admin Controls
            </h3>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-red-700">
                        <strong>Demo Mode:</strong>{" "}
                        {demoMode ? "Active" : "Inactive"}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                        {demoMode
                            ? "Users can only read from admin data under /admin. Only admins can write. Your changes will be made to /admin"
                            : "Users have full access to their own data. Under the /users/uid. Your changes will not be made to /admin when demo mode is inactive."}
                    </p>
                </div>
                <button
                    onClick={handleDemoModeToggle}
                    className={`px-4 py-2 rounded-md text-white font-medium ${
                        demoMode
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                    {demoMode ? "Disable Demo" : "Enable Demo"}
                </button>
            </div>
        </div>
    );
}
