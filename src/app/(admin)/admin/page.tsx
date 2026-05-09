"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { 
  Users, 
  Utensils, 
  QrCode, 
  TrendingUp, 
  Clock,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalStands: 0,
    activeNow: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "restaurants"));
        const itemsSnap = await getDocs(collection(db, "items"));
        const standsSnap = await getDocs(collection(db, "stands"));

        setStats({
          totalUsers: usersSnap.size,
          totalItems: itemsSnap.size,
          totalStands: standsSnap.size,
          activeNow: Math.floor(usersSnap.size * 0.4) // Mock active users
        });

        // Fetch recent users
        const recentQuery = query(collection(db, "restaurants"), orderBy("restaurantName"), limit(5));
        const recentSnap = await getDocs(recentQuery);
        setRecentUsers(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-4xl font-extrabold tracking-tight">Platform Overview</h2>
        <p className="text-gray-500 font-medium mt-2 text-lg">Real-time metrics for Menuwo SaaS</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Restaurants", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Dishes", value: stats.totalItems, icon: Utensils, color: "text-[#196F03]", bg: "bg-[#196F03]/10" },
          { label: "QR Stands", value: stats.totalStands, icon: QrCode, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Growth Rate", value: "+12%", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] relative overflow-hidden group"
          >
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6", stat.bg)}>
              <stat.icon className={cn("h-7 w-7", stat.color)} />
            </div>
            <div className="space-y-1">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#196F03]" /> Recent Onboarding
            </h3>
            <button className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">View All</button>
          </div>

          <div className="space-y-4">
            {recentUsers.map((res, i) => (
              <motion.div 
                key={res.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-lg font-bold border border-white/5 group-hover:border-[#196F03]/30 transition-colors">
                    {res.restaurantName?.[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{res.restaurantName}</h4>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{res.menuTheme || 'Modern'} Theme</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                   <div className="text-right">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</p>
                     <p className="text-sm font-bold text-[#196F03]">₹0.00</p>
                   </div>
                   <ChevronRight className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "Generate QR Batch", href: "/admin/stands", icon: QrCode, desc: "Create 100 new unique IDs" },
              { label: "View User List", href: "/admin/users", icon: Users, desc: "Manage all registered brands" },
              { label: "Platform Settings", href: "/settings", icon: ArrowUpRight, desc: "Global system configuration" }
            ].map((action) => (
              <a 
                key={action.label}
                href={action.href}
                className="p-6 bg-[#196F03]/5 border border-[#196F03]/10 rounded-[2rem] group hover:bg-[#196F03] transition-all"
              >
                <action.icon className="h-6 w-6 text-[#196F03] group-hover:text-white mb-4" />
                <h4 className="font-bold text-sm group-hover:text-white">{action.label}</h4>
                <p className="text-[10px] text-[#196F03]/60 group-hover:text-white/60 font-medium uppercase tracking-widest mt-1">{action.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
