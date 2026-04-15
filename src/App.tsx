import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import ClientLayout from "@/components/client/ClientLayout";
import ClientProtectedRoute from "@/components/client/ClientProtectedRoute";
import Index from "./pages/Index";
import SolutionPage from "./pages/SolutionPage";
import TrialPage from "./pages/TrialPage";
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
import InvoiceCostDetail from "./pages/admin/InvoiceCostDetail";
import InvoiceSaleDetail from "./pages/admin/InvoiceSaleDetail";
import CostTables from "./pages/admin/CostTables";
import SaleTables from "./pages/admin/SaleTables";
import Settings from "./pages/admin/Settings";
import Connections from "./pages/admin/Connections";
import Tenants from "./pages/admin/Tenants";
import TrialClientsPage from "./pages/admin/TrialClients";
import AuditLogs from "./pages/admin/AuditLogs";
import Tickets from "./pages/admin/Tickets";
import CommercialRequests from "./pages/admin/CommercialRequests";
import UsersPage from "./pages/admin/Users";
import FinancialSummary from "./pages/admin/financial/FinancialSummary";
import CFOPanel from "./pages/admin/financial/CFOPanel";
import DRECaixa from "./pages/admin/financial/DRECaixa";
import Revenues from "./pages/admin/financial/Revenues";
import Expenses from "./pages/admin/financial/Expenses";
import Commissions from "./pages/admin/financial/Commissions";
import Automations from "./pages/admin/financial/Automations";
import FinancialCategories from "./pages/admin/financial/Categories";
import ClientLogin from "./pages/client/ClientLogin";
import ClientSignup from "./pages/client/ClientSignup";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientTickets from "./pages/client/ClientTickets";
import ClientInvoices from "./pages/client/ClientInvoices";
import ClientServices from "./pages/client/ClientServices";
import ClientOmbudsman from "./pages/client/ClientOmbudsman";
import AdminOmbudsman from "./pages/admin/Ombudsman";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import LgpdRequest from "./pages/LgpdRequest";
import PublicOmbudsman from "./pages/PublicOmbudsman";
import KnowledgeBase from "./pages/KnowledgeBase";
import CookieConsentBanner from "./components/CookieConsentBanner";
import LgpdDashboard from "./pages/admin/lgpd/LgpdDashboard";
import LgpdRopa from "./pages/admin/lgpd/LgpdRopa";
import LgpdConsents from "./pages/admin/lgpd/LgpdConsents";
import LgpdRequests from "./pages/admin/lgpd/LgpdRequests";
import LgpdIncidents from "./pages/admin/lgpd/LgpdIncidents";
import Quotes from "./pages/admin/Quotes";
import CRMDashboard from "./pages/admin/crm/CRMDashboard";
import CRMPipeline from "./pages/admin/crm/CRMPipeline";
import CRMLeads from "./pages/admin/crm/CRMLeads";
import CRMAgenda from "./pages/admin/crm/CRMAgenda";
import CRMChat from "./pages/admin/crm/CRMChat";
import CRMMarketingDashboard from "./pages/admin/crm/CRMMarketingDashboard";
import MarketingDashboard from "./pages/admin/marketing/MarketingDashboard";
import EmailCampaigns from "./pages/admin/marketing/EmailCampaigns";
import EmailLists from "./pages/admin/marketing/EmailLists";
import EmailTemplates from "./pages/admin/marketing/EmailTemplates";
import SmsDashboard from "./pages/admin/sms/SmsDashboard";
import SmsCampaigns from "./pages/admin/sms/SmsCampaigns";
import SmsContacts from "./pages/admin/sms/SmsContacts";
import SmsTemplates from "./pages/admin/sms/SmsTemplates";
import AnalyticsDashboard from "./pages/admin/analytics/AnalyticsDashboard";
import Unauthorized from "./pages/admin/Unauthorized";
import { useAnalyticsTracker } from "./hooks/useAnalyticsTracker";

const queryClient = new QueryClient();

