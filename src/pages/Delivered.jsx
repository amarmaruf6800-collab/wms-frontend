import { useEffect, useState } from "react";
import {
    CheckCircle2,
    RefreshCw,
    Search,
    Truck,
    X,
} from "lucide-react";
import api from "../utils/api";

export default function Delivered() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const response = await api.get("/sales-orders", {
                params: {
                    search: search.trim() || undefined,
                    status: "SHIPPED",
                    page: 1,
                    limit: 100,
                },
            });

            setOrders(response.data.data?.items || []);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Gagal memuat order yang sedang dikirim."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [search]);

    const handleDelivered = async (order) => {
        try {
            setProcessing(true);
            setMessage("");

            const response = await api.patch(
                `/sales-orders/${order.id}/status`,
                {
                    status: "DELIVERED",
                }
            );

            setMessage(
                response.data.message ||
                `${order.orderNumber} berhasil ditandai sebagai delivered.`
            );

            await fetchOrders();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Gagal mengubah status order."
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                        <CheckCircle2 size={21} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Delivered
                        </h1>

                        <p className="text-sm text-slate-500">
                            Confirm orders delivered to customers.
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchOrders}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* MESSAGE */}
            {message && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                    <span>{message}</span>

                    <button
                        onClick={() => setMessage("")}
                        className="text-slate-400 hover:text-slate-700"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* SEARCH */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search order number or customer..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                </div>
            </div>

            {/* ORDERS */}
            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-400">
                    Loading shipped orders...
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                    <CheckCircle2
                        size={38}
                        className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-500">
                        No shipped orders
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Orders that have been shipped will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                            {/* HEADER */}
                            <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="font-bold text-slate-900">
                                            {order.orderNumber}
                                        </h2>

                                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                                            SHIPPED
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {order.customer?.name}
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        Warehouse:{" "}
                                        {order.warehouse?.name}
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        handleDelivered(order)
                                    }
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <CheckCircle2 size={16} />
                                    {processing
                                        ? "Processing..."
                                        : "Mark as Delivered"}
                                </button>
                            </div>

                            {/* SHIPPING INFO */}
                            <div className="grid gap-4 border-b border-slate-200 px-5 py-5 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs text-slate-400">
                                        Shipping Provider
                                    </p>

                                    <div className="mt-1 flex items-center gap-2">
                                        <Truck
                                            size={15}
                                            className="text-slate-400"
                                        />

                                        <p className="font-semibold text-slate-700">
                                            {order.shippingProvider ||
                                                "—"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Tracking Number
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-700">
                                        {order.trackingNumber ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Shipping Address
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-700">
                                        {order.shippingAddress ||
                                            "No shipping address"}
                                    </p>
                                </div>
                            </div>

                            {/* ITEMS */}
                            <div>
                                {order.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-b-0"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {
                                                    item.product
                                                        ?.name
                                                }
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                SKU:{" "}
                                                {
                                                    item.product
                                                        ?.sku
                                                }
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-slate-400">
                                                Quantity
                                            </p>

                                            <p className="font-bold text-slate-700">
                                                {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}