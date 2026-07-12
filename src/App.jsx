import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import ScrapeHistory from "./pages/ScrapeHistory";

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