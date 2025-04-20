import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState({
    email: "",
    first_name: "",
    last_name: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("משתמש לא מחובר");
        return;
      }

      // Check if user is authenticated with Google
      setIsGoogleUser(user.app_metadata?.provider === 'google');

      // Get user metadata from auth
      setUserData({
        email: user.email || "",
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("שגיאה בטעינת פרטי המשתמש");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsSaving(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error("משתמש לא מחובר");

      // Only update metadata if not a Google user
      if (!isGoogleUser) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
          }
        });

        if (updateError) throw updateError;
      }

      // Only update email if not a Google user
      if (!isGoogleUser && userData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: userData.email,
        });
        if (emailError) throw emailError;
        toast.success("נשלח אימייל אימות לכתובת החדשה");
      }

      // Update password if provided and not a Google user
      if (!isGoogleUser && newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;
        toast.success("הסיסמה עודכנה בהצלחה");
        setNewPassword(""); // Clear password field
        setShowPassword(false); // Hide password
      }

      toast.success("הפרופיל עודכן בהצלחה");
      await fetchUserProfile(); // Refresh data
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`שגיאה בעדכון הפרופיל: ${error.message}`);
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
        <CardTitle>הגדרות פרופיל</CardTitle>
        <CardDescription>עדכן את פרטי הפרופיל שלך</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">שם פרטי</Label>
              <Input
                id="first_name"
                value={userData.first_name}
                onChange={(e) => setUserData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="הזן שם פרטי"
                disabled={isGoogleUser}
                className={isGoogleUser ? "bg-gray-100" : ""}
              />
              {isGoogleUser && (
                <p className="text-sm text-gray-500 mt-1">
                  לא ניתן לשנות את השם הפרטי למשתמשים שהתחברו דרך Google
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">שם משפחה</Label>
              <Input
                id="last_name"
                value={userData.last_name}
                onChange={(e) => setUserData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="הזן שם משפחה"
                disabled={isGoogleUser}
                className={isGoogleUser ? "bg-gray-100" : ""}
              />
              {isGoogleUser && (
                <p className="text-sm text-gray-500 mt-1">
                  לא ניתן לשנות את שם המשפחה למשתמשים שהתחברו דרך Google
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="הזן כתובת אימייל"
              disabled={isGoogleUser}
              className={isGoogleUser ? "bg-gray-100" : ""}
            />
            {isGoogleUser && (
              <p className="text-sm text-gray-500 mt-1">
                לא ניתן לשנות את כתובת האימייל למשתמשים שהתחברו דרך Google
              </p>
            )}
          </div>

          {!isGoogleUser && (
            <div>
              <Label htmlFor="password">סיסמה חדשה</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="השאר ריק אם אין צורך בשינוי"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleUpdateProfile} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              מעדכן...
            </>
          ) : (
            "שמור שינויים"
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 