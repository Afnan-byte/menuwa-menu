"use client";

import { useState, useEffect } from "react";
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
  orderBy
} from "firebase/firestore";
import { Plus, FolderPlus, Utensils, Search, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
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
      // Fetch categories
      const catQuery = query(collection(db, "categories"), where("restaurantId", "==", user?.uid));
      const catSnap = await getDocs(catQuery);
      const catList = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(catList);

      // Fetch items
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
      console.error("Firestore Error:", error);
      toast.error(`Database Error: ${error.message}`);
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
      console.error("Firestore Error:", error);
      toast.error(`Database Error: ${error.message}`);
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

  const filteredItems = activeCategory === "all" 
    ? items 
    : items.filter(i => i.categoryId === activeCategory);

  return (
    <div className="space-y-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tighter">Menu Manager</h1>
          <p className="text-gray-400 font-medium mt-1">Organize your dishes and categories.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-primary font-black rounded-2xl hover:bg-gray-50 transition-all shadow-sm group"
          >
            <FolderPlus className="h-5 w-5 text-gray-400 group-hover:text-primary" />
            Add Category
          </button>
          <button 
            onClick={() => {
              setEditingItem(null);
              setItemForm({ name: "", price: "", description: "", categoryId: categories[0]?.id || "", imageUrl: "", tags: [] });
              setIsItemModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-brand-green/20"
          >
            <Plus className="h-5 w-5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap",
            activeCategory === "all" 
              ? "bg-primary text-white shadow-xl shadow-primary/20" 
              : "bg-white text-gray-400 border border-gray-100 hover:border-primary/20"
          )}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap",
              activeCategory === cat.id 
                ? "bg-primary text-white shadow-xl shadow-primary/20" 
                : "bg-white text-gray-400 border border-gray-100 hover:border-primary/20"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-brand-green" />
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-gray-50 group hover:border-brand-green/10 transition-colors">
          <div className="h-20 w-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Utensils className="h-10 w-10 text-gray-200" />
          </div>
          <p className="text-gray-400 font-black text-lg tracking-tight">No items found.</p>
          <p className="text-gray-300 text-sm mt-1">Start by adding your first delicious dish.</p>
          <button 
            onClick={() => setIsItemModalOpen(true)}
            className="mt-8 text-brand-green font-black hover:scale-105 transition-all bg-brand-green/5 px-8 py-3 rounded-2xl"
          >
            + Add New Item
          </button>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-primary/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl"
          >
            <h2 className="text-2xl font-black text-primary mb-2 tracking-tight">New Category</h2>
            <p className="text-gray-400 text-sm mb-8 font-medium">Create a new section for your menu.</p>
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 ml-1">Category Name</label>
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g. Italian Specials"
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-bold"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-4 bg-primary text-white font-black rounded-2xl hover:bg-brand-green transition-all shadow-xl shadow-primary/10 flex items-center justify-center disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-primary/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-primary tracking-tight">{editingItem ? "Edit Item" : "New Item"}</h2>
                <p className="text-gray-400 text-sm font-medium mt-1">Fill in the details for your menu dish.</p>
              </div>
              <button onClick={() => setIsItemModalOpen(false)} className="p-3 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all">
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleItemSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 ml-1">Dish Name</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. Signature Truffle Pizza"
                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-bold"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 ml-1">Price ($)</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. 24.99"
                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-bold"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <select 
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-bold appearance-none cursor-pointer"
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({...itemForm, categoryId: e.target.value})}
                  >
                    <option value="" disabled>Select a Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 ml-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Describe your dish to make it irresistible..."
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-bold resize-none"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 ml-1">Image URL</label>
                <input 
                  type="text"
                  className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-bold"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={itemForm.imageUrl}
                  onChange={(e) => setItemForm({...itemForm, imageUrl: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4 border-t border-gray-50">
                <button 
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-2 py-4 bg-brand-green text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingItem ? "Update Menu Item" : "Create Dish")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
