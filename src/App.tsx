import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { RouteLogger } from '@/components/RouteLogger';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppRoutes } from '@/routes';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

console.log('App component initializing...');
console.log('Supabase client initialized:', !!supabase);
console.log('Query client initialized:', !!queryClient);

export function App() {
  console.log('App component rendering...');
  console.log('Current path:', window.location.pathname);
  console.log('Environment variables:', {
    BASE_URL: import.meta.env.BASE_URL,
    MODE: import.meta.env.MODE,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  });

  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <RouteLogger />
        <SessionContextProvider supabaseClient={supabase}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AuthProvider>
                <TooltipProvider>
                  <div className="app-container">
                    <AppRoutes />
                    <Toaster />
                  </div>
                </TooltipProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </SessionContextProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
