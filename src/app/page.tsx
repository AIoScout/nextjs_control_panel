"use client";
import React, { useEffect, useState } from "react";
import { useRequireAuth } from "../lib/useRequireAuth";
import FieldToggle from "@/components/field-toggle";
import LiveGrid from "@/components/live-grid";
import PointSelection from "@/components/route-selection";
import TaskSelection from "@/components/task-selection";
import Timer from "@/components/timer";
import TrafficLights from "@/components/traffic-light";

import { ExamState } from "../lib/data-types";
import { getExamState } from "../lib/db-operations";

export default function Home() {
    useRequireAuth();
    const timerCountdown = 120; // Default to 120 seconds, change if needed
    const [examState, setExamStateLocal] = useState<ExamState | null>(null);

    useEffect(() => {
        // Fetch exam state and traffic lights on mount
        getExamState().then(setExamStateLocal);
        // console.log("Exam State:", examState);
    }, [examState]);

    return (
        <div className="flex flex-col min-h-screen p-8 gap-4">
            <p className="md:text-4xl text-2xl font-bold">
                ISDN 2602 Control Panel
            </p>
            {/* <div>
                <span>Display exam state for testing firebase only:</span>
                <p>
                    {examState?.activated
                        ? "Exam Activated"
                        : "Exam Not Activated"}
                </p>
                <p>Start point: {examState?.start_point}</p>
                <p>End point: {examState?.end_point}</p>
                <p>Time remaining: {examState?.time_remain}</p>
                <p>Task ID: {examState?.task_id}</p>
            </div> */}

            <p className="md:hidden">
                View is not optimized for mobile devices, try to use your laptop
                for a better experience.
            </p>
            <div className="hidden md:flex flex-col md:flex-row gap-4 h-full w-full justify-end">
                <TrafficLights />
                <LiveGrid />
            </div>

            <div className="flex flex-col gap-4 md:hidden">
                <TrafficLights />
                <LiveGrid />
            </div>

            <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-2 h-full">
                <div>
                    <FieldToggle />
                </div>
                <div className="row-span-2 h-full">
                    <Timer timerLimit={timerCountdown} />
                </div>
                <div className="col-start-1 row-start-2">
                    <TaskSelection />
                </div>
                <div className="row-span-2 col-start-3 row-start-1 h-full">
                    <PointSelection />
                </div>
            </div>
            <div className="flex flex-col gap-4 md:hidden">
                <FieldToggle />
                <TaskSelection />
                <PointSelection />
                <Timer timerLimit={timerCountdown} />
            </div>
        </div>
    );
}
