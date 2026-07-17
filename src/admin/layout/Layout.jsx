import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

function Layout() {

    return (

        <div className="page">

            <Sidebar />

            <div className="page-wrapper">

                <Header />

                <div className="page-body">

                    <div className="container-xl">

                        <Outlet />

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Layout;