import { useEffect, useState } from "react";
import {
    Search,
    Package,
    ClipboardCheck,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    X,
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Inventory() {
    const { user } = useAuth();

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [showAdjustment, setShowAdjustment] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [form, setForm] = useState({
        actualQuantity: "",
        reason: "",
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const isAdmin = user?.role?.toLowerCase() === "admin";

    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/inventory", {
                params: {
                    search,
                    page: 1,
                    limit: 100,
                },
            });

            setInventory(response.data.data?.items || []);
        } catch (error) {
            console.error("Gagal mengambil inventory:", error);
            setError(
                error.response?.data?.message ||
                "Gagal memuat data inventory."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [search]);

    const openAdjustment = (item) => {
        setSelectedItem(item);
        setForm({
            actualQuantity: item.quantity,
            reason: "",
        });
        setMessage("");
        setShowAdjustment(true);
    };

    const closeAdjustment = () => {
        if (saving) return;

        setShowAdjustment(false);
        setSelectedItem(null);
        setForm({
            actualQuantity: "",
            reason: "",
        });
        setMessage("");
    };

    const handleAdjustment = async (e) => {
        e.preventDefault();

        if (!selectedItem) return;

        if (form.actualQuantity === "") {
            setMessage("Jumlah stok fisik wajib diisi.");
            return;
        }

        try {
            setSaving(true);
            setMessage("");

            const payload = {
                productId: selectedItem.productId,
                warehouseId: selectedItem.warehouseId,
                actualQuantity: Number(form.actualQuantity),
                reason: form.reason.trim() || "STOCK OPNAME",
            };

            if (selectedItem.locationId) {
                payload.locationId = selectedItem.locationId;
            }

            const response = await api.post("/inventory/adjust", payload);

            setMessage(response.data.message);

            await fetchInventory();

            setTimeout(() => {
                closeAdjustment();
            }, 900);
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Gagal melakukan stock opname."
            );
        } finally {
            setSaving(false);
        }
    };

    const getStockStatus = (item) => {
        if (item.quantity <= 0) {
            return {
                label: "Out of Stock",
                className: "bg-red-50 text-red-700 border-red-100",
            };
        }

        if (item.minStock > 0 && item.quantity < item.minStock) {
            return {
                label: "Low Stock",
                className: "bg-amber-50 text-amber-700 border-amber-100",
            };
        }

        return {
            label: "Healthy",
            className: "bg-emerald-50 text-emerald-700 border-emerald-100",
        };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                        Warehouse
                    </p>

                    <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                        Inventory
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Monitor stok dan lakukan stock opname.
                    </p>
                </div>

                <button
                    onClick={fetchInventory}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Search */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        placeholder="Search SKU atau nama produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                    Product
                                </th>

                                <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                    Warehouse
                                </th>

                                <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                    Location
                                </th>

                                <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                    Stock
                                </th>

                                <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                    Min Stock
                                </th>

                                <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                                    Status
                                </th>

                                {isAdmin && (
                                    <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                                        Action
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={isAdmin ? 7 : 6}
                                        className="px-5 py-12 text-center"
                                    >
                                        <RefreshCw
                                            size={22}
                                            className="mx-auto animate-spin text-blue-500"
                                        />

                                        <p className="mt-3 text-sm font-medium text-slate-500">
                                            Loading inventory...
                                        </p>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan={isAdmin ? 7 : 6}
                                        className="px-5 py-12 text-center"
                                    >
                                        <p className="font-bold text-red-600">
                                            Inventory gagal dimuat
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {error}
                                        </p>

                                        <button
                                            onClick={fetchInventory}
                                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                                        >
                                            <RefreshCw size={15} />
                                            Coba Lagi
                                        </button>
                                    </td>
                                </tr>
                            ) : inventory.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={isAdmin ? 7 : 6}
                                        className="px-5 py-12 text-center"
                                    >
                                        <Package
                                            size={36}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 font-bold text-slate-600">
                                            Inventory tidak ditemukan
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            Belum ada stok yang tersedia.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((item) => {
                                    const status = getStockStatus(item);

                                    return (
                                        <tr
                                            key={item.id}
                                            className="transition hover:bg-slate-50/70"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                                                        <Package size={18} />
                                                    </div>

                                                    <div>
                                                        <p className="font-bold text-slate-900">
                                                            {item.product?.name || "-"}
                                                        </p>

                                                        <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                                            {item.product?.sku || "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-700">
                                                    {item.warehouse?.name || "-"}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {item.warehouse?.code || "-"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-700">
                                                    {item.location?.code || "No Location"}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {item.location?.name || "-"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="text-lg font-black text-slate-900">
                                                    {item.quantity}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-slate-600">
                                                    {item.product?.minStock ?? 0}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </td>

                                            {isAdmin && (
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() => openAdjustment(item)}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
                                                    >
                                                        <ClipboardCheck size={15} />
                                                        Stock Opname
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Adjustment Modal */}
            {showAdjustment && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
                        {/* Modal header */}
                        <div className="flex items-start justify-between border-b border-slate-100 p-6">
                            <div>
                                <div className="mb-2 flex items-center gap-2 text-blue-600">
                                    <ClipboardCheck size={20} />

                                    <span className="text-xs font-black uppercase tracking-wider">
                                        Stock Opname
                                    </span>
                                </div>

                                <h2 className="text-xl font-black text-slate-900">
                                    Adjust Inventory
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Sesuaikan stok sistem dengan hasil fisik.
                                </p>
                            </div>

                            <button
                                onClick={closeAdjustment}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAdjustment} className="space-y-5 p-6">
                            {/* Product info */}
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Product
                                </p>

                                <p className="mt-1 font-black text-slate-900">
                                    {selectedItem.product?.name}
                                </p>

                                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                    {selectedItem.product?.sku}
                                </p>
                            </div>

                            {/* Current stock */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-slate-200 p-4">
                                    <p className="text-xs font-bold text-slate-400">
                                        System Stock
                                    </p>

                                    <div className="mt-2 flex items-center gap-2">
                                        <ArrowUp size={16} className="text-blue-500" />

                                        <span className="text-2xl font-black text-slate-900">
                                            {selectedItem.quantity}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                    <p className="text-xs font-bold text-blue-500">
                                        Physical Stock
                                    </p>

                                    <div className="mt-2 flex items-center gap-2">
                                        <ArrowDown size={16} className="text-blue-600" />

                                        <input
                                            type="number"
                                            min="0"
                                            value={form.actualQuantity}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    actualQuantity: e.target.value,
                                                })
                                            }
                                            className="w-full bg-transparent text-2xl font-black text-blue-700 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                    Reason
                                    <span className="ml-1 font-normal text-slate-400">
                                        (optional)
                                    </span>
                                </label>

                                <textarea
                                    rows="3"
                                    value={form.reason}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            reason: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Hasil stock opname September 2026"
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                                />
                            </div>

                            {/* Message */}
                            {message && (
                                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                                    {message}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeAdjustment}
                                    disabled={saving}
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Confirm Adjustment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}