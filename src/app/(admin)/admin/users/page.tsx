"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase-db";
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { 
  Users, 
  ExternalLink, 
  Trash2, 
  Globe, 
  Clock, 
  ShieldCheck,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Smartphone
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function UsersManager() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "restaurants"));
      setRestaurants(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRestaurant = async (id: string) => {
    if (!confirm("Are you sure? This will delete the brand but not the menu items yet.")) return;
    try {
      await deleteDoc(doc(db, "restaurants", id));
      setRestaurants(restaurants.filter(r => r.id !== id));
      toast.success("Restaurant deleted");
    } catch (error) {
      toast.error("Deletion failed");
    }
  };

  const filtered = restaurants.filter(r => 
    r.restaurantName?.toLowerCase().includes(search.toLowerCase()) ||
    r.whatsapp?.includes(search)
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Restaurant Directory</h2>
          <p className="text-gray-500 font-medium mt-2">Manage all registered brands and their platform status</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#196F03] transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name or WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-[#196F03] transition-all"
          />
        </div>
      </header>

      <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Restaurant</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Contact</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Stand ID</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Theme</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-[#196F03]/10 text-[#196F03] rounded-xl flex items-center justify-center font-bold">
                        {res.restaurantName?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{res.restaurantName || 'Unnamed'}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{res.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <Smartphone className="h-3 w-3" /> {res.whatsapp || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {res.menuId ? (
                      <span className="px-3 py-1.5 bg-[#196F03]/10 text-[#196F03] text-[10px] font-black rounded-lg border border-[#196F03]/20">
                        {res.menuId}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {res.menuTheme || 'Dark'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-3">
                      <a 
                        href={`/menu/${res.id}`} 
                        target="_blank"
                        className="p-3 bg-white/5 text-gray-400 rounded-xl hover:text-[#196F03] hover:bg-[#196F03]/10 transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button 
                        onClick={() => deleteRestaurant(res.id)}
                        className="p-3 bg-white/5 text-gray-400 rounded-xl hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && !loading && (
          <div className="py-20 text-center space-y-4">
            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
              <Users className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-gray-500 font-medium">No restaurants found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
