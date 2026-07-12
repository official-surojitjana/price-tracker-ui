import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/dashboardService";

function Dashboard() {

    const [stats, setStats] = useState({
        totalProducts: 0,
        todaysScrapes: 0,
        successfulScrapes: 0,
        failedScrapes: 0,
        priceDropsToday: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            const response = await getDashboardStats();
            setStats(response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div>Loading dashboard...</div>;
    }

    return (
        <>
            <div className="row row-deck row-cards">

                <div className="col-sm-6 col-lg-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="subheader">Total Products</div>
                            <div className="h1">{stats.totalProducts}</div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="subheader">Today's Scrapes</div>
                            <div className="h1">{stats.todaysScrapes}</div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="subheader">Successful Scrapes</div>
                            <div className="h1 text-success">
                                {stats.successfulScrapes}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                    <div className="card">
                        <div className="card-body">
                            <div className="subheader">Failed Scrapes</div>
                            <div className="h1 text-danger">
                                {stats.failedScrapes}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Dashboard;