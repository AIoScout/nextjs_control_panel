"use client";
import { useState, useEffect } from "react";
import { updateRoute, getRoute } from "@/lib/db-operations";
import { useFieldState } from "@/lib/useFieldState";

interface RouteSelectionProps {
    canWrite: boolean;
}

export default function RouteSelection({ canWrite }: RouteSelectionProps) {
    const { finalDemoDay } = useFieldState();
    const maxPoints = finalDemoDay ? 14 : 5;
    const [startingPoint, setStartingPoint] = useState(1);
    const [endingPoint, setEndingPoint] = useState(1);

    const handleRouteChange = () => {
        // console.log("Starting point changed:", startingPoint);
        // console.log("Ending point changed:", endingPoint);
        if (startingPoint === endingPoint) {
            alert("Starting point and ending point cannot be the same.");
            return;
        }
        updateRoute(startingPoint, endingPoint)
            .then(() => {
                // console.log("Route updated successfully");
            })
            .catch((error) => {
                console.error("Error updating route:", error);
            });
    };

    // Fetch route when maxPoints changes
    useEffect(() => {
        // Fetch route
        getRoute()
            .then((route) => {
                setStartingPoint(route.start);
                setEndingPoint(route.end);
            })
            .catch((error) => {
                console.error("Error fetching route:", error);
                // default if fetching fails
                setStartingPoint(1);
                setEndingPoint(maxPoints);
            });
    }, [maxPoints]);

    return (
        <div className="flex flex-col gap-2 content-center items-center p-4 border border-gray-300 rounded-lg shadow-md bg-white h-full">
            <h1 className="text-3xl font-medium">Route</h1>
            <div className="w-full max-w-xs">
                <div className="flex items-center justify-between flex-row gap-2">
                    <span className="text-xl">Start:</span>
                    <input
                        type="range"
                        min={1}
                        max={maxPoints}
                        value={startingPoint}
                        className="range range-secondary"
                        step="1"
                        disabled={!canWrite}
                        onChange={(e) => {
                            setStartingPoint(Number(e.target.value));
                        }}
                    />
                    <span className="text-2xl p-4">{startingPoint}</span>
                </div>
                <div className="flex items-center justify-between flex-row gap-2">
                    <span className="text-xl">End:</span>
                    <input
                        type="range"
                        min={1}
                        max={maxPoints}
                        value={endingPoint}
                        className="range range-secondary"
                        step="1"
                        disabled={!canWrite}
                        onChange={(e) => {
                            setEndingPoint(Number(e.target.value));
                        }}
                    />
                    <span className="text-2xl px-4">{endingPoint}</span>
                </div>
            </div>
            <button
                className="btn btn-secondary mt-4"
                onClick={handleRouteChange}
                disabled={!canWrite}
            >
                Update Route
            </button>
        </div>
    );
}
