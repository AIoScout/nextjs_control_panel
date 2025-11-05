"use client";
import { TrafficLight } from "@/lib/data-types";
import { getTrafficLights, initTrafficLights } from "@/lib/db-operations";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { isAdmin } from "@/lib/firebase";
import { NUMBER_OF_TRAFFIC_LIGHTS } from "@/config/trafficLightsConfig";

export default function TrafficLights() {
    const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([]);
    const [isAutoUpdate, setIsAutoUpdate] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { user } = useRequireAuth();
    const userIsAdmin = user ? isAdmin(user) : false;

    // Auto-update functionality
    const startAutoUpdate = useCallback(() => {
        if (intervalRef.current) return; // Already running

        intervalRef.current = setInterval(async () => {
            try {
                if (userIsAdmin) {
                    // Admin users can call the update API to advance states
                    const response = await fetch("/api/traffic-lights/update", {
                        method: "POST",
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.trafficLights) {
                            setTrafficLights(data.trafficLights);
                        }
                    }
                } else {
                    // Non-admin users just fetch current state (read-only)
                    const response = await fetch("/api/traffic-lights");
                    if (response.ok) {
                        const lights = await response.json();
                        setTrafficLights(lights);
                    }
                }
            } catch (error) {
                console.error("Error updating traffic lights:", error);
            }
        }, 1000); // Update every second
    }, [userIsAdmin]);

    const stopAutoUpdate = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Toggle auto update
    const toggleAutoUpdate = useCallback(() => {
        if (isAutoUpdate) {
            stopAutoUpdate();
            setIsAutoUpdate(false);
        } else {
            startAutoUpdate();
            setIsAutoUpdate(true);
        }
    }, [isAutoUpdate, startAutoUpdate, stopAutoUpdate]);

    // Initialize traffic lights on component mount
    useEffect(() => {
        const initialize = async () => {
            try {
                if (userIsAdmin) {
                    // Admin users can initialize and use admin functions
                    await initTrafficLights();
                    const lights = await getTrafficLights();
                    setTrafficLights(lights);
                } else {
                    // Non-admin users fetch from public API
                    const response = await fetch("/api/traffic-lights");
                    if (response.ok) {
                        const lights = await response.json();
                        setTrafficLights(lights);
                    }
                }
            } catch (error) {
                console.error("Error initializing traffic lights:", error);
            }
        };

        if (user !== null) {
            // Only initialize when user state is determined
            initialize();

            // Auto-start updates for non-admin users so they can see live changes
            if (!userIsAdmin) {
                setTimeout(() => {
                    startAutoUpdate();
                    setIsAutoUpdate(true);
                }, 1000); // Small delay to ensure initialization completes
            }
        }
    }, [user, userIsAdmin, startAutoUpdate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAutoUpdate();
        };
    }, [stopAutoUpdate]);

    return (
        <div className="flex flex-col gap-4 content-center items-center p-4 border border-gray-300 rounded-lg shadow-md bg-white w-full">
            <div className="flex flex-col items-center gap-2">
                <h1 className="text-3xl font-medium text-center">
                    Traffic Lights
                </h1>
                <span>
                    Random initial states. Red for 5 seconds, yellow for 2
                    seconds, green for 10 seconds and cycles.
                </span>
                {userIsAdmin && (
                    <button
                        onClick={toggleAutoUpdate}
                        className={`px-4 py-2 rounded font-medium transition-colors ${
                            isAutoUpdate ? "bg-warning" : "bg-success"
                        }`}
                    >
                        {isAutoUpdate
                            ? "Stop Traffic Light Update For All Users"
                            : "Start Traffic Light Update For All Users"}
                    </button>
                )}
                {!userIsAdmin && (
                    <p className="text-sm text-gray-600">
                        Traffic lights update automatically (Admin controls
                        only)
                    </p>
                )}
            </div>

            <div
                className={`grid grid-cols-2 md:grid-cols-${NUMBER_OF_TRAFFIC_LIGHTS} gap-4 content-center w-fit items-center`}
            >
                {trafficLights.map((light: TrafficLight) => (
                    <div
                        key={light.id}
                        className="flex flex-col w-fit items-center border border-gray-300 rounded-lg p-4 shadow-md bg-white min-w-[120px]"
                    >
                        <span className="text-md font-medium mb-3">
                            Traffic Light {light.id}
                        </span>

                        {/* Red Light */}
                        <div
                            className={`w-8 h-8 rounded-full mb-2 transition-all duration-300 ${
                                light.current_state === "red"
                                    ? "bg-red-500 shadow-lg shadow-red-300"
                                    : "bg-gray-300 opacity-40"
                            }`}
                        ></div>

                        {/* Yellow Light */}
                        <div
                            className={`w-8 h-8 rounded-full mb-2 transition-all duration-300 ${
                                light.current_state === "yellow"
                                    ? "bg-yellow-400 animate-pulse shadow-lg shadow-yellow-300"
                                    : "bg-gray-300 opacity-40"
                            }`}
                        ></div>

                        {/* Green Light */}
                        <div
                            className={`w-8 h-8 rounded-full mb-3 transition-all duration-300 ${
                                light.current_state === "green"
                                    ? "bg-green-500 shadow-lg shadow-green-300"
                                    : "bg-gray-300 opacity-40"
                            }`}
                        ></div>

                        <div className="text-center">
                            <span className="text-sm text-gray-600">
                                Time remaining:
                            </span>
                            <div className="text-lg font-bold mt-1">
                                {light.time_remain}s
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {trafficLights.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                    {userIsAdmin
                        ? 'No traffic lights found. Click "Start Auto Update" to initialize.'
                        : "No traffic lights available. Please contact an admin to initialize the system."}
                </div>
            )}
        </div>
    );
}
