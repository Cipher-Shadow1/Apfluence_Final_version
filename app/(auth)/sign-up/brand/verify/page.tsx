export const dynamic = "force-dynamic";

import { BrandVerifyEmailForm } from "@/components/auth/BrandVerifyEmailForm";

export default function BrandVerifyEmailPage() {
  return (
    <section className="w-full max-w-md space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Verify your email</h1>
      <BrandVerifyEmailForm />
    </section>
  );
}
