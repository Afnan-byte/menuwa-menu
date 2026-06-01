"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase-db";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch
} from "firebase/firestore";
import {
  FolderPlus,
  Utensils,
  Loader2,
  X,
  Trash2,
  ArrowUp,
  ArrowDown,
  Pencil,
  ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  order?: number;
  icon?: string;
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const catQuery = query(collection(db, "categories"), where("restaurantId", "==", user?.uid));
      const catSnap = await getDocs(catQuery);
      const catList = catSnap.docs.map((doc, idx) => {
        const data = doc.data();
        return { id: doc.id, ...data, order: data.order ?? idx } as Category;
      });
      setCategories(catList.sort((a, b) => a.order! - b.order!));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "od1sjbbu");
    formData.append("api_key", "955253717999674");
    formData.append("cloud_name", "da1edgeae1");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/da1edgeae1/image/upload`,
      { method: "POST", body: formData }
    );
    const responseText = await response.text();
    if (!response.ok) {
      let errorMessage = "Upload failed";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        errorMessage = responseText;
      }
      throw new Error(errorMessage);
    }
    const data = JSON.parse(responseText);
    if (!data.secure_url) throw new Error("No URL returned");
    return data.secure_url;
  };

  const handleCategoryIconUpload = async (file: File) => {
    if (!file || !user) return;
    const toastId = toast.loading("Uploading icon...");
    try {
      const url = await uploadToCloudinary(file);
      setNewCategoryIcon(url);
      toast.success("Category icon uploaded!", { id: toastId });
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`, { id: toastId });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !user) return;
    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateDoc(doc(db, "categories", editingCategory.id), {
          name: newCategoryName,
          icon: newCategoryIcon,
        });
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: newCategoryName, icon: newCategoryIcon } : c));
        toast.success("Category updated!");
      } else {
        const docRef = await addDoc(collection(db, "categories"), {
          name: newCategoryName,
          icon: newCategoryIcon,
          restaurantId: user.uid,
          createdAt: new Date().toISOString(),
          order: categories.length,
        });
        setCategories([...categories, { id: docRef.id, name: newCategoryName, icon: newCategoryIcon, order: categories.length }]);
        toast.success("Category added!");
      }
      setNewCategoryName("");
      setNewCategoryIcon("");
      setEditingCategory(null);
      setIsCategoryModalOpen(false);
    } catch (error: any) {
      toast.error("Database Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Are you sure? This will delete the category and ALL items inside it.")) return;

    setIsSaving(true);
    try {
      const itemQuery = query(collection(db, "items"), where("categoryId", "==", catId));
      const itemSnap = await getDocs(itemQuery);
      
      const batch = writeBatch(db);
      batch.delete(doc(db, "categories", catId));
      itemSnap.docs.forEach(itemDoc => {
        batch.delete(doc(db, "items", itemDoc.id));
      });
      await batch.commit();
      
      setCategories(categories.filter(c => c.id !== catId));
      toast.success("Category and items removed");
    } catch (error) {
      toast.error("Deletion failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveCategory = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === categories.length - 1)
    ) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newCategories = [...categories];
    
    // Swap elements in array for immediate UI update
    const temp = newCategories[index];
    newCategories[index] = newCategories[newIndex];
    newCategories[newIndex] = temp;

    // Force strict 0-based ordering for all items to guarantee stability
    newCategories.forEach((cat, idx) => {
      cat.order = idx;
    });

    setCategories(newCategories);

    try {
      const batch = writeBatch(db);
      newCategories.forEach((cat) => {
        batch.update(doc(db, "categories", cat.id), { order: cat.order });
      });
      await batch.commit();
    } catch (error) {
      toast.error("Failed to save category order");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-primary tracking-tight mb-2">Catalogue</h1>
            <p className="text-sm text-gray-500">Manage your menu categories and their ordering.</p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setNewCategoryName("");
              setNewCategoryIcon("");
              setIsCategoryModalOpen(true);
            }}
            className="px-6 py-3 bg-[#196F03] text-white rounded-2xl hover:bg-[#196F03]/90 transition-all shadow-xl shadow-brand-green/20 font-medium text-sm flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            New Section
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="h-12 w-12 animate-spin text-[#196F03] mb-4" />
            <p className="text-xs font-medium text-gray-300 uppercase tracking-widest">Loading catalogue...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-2">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <FolderPlus className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Categories Yet</h3>
                <p className="text-sm text-gray-500">Create your first category to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat, index) => (
                  <div key={cat.id} className="relative group flex items-center bg-gray-50/50 hover:bg-gray-50 rounded-2xl p-4 transition-all">
                    <div className="flex items-center gap-4 flex-1 min-w-0 pr-32">
                      <div className="p-3 bg-white shadow-sm rounded-xl text-gray-400 shrink-0">
                        {cat.icon ? (
                          <img src={cat.icon} alt="" className="h-5 w-5 object-cover rounded-sm" />
                        ) : (
                          <Utensils className="h-5 w-5" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">{cat.name}</span>
                    </div>
                    
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
                        <button
                          onClick={() => handleMoveCategory(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg transition-colors hover:bg-gray-50 text-gray-400 hover:text-gray-900 disabled:opacity-30"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMoveCategory(index, "down")}
                          disabled={index === categories.length - 1}
                          className="p-1.5 rounded-lg transition-colors hover:bg-gray-50 text-gray-400 hover:text-gray-900 disabled:opacity-30"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setNewCategoryName(cat.name);
                          setNewCategoryIcon(cat.icon || "");
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm text-gray-400"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm text-gray-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-primary/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-12 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <h2 className="text-3xl font-medium text-primary mb-2 tracking-tight">{editingCategory ? "Edit Section" : "New Section"}</h2>
              <form onSubmit={handleCategorySubmit} className="space-y-6 mt-6">
                <div>
                  <label className="text-[10px] font-medium text-gray-300 uppercase tracking-widest ml-1 mb-2 block">Section Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Signature Pizzas"
                    required
                    className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-medium outline-none text-primary"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-medium text-gray-300 uppercase tracking-widest ml-1 mb-2 block">Custom Icon (Optional)</label>
                  <div className="flex items-center gap-4">
                    {newCategoryIcon ? (
                      <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-gray-100 shrink-0 group">
                        <img src={newCategoryIcon} alt="Icon preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setNewCategoryIcon("")} 
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="px-6 py-5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-[1.5rem] border border-transparent text-sm font-medium text-center text-primary">
                        Upload Icon Image
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCategoryIconUpload(file);
                        }} 
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-5 font-medium text-gray-400">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-5 bg-primary text-white font-medium rounded-2xl shadow-xl shadow-primary/10 flex items-center justify-center">
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : editingCategory ? "Save Changes" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
