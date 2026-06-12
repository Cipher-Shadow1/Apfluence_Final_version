import { Suspense } from "react";
import { AuthCallbackClient } from "./AuthCallbackClient";

function AuthCallbackFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-800 border-b-neutral-200" />
      <p className="text-center text-lg font-medium">Loading...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackClient />
    </Suspense>
  );
}
