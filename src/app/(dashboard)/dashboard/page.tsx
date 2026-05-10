"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { 
  Utensils, 
  Plus,
  ArrowRight,
  QrCode,
  Loader2,
  ExternalLink,
  MessageCircle,
  Mail
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, restaurantData } = useAuth();
  const [itemCount, setItemCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const q = query(collection(db, "items"), where("restaurantId", "==", user?.uid));
      const snap = await getDocs(q);
      setItemCount(snap.size);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const WHATSAPP_NUMBER = "918089685278";
  const SUPPORT_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Menuvo%20Support!%20I%20need%20help%20with%20my%20dashboard.`;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-4 md:p-10 space-y-10 font-sans pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold text-primary tracking-tighter">
              Welcome, <span className="text-[#196F03]">{restaurantData?.restaurantName || "Chef"}</span>!
            </h1>
            <p className="text-gray-400 font-medium mt-1">Manage your digital menu and QR presence.</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <Link 
              href={`/menu/${restaurantData?.menuId || user?.uid}`}
              target="_blank"
              className="flex items-center gap-3 bg-white border border-gray-100 px-6 py-4 rounded-2xl text-xs font-bold text-primary shadow-sm hover:bg-gray-50 transition-all uppercase tracking-widest"
            >
              <ExternalLink className="h-4 w-4" />
              Live Menu
            </Link>
            <Link 
              href="/qr" 
              className="flex items-center gap-3 bg-[#196F03] text-white px-8 py-4 rounded-2xl text-xs font-bold shadow-xl shadow-brand-green/20 hover:scale-105 transition-all uppercase tracking-widest"
            >
              <QrCode className="h-4 w-4" />
              QR Code
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Real Stats & Actions */}
          <div className="lg:col-span-2 space-y-10">
            {/* Real Stats Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] flex items-center justify-between relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#196F03]/5 rounded-full translate-x-32 -translate-y-32 transition-transform group-hover:scale-110"></div>
               <div className="relative z-10">
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-4">Current Inventory</p>
                  {loading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-[#196F03]" />
                  ) : (
                    <div className="flex items-baseline gap-4">
                      <h2 className="text-5xl md:text-7xl font-bold text-primary tracking-tighter">{itemCount || 0}</h2>
                      <span className="text-lg md:text-xl font-semibold text-gray-400">Items Live</span>
                    </div>
                  )}
               </div>
               <div className="relative z-10 h-20 w-20 bg-[#196F03]/10 rounded-[2rem] flex items-center justify-center">
                  <Utensils className="h-10 w-10 text-[#196F03]" />
               </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-primary tracking-tight ml-2">Quick Management</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ActionLink 
                  href="/menu"
                  icon={<Plus className="h-6 w-6" />}
                  title="Manage Dishes"
                  description="Update items, prices and availability"
                  color="bg-[#196F03]"
                />
                <ActionLink 
                  href="mailto:info@menuwo.in"
                  icon={<Mail className="h-6 w-6" />}
                  title="Support Centre"
                  description="Get assistance via info@menuwo.in"
                  color="bg-primary"
                  isExternal
                />
              </div>
            </div>
          </div>

          {/* Status Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary text-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#196F03]/20 blur-[80px] rounded-full translate-x-10 -translate-y-10"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#196F03]/20 rounded-full border border-[#196F03]/30 mb-8 self-start">
                <div className="h-2 w-2 bg-[#196F03] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#196F03]">System Live</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-6 tracking-tight leading-tight">Your Digital Menu is <br/><span className="text-[#196F03]">Active</span></h2>
              <p className="text-white/40 text-sm font-medium mb-10 leading-relaxed">
                Customers can currently scan and view your menu. All changes you make in the manager will reflect instantly.
              </p>
              
              <div className="mt-auto">
                <Link 
                  href="/menu" 
                  className="w-full flex items-center justify-center gap-3 bg-white text-primary py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  Go to Menu Manager <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ActionLink({ href, icon, title, description, color, isExternal }: { href: string, icon: React.ReactNode, title: string, description: string, color: string, isExternal?: boolean }) {
  const content = (
    <div className="flex items-start gap-5 p-6 md:p-8 border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] hover:shadow-2xl hover:shadow-gray-100 transition-all group bg-white h-full">
      <div className={cn("p-4 rounded-2xl text-white shadow-xl transition-transform group-hover:scale-110", color)}>
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-bold text-primary tracking-tight group-hover:text-[#196F03] transition-colors">{title}</h4>
        <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1">{description}</p>
      </div>
    </div>
  );

  if (isExternal) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">{content}</a>;
  }

  return <Link href={href} className="block h-full">{content}</Link>;
}
