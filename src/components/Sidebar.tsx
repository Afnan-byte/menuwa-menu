"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Utensils, 
  QrCode, 
  Settings, 
  LogOut, 
  User as UserIcon,
  ChevronRight,
  TrendingUp,
  Tag,
  Users,
  Plus,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const navGroups = [
    {
      title: "Main",
      items: [
        { icon: LayoutDashboard, label: "Orders", href: "/dashboard", hasSub: true },
        { icon: Utensils, label: "Menus", href: "/menu", hasSub: true, expanded: true },
        { icon: QrCode, label: "Catalogue", href: "/catalogue" },
        { icon: TrendingUp, label: "Analytics", href: "/analytics" },
        { icon: Tag, label: "Tags", href: "/tags" },
        { icon: Users, label: "Customers", href: "/customers" },
        { icon: Settings, label: "Setting", href: "/settings" },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-white flex flex-col h-screen sticky top-0 font-sans sidebar-shadow z-20">
      {/* Logo Section */}
      <div className="p-8 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <span className="text-3xl font-black italic tracking-tighter text-brand-orange">Food</span>
          <span className="text-3xl font-black italic tracking-tighter text-brand-green">Mode</span>
        </Link>
      </div>

      <nav className="flex-1 px-6 mt-4 space-y-8 overflow-y-auto no-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.label === "Menus" && pathname === "/menu");
              return (
                <div key={item.label} className="space-y-1">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                      isActive 
                        ? "bg-brand-orange/5 text-brand-orange" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        isActive ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20" : "text-gray-400 group-hover:text-primary"
                      )}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </div>
                    {item.hasSub && <ChevronRight className={cn("h-4 w-4 transition-transform", isActive && "rotate-90")} />}
                  </Link>
                  
                  {item.label === "Menus" && isActive && (
                    <div className="ml-14 space-y-3 pt-2 pb-2">
                      <Link href="/menu/add" className="block text-xs font-bold text-gray-400 hover:text-primary transition-colors">Add New Menu</Link>
                      <Link href="/menu" className="block text-xs font-bold text-gray-700 transition-colors">Menu List</Link>
                      <Link href="/menu/categories" className="block text-xs font-bold text-gray-400 hover:text-primary transition-colors">Categories</Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer Card */}
      <div className="p-6">
        <div className="bg-brand-green/10 rounded-[2rem] p-6 mb-8 relative overflow-hidden group cursor-pointer hover:bg-brand-green/15 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <Utensils className="h-16 w-16 text-brand-green" />
          </div>
          <div className="relative z-10">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <Plus className="h-6 w-6 text-brand-green" />
            </div>
            <p className="text-xs font-black text-brand-green uppercase tracking-widest mb-1">Add Menus</p>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Manage your food and beverages menus</p>
            <div className="mt-4 flex items-center justify-end">
              <div className="h-6 w-6 rounded-lg bg-brand-green text-white flex items-center justify-center shadow-md">
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-2">
          <p className="text-[11px] font-black text-primary">Brand Restaurant Admin</p>
          <p className="text-[10px] text-gray-400 mt-1">2024 All Rights Reserved</p>
          <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">Made with <span className="text-red-500">❤</span> by Menuvo</p>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group font-bold text-sm mt-6"
        >
          <LogOut className="h-5 w-5 group-hover:text-red-600" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
