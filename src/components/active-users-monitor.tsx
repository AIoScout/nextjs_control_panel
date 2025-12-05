"use client";
import { useState, useEffect } from "react";
import { getActiveUsersWithStatus } from "@/lib/usePresenceWithAutoLogout";
import { ADMIN_WHITELIST } from "@/config/adminWhitelist";

interface ActiveUser {
    userId: string;
    lastSeen: number;
    isIdle: boolean;
    isStale: boolean;
}

/**
 * Admin component to monitor active Firebase connections
 * Helps track how many users are connected and prevent hitting the 100 connection limit
 */
export function ActiveUsersMonitor() {
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const [loading, setLoading] = useState(true);

    const adminCount = activeUsers.filter(u => ADMIN_WHITELIST.includes(u.userId)).length;
    const regularCount = activeUsers.length - adminCount;

    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const users = await getActiveUsersWithStatus();
                setActiveUsers(users);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch active users:", error);
                setLoading(false);
            }
        };

        fetchActiveUsers();

        // Refresh every 30 seconds
        const interval = setInterval(fetchActiveUsers, 30000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="border border-gray-300 rounded-lg p-4 shadow-md bg-white">
                <h3 className="text-lg font-medium mb-2">Active Connections</h3>
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="border border-gray-300 rounded-lg p-4 shadow-md bg-white">
            <h3 className="text-lg font-medium mb-2">Active Connections</h3>

            <div
                className={`flex items-center gap-2 mb-3 ${
                    activeUsers.length > 80
                        ? "text-warning"
                        : activeUsers.length > 50
                        ? "text-yellow-600"
                        : "text-success"
                }`}
            >
                <div
                    className={`w-3 h-3 rounded-full ${
                        activeUsers.length > 80
                            ? "bg-warning"
                            : activeUsers.length > 50
                            ? "bg-yellow-500"
                            : "bg-success"
                    }`}
                />
                <span className="font-semibold">
                    {activeUsers.length} / 100 connections
                </span>
            </div>

            {activeUsers.length > 80 && (
                <div className="bg-warning p-2 rounded text-sm mb-3 font-semibold">
                    ⚠️ Warning: Approaching Firebase free plan limit (100
                    connections)
                </div>
            )}

            <div className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Status:</span>{" "}
                {(() => {
                    const idleCount = activeUsers.filter((u) => u.isIdle).length;
                    const activeCount = activeUsers.length - idleCount;
                    return `${activeCount} active, ${idleCount} idle`;
                })()}
                <br />
                <span className="font-medium">Users:</span>{" "}
                {adminCount > 0 && `${adminCount} admin${adminCount !== 1 ? "s" : ""}, `}
                {regularCount} regular
            </div>

            <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    Show all active users ({activeUsers.length})
                </summary>
                <div className="mt-2 max-h-40 overflow-y-auto border-t pt-2">
                    {activeUsers.length === 0 ? (
                        <div className="text-gray-500">No active users</div>
                    ) : (
                        activeUsers.map((user) => {
                            const isIdle = user.isIdle === true;
                            const isAdmin = ADMIN_WHITELIST.includes(user.userId);
                            return (
                                <div
                                    key={user.userId}
                                    className="flex justify-between py-1 items-center"
                                >
                                    <span className="font-mono text-xs truncate">
                                        {user.userId}
                                        {isAdmin && (
                                            <span className="ml-2 text-xs px-1 py-0.5 rounded bg-purple-100 text-purple-800">
                                                admin
                                            </span>
                                        )}
                                    </span>
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${
                                            isIdle
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                        {isIdle ? "idle" : "active"}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                        {new Date(
                                            user.lastSeen
                                        ).toLocaleTimeString()}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </details>
        </div>
    );
}
