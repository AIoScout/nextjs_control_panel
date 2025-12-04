import { useState, useEffect } from "react";
import { SystemSettings } from "../lib/settings-types";
import { getSystemSettings, updateSystemSettings } from "../lib/db-operations";

export default function SettingsForm() {
    const [settings, setSettings] = useState<SystemSettings>({
        maxPoints: 10,
        countdownTime: 300,
        numberOfTasks: 5,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">(
        "success"
    );

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const fetchedSettings = await getSystemSettings();
                setSettings(fetchedSettings);
            } catch (error) {
                console.error("Error fetching settings:", error);
                setMessage("Failed to load settings");
                setMessageType("error");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings({
            ...settings,
            [name]: parseInt(value, 10),
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            await updateSystemSettings(settings);
            setMessage("Settings saved successfully!");
            setMessageType("success");
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage("Failed to save settings");
            setMessageType("error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center p-4">Loading settings...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* <div>
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">
                            Points Configuration
                        </h3>
                        <p className="text-sm text-gray-500">
                            Configure the maximum number of points.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="maxPoints"
                            className="text-sm font-medium leading-none"
                        >
                            Max Points
                        </label>
                        <input
                            id="maxPoints"
                            name="maxPoints"
                            type="number"
                            min="1"
                            value={settings.maxPoints}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border px-3 py-2"
                        />
                        <p className="text-xs text-gray-500">
                            This value applies to both start and end points.
                        </p>
                    </div>
                </div>
            </div> */}

            <div>
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">
                            Time Configuration
                        </h3>
                        <p className="text-sm text-gray-500">
                            Configure the countdown timer for exams.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="countdownTime"
                            className="text-sm font-medium leading-none"
                        >
                            Countdown Time (seconds)
                        </label>
                        <input
                            id="countdownTime"
                            name="countdownTime"
                            type="number"
                            min="10"
                            value={settings.countdownTime}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border px-3 py-2"
                        />
                    </div>
                </div>
            </div>

            <div>
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">
                            Tasks Configuration
                        </h3>
                        <p className="text-sm text-gray-500">
                            Configure the number of tasks available.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="numberOfTasks"
                            className="text-sm font-medium leading-none"
                        >
                            Number of Tasks
                        </label>
                        <input
                            id="numberOfTasks"
                            name="numberOfTasks"
                            type="number"
                            min="1"
                            value={settings.numberOfTasks}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border px-3 py-2"
                        />
                    </div>
                </div>
            </div>

            {message && (
                <div
                    className={`p-4 rounded-md ${
                        messageType === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {message}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-secondary text-secondary-content font-medium py-2 px-4 rounded-md disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>
        </form>
    );
}
