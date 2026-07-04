import api from "./api";

export async function getProducts() {
    const response = await api.get("/products");
    return response.data;
}