import { useEffect, useState } from "react";
import {
    Package,
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    X,
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/permissions";

export default function Products() {
    const { user } = useAuth();
    const canManageProducts = isAdmin(user);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        sku: "",
        name: "",
        description: "",
        minStock: 0,
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const response = await api.get("/products");

            setProducts(
                response.data.data?.items ||
                []
            );
        } catch (error) {
            console.error("Gagal mengambil products:", error);

            setMessage(
                error.response?.data?.message ||
                "Gagal memuat data products."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const openAddModal = () => {
        setEditingProduct(null);

        setForm({
            sku: "",
            name: "",
            description: "",
            minStock: 0,
        });

        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);

        setForm({
            sku: product.sku || "",
            name: product.name || "",
            description: product.description || "",
            minStock: product.minStock ?? 0,
        });

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingProduct(null);
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
                sku: form.sku,
                name: form.name,
                description: form.description,
                minStock: Number(form.minStock),
            };

            if (editingProduct) {
                await api.put(
                    `/products/${editingProduct.id}`,
                    payload
                );
            } else {
                await api.post("/products", payload);
            }

            setShowModal(false);
            setEditingProduct(null);

            await fetchProducts();

            setMessage(
                editingProduct
                    ? "Product berhasil diperbarui."
                    : "Product berhasil ditambahkan."
            );
        } catch (error) {
            console.error("Gagal menyimpan product:", error);

            setMessage(
                error.response?.data?.message ||
                "Gagal menyimpan product."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Nonaktifkan product ini?")) {
            return;
        }

        try {
            await api.delete(`/products/${id}`);

            await fetchProducts();

            setMessage("Product berhasil dinonaktifkan.");
        } catch (error) {
            console.error("Gagal menonaktifkan product:", error);

            setMessage(
                error.response?.data?.message ||
                "Gagal menonaktifkan product."
            );
        }
    };

    const filteredProducts = products.filter((product) => {
        const keyword = search.toLowerCase();

        return (
            product.name?.toLowerCase().includes(keyword) ||
            product.sku?.toLowerCase().includes(keyword)
        );
    });

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Products
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage product master data and SKU.
                    </p>
                </div>

                {canManageProducts && (
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                        <Plus size={18} />
                        Add Product
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

            {/* TOOLBAR */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="relative w-full sm:max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search SKU or product name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                        />
                    </div>

                    <button
                        onClick={fetchProducts}
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

                    <table className="w-full min-w-[760px]">

                        <thead className="border-b border-slate-200 bg-slate-50">

                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Product
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    SKU
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Minimum Stock
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
                                                Loading products...
                                            </span>
                                        </div>
                                    </td>
                                </tr>

                            ) : filteredProducts.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-3">

                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                                                <Package
                                                    size={22}
                                                    className="text-slate-400"
                                                />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-700">
                                                    No products found
                                                </p>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    Try another search keyword.
                                                </p>
                                            </div>

                                        </div>
                                    </td>
                                </tr>

                            ) : (

                                filteredProducts.map((product) => (

                                    <tr
                                        key={product.id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                                                    <Package
                                                        size={19}
                                                        className="text-slate-600"
                                                    />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {product.name}
                                                    </p>

                                                    {product.description && (
                                                        <p className="max-w-xs truncate text-xs text-slate-400">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>

                                            </div>

                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600">
                                                {product.sku}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                            {product.minStock ?? 0}
                                        </td>

                                        <td className="px-6 py-4">

                                            {product.isActive ? (
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

                                                {canManageProducts && (
                                                    <button
                                                        onClick={() =>
                                                            openEditModal(product)
                                                        }
                                                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                )}

                                                {canManageProducts && product.isActive && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(product.id)
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
                            {filteredProducts.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                            {products.length}
                        </span>{" "}
                        products
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
                                    {editingProduct
                                        ? "Edit Product"
                                        : "Add Product"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Product master information
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
                                    SKU
                                </label>

                                <input
                                    name="sku"
                                    value={form.sku}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. SKU-001"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Product Name
                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Product name"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Optional description"
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Minimum Stock
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="minStock"
                                    value={form.minStock}
                                    onChange={handleChange}
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
                                        : editingProduct
                                            ? "Save Changes"
                                            : "Add Product"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}