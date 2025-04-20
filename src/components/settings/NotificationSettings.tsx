import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { EmailFrequencySelect } from "./EmailFrequencySelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type NotificationType = 'all' | 'new_expense' | 'budget_over';

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    email_notifications: false,
    push_notifications: false,
    monthly_summary: false,
    email_frequency: 'immediately',
    notification_type: 'all' as NotificationType,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("משתמש לא מחובר");
        return;
      }

      // First try to get existing settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from('notification_settings')
        .select('email_notifications, push_notifications, monthly_summary, email_frequency, notification_type')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingSettings) {
        // Create default settings if none exist
        const { data: newSettings, error: insertError } = await supabase
          .from('notification_settings')
          .insert([{
            user_id: user.id,
            email_notifications: false,
            push_notifications: false,
            monthly_summary: false,
            email_frequency: 'immediately',
            notification_type: 'all'
          }])
          .select('email_notifications, push_notifications, monthly_summary, email_frequency, notification_type')
          .single();

        if (insertError) throw insertError;

        if (newSettings) {
          setSettings({
            email_notifications: newSettings.email_notifications,
            push_notifications: newSettings.push_notifications,
            monthly_summary: newSettings.monthly_summary,
            email_frequency: newSettings.email_frequency,
            notification_type: newSettings.notification_type,
          });
        }
      } else {
        setSettings({
          email_notifications: existingSettings.email_notifications,
          push_notifications: existingSettings.push_notifications,
          monthly_summary: existingSettings.monthly_summary,
          email_frequency: existingSettings.email_frequency,
          notification_type: existingSettings.notification_type,
        });
      }
    } catch (error: any) {
      console.error("Error fetching notification settings:", error);
      toast.error("שגיאה בטעינת הגדרות ההתראות");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof typeof settings, value?: any) => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("משתמש לא מחובר");
        return;
      }

      const newValue = value !== undefined ? value : !settings[key];

      const { error } = await supabase
        .from('notification_settings')
        .update({
          [key]: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: newValue }));
      toast.success("ההגדרות עודכנו בהצלחה");
    } catch (error: any) {
      console.error("Error updating notification settings:", error);
      toast.error("שגיאה בעדכון ההגדרות");
      // Revert the optimistic update if there was an error
      await fetchNotificationSettings();
    } finally {
      setIsSaving(false);
    }
  };

  const updateEmailFrequency = async (frequency: string) => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("משתמש לא מחובר");
        return;
      }

      const { error } = await supabase
        .from('notification_settings')
        .update({
          email_frequency: frequency,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, email_frequency: frequency }));
      toast.success("תדירות ההתראות עודכנה בהצלחה");
    } catch (error: any) {
      console.error("Error updating email frequency:", error);
      toast.error("שגיאה בעדכון תדירות ההתראות");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>הגדרות התראות</CardTitle>
        <CardDescription>נהל את העדפות ההתראות שלך</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="email_notifications" className="flex flex-col gap-1.5">
                <span>התראות אימייל</span>
                <span className="font-normal text-sm text-muted-foreground">
                  קבל התראות על הוצאות חדשות והתראות חריגה מהתקציב
                </span>
              </Label>
              <div className="flex items-center gap-4" dir="ltr">
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={() => updateSetting('email_notifications')}
                  disabled={isSaving}
                  className="data-[state=checked]:bg-dragonfly-600 [&>span]:data-[state=checked]:translate-x-5"
                />
              </div>
            </div>
            
            {settings.email_notifications && (
              <div className="mr-8 space-y-4">
                <div className="flex items-center gap-4">
                  <Label>סוג התראות:</Label>
                  <Select
                    value={settings.notification_type}
                    onValueChange={(value: NotificationType) => {
                      updateSetting('notification_type', value);
                    }}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="בחר סוג התראות" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">כל ההתראות</SelectItem>
                      <SelectItem value="new_expense">הוצאות חדשות בלבד</SelectItem>
                      <SelectItem value="budget_over">חריגה מתקציב בלבד</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <Label>תדירות שליחת התראות:</Label>
                  <EmailFrequencySelect
                    value={settings.email_frequency}
                    onChange={updateEmailFrequency}
                    disabled={isSaving}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="push_notifications" className="flex flex-col gap-1.5">
              <span>התראות דחיפה</span>
              <span className="font-normal text-sm text-muted-foreground">
                קבל התראות בזמן אמת על עדכונים חשובים
              </span>
            </Label>
            <div className="flex items-center justify-center" dir="ltr">
              <Switch
                id="push_notifications"
                checked={settings.push_notifications}
                onCheckedChange={() => updateSetting('push_notifications')}
                disabled={isSaving}
                className="data-[state=checked]:bg-dragonfly-600 [&>span]:data-[state=checked]:translate-x-5"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="monthly_summary" className="flex flex-col gap-1.5">
              <span>סיכום חודשי</span>
              <span className="font-normal text-sm text-muted-foreground">
                קבל סיכום חודשי של ההוצאות והתקציב שלך
              </span>
            </Label>
            <div className="flex items-center justify-center" dir="ltr">
              <Switch
                id="monthly_summary"
                checked={settings.monthly_summary}
                onCheckedChange={() => updateSetting('monthly_summary')}
                disabled={isSaving}
                className="data-[state=checked]:bg-dragonfly-600 [&>span]:data-[state=checked]:translate-x-5"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 