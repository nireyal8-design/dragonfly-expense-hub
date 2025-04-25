import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('404 - Not Found page rendered');
    console.log('Current path:', location.pathname);
    console.log('Previous path:', document.referrer);
  }, [location]);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you are looking for does not exist.
        </p>
        <Button
          onClick={() => {
            console.log('Navigating back...');
            navigate(-1);
          }}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
