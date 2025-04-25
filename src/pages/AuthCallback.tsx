import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handling...');
        console.log('Location:', location);
        console.log('Hash:', location.hash);

        // Parse the hash parameters
        const hashParams = new URLSearchParams(location.hash.substring(1));
        console.log('Hash params:', Object.fromEntries(hashParams.entries()));

        // Check if we have an access token
        const accessToken = hashParams.get('access_token');
        if (!accessToken) {
          throw new Error('No access token found in callback');
        }

        // Get the session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        if (session) {
          console.log('Session found, user authenticated successfully');
          console.log('User:', session.user);
          toast.success('התחברת בהצלחה!');
          navigate('/dashboard');
        } else {
          // Try to get the session again after a short delay
          setTimeout(async () => {
            const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession();
            if (retryError) {
              console.error('Retry session error:', retryError);
              throw retryError;
            }
            if (retrySession) {
              console.log('Session found on retry, user authenticated successfully');
              console.log('User:', retrySession.user);
              toast.success('התחברת בהצלחה!');
              navigate('/dashboard');
            } else {
              console.error('No session found after retry');
              throw new Error('לא נמצאה סשן פעילה');
            }
          }, 1000);
        }
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        toast.error(error.message || 'שגיאה בהתחברות');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [navigate, location]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-dragonfly-600 border-t-transparent" />
      </div>
    );
  }

  return null;
} 