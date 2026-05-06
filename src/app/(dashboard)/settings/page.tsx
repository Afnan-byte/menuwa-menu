"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import {
  Save,
  User as UserIcon,
  Utensils,
  Phone,
  MessageCircle,
  Globe,
  Loader2,
  Palette,
  Layout,
  CheckCircle2,
  Star,
  Settings,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const THEME_COLORS = [
  { name: "Brand Green", color: "#196F03", class: "bg-[#196F03]" },
  { name: "Savor Orange", color: "#FF9F0D", class: "bg-[#FF9F0D]" },
  { name: "Emerald Green", color: "#10B981", class: "bg-[#10B981]" },
  { name: "Ocean Blue", color: "#3B82F6", class: "bg-[#3B82F6]" },
  { name: "Sunset Red", color: "#F43F5E", class: "bg-[#F43F5E]" },
  { name: "Midnight Purple", color: "#8B5CF6", class: "bg-[#8B5CF6]" },
];

export default function SettingsPage() {
  const { user, restaurantData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: "",
    restaurantName: "",
    description: "",
    phone: "",
    whatsapp: "",
    logoUrl: "",
    themeColor: "#196F03",
    googleReviewUrl: "",
  });

  useEffect(() => {
    if (restaurantData) {
      setFormData({
        ownerName: restaurantData.ownerName || user?.displayName || "",
        restaurantName: restaurantData.restaurantName || "",
        description: restaurantData.description || "",
        phone: restaurantData.phone || "",
        whatsapp: restaurantData.whatsapp || "",
        logoUrl: restaurantData.logoUrl || "",
        themeColor: restaurantData.themeColor || "#196F03",
        googleReviewUrl: restaurantData.googleReviewUrl || "",
      });
    }
  }, [restaurantData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Update Firebase Auth Profile (Account Name)
      if (formData.ownerName !== user.displayName) {
        await updateProfile(user, { displayName: formData.ownerName });
      }

      // Update Firestore (Database Record)
      await updateDoc(doc(db, "restaurants", user.uid), formData);
      
      toast.success("Profile and name updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-primary tracking-tighter">Account & Profile</h1>
          <p className="text-gray-400 font-medium mt-1">Update your personal name and restaurant branding.</p>
        </motion.div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center gap-3 px-10 py-5 bg-[#196F03] text-white font-black rounded-2xl hover:bg-[#155a02] transition-all shadow-xl shadow-brand-green/20 disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Save All Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-32 bg-gray-50 group-hover:bg-brand-green/5 transition-colors"></div>

            <div className="relative mt-12 mb-6">
              <div className="h-32 w-32 rounded-[2.5rem] bg-white p-2 shadow-2xl relative z-10 overflow-hidden">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-cover rounded-[2rem]" />
                ) : (
                  <div className="h-full w-full bg-gray-50 flex items-center justify-center rounded-[2rem]">
                    <UserIcon className="h-10 w-10 text-gray-200" />
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-black text-primary tracking-tight">{formData.ownerName || "Your Name"}</h2>
            <p className="text-xs font-bold text-[#196F03] uppercase tracking-widest mt-1 mb-4">{formData.restaurantName || "Restaurant Owner"}</p>
            
            <div className="w-full mt-10 pt-10 border-t border-gray-50 flex flex-col gap-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-300">
                <span>Account Security</span>
                <span className="text-blue-500 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-300">
                <span>System Status</span>
                <span className="text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              </div>
            </div>
          </div>

          <div className="bg-primary p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
             <MessageCircle className="h-10 w-10 text-brand-green mb-6" />
             <h3 className="text-xl font-black text-white tracking-tight mb-2">Support Centre</h3>
             <p className="text-white/40 text-xs font-medium mb-8">Direct WhatsApp support for your account needs.</p>
             <Link href="https://wa.me/918089685278" target="_blank" className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-green/20">
               Chat Now
             </Link>
          </div>
        </div>

        {/* Right Column: Configuration Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Account Identity Section */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary tracking-tight">Personal Identity</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Update your account name</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Full Name (Account Owner)</label>
                <div className="relative group">
                  <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-brand-green transition-colors" />
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-bold outline-none text-primary"
                    placeholder="Enter your full name"
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium mt-3 ml-1 italic">This name will be visible across the dashboard and in your profile.</p>
              </div>
            </div>
          </div>

          {/* Restaurant Branding Section */}
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-12 w-12 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green">
                <Utensils className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary tracking-tight">Restaurant Details</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Manage your business profile</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Public Restaurant Name</label>
                <input
                  type="text"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-bold outline-none text-primary"
                  placeholder="e.g. The Gourmet Hub"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">About Your Kitchen</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-bold outline-none text-primary resize-none"
                  placeholder="Share your story..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Order Phone</label>
                <div className="relative group">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-brand-green transition-colors" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-bold outline-none text-primary"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">WhatsApp Orders</label>
                <div className="relative group">
                  <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-brand-green transition-colors" />
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-bold outline-none text-primary"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
