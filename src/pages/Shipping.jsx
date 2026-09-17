import { useEffect, useState } from "react";
import {
    Truck,
    CheckCircle2,
    RefreshCw,
    Search,
    X,
} from "lucide-react";
import api from "../utils/api";

export default function Shipping() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [trackingNumber, setTrackingNumber] = useState("");
    const [shippingProvider, setShippingProvider] =
        useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const response = await api.get("/sales-orders", {
                params: {
                    search: search.trim() || undefined,
                    status: "PACKED",
                    page: 1,
                    limit: 100,
                },
            });

            setOrders(response.data.data?.items || []);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Gagal memuat order shipping."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [search]);

    const openShipping = (order) => {
        setSelectedOrder(order);
        setTrackingNumber("");
        setShippingProvider("");
        setMessage("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (processing) return;

        setShowModal(false);
        setSelectedOrder(null);
        setTrackingNumber("");
        setShippingProvider("");
    };

    const handleShip = async (e) => {
        e.preventDefault();

        if (!selectedOrder) return;

        if (!shippingProvider.trim()) {
            setMessage("Shipping provider wajib diisi.");
            return;
        }

        if (!trackingNumber.trim()) {
            setMessage("Tracking number wajib diisi.");
            return;
        }

        try {
            setProcessing(true);
            setMessage("");

            const response = await api.post(
                `/sales-orders/${selectedOrder.id}/ship`,
                {
                    shippingProvider: shippingProvider.trim(),
                    trackingNumber: trackingNumber.trim(),
                }
            );

            setShowModal(false);
            setSelectedOrder(null);
            setTrackingNumber("");
            setShippingProvider("");

            setMessage(
                response.data.message ||
                `${selectedOrder.orderNumber} berhasil dikirim.`
            );

            await fetchOrders();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Gagal mengirim order."
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
                        <Truck size={21} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Shipping
                        </h1>

                        <p className="text-sm text-slate-500">
                            Ship packed orders to customers.
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
                    Loading shipping orders...
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                    <Truck
                        size={36}
                        className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-500">
                        No orders ready for shipping
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                        Packed orders will appear here.
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
                                    <div className="flex items-center gap-3">
                                        <h2 className="font-bold text-slate-900">
                                            {
                                                order.orderNumber
                                            }
                                        </h2>

                                        <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700">
                                            PACKED
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
                                        openShipping(
                                            order
                                        )
                                    }
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                    <Truck size={16} />
                                    Ship Order
                                </button>
                            </div>

                            {/* ORDER INFO */}
                            <div className="grid gap-4 px-5 py-5 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs text-slate-400">
                                        Customer
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-700">
                                        {
                                            order.customer
                                                ?.name
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400">
                                        Items
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-700">
                                        {order.items
                                            ?.reduce(
                                                (
                                                    total,
                                                    item
                                                ) =>
                                                    total +
                                                    item.quantity,
                                                0
                                            )}
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
                            <div className="border-t border-slate-200">
                                {order.items?.map(
                                    (item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-b-0"
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

                                            <div className="text-right">
                                                <p className="text-xs text-slate-400">
                                                    Quantity
                                                </p>

                                                <p className="font-bold text-slate-700">
                                                    {
                                                        item.quantity
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SHIPPING MODAL */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Ship Order
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {
                                        selectedOrder.orderNumber
                                    }
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleShip}>
                            <div className="space-y-5 p-6">
                                {/* ORDER */}
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="font-bold text-slate-800">
                                        {
                                            selectedOrder
                                                .customer?.name
                                        }
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {
                                            selectedOrder
                                                .shippingAddress ||
                                            "No shipping address"
                                        }
                                    </p>
                                </div>

                                {/* PROVIDER */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Shipping Provider
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            shippingProvider
                                        }
                                        onChange={(e) =>
                                            setShippingProvider(
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. JNE, J&T, SiCepat..."
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                    />
                                </div>

                                {/* TRACKING */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Tracking Number
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            trackingNumber
                                        }
                                        onChange={(e) =>
                                            setTrackingNumber(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter tracking number..."
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                    />
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={
                                        processing
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <CheckCircle2
                                        size={16}
                                    />

                                    {processing
                                        ? "Shipping..."
                                        : "Confirm Shipment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}