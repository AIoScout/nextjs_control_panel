"use client";
import { useState, useEffect } from "react";
export default function FieldToggle() {
    const [finalDemoDay, setFinalDemoDay] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("finalDemoDay");
            return saved !== null ? JSON.parse(saved) : true;
        }
        return false; // Default value if running on server or localStorage is empty
    });

    // Update localStorage when finalDemoDay changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("finalDemoDay", JSON.stringify(finalDemoDay));
        }
    }, [finalDemoDay]);
    return (
        <div className="flex flex-col gap-2 content-center items-center p-4 border border-gray-300 rounded-lg shadow-md bg-white">
            <h1 className="text-3xl font-medium">Field</h1>
            <div className="flex flex-row gap-2 justify-center content-center items-center ">
                <span>Testing Field</span>
                <input
                    type="checkbox"
                    className="toggle toggle-xl"
                    onChange={(e) => {
                        setFinalDemoDay(e.target.checked);
                        console.log(
                            `Using Final Demo Field?: ${e.target.checked}`
                        );
                    }}
                />
                <span>Final Demo Arena</span>
            </div>
        </div>
    );
}
