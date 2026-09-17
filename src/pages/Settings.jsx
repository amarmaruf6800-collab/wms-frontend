import { useState } from "react";
import {
    User,
    ShieldCheck,
    Server,
    Bell,
    Moon,
    LogOut,
    Save,
    CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
    const { user, logout } = useAuth();

    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem(
            "wms_preferences",
            JSON.stringify({
                notifications,
                darkMode,
            })
        );

        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 2000);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                        System
                    </p>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                        Settings
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your account and application preferences.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                    {saved ? (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            Saved
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Account */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Account
                            </h2>

                            <p className="text-sm text-slate-500">
                                Your WMS account information.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-2">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Name
                        </label>

                        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800">
                            {user?.name || "-"}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Email
                        </label>

                        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            {user?.email || "-"}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Role
                        </label>

                        <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                            <ShieldCheck className="h-4 w-4 text-blue-600" />
                            {user?.role?.toUpperCase() || "-"}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            User ID
                        </label>

                        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            {user?.id ?? "-"}
                        </div>
                    </div>
                </div>
            </section>

            {/* Preferences */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                            <Bell className="h-5 w-5 text-amber-600" />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Preferences
                            </h2>

                            <p className="text-sm text-slate-500">
                                Configure your application preferences.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {/* Notifications */}
                    <div className="flex items-center justify-between gap-6 px-6 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                <Bell className="h-5 w-5 text-slate-600" />
                            </div>

                            <div>
                                <p className="font-medium text-slate-900">
                                    Notifications
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Receive inventory and system notifications.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setNotifications(!notifications)}
                            className={`relative h-6 w-11 rounded-full transition ${notifications
                                    ? "bg-blue-600"
                                    : "bg-slate-300"
                                }`}
                        >
                            <span
                                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${notifications
                                        ? "left-6"
                                        : "left-1"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Dark mode */}
                    <div className="flex items-center justify-between gap-6 px-6 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                <Moon className="h-5 w-5 text-slate-600" />
                            </div>

                            <div>
                                <p className="font-medium text-slate-900">
                                    Dark Mode
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Use dark appearance for the WMS interface.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setDarkMode(!darkMode)}
                            className={`relative h-6 w-11 rounded-full transition ${darkMode
                                    ? "bg-blue-600"
                                    : "bg-slate-300"
                                }`}
                        >
                            <span
                                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${darkMode ? "left-6" : "left-1"
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </section>

            {/* System Information */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                            <Server className="h-5 w-5 text-slate-700" />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                System Information
                            </h2>

                            <p className="text-sm text-slate-500">
                                Current WMS application configuration.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Application
                        </p>

                        <p className="mt-2 font-medium text-slate-900">
                            Warehouse Management System
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Frontend
                        </p>

                        <p className="mt-2 font-medium text-slate-900">
                            React + Vite + Tailwind CSS
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Backend
                        </p>

                        <p className="mt-2 font-medium text-slate-900">
                            Node.js + Express
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Database
                        </p>

                        <p className="mt-2 font-medium text-slate-900">
                            MySQL / MariaDB
                        </p>
                    </div>
                </div>
            </section>

            {/* Logout */}
            <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Sign out
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Sign out from your current WMS session.
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </section>
        </div>
    );
}