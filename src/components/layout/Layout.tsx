import { NotificationSystem } from '@/components/notifications/NotificationSystem';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
        <NotificationSystem />
      </main>
    </div>
  );
} 