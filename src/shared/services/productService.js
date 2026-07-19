import api from "./api.js";
import axios from "axios";

export async function getProducts() {
    const response = await api.get("/products");
    return response.data;
}

export async function createProduct(productData) {
    const response = await api.post("/products", productData);
    return response.data;
}

export async function updatePrice(productId, priceData) {
    const response = await api.post(`/products/${productId}/price-update`, priceData);
    return response.data;
}

export async function getPriceHistory(productId) {
    const response = await api.get(`/products/${productId}/prices`);
    return response.data;
}