const AnalyticsTracker = () => { useAnalyticsTracker(); return null; };

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AnalyticsTracker />
        <AuthProvider>
          <CookieConsentBanner />
          <Routes>
            {/* Landing page pública */}
            <Route path="/" element={<Index />} />
            <Route path="/solucao/:slug" element={<SolutionPage />} />
            <Route path="/teste-gratis" element={<TrialPage />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/lgpd/solicitar" element={<LgpdRequest />} />
            <Route path="/ouvidoria" element={<PublicOmbudsman />} />
            <Route path="/base-conhecimento" element={<KnowledgeBase />} />

            {/* Auth pages - Admin */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/signup" element={<Signup />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
            <Route path="/admin/unauthorized" element={<Unauthorized />} />

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
              {/* SKUs route kept for backward compatibility */}
              <Route path="skus" element={<Skus />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="invoices/dashboard" element={<InvoiceDashboard />} />
              <Route path="invoices/custo" element={<InvoiceCost />} />
              <Route path="invoices/custo/:id" element={<InvoiceCostDetail />} />
              <Route path="invoices/venda" element={<InvoiceSale />} />
              <Route path="invoices/venda/:id" element={<InvoiceSaleDetail />} />
              <Route path="cost-tables" element={<CostTables />} />
              <Route path="sale-tables" element={<SaleTables />} />
              <Route path="connections" element={<Connections />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="trial-clients" element={<TrialClientsPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="commercial-requests" element={<CommercialRequests />} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="crm" element={<CRMDashboard />} />
              <Route path="crm/pipeline" element={<CRMPipeline />} />
              <Route path="crm/leads" element={<CRMLeads />} />
              <Route path="crm/agenda" element={<CRMAgenda />} />
              <Route path="crm/chat" element={<CRMChat />} />
              <Route path="crm/requests" element={<CommercialRequests />} />
              <Route path="crm/quotes" element={<Quotes />} />
              <Route path="crm/marketing" element={<CRMMarketingDashboard />} />
              <Route path="marketing" element={<MarketingDashboard />} />
              <Route path="marketing/campaigns" element={<EmailCampaigns />} />
              <Route path="marketing/lists" element={<EmailLists />} />
              <Route path="marketing/templates" element={<EmailTemplates />} />
              <Route path="sms" element={<SmsDashboard />} />
              <Route path="sms/campaigns" element={<SmsCampaigns />} />
              <Route path="sms/contacts" element={<SmsContacts />} />
              <Route path="sms/templates" element={<SmsTemplates />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="ouvidoria" element={<AdminOmbudsman />} />
              <Route path="lgpd" element={<LgpdDashboard />} />
              <Route path="lgpd/ropa" element={<LgpdRopa />} />
              <Route path="lgpd/consents" element={<LgpdConsents />} />
              <Route path="lgpd/requests" element={<LgpdRequests />} />
              <Route path="lgpd/incidents" element={<LgpdIncidents />} />
              <Route path="financial" element={<FinancialSummary />} />
              <Route path="financial/cfo" element={<CFOPanel />} />
              <Route path="financial/dre" element={<DRECaixa />} />
              <Route path="financial/receitas" element={<Revenues />} />
              <Route path="financial/despesas" element={<Expenses />} />
              <Route path="financial/comissoes" element={<Commissions />} />
              <Route path="financial/automacoes" element={<Automations />} />
              <Route path="financial/categorias" element={<FinancialCategories />} />
            </Route>

            {/* Portal do Cliente */}
            <Route path="/portal/login" element={<ClientLogin />} />
            <Route path="/portal/signup" element={<ClientSignup />} />
            <Route
              path="/portal"
              element={
                <ClientProtectedRoute>
                  <ClientLayout />
                </ClientProtectedRoute>
              }
            >
              <Route index element={<ClientDashboard />} />
              <Route path="chamados" element={<ClientTickets />} />
              <Route path="faturas" element={<ClientInvoices />} />
              <Route path="servicos" element={<ClientServices />} />
              <Route path="ouvidoria" element={<ClientOmbudsman />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
