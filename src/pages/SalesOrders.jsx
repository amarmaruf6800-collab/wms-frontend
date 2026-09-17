import { useEffect, useMemo, useState } from "react";
import {
    ClipboardList,
    Plus,
    RefreshCw,
    Search,
    X,
    Trash2,
    ChevronDown,
} from "lucide-react";
import api from "../utils/api";

const STATUS_STYLES = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    PICKING: "bg-amber-50 text-amber-700 border-amber-200",
    PACKED: "bg-purple-50 text-purple-700 border-purple-200",
    SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const NEXT_STATUS = {
    DRAFT: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PICKING", "CANCELLED"],
    PICKING: ["PACKED"],
    PACKED: ["SHIPPED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
};

const emptyForm = {
    customerId: "",
    warehouseId: "",
    shippingAddress: "",
    notes: "",
};

export default function SalesOrders() {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState(emptyForm);

    const [items, setItems] = useState([
        {
            productId: "",
            quantity: 1,
            unitPrice: 0,
        },
    ]);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const response = await api.get("/sales-orders", {
                params: {
                    search: search.trim() || undefined,
                    status: statusFilter || undefined,
                    page: 1,
                    limit: 100,
                },
            });

            setOrders(response.data.data?.items || []);
        } catch (error) {
            console.error("Gagal mengambil sales orders:", error);

            setMessage(
                error.response?.data?.message ||
                "Gagal memuat Sales Order."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchFormData = async () => {
        try {
            const [customerRes, warehouseRes, productRes] =
                await Promise.all([
                    api.get("/customers", {
                        params: {
                            active: true,
                            page: 1,
                            limit: 100,
                        },
                    }),
                    api.get("/warehouses", {
                        params: {
                            active: true,
                            page: 1,
                            limit: 100,
                        },
                    }),
                    api.get("/products", {
                        params: {
                            active: true,
                            page: 1,
                            limit: 100,
                        },
                    }),
                ]);

            setCustomers(
                customerRes.data.data?.items ||
                customerRes.data.data ||
                []
            );

            setWarehouses(
                warehouseRes.data.data?.items ||
                warehouseRes.data.data ||
                []
            );

            setProducts(
                productRes.data.data?.items ||
                productRes.data.data ||
                []
            );
        } catch (error) {
            console.error(
                "Gagal mengambil data form Sales Order:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Gagal memuat customer, warehouse, atau product."
            );
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [search, statusFilter]);

    useEffect(() => {
        fetchFormData();
    }, []);

    const openCreateModal = () => {
        setForm(emptyForm);

        setItems([
            {
                productId: "",
                quantity: 1,
                unitPrice: 0,
            },
        ]);

        setMessage("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProductChange = (index, productId) => {
        const selectedProduct = products.find(
            (product) => product.id === Number(productId)
        );

        setItems((prev) =>
            prev.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        productId,
                        unitPrice: selectedProduct
                            ? Number(selectedProduct.price || 0)
                            : 0,
                    }
                    : item
            )
        );
    };

    const handleItemChange = (index, field, value) => {
        setItems((prev) =>
            prev.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            )
        );
    };

    const addItem = () => {
        setItems((prev) => [
            ...prev,
            {
                productId: "",
                quantity: 1,
                unitPrice: 0,
            },
        ]);
    };

    const removeItem = (index) => {
        if (items.length === 1) return;

        setItems((prev) =>
            prev.filter((_, itemIndex) => itemIndex !== index)
        );
    };

    const totalAmount = useMemo(() => {
        return items.reduce((total, item) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;

            return total + quantity * price;
        }, 0);
    }, [items]);

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!form.customerId || !form.warehouseId) {
            setMessage("Customer dan warehouse wajib dipilih.");
            return;
        }

        const validItems = items.filter(
            (item) => item.productId
        );

        if (validItems.length === 0) {
            setMessage("Minimal tambahkan satu product.");
            return;
        }

        const payload = {
            customerId: Number(form.customerId),
            warehouseId: Number(form.warehouseId),
            shippingAddress:
                form.shippingAddress.trim() || undefined,
            notes: form.notes.trim() || undefined,
            items: validItems.map((item) => ({
                productId: Number(item.productId),
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
            })),
        };

        try {
            setSaving(true);
            setMessage("");

            await api.post("/sales-orders", payload);

            setShowModal(false);
            setForm(emptyForm);

            setItems([
                {
                    productId: "",
                    quantity: 1,
                    unitPrice: 0,
                },
            ]);

            setMessage("Sales Order berhasil dibuat.");

            await fetchOrders();
        } catch (error) {
            console.error(
                "Gagal membuat Sales Order:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Gagal membuat Sales Order."
            );
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (orderId, status) => {
        try {
            await api.patch(
                `/sales-orders/${orderId}/status`,
                { status }
            );

            setMessage(
                `Status Sales Order berhasil diubah menjadi ${status}.`
            );

            await fetchOrders();
        } catch (error) {
            console.error(
                "Gagal mengubah status Sales Order:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Gagal mengubah status Sales Order."
            );
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(value) || 0);
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                            <ClipboardList size={21} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Sales Orders
                            </h1>

                            <p className="text-sm text-slate-500">
                                Manage customer orders and outbound workflow.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                    <Plus size={17} />
                    New Sales Order
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

            {/* FILTER */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative flex-1">
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

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-slate-400"
                    >
                        <option value="">All Status</option>

                        {Object.keys(NEXT_STATUS)
                            .concat(["CANCELLED"])
                            .filter(
                                (value, index, array) =>
                                    array.indexOf(value) === index
                            )
                            .map((status) => (
                                <option
                                    key={status}
                                    value={status}
                                >
                                    {status}
                                </option>
                            ))}
                    </select>

                    <button
                        onClick={fetchOrders}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px]">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Order
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Customer
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Warehouse
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Items
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Total
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-6 py-12 text-center text-sm text-slate-400"
                                    >
                                        Loading Sales Orders...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-6 py-12 text-center"
                                    >
                                        <ClipboardList
                                            size={32}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 text-sm font-semibold text-slate-500">
                                            No Sales Orders found
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const nextStatuses =
                                        NEXT_STATUS[
                                        order.status
                                        ] || [];

                                    return (
                                        <tr
                                            key={order.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">
                                                    {
                                                        order.orderNumber
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {formatDate(
                                                        order.orderDate
                                                    )}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-700">
                                                    {
                                                        order.customer
                                                            ?.name
                                                    }
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {
                                                        order.customer
                                                            ?.phone
                                                    }
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-700">
                                                    {
                                                        order.warehouse
                                                            ?.name
                                                    }
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {
                                                        order.warehouse
                                                            ?.code
                                                    }
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {order.items?.length ||
                                                    0}{" "}
                                                product
                                                {order.items?.length ===
                                                    1
                                                    ? ""
                                                    : "s"}
                                            </td>

                                            <td className="px-6 py-4 font-semibold text-slate-700">
                                                {formatCurrency(
                                                    order.totalAmount
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[
                                                        order.status
                                                        ] ||
                                                        STATUS_STYLES.DRAFT
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                {nextStatuses.length >
                                                    0 ? (
                                                    <div className="relative inline-block">
                                                        <select
                                                            defaultValue=""
                                                            onChange={(
                                                                e
                                                            ) => {
                                                                if (
                                                                    e
                                                                        .target
                                                                        .value
                                                                ) {
                                                                    updateStatus(
                                                                        order.id,
                                                                        e
                                                                            .target
                                                                            .value
                                                                    );

                                                                    e.target.value =
                                                                        "";
                                                                }
                                                            }}
                                                            className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-600 outline-none hover:bg-slate-50"
                                                        >
                                                            <option value="">
                                                                Update
                                                            </option>

                                                            {nextStatuses.map(
                                                                (
                                                                    status
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            status
                                                                        }
                                                                        value={
                                                                            status
                                                                        }
                                                                    >
                                                                        {
                                                                            status
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>

                                                        <ChevronDown
                                                            size={
                                                                14
                                                            }
                                                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
                        {/* MODAL HEADER */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Create Sales Order
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Create a new outbound customer order.
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="space-y-6 p-6">
                                {/* CUSTOMER / WAREHOUSE */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Customer
                                        </label>

                                        <select
                                            name="customerId"
                                            value={
                                                form.customerId
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            required
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                        >
                                            <option value="">
                                                Select customer
                                            </option>

                                            {customers.map(
                                                (customer) => (
                                                    <option
                                                        key={
                                                            customer.id
                                                        }
                                                        value={
                                                            customer.id
                                                        }
                                                    >
                                                        {
                                                            customer.name
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Fulfillment Warehouse
                                        </label>

                                        <select
                                            name="warehouseId"
                                            value={
                                                form.warehouseId
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            required
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                        >
                                            <option value="">
                                                Select warehouse
                                            </option>

                                            {warehouses.map(
                                                (warehouse) => (
                                                    <option
                                                        key={
                                                            warehouse.id
                                                        }
                                                        value={
                                                            warehouse.id
                                                        }
                                                    >
                                                        {
                                                            warehouse.name
                                                        }{" "}
                                                        (
                                                        {
                                                            warehouse.code
                                                        }
                                                        )
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {/* ADDRESS */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Shipping Address
                                    </label>

                                    <textarea
                                        name="shippingAddress"
                                        value={
                                            form.shippingAddress
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        rows="2"
                                        placeholder="Customer shipping address..."
                                        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                    />
                                </div>

                                {/* PRODUCTS */}
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Order Items
                                            </h3>

                                            <p className="text-xs text-slate-400">
                                                Add products and quantities.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                        >
                                            <Plus size={14} />
                                            Add Product
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {items.map(
                                            (item, index) => (
                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_120px_150px_42px]"
                                                >
                                                    <div>
                                                        <label className="mb-1 block text-xs font-semibold text-slate-500">
                                                            Product
                                                        </label>

                                                        <select
                                                            value={
                                                                item.productId
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleProductChange(
                                                                    index,
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            required
                                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                                                        >
                                                            <option value="">
                                                                Select product
                                                            </option>

                                                            {products.map(
                                                                (
                                                                    product
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        value={
                                                                            product.id
                                                                        }
                                                                    >
                                                                        {
                                                                            product.sku
                                                                        }{" "}
                                                                        —{" "}
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs font-semibold text-slate-500">
                                                            Quantity
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleItemChange(
                                                                    index,
                                                                    "quantity",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            required
                                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-1 block text-xs font-semibold text-slate-500">
                                                            Unit Price
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                item.unitPrice
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleItemChange(
                                                                    index,
                                                                    "unitPrice",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            required
                                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                                                        />
                                                    </div>

                                                    <div className="flex items-end justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeItem(
                                                                    index
                                                                )
                                                            }
                                                            disabled={
                                                                items.length ===
                                                                1
                                                            }
                                                            className="mb-0.5 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            <Trash2
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* NOTES */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Notes
                                    </label>

                                    <textarea
                                        name="notes"
                                        value={form.notes}
                                        onChange={
                                            handleFormChange
                                        }
                                        rows="2"
                                        placeholder="Optional order notes..."
                                        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                                    />
                                </div>

                                {/* TOTAL */}
                                <div className="flex items-center justify-between rounded-xl bg-slate-900 px-5 py-4 text-white">
                                    <span className="text-sm font-semibold text-slate-300">
                                        Order Total
                                    </span>

                                    <span className="text-xl font-bold">
                                        {formatCurrency(
                                            totalAmount
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Sales Order"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}