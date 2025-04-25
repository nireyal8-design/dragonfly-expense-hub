import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/integrations/supabase/client";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

// Function to generate a random string for PKCE
function generateRandomString(length: number) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Function to generate code verifier and challenge
async function generatePKCE() {
  const codeVerifier = generateRandomString(128);
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return { codeVerifier, codeChallenge: base64Digest };
}

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Google sign-in...');
      
      const result = await signInWithGoogle();
      
      if (!result.url) {
        throw new Error('Failed to get Google sign-in URL');
      }
      
      console.log('Google sign-in URL:', result.url);
      window.location.href = result.url;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast.error('שגיאה בהתחברות עם Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      className="w-full"
      onClick={handleGoogleSignIn}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          <FcGoogle className="ml-2 h-5 w-5" />
          <span>המשך עם Google</span>
        </>
      )}
    </Button>
  );
} 