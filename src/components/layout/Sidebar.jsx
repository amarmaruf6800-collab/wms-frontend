import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Warehouse,
    MapPin,
    Boxes,
    ArrowDownToLine,
    ArrowUpFromLine,
    ClipboardList,
    BarChart3,
    Settings,
    X,
    PackageCheck,
    Truck,
    CheckCircle2,
} from "lucide-react";

const menuItems = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Products",
        path: "/products",
        icon: Package,
    },
    {
        label: "Warehouses",
        path: "/warehouses",
        icon: Warehouse,
    },
    {
        label: "Locations",
        path: "/locations",
        icon: MapPin,
    },
    {
        label: "Inventory",
        path: "/inventory",
        icon: Boxes,
    },
];

const transactionItems = [
    {
        label: "Receiving",
        path: "/receiving",
        icon: ArrowDownToLine,
    },
    {
        label: "Sales Orders",
        path: "/sales-orders",
        icon: ClipboardList,
    },
    {
        label: "Picking",
        path: "/picking",
        icon: ArrowUpFromLine,
    },

    {
        label: "Packing",
        path: "/packing",
        icon: PackageCheck,
    },

    {
        label: "Shipping",
        path: "/shipping",
        icon: Truck,
    },

    {
        label: "Delivered",
        path: "/delivered",
        icon: CheckCircle2,
    },

    {
        label: "Returns",
        path: "/returns",
        icon: ArrowDownToLine,
    },
];

export default function Sidebar({ open, onClose }) {
    const renderItem = (item) => {
        const Icon = item.icon;

        return (
            <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                }
            >
                <Icon size={18} />
                <span>{item.label}</span>
            </NavLink>
        );
    };

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-200
          bg-white transition-transform duration-200
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <Boxes size={19} />
                        </div>

                        <div>
                            <p className="text-sm font-bold text-slate-900">WMS</p>
                            <p className="text-[10px] text-slate-400">
                                Warehouse System
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="h-[calc(100vh-4rem)] overflow-y-auto px-3 py-5">
                    <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Overview
                    </p>

                    <nav className="space-y-1">
                        {menuItems.map(renderItem)}
                    </nav>

                    <p className="px-3 mb-2 mt-7 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Operations
                    </p>

                    <nav className="space-y-1">
                        {transactionItems.map(renderItem)}
                    </nav>

                    <p className="px-3 mb-2 mt-7 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Management
                    </p>

                    <nav className="space-y-1">
                        <NavLink
                            to="/reports"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                                }`
                            }
                        >
                            <BarChart3 size={18} />
                            Reports
                        </NavLink>

                        <NavLink
                            to="/settings"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-slate-100"
                                }`
                            }
                        >
                            <Settings size={18} />
                            Settings
                        </NavLink>
                    </nav>
                </div>
            </aside>
        </>
    );
}