function ProductTable({ products }) {

    return (

        <table className="table table-striped">

            <thead>

            <tr>
                <th>Name</th>
                <th>Platform</th>
                <th>Price</th>
            </tr>

            </thead>

            <tbody>

            {products.map(product => (

                <tr key={product.id}>

                    <td>{product.name}</td>

                    <td>{product.platform}</td>

                    <td>₹ {product.currentPrice}</td>

                </tr>

            ))}

            </tbody>

        </table>

    );
}

export default ProductTable;