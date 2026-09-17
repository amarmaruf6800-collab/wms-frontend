import { useEffect, useState } from "react";
import {
    Box,
    CheckCircle2,
    RefreshCw,
    Search,
    X,
} from "lucide-react";
import api from "../utils/api";

export default function Packing() {
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
                    status: "PICKING",
                    page: 1,
                    limit: 100,
                },
            });

            setOrders(response.data.data?.items || []);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Gagal memuat order packing."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [search]);

    const isFullyPicked = (order) => {
        if (!order.items?.length) return false;

        return order.items.every(
            (item) =>
                (item.pickedQuantity || 0) >=
                item.quantity
        );
    };

    const handlePack = async (order) => {
        if (!isFullyPicked(order)) {
            setMessage(
                "Order belum dapat dipacking karena masih ada item yang belum selesai dipicking."
            );
            return;
        }

        try {
            setProcessing(true);
            setMessage("");

            const response = await api.patch(
                `/sales-orders/${order.id}/status`,
                {
                    status: "PACKED",
                }
            );

            setMessage(
                response.data.message ||
                `${order.orderNumber} berhasil dipacking.`
            );

            await fetchOrders();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Gagal mengubah status menjadi PACKED."
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
                        <Box size={21} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Packing
                        </h1>

                        <p className="text-sm text-slate-500">
                            Prepare picked orders for shipment.
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchOrders}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
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
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search order number or customer..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
                    />
                </div>
            </div>

            {/* ORDERS */}
            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-400">
                    Loading packing orders...
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                    <Box
                        size={36}
                        className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-500">
                        No orders ready for packing
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Fully picked orders will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const complete =
                            isFullyPicked(order);

                        return (
                            <div
                                key={order.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                                {/* HEADER */}
                                <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="font-bold text-slate-900">
                                                {
                                                    order.orderNumber
                                                }
                                            </h2>

                                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                                PICKING
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {
                                                order.customer
                                                    ?.name
                                            }
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            Warehouse:{" "}
                                            {
                                                order.warehouse
                                                    ?.name
                                            }
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            handlePack(order)
                                        }
                                        disabled={
                                            !complete ||
                                            processing
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Box size={16} />

                                        {processing
                                            ? "Processing..."
                                            : "Mark as Packed"}
                                    </button>
                                </div>

                                {/* ITEMS */}
                                <div className="divide-y divide-slate-100">
                                    {order.items?.map(
                                        (item) => {
                                            const picked =
                                                item.pickedQuantity ||
                                                0;

                                            const remaining =
                                                Math.max(
                                                    0,
                                                    item.quantity -
                                                    picked
                                                );

                                            return (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {
                                                                item
                                                                    .product
                                                                    ?.name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            SKU:{" "}
                                                            {
                                                                item
                                                                    .product
                                                                    ?.sku
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <div>
                                                            <p className="text-xs text-slate-400">
                                                                Ordered
                                                            </p>

                                                            <p className="font-bold text-slate-700">
                                                                {
                                                                    item.quantity
                                                                }
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-slate-400">
                                                                Picked
                                                            </p>

                                                            <p className="font-bold text-emerald-600">
                                                                {
                                                                    picked
                                                                }
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs text-slate-400">
                                                                Remaining
                                                            </p>

                                                            <p
                                                                className={`font-bold ${remaining ===
                                                                        0
                                                                        ? "text-emerald-600"
                                                                        : "text-amber-600"
                                                                    }`}
                                                            >
                                                                {
                                                                    remaining
                                                                }
                                                            </p>
                                                        </div>

                                                        {remaining ===
                                                            0 && (
                                                                <CheckCircle2
                                                                    size={
                                                                        20
                                                                    }
                                                                    className="text-emerald-500"
                                                                />
                                                            )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>

                                {/* PROGRESS */}
                                <div className="border-t border-slate-200 px-5 py-4">
                                    <div className="mb-2 flex justify-between text-xs">
                                        <span className="font-medium text-slate-500">
                                            Picking completion
                                        </span>

                                        <span className="font-bold text-slate-700">
                                            {order.items?.reduce(
                                                (
                                                    total,
                                                    item
                                                ) =>
                                                    total +
                                                    (item.pickedQuantity ||
                                                        0),
                                                0
                                            )}{" "}
                                            /{" "}
                                            {order.items?.reduce(
                                                (
                                                    total,
                                                    item
                                                ) =>
                                                    total +
                                                    item.quantity,
                                                0
                                            )}
                                        </span>
                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-slate-900 transition-all"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    (order.items.reduce(
                                                        (
                                                            total,
                                                            item
                                                        ) =>
                                                            total +
                                                            (item.pickedQuantity ||
                                                                0),
                                                        0
                                                    ) /
                                                        order.items.reduce(
                                                            (
                                                                total,
                                                                item
                                                            ) =>
                                                                total +
                                                                item.quantity,
                                                            0
                                                        )) *
                                                    100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}