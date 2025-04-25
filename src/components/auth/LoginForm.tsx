import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      toast.success("התחברת בהצלחה!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(`שגיאה: ${error.message || 'אירעה שגיאה בהתחברות'}`);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onResetPassword(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("נשלח לך מייל לאיפוס הסיסמה");
      setIsResettingPassword(false);
    } catch (error: any) {
      toast.error(`שגיאה: ${error.message || 'אירעה שגיאה בשליחת דוא"ל לאיפוס הסיסמה'}`);
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isResettingPassword) {
    return (
      <div className="grid gap-6">
        <form onSubmit={onResetPassword}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="resetEmail">אימייל</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="resetEmail"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  required
                  className="pl-10"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="bg-dragonfly-600 hover:bg-dragonfly-700">
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "שלח מייל לאיפוס סיסמה"
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsResettingPassword(false)}>
              חזור להתחברות
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <GoogleSignInButton />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            או התחבר עם אימייל
          </span>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">אימייל</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                required
                className="pl-10"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">סיסמה</Label>
              <button
                type="button"
                onClick={() => setIsResettingPassword(true)}
                className="text-xs text-dragonfly-600 hover:text-dragonfly-700 hover:underline"
              >
                שכחת סיסמה?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isLoading}
                required
                className="pl-10 pr-10"
                value={formData.password}
                onChange={handleChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
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
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="rememberMe" className="text-sm font-normal">
              זכור אותי
            </Label>
          </div>
          <Button type="submit" disabled={isLoading} className="bg-dragonfly-600 hover:bg-dragonfly-700">
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              "התחבר"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
