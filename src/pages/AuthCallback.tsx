import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Insert'];

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handling...');
        const code = searchParams.get('code');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const codeVerifier = sessionStorage.getItem('code_verifier');
        
        console.log('Auth callback parameters:', { 
          code: code ? 'present' : 'missing', 
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing',
          codeVerifier: codeVerifier ? 'present' : 'missing',
          searchParams: Object.fromEntries(searchParams.entries())
        });
        
        if (!code && !accessToken) {
          console.error('Missing required parameters:', { code, accessToken });
          setError('Authentication failed: Missing required parameters');
          return;
        }

        // Get the session from Supabase
        console.log('Attempting to get session from Supabase...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session check result:', { 
          hasSession: !!session,
          sessionError: sessionError?.message,
          sessionUser: session?.user
        });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(`Session error: ${sessionError.message}`);
          return;
        }

        if (session) {
          console.log('Session found, setting user and navigating to dashboard');
          console.log('User details:', {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role
          });
          setUser(session.user);
          navigate('/dashboard');
        } else {
          console.log('No session found, redirecting to login');
          navigate('/login');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  if (isLoading) {
    console.log('Rendering loading state...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    console.error('Rendering error state:', error);
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: error,
    });
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-destructive">Authentication Failed</h1>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return null;
} 