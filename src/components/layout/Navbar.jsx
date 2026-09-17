import { Menu, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();

    return (
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex h-full items-center justify-between px-4 sm:px-6">
                <button
                    onClick={onMenuClick}
                    aria-label="Open navigation menu"
                    className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                >
                    <Menu size={21} />
                </button>

                <div className="ml-auto flex items-center gap-3">
                    <button
                        aria-label="Notifications"
                        className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
                    >
                        <Bell size={19} />

                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
                    </button>

                    <div className="h-7 w-px bg-slate-200" />

                    <div className="group relative">
                        <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                                {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>

                            <div className="hidden text-left sm:block">
                                <p className="text-xs font-semibold text-slate-800">
                                    {user?.name || "User"}
                                </p>

                                <p className="text-[10px] uppercase text-slate-400">
                                    {user?.role || "STAFF"}
                                </p>
                            </div>

                            <ChevronDown size={15} className="text-slate-400" />
                        </button>

                        <div className="invisible absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 opacity-0 shadow-xl transition group-focus-within:visible group-focus-within:opacity-100">
                            <button
                                onClick={logout}
                                className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}