"use client";

import { Utensils, Edit2, Trash2, Leaf, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    price: string;
    description: string;
    imageUrl?: string;
    isAvailable: boolean;
    tags?: string[];
    dietaryType?: "veg" | "non-veg" | "none";
    variants?: { id: string; name: string; price: string }[];
    addons?: { id: string; name: string; imageUrl?: string }[];
  };
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}

export default function MenuItemCard({ item, onEdit, onDelete, onToggleAvailability }: MenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-[2rem] p-4 shadow-xl shadow-gray-200/50 relative group transition-all hover:shadow-2xl font-sans flex flex-col",
        !item.isAvailable && "grayscale opacity-80"
      )}
    >
      {/* Image Container (Rounded Rectangle fitting inside card) */}
      <div className="relative w-full aspect-[4/3] mb-4 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
        {item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/")) ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <Utensils className="h-10 w-10 opacity-20" />
          </div>
        )}

        {/* Price Badge (Green pill at bottom right of image) */}
        <div className="absolute bottom-3 right-3 bg-[#196F03] text-white px-3 py-1 rounded-xl font-bold text-sm shadow-lg ">
          ₹{item.price.replace(/[^0-9.]/g, '')}
        </div>

        {/* Availability Toggle Badge (Top Left of image) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleAvailability();
          }}
          className={cn(
            "absolute top-3 left-3 h-8 w-8 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95 z-20 backdrop-blur-md",
            item.isAvailable 
              ? "bg-white/90 text-[#196F03] hover:bg-white" 
              : "bg-red-500/90 text-white hover:bg-red-600"
          )}
          title={item.isAvailable ? "Mark as Out of Stock" : "Mark as In Stock"}
        >
          <Utensils className="h-3.5 w-3.5" />
        </button>

        {/* Dietary Icon (Top Right of image) */}
        <div className="absolute top-3 right-3 flex gap-1">
          {item.dietaryType === "veg" && (
            <div className="h-8 w-8 bg-white/90 backdrop-blur-md text-[#196F03] rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="h-4 w-4 fill-[#196F03]/20" />
            </div>
          )}
          {item.dietaryType === "non-veg" && (
            <div className="h-8 w-8 bg-white/90 backdrop-blur-md text-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Flame className="h-4 w-4 fill-red-500/20" />
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-primary tracking-tight group-hover:text-[#196F03] transition-colors mb-1 px-1">
          {item.name}
        </h3>

        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4 px-1">
          {item.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 bg-gray-50 text-primary font-semibold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#196F03] hover:text-white transition-all flex items-center justify-center gap-2 border border-gray-100"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="p-2.5 bg-gray-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-gray-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
