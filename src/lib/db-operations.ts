import {
    database,
    getCurrentUser,
    getUserPath,
    getAdminPath,
    isDemoMode,
    isAdmin,
} from "./firebase";
import { ref, get, update, set } from "firebase/database";
import { ExamState, TrafficLight } from "./data-types";
import { SystemSettings, DEFAULT_SETTINGS } from "./settings-types";
// Traffic light timing constants
import { TRAFFIC_LIGHT_TIMING, NUMBER_OF_TRAFFIC_LIGHTS } from "@/config/trafficLightsConfig";

// Get the appropriate base path for database operations
const getBasePath = async (): Promise<string> => {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const demoMode = await isDemoMode();

    if (demoMode) {
        // In demo mode, everyone reads from admin path
        return getAdminPath();
    } else {
        // Normal mode, use user-specific path
        return getUserPath(user);
    }
};

// Check if user can write (only admins can write in demo mode, anyone can write in normal mode)
const canWrite = async (): Promise<boolean> => {
    const user = getCurrentUser();
    if (!user) return false;

    const demoMode = await isDemoMode();

    if (demoMode) {
        // In demo mode, only admins can write
        return isAdmin(user);
    } else {
        // In normal mode, all authenticated users can write to their own data
        return true;
    }
};

/* Demo Mode Operations */
export const setDemoMode = async (active: boolean) => {
    const user = getCurrentUser();
    if (!user || !isAdmin(user)) {
        throw new Error("Only admins can control demo mode");
    }
    await set(ref(database, "demoMode"), { active });
};

export const getDemoMode = async (): Promise<boolean> => {
    return await isDemoMode();
};

/* Exam State Operations */
export const getExamState = async (): Promise<ExamState | null> => {
    const basePath = await getBasePath();
    const snapshot = await get(ref(database, `${basePath}/examState`));
    return snapshot.exists() ? (snapshot.val() as ExamState) : null;
};

export const updateExamState = async (updates: Partial<ExamState>) => {
    if (!(await canWrite())) {
        throw new Error(
            "Write access denied. Only admins can modify data in demo mode."
        );
    }

    const basePath = await getBasePath();
    await update(ref(database, `${basePath}/examState`), updates);
};

export const initializeUserData = async () => {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const userPath = getUserPath(user);

    // Get system settings (admins) or use defaults (non-admins)
    let settings;
    try {
        if (isAdmin(user)) {
            settings = await getSystemSettings();
        } else {
            // Get settings from database without admin check
            const settingsSnapshot = await get(ref(database, `settings`));
            settings = settingsSnapshot.exists()
                ? settingsSnapshot.val()
                : DEFAULT_SETTINGS;
        }
    } catch (error) {
        console.error("Error getting settings, using defaults:", error);
        settings = DEFAULT_SETTINGS;
    }

    // Initialize default exam state for new user with system settings
    const defaultExamState: ExamState = {
        field: "testing field",
        activated: false,
        start_point: 0,
        end_point: 0,
        task_id: 0,
        time_remain: settings.countdownTime || 0,
    };

    // Check if user data already exists
    const snapshot = await get(ref(database, `${userPath}/examState`));
    if (!snapshot.exists()) {
        await set(ref(database, `${userPath}/examState`), defaultExamState);
        // Only initialize traffic lights when an admin creates the system data.
        // Regular users read traffic light states from the admin path and should
        // not trigger initialization.
        if (isAdmin(user)) {
            await initTrafficLights();
        }
    }
};

/* Timer Operations */
export const activateExam = async () => {
    const examState = await getExamState();
    if (examState) {
        await updateExamState({
            activated: true,
        });
    }
};

export const deactivateExam = async () => {
    const examState = await getExamState();
    if (examState) {
        await updateExamState({
            activated: false,
        });
    }
};

export const updateExamTime = async (time: number) => {
    if (!(await canWrite())) {
        throw new Error(
            "Write access denied. Only admins can modify data in demo mode."
        );
    }

    const basePath = await getBasePath();
    await update(ref(database, `${basePath}/examState`), { time_remain: time });
};

export const getExamTime = async (): Promise<number> => {
    const basePath = await getBasePath();
    const snapshot = await get(ref(database, `${basePath}/examState`));
    const val = snapshot.val();
    if (val && val.time_remain !== undefined) {
        return val.time_remain;
    }
    throw new Error("Exam time not found in exam state");
};

/* Route Operations */
export const getRoute = async (): Promise<{ start: number; end: number }> => {
    const basePath = await getBasePath();
    const snapshot = await get(ref(database, `${basePath}/examState`));
    const val = snapshot.val();
    if (val && val.start_point !== undefined && val.end_point !== undefined) {
        return {
            start: val.start_point,
            end: val.end_point,
        };
    }
    throw new Error("Route not found in exam state");
};

export const updateRoute = async (start: number, end: number) => {
    await updateExamState({
        start_point: start,
        end_point: end,
    });
};

/* Task Operations */
export const getTask = async (): Promise<number | null> => {
    const basePath = await getBasePath();
    const snapshot = await get(ref(database, `${basePath}/examState`));
    const val = snapshot.val();
    if (val && val.task_id !== undefined) {
        return val.task_id as number;
    }
    return null;
};

export const updateTask = async (taskId: number) => {
    await updateExamState({ task_id: taskId });
};

/* Traffic Light Operations */
export const initTrafficLights = async () => {
    if (!(await canWrite())) {
        throw new Error(
            "Write access denied. Only admins can modify data in demo mode."
        );
    }

    // Possible states
    const states = ["green", "yellow", "red"] as const;
    
    // Generate traffic lights with randomized initial states and times
    const trafficLights: TrafficLight[] = [];
    for (let i = 1; i <= NUMBER_OF_TRAFFIC_LIGHTS; i++) {
        const randomState = states[Math.floor(Math.random() * states.length)];
        // Randomize the time remaining to stagger the changes
        const maxTime = TRAFFIC_LIGHT_TIMING[randomState];
        const timeRemain = Math.floor(Math.random() * maxTime) + 1; // 1 to maxTime
        
        trafficLights.push({
            id: i,
            current_state: randomState,
            time_remain: timeRemain
        });
    }

    const basePath = await getBasePath();
    const updates = trafficLights.reduce((acc, light) => {
        acc[`${basePath}/trafficLights/${light.id}`] = light;
        return acc;
    }, {} as Record<string, TrafficLight>);

    await update(ref(database), updates);
};

export const getTrafficLights = async (): Promise<TrafficLight[]> => {
    const basePath = await getBasePath();
    const snapshot = await get(ref(database, `${basePath}/trafficLights`));
    if (snapshot.exists()) {
        return Object.values(snapshot.val()) as TrafficLight[];
    }
    return [];
};

export const updateTrafficLight = async (
    lightId: number,
    updates: Partial<TrafficLight>
) => {
    if (!(await canWrite())) {
        throw new Error(
            "Write access denied. Only admins can modify data in demo mode."
        );
    }

    const basePath = await getBasePath();
    await update(
        ref(database, `${basePath}/trafficLights/${lightId}`),
        updates
    );
};


// Get next state in the cycle
const getNextState = (currentState: string): "green" | "yellow" | "red" => {
    switch (currentState) {
        case "green":
            return "yellow";
        case "yellow":
            return "red";
        case "red":
            return "green";
        default:
            return "green";
    }
};

// Update all traffic lights - decrease time and cycle states as needed
export const updateAllTrafficLights = async () => {
    // Always use admin path for traffic lights to ensure consistency
    const adminPath = getAdminPath();
    const trafficLights = await getTrafficLightsPublic();
    const updates: Record<string, TrafficLight> = {};

    for (const light of trafficLights) {
        let newTimeRemain = light.time_remain - 1;
        let newState = light.current_state;

        // If time is up, move to next state
        if (newTimeRemain <= 0) {
            const nextState = getNextState(light.current_state);
            newState = nextState;
            // Randomize the duration for the next state to prevent synchronization
            const baseDuration = TRAFFIC_LIGHT_TIMING[nextState];
            newTimeRemain = Math.floor(Math.random() * baseDuration) + 1; // 1 to baseDuration
        }

        const updatedLight: TrafficLight = {
            ...light,
            current_state: newState,
            time_remain: newTimeRemain
        };

        updates[`${adminPath}/trafficLights/${light.id}`] = updatedLight;
    }

    if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
    }
};

// Public read access - doesn't require authentication or write permissions
export const getTrafficLightsPublic = async (): Promise<TrafficLight[]> => {
    // Always read from admin path for consistent public access
    const adminPath = getAdminPath();
    const snapshot = await get(ref(database, `${adminPath}/trafficLights`));
    if (snapshot.exists()) {
        return Object.values(snapshot.val()) as TrafficLight[];
    }
    return [];
};

/* Live Grid Operations */
// TODO - implement similar pattern for live grid data

/* System Settings Operations */
export const getSystemSettings = async (): Promise<SystemSettings> => {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    // Only admins can read settings directly
    if (!isAdmin(user)) {
        throw new Error("Only admins can access system settings");
    }

    const snapshot = await get(ref(database, `settings`));
    if (!snapshot.exists()) {
        return DEFAULT_SETTINGS;
    }

    const data = snapshot.val();

    // Handle migration from old format (separate maxStartPoints and maxEndPoints) to new format (single maxPoints)
    if (data.maxStartPoints !== undefined && data.maxPoints === undefined) {
        // Use maxStartPoints as the new maxPoints value if it exists
        const migratedSettings: SystemSettings = {
            maxPoints: data.maxStartPoints,
            countdownTime: data.countdownTime || DEFAULT_SETTINGS.countdownTime,
            numberOfTasks: data.numberOfTasks || DEFAULT_SETTINGS.numberOfTasks,
        };

        // Update the database with the migrated settings
        await set(ref(database, `settings`), migratedSettings);
        return migratedSettings;
    }

    return data as SystemSettings;
};

export const updateSystemSettings = async (
    updates: Partial<SystemSettings>
) => {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    // Only admins can update settings
    if (!isAdmin(user)) {
        throw new Error("Only admins can update system settings");
    }

    // Get current settings
    const currentSettings = await getSystemSettings();

    // Update with new values
    const newSettings = { ...currentSettings, ...updates };

    // Save to database
    await set(ref(database, `settings`), newSettings);
};

export const initializeSystemSettings = async () => {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    // Only admins can initialize settings
    if (!isAdmin(user)) {
        throw new Error("Only admins can initialize system settings");
    }

    // Check if settings already exist
    const snapshot = await get(ref(database, `settings`));
    if (!snapshot.exists()) {
        await set(ref(database, `settings`), DEFAULT_SETTINGS);
    }
};
