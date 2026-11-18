import { NextResponse } from "next/server";
import {
    getTrafficLightsPublic,
    initTrafficLightsPublic,
    updateAllTrafficLights
} from "@/lib/db-operations";
import { getCurrentUser, isAdmin } from "@/lib/firebase";

// GET - Public access to read traffic lights.
// Auto-initializes the traffic lights if the database has none yet, so the
// first visit to the page sets the system up instead of showing an empty
// "not yet initialized" state.
export async function GET() {
    try {
        let trafficLights = await getTrafficLightsPublic();
        if (trafficLights.length === 0) {
            await initTrafficLightsPublic();
            trafficLights = await getTrafficLightsPublic();
        }
        return NextResponse.json(trafficLights);
    } catch (error) {
        console.error("Error fetching traffic lights:", error);
        return NextResponse.json(
            { error: "Failed to fetch traffic lights" },
            { status: 500 }
        );
    }
}

// POST - Admin only access to update traffic lights
export async function POST() {
    try {
        // Check if user is authenticated and is admin
        const user = getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        if (!isAdmin(user)) {
            return NextResponse.json(
                { error: "Admin privileges required" },
                { status: 403 }
            );
        }

        // Update all traffic lights (advance the countdown and cycle states)
        await updateAllTrafficLights();
        
        // Return updated traffic lights
        const updatedTrafficLights = await getTrafficLightsPublic();
        return NextResponse.json(updatedTrafficLights);
    } catch (error) {
        console.error("Error updating traffic lights:", error);
        return NextResponse.json(
            { error: "Failed to update traffic lights" },
            { status: 500 }
        );
    }
}