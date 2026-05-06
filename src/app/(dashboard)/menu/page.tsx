"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { 
  Plus, 
  FolderPlus, 
  Utensils, 
  Search, 
  Loader2, 
  X, 
  Filter,
  MoreVertical,
  Settings2,
  ChevronRight,
  LayoutGrid,
  List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MenuItemCard from "@/components/MenuItemCard";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  tags: string[];
}

export default function MenuPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // Form States
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    price: "",
    description: "",
    categoryId: "",
    imageUrl: "",
    tags: [] as string[],
  });

  useEffect(() => {
    if (user) {
      fetchMenu();
    }
  }, [user]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const catQuery = query(collection(db, "categories"), where("restaurantId", "==", user?.uid));
      const catSnap = await getDocs(catQuery);
      const catList = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(catList);

      const itemQuery = query(collection(db, "items"), where("restaurantId", "==", user?.uid));
      const itemSnap = await getDocs(itemQuery);
      const itemList = itemSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      setItems(itemList);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !user) return;
    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name: newCategoryName,
        restaurantId: user.uid,
        createdAt: new Date().toISOString(),
      });
      setCategories([...categories, { id: docRef.id, name: newCategoryName }]);
      setNewCategoryName("");
      setIsCategoryModalOpen(false);
      toast.success("Category added!");
    } catch (error: any) {
      toast.error("Database Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      if (editingItem) {
        await updateDoc(doc(db, "items", editingItem.id), itemForm);
        setItems(items.map(i => i.id === editingItem.id ? { ...editingItem, ...itemForm } : i));
        toast.success("Item updated!");
      } else {
        const docRef = await addDoc(collection(db, "items"), {
          ...itemForm,
          restaurantId: user.uid,
          isAvailable: true,
          createdAt: new Date().toISOString(),
        });
        setItems([...items, { id: docRef.id, ...itemForm, isAvailable: true } as MenuItem]);
        toast.success("Item added!");
      }
      setIsItemModalOpen(false);
      setEditingItem(null);
      setItemForm({ name: "", price: "", description: "", categoryId: "", imageUrl: "", tags: [] });
    } catch (error: any) {
      toast.error("Database Error");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await updateDoc(doc(db, "items", item.id), { isAvailable: !item.isAvailable });
      setItems(items.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
      toast.success(item.isAvailable ? "Set as out of stock" : "Set as available");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteDoc(doc(db, "items", id));
      setItems(items.filter(i => i.id !== id));
      toast.success("Item deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 font-sans min-h-screen pb-10">
      {/* Sidebar Filter Panel */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 sticky top-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-black text-primary tracking-tight">Catalogue</h2>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Manage Categories</p>
            </div>
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="p-3 bg-gray-100 text-brand-orange rounded-2xl hover:bg-brand-orange hover:text-white transition-all shadow-sm group"
            >
              <FolderPlus className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                activeCategory === "all" ? "bg-brand-orange text-white shadow-xl shadow-brand-orange/30" : "hover:bg-gray-50 text-gray-500"
              )}
            >
              <div className="flex items-center gap-3">
                 <div className={cn("p-2 rounded-xl transition-colors", activeCategory === "all" ? "bg-white/20 text-white" : "bg-gray-100 group-hover:bg-white text-gray-400 group-hover:text-brand-orange")}>
                    <LayoutGrid className="h-4 w-4" />
                 </div>
                 <span className="text-xs font-black">All Items</span>
              </div>
              <ChevronRight className={cn("h-4 w-4 opacity-50", activeCategory === "all" ? "text-white" : "text-gray-300")} />
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                  activeCategory === cat.id ? "bg-brand-orange text-white shadow-xl shadow-brand-orange/30" : "hover:bg-gray-50 text-gray-500"
                )}
              >
                <div className="flex items-center gap-3">
                   <div className={cn("p-2 rounded-xl transition-colors", activeCategory === cat.id ? "bg-white/20 text-white" : "bg-gray-100 group-hover:bg-white text-gray-400 group-hover:text-brand-orange")}>
                      <Utensils className="h-4 w-4" />
                   </div>
                   <span className="text-xs font-black">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-black", activeCategory === cat.id ? "text-white/80" : "text-gray-300")}>
                    {items.filter(i => i.categoryId === cat.id).length}
                  </span>
                  <ChevronRight className={cn("h-4 w-4 opacity-50", activeCategory === cat.id ? "text-white" : "text-gray-300")} />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-50">
             <div className="bg-primary/5 rounded-[2rem] p-6 text-center border border-primary/5">
                <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-3">Menu Visibility</p>
                <h4 className="text-sm font-black text-primary mb-4 leading-tight">Your menu is live and accepting scans</h4>
                <button className="w-full py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-brand-orange hover:shadow-brand-orange/20 transition-all">
                   View Live Menu
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        {/* Modern Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-primary tracking-tighter">Menu Manager</h1>
            <p className="text-gray-400 font-medium mt-1">Found {filteredItems.length} items in your collection.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-brand-orange transition-colors" />
              <input 
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-brand-orange/5 transition-all outline-none text-primary"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[9px] font-black text-gray-300 hidden sm:block">
                 ⌘K
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
               <button 
                 onClick={() => {
                   setEditingItem(null);
                   setItemForm({ name: "", price: "", description: "", categoryId: categories[0]?.id || "", imageUrl: "", tags: [] });
                   setIsItemModalOpen(true);
                 }}
                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-brand-orange text-white font-black rounded-[2rem] hover:bg-orange-600 hover:scale-105 transition-all shadow-xl shadow-brand-orange/30 whitespace-nowrap"
               >
                 <Plus className="h-5 w-5" />
                 Add New Item
               </button>
               <button className="p-4 bg-white border border-gray-100 rounded-[2rem] text-gray-400 hover:text-primary hover:bg-gray-50 transition-all shadow-sm">
                  <Settings2 className="h-5 w-5" />
               </button>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
           <div className="flex items-center gap-6">
              <button className="text-xs font-black text-brand-orange border-b-2 border-brand-orange pb-6 -mb-[26px]">All Dishes</button>
              <button className="text-xs font-black text-gray-300 hover:text-primary transition-colors pb-6 -mb-[26px]">Available</button>
              <button className="text-xs font-black text-gray-300 hover:text-primary transition-colors pb-6 -mb-[26px]">Sold Out</button>
           </div>
           <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode("grid")}
                className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-white shadow-sm text-brand-orange" : "text-gray-400")}
              >
                 <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-white shadow-sm text-brand-orange" : "text-gray-400")}
              >
                 <List className="h-4 w-4" />
              </button>
           </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="h-12 w-12 animate-spin text-brand-orange mb-4" />
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Loading your menu...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className={cn(
            "grid gap-8 pt-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
          )}>
            {filteredItems.map((item) => (
              <MenuItemCard 
                key={item.id}
                item={item}
                onEdit={() => {
                  setEditingItem(item);
                  setItemForm({ ...item });
                  setIsItemModalOpen(true);
                }}
                onDelete={() => deleteItem(item.id)}
                onToggleAvailability={() => toggleAvailability(item)}
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-gray-50 group hover:border-brand-orange/10 transition-colors"
          >
            <div className="h-24 w-24 rounded-[2.5rem] bg-gray-50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all">
              <Utensils className="h-12 w-12 text-gray-200" />
            </div>
            <p className="text-gray-400 font-black text-xl tracking-tight">No matching items found.</p>
            <p className="text-gray-300 text-sm mt-2 max-w-[250px] text-center leading-relaxed">
               Try adjusting your search or category filters to find what you're looking for.
            </p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="mt-8 bg-brand-orange text-white font-black hover:scale-105 transition-all px-8 py-3 rounded-2xl shadow-xl shadow-brand-orange/20"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Modals - Re-using clean designs with updated color tokens */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-primary/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-12 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full translate-x-10 -translate-y-10"></div>
              <h2 className="text-3xl font-black text-primary mb-2 tracking-tight relative z-10">New Section</h2>
              <p className="text-gray-400 text-sm mb-10 font-medium relative z-10">Organize your menu logically.</p>
              
              <form onSubmit={handleAddCategory} className="space-y-8 relative z-10">
                <div>
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Section Name</label>
                  <input 
                    autoFocus
                    type="text"
                    placeholder="e.g. Signature Pizzas"
                    className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none text-primary placeholder:text-gray-300"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 py-5 font-black text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-5 bg-primary text-white font-black rounded-2xl hover:bg-brand-orange transition-all shadow-xl shadow-primary/10 flex items-center justify-center disabled:opacity-70"
                  >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isItemModalOpen && (
          <div className="fixed inset-0 bg-primary/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-12 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-4xl font-black text-primary tracking-tight">{editingItem ? "Edit Dish" : "Create Dish"}</h2>
                  <p className="text-gray-400 text-sm font-medium mt-1">Perfect dishes deserve perfect descriptions.</p>
                </div>
                <button onClick={() => setIsItemModalOpen(false)} className="p-4 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all group">
                  <X className="h-6 w-6 text-gray-300 group-hover:text-red-500" />
                </button>
              </div>

              <form onSubmit={handleItemSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Dish Name</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Truffle Beef Burger"
                      className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none text-primary placeholder:text-gray-300"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Price ($)</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. 18.00"
                      className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none text-primary placeholder:text-gray-300"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Section / Category</label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none appearance-none cursor-pointer text-primary"
                        value={itemForm.categoryId}
                        onChange={(e) => setItemForm({...itemForm, categoryId: e.target.value})}
                      >
                        <option value="" disabled>Select a Section</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 pointer-events-none rotate-90" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Description</label>
                    <textarea 
                      rows={4}
                      placeholder="What makes this dish special? Mention key ingredients..."
                      className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none resize-none text-primary placeholder:text-gray-300"
                      value={itemForm.description}
                      onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 ml-1">Image URL (High Quality)</label>
                    <input 
                      type="text"
                      className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-orange/5 transition-all text-sm font-bold outline-none text-primary placeholder:text-gray-300"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={itemForm.imageUrl}
                      onChange={(e) => setItemForm({...itemForm, imageUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-6 border-t border-gray-50">
                  <button 
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="flex-1 py-5 font-black text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-[2] py-5 bg-brand-orange text-white font-black rounded-[1.5rem] hover:bg-orange-600 hover:scale-[1.02] transition-all shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                      <>
                        <Plus className="h-6 w-6" />
                        {editingItem ? "Save Changes" : "Create Menu Item"}
                      </>
                    )}
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
