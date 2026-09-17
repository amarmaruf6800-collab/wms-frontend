import { useEffect, useMemo, useState } from "react";
import {
    ArrowDownToLine,
    Check,
    ClipboardList,
    PackageCheck,
    Plus,
    RefreshCw,
    Search,
    X,
} from "lucide-react";
import api from "../utils/api";

const STATUS = {
    REQUESTED: "Requested",
    RECEIVED: "Received",
    INSPECTED: "Inspected",
    RESTOCKED: "Restocked",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
};

function formatDate(value) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatStatus(status) {
    return STATUS[status] || status;
}

function statusClass(status) {
    const classes = {
        REQUESTED: "bg-amber-50 text-amber-700",
        RECEIVED: "bg-blue-50 text-blue-700",
        INSPECTED: "bg-purple-50 text-purple-700",
        RESTOCKED: "bg-emerald-50 text-emerald-700",
        REJECTED: "bg-red-50 text-red-700",
        CANCELLED: "bg-slate-100 text-slate-600",
    };

    return classes[status] || "bg-slate-100 text-slate-600";
}

export default function Returns() {
    const [returns, setReturns] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [locations, setLocations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [showCreate, setShowCreate] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [showInspect, setShowInspect] = useState(false);
    const [showRestock, setShowRestock] = useState(false);

    const [selectedReturn, setSelectedReturn] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [createForm, setCreateForm] = useState({
        salesOrderId: "",
        reason: "",
        notes: "",
        items: [],
    });

    const [inspectionItems, setInspectionItems] = useState([]);
    const [restockItems, setRestockItems] = useState([]);

    // --------------------------------------------------
    // Fetch Returns
    // --------------------------------------------------

    const fetchReturns = async () => {
        try {
            setLoading(true);

            const response = await api.get("/returns", {
                params: {
                    search: search.trim() || undefined,
                    status: statusFilter || undefined,
                    page: 1,
                    limit: 100,
                },
            });

            setReturns(response.data.data?.items || []);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to load returns."
            );
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // Fetch Delivered Sales Orders
    // --------------------------------------------------

    const fetchDeliveredOrders = async () => {
        try {
            const response = await api.get("/sales-orders", {
                params: {
                    status: "DELIVERED",
                    page: 1,
                    limit: 100,
                },
            });

            setDeliveredOrders(response.data.data?.items || []);
        } catch (error) {
            console.error("fetchDeliveredOrders:", error);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, [search, statusFilter]);

    useEffect(() => {
        fetchDeliveredOrders();
    }, []);

    // --------------------------------------------------
    // Select Sales Order
    // --------------------------------------------------

    const handleSelectOrder = (orderId) => {
        const order = deliveredOrders.find(
            (item) => item.id === Number(orderId)
        );

        setSelectedOrder(order || null);

        if (!order) {
            setCreateForm((prev) => ({
                ...prev,
                salesOrderId: "",
                items: [],
            }));

            return;
        }

        setCreateForm((prev) => ({
            ...prev,
            salesOrderId: String(order.id),
            items: order.items.map((item) => ({
                salesOrderItemId: item.id,
                productId: item.productId,
                productName: item.product?.name || "Product",
                sku: item.product?.sku || "-",
                orderedQuantity: item.quantity,
                quantity: 0,
            })),
        }));
    };

    // --------------------------------------------------
    // Create Return
    // --------------------------------------------------

    const handleCreateReturn = async (event) => {
        event.preventDefault();

        if (!createForm.salesOrderId) {
            setMessage("Please select a Sales Order.");
            return;
        }

        const items = createForm.items
            .filter((item) => Number(item.quantity) > 0)
            .map((item) => ({
                salesOrderItemId: item.salesOrderItemId,
                quantity: Number(item.quantity),
            }));

        if (items.length === 0) {
            setMessage("Enter at least one return quantity.");
            return;
        }

        try {
            setSaving(true);
            setMessage("");

            await api.post("/returns", {
                salesOrderId: Number(createForm.salesOrderId),
                reason: createForm.reason.trim() || undefined,
                notes: createForm.notes.trim() || undefined,
                items,
            });

            setShowCreate(false);

            setCreateForm({
                salesOrderId: "",
                reason: "",
                notes: "",
                items: [],
            });

            setSelectedOrder(null);

            await fetchReturns();
            await fetchDeliveredOrders();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to create return."
            );
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Open Detail
    // --------------------------------------------------

    const openDetail = async (returnItem) => {
        try {
            const response = await api.get(
                `/returns/${returnItem.id}`
            );

            setSelectedReturn(response.data.data);
            setShowDetail(true);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to load return details."
            );
        }
    };

    // --------------------------------------------------
    // Update Status
    // --------------------------------------------------

    const updateStatus = async (id, status) => {
        try {
            setSaving(true);
            setMessage("");

            await api.patch(`/returns/${id}/status`, {
                status,
            });

            await fetchReturns();

            if (selectedReturn?.id === id) {
                const response = await api.get(`/returns/${id}`);
                setSelectedReturn(response.data.data);
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to update return status."
            );
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Receive
    // --------------------------------------------------

    const handleReceive = async () => {
        if (!selectedReturn) return;

        await updateStatus(
            selectedReturn.id,
            "RECEIVED"
        );
    };

    // --------------------------------------------------
    // Inspection
    // --------------------------------------------------

    const openInspection = () => {
        if (!selectedReturn) return;

        setInspectionItems(
            selectedReturn.items.map((item) => ({
                returnItemId: item.id,
                productName: item.product?.name || "Product",
                sku: item.product?.sku || "-",
                quantity: item.quantity,
                condition: item.condition || "GOOD",
                notes: item.notes || "",
            }))
        );

        setShowInspect(true);
    };

    const handleInspection = async (event) => {
        event.preventDefault();

        if (!selectedReturn) return;

        try {
            setSaving(true);
            setMessage("");

            await api.post(
                `/returns/${selectedReturn.id}/inspect`,
                {
                    items: inspectionItems.map((item) => ({
                        returnItemId: item.returnItemId,
                        condition: item.condition,
                        notes: item.notes.trim() || undefined,
                    })),
                }
            );

            const response = await api.get(
                `/returns/${selectedReturn.id}`
            );

            setSelectedReturn(response.data.data);
            setShowInspect(false);

            await fetchReturns();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to inspect return."
            );
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Restock
    // --------------------------------------------------

    const openRestock = async () => {
        if (!selectedReturn) return;

        try {
            const response = await api.get("/locations", {
                params: {
                    warehouseId: selectedReturn.warehouseId,
                    active: true,
                    page: 1,
                    limit: 100,
                },
            });

            setLocations(response.data.data?.items || []);

            setRestockItems(
                selectedReturn.items
                    .filter(
                        (item) =>
                            item.condition === "GOOD" &&
                            item.restockedQuantity < item.quantity
                    )
                    .map((item) => ({
                        returnItemId: item.id,
                        productName: item.product?.name || "Product",
                        sku: item.product?.sku || "-",
                        maxQuantity:
                            item.quantity - item.restockedQuantity,
                        quantity:
                            item.quantity - item.restockedQuantity,
                        locationId: item.locationId
                            ? String(item.locationId)
                            : "",
                    }))
            );

            setShowRestock(true);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to load warehouse locations."
            );
        }
    };

    const handleRestock = async (event) => {
        event.preventDefault();

        if (!selectedReturn) return;

        const items = restockItems
            .filter((item) => Number(item.quantity) > 0)
            .map((item) => ({
                returnItemId: item.returnItemId,
                quantity: Number(item.quantity),
                locationId: item.locationId
                    ? Number(item.locationId)
                    : null,
            }));

        if (items.length === 0) {
            setMessage("Enter a restock quantity.");
            return;
        }

        try {
            setSaving(true);
            setMessage("");

            await api.post(
                `/returns/${selectedReturn.id}/restock`,
                { items }
            );

            const response = await api.get(
                `/returns/${selectedReturn.id}`
            );

            setSelectedReturn(response.data.data);
            setShowRestock(false);

            await fetchReturns();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to restock return."
            );
        } finally {
            setSaving(false);
        }
    };

    const filteredReturns = useMemo(
        () => returns,
        [returns]
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <ArrowDownToLine size={26} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-slate-950">
                            Returns
                        </h1>
                        <p className="mt-1 text-slate-500">
                            Manage returned customer orders.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setMessage("");
                        setShowCreate(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                    <Plus size={19} />
                    New Return
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <span>{message}</span>

                    <button
                        onClick={() => setMessage("")}
                        className="rounded-lg p-1 hover:bg-amber-100"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Search */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={19}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search return number, order number or customer..."
                            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-slate-400"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none"
                    >
                        <option value="">All Status</option>

                        {Object.entries(STATUS).map(
                            ([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            )
                        )}
                    </select>

                    <button
                        onClick={fetchReturns}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px]">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Return
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Sales Order
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Customer
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Warehouse
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Items
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Date
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-6 py-16 text-center text-slate-400"
                                    >
                                        Loading returns...
                                    </td>
                                </tr>
                            ) : filteredReturns.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-6 py-20 text-center"
                                    >
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                                            <ClipboardList size={28} />
                                        </div>

                                        <p className="mt-4 font-semibold text-slate-600">
                                            No returns found
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Returned orders will appear here.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredReturns.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-5">
                                            <p className="font-semibold text-slate-900">
                                                {item.returnNumber}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                #{item.id}
                                            </p>
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className="font-medium text-slate-700">
                                                {item.salesOrder?.orderNumber ||
                                                    "-"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5 text-slate-600">
                                            {item.salesOrder?.customer?.name ||
                                                "-"}
                                        </td>

                                        <td className="px-6 py-5">
                                            <p className="font-medium text-slate-700">
                                                {item.warehouse?.name || "-"}
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                {item.warehouse?.code || ""}
                                            </p>
                                        </td>

                                        <td className="px-6 py-5 text-slate-600">
                                            {item.items?.length || 0}
                                        </td>

                                        <td className="px-6 py-5">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                                                    item.status
                                                )}`}
                                            >
                                                {formatStatus(item.status)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5 text-sm text-slate-500">
                                            {formatDate(item.createdAt)}
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => openDetail(item)}
                                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ==================================================
          CREATE RETURN MODAL
      ================================================== */}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">
                                    Create Return
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Create a return from a delivered Sales Order.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowCreate(false)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateReturn}
                            className="max-h-[calc(90vh-145px)] overflow-y-auto"
                        >
                            <div className="space-y-6 p-6">
                                {/* Sales Order */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Delivered Sales Order
                                    </label>

                                    <select
                                        value={createForm.salesOrderId}
                                        onChange={(e) =>
                                            handleSelectOrder(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
                                    >
                                        <option value="">
                                            Select Sales Order
                                        </option>

                                        {deliveredOrders.map((order) => (
                                            <option
                                                key={order.id}
                                                value={order.id}
                                            >
                                                {order.orderNumber} —{" "}
                                                {order.customer?.name || "Customer"}
                                            </option>
                                        ))}
                                    </select>

                                    {deliveredOrders.length === 0 && (
                                        <p className="mt-2 text-sm text-amber-600">
                                            No DELIVERED Sales Orders available.
                                        </p>
                                    )}
                                </div>

                                {/* Order information */}
                                {selectedOrder && (
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase text-slate-400">
                                                    Customer
                                                </p>

                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {selectedOrder.customer?.name ||
                                                        "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase text-slate-400">
                                                    Warehouse
                                                </p>

                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {selectedOrder.warehouse?.name ||
                                                        "-"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase text-slate-400">
                                                    Order Number
                                                </p>

                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {selectedOrder.orderNumber}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Items */}
                                {createForm.items.length > 0 && (
                                    <div>
                                        <div className="mb-3">
                                            <h3 className="font-bold text-slate-900">
                                                Return Items
                                            </h3>

                                            <p className="text-sm text-slate-500">
                                                Enter the quantity being returned.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            {createForm.items.map(
                                                (item, index) => (
                                                    <div
                                                        key={item.salesOrderItemId}
                                                        className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_130px_130px]"
                                                    >
                                                        <div>
                                                            <p className="font-semibold text-slate-800">
                                                                {item.productName}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                SKU: {item.sku}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="mb-2 text-xs font-semibold text-slate-500">
                                                                Ordered
                                                            </p>

                                                            <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                                                                {item.orderedQuantity}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="mb-2 text-xs font-semibold text-slate-500">
                                                                Return Qty
                                                            </p>

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={item.orderedQuantity}
                                                                value={item.quantity}
                                                                onChange={(e) => {
                                                                    const value = Math.min(
                                                                        Math.max(
                                                                            Number(
                                                                                e.target.value
                                                                            ) || 0,
                                                                            0
                                                                        ),
                                                                        item.orderedQuantity
                                                                    );

                                                                    setCreateForm(
                                                                        (prev) => ({
                                                                            ...prev,
                                                                            items: prev.items.map(
                                                                                (
                                                                                    current,
                                                                                    currentIndex
                                                                                ) =>
                                                                                    currentIndex ===
                                                                                        index
                                                                                        ? {
                                                                                            ...current,
                                                                                            quantity:
                                                                                                value,
                                                                                        }
                                                                                        : current
                                                                            ),
                                                                        })
                                                                    );
                                                                }}
                                                                className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Reason */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Return Reason
                                    </label>

                                    <input
                                        value={createForm.reason}
                                        onChange={(e) =>
                                            setCreateForm((prev) => ({
                                                ...prev,
                                                reason: e.target.value,
                                            }))
                                        }
                                        placeholder="e.g. Wrong product, damaged packaging..."
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Notes
                                    </label>

                                    <textarea
                                        rows="3"
                                        value={createForm.notes}
                                        onChange={(e) =>
                                            setCreateForm((prev) => ({
                                                ...prev,
                                                notes: e.target.value,
                                            }))
                                        }
                                        placeholder="Additional information..."
                                        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Return"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================================================
          DETAIL MODAL
      ================================================== */}

            {showDetail && selectedReturn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-slate-950">
                                        {selectedReturn.returnNumber}
                                    </h2>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                                            selectedReturn.status
                                        )}`}
                                    >
                                        {formatStatus(
                                            selectedReturn.status
                                        )}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-slate-500">
                                    Sales Order:{" "}
                                    {selectedReturn.salesOrder
                                        ?.orderNumber || "-"}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowDetail(false)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <div className="max-h-[calc(90vh-145px)] overflow-y-auto p-6">
                            {/* Info */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase text-slate-400">
                                        Customer
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {selectedReturn.salesOrder
                                            ?.customer?.name || "-"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase text-slate-400">
                                        Warehouse
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {selectedReturn.warehouse?.name ||
                                            "-"}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase text-slate-400">
                                        Created
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">
                                        {formatDate(
                                            selectedReturn.createdAt
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Reason */}
                            {(selectedReturn.reason ||
                                selectedReturn.notes) && (
                                    <div className="mt-6 rounded-xl border border-slate-200 p-4">
                                        {selectedReturn.reason && (
                                            <div>
                                                <p className="text-xs font-semibold uppercase text-slate-400">
                                                    Reason
                                                </p>

                                                <p className="mt-1 text-slate-700">
                                                    {selectedReturn.reason}
                                                </p>
                                            </div>
                                        )}

                                        {selectedReturn.notes && (
                                            <div className="mt-4">
                                                <p className="text-xs font-semibold uppercase text-slate-400">
                                                    Notes
                                                </p>

                                                <p className="mt-1 text-slate-700">
                                                    {selectedReturn.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                            {/* Items */}
                            <div className="mt-6">
                                <h3 className="mb-3 font-bold text-slate-900">
                                    Return Items
                                </h3>

                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                                                    Product
                                                </th>

                                                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                                                    Qty
                                                </th>

                                                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                                                    Condition
                                                </th>

                                                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                                                    Restocked
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {selectedReturn.items.map(
                                                (item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-4">
                                                            <p className="font-semibold text-slate-800">
                                                                {item.product?.name ||
                                                                    "-"}
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                {item.product?.sku ||
                                                                    "-"}
                                                            </p>
                                                        </td>

                                                        <td className="px-4 py-4 font-semibold text-slate-700">
                                                            {item.quantity}
                                                        </td>

                                                        <td className="px-4 py-4">
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-bold ${item.condition ===
                                                                    "GOOD"
                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                    : "bg-red-50 text-red-700"
                                                                    }`}
                                                            >
                                                                {item.condition}
                                                            </span>
                                                        </td>

                                                        <td className="px-4 py-4 text-slate-600">
                                                            {item.restockedQuantity} /{" "}
                                                            {item.quantity}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex flex-wrap gap-3">
                                {selectedReturn.status ===
                                    "REQUESTED" && (
                                        <button
                                            onClick={handleReceive}
                                            disabled={saving}
                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            <PackageCheck size={18} />
                                            Receive Return
                                        </button>
                                    )}

                                {selectedReturn.status ===
                                    "RECEIVED" && (
                                        <button
                                            onClick={openInspection}
                                            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700"
                                        >
                                            <ClipboardList size={18} />
                                            Inspect
                                        </button>
                                    )}

                                {selectedReturn.status ===
                                    "INSPECTED" &&
                                    selectedReturn.items.some(
                                        (item) =>
                                            item.condition === "GOOD" &&
                                            item.restockedQuantity <
                                            item.quantity
                                    ) && (
                                        <button
                                            onClick={openRestock}
                                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
                                        >
                                            <ArrowDownToLine size={18} />
                                            Restock
                                        </button>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================
          INSPECTION MODAL
      ================================================== */}

            {showInspect && selectedReturn && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">
                                    Inspect Return
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Determine the condition of each returned item.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowInspect(false)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form onSubmit={handleInspection}>
                            <div className="max-h-[60vh] space-y-3 overflow-y-auto p-6">
                                {inspectionItems.map(
                                    (item, index) => (
                                        <div
                                            key={item.returnItemId}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {item.productName}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        {item.sku} · Qty{" "}
                                                        {item.quantity}
                                                    </p>
                                                </div>

                                                <select
                                                    value={item.condition}
                                                    onChange={(e) =>
                                                        setInspectionItems(
                                                            (prev) =>
                                                                prev.map(
                                                                    (
                                                                        current,
                                                                        currentIndex
                                                                    ) =>
                                                                        currentIndex ===
                                                                            index
                                                                            ? {
                                                                                ...current,
                                                                                condition:
                                                                                    e.target
                                                                                        .value,
                                                                            }
                                                                            : current
                                                                )
                                                        )
                                                    }
                                                    className="rounded-lg border border-slate-200 px-3 py-2 outline-none"
                                                >
                                                    <option value="GOOD">
                                                        GOOD
                                                    </option>

                                                    <option value="DAMAGED">
                                                        DAMAGED
                                                    </option>
                                                </select>
                                            </div>

                                            <input
                                                value={item.notes}
                                                onChange={(e) =>
                                                    setInspectionItems(
                                                        (prev) =>
                                                            prev.map(
                                                                (
                                                                    current,
                                                                    currentIndex
                                                                ) =>
                                                                    currentIndex ===
                                                                        index
                                                                        ? {
                                                                            ...current,
                                                                            notes:
                                                                                e.target
                                                                                    .value,
                                                                        }
                                                                        : current
                                                            )
                                                    )
                                                }
                                                placeholder="Inspection notes..."
                                                className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
                                            />
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowInspect(false)
                                    }
                                    className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                                >
                                    <Check size={18} />
                                    {saving
                                        ? "Saving..."
                                        : "Complete Inspection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================================================
          RESTOCK MODAL
      ================================================== */}

            {showRestock && selectedReturn && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950">
                                    Restock Return
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Put GOOD returned products back into inventory.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setShowRestock(false)
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form onSubmit={handleRestock}>
                            <div className="max-h-[60vh] space-y-3 overflow-y-auto p-6">
                                {restockItems.map(
                                    (item, index) => (
                                        <div
                                            key={item.returnItemId}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="mb-4">
                                                <p className="font-semibold text-slate-800">
                                                    {item.productName}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {item.sku} · Available to restock:{" "}
                                                    {item.maxQuantity}
                                                </p>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                                                        Quantity
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.maxQuantity}
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const value = Math.min(
                                                                Math.max(
                                                                    Number(
                                                                        e.target.value
                                                                    ) || 0,
                                                                    0
                                                                ),
                                                                item.maxQuantity
                                                            );

                                                            setRestockItems(
                                                                (prev) =>
                                                                    prev.map(
                                                                        (
                                                                            current,
                                                                            currentIndex
                                                                        ) =>
                                                                            currentIndex ===
                                                                                index
                                                                                ? {
                                                                                    ...current,
                                                                                    quantity:
                                                                                        value,
                                                                                }
                                                                                : current
                                                                    )
                                                            );
                                                        }}
                                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                                                        Location
                                                    </label>

                                                    <select
                                                        value={item.locationId}
                                                        onChange={(e) =>
                                                            setRestockItems(
                                                                (prev) =>
                                                                    prev.map(
                                                                        (
                                                                            current,
                                                                            currentIndex
                                                                        ) =>
                                                                            currentIndex ===
                                                                                index
                                                                                ? {
                                                                                    ...current,
                                                                                    locationId:
                                                                                        e.target
                                                                                            .value,
                                                                                }
                                                                                : current
                                                                    )
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-400"
                                                    >
                                                        <option value="">
                                                            Default / No Location
                                                        </option>

                                                        {locations.map(
                                                            (location) => (
                                                                <option
                                                                    key={location.id}
                                                                    value={location.id}
                                                                >
                                                                    {location.code} —{" "}
                                                                    {location.name}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}

                                {restockItems.length === 0 && (
                                    <div className="py-10 text-center text-slate-500">
                                        No GOOD items available for restock.
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowRestock(false)
                                    }
                                    className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving || restockItems.length === 0}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ArrowDownToLine size={18} />
                                    {saving
                                        ? "Processing..."
                                        : "Restock Items"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}