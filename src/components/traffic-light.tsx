"use client";
import { TrafficLight } from "@/lib/data-types";
import { getTrafficLights, initTrafficLights } from "@/lib/db-operations";
import { useEffect, useState } from "react";

export default function TrafficLights() {
    const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([]);

    useEffect(() => {
        initTrafficLights().catch((error) => {
            console.error("Error initializing traffic lights:", error);
        });

        getTrafficLights()
            .then((lights) => setTrafficLights(lights))
            .catch((error) => {
                console.error("Error fetching traffic lights:", error);
            });
    }, []);
    return (
        <div className="flex flex-col gap-2 content-center items-center p-4 border border-gray-300 rounded-lg shadow-md bg-white w-full">
            <h1 className="text-3xl font-medium text-center">Traffic Lights</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:grid-cols-5 content-center w-fit items-center">
                {trafficLights.map((light: TrafficLight, index: number) => (
                    <div
                        key={index}
                        className="flex flex-col w-fit items-center border border-gray-300 rounded-lg p-4 shadow-md bg-white"
                    >
                        <span className="text-md">
                            Traffic Light {light.id}
                        </span>
                        <div
                            className={`w-8 h-8 rounded-full mb-2 ${
                                light.current_state === "red"
                                    ? "bg-red-600 "
                                    : "bg-red-700 opacity-40"
                            }`}
                        ></div>
                        <div
                            className={`w-8 h-8 rounded-full mb-2 ${
                                light.current_state === "yellow"
                                    ? "bg-yellow-400 animate-[pulse_0.5s_ease-in-out_infinite]"
                                    : "bg-yellow-600 opacity-40"
                            }`}
                        ></div>
                        <div
                            className={`w-8 h-8 rounded-full mb-2 ${
                                light.current_state === "green"
                                    ? "bg-green-600 "
                                    : "bg-green-700 opacity-40"
                            }`}
                        ></div>
                        <span>Count down: </span>
                        <span className="text-lg font-semibold">
                            {light.time_remain} sec
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
