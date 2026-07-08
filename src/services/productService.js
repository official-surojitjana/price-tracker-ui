import api from "./api";

export async function getProducts() {
    const response = await api.get("/products");
    return response.data;
}

export async function createProduct(productData) {
    const response = await api.post("/products", productData);
    return response.data;
}
