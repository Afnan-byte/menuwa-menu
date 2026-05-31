"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Utensils,
  QrCode,
  Settings,
  LogOut,
  MessageCircle,
  ChevronRight,
  Mail,
  ShieldCheck,
  X
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase-auth";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Utensils, label: "Menu Manager", href: "/menu" },
  { icon: QrCode, label: "QR Code", href: "/qr" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const WHATSAPP_NUMBER = "918089685278";
  const SUPPORT_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Menuwo%20Support!%20I%20need%20help%20with%20my%20dashboard.`;

  return (
    <aside className="w-full h-full bg-white border-r border-gray-100 flex flex-col font-sans z-50">
      <div className="h-20 flex items-center justify-between px-8 border-b border-gray-50/50 mb-4">
        <Link href="/dashboard" className="flex items-center">
          <div className="relative h-10 w-32 transition-transform hover:scale-105">
            <img src="/logo.svg" alt="Logo" className="h-full w-full object-contain object-left" />
          </div>
        </Link>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl lg:hidden text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        <p className="px-5 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-4 mt-6 opacity-70">Main Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group",
                isActive
                  ? "bg-[#196F03] text-white shadow-xl scale-[1.02]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                <span className="font-semibold text-sm tracking-tight">{item.label}</span>
              </div>
              {isActive && <motion.div layoutId="sidebar-active" className="w-1.5 h-1.5 rounded-full bg-white shadow-glow" />}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <p className="px-5 text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] mb-4 mt-8 opacity-70">Super Admin</p>
            <Link
              href="/admin"
              className={cn(
                "flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group",
                pathname.startsWith("/admin")
                  ? "bg-black text-white shadow-xl scale-[1.02]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-black"
              )}
            >
              <div className="flex items-center gap-4">
                <ShieldCheck className={cn("h-5 w-5", pathname.startsWith("/admin") ? "text-[#196F03]" : "text-gray-400 group-hover:text-black")} />
                <span className="font-semibold text-sm tracking-tight">Admin Panel</span>
              </div>
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-primary/5 rounded-[2rem] p-6 mb-4 border border-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1.5 w-1.5 bg-[#196F03] rounded-full animate-pulse" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Support Centre</p>
          </div>
          <p className="text-[10px] text-gray-400 font-medium mb-4 leading-relaxed">Need help? Chat with our experts directly.</p>
          <div className="flex flex-col gap-2">
            <a 
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-white border border-gray-100 rounded-xl text-[9px] font-bold text-primary uppercase tracking-widest hover:bg-[#196F03] hover:text-white hover:border-[#196F03] transition-all shadow-sm flex items-center justify-center gap-2 group"
            >
              <MessageCircle className="h-3 w-3 text-[#196F03] group-hover:text-white transition-colors" />
              WhatsApp
            </a>
            <a 
              href="mailto:info@menuwo.in"
              className="w-full py-3 bg-white border border-gray-100 rounded-xl text-[9px] font-bold text-primary uppercase tracking-widest hover:bg-[#196F03] hover:text-white hover:border-[#196F03] transition-all shadow-sm flex items-center justify-center gap-2 group"
            >
              <Mail className="h-3 w-3 text-[#196F03] group-hover:text-white transition-colors" />
              Email
            </a>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group font-bold text-[10px] uppercase tracking-widest"
        >
          <LogOut className="h-4 w-4 group-hover:text-red-600" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
