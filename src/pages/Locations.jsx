import { useEffect, useState } from "react";
import {
    MapPin,
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    X,
    Warehouse,
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/permissions";

export default function Locations() {
    const { user } = useAuth();
    const canManageLocations = isAdmin(user);
    const [locations, setLocations] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingWarehouses, setLoadingWarehouses] = useState(true);

    const [search, setSearch] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        warehouseId: "",
        code: "",
        name: "",
    });

    // =========================================================
    // GET WAREHOUSES
    // =========================================================

    const fetchWarehouses = async () => {
        try {
            setLoadingWarehouses(true);

            const response = await api.get("/warehouses", {
                params: {
                    active: true,
                    limit: 100,
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
            setLoadingWarehouses(false);
        }
    };

    // =========================================================
    // GET LOCATIONS
    // =========================================================

    const fetchLocations = async () => {
        try {
            setLoading(true);

            const params = {
                limit: 100,
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (warehouseFilter) {
                params.warehouseId = warehouseFilter;
            }

            const response = await api.get("/locations", {
                params,
            });

            setLocations(response.data.data?.items || []);
        } catch (error) {
            console.error("Gagal mengambil locations:", error);

            setMessage(
                error.response?.data?.message ||
                "Gagal memuat data locations."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
        fetchLocations();
    }, []);

    // =========================================================
    // SEARCH
    // =========================================================

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLocations();
    };

    // =========================================================
    // MODAL
    // =========================================================

    const openAddModal = () => {
        setEditingLocation(null);

        setForm({
            warehouseId: warehouseFilter || "",
            code: "",
            name: "",
        });

        setShowModal(true);
    };

    const openEditModal = (location) => {
        setEditingLocation(location);

        setForm({
            warehouseId: location.warehouseId || "",
            code: location.code || "",
            name: location.name || "",
        });

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingLocation(null);
    };

    // =========================================================
    // FORM
    // =========================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");

            if (!form.warehouseId) {
                setMessage("Warehouse wajib dipilih.");
                setSaving(false);
                return;
            }

            const payload = {
                warehouseId: Number(form.warehouseId),
                code: form.code.trim(),
                name: form.name.trim(),
            };

            if (editingLocation) {
                await api.put(
                    `/locations/${editingLocation.id}`,
                    {
                        code: payload.code,
                        name: payload.name,
                    }
                );
            } else {
                await api.post("/locations", payload);
            }

            setShowModal(false);
            setEditingLocation(null);

            await fetchLocations();

            setMessage(
                editingLocation
                    ? "Location berhasil diperbarui."
                    : "Location berhasil ditambahkan."
            );
        } catch (error) {
            console.error("Gagal menyimpan location:", error);

            setMessage(
                error.response?.data?.message ||
                "Gagal menyimpan location."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // DELETE / DEACTIVATE
    // =========================================================

    const handleDelete = async (id) => {
        if (!window.confirm("Nonaktifkan location ini?")) {
            return;
        }

        try {
            await api.delete(`/locations/${id}`);

            await fetchLocations();

            setMessage("Location berhasil dinonaktifkan.");
        } catch (error) {
            console.error(
                "Gagal menonaktifkan location:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Gagal menonaktifkan location."
            );
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Locations
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage warehouse storage locations and bins.
                    </p>
                </div>

                {canManageLocations && (
                    <button
                        onClick={openAddModal}
                        disabled={warehouses.length === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus size={18} />
                        Add Location
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

            {/* FILTER */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-3 lg:flex-row"
                >

                    {/* SEARCH */}
                    <div className="relative flex-1">

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
                            placeholder="Search location code or name..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                        />

                    </div>

                    {/* WAREHOUSE FILTER */}
                    <select
                        value={warehouseFilter}
                        onChange={(e) => {
                            setWarehouseFilter(e.target.value);

                            setTimeout(() => {
                                fetchLocations();
                            }, 0);
                        }}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-slate-400 focus:bg-white"
                    >

                        <option value="">
                            All Warehouses
                        </option>

                        {warehouses.map((warehouse) => (
                            <option
                                key={warehouse.id}
                                value={warehouse.id}
                            >
                                {warehouse.code} — {warehouse.name}
                            </option>
                        ))}

                    </select>

                    {/* SEARCH BUTTON */}
                    <button
                        type="submit"
                        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Search
                    </button>

                    {/* REFRESH */}
                    <button
                        type="button"
                        onClick={() => {
                            fetchWarehouses();
                            fetchLocations();
                        }}
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

                    <table className="w-full min-w-[850px]">

                        <thead className="border-b border-slate-200 bg-slate-50">

                            <tr>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Location
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Code
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Warehouse
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
                                        colSpan="5"
                                        className="px-6 py-16 text-center"
                                    >

                                        <div className="flex flex-col items-center gap-3 text-slate-400">

                                            <RefreshCw
                                                size={24}
                                                className="animate-spin"
                                            />

                                            <span className="text-sm">
                                                Loading locations...
                                            </span>

                                        </div>

                                    </td>

                                </tr>

                            ) : locations.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="px-6 py-16 text-center"
                                    >

                                        <div className="flex flex-col items-center gap-3">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">

                                                <MapPin
                                                    size={22}
                                                    className="text-slate-400"
                                                />

                                            </div>

                                            <div>

                                                <p className="font-semibold text-slate-700">
                                                    No locations found
                                                </p>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    Try another search or add a location.
                                                </p>

                                            </div>

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                locations.map((location) => (

                                    <tr
                                        key={location.id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        {/* LOCATION */}
                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

                                                    <MapPin
                                                        size={19}
                                                        className="text-slate-600"
                                                    />

                                                </div>

                                                <div>

                                                    <p className="font-semibold text-slate-900">
                                                        {location.name}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        Location #{location.id}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* CODE */}
                                        <td className="px-6 py-4">

                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600">
                                                {location.code}
                                            </span>

                                        </td>

                                        {/* WAREHOUSE */}
                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-2">

                                                <Warehouse
                                                    size={16}
                                                    className="text-slate-400"
                                                />

                                                <div>

                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {location.warehouse?.name || "-"}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        {location.warehouse?.code || "-"}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">

                                            {location.isActive ? (

                                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                                    Active
                                                </span>

                                            ) : (

                                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                                    Inactive
                                                </span>

                                            )}

                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-6 py-4">

                                            <div className="flex justify-end gap-2">

                                                {canManageLocations && (
                                                    <button
                                                        onClick={() =>
                                                            openEditModal(location)
                                                        }
                                                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                )}

                                                {canManageLocations && location.isActive && (

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(location.id)
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
                            {locations.length}
                        </span>{" "}

                        locations

                    </div>

                )}

            </div>

            {/* MODAL */}
            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div>

                                <h2 className="text-lg font-bold text-slate-900">
                                    {editingLocation
                                        ? "Edit Location"
                                        : "Add Location"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Warehouse storage location
                                </p>

                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >

                            {/* WAREHOUSE */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Warehouse
                                </label>

                                <select
                                    name="warehouseId"
                                    value={form.warehouseId}
                                    onChange={handleChange}
                                    required
                                    disabled={!!editingLocation || loadingWarehouses}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    <option value="">
                                        Select warehouse
                                    </option>

                                    {warehouses.map((warehouse) => (

                                        <option
                                            key={warehouse.id}
                                            value={warehouse.id}
                                        >
                                            {warehouse.code} — {warehouse.name}
                                        </option>

                                    ))}

                                </select>

                            </div>

                            {/* CODE */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Location Code
                                </label>

                                <input
                                    name="code"
                                    value={form.code}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. A-01-01"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                                />

                            </div>

                            {/* NAME */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Location Name
                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Rack A1 Level 1"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                                />

                            </div>

                            {/* BUTTONS */}
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
                                        : editingLocation
                                            ? "Save Changes"
                                            : "Add Location"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}