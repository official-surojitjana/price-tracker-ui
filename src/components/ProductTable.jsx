import { useState, useMemo } from "react";
import { Edit, ChevronUp, ChevronDown } from "lucide-react";

const PLATFORM_BADGE = {
    AMAZON: "bg-blue-lt",
    FLIPKART: "bg-orange-lt",
};

const PLATFORM_LABEL = {
    AMAZON: "Amazon",
    FLIPKART: "Flipkart",
};

function ProductTable({ products, onUpdate, searchQuery = "", platformFilter = "" }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");

    const [sortColumn, setSortColumn] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const processedProducts = useMemo(() => {
        let filtered = products?.filter(product => {
            const matchesSearch = !searchQuery ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(product.currentPrice).includes(searchQuery);
            const matchesPlatform = !platformFilter || product.platform === platformFilter;
            return matchesSearch && matchesPlatform;
        }) || [];

        return [...filtered].sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];
            if (sortColumn === "currentPrice") {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [products, searchQuery, platformFilter, sortColumn, sortDirection]);

    const totalPages = Math.ceil(processedProducts.length / itemsPerPage);

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return processedProducts.slice(start, start + itemsPerPage);
    }, [processedProducts, currentPage]);

    function handleSort(column) {
        if (sortColumn === column) {
            setSortDirection(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
        setCurrentPage(1);
    }

    function openEditModal(product) {
        setSelectedProduct(product);
        setEditName(product.name || "");
        setEditPrice(product.currentPrice ?? "");
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setSelectedProduct(null);
    }

    function saveChanges() {
        if (typeof onUpdate === "function") {
            onUpdate({ ...selectedProduct, name: editName, currentPrice: editPrice });
        }
        closeModal();
    }

    function SortIcon({ column }) {
        if (sortColumn !== column) return <span className="text-muted ms-1" style={{ fontSize: "0.75rem" }}>⇅</span>;
        return sortDirection === "asc"
            ? <ChevronUp size={13} className="ms-1" />
            : <ChevronDown size={13} className="ms-1" />;
    }

    const startItem = processedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, processedProducts.length);

    return (
        <>
            <div className="card">
                <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                        <thead>
                            <tr>
                                <th
                                    onClick={() => handleSort("id")}
                                    style={{ cursor: "pointer", userSelect: "none" }}
                                >
                                    Id <SortIcon column="id" />
                                </th>
                                <th
                                    onClick={() => handleSort("name")}
                                    style={{ cursor: "pointer", userSelect: "none" }}
                                >
                                    Name <SortIcon column="name" />
                                </th>
                                <th
                                    onClick={() => handleSort("platform")}
                                    style={{ cursor: "pointer", userSelect: "none" }}
                                >
                                    Platform <SortIcon column="platform" />
                                </th>
                                <th
                                    onClick={() => handleSort("currentPrice")}
                                    style={{ cursor: "pointer", userSelect: "none" }}
                                >
                                    Price <SortIcon column="currentPrice" />
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedProducts.length > 0 ? (
                                paginatedProducts.map(product => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>{product.name}</td>

                                        <td>
                                            <span className={`badge ${PLATFORM_BADGE[product.platform] || "bg-secondary-lt"}`}>
                                                {PLATFORM_LABEL[product.platform] || product.platform}
                                            </span>
                                        </td>

                                        <td>
                                            ₹{Number(product.currentPrice).toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>

                                        <td>
                                            <button
                                                aria-label={`Edit ${product.name}`}
                                                onClick={() => openEditModal(product)}
                                                className="btn btn-sm btn-ghost-secondary"
                                            >
                                                <Edit size={14} className="me-1" />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-4">
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card-footer d-flex align-items-center">
                    <p className="m-0 text-muted">
                        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{processedProducts.length}</strong> results
                    </p>

                    {totalPages > 1 && (
                        <ul className="pagination m-0 ms-auto">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
                                        <polyline points="15 6 9 12 15 18" />
                                    </svg>
                                    prev
                                </button>
                            </li>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(page)}>
                                        {page}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                >
                                    next
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
                                        <polyline points="9 6 15 12 9 18" />
                                    </svg>
                                </button>
                            </li>
                        </ul>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
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
                                    <h5 className="modal-title">Edit Product</h5>
                                    <button type="button" className="btn-close" onClick={closeModal} aria-label="Close" />
                                </div>

                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Name</label>
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="form-control"
                                            placeholder="Product name"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Price</label>
                                        <div className="input-group">
                                            <span className="input-group-text">₹</span>
                                            <input
                                                type="number"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value)}
                                                className="form-control"
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button onClick={closeModal} className="btn btn-link link-secondary me-auto">
                                        Cancel
                                    </button>
                                    <button onClick={saveChanges} className="btn btn-primary">
                                        Save changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={closeModal} />
                </>
            )}
        </>
    );
}

export default ProductTable;
