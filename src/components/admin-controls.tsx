"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, isAdmin } from "../lib/firebase";
import { getDemoMode, setDemoMode } from "../lib/db-operations";
import { Cog, ChevronRight, Power } from "lucide-react";
import Link from "next/link";

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
        <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Admin Only Controls</h3>
            <div className="space-y-4">
                <div>
                    <p className="text-md mb-1">
                        <strong>Demo Mode:</strong>{" "}
                        {demoMode ? "Active" : "Inactive"}
                    </p>
                    <p className="text-sm">
                        {demoMode
                            ? "Users can only read from admin data under /admin. Only admins can write. Your changes will be made to /admin"
                            : "Users have full access to their own data. Under the /users/uid. Your changes will not be made to /admin when demo mode is inactive."}
                    </p>
                </div>
                <div className="flex flex-row items-center gap-4 justify-start">
                    <button
                        onClick={handleDemoModeToggle}
                        className={`px-4 py-2 rounded-md font-medium flex items-center ${
                            demoMode ? "bg-error" : "bg-success"
                        }`}
                    >
                        <Power className="mr-2 h-5 w-5" />
                        {demoMode ? "Disable Demo" : "Enable Demo"}
                    </button>

                    <Link href="/settings">
                        <button className="px-4 py-2 btn btn-secondary rounded-md font-medium flex items-center">
                            <Cog className="mr-2 h-5 w-5" />
                            Config Demo Settings
                            <ChevronRight className="ml-2 h-5 w-5" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
