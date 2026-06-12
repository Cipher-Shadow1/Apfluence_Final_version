import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6">
      <h1 className="text-xl font-semibold text-zinc-900">Forgot password</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Use &apos;s recovery flow from the sign-in screen to reset your password.
      </p>
      <div className="mt-5">
        <Link
          href="/sign-in"
          className="inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          Go to Sign In
        </Link>
      </div>
    </section>
  );
}
