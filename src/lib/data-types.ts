export type ExamState = {
    activated: boolean; // indicates if the exam is active based on the timer
    start_point: number;
    end_point: number;
    task_id?: number; // null if no task is selected
    time_remain?: number; // time remaining in seconds, null if not set
};

export type TrafficLight = {
    id: number;
    current_state: "green" | "yellow" | "red";
    time_remain: number;
};
