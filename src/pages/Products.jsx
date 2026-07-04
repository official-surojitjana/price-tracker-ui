import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import ProductTable from "../components/ProductTable";

function Products() {

    const [products, setProducts] = useState([]);

    useEffect(() => {

        getProducts()
            .then(setProducts)
            .catch(console.error);

    }, []);

    return (

        <>

            <h1 className="mb-4">
                Products
            </h1>

            <ProductTable products={products}/>

        </>

    );

}

export default Products;