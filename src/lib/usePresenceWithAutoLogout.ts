import { useEffect, useRef, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, set, serverTimestamp, onDisconnect } from "firebase/database";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { ADMIN_WHITELIST } from "@/config/adminWhitelist";

interface PresenceWithAutoLogoutOptions {
    userId: string;
    idleTimeout?: number; // Time in ms before marking as idle (default: 3 minutes)
    autoLogoutTimeout?: number; // Time in ms before auto-logout (default: 3 minutes)
}

/**
 * Combined presence tracking and idle detection with auto-logout
 *
 * Features:
 * - Tracks online/offline status in Firebase
 * - Detects idle state based on user activity
 * - Automatically logs out user after specified idle time
 * - Updates lastSeen timestamp in Firebase
 */
export function usePresenceWithAutoLogout(
    options: PresenceWithAutoLogoutOptions
) {
    const {
        userId,
        idleTimeout = 3 * 60 * 1000, // 3 minutes
        autoLogoutTimeout = 3 * 60 * 1000, // 3 minutes
    } = options;

    const [isIdle, setIsIdle] = useState(false);
    const lastActivityRef = useRef<number>(Date.now());
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const logoutCheckRef = useRef<NodeJS.Timeout | null>(null);
    const auth = getAuth(app);

    // Mark user as online and set up disconnect handler
    useEffect(() => {
        if (!userId) return;

        const userStatusRef = ref(database, `presence/${userId}`);

        const setupPresence = async () => {
            try {
                // When user disconnects, mark as offline
                await onDisconnect(userStatusRef).set({
                    online: false,
                    lastSeen: serverTimestamp(),
                    disconnectedAt: serverTimestamp(),
                });

                // Mark as online
                await set(userStatusRef, {
                    online: true,
                    isIdle: false,
                    lastSeen: serverTimestamp(),
                    connectedAt: serverTimestamp(),
                });

                console.log(`✓ Presence tracking active for: ${userId}`);
            } catch (error) {
                console.error("Failed to set up presence:", error);
            }
        };

        setupPresence();

        return () => {
            // Cleanup on unmount
            set(userStatusRef, {
                online: false,
                lastSeen: serverTimestamp(),
            }).catch(console.error);
        };
    }, [userId]);

    // Track user activity and detect idle state
    useEffect(() => {
        if (!userId) return;

        // Reset idle state and update last activity
        const updateActivity = () => {
            lastActivityRef.current = Date.now();
            if (isIdle) {
                setIsIdle(false);
                updatePresenceStatus(false);
            }
        };

        // Activity events to monitor
        const activityEvents = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
            "click",
        ];

        // Start idle detection timer
        const startIdleTimer = () => {
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }

            idleTimerRef.current = setTimeout(() => {
                const timeSinceActivity = Date.now() - lastActivityRef.current;

                if (timeSinceActivity >= idleTimeout) {
                    setIsIdle(true);
                    updatePresenceStatus(true);
                    console.log(`⏸️ User ${userId} is now IDLE`);
                }
            }, idleTimeout);
        };

        // Update presence status in Firebase
        const updatePresenceStatus = async (idle: boolean) => {
            try {
                const userStatusRef = ref(database, `presence/${userId}`);
                await set(userStatusRef, {
                    online: true,
                    isIdle: idle,
                    lastSeen: serverTimestamp(),
                });
            } catch (error) {
                console.error("Failed to update presence status:", error);
            }
        };

        // Set up activity listeners
        activityEvents.forEach((event) => {
            document.addEventListener(event, updateActivity);
        });

        // Handle tab visibility
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Tab hidden - mark as idle immediately
                setIsIdle(true);
                updatePresenceStatus(true);
            } else {
                // Tab visible - mark as active
                updateActivity();
                startIdleTimer();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Initial setup
        startIdleTimer();

        return () => {
            // Cleanup
            activityEvents.forEach((event) => {
                document.removeEventListener(event, updateActivity);
            });
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
        };
    }, [userId, idleTimeout, isIdle]);

    // Auto-logout check - runs every 30 seconds
    useEffect(() => {
        if (!userId) return;

        const checkForAutoLogout = () => {
            // PROTECT ADMIN USERS FROM AUTO-LOGOUT
            if (ADMIN_WHITELIST.includes(userId)) {
                console.log(`👑 ADMIN PROTECTED: User ${userId} is an admin, skipping auto-logout`);
                return;
            }

            const timeSinceActivity = Date.now() - lastActivityRef.current;

            // If idle and exceeded auto-logout timeout
            if (isIdle && timeSinceActivity >= autoLogoutTimeout) {
                console.log(
                    `🚪 AUTO-LOGOUT: User ${userId} was idle for ${Math.floor(
                        autoLogoutTimeout / 60000
                    )} minutes`
                );

                // Force logout
                auth.signOut()
                    .then(() => {
                        console.log("✓ User logged out successfully");

                        // Update presence to show offline
                        const userStatusRef = ref(
                            database,
                            `presence/${userId}`
                        );
                        set(userStatusRef, {
                            online: false,
                            lastSeen: serverTimestamp(),
                            autoLoggedOut: true,
                            autoLoggedOutAt: serverTimestamp(),
                        }).catch(console.error);

                        // Redirect to login
                        if (typeof window !== "undefined") {
                            window.location.href = "/login";
                        }
                    })
                    .catch((error) => {
                        console.error("Failed to logout user:", error);
                    });
            }
        };

        // Check every 30 seconds
        logoutCheckRef.current = setInterval(checkForAutoLogout, 30000);

        // Also check immediately in case user is already idle
        checkForAutoLogout();

        return () => {
            if (logoutCheckRef.current) {
                clearInterval(logoutCheckRef.current);
            }
        };
    }, [userId, isIdle, autoLogoutTimeout, auth]);

    return {
        isIdle,
    };
}

interface PresenceData {
    online: boolean;
    isIdle?: boolean;
    lastSeen?: number;
}

/**
 * Get all active users with their idle status
 */
export const getActiveUsersWithStatus = async () => {
    const { get } = await import("firebase/database");
    const snapshot = await get(ref(database, "presence"));

    if (!snapshot.exists()) return [];

    const presenceData = snapshot.val();
    const now = Date.now();

    return Object.entries(presenceData)
        .filter(([, data]) => (data as PresenceData).online === true)
        .map(([userId, data]) => {
            const presence = data as PresenceData;
            const isIdle = presence.isIdle === true;
            const lastSeen = presence.lastSeen || 0;
            const timeSinceActivity = now - lastSeen;

            return {
                userId,
                lastSeen,
                isIdle,
                isStale: timeSinceActivity > 5 * 60 * 1000, // Mark as stale if no update in 5 minutes
                timeSinceActivity,
            };
        });
};

/**
 * Manually logout a user (admin only)
 */
export const forceLogoutUser = async (userId: string) => {
    const userStatusRef = ref(database, `presence/${userId}`);

    await set(userStatusRef, {
        online: false,
        lastSeen: serverTimestamp(),
        forceLoggedOut: true,
        forceLoggedOutAt: serverTimestamp(),
    });

    console.log(`✓ Force logged out user: ${userId}`);
};
