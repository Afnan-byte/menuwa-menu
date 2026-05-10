"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import Sidebar from "@/components/Sidebar";
import { Loader2, Bell, Search, Menu as MenuIcon, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-brand-green" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background-soft font-sans relative">
      {/* Sidebar - desktop version is static, mobile version is absolute/drawer */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 md:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-xl lg:hidden text-gray-500"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="relative w-48 md:w-96 hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search features..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-primary leading-none">{user.displayName || "Restaurant Owner"}</p>
              </div>
              <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-lg shadow-sm border border-brand-green/10">
                {user.displayName?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 animate-fade-in flex flex-col min-h-0 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
