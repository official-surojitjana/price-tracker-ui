import { useEffect, useRef, useState } from "react";
import { getScrapeHistory, retryScrape, retryAllFailed } from "../../shared/services/scrapeHistoryService.js";

const PAGE_SIZE = 20;

function getPageWindow(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages = [0];
    if (current > 3) pages.push("...");
    for (let i = Math.max(1, current - 2); i <= Math.min(total - 2, current + 2); i++) pages.push(i);
    if (current < total - 4) pages.push("...");
    pages.push(total - 1);
    return pages;
}

const AVAILABILITY_DISPLAY = {
    AVAILABLE:     { emoji: "🟢", label: "In Stock" },
    OUT_OF_STOCK:  { emoji: "🔴", label: "Out of Stock" },
    NOT_FOUND:     { emoji: "⚫", label: "Product Removed" },
    UNKNOWN:       { emoji: "🟡", label: "Unknown" },
};

function SortIcon({ column, sortBy, sortDir }) {
    if (sortBy !== column) return <span className="text-muted ms-1">⇅</span>;
    return <span className="ms-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
}

const INITIAL_FILTERS = {
    search: "", platform: "", status: "",
    fromDate: "", toDate: "", minPrice: "", maxPrice: "",
};

function ScrapeHistory() {
    const [history, setHistory]             = useState([]);
    const [page, setPage]                   = useState(0);
    const [totalPages, setTotalPages]       = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [filters, setFilters]             = useState(INITIAL_FILTERS);
    const [sortBy, setSortBy]               = useState("scrapedAt");
    const [sortDir, setSortDir]             = useState("desc");
    const debounceRef                       = useRef(null);
    const [retrying, setRetrying]           = useState(new Set());
    const [retryErrors, setRetryErrors]     = useState({});
    const [bulkRetrying, setBulkRetrying]   = useState(false);
    const [bulkResult, setBulkResult]       = useState(null);

    useEffect(() => {
        load(page, filters, sortBy, sortDir);
    }, [page, sortBy, sortDir]);

    async function load(p, f, sb, sd) {
        try {
            const params = {
                page: p, size: PAGE_SIZE,
                sortBy: sb, sortDir: sd,
                ...(f.search   && { search:   f.search }),
                ...(f.platform && { platform: f.platform }),
                ...(f.status   && { status:   f.status }),
                ...(f.fromDate && { fromDate: f.fromDate }),
                ...(f.toDate   && { toDate:   f.toDate }),
                ...(f.minPrice && { minPrice: f.minPrice }),
                ...(f.maxPrice && { maxPrice: f.maxPrice }),
            };
            const data = await getScrapeHistory(params);
            setHistory(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (err) {
            console.error(err);
        }
    }

    function handleFilterChange(e) {
        const { name, value } = e.target;
        const next = { ...filters, [name]: value };
        setFilters(next);

        if (name === "search") {
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => resetAndLoad(next), 400);
        } else {
            resetAndLoad(next);
        }
    }

    function resetAndLoad(f) {
        setPage(0);
        load(0, f, sortBy, sortDir);
    }

    function handleSort(column) {
        const nextDir = sortBy === column && sortDir === "desc" ? "asc" : "desc";
        setSortBy(column);
        setSortDir(nextDir);
        setPage(0);
    }

    function clearFilters() {
        setFilters(INITIAL_FILTERS);
        setPage(0);
        load(0, INITIAL_FILTERS, sortBy, sortDir);
    }

    async function handleBulkRetry() {
        setBulkRetrying(true);
        setBulkResult(null);
        try {
            const result = await retryAllFailed();
            setBulkResult(result);
            load(page, filters, sortBy, sortDir);
        } catch (err) {
            setBulkResult({ error: err.response?.data?.message || "Bulk retry failed" });
        } finally {
            setBulkRetrying(false);
        }
    }

    async function handleRetry(item) {
        setRetrying(prev => new Set([...prev, item.id]));
        setRetryErrors(prev => { const next = { ...prev }; delete next[item.id]; return next; });
        try {
            const updated = await retryScrape(item.id);
            setHistory(prev => prev.map(h => h.id === item.id ? updated : h));
        } catch (err) {
            setRetryErrors(prev => ({
                ...prev,
                [item.id]: err.response?.data?.message || "Retry failed",
            }));
        } finally {
            setRetrying(prev => { const next = new Set(prev); next.delete(item.id); return next; });
        }
    }

    const start      = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
    const end        = Math.min((page + 1) * PAGE_SIZE, totalElements);
    const pageWindow = getPageWindow(page, totalPages);
    const hasFilters = Object.values(filters).some(v => v !== "");

    const th = (label, column) => (
        <th onClick={() => handleSort(column)} style={{ cursor: "pointer", userSelect: "none" }}>
            {label}<SortIcon column={column} sortBy={sortBy} sortDir={sortDir} />
        </th>
    );

    return (
        <div className="container-xl">
            <div className="page-header mb-3">
                <h2 className="page-title">Scrape History</h2>
                <div className="ms-auto d-flex align-items-center gap-3">
                    {bulkResult && !bulkResult.error && (
                        <span className="text-muted small">
                            ✅ {bulkResult.resolved} resolved
                            {bulkResult.stillFailed > 0 && `, ⚠️ ${bulkResult.stillFailed} still failed`}
                        </span>
                    )}
                    {bulkResult?.error && (
                        <span className="text-danger small">{bulkResult.error}</span>
                    )}
                    <button
                        className="btn btn-warning"
                        onClick={handleBulkRetry}
                        disabled={bulkRetrying}
                    >
                        {bulkRetrying
                            ? <><span className="spinner-border spinner-border-sm me-2"/>Retrying...</>
                            : "🔄 Retry All Failed"}
                    </button>
                </div>
            </div>

            <div className="card">
                {/* Filter bar */}
                <div className="card-header flex-wrap gap-2">
                    {/* Search */}
                    <div className="input-group" style={{ maxWidth: 280 }}>
                        <span className="input-group-text">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                        </span>
                        <input
                            type="text" className="form-control" placeholder="Search product…"
                            name="search" value={filters.search} onChange={handleFilterChange}
                        />
                    </div>

                    {/* Platform */}
                    <select className="form-select" style={{ maxWidth: 150 }}
                            name="platform" value={filters.platform} onChange={handleFilterChange}>
                        <option value="">All Platforms</option>
                        <option value="AMAZON">Amazon</option>
                        <option value="FLIPKART">Flipkart</option>
                    </select>

                    {/* Status */}
                    <select className="form-select" style={{ maxWidth: 140 }}
                            name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All Status</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>

                    {/* Date range */}
                    <input type="date" className="form-control" style={{ maxWidth: 160 }}
                           name="fromDate" value={filters.fromDate} onChange={handleFilterChange} />
                    <span className="align-self-center text-muted">to</span>
                    <input type="date" className="form-control" style={{ maxWidth: 160 }}
                           name="toDate" value={filters.toDate} onChange={handleFilterChange} />

                    {/* Price range */}
                    <input type="number" className="form-control" placeholder="Min ₹" style={{ maxWidth: 110 }}
                           name="minPrice" value={filters.minPrice} onChange={handleFilterChange} />
                    <input type="number" className="form-control" placeholder="Max ₹" style={{ maxWidth: 110 }}
                           name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} />

                    {hasFilters && (
                        <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                            Clear
                        </button>
                    )}
                </div>

                <div className="table-responsive">
                    <table className="table table-vcenter">
                        <thead>
                        <tr>
                            {th("Product", "productName")}
                            {th("Platform", "platform")}
                            {th("Status", "status")}
                            {th("Availability", "availability")}
                            {th("Price", "price")}
                            <th>Error</th>
                            {th("Scraped At", "scrapedAt")}
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center text-secondary py-4">
                                    No results found
                                </td>
                            </tr>
                        ) : history.map(item => (
                            <tr key={item.id}>
                                <td>{item.productName}</td>
                                <td>{item.platform}</td>
                                <td>
                                    {item.status === "SUCCESS"
                                        ? <span className="badge bg-success">Success</span>
                                        : item.status === "RESOLVED"
                                        ? <span className="badge bg-teal">Resolved</span>
                                        : <span className="badge bg-danger">Failed</span>}
                                </td>

                                <td>
                                    {(() => {
                                        const s = AVAILABILITY_DISPLAY[item.availabilityStatus];
                                        return s
                                            ? <span>{s.emoji} {s.label}</span>
                                            : <span className="text-muted">-</span>;
                                    })()}
                                </td>
                                <td>{item.scrapedPrice ?? "-"}</td>
                                <td>{item.errorMessage || "-"}</td>
                                <td>
                                    {item.scrapedAt ? (
                                        <>
                                            <div>{new Date(item.scrapedAt).toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric"})}</div>
                                            <div className="text-muted small">{new Date(item.scrapedAt).toLocaleTimeString("en-IN", {hour: "2-digit", minute: "2-digit"})}</div>
                                        </>
                                    ) : "-"}
                                </td>
                                <td>
                                    {item.status === "FAILED" ? (
                                        <div>
                                            <button
                                                className="btn btn-sm btn-outline-warning"
                                                onClick={() => handleRetry(item)}
                                                disabled={retrying.has(item.id)}
                                            >
                                                {retrying.has(item.id)
                                                    ? <span className="spinner-border spinner-border-sm me-1" />
                                                    : "🔄"}{" "}
                                                Retry
                                            </button>

                                            {retryErrors[item.id] && (
                                                <div className="text-danger small mt-1">
                                                    {retryErrors[item.id]}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            disabled
                                        >
                                            ✓ Retry
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="card-footer d-flex align-items-center justify-content-between">
                    <p className="m-0 text-secondary">
                        Showing <strong>{start}–{end}</strong> of <strong>{totalElements}</strong> entries
                    </p>
                    <ul className="pagination m-0">
                        <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPage(p => p - 1)}>prev</button>
                        </li>
                        {pageWindow.map((p, i) =>
                            p === "..." ? (
                                <li key={`e-${i}`} className="page-item disabled">
                                    <span className="page-link">…</span>
                                </li>
                            ) : (
                                <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => setPage(p)}>{p + 1}</button>
                                </li>
                            )
                        )}
                        <li className={`page-item ${page >= totalPages - 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => setPage(p => p + 1)}>next</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ScrapeHistory;
