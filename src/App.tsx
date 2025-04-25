import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import Settings from "./pages/Settings";
import { ExpenseTrackingBenefits } from "@/components/features/ExpenseTrackingBenefits";
import { ReportsBenefits } from "@/components/features/ReportsBenefits";
import { BudgetManagementBenefits } from "@/components/features/BudgetManagementBenefits";
import { TimeSavingsBenefits } from "@/components/features/TimeSavingsBenefits";
import { SecurityBenefits } from "@/components/features/SecurityBenefits";
import { CloudSyncBenefits } from "@/components/features/CloudSyncBenefits";

const queryClient = new QueryClient();

// Add a component to log route changes
const RouteLogger = () => {
  const location = useLocation();
  console.log('Route changed:', location.pathname);
  return null;
};

const App = () => {
  console.log('App component rendering...');
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteLogger />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/expense-tracking-benefits" element={<ExpenseTrackingBenefits />} />
              <Route path="/reports-benefits" element={<ReportsBenefits />} />
              <Route path="/budget-management-benefits" element={<BudgetManagementBenefits />} />
              <Route path="/time-savings-benefits" element={<TimeSavingsBenefits />} />
              <Route path="/security-benefits" element={<SecurityBenefits />} />
              <Route path="/cloud-sync-benefits" element={<CloudSyncBenefits />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  );
};

export default App;
