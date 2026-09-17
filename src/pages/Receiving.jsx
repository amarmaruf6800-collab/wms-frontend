import { useEffect, useState } from "react";
import {
    ArrowDownToLine,
    Boxes,
    Warehouse,
    MapPin,
    FileText,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import api from "../utils/api";

export default function Receiving() {
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [locations, setLocations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [form, setForm] = useState({
        productId: "",
        warehouseId: "",
        locationId: "",
        quantity: "",
        reference: "",
    });

    // =========================================================
    // LOAD MASTER DATA
    // =========================================================

    const fetchMasterData = async () => {
        try {
            setLoading(true);

            const [productsResponse, warehousesResponse] =
                await Promise.all([
                    api.get("/products", {
                        params: {
                            active: true,
                            limit: 100,
                        },
                    }),

                    api.get("/warehouses", {
                        params: {
                            active: true,
                            limit: 100,
                        },
                    }),
                ]);

            setProducts(
                productsResponse.data.data?.items || []
            );

            setWarehouses(
                warehousesResponse.data.data?.items || []
            );
        } catch (error) {
            console.error(
                "Gagal mengambil master data:",
                error
            );

            showMessage(
                error.response?.data?.message ||
                "Gagal memuat data products dan warehouses.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD LOCATIONS
    // =========================================================

    const fetchLocations = async (warehouseId) => {
        if (!warehouseId) {
            setLocations([]);
            return;
        }

        try {
            setLoadingLocations(true);

            const response = await api.get("/locations", {
                params: {
                    warehouseId,
                    active: true,
                    limit: 100,
                },
            });

            setLocations(
                response.data.data?.items || []
            );
        } catch (error) {
            console.error(
                "Gagal mengambil locations:",
                error
            );

            setLocations([]);

            showMessage(
                error.response?.data?.message ||
                "Gagal memuat locations.",
                "error"
            );
        } finally {
            setLoadingLocations(false);
        }
    };

    useEffect(() => {
        fetchMasterData();
    }, []);

    // =========================================================
    // MESSAGE
    // =========================================================

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
    };

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "warehouseId") {
            setForm((prev) => ({
                ...prev,
                warehouseId: value,
                locationId: "",
            }));

            fetchLocations(value);
        }
    };

    // =========================================================
    // SUBMIT RECEIVING
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setMessageType("");

        if (!form.productId) {
            showMessage(
                "Product wajib dipilih.",
                "error"
            );
            return;
        }

        if (!form.warehouseId) {
            showMessage(
                "Warehouse wajib dipilih.",
                "error"
            );
            return;
        }

        if (!form.quantity || Number(form.quantity) <= 0) {
            showMessage(
                "Quantity harus lebih dari 0.",
                "error"
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                productId: Number(form.productId),
                warehouseId: Number(form.warehouseId),
                quantity: Number(form.quantity),
            };

            if (form.locationId) {
                payload.locationId = Number(
                    form.locationId
                );
            }

            if (form.reference.trim()) {
                payload.reference =
                    form.reference.trim();
            }

            const response = await api.post(
                "/inventory/receive",
                payload
            );

            showMessage(
                response.data.message ||
                "Barang berhasil diterima.",
                "success"
            );

            // Reset quantity/reference saja.
            // Product dan warehouse tetap dipertahankan
            // agar receiving berikutnya lebih cepat.
            setForm((prev) => ({
                ...prev,
                quantity: "",
                reference: "",
            }));
        } catch (error) {
            console.error(
                "Gagal melakukan receiving:",
                error
            );

            showMessage(
                error.response?.data?.message ||
                "Gagal melakukan receiving.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // RESET
    // =========================================================

    const resetForm = () => {
        setForm({
            productId: "",
            warehouseId: "",
            locationId: "",
            quantity: "",
            reference: "",
        });

        setLocations([]);

        setMessage("");
        setMessageType("");
    };

    // =========================================================
    // SELECTED DATA
    // =========================================================

    const selectedProduct = products.find(
        (product) =>
            String(product.id) ===
            String(form.productId)
    );

    const selectedWarehouse = warehouses.find(
        (warehouse) =>
            String(warehouse.id) ===
            String(form.warehouseId)
    );

    const selectedLocation = locations.find(
        (location) =>
            String(location.id) ===
            String(form.locationId)
    );

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="space-y-6">

            {/* =====================================================
          HEADER
      ===================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                            <ArrowDownToLine
                                size={22}
                                className="text-emerald-600"
                            />
                        </div>

                        <div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Receiving
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Receive incoming stock into your warehouse.
                            </p>

                        </div>

                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        fetchMasterData();

                        if (form.warehouseId) {
                            fetchLocations(
                                form.warehouseId
                            );
                        }
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                    <RefreshCw size={18} />
                    Refresh
                </button>

            </div>

            {/* =====================================================
          MESSAGE
      ===================================================== */}

            {message && (
                <div
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${messageType === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-red-200 bg-red-50 text-red-800"
                        }`}
                >

                    {messageType === "success" ? (
                        <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0"
                        />
                    ) : (
                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                        />
                    )}

                    <span>{message}</span>

                </div>
            )}

            {/* =====================================================
          MAIN GRID
      ===================================================== */}

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

                {/* ===================================================
            FORM
        =================================================== */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5">

                        <h2 className="text-lg font-bold text-slate-900">
                            Receive Stock
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Record incoming goods and update warehouse inventory.
                        </p>

                    </div>

                    {loading ? (

                        <div className="flex min-h-[400px] items-center justify-center">

                            <div className="flex flex-col items-center gap-3 text-slate-400">

                                <RefreshCw
                                    size={25}
                                    className="animate-spin"
                                />

                                <span className="text-sm">
                                    Loading master data...
                                </span>

                            </div>

                        </div>

                    ) : (

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 p-6"
                        >

                            {/* PRODUCT */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Product
                                </label>

                                <div className="relative">

                                    <Boxes
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <select
                                        name="productId"
                                        value={form.productId}
                                        onChange={handleChange}
                                        required
                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                                    >

                                        <option value="">
                                            Select product
                                        </option>

                                        {products.map(
                                            (product) => (
                                                <option
                                                    key={product.id}
                                                    value={product.id}
                                                >
                                                    {product.sku} —{" "}
                                                    {product.name}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                            {/* WAREHOUSE */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Warehouse
                                </label>

                                <div className="relative">

                                    <Warehouse
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <select
                                        name="warehouseId"
                                        value={form.warehouseId}
                                        onChange={handleChange}
                                        required
                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                                    >

                                        <option value="">
                                            Select warehouse
                                        </option>

                                        {warehouses.map(
                                            (warehouse) => (
                                                <option
                                                    key={warehouse.id}
                                                    value={warehouse.id}
                                                >
                                                    {warehouse.code} —{" "}
                                                    {warehouse.name}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                            {/* LOCATION */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">

                                    Location

                                    <span className="ml-1 font-normal text-slate-400">
                                        (optional)
                                    </span>

                                </label>

                                <div className="relative">

                                    <MapPin
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <select
                                        name="locationId"
                                        value={form.locationId}
                                        onChange={handleChange}
                                        disabled={
                                            !form.warehouseId ||
                                            loadingLocations
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                    >

                                        <option value="">
                                            {loadingLocations
                                                ? "Loading locations..."
                                                : !form.warehouseId
                                                    ? "Select warehouse first"
                                                    : locations.length === 0
                                                        ? "No locations available"
                                                        : "Warehouse level / no location"}
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

                                {form.warehouseId &&
                                    locations.length === 0 &&
                                    !loadingLocations && (
                                        <p className="mt-2 text-xs text-amber-600">
                                            No active location is available for this warehouse. Stock will be recorded at warehouse level.
                                        </p>
                                    )}

                            </div>

                            {/* QUANTITY */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    step="1"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter received quantity"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                                />

                            </div>

                            {/* REFERENCE */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">

                                    Reference

                                    <span className="ml-1 font-normal text-slate-400">
                                        (optional)
                                    </span>

                                </label>

                                <div className="relative">

                                    <FileText
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        name="reference"
                                        value={form.reference}
                                        onChange={handleChange}
                                        placeholder="e.g. PO-2026-001"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
                                    />

                                </div>

                            </div>

                            {/* BUTTONS */}

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Clear
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {saving ? (
                                        <>
                                            <RefreshCw
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownToLine size={17} />
                                            Receive Stock
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    )}

                </div>

                {/* ===================================================
            SUMMARY
        =================================================== */}

                <div className="space-y-4">

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                            Receiving Summary
                        </h3>

                        <div className="mt-5 space-y-5">

                            {/* PRODUCT */}

                            <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                    <Boxes
                                        size={18}
                                        className="text-slate-600"
                                    />
                                </div>

                                <div className="min-w-0">

                                    <p className="text-xs text-slate-400">
                                        Product
                                    </p>

                                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                        {selectedProduct?.name ||
                                            "Not selected"}
                                    </p>

                                    {selectedProduct && (
                                        <p className="mt-0.5 font-mono text-xs text-slate-400">
                                            {selectedProduct.sku}
                                        </p>
                                    )}

                                </div>

                            </div>

                            {/* WAREHOUSE */}

                            <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                    <Warehouse
                                        size={18}
                                        className="text-slate-600"
                                    />
                                </div>

                                <div className="min-w-0">

                                    <p className="text-xs text-slate-400">
                                        Warehouse
                                    </p>

                                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                        {selectedWarehouse?.name ||
                                            "Not selected"}
                                    </p>

                                    {selectedWarehouse && (
                                        <p className="mt-0.5 font-mono text-xs text-slate-400">
                                            {selectedWarehouse.code}
                                        </p>
                                    )}

                                </div>

                            </div>

                            {/* LOCATION */}

                            <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                    <MapPin
                                        size={18}
                                        className="text-slate-600"
                                    />
                                </div>

                                <div className="min-w-0">

                                    <p className="text-xs text-slate-400">
                                        Location
                                    </p>

                                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                        {selectedLocation?.name ||
                                            "Warehouse level"}
                                    </p>

                                    {selectedLocation && (
                                        <p className="mt-0.5 font-mono text-xs text-slate-400">
                                            {selectedLocation.code}
                                        </p>
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* QUANTITY CARD */}

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">

                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                            Receiving Quantity
                        </p>

                        <div className="mt-2 flex items-end gap-2">

                            <span className="text-4xl font-bold text-emerald-700">
                                {Number(form.quantity) > 0
                                    ? Number(form.quantity)
                                    : "0"}
                            </span>

                            <span className="mb-1 text-sm font-medium text-emerald-600">
                                units
                            </span>

                        </div>

                        <p className="mt-3 text-xs leading-5 text-emerald-700">
                            Once submitted, the quantity will be added to inventory and recorded as a RECEIVING stock movement.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}