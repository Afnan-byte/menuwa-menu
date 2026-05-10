"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
    whatsapp: "",
    logoUrl: "",
    menuTheme: "dark",
  });

  useEffect(() => {
    if (restaurantData) {
      setFormData({
        restaurantName: restaurantData.restaurantName || "",
        description: restaurantData.description || "",
        whatsapp: restaurantData.whatsapp || "",
        logoUrl: restaurantData.logoUrl || "",
        menuTheme: restaurantData.menuTheme || "dark",
      });
    }
  }, [restaurantData]);

  const [isDragging, setIsDragging] = useState(false);

  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(url);
          reject(new Error("Timeout"));
        }, 5000);

        img.onload = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(url);
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("No context"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Blob failed"));
          }, "image/webp", 0.8);
        };
        img.onerror = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(url);
          reject(new Error("Load failed"));
        };
        img.src = url;
      } catch (e) {
        reject(e);
      }
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const toastId = toast.loading("Uploading to Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "od1sjbbu");
      formData.append("api_key", "955253717999674");
      formData.append("cloud_name", "da1edgeae1");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/da1edgeae1/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error("Cloudinary Logo Error:", responseText);
        throw new Error("Upload failed. Check settings.");
      }

      const data = JSON.parse(responseText);
      
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, logoUrl: data.secure_url }));
        toast.success("Logo uploaded successfully!", { id: toastId });
      }
    } catch (error: any) {
      console.error("Logo Upload Error:", error);
      toast.error(`Upload failed: ${error.message || 'Check Cloudinary'}`, { id: toastId });
    }
  };

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
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-12 pb-20 font-sans">
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

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-3 ml-1">Restaurant Logo</label>
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className={cn(
                      "flex flex-col sm:flex-row items-center gap-6 p-8 bg-gray-50 rounded-[2.5rem] border-2 border-dashed transition-all group relative overflow-hidden",
                      isDragging ? "border-[#196F03] bg-brand-green/5 ring-8 ring-brand-green/5" : "border-gray-100 hover:border-gray-200"
                    )}
                  >
                    <div className="h-24 w-24 rounded-[2rem] bg-white shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-gray-200" />
                      )}
                      {isDragging && (
                        <div className="absolute inset-0 bg-[#196F03]/80 flex items-center justify-center text-white">
                          <Save className="h-8 w-8 animate-bounce" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1 relative z-10 text-center sm:text-left">
                      <h4 className="text-lg font-bold text-primary tracking-tight">Drop your logo here</h4>
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Or click the button to browse files</p>
                    </div>
                    <input
                      type="file"
                      id="logo-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("logo-upload")?.click()}
                      className="relative z-10 px-8 py-4 bg-white text-primary text-xs font-bold uppercase tracking-widest rounded-2xl shadow-xl shadow-gray-200/50 hover:bg-primary hover:text-white transition-all"
                    >
                      Select File
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-2 px-2">
                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Or paste a direct image link below</p>
                  </div>
                  <div className="mt-2 relative">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input
                      type="text"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-transparent rounded-xl focus:bg-white text-xs font-medium outline-none text-primary"
                      placeholder="Logo Image URL"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-3 ml-1">Phone Number</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-medium outline-none text-primary"
                      placeholder="e.g. 918089685278"
                    />
                  </div>
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
