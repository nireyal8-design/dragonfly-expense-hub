import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Insert'];

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback handling...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        console.log('Search:', window.location.search);
        
        // Get the authorization code from the URL
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        
        if (!code) {
          console.error('No authorization code found in URL');
          toast.error('Authentication failed: No authorization code found');
          navigate('/login');
          return;
        }

        console.log('Authorization code found:', code);

        // Get the code verifier from session storage
        const codeVerifier = sessionStorage.getItem('code_verifier');
        if (!codeVerifier) {
          console.error('No code verifier found in session storage');
          toast.error('Authentication failed: No code verifier found');
          navigate('/login');
          return;
        }

        console.log('Code verifier found:', codeVerifier);

        // Check if we already have a session
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          toast.error(`Authentication failed: ${sessionError.message}`);
          navigate('/login');
          return;
        }

        if (existingSession) {
          console.log('Session already exists:', {
            userId: existingSession.user.id,
            email: existingSession.user.email
          });
          navigate('/dashboard');
          return;
        }

        // Sign in with OAuth using the code and verifier
        const { data, error: signInError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: {
              code,
              code_verifier: codeVerifier
            },
            skipBrowserRedirect: true
          }
        });

        if (signInError) {
          console.error('Error signing in with OAuth:', signInError);
          toast.error(`Authentication failed: ${signInError.message}`);
          navigate('/login');
          return;
        }

        if (!data?.url) {
          console.error('No redirect URL returned from OAuth sign in');
          toast.error('Authentication failed: No redirect URL returned');
          navigate('/login');
          return;
        }

        // Redirect to the URL returned by Supabase
        window.location.href = data.url;

        // Get the current session
        const { data: { session }, error: newSessionError } = await supabase.auth.getSession();

        if (newSessionError) {
          console.error('Error getting session:', newSessionError);
          toast.error(`Authentication failed: ${newSessionError.message}`);
          navigate('/login');
          return;
        }

        if (!session) {
          console.error('No session found');
          toast.error('Authentication failed: No session found');
          navigate('/login');
          return;
        }

        console.log('Session established successfully:', {
          userId: session.user.id,
          email: session.user.email
        });

        // Extract user metadata
        const { user } = session;
        const { first_name, last_name } = user.user_metadata;

        // Update user profile in the database
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: parseInt(user.id),
            email: user.email,
            first_name: first_name || user.user_metadata.first_name,
            last_name: last_name || user.user_metadata.last_name,
            created_at: new Date().toISOString(),
            password: '', // Required field but not used for OAuth users
          });

        if (upsertError) {
          console.error('Error updating user profile:', upsertError);
          toast.error(`Profile update failed: ${upsertError.message}`);
        }

        // Show success message
        toast.success('התחברת בהצלחה!');
        
        // Clear the code verifier from session storage
        sessionStorage.removeItem('code_verifier');
        
        // Clear the URL parameters to prevent issues with routing
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Navigate to dashboard
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        toast.error(`Authentication failed: ${error.message}`);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-dragonfly-600 border-t-transparent" />
        <p className="text-lg font-medium">מעבד את ההתחברות...</p>
      </div>
    </div>
  );
} 