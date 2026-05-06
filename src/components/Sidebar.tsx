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
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Utensils, label: "Menu Manager", href: "/menu" },
  { icon: QrCode, label: "QR Code", href: "/qr" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

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

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 font-sans">
      <div className="p-8 mb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-primary p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/10">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black text-primary tracking-tighter">Menuvo</span>
        </Link>
      </div>

      <nav className="flex-1 px-6 space-y-2">
        <p className="px-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Main Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group",
                isActive
                  ? "bg-brand-green text-white shadow-xl shadow-brand-green/20 scale-[1.02]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              {isActive && <motion.div layoutId="sidebar-active" className="w-1.5 h-1.5 rounded-full bg-white shadow-glow" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-gray-50 rounded-3xl p-5 mb-6">
          <p className="text-xs font-bold text-primary mb-1">Need help?</p>
          <p className="text-[10px] text-gray-500 font-medium mb-3">Check our documentation or contact support.</p>
          <button className="w-full py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-primary uppercase tracking-wider hover:bg-primary hover:text-white transition-all shadow-sm">
            Support Center
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group font-bold text-sm"
        >
          <LogOut className="h-5 w-5 group-hover:text-red-600" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
