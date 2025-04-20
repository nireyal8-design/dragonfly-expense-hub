
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <AuthLayout
      title="צור חשבון"
      description="הזן את הפרטים שלך כדי ליצור חשבון חדש"
      footer={
        <>
          כבר יש לך חשבון?{" "}
          <Link to="/login" className="text-dragonfly-600 hover:text-dragonfly-700 hover:underline">
            התחבר
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
