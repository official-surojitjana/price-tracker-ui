import api from "./api.js";

export async function getDashboardStats() {
    const response = await api.get("/dashboard");
    return response.data;
}