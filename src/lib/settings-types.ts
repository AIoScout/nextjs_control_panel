export type SystemSettings = {
    maxPoints: number;
    countdownTime: number;
    numberOfTasks: number;
};

export const DEFAULT_SETTINGS: SystemSettings = {
    maxPoints: 10,
    countdownTime: 120, // 2 minutes in seconds
    numberOfTasks: 4,
};
