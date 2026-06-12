export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen w-full bg-zinc-50 flex items-center justify-center p-6">
      {children}
    </main>
  );
}
