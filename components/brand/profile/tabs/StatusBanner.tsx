import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface StatusBannerProps {
  status: "idle" | "success" | "error";
  successMessage?: string;
  errorMessage?: string;
}

export function StatusBanner({
  status,
  successMessage = "Changes saved successfully",
  errorMessage = "Failed to save changes",
}: StatusBannerProps) {
  return (
    <AnimatePresence>
      {status !== "idle" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-6 border ${
            status === "success"
              ? "bg-green-50 border-green-100 text-green-700"
              : "bg-red-50 border-red-100 text-red-700"
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 size={16} className="text-green-500" />
          ) : (
            <AlertCircle size={16} className="text-red-500" />
          )}
          <span className="text-sm font-medium">
            {status === "success" ? successMessage : errorMessage}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
