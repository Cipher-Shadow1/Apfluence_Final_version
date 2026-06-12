"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBanner } from "./StatusBanner";
import { createClient } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/auth/useSupabaseUser";

export function SecurityTab() {
  const { userId } = useSupabaseUser();
  const supabase = createClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "success" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  const handleChangePassword = async () => {
    if (!userId) return;
    if (newPassword !== confirmPassword) {
      setPasswordStatus("error");
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      setPasswordStatus("error");
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatus("idle");
    setPasswordError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("User email not found");
      const reauth = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauth.error) throw new Error("Current password is incorrect.");
      const updated = await supabase.auth.updateUser({ password: newPassword });
      if (updated.error) throw updated.error;
      setPasswordStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordStatus("error");
      setPasswordError(
        err?.message || "Failed to update password",
      );
    } finally {
      setIsChangingPassword(false);
      setTimeout(() => setPasswordStatus("idle"), 3000);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Security</h3>
      <p className="text-sm text-gray-400 mb-6">
        Manage your password, 2FA, and active sessions.
      </p>

      {passwordStatus === "error" && (
        <StatusBanner status="error" errorMessage={passwordError} />
      )}
      {passwordStatus === "success" && (
        <StatusBanner status="success" successMessage="Password updated successfully" />
      )}

      {/* Password update form */}
      <div className="py-4 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-800 mb-4">Change Password</p>
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="off"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#2b2ef8]/10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#2b2ef8]/10"
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#2b2ef8] focus:ring-2 focus:ring-[#2b2ef8]/10"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium text-white transition-all w-full flex justify-center items-center gap-2",
              isChangingPassword || !currentPassword || !newPassword || !confirmPassword
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#2b2ef8] hover:bg-[#1a1ce8] shadow-sm",
            )}
          >
            {isChangingPassword ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </div>

      {/* 2FA read-only row */}
      <div className="py-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">
              Two-factor authentication
            </p>
            <p className="text-xs text-gray-400 max-w-xs">
              Add an extra layer of security to your account.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-100">
            <>
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-400">Managed by Supabase Auth</span>
            </>
          </div>
        </div>
      </div>

      {/* Active sessions row */}
      <div className="py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Active sessions</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Your active sessions and devices are protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
