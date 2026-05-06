"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import Sidebar from "@/components/Sidebar";
import { Loader2, Bell, Search, ChevronRight } from "lucide-react";

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
    <div className="flex min-h-screen bg-background-light font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Topbar / Header */}
        <header className="h-24 bg-white/50 backdrop-blur-xl border-b border-gray-100/50 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-primary tracking-tight leading-none">
              Hello {user.displayName?.split(" ")[0] || "User"},
            </h1>
            <p className="text-xs font-bold text-gray-400 mt-1">Welcome back!</p>
          </div>

          <div className="flex items-center gap-6">
            <button className="px-6 py-2.5 bg-brand-orange text-white text-xs font-black rounded-full shadow-lg shadow-brand-orange/20 hover:scale-105 transition-all">
              Menu Guide
            </button>

            <div className="flex items-center gap-4 border-l border-r border-gray-100 px-6">
               <div className="relative cursor-pointer group">
                 <div className="p-2.5 bg-gray-50 text-gray-400 group-hover:text-primary rounded-xl transition-all">
                   <Search className="h-5 w-5" />
                 </div>
               </div>
               <div className="relative cursor-pointer group">
                 <div className="p-2.5 bg-gray-50 text-gray-400 group-hover:text-primary rounded-xl transition-all">
                   <Bell className="h-5 w-5" />
                 </div>
                 <span className="absolute -top-1 -right-1 h-5 w-5 bg-purple-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">4</span>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                 <p className="text-xs font-black text-primary leading-none">{user.displayName || "Admin"}</p>
                 <p className="text-[10px] text-gray-400 font-bold mt-1">Admin</p>
               </div>
               <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-md border-2 border-white ring-4 ring-gray-50">
                  <div className="h-full w-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-black text-lg">
                    {user.displayName?.charAt(0) || "A"}
                  </div>
               </div>
               <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="text-[10px] font-black text-primary">English</span>
                  <ChevronRight className="h-3 w-3 text-gray-400 rotate-90" />
               </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-10 bg-background-light animate-fade-in flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
