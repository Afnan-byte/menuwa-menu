"use client";

import Image from "next/image";
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
        "bg-white rounded-[4rem] p-8 shadow-xl shadow-gray-200/50 relative group transition-all hover:shadow-2xl hover:shadow-brand-green/10 font-sans mt-12",
        !item.isAvailable && "grayscale opacity-80"
      )}
    >
      {/* Overlapping circular Image Container */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40">
        <div className="relative w-full h-full">
          {item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/")) ? (
            <div className="relative w-full h-full p-1 overflow-hidden rounded-full border-4 border-white shadow-2xl">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200 bg-white rounded-full border-4 border-gray-50 overflow-hidden shadow-inner">
              <Utensils className="h-10 w-10 opacity-20" />
            </div>
          )}

          {/* Price Badge (Green pill at bottom right of image) */}
          <div className="absolute bottom-2 right-2 bg-[#196F03] text-white px-4 py-1.5 rounded-full font-semibold text-xs shadow-lg shadow-brand-green/30 border border-white/20">
            {item.price.replace(/[^0-9.]/g, '')}
          </div>

          {/* Dietary Icon (Next to image - Pure White Background) */}
          <div className="absolute top-1/2 -right-4 -translate-y-1/2">
            {item.dietaryType === "veg" && (
              <div className="h-9 w-9 bg-white text-[#196F03] rounded-2xl flex items-center justify-center border border-gray-100 shadow-xl shadow-gray-200/50">
                <Leaf className="h-4 w-4 fill-[#196F03]/10" />
              </div>
            )}
            {item.dietaryType === "non-veg" && (
              <div className="h-9 w-9 bg-white text-red-500 rounded-2xl flex items-center justify-center border border-gray-100 shadow-xl shadow-gray-200/50">
                <Flame className="h-4 w-4 fill-red-500/10" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-28 text-center space-y-4">
        <h3 className="text-xl font-bold text-primary tracking-tight group-hover:text-[#196F03] transition-colors line-clamp-1">
          {item.name}
        </h3>

        <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed h-10 px-4">
          {item.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onEdit}
            className="flex-1 py-4 bg-gray-50 text-primary font-semibold text-[10px] uppercase tracking-widest rounded-[2rem] hover:bg-[#196F03] hover:text-white transition-all flex items-center justify-center gap-2 border border-gray-100"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="p-4 bg-gray-50 text-red-500 rounded-[2rem] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-gray-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
