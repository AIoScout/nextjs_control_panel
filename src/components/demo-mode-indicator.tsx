"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, isAdmin } from "../lib/firebase";
import { getDemoMode } from "../lib/db-operations";

export function DemoModeIndicator() {
    const [demoMode, setDemoMode] = useState(false);
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const user = getCurrentUser();
                setUserIsAdmin(isAdmin(user));

                const mode = await getDemoMode();
                setDemoMode(mode);
            } catch (error) {
                console.error("Error checking demo mode:", error);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();

        // Check periodically for demo mode changes
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !demoMode) {
        return null; // Don't show anything when not in demo mode or loading
    }

    // Show different messages for admin vs regular users
    if (userIsAdmin) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                    <div className="bg-blue-500 w-3 h-3 rounded-full mr-3 animate-pulse"></div>
                    <div>
                        <p className="text-blue-800 font-medium">
                            Demo Mode Active
                        </p>
                        <p className="text-blue-600 text-sm">
                            You are controlling the live demonstration. All
                            users can see your changes.
                        </p>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                    <div className="bg-orange-500 w-3 h-3 rounded-full mr-3 animate-pulse"></div>
                    <div>
                        <p className="text-orange-800 font-medium">
                            Demo Mode - Read Only
                        </p>
                        <p className="text-orange-600 text-sm">
                            During the final demo, you can not use the control
                            panel.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}
