import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Insert'];

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Debug user metadata
            console.log('User metadata:', user.user_metadata);
            console.log('Raw app metadata:', user.app_metadata);
            
            // Extract first and last name from user metadata
            const fullName = user.user_metadata.full_name || user.user_metadata.name || '';
            console.log('Full name:', fullName);
            
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            console.log('First name:', firstName);
            console.log('Last name:', lastName);

            // Update or create user profile in the users table
            const { error: profileError } = await supabase
              .from('users')
              .upsert({
                id: user.id,
                email: user.email,
                first_name: firstName,
                last_name: lastName,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              } as any, {
                onConflict: 'id'
              });

            if (profileError) {
              console.error('Error updating user profile:', profileError);
            }
          }

          toast.success('התחברת בהצלחה!');
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast.error(`שגיאה: ${error.message || 'אירעה שגיאה בהתחברות'}`);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
    </div>
  );
} 