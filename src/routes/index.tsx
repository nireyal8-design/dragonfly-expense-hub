import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ExpenseTrackingBenefits } from '@/components/features/ExpenseTrackingBenefits';
import { ReportsBenefits } from '@/components/features/ReportsBenefits';
import { BudgetManagementBenefits } from '@/components/features/BudgetManagementBenefits';
import { TimeSavingsBenefits } from '@/components/features/TimeSavingsBenefits';
import { SecurityBenefits } from '@/components/features/SecurityBenefits';
import { CloudSyncBenefits } from '@/components/features/CloudSyncBenefits';

// Lazy load components to help identify which one might be failing
const Landing = lazy(() => import('@/pages/Landing').catch(error => {
  console.error('Error loading Landing component:', error);
  throw error;
}));
const Login = lazy(() => import('@/pages/Login').catch(error => {
  console.error('Error loading Login component:', error);
  throw error;
}));
const Register = lazy(() => import('@/pages/Register').catch(error => {
  console.error('Error loading Register component:', error);
  throw error;
}));
const Dashboard = lazy(() => import('@/pages/Dashboard').catch(error => {
  console.error('Error loading Dashboard component:', error);
  throw error;
}));
const NotFound = lazy(() => import('@/pages/NotFound').catch(error => {
  console.error('Error loading NotFound component:', error);
  throw error;
}));
const AuthCallback = lazy(() => import('@/pages/AuthCallback').catch(error => {
  console.error('Error loading AuthCallback component:', error);
  throw error;
}));
const Settings = lazy(() => import('@/pages/Settings').catch(error => {
  console.error('Error loading Settings component:', error);
  throw error;
}));

export function AppRoutes() {
  const location = useLocation();
  console.log('AppRoutes component rendering...');
  console.log('Current route:', location.pathname);
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
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
      </Suspense>
    </ErrorBoundary>
  );
} 