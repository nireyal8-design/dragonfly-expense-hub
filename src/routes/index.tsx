import { Routes, Route } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import AuthCallback from '@/pages/AuthCallback';
import Settings from '@/pages/Settings';
import { ExpenseTrackingBenefits } from '@/components/features/ExpenseTrackingBenefits';
import { ReportsBenefits } from '@/components/features/ReportsBenefits';
import { BudgetManagementBenefits } from '@/components/features/BudgetManagementBenefits';
import { TimeSavingsBenefits } from '@/components/features/TimeSavingsBenefits';
import { SecurityBenefits } from '@/components/features/SecurityBenefits';
import { CloudSyncBenefits } from '@/components/features/CloudSyncBenefits';

export function AppRoutes() {
  console.log('AppRoutes component rendering...');
  
  return (
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
  );
} 