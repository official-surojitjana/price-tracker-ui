import {useState, useMemo} from "react";
import {
    Edit,
    ChevronUp,
    ChevronDown,ChartLine
} from "lucide-react";
import {updatePrice, getPriceHistory } from "../../shared/services/productService.js";

const PLATFORM_BADGE = {
    AMAZON: "bg-blue-lt",
    FLIPKART: "bg-orange-lt",
};

const PLATFORM_LABEL = {
    AMAZON: "Amazon",
    FLIPKART: "Flipkart",
};


function getExternalId(product) {
    if (product.externalProductId) return product.externalProductId;
    if (product.external_product_id) return product.external_product_id;
    if (product.url) {
        if (product.platform === "AMAZON") {
            const m = product.url.match(/\/dp\/([A-Z0-9]{10})/) ||
                product.url.match(/\/gp\/product\/([A-Z0-9]{10})/);
            if (m) return m[1];
        }
        if (product.platform === "FLIPKART") {
            const m = product.url.match(/\/p\/(itm[a-zA-Z0-9]+)/);
            if (m) return m[1];
        }
    }
    return "";
}

function getImageSrc(product) {
    if (product.imageUrl) return product.imageUrl;
    if (product.image_url) return product.image_url;
    if (product.platform === "AMAZON") {
        const asin = getExternalId(product);
        if (asin) return `https://m.media-amazon.com/images/P/${asin}.01._SX300_SY300_.jpg`;
    }
    return null;
}

function formatReviewCount(count) {
    if (count == null) return null;
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
}

function getRatingBadgeClass(rating) {
    if (rating >= 4.5) return "bg-success-lt";
    if (rating >= 4.0) return "bg-warning-lt";
    return "bg-danger-lt";
}

const AVAILABILITY_DISPLAY = {
    AVAILABLE:     { emoji: "🟢", label: "In Stock" },
    OUT_OF_STOCK:  { emoji: "🔴", label: "Out of Stock" },
    NOT_FOUND:     { emoji: "⚫", label: "Product Removed" },
    UNKNOWN:       { emoji: "🟡", label: "Unknown" },
};

