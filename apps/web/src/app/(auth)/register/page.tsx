import { googleConfigured } from "@/lib/oauth";

import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return <RegisterForm googleEnabled={googleConfigured()} />;
}