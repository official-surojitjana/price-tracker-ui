import { useEffect, useState } from "react";
import { getProducts, createProduct } from "../../services/productService.js";
import ProductTable from "../components/ProductTable.jsx";
import ProductToolbar from "../components/ProductToolbar.jsx";

function Products() {

    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [platformFilter, setPlatformFilter] = useState("");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ url: "", platform: "" });

    function handleUpdate(updatedProduct) {
        setProducts((prev) => prev.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p));
    }

    function openCreateModal() {
        setIsCreateModalOpen(true);
        setFormData({ url: "", platform: "" });
        setError(null);
    }

    function closeCreateModal() {
        setIsCreateModalOpen(false);
        setFormData({ url: "", platform: "" });
        setError(null);
    }

    async function handleCreateProduct(e) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const newProduct = await createProduct({
                url: formData.url,
                platform: formData.platform,
            });
            setProducts((prev) => [newProduct, ...prev]);
            closeCreateModal();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create product");
        } finally {
            setIsLoading(false);
        }
    }

    function handleFormChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    useEffect(() => {
        getProducts().then(setProducts).catch(console.error);
    }, []);

    return (
        <>
            <ProductToolbar
                onCreateClick={openCreateModal}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                platformFilter={platformFilter}
                onPlatformChange={setPlatformFilter}
            />

            <ProductTable
                products={products}
                onUpdate={handleUpdate}
                searchQuery={searchQuery}
                platformFilter={platformFilter}
            />

            {/* Create Product Modal */}
            {isCreateModalOpen && (
                <>
                    <div
                        className="modal modal-blur fade show"
                        style={{ display: "block" }}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add New Product</h5>
                                    <button type="button" className="btn-close" onClick={closeCreateModal} aria-label="Close" />
                                </div>

                                <form onSubmit={handleCreateProduct}>
                                    <div className="modal-body">
                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label required">Product URL</label>
                                            <input
                                                type="text"
                                                name="url"
                                                value={formData.url}
                                                onChange={handleFormChange}
                                                required
                                                placeholder="Enter product URL"
                                                className="form-control"
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label required">Platform</label>
                                            <select
                                                name="platform"
                                                value={formData.platform}
                                                onChange={handleFormChange}
                                                required
                                                className="form-select"
                                            >
                                                <option value="">Select a platform</option>
                                                <option value="AMAZON">Amazon</option>
                                                <option value="FLIPKART">Flipkart</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            onClick={closeCreateModal}
                                            className="btn btn-link link-secondary me-auto"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="btn btn-primary"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                                    Creating...
                                                </>
                                            ) : "Create Product"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={closeCreateModal} />
                </>
            )}
        </>
    );
}

export default Products;
