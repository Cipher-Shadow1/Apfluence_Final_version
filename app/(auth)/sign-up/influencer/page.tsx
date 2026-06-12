import { InfluencerSignUpForm } from "@/components/auth/InfluencerSignUpForm";
import { AnimatedGradientCard } from "@/components/ui/AnimatedGradientCard";
import { AuroraText } from "@/components/ui/AuroraText";
import Link from "next/link";

export default function InfluencerSignUpPage() {
  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden flex-col lg:flex-row bg-[#f0f4f8]">
      {/* Left: form — full width on mobile, 55% on lg+ */}
      <section className="flex h-full flex-1 flex-col overflow-y-auto px-6 py-10 lg:w-[55%] lg:justify-center lg:px-12 lg:py-16 xl:px-16 relative">
        <div className="mx-auto w-full max-w-md text-left lg:mx-0">
          <div className="mb-8 flex flex-row flex-nowrap items-baseline gap-3">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <AuroraText
                className="text-3xl font-bold tracking-tight"
                colors={[
                  "#1a1aff", // vivid blue
                  "#0066ff", // bright azure
                  "#0044cc", // strong royal
                  "#002299", // deep navy
                  "#1a1aff", // loop back
                ]}
                speed={0.8}
              >
                apfluence
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
        <InfluencerSignUpForm />
      </section>

      {/* Right: branded panel — desktop only */}
      <div className="hidden h-full shrink-0 lg:flex lg:w-[45%] lg:flex-col p-4 lg:p-6 lg:pl-0">
        <AnimatedGradientCard
          colors={[
            "#0D0D6B", // c1 — abyss (dark walls)
            "#2525F5", // c2 — electric (main blob)
            "#1212C8", // c3 — deep cobalt (background)
            "#3D4AE8", // c4 — royal (second blob)
            "#080838", // c5 — indigo glow (edge press)
          ]}
          speed={0.4}
          className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] shadow-2xl"
        >
          <div className="relative z-10 flex flex-1 flex-col px-8 pb-8 pt-10 md:px-10 md:pb-10 md:pt-12">
            <div className="flex justify-center">
              <AuroraText
                className="text-2xl font-bold tracking-tight"
                colors={[
                  "#ffffff", // pure white
                  "#a8c0ff", // ice blue
                  "#ffffff", // white again
                  "#c8d8ff", // soft blue-white
                  "#ffffff", // loop back
                ]}
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
      </div>
    </div>
  );
}
