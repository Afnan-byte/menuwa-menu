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
        "bg-white rounded-[3rem] p-6 shadow-xl shadow-gray-200/50 relative group transition-all hover:shadow-2xl hover:shadow-brand-green/10 font-sans mt-12",
        !item.isAvailable && "grayscale opacity-80"
      )}
    >
      {/* Dietary Indicator */}
      <div className="absolute top-6 right-6">
        {item.dietaryType === "veg" && (
          <div className="h-6 w-6 bg-green-50 text-green-500 rounded-lg flex items-center justify-center border border-green-100 shadow-sm">
            <Leaf className="h-3.5 w-3.5" />
          </div>
        )}
        {item.dietaryType === "non-veg" && (
          <div className="h-6 w-6 bg-red-50 text-red-500 rounded-lg flex items-center justify-center border border-red-100 shadow-sm">
            <Flame className="h-3.5 w-3.5" />
          </div>
        )}
      </div>

      {/* Overlapping Image Container */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 md:w-36 md:h-36">
        <div className="relative w-full h-full">
          {/* Background Circle */}
          <div className="absolute inset-0 bg-gray-50 rounded-full scale-90 group-hover:scale-100 transition-transform duration-500 shadow-inner"></div>

          {item.imageUrl ? (
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

          {/* Price Badge Overlapping Image */}
          <div className="absolute -bottom-2 right-0 bg-[#196F03] text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-lg shadow-brand-green/30">
            {item.price}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-24 text-center">
        <h3 className="text-lg font-black text-primary tracking-tight mb-2 group-hover:text-[#196F03] transition-colors line-clamp-1">
          {item.name}
        </h3>

        <p className="text-[11px] text-gray-400 font-medium line-clamp-2 leading-relaxed h-8 mb-6">
          {item.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-gray-50 text-primary font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-[#196F03] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="p-3 bg-gray-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
