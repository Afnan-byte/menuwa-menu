"use client";

import { useAuth } from "@/components/auth-provider";
import { 
  Users, 
  Utensils, 
  Eye, 
  TrendingUp,
  Plus,
  ArrowRight,
  QrCode
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { restaurantData } = useAuth();

  return (
    <div className="space-y-10 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tighter">
            Welcome, <span className="text-brand-green">{restaurantData?.restaurantName || "Chef"}</span>!
          </h1>
          <p className="text-gray-400 font-medium mt-1">Here's what's happening with your menu today.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-100 px-6 py-3 rounded-2xl text-sm font-bold text-primary shadow-sm hover:bg-gray-50 transition-all">
            Download Report
          </button>
          <Link 
            href="/qr" 
            className="bg-brand-green text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-brand-green/20 hover:scale-105 transition-all"
          >
            Show QR Code
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Eye className="h-6 w-6" />}
          label="Total Scans"
          value="1,284"
          trend="+12%"
          color="blue"
        />
        <StatCard 
          icon={<Utensils className="h-6 w-6" />}
          label="Menu Items"
          value="24"
          trend="0%"
          color="green"
        />
        <StatCard 
          icon={<Users className="h-6 w-6" />}
          label="Active Tables"
          value="18"
          trend="+5%"
          color="purple"
        />
        <StatCard 
          icon={<TrendingUp className="h-6 w-6" />}
          label="Conversion"
          value="64%"
          trend="+2%"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full translate-x-32 -translate-y-32 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-primary mb-8 tracking-tight">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ActionLink 
                  href="/menu"
                  icon={<Plus className="h-6 w-6" />}
                  title="Add New Item"
                  description="Create a new dish for your menu"
                  color="bg-brand-green"
                />
                <ActionLink 
                  href="/qr"
                  icon={<QrCode className="h-6 w-6" />}
                  title="View QR Code"
                  description="Download or print your QR code"
                  color="bg-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100/50 shadow-sm">
            <h2 className="text-2xl font-black text-primary mb-8 tracking-tight">Recent Activity</h2>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-5 p-4 hover:bg-gray-50 rounded-3xl transition-all group cursor-pointer">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-primary tracking-tight">New scan from Table #4</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">2 minutes ago</p>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-5 w-5 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips & Resources */}
        <div className="bg-primary text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          {/* Animated Background Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/20 blur-[80px] rounded-full translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-1000"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="h-14 w-14 rounded-2xl bg-brand-green flex items-center justify-center mb-8 shadow-xl shadow-brand-green/20">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-6 tracking-tight leading-tight">Increase Orders <br/><span className="text-brand-green">by 30%</span></h2>
            <p className="text-white/60 font-medium mb-10 leading-relaxed">
              Adding high-quality photos to your menu items can increase orders significantly. Use our built-in image optimization for faster loading.
            </p>
            <div className="mt-auto">
              <Link 
                href="/menu" 
                className="inline-flex items-center gap-3 bg-brand-green text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-green-700 transition-all shadow-lg shadow-brand-green/20"
              >
                Optimize Menu <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 transition-transform group-hover:scale-110 duration-1000">
            <Utensils className="h-64 w-64" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string, trend: string, color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100/50 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", colorMap[color])}>{icon}</div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-green-500 px-3 py-1 bg-green-50 rounded-full">{trend}</span>
        </div>
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-primary tracking-tighter">{value}</h3>
    </div>
  );
}

function ActionLink({ href, icon, title, description, color }: { href: string, icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <Link href={href} className="flex items-start gap-5 p-6 border border-gray-100 rounded-3xl hover:shadow-xl hover:shadow-gray-100/50 transition-all group bg-white">
      <div className={cn("p-3 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110", color)}>
        {icon}
      </div>
      <div>
        <h4 className="font-black text-primary tracking-tight group-hover:text-brand-green transition-colors">{title}</h4>
        <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-1">{description}</p>
      </div>
    </Link>
  );
}

