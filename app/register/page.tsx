import React, { Suspense } from "react";

import { RegisterForm } from "@/components/register-form";
import { AuthFormSkeleton } from "@/components/auth-form-skeleton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Register() {
  const session = await auth();

  if (session) {
    return redirect("/dashboard");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="w-full max-w-md mx-auto lg:max-w-2xl">
              <AuthFormSkeleton />
            </div>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
