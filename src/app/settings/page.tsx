"use client";

import { useState, useEffect } from "react";
import { useRequireAdmin } from "../../lib/useRequireAdmin";
import SettingsForm from "../../components/settings-form";
import { initializeSystemSettings } from "../../lib/db-operations";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const { isAdmin, loading } = useRequireAdmin();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initSettings = async () => {
            if (isAdmin && !isInitialized) {
                try {
                    await initializeSystemSettings();
                    setIsInitialized(true);
                } catch (error) {
                    console.error("Failed to initialize settings:", error);
                }
            }
        };

        if (isAdmin) {
            initSettings();
        }
    }, [isAdmin, isInitialized]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Loading...</h2>
                    <p>Checking admin permissions</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        // This should never be seen because useRequireAdmin redirects non-admins,
        // but we include it as a fallback
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center text-error">
                    <h2 className="text-xl font-semibold mb-2">
                        Access Denied
                    </h2>
                    <p>You must be an administrator to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen p-8 gap-4">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <Link href="/">
                        <button className="px-4 py-2 btn btn-secondary rounded-md font-medium flex items-center">
                            <ChevronLeft className="mr-1" />
                            <span>Back to Homepage</span>
                        </button>
                    </Link>
                </div>
                <h1 className="text-3xl font-bold mb-2">Final Demo Settings</h1>
                <p className="text-gray-600">
                    Configure system-wide settings for the control panel. These
                    settings will affect all users.
                </p>
            </div>

            <SettingsForm />
        </div>
    );
}
