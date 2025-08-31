"use client";
import { useRequireAuth } from "../lib/useRequireAuth";
import { useWritePermission } from "../lib/useWritePermission";
import FieldToggle from "@/components/field-toggle";
// import LiveGrid from "@/components/live-grid";
import PointSelection from "@/components/route-selection";
import TaskSelection from "@/components/task-selection";
import Timer from "@/components/timer";
// import TrafficLights from "@/components/traffic-light";
import { AdminControls } from "@/components/admin-controls";
import { DemoModeIndicator } from "@/components/demo-mode-indicator";

export default function Home() {
    const { user, loading: authLoading } = useRequireAuth();
    const { canWrite, loading: writeLoading } = useWritePermission();
    const timerCountdown = 120; // Default to 120 seconds, change if needed

    if (authLoading || writeLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen p-8 gap-4">
            <div className="justify-between flex flex-row">
                <p className="md:text-4xl text-2xl font-bold">
                    ISDN 2602 Control Panel
                </p>
                <p>Signed in as: {user?.email}</p>
            </div>

            {/* Admin Controls - only visible to admins */}
            <AdminControls />

            {/* Demo Mode Indicator - shows when demo mode is active */}
            <DemoModeIndicator />

            <p className="md:hidden">
                View is not optimized for mobile devices, try to use your laptop
                for a better experience.
            </p>

            {/* <div className="hidden md:flex flex-col md:flex-row gap-4 h-full w-full justify-end">
                <TrafficLights />
                <LiveGrid />
            </div>

            <div className="flex flex-col gap-4 md:hidden">
                <TrafficLights />
                <LiveGrid />
            </div> */}

            <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-2 h-full">
                <div>
                    <FieldToggle canWrite={canWrite} />
                </div>
                <div className="row-span-2 h-full">
                    <Timer timerLimit={timerCountdown} canWrite={canWrite} />
                </div>
                <div className="col-start-1 row-start-2">
                    <TaskSelection canWrite={canWrite} />
                </div>
                <div className="row-span-2 col-start-3 row-start-1 h-full">
                    <PointSelection canWrite={canWrite} />
                </div>
            </div>
            <div className="flex flex-col gap-4 md:hidden">
                <FieldToggle canWrite={canWrite} />
                <TaskSelection canWrite={canWrite} />
                <PointSelection canWrite={canWrite} />
                <Timer timerLimit={timerCountdown} canWrite={canWrite} />
            </div>
        </div>
    );
}
