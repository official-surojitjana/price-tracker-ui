import api from "./api";

export async function getScrapeHistory() {

    const response = await api.get("/scrape-history");

    return response.data;
}