import api from "./api.js";

export async function getScrapeHistory(params = {}) {
    const response = await api.get("/scrape-history", { params });
    return response.data;
}

export async function retryScrape(id) {
    const response = await api.post(`/scrape-history/${id}/retry`);
    return response.data;
}

export async function retryAllFailed() {
    const response = await api.post("/scrape-history/retry-failed");
    return response.data;
}
