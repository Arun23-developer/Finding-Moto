import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import ProductManagement from "./pages/ProductManagement";
import ServiceManagement from "./pages/ServiceManagement";
import OrdersBookings from "./pages/OrdersBookings";
import RatingsReviews from "./pages/RatingsReviews";
import ProfileManagement from "./pages/ProfileManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/dashboard/products" element={<ProductManagement />} />
            <Route path="/dashboard/services" element={<ServiceManagement />} />
            <Route path="/dashboard/orders" element={<OrdersBookings />} />
            <Route path="/dashboard/reviews" element={<RatingsReviews />} />
            <Route path="/dashboard/profile" element={<ProfileManagement />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
