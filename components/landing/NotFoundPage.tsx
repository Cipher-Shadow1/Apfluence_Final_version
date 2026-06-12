import { motion } from "motion/react";
import Link from "next/link";
import { Hammer, Sparkles, HardHat, Rocket } from "lucide-react";

export default function NotFoundPage() {
  // Floating animation variants for the background emojis
  const FloatingIcon = ({
    children,
    className,
    duration = 3,
  }: {
    children: React.ReactNode;
    className?: string;
    duration?: number;
  }) => (
    <motion.div
      className={className}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut" as const,
      }}
    >
      {children}
    </motion.div>
  );
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[var(--color-bg-notfound)] text-white">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30"
          style={{ background: "var(--color-primary)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
          style={{ background: "var(--color-gradient-end)" }}
        />
      </div>

      {/* Floating Icons / Emojis Background */}
      <FloatingIcon
        className="absolute top-[20%] left-[15%] text-[var(--color-primary)] opacity-80"
        duration={4}
      >
        <HardHat size={48} />
      </FloatingIcon>

      <FloatingIcon
        className="absolute bottom-[25%] left-[25%] text-5xl"
        duration={5.5}
      >
        🚧
      </FloatingIcon>

      <FloatingIcon
        className="absolute top-[30%] right-[20%] text-6xl"
        duration={4.5}
      >
        ✨
      </FloatingIcon>

      <FloatingIcon
        className="absolute bottom-[20%] right-[15%] text-[var(--color-gradient-end)] opacity-80"
        duration={5}
      >
        <Rocket size={48} />
      </FloatingIcon>

      <FloatingIcon
        className="absolute top-[10%] left-[45%] text-orange-400 opacity-60"
        duration={3.5}
      >
        <Hammer size={32} />
      </FloatingIcon>

      {/* Main Content */}
      <motion.div
        className="z-10 flex flex-col items-center text-center px-6 max-w-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-[120px] md:text-[180px] font-black leading-none mb-2"
          style={{
            background:
              "linear-gradient(135deg, var(--color-primary) 0%, var(--color-gradient-end) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0px 10px 20px rgba(43, 46, 248, 0.3))",
          }}
        >
          404
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-2xl md:text-3xl font-bold mb-4 tracking-tight"
        >
          Oops! You found a missing page
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-gray-400 text-lg md:text-xl mb-10 leading-relaxed font-medium"
        >
          We are currently building this section of the site. <br />
          Please be patient, our best engineers are on it! 👨‍💻
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Link
            href="/"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary)] overflow-hidden rounded-full font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(43,46,248,0.7)]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-gradient-end)] opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative flex items-center gap-2">
              <Sparkles size={18} />
              Take Me Back Home
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
