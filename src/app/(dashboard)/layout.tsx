"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import Sidebar from "@/components/Sidebar";
import { Loader2, Bell, Search } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background-soft font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search features, menus..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary rounded-xl transition-all hover:scale-110">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-primary leading-none">{user.displayName || "Restaurant Owner"}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Premium Plan</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green font-black text-lg shadow-sm border border-brand-green/10">
                {user.displayName?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-10 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
