import { useEffect, useState } from "react";
import {
    ArrowDownToLine,
    ClipboardCheck,
    RefreshCw,
    Search,
    X,
} from "lucide-react";
import api from "../utils/api";

const STATUS_STYLES = {
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    PICKING: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function Picking() {
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const [quantity, setQuantity] = useState("");
    const [locationId, setLocationId] = useState("");
    const [reference, setReference] = useState("");

    const [message, setMessage] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const [confirmedResponse, pickingResponse] =
                await Promise.all([
                    api.get("/sales-orders", {
                        params: {
                            search: search.trim() || undefined,
                            status: "CONFIRMED",
                            page: 1,
                            limit: 100,
                        },
                    }),
                    api.get("/sales-orders", {
                        params: {
                            search: search.trim() || undefined,
                            status: "PICKING",
                            page: 1,
                            limit: 100,
                        },
                    }),
                ]);

            const confirmed =
                confirmedResponse.data.data?.items || [];

            const picking =
                pickingResponse.data.data?.items || [];

            const combined = [...confirmed, ...picking];

            setOrders(combined);
        } catch (error) {
            console.error("Gagal mengambil Sales Order:", error);

            setMessage(
                error.response?.data?.message ||
                "Gagal memuat Sales Order."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async (productId, warehouseId) => {
        try {
            const response = await api.get("/inventory", {
                params: {
                    productId,
                    warehouseId,
                    page: 1,
                    limit: 100,
                },
            });

            setInventory(
                response.data.data?.items || []
            );
        } catch (error) {
            console.error(
                "Gagal mengambil inventory:",
                error
            );

            setInventory([]);

            setMessage(
                error.response?.data?.message ||
                "Gagal mengambil stok inventory."
            );
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [search]);

    const startPicking = async (order) => {
        try {
            setProcessing(true);
            setMessage("");

            await api.post(
                `/sales-orders/${order.id}/start-picking`
            );

            setMessage(
                `${order.orderNumber} masuk ke proses picking.`
            );

            await fetchOrders();
        } catch (error) {
            console.error(
                "Gagal memulai picking:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Gagal memulai proses picking."
            );
        } finally {
            setProcessing(false);
        }
    };

    const openPicking = async (order, item) => {
        const remaining =
            item.quantity - (item.pickedQuantity || 0);

        if (remaining <= 0) {
            setMessage(
                "Item tersebut sudah selesai dipicking."
            );
            return;
        }

        setSelectedOrder(order);
        setSelectedItem(item);

        setQuantity(remaining);
        setLocationId("");
        setReference(
            `${order.orderNumber}/ITEM-${item.id}`
        );

        setInventory([]);
        setMessage("");
        setShowModal(true);

        await fetchInventory(
            item.productId,
            order.warehouseId
        );
    };

    const closeModal = () => {
        if (processing) return;

        setShowModal(false);
        setSelectedOrder(null);
        setSelectedItem(null);
        setInventory([]);
    };

    const handlePick = async (e) => {
        e.preventDefault();

        if (!selectedOrder || !selectedItem) return;

        const pickQuantity = Number(quantity);

        const remaining =
            selectedItem.quantity -
            (selectedItem.pickedQuantity || 0);

        if (
            !Number.isInteger(pickQuantity) ||
            pickQuantity <= 0
        ) {
            setMessage(
                "Quantity picking harus berupa bilangan bulat lebih dari 0."
            );
            return;
        }

        if (pickQuantity > remaining) {
            setMessage(
                `Quantity melebihi sisa item. Sisa yang harus dipick: ${remaining} unit.`
            );
            return;
        }

        if (!locationId) {
            setMessage(
                "Pilih lokasi stok terlebih dahulu."
            );
            return;
        }

        const selectedInventory = inventory.find(
            (item) =>
                String(item.location?.id ?? "") ===
                String(locationId)
        );

        if (!selectedInventory) {
            setMessage(
                "Inventory pada lokasi tersebut tidak ditemukan."
            );
            return;
        }

        if (pickQuantity > selectedInventory.quantity) {
            setMessage(
                `Stok di lokasi tersebut hanya ${selectedInventory.quantity} unit.`
            );
            return;
        }

        try {
            setProcessing(true);
            setMessage("");

            const response = await api.post(
                `/sales-orders/${selectedOrder.id}/pick`,
                {
                    itemId: selectedItem.id,
                    quantity: pickQuantity,
                    locationId: Number(locationId),
                    reference:
                        reference.trim() ||
                        `${selectedOrder.orderNumber}/ITEM-${selectedItem.id}`,
                }
            );

            setShowModal(false);

            setSelectedOrder(null);
            setSelectedItem(null);
            setInventory([]);

            setMessage(
                response.data.message ||
                "Picking berhasil."
            );

            await fetchOrders();
        } catch (error) {
            console.error(
                "Gagal melakukan picking:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Gagal melakukan picking."
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
                        <ArrowDownToLine size={21} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Picking
                        </h1>

                        <p className="text-sm text-slate-500">
                            Pick ordered products from warehouse inventory.
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
                        placeholder="Search order number or customer..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                    />
                </div>
            </div>

            {/* ORDERS */}
            <div className="space-y-4">
                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
                        Loading picking orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                        <ClipboardCheck
                            size={34}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-semibold text-slate-500">
                            No orders ready for picking
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            Confirmed Sales Orders will appear here.
                        </p>
                    </div>
                ) : (
                    orders.map((order) => {
                        const totalOrdered =
                            order.items?.reduce(
                                (sum, item) =>
                                    sum + item.quantity,
                                0
                            ) || 0;

                        const totalPicked =
                            order.items?.reduce(
                                (sum, item) =>
                                    sum +
                                    (item.pickedQuantity || 0),
                                0
                            ) || 0;

                        return (
                            <div
                                key={order.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                                {/* ORDER HEADER */}
                                <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="font-bold text-slate-900">
                                                {
                                                    order.orderNumber
                                                }
                                            </h2>

                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[
                                                    order
                                                        .status
                                                    ]
                                                    }`}
                                            >
                                                {order.status}
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

                                    <div className="flex items-center gap-5">
                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Picking Progress
                                            </p>

                                            <p className="font-bold text-slate-800">
                                                {totalPicked} /{" "}
                                                {totalOrdered}
                                            </p>
                                        </div>

                                        {order.status ===
                                            "CONFIRMED" && (
                                                <button
                                                    onClick={() =>
                                                        startPicking(
                                                            order
                                                        )
                                                    }
                                                    disabled={
                                                        processing
                                                    }
                                                    className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                                                >
                                                    Start Picking
                                                </button>
                                            )}
                                    </div>
                                </div>

                                {/* ITEMS */}
                                <div className="divide-y divide-slate-100">
                                    {order.items?.map(
                                        (item) => {
                                            const picked =
                                                item.pickedQuantity ||
                                                0;

                                            const remaining =
                                                item.quantity -
                                                picked;

                                            const completed =
                                                remaining <= 0;

                                            return (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className="flex flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between"
                                                >
                                                    <div className="flex min-w-0 items-center gap-4">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                                            <ClipboardCheck
                                                                size={
                                                                    19
                                                                }
                                                                className="text-slate-500"
                                                            />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-slate-800">
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
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-6">
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
                                                                className={`font-bold ${completed
                                                                        ? "text-emerald-600"
                                                                        : "text-amber-600"
                                                                    }`}
                                                            >
                                                                {
                                                                    remaining
                                                                }
                                                            </p>
                                                        </div>

                                                        {completed ? (
                                                            <span className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                                                                Completed
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    openPicking(
                                                                        order,
                                                                        item
                                                                    )
                                                                }
                                                                disabled={
                                                                    order.status !==
                                                                    "PICKING" ||
                                                                    processing
                                                                }
                                                                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                Pick
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* PICKING MODAL */}
            {showModal &&
                selectedOrder &&
                selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                            {/* HEADER */}
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Pick Product
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

                            <form onSubmit={handlePick}>
                                <div className="space-y-5 p-6">
                                    {/* PRODUCT INFO */}
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="font-bold text-slate-800">
                                            {
                                                selectedItem
                                                    .product
                                                    ?.name
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            SKU:{" "}
                                            {
                                                selectedItem
                                                    .product
                                                    ?.sku
                                            }
                                        </p>

                                        <div className="mt-4 grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Ordered
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-slate-800">
                                                    {
                                                        selectedItem.quantity
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Picked
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-emerald-600">
                                                    {
                                                        selectedItem.pickedQuantity ||
                                                        0
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-slate-400">
                                                    Remaining
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-amber-600">
                                                    {selectedItem.quantity -
                                                        (selectedItem.pickedQuantity ||
                                                            0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* LOCATION */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Pick From Location
                                        </label>

                                        <select
                                            value={
                                                locationId
                                            }
                                            onChange={(e) =>
                                                setLocationId(
                                                    e.target.value
                                                )
                                            }
                                            required
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                        >
                                            <option value="">
                                                Select inventory location
                                            </option>

                                            {inventory.map(
                                                (stock) => (
                                                    <option
                                                        key={
                                                            stock.id
                                                        }
                                                        value={
                                                            stock
                                                                .location
                                                                ?.id ||
                                                            ""
                                                        }
                                                    >
                                                        {stock.location
                                                            ? `${stock.location.code} — ${stock.location.name}`
                                                            : "Warehouse stock"}{" "}
                                                        —{" "}
                                                        {
                                                            stock.quantity
                                                        }{" "}
                                                        units
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        {inventory.length ===
                                            0 && (
                                                <p className="mt-2 text-xs text-red-500">
                                                    No inventory available for
                                                    this product in the selected
                                                    warehouse.
                                                </p>
                                            )}
                                    </div>

                                    {/* QUANTITY */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Pick Quantity
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            max={
                                                selectedItem.quantity -
                                                (selectedItem.pickedQuantity ||
                                                    0)
                                            }
                                            value={
                                                quantity
                                            }
                                            onChange={(e) =>
                                                setQuantity(
                                                    e.target.value
                                                )
                                            }
                                            required
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                        />
                                    </div>

                                    {/* REFERENCE */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Reference
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                reference
                                            }
                                            onChange={(e) =>
                                                setReference(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                        />
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            processing
                                        }
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            processing ||
                                            inventory.length ===
                                            0
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ArrowDownToLine
                                            size={16}
                                        />

                                        {processing
                                            ? "Processing..."
                                            : "Confirm Picking"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    );
}