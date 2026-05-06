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
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const THEME_COLORS = [
  { name: "Savor Orange", color: "#FF9F0D", class: "bg-[#FF9F0D]" },
  { name: "Emerald Green", color: "#10B981", class: "bg-[#10B981]" },
  { name: "Ocean Blue", color: "#3B82F6", class: "bg-[#3B82F6]" },
  { name: "Sunset Red", color: "#F43F5E", class: "bg-[#F43F5E]" },
  { name: "Midnight Purple", color: "#8B5CF6", class: "bg-[#8B5CF6]" },
  { name: "Classic Black", color: "#0F172A", class: "bg-[#0F172A]" },
];

export default function SettingsPage() {
  const { user, restaurantData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: "",
    description: "",
    phone: "",
    whatsapp: "",
    logoUrl: "",
    themeColor: "#FF9F0D",
  });

  useEffect(() => {
    if (restaurantData) {
      setFormData({
        restaurantName: restaurantData.restaurantName || "",
        description: restaurantData.description || "",
        phone: restaurantData.phone || "",
        whatsapp: restaurantData.whatsapp || "",
        logoUrl: restaurantData.logoUrl || "",
        themeColor: restaurantData.themeColor || "#FF9F0D",
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
          <h1 className="text-4xl font-black text-primary tracking-tighter">Branding & Settings</h1>
          <p className="text-gray-400 font-medium mt-1">Define your restaurant's digital identity.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-10 py-4 bg-primary text-white font-black rounded-2xl hover:bg-brand-orange transition-all shadow-xl shadow-primary/20 hover:shadow-brand-orange/20 disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Publish Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-32 bg-gray-50 group-hover:bg-brand-orange/5 transition-colors"></div>
              
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

              <h2 className="text-2xl font-black text-primary tracking-tight">{formData.restaurantName || "My Restaurant"}</h2>
              <p className="text-sm font-medium text-gray-400 mt-1 max-w-[200px]">
                 {formData.description || "Set a tagline in settings to describe your flavor."}
              </p>

              <div className="w-full mt-10 pt-10 border-t border-gray-50 flex flex-col gap-4">
                 <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-300">
                    <span>Menu Status</span>
                    <span className="text-green-500 flex items-center gap-1">
                       <CheckCircle2 className="h-3 w-3" /> Live
                    </span>
                 </div>
                 <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-300">
                    <span>Theme Color</span>
                    <div className={cn("h-4 w-4 rounded-full shadow-sm", THEME_COLORS.find(c => c.color === formData.themeColor)?.class || "bg-brand-orange")} style={{ backgroundColor: !THEME_COLORS.find(c => c.color === formData.themeColor) ? formData.themeColor : undefined }}></div>
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
                    <h3 className="text-xl font-black text-primary tracking-tight">Visual Identity</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Customize your menu colors</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <div>
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 ml-1">Choose Theme Color</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                       {THEME_COLORS.map((theme) => (
                         <button
                           key={theme.color}
                           type="button"
                           onClick={() => setFormData({...formData, themeColor: theme.color})}
                           className={cn(
                             "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all group",
                             formData.themeColor === theme.color 
                               ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                               : "border-gray-100 hover:border-gray-200"
                           )}
                         >
                            <div className={cn("h-6 w-6 rounded-full shadow-inner", theme.class)}></div>
                            <span className={cn("text-xs font-black transition-colors", formData.themeColor === theme.color ? "text-primary" : "text-gray-400 group-hover:text-gray-600")}>
                               {theme.name}
                            </span>
                         </button>
                       ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center gap-6">
                       <div className="flex-1">
                          <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Custom Color Code</label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">#</span>
                            <input 
                              type="text" 
                              value={formData.themeColor.replace('#', '')}
                              onChange={(e) => {
                                const val = e.target.value.trim();
                                if (val.length <= 6) {
                                  setFormData({...formData, themeColor: `#${val}`});
                                }
                              }}
                              className="w-full pl-10 pr-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none text-primary uppercase"
                              placeholder="FF9F0D"
                            />
                          </div>
                       </div>
                       <div className="flex items-center gap-4 px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div 
                            className="h-10 w-10 rounded-full shadow-lg border-4 border-white" 
                            style={{ backgroundColor: formData.themeColor }}
                          ></div>
                          <div>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Preview</p>
                             <p className="text-xs font-black text-primary uppercase">{formData.themeColor}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-gray-50">
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 ml-1">Logo URL</label>
                    <div className="relative">
                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                      <input 
                        type="text" 
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                        className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none text-primary placeholder:text-gray-300"
                        placeholder="Paste your logo URL (e.g. from Cloudinary or Unsplash)"
                      />
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
                    <h3 className="text-xl font-black text-primary tracking-tight">Restaurant Info</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Basic details and contact</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Public Display Name</label>
                    <input 
                      type="text" 
                      value={formData.restaurantName}
                      onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                      className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none text-primary"
                      placeholder="e.g. The Gourmet Hub"
                    />
                 </div>
                 
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Menu Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none text-primary resize-none"
                      placeholder="Share your story or specialty..."
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Order Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none text-primary"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">WhatsApp Orders</label>
                    <div className="relative">
                      <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                      <input 
                        type="text" 
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                        className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none text-primary"
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
