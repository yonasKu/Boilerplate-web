"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, isAdmin, error } = useAdmin();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Clear any admin cookie in case it was set previously
      try { document.cookie = `sb_admin=; Path=/; Max-Age=0; SameSite=Lax`; } catch {}
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      try { document.cookie = `sb_admin=; Path=/; Max-Age=0; SameSite=Lax`; } catch {}
      router.replace("/");
      return;
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Checking admin permissions...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Redirecting...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  return <>{children}</>;
}
