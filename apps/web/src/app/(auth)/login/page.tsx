import * as React from "react";

import { googleConfigured } from "@/lib/oauth";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <React.Suspense>
      <LoginForm googleEnabled={googleConfigured()} />
    </React.Suspense>
  );
}