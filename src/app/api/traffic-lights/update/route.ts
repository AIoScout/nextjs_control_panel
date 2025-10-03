import { NextResponse } from "next/server";
import { updateAllTrafficLights, getTrafficLightsPublic } from "@/lib/db-operations";

// POST - Update traffic light system automatically (for timer/cron)
// This endpoint is designed to be called every second by a timer or cron job
export async function POST() {
    try {
        // Update all traffic lights (advance countdown and cycle states)
        await updateAllTrafficLights();
        
        // Return updated traffic lights for real-time updates
        const updatedTrafficLights = await getTrafficLightsPublic();
        return NextResponse.json({
            success: true,
            trafficLights: updatedTrafficLights,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error in traffic light update cycle:", error);
        return NextResponse.json(
            { 
                success: false,
                error: "Failed to update traffic lights",
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

// GET - Health check for the update service
export async function GET() {
    try {
        const trafficLights = await getTrafficLightsPublic();
        return NextResponse.json({
            status: "healthy",
            trafficLightCount: trafficLights.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Health check failed:", error);
        return NextResponse.json(
            { 
                status: "unhealthy",
                error: "Service unavailable",
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}