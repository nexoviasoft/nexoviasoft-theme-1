"use client";

import { Suspense } from "react";
import LoginForm from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <div className="">
      <div className="max-w-7xl mx-auto px-5 h-screen flex items-center justify-center">
        <Suspense fallback={<p>Loading...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
