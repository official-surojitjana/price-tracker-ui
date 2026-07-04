function Card({ title, value }) {
    return (
        <div className="card">
            <div className="card-body">
                <div className="text-secondary">
                    {title}
                </div>

                <h2 className="mt-2">
                    {value}
                </h2>
            </div>
        </div>
    );
}

export default Card;