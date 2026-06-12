import { InfluencerSignInForm } from "@/components/auth/InfluencerSignInForm";
import { AnimatedGradientCard } from "@/components/ui/AnimatedGradientCard";
import { AuroraText } from "@/components/ui/AuroraText";
import Link from "next/link";

export default function InfluencerSignInPage() {
  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden flex-col lg:flex-row bg-[#f0f4f8]">
      {/* LEFT panel: form */}
      <section className="flex h-full flex-1 flex-col overflow-y-auto px-6 py-10 lg:w-[55%] lg:justify-center lg:px-12 lg:py-16 xl:px-16 relative">
        <div className="mx-auto w-full max-w-md text-left lg:mx-0">
          <div className="mb-8 flex flex-row flex-nowrap items-baseline gap-3">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <AuroraText
                className="text-3xl font-bold tracking-tight"
                colors={["#1a1aff", "#0066ff", "#0044cc", "#002299", "#1a1aff"]}
                speed={0.8}
              >
                Apfluence
              </AuroraText>
            </Link>
            <span className="text-zinc-300 select-none" aria-hidden>
              |
            </span>
            <span className="text-2xl font-medium tracking-tight text-zinc-600">
              for Creators
            </span>
          </div>
        </div>

        <InfluencerSignInForm />
      </section>

      {/* RIGHT panel: AnimatedGradientCard */}
      <aside className="hidden h-full shrink-0 lg:flex lg:w-[45%] lg:flex-col p-4 lg:p-6 lg:pl-0">
        <AnimatedGradientCard
          colors={["#0D0D6B", "#2525F5", "#1212C8", "#3D4AE8", "#080838"]}
          speed={0.4}
          className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] shadow-2xl"
        >
          <div className="relative z-10 flex flex-1 flex-col px-8 pb-8 pt-10 md:px-10 md:pb-10 md:pt-12">
            <div className="flex justify-center">
              <AuroraText
                className="text-2xl font-bold tracking-tight"
                colors={["#ffffff", "#a8c0ff", "#ffffff", "#c8d8ff", "#ffffff"]}
                speed={0.6}
              >
                apfluence
              </AuroraText>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center py-10 md:py-14">
              <p className="max-w-sm text-center text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
                Start collaborating with brands that match your style.
              </p>
            </div>
          </div>
        </AnimatedGradientCard>
      </aside>
    </div>
  );
}
