"use client";
import { useState, useEffect } from "react";
import { getExamState, updateExamState } from "../lib/db-operations";

interface FieldToggleProps {
    canWrite: boolean;
}

export default function FieldToggle({ canWrite }: FieldToggleProps) {
    // true = 'final demo arena', false = 'testing field'
    const [finalDemoDay, setFinalDemoDay] = useState<boolean | null>(null);

    // Load initial value from db
    useEffect(() => {
        async function fetchField() {
            try {
                const examState = await getExamState();
                if (examState && examState.field === "final demo arena") {
                    setFinalDemoDay(true);
                } else {
                    setFinalDemoDay(false);
                }
            } catch {
                setFinalDemoDay(false); // fallback
            }
        }
        fetchField();
    }, []);

    // Update db when finalDemoDay changes (but not on initial load)
    useEffect(() => {
        if (finalDemoDay === null) return;
        async function updateField() {
            try {
                await updateExamState({
                    field: finalDemoDay ? "final demo arena" : "testing field",
                });
            } catch {
                // Optionally handle error
            }
        }
        updateField();
    }, [finalDemoDay]);

    return (
        <div className="flex flex-col gap-2 content-center items-center p-4 border border-gray-300 rounded-lg shadow-md bg-white">
            <h1 className="text-3xl font-medium">Field</h1>
            <div className="flex flex-row gap-2 justify-center content-center items-center ">
                <span>Testing Field</span>
                <input
                    type="checkbox"
                    className="toggle toggle-xl"
                    checked={finalDemoDay ?? false}
                    disabled={finalDemoDay === null || !canWrite}
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
