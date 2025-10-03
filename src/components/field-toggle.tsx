"use client";
import { useFieldState } from "../lib/useFieldState";

interface FieldToggleProps {
    canWrite: boolean;
}

export default function FieldToggle({ canWrite }: FieldToggleProps) {
    const { finalDemoDay, setFinalDemoDay } = useFieldState();

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
                    }}
                />
                <span>Final Demo Arena</span>
            </div>
        </div>
    );
}
