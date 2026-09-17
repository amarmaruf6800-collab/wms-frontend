import { useEffect, useState } from "react";
import {
    Package,
    Warehouse,
    Boxes,
    AlertTriangle,
    XCircle,
    RefreshCw,
    ArrowUpRight,
} from "lucide-react";
import api from "../utils/api";

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/dashboard/summary");
            setData(response.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Gagal mengambil data dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
                    <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-2xl bg-white shadow-sm"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                        <XCircle className="h-7 w-7 text-red-500" />
                    </div>

                    <h2 className="text-lg font-semibold text-slate-900">
                        Dashboard gagal dimuat
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        {error}
                    </p>

                    <button
                        onClick={fetchDashboard}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    const overview = data?.overview || {};
    const alerts = data?.alerts || {};
    const formatNumber = (value) => Number(value || 0).toLocaleString();

    const stats = [
        {
            title: "Total Products",
            value: overview.totalProducts ?? 0,
            icon: Package,
            description: "Active products",
        },
        {
            title: "Total Warehouses",
            value: overview.totalWarehouses ?? 0,
            icon: Warehouse,
            description: "Active warehouses",
        },
        {
            title: "Physical Stock",
            value: overview.totalPhysicalStock ?? 0,
            icon: Boxes,
            description: "Total inventory quantity",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Overview of your warehouse operations and inventory.
                    </p>
                </div>

                <button
                    onClick={fetchDashboard}
                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.title}
                            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {stat.title}
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                                        {formatNumber(stat.value)}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {stat.description}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                                    <Icon className="h-5 w-5 text-slate-700" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Alerts */}
            <div>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Inventory Alerts
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Products that may need attention.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    {/* Low Stock */}
                    <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        Low Stock
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Below minimum stock
                                    </p>
                                </div>
                            </div>

                            <span className="text-2xl font-bold text-amber-600">
                                {alerts.lowStockCount ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Out of Stock */}
                    <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        Out of Stock
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Products with no stock
                                    </p>
                                </div>
                            </div>

                            <span className="text-2xl font-bold text-red-600">
                                {alerts.outOfStockCount ?? 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Low Stock Details */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Low Stock Products
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Products currently below their minimum stock level.
                        </p>
                    </div>

                    <ArrowUpRight className="h-5 w-5 text-slate-400" />
                </div>

                {alerts.lowStockDetails?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        SKU
                                    </th>

                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Product
                                    </th>

                                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Warehouse
                                    </th>

                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Stock
                                    </th>

                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Min. Stock
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {alerts.lowStockDetails.map((item) => (
                                    <tr
                                        key={`${item.productId}-${item.warehouseId}`}
                                        className="transition hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {item.sku}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {item.productName}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {item.warehouseName}
                                        </td>

                                        <td className="px-6 py-4 text-right text-sm font-semibold text-amber-600">
                                            {formatNumber(item.quantity)}
                                        </td>

                                        <td className="px-6 py-4 text-right text-sm text-slate-600">
                                            {formatNumber(item.minStock)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <Boxes className="mx-auto h-10 w-10 text-slate-300" />

                        <p className="mt-3 text-sm font-medium text-slate-700">
                            No low stock products
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Inventory levels are currently healthy.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}