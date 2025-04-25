import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handling...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        if (session) {
          console.log('Session found, user authenticated successfully');
          toast.success('התחברת בהצלחה!');
          navigate('/dashboard');
        } else {
          console.error('No session found');
          throw new Error('לא נמצאה סשן פעילה');
        }
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        toast.error(error.message || 'שגיאה בהתחברות');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-dragonfly-600 border-t-transparent" />
    </div>
  );
} 