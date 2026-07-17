import { Plus, Search } from "lucide-react";

const platforms = [
    { value: "AMAZON", label: "Amazon" },
    { value: "FLIPKART", label: "Flipkart" },
];

function ProductToolbar({ onCreateClick, searchQuery, onSearch, platformFilter, onPlatformChange }) {
    return (
        <div className="mb-3">
            <div className="d-flex align-items-center mb-3">
                <div>
                    <h2 className="page-title">Products</h2>
                    <p className="text-muted mt-1 mb-0">Track and monitor your products</p>
                </div>

                <div className="ms-auto">
                    <button onClick={onCreateClick} className="btn btn-primary">
                        <Plus size={16} className="me-1" />
                        Track Product
                    </button>
                </div>
            </div>

            <div className="row g-2">
                <div className="col">
                    <div className="input-group">
                        <span className="input-group-text">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearch(e.target.value)}
                            className="form-control"
                            placeholder="Search by name or platform..."
                        />
                    </div>
                </div>

                <div className="col-auto">
                    <select
                        value={platformFilter}
                        onChange={(e) => onPlatformChange(e.target.value)}
                        className="form-select"
                    >
                        <option value="">All Platforms</option>
                        {platforms.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default ProductToolbar;
