import { useEffect, useState } from "react";
import {
    Activity,
    ArrowDownToLine,
    ArrowUpFromLine,
    RefreshCw,
    Search,
    SlidersHorizontal,
} from "lucide-react";
import api from "../utils/api";

const movementLabels = {
    RECEIVING: {
        label: "Receiving",
        icon: ArrowDownToLine,
    },
    PICKING: {
        label: "Picking",
        icon: ArrowUpFromLine,
    },
    ADJUSTMENT: {
        label: "Adjustment",
        icon: SlidersHorizontal,
    },
    TRANSFER: {
        label: "Transfer",
        icon: Activity,
    },
};

export default function Reports() {
    const [movements, setMovements] = useState([]);
    const [pagination, setPagination] = useState(null);

    const [search, setSearch] = useState("");
    const [type, setType] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchMovements = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/inventory/movements", {
                params: {
                    search,
                    type,
                    page: 1,
                    limit: 100,
                },
            });

            const result = response.data?.data;

            setMovements(result?.items || []);
            setPagination(result?.pagination || null);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load stock movement report."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovements();
    }, [search, type]);

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const getMovement = (movementType) => {
        return (
            movementLabels[movementType] || {
                label: movementType || "Movement",
                icon: Activity,
            }
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                        Analytics
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                        Reports
                    </h1>

                    <p className="mt-1 text-slate-500">
                        Monitor stock movements and warehouse activity.
                    </p>
                </div>

                <button
                    onClick={fetchMovements}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search product, SKU or reference..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:bg-white"
                        />
                    </div>

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-blue-500"
                    >
                        <option value="">All Movements</option>
                        <option value="RECEIVING">Receiving</option>
                        <option value="PICKING">Picking</option>
                        <option value="ADJUSTMENT">Adjustment</option>
                        <option value="TRANSFER">Transfer</option>
                    </select>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Total Movements</p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">
                        {pagination?.total?.toLocaleString() || movements.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Displayed Records</p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">
                        {movements.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Current Filter</p>
                    <p className="mt-2 text-lg font-bold text-slate-950">
                        {type
                            ? movementLabels[type]?.label || type
                            : "All Movements"}
                    </p>
                </div>
            </div>

            {/* Movement Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="font-bold text-slate-900">
                        Stock Movement History
                    </h2>

                    <p className="text-sm text-slate-500">
                        Audit trail of inventory changes.
                    </p>
                </div>

                {loading ? (
                    <div className="flex min-h-64 items-center justify-center">
                        <div className="flex items-center gap-3 text-slate-500">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            Loading movements...
                        </div>
                    </div>
                ) : movements.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center text-center">
                        <Activity className="h-10 w-10 text-slate-300" />

                        <p className="mt-3 font-semibold text-slate-600">
                            No stock movements found
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            Try another search or movement type.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Date
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Product
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Movement
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Quantity
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Reference
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                        User
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {movements.map((movement) => {
                                    const movementInfo = getMovement(movement.type);
                                    const Icon = movementInfo.icon;

                                    const quantity = Number(movement.quantity || 0);

                                    return (
                                        <tr
                                            key={movement.id}
                                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                {formatDate(
                                                    movement.createdAt || movement.date
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-800">
                                                    {movement.product?.name || "-"}
                                                </p>

                                                <p className="text-sm text-slate-400">
                                                    {movement.product?.sku || "-"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                                                        <Icon className="h-4 w-4" />
                                                    </div>

                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {movementInfo.label}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <span
                                                    className={`font-bold ${quantity > 0
                                                            ? "text-emerald-600"
                                                            : quantity < 0
                                                                ? "text-red-600"
                                                                : "text-slate-600"
                                                        }`}
                                                >
                                                    {quantity > 0 ? "+" : ""}
                                                    {quantity}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {movement.reference || "-"}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {movement.user?.name ||
                                                    movement.user?.email ||
                                                    "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}