import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Signup from "./pages/admin/Signup";
import ForgotPassword from "./pages/admin/ForgotPassword";
import ResetPassword from "./pages/admin/ResetPassword";
import Dashboard from "./pages/admin/Dashboard";
import Customers from "./pages/admin/Customers";
import Skus from "./pages/admin/Skus";
import Invoices from "./pages/admin/Invoices";
import InvoiceDashboard from "./pages/admin/InvoiceDashboard";
import InvoiceCost from "./pages/admin/InvoiceCost";
import InvoiceSale from "./pages/admin/InvoiceSale";
import CostTables from "./pages/admin/CostTables";
import SaleTables from "./pages/admin/SaleTables";
import Settings from "./pages/admin/Settings";
import Connections from "./pages/admin/Connections";
import Tenants from "./pages/admin/Tenants";
import AuditLogs from "./pages/admin/AuditLogs";
import FinancialSummary from "./pages/admin/financial/FinancialSummary";
import CFOPanel from "./pages/admin/financial/CFOPanel";
import DRECaixa from "./pages/admin/financial/DRECaixa";
import Revenues from "./pages/admin/financial/Revenues";
import Expenses from "./pages/admin/financial/Expenses";
import Commissions from "./pages/admin/financial/Commissions";
import Automations from "./pages/admin/financial/Automations";
import FinancialCategories from "./pages/admin/financial/Categories";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Landing page pública */}
            <Route path="/" element={<Index />} />

            {/* Auth pages */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/signup" element={<Signup />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />

            {/* Portal admin protegido */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="skus" element={<Skus />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="invoices/dashboard" element={<InvoiceDashboard />} />
              <Route path="invoices/custo" element={<InvoiceCost />} />
              <Route path="invoices/venda" element={<InvoiceSale />} />
              <Route path="cost-tables" element={<CostTables />} />
              <Route path="sale-tables" element={<SaleTables />} />
              <Route path="connections" element={<Connections />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="settings" element={<Settings />} />
              <Route path="audit-logs" element={<AuditLogs />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
