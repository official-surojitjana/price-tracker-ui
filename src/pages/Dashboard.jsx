import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {

    const [products, setProducts] = useState([]);

    useEffect(() => {

        api.get("/products")
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error(error);
            });

    }, []);

    return (
        <>
            <h1 className="mb-4">Dashboard</h1>

            <h3>Total Products : {products.length}</h3>
        </>
    );
}

export default Dashboard;