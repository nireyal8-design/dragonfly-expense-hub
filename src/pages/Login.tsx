import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <AuthLayout
      title="ברוך שובך"
      description="הזן את האימייל שלך כדי להתחבר לחשבונך"
      footer={
        <>
          אין לך חשבון?{" "}
          <Link to="/register" className="text-dragonfly-600 hover:text-dragonfly-700 hover:underline">
            הרשם
          </Link>
        </>
      }
      hebrewContent={
        <>
          <h1 className="text-4xl font-bold">SpendWise</h1>
          <p className="text-lg text-dragonfly-100">
            פשט את ניהול הכספים שלך, עקוב אחר הוצאות בקלות, וקבל תובנות בעלות ערך. הצטרף לאלפי משתמשים ששינו את ניהול הכספים שלהם עם SpendWise.
          </p>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
