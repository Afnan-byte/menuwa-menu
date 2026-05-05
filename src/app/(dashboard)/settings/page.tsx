"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Save, User, Utensils, Phone, MessageCircle, Globe, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, restaurantData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: "",
    description: "",
    phone: "",
    whatsapp: "",
    logoUrl: "",
  });

  useEffect(() => {
    if (restaurantData) {
      setFormData({
        restaurantName: restaurantData.restaurantName || "",
        description: restaurantData.description || "",
        phone: restaurantData.phone || "",
        whatsapp: restaurantData.whatsapp || "",
        logoUrl: restaurantData.logoUrl || "",
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
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
        <p className="text-gray-500">Manage your restaurant profile and preferences.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-background-soft/50 flex items-center gap-4">
          <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-accent overflow-hidden border border-gray-100">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <Utensils className="h-8 w-8" />
            )}
          </div>
          <div>
            <h2 className="font-bold text-primary text-xl">{formData.restaurantName || "Restaurant Name"}</h2>
            <p className="text-sm text-gray-500">Main Profile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-accent" />
                Restaurant Name
              </label>
              <input 
                type="text" 
                value={formData.restaurantName}
                onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                className="w-full px-4 py-3 bg-background-soft border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Globe className="h-4 w-4 text-accent" />
                Logo URL
              </label>
              <input 
                type="text" 
                value={formData.logoUrl}
                onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                className="w-full px-4 py-3 bg-background-soft border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="https://..."
              />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-gray-700">Description / Tagline</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-background-soft border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="Delicious food for everyone..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                Phone Number
              </label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-background-soft border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-accent" />
                WhatsApp Number
              </label>
              <input 
                type="text" 
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full px-4 py-3 bg-background-soft border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-accent/20 transition-all"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
