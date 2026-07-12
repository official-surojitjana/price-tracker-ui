import {Link, NavLink} from "react-router-dom";

function Sidebar() {
    return (
        <aside className="navbar navbar-vertical navbar-expand-lg">
            <div className="container-fluid">

                <h1 className="navbar-brand mt-3">
                    Price Tracker
                </h1>

                <div className="navbar-nav">

                    <Link className="nav-link" to="/">
                        Dashboard
                    </Link>

                    <Link className="nav-link" to="/products">
                        Products
                    </Link>

                    <Link className="nav-link" to="/scrape-history">
                        Scrape History
                    </Link>

                    <Link className="nav-link" to="/statistics">
                        Statistics
                    </Link>

                    <Link className="nav-link" to="/settings">
                        Settings
                    </Link>

                </div>

            </div>
        </aside>
    );
}

export default Sidebar;