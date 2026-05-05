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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Welcome, {restaurantData?.restaurantName || "Chef"}!</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your menu today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Eye className="h-6 w-6 text-blue-500" />}
          label="Total Scans"
          value="1,284"
          trend="+12%"
        />
        <StatCard 
          icon={<Utensils className="h-6 w-6 text-green-500" />}
          label="Menu Items"
          value="24"
          trend="0%"
        />
        <StatCard 
          icon={<Users className="h-6 w-6 text-purple-500" />}
          label="Active Tables"
          value="18"
          trend="+5%"
        />
        <StatCard 
          icon={<TrendingUp className="h-6 w-6 text-orange-500" />}
          label="Conversion"
          value="64%"
          trend="+2%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionLink 
                href="/menu"
                icon={<Plus className="h-5 w-5" />}
                title="Add New Item"
                description="Create a new dish for your menu"
                color="bg-accent"
              />
              <ActionLink 
                href="/qr"
                icon={<QrCode className="h-5 w-5" />}
                title="View QR Code"
                description="Download or print your QR code"
                color="bg-primary"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 hover:bg-background-soft rounded-xl transition-colors">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">New scan from Table #4</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips & Resources */}
        <div className="bg-primary text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Pro Tip! 💡</h2>
            <p className="text-white/80 mb-6 leading-relaxed">
              Adding high-quality photos to your menu items can increase orders by up to 30%. Use our built-in image optimization for faster loading.
            </p>
            <Link 
              href="/menu" 
              className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-accent/90 transition-all"
            >
              Update Menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
            <Utensils className="h-48 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-background-soft rounded-lg">{icon}</div>
        <span className="text-xs font-bold text-green-500 px-2 py-1 bg-green-50 rounded-full">{trend}</span>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className="text-2xl font-bold text-primary">{value}</h3>
    </div>
  );
}

function ActionLink({ href, icon, title, description, color }: { href: string, icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <Link href={href} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all group">
      <div className={cn("p-2 rounded-lg text-white group-hover:scale-110 transition-transform", color)}>
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-primary">{title}</h4>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

