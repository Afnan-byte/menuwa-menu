"use client";

import { Utensils, Edit2, Trash2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    price: string;
    description: string;
    imageUrl?: string;
    isAvailable: boolean;
    tags?: string[];
  };
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}

export default function MenuItemCard({ item, onEdit, onDelete, onToggleAvailability }: MenuItemProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group transition-all",
      !item.isAvailable && "opacity-75 grayscale-[0.5]"
    )}>
      <div className="aspect-video bg-gray-100 relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Utensils className="h-12 w-12 opacity-20" />
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:text-accent transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-primary group-hover:text-accent transition-colors">{item.name}</h3>
          <span className="font-bold text-primary">${item.price}</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{item.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-2">
            {item.tags?.map((tag) => (
              <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-background-soft text-gray-500 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <button 
            onClick={onToggleAvailability}
            className={cn(
              "text-xs font-bold px-3 py-1 rounded-full transition-all",
              item.isAvailable 
                ? "bg-green-50 text-green-600 hover:bg-green-100" 
                : "bg-red-50 text-red-600 hover:bg-red-100"
            )}
          >
            {item.isAvailable ? "Available" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
