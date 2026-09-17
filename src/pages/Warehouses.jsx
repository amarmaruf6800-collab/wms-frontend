import { useEffect, useState } from "react";
import {
    Warehouse,
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    X,
    MapPin,
    PackageOpen,
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/permissions";

export default function Warehouses() {
    const { user } = useAuth();
    const canManageWarehouses = isAdmin(user);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        code: "",
        name: "",
        location: "",
    });

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            setMessage("");

            const response = await api.get("/warehouses", {
                params: {
                    search: search.trim(),
                },
            });

            setWarehouses(response.data.data?.items || []);
        } catch (error) {
            console.error("Gagal mengambil warehouses:", error);

            setMessage(
                error.response?.data?.message ||
                "Gagal memuat data warehouse."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchWarehouses();
    };

    const openAddModal = () => {
        setEditingWarehouse(null);

        setForm({
            code: "",
            name: "",
            location: "",
        });

        setShowModal(true);
    };

    const openEditModal = (warehouse) => {
        setEditingWarehouse(warehouse);

        setForm({
            code: warehouse.code || "",
            name: warehouse.name || "",
            location: warehouse.location || "",
        });

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingWarehouse(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            const payload = {
                code: form.code.trim(),
                name: form.name.trim(),
                location: form.location.trim() || null,
            };

            if (editingWarehouse) {
                await api.put(
                    `/warehouses/${editingWarehouse.id}`,
                    payload
                );
            } else {
                await api.post("/warehouses", payload);
            }

            setShowModal(false);
            setEditingWarehouse(null);

            await fetchWarehouses();

            setMessage(
                editingWarehouse
                    ? "Warehouse berhasil diperbarui."
                    : "Warehouse berhasil ditambahkan."
            );
        } catch (error) {
            console.error("Gagal menyimpan warehouse:", error);

            setMessage(
                error.response?.data?.message ||
                "Gagal menyimpan warehouse."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Nonaktifkan warehouse ini?")) {
            return;
        }

        try {
            await api.delete(`/warehouses/${id}`);

            await fetchWarehouses();

            setMessage("Warehouse berhasil dinonaktifkan.");
        } catch (error) {
            console.error("Gagal menonaktifkan warehouse:", error);

            setMessage(
                error.response?.data?.message ||
                "Gagal menonaktifkan warehouse."
            );
        }
    };

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Warehouses
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage warehouse locations and facilities.
                    </p>
                </div>

                {canManageWarehouses && (
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                        <Plus size={18} />
                        Add Warehouse
                    </button>
                )}
            </div>

            {/* MESSAGE */}
            {message && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                    <span>{message}</span>

                    <button
                        onClick={() => setMessage("")}
                        className="text-slate-400 hover:text-slate-700"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* SEARCH */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-3 sm:flex-row"
                >
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search warehouse code or name..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                        />
                    </div>

                    <button
                        type="submit"
                        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Search
                    </button>

                    <button
                        type="button"
                        onClick={fetchWarehouses}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </form>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[800px]">

                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Warehouse
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Code
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Location
                                </th>

                                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Locations
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Status
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <RefreshCw
                                                size={24}
                                                className="animate-spin"
                                            />

                                            <span className="text-sm">
                                                Loading warehouses...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : warehouses.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                                                <Warehouse
                                                    size={22}
                                                    className="text-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-700">
                                                    No warehouses found
                                                </p>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    Try another search or add a warehouse.
                                                </p>
                                            </div>

                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                warehouses.map((warehouse) => (
                                    <tr
                                        key={warehouse.id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                                    <Warehouse
                                                        size={19}
                                                        className="text-slate-600"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {warehouse.name}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        Warehouse #{warehouse.id}
                                                    </p>
                                                </div>

                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600">
                                                {warehouse.code}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <MapPin
                                                    size={15}
                                                    className="text-slate-400"
                                                />

                                                {warehouse.location || "-"}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
                                                <PackageOpen
                                                    size={15}
                                                    className="text-slate-500"
                                                />

                                                <span className="text-sm font-semibold text-slate-700">
                                                    {warehouse._count?.locations ?? 0}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {warehouse.isActive ? (
                                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">

                                                {canManageWarehouses && (
                                                    <button
                                                        onClick={() =>
                                                            openEditModal(warehouse)
                                                        }
                                                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                )}

                                                {canManageWarehouses && warehouse.isActive && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(warehouse.id)
                                                        }
                                                        className="rounded-lg border border-red-100 p-2 text-red-500 transition hover:bg-red-50"
                                                        title="Deactivate"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

                {!loading && (
                    <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-slate-700">
                            {warehouses.length}
                        </span>{" "}
                        warehouses
                    </div>
                )}

            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingWarehouse
                                        ? "Edit Warehouse"
                                        : "Add Warehouse"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Warehouse master information
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Warehouse Code
                                </label>

                                <input
                                    name="code"
                                    value={form.code}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. WH-JKT-01"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Warehouse Name
                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Jakarta Main Warehouse"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Location
                                </label>

                                <input
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Jakarta, Indonesia"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingWarehouse
                                            ? "Save Changes"
                                            : "Add Warehouse"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}