import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { AdvancedSettings } from "@/components/settings/AdvancedSettings";
import { HelpSupport } from "@/components/settings/HelpSupport";
import { RecurringExpensesSettings } from "@/components/settings/RecurringExpensesSettings";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreditCardImport } from '@/components/expenses/CreditCardImport';
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { Goals } from "@/components/settings/Goals";

export default function Settings() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // First try to get the name from user_metadata
        const firstName = user.user_metadata?.first_name;
        
        // If not in metadata, try to get it from the users table
        if (!firstName) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('first_name')
            .eq('id', user.id as string)
            .single();
            
          if (error) {
            console.error("Error fetching user data:", error);
          } else if (userData?.first_name) {
            setUserName(userData.first_name);
            return;
          }
        }
        
        // If we have a valid first name in metadata, use it
        if (firstName && firstName.trim() !== "") {
          setUserName(firstName.trim());
        } else {
          setUserName(""); // Show just "שלום" if no name is found
        }
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">שלום, {userName}</h1>
              <Logo size="large" />
            </div>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">הגדרות</h1>
          </div>
        </div>

        <Tabs defaultValue="profile" dir="rtl">
          <TabsList className="grid w-full grid-cols-7">
            {/* User Profile & Basic Settings */}
            <TabsTrigger value="profile">פרופיל</TabsTrigger>
            <TabsTrigger value="advanced">דוחות</TabsTrigger>
            
            {/* Financial Management */}
            <TabsTrigger value="goals">קביעת מטרות ויעדים</TabsTrigger>
            <TabsTrigger value="recurring">הוצאות חוזרות</TabsTrigger>
            <TabsTrigger value="credit-card">טעינת הוצאות מכרטיס אשראי</TabsTrigger>
            
            {/* System & Support */}
            <TabsTrigger value="notifications">התראות</TabsTrigger>
            <TabsTrigger value="help">עזרה ותמיכה</TabsTrigger>
          </TabsList>
          
          {/* User Profile & Basic Settings */}
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="advanced">
            <AdvancedSettings />
          </TabsContent>
          
          {/* Financial Management */}
          <TabsContent value="goals">
            <div className="space-y-6">
              <Goals />
            </div>
          </TabsContent>
          <TabsContent value="recurring">
            <RecurringExpensesSettings />
          </TabsContent>
          <TabsContent value="credit-card">
            <div className="space-y-6">
              <CreditCardImport />
            </div>
          </TabsContent>
          
          {/* System & Support */}
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>
          <TabsContent value="help">
            <HelpSupport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 