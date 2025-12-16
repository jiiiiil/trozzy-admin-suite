import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { isAuthenticated, initializeMockData } from "./lib/mockData";
import SignInPage from "./pages/auth/SignInPage";
import Dashboard from "./pages/Dashboard";
import AnalyticsOverview from "./pages/analytics/AnalyticsOverview";
import AdvancedAnalytics from "./pages/analytics/AdvancedAnalytics";
import RealTimeAnalytics from "./pages/analytics/RealTimeAnalytics";
import BusinessIntelligence from "./pages/analytics/BusinessIntelligence";
import ReportBuilder from "./pages/analytics/ReportBuilder";
import MarketingPage from "./pages/commerce/MarketingPage";
import ProductsPage from "./pages/commerce/ProductsPage";
import ProductFormPage from "./pages/commerce/ProductFormPage";
import OrdersPage from "./pages/commerce/OrdersPage";
import InventoryPage from "./pages/commerce/InventoryPage";
import PaymentsPage from "./pages/commerce/PaymentsPage";
import UsersPage from "./pages/users/UsersPage";
import ContentPage from "./pages/content/ContentPage";
import CategoriesPage from "./pages/content/CategoriesPage";
import SizeGuidesPage from "./pages/content/SizeGuidesPage";
import MediaLibraryPage from "./pages/content/MediaLibraryPage";
import NotificationsPage from "./pages/content/NotificationsPage";
import AuditLogsPage from "./pages/content/AuditLogsPage";
import DataManagementPage from "./pages/system/DataManagementPage";
import AIAutomationPage from "./pages/system/AIAutomationPage";
import PluginsPage from "./pages/system/PluginsPage";
import SettingsPage from "./pages/system/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize data on app load
initializeMockData();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/sign-in" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics/overview" element={<AnalyticsOverview />} />
            <Route path="/analytics/advanced" element={<AdvancedAnalytics />} />
            <Route path="/analytics/realtime" element={<RealTimeAnalytics />} />
            <Route path="/analytics/bi" element={<BusinessIntelligence />} />
            <Route path="/analytics/reports" element={<ReportBuilder />} />
            <Route path="/commerce/products" element={<ProductsPage />} />
            <Route path="/commerce/products/new" element={<ProductFormPage />} />
            <Route path="/commerce/products/:id" element={<ProductFormPage />} />
            <Route path="/commerce/orders" element={<OrdersPage />} />
            <Route path="/commerce/inventory" element={<InventoryPage />} />
            <Route path="/commerce/payments" element={<PaymentsPage />} />
            <Route path="/commerce/marketing" element={<MarketingPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/size-guides" element={<SizeGuidesPage />} />
            <Route path="/media" element={<MediaLibraryPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/data-management" element={<DataManagementPage />} />
            <Route path="/ai-automation" element={<AIAutomationPage />} />
            <Route path="/plugins" element={<PluginsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
