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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name: newCategoryName,
        restaurantId: user?.uid,
        createdAt: new Date().toISOString(),
      });
      setCategories([...categories, { id: docRef.id, name: newCategoryName }]);
      setNewCategoryName("");
      setIsCategoryModalOpen(false);
      toast.success("Category added!");
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, "items", editingItem.id), itemForm);
        setItems(items.map(i => i.id === editingItem.id ? { ...editingItem, ...itemForm } : i));
        toast.success("Item updated!");
      } else {
        const docRef = await addDoc(collection(db, "items"), {
          ...itemForm,
          restaurantId: user?.uid,
          isAvailable: true,
          createdAt: new Date().toISOString(),
        });
        setItems([...items, { id: docRef.id, ...itemForm, isAvailable: true } as MenuItem]);
        toast.success("Item added!");
      }
      setIsItemModalOpen(false);
      setEditingItem(null);
      setItemForm({ name: "", price: "", description: "", categoryId: "", imageUrl: "", tags: [] });
    } catch (error) {
      toast.error("Failed to save item");
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Menu Manager</h1>
          <p className="text-gray-500">Organize your dishes and categories.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-primary font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <FolderPlus className="h-4 w-4" />
            Add Category
          </button>
          <button 
            onClick={() => {
              setEditingItem(null);
              setItemForm({ name: "", price: "", description: "", categoryId: categories[0]?.id || "", imageUrl: "", tags: [] });
              setIsItemModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap",
            activeCategory === "all" ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"
          )}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap",
              activeCategory === cat.id ? "bg-primary text-white" : "bg-white text-gray-500 hover:bg-gray-50"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <Utensils className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No items found in this category.</p>
          <button 
            onClick={() => setIsItemModalOpen(true)}
            className="mt-4 text-accent font-bold hover:underline"
          >
            Add your first item
          </button>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-slide-up">
            <h2 className="text-xl font-bold text-primary mb-6">New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input 
                autoFocus
                type="text"
                placeholder="e.g. Starters, Main Course"
                className="w-full px-4 py-3 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-3 font-bold text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">{editingItem ? "Edit Item" : "New Menu Item"}</h2>
              <button onClick={() => setIsItemModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price ($)</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-2 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select 
                    required
                    className="w-full px-4 py-2 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 bg-white"
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({...itemForm, categoryId: e.target.value})}
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL (Optional)</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="https://images.unsplash.com/..."
                  value={itemForm.imageUrl}
                  onChange={(e) => setItemForm({...itemForm, imageUrl: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="flex-1 py-3 font-bold text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-accent text-white font-bold rounded-2xl hover:bg-accent/90 shadow-md"
                >
                  {editingItem ? "Update Item" : "Add to Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
