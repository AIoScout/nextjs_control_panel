import { getTask, updateTask } from "@/lib/db-operations";
import { useState, useEffect } from "react";
import { get, ref } from "firebase/database";
import { database } from "@/lib/firebase";
import { DEFAULT_SETTINGS } from "@/lib/settings-types";

interface TaskSelectionProps {
    canWrite: boolean;
}

export default function TaskSelection({ canWrite }: TaskSelectionProps) {
    const [tasks, setTasks] = useState<{ id: number; name: string }[]>([
        { id: 1, name: "Task 1" },
        { id: 2, name: "Task 2" },
        { id: 3, name: "Task 3" },
        { id: 4, name: "Task 4" },
        { id: 5, name: "Task 5" },
    ]);

    const [taskSelected, setTaskSelected] = useState<number | null>(null);

    useEffect(() => {
        // Fetch settings
        const fetchSettings = async () => {
            try {
                const settingsSnapshot = await get(ref(database, "settings"));
                if (settingsSnapshot.exists()) {
                    const settings = settingsSnapshot.val();
                    const numberOfTasks =
                        settings.numberOfTasks ||
                        DEFAULT_SETTINGS.numberOfTasks;

                    // Create dynamic task list based on settings
                    const newTasks = [];
                    for (let i = 1; i <= numberOfTasks; i++) {
                        newTasks.push({ id: i, name: `Task ${i}` });
                    }
                    setTasks(newTasks);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };

        // Fetch the current task from the database when the component mounts
        getTask().then((taskId) => {
            if (taskId !== null) {
                setTaskSelected(taskId);
            }
        });

        fetchSettings();
    }, []);

    return (
        <div className="flex flex-col gap-2 content-center items-center p-4 border border-gray-300 rounded-lg shadow-md bg-white h-full">
            <h1 className="text-3xl font-medium">Task</h1>

            <select
                value={taskSelected ?? "Pick a task"}
                className="select"
                disabled={!canWrite}
                onChange={(e) => {
                    const selectedTaskId = Number(e.target.value);
                    setTaskSelected(selectedTaskId);
                    updateTask(selectedTaskId);
                }}
            >
                <option disabled={true}>Pick a task</option>
                {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                        {task.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
