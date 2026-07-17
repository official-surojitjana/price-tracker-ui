import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./admin/layout/Layout";

import Dashboard from "./admin/pages/Dashboard";
import Products from "./admin/pages/Products";
import Statistics from "./admin/pages/Statistics";
import Settings from "./admin/pages/Settings";
import ScrapeHistory from "./admin/pages/ScrapeHistory";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route element={<Layout />}>

                    <Route path="/" element={<Dashboard />} />

                    <Route path="/products" element={<Products />} />

                    <Route path="/scrape-history" element={<ScrapeHistory />} />

                    <Route path="/statistics" element={<Statistics />} />

                    <Route path="/settings" element={<Settings />} />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;