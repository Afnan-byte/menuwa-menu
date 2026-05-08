"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  Save,
  User,
  Utensils,
  Phone,
  MessageCircle,
  Globe,
  Loader2,
  Palette,
  Layout,
  CheckCircle2,
  Star,
  Image as ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";



export default function SettingsPage() {
  const { user, restaurantData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: "",
    description: "",
    phone: "",
    whatsapp: "",
    logoUrl: "",
    menuTheme: "dark",
    googleReviewUrl: "",
  });

  useEffect(() => {
    if (restaurantData) {
      setFormData({
        restaurantName: restaurantData.restaurantName || "",
        description: restaurantData.description || "",
        phone: restaurantData.phone || "",
        whatsapp: restaurantData.whatsapp || "",
        logoUrl: restaurantData.logoUrl || "",
        menuTheme: restaurantData.menuTheme || "dark",
        googleReviewUrl: restaurantData.googleReviewUrl || "",
      });
    }
  }, [restaurantData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await updateDoc(doc(db, "restaurants", user.uid), formData);
      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tighter">Branding & Settings</h1>
          <p className="text-gray-400 font-medium mt-1">Define your restaurant's digital identity.</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-brand-orange transition-all shadow-xl shadow-primary/20 hover:shadow-brand-orange/20 disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Publish Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-32 bg-gray-50 overflow-hidden">
              <div className="h-full w-full bg-[#0A0A0A]"></div>
            </div>

            <div className="relative mt-12 mb-6">
              <div className="h-32 w-32 rounded-[2.5rem] bg-white p-2 shadow-2xl relative z-10 overflow-hidden">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-cover rounded-[2rem]" />
                ) : (
                  <div className="h-full w-full bg-gray-50 flex items-center justify-center rounded-[2rem]">
                    <Utensils className="h-10 w-10 text-gray-200" />
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-primary tracking-tight">{formData.restaurantName || "My Restaurant"}</h2>
            <p className="text-sm font-medium text-gray-400 mt-1 max-w-[200px]">
              {formData.description || "Set a tagline in settings to describe your flavor."}
            </p>

            <div className="w-full mt-10 pt-10 border-t border-gray-50 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-300">
                <span>Menu Status</span>
                <span className="text-green-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Live
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-300">
                <span>Menu Theme</span>
                <div className="h-4 w-4 rounded-full shadow-sm border bg-[#0A0A0A] border-gray-700"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Configuration Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Visual Identity Section */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-12 w-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
                <Palette className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary tracking-tight">Visual Identity</h3>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-0.5">Customize your menu colors & images</p>
              </div>
            </div>

            <div className="space-y-8">


              <div className="pt-8 border-t border-gray-50">
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-4 ml-1">Logo Image URL</label>
                  <div className="relative">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                    <input
                      type="text"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-medium outline-none text-primary placeholder:text-gray-300"
                      placeholder="Paste your logo URL"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* General Information Section */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <Layout className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary tracking-tight">Restaurant Info</h3>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-0.5">Basic details and contact</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-3 ml-1">Public Display Name</label>
                <input
                  type="text"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-medium outline-none text-primary"
                  placeholder="e.g. The Gourmet Hub"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-3 ml-1">Menu Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-medium outline-none text-primary resize-none"
                  placeholder="Share your story or specialty..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-3 ml-1">Order Phone</label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-medium outline-none text-primary"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-3 ml-1">WhatsApp Orders</label>
                <div className="relative">
                  <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-medium outline-none text-primary"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-3 ml-1">Google Review Link</label>
                <div className="relative">
                  <Star className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input
                    type="text"
                    value={formData.googleReviewUrl}
                    onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-medium outline-none text-primary"
                    placeholder="Paste your Google Maps Review link here..."
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
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}