function ProductTable({products, onUpdate, searchQuery = "", platformFilter = ""}) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [priceHistory, setPriceHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);
    const [historyProduct, setHistoryProduct] = useState(null);


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
            if (
                sortColumn === "id" ||
                sortColumn === "currentPrice" ||
                sortColumn === "rating" ||
                sortColumn === "reviewCount"
            ) {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            } else {
                aVal = String(aVal ?? "").toLowerCase();
                bVal = String(bVal ?? "").toLowerCase();
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
        setSaveError(null);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setSaveError(null);
    }

    async function viewPriceHistory(product) {
        setHistoryProduct(product);
        setHistoryLoading(true);
        setHistoryError(null);

        try {
            const history = await getPriceHistory(product.id);
            setPriceHistory(history);
            setIsHistoryModalOpen(true);
        } catch (err) {
            setHistoryError("Failed to load price history.");
            setIsHistoryModalOpen(true);
        } finally {
            setHistoryLoading(false);
        }
    }

    function closeHistoryModal() {
        setIsHistoryModalOpen(false);
        setPriceHistory([]);
        setHistoryError(null);
        setHistoryProduct(null);
    }

    async function saveChanges() {
        setIsSaving(true);
        setSaveError(null);
        try {
            await updatePrice(selectedProduct.id, {price: parseFloat(editPrice)});
            if (typeof onUpdate === "function") {
                onUpdate({...selectedProduct, name: editName, currentPrice: parseFloat(editPrice)});
            }
            closeModal();
        } catch (err) {
            setSaveError(err.response?.data?.message || "Failed to update price");
        } finally {
            setIsSaving(false);
        }
    }

    function SortIcon({column}) {
        if (sortColumn !== column) return <span className="text-muted ms-1" style={{fontSize: "0.75rem"}}>⇅</span>;
        return sortDirection === "asc"
            ? <ChevronUp size={13} className="ms-1"/>
            : <ChevronDown size={13} className="ms-1"/>;
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
                            <th>Image</th>
                            <th
                                onClick={() => handleSort("name")}
                                style={{cursor: "pointer", userSelect: "none"}}
                            >
                                Name <SortIcon column="name"/>
                            </th>
                            <th
                                onClick={() => handleSort("category")}
                                style={{cursor: "pointer", userSelect: "none"}}
                            >
                                Category <SortIcon column="category"/>
                            </th>
                            <th
                                onClick={() => handleSort("platform")}
                                style={{cursor: "pointer", userSelect: "none"}}
                            >
                                Platform <SortIcon column="platform"/>
                            </th>
                            <th
                                onClick={() => handleSort("availabilityStatus")}
                                style={{cursor: "pointer", userSelect: "none"}}
                            >
                                Status <SortIcon column="availabilityStatus"/>
                            </th>
                            <th
                                onClick={() => handleSort("currentPrice")}
                                style={{cursor: "pointer", userSelect: "none"}}
                            >
                                Current Price <SortIcon column="currentPrice"/>
                            </th>
                            <th
                                onClick={() => handleSort("rating")}
                                style={{cursor: "pointer", userSelect: "none"}}
                            >
                                Rating <SortIcon column="rating"/>
                            </th>
                            <th
                                onClick={() => handleSort("updatedAt")}
                                style={{cursor: "pointer", userSelect: "none"}}
                            >
                                Updated <SortIcon column="updatedAt"/>
                            </th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {paginatedProducts.length > 0 ? (
                            paginatedProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <a href={product.url} target="_blank" rel="noopener noreferrer">
                                            {getImageSrc(product) ? (
                                                <img
                                                    src={getImageSrc(product)}
                                                    alt={product.name}
                                                    style={{width: 56, height: 56, objectFit: "cover", borderRadius: 6}}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: 56,
                                                    height: 56,
                                                    background: "#e9ecef",
                                                    borderRadius: 6
                                                }}/>
                                            )}
                                        </a>
                                    </td>

                                    <td>
                                        <a href={product.url} target="_blank" rel="noopener noreferrer"
                                           style={{color: "inherit", textDecoration: "none"}}>
                                            {product.name}
                                        </a>
                                    </td>

                                    <td>
                                        {product.category}
                                    </td>

                                    <td>
                                            <span
                                                className={`badge ${PLATFORM_BADGE[product.platform] || "bg-secondary-lt"}`}>
                                                {PLATFORM_LABEL[product.platform] || product.platform}
                                            </span>
                                    </td>

                                    <td>
                                        {(() => {
                                            const s = AVAILABILITY_DISPLAY[product.availabilityStatus];
                                            return s
                                                ? <span>{s.emoji} {s.label}</span>
                                                : <span className="text-muted">-</span>;
                                        })()}
                                    </td>

                                    <td>
                                        ₹{Number(product.currentPrice).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                    </td>

                                    <td>
                                        {product.rating != null ? (
                                            <>
                                                <span className={`badge ${getRatingBadgeClass(product.rating)}`}>
                                                    ★ {product.rating}
                                                </span>
                                                {formatReviewCount(product.reviewCount) && (
                                                    <div className="text-muted small mt-1">
                                                        {formatReviewCount(product.reviewCount)} reviews
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            "-"
                                        )}
                                    </td>

                                    <td>
                                        {product.updatedAt ? (
                                            <>
                                                <div>{new Date(product.updatedAt).toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric"})}</div>
                                                <div className="text-muted small">{new Date(product.updatedAt).toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"})}</div>
                                            </>
                                        ) : "-"}
                                    </td>

                                    <td>
                                        <div className="d-flex gap-2">

                                            <button
                                                aria-label={`Edit ${product.name}`}
                                                onClick={() => openEditModal(product)}
                                                className="btn btn-sm btn-ghost-secondary"
                                                title="Edit Product"
                                            >
                                                <Edit size={14} />
                                            </button>

                                            <button
                                                className="btn btn-sm btn-ghost-info"
                                                onClick={() => viewPriceHistory(product)}
                                                title="Price History"
                                            >
                                                <ChartLine size={14} />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="text-center text-muted py-4">
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
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24"
                                         viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
                                        <polyline points="15 6 9 12 15 18"/>
                                    </svg>
                                    prev
                                </button>
                            </li>

                            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
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
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24"
                                         viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
                                        <polyline points="9 6 15 12 9 18"/>
                                    </svg>
                                </button>
                            </li>
                        </ul>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <>
                    <div
                        className="modal modal-blur fade show"
                        style={{display: "block"}}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Product</h5>
                                    <button type="button" className="btn-close" onClick={closeModal}
                                            aria-label="Close"/>
                                </div>

                                <div className="modal-body">
                                    {saveError && (
                                        <div className="alert alert-danger" role="alert">
                                            {saveError}
                                        </div>
                                    )}

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
                                    <button onClick={closeModal} className="btn btn-link link-secondary me-auto"
                                            disabled={isSaving}>
                                        Cancel
                                    </button>
                                    <button onClick={saveChanges} className="btn btn-primary" disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"
                                                      aria-hidden="true"/>
                                                Saving...
                                            </>
                                        ) : "Save changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" onClick={closeModal}/>
                </>
            )}

            {isHistoryModalOpen && (
                <>
                    <div
                        className="modal modal-blur fade show"
                        style={{ display: "block" }}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Price History
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeHistoryModal}
                                    />
                                </div>

                                <div className="modal-body">

                                    {historyProduct && (
                                        <h4 className="mb-3">
                                            {historyProduct.name}
                                        </h4>
                                    )}

                                    {historyLoading && (
                                        <div className="text-center py-5">
                                            <div className="spinner-border" />
                                        </div>
                                    )}

                                    {historyError && (
                                        <div className="alert alert-danger">
                                            {historyError}
                                        </div>
                                    )}

                                    {!historyLoading &&
                                        !historyError &&
                                        priceHistory.length === 0 && (
                                            <div className="text-center text-muted">
                                                No history found.
                                            </div>
                                        )}

                                    {!historyLoading &&
                                        !historyError &&
                                        priceHistory.length > 0 && (

                                            <table className="table table-striped table-hover">
                                                <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Price</th>
                                                    <th>Captured At</th>
                                                </tr>
                                                </thead>

                                                <tbody>

                                                {priceHistory.map((item, index) => (

                                                    <tr key={item.id}>
                                                        <td>{index + 1}</td>

                                                        <td>
                                                            ₹{Number(item.price).toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            }
                                                        )}
                                                        </td>

                                                        <td>
                                                            {new Date(
                                                                item.capturedAt
                                                            ).toLocaleString("en-IN")}
                                                        </td>

                                                    </tr>

                                                ))}

                                                </tbody>

                                            </table>

                                        )}

                                </div>

                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={closeHistoryModal}
                                    >
                                        Close
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop fade show"
                        onClick={closeHistoryModal}
                    />
                </>
            )}
        </>
    );
}

export default ProductTable;
