import { useEffect, useState } from "react";
import { getScrapeHistory } from "../services/scrapeHistoryService";

function ScrapeHistory() {

    const [history, setHistory] = useState([]);

    useEffect(() => {
        loadHistory();
    }, []);

    async function loadHistory() {
        try {
            const data = await getScrapeHistory();
            setHistory(data);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="container-xl">
            <div className="page-header mb-3">
                <h2 className="page-title">Scrape History</h2>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table table-vcenter">
                        <thead>
                        <tr>
                            <th>Product</th>
                            <th>Platform</th>
                            <th>Status</th>
                            <th>Price</th>
                            <th>Error</th>
                            <th>Scraped At</th>
                        </tr>
                        </thead>

                        <tbody>
                        {history.map(item => (
                            <tr key={item.id}>
                                <td>{item.productName}</td>
                                <td>{item.platform}</td>

                                <td>
                                    {item.status === "SUCCESS" ? (
                                        <span className="badge bg-success">
                                                Success
                                            </span>
                                    ) : (
                                        <span className="badge bg-danger">
                                                Failed
                                            </span>
                                    )}
                                </td>

                                <td>{item.scrapedPrice}</td>
                                <td>{item.errorMessage || "-"}</td>
                                <td>{item.scrapedAt}</td>
                            </tr>
                        ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    );
}

export default ScrapeHistory;