"use client";

import { useAuth, AuthProvider } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Inner component — can safely call useAuth() because AuthProvider is above it
function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/dashboard");
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 text-[#196F03] animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hidden navbar for admin */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-[#196F03] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl">M</span>
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-widest">Super Admin</h1>
              <p className="text-[10px] text-gray-500 font-medium">Platform Management</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <a href="/admin" className="text-[10px] font-bold uppercase tracking-widest hover:text-[#196F03] transition-colors">Overview</a>
            <a href="/admin/stands" className="text-[10px] font-bold uppercase tracking-widest hover:text-[#196F03] transition-colors">QR Stands</a>
            <a href="/admin/users" className="text-[10px] font-bold uppercase tracking-widest hover:text-[#196F03] transition-colors">Restaurants</a>
            <a href="/admin/icons" className="text-[10px] font-bold uppercase tracking-widest hover:text-[#196F03] transition-colors">Category Icons</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}

// AuthProvider wraps the inner layout — (admin) is a separate route group
// from (dashboard) so it needs its own provider
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}
