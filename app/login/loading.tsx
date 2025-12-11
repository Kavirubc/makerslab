import { AuthFormSkeleton } from "@/components/auth-form-skeleton";

export default function LoginLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md mx-auto lg:max-w-2xl">
          <AuthFormSkeleton />
        </div>
      </div>
    </div>
  );
}
