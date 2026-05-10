"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  Plus,
  FolderPlus,
  Utensils,
  Search,
  Loader2,
  X,
  ChevronRight,
  LayoutGrid,
  List,
  Trash2,
  Eye,
  Globe,
  Maximize2,
  Circle,
  Leaf,
  Flame,
  Star,
  FileUp,
  Download
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
  dietaryType?: "veg" | "non-veg" | "none";
  isPopular?: boolean;
}

export default function MenuPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [stockFilter, setStockFilter] = useState<"all" | "available" | "out">("all");

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCatalogueVisible, setIsCatalogueVisible] = useState(true);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);

  useEffect(() => {
    // Collapse categories by default on mobile screens
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsCategoriesExpanded(false);
    }
  }, []);

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
    dietaryType: "none" as "veg" | "non-veg" | "none",
    isPopular: false,
    isAvailable: true,
  });

  useEffect(() => {
    if (user) {
      fetchMenu();
    }
  }, [user]);



  const detectDietaryType = (name: string): "veg" | "non-veg" | "none" => {
    const lowerName = name.toLowerCase();
    const nonVegKeywords = ["chicken", "mutton", "beef", "fish", "egg", "prawn", "pork", "meat", "bacon", "pepperoni", "salami", "ham", "turkey", "squid", "crab", "lobster", "duck", "lamb"];
    const vegKeywords = ["paneer", "veg", "mushroom", "cheese", "corn", "potato", "dal", "tofu", "soya", "gobi", "aloo"];

    if (nonVegKeywords.some(keyword => lowerName.includes(keyword))) return "non-veg";
    if (vegKeywords.some(keyword => lowerName.includes(keyword))) return "veg";
    return "none";
  };

  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(url);
          reject(new Error("Timeout"));
        }, 5000);

        img.onload = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(url);
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("No context"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Blob failed"));
          }, "image/webp", 0.8);
        };
        img.onerror = () => {
          clearTimeout(timeout);
          URL.revokeObjectURL(url);
          reject(new Error("Load failed"));
        };
        img.src = url;
      } catch (e) {
        reject(e);
      }
    });
  };

  const [isItemImageDragging, setIsItemImageDragging] = useState(false);

  const handleItemImageUpload = async (file: File) => {
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const toastId = toast.loading("Uploading to Cloudinary...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "od1sjbbu");
      formData.append("api_key", "955253717999674");
      formData.append("cloud_name", "da1edgeae1");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/da1edgeae1/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error("Cloudinary Raw Error:", responseText);
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
      
      if (data.secure_url) {
        setItemForm(prev => ({ ...prev, imageUrl: data.secure_url }));
        toast.success("Dish photo uploaded!", { id: toastId });
      }
    } catch (error: any) {
      console.error("Cloudinary Full Error:", error);
      toast.error(`Upload failed: ${error.message || 'Check Cloudinary settings'}`, { id: toastId });
    }
  };

  const handleClearEverything = async () => {
    if (!user || (items.length === 0 && categories.length === 0)) return;

    if (!window.confirm(`⚠️ WARNING: This will PERMANENTLY DELETE all ${items.length} items and all ${categories.length} sections. This action cannot be undone. Are you sure?`)) {
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Clearing entire menu...");
    try {
      const batch = writeBatch(db);
      
      // Delete all items
      items.forEach(item => {
        batch.delete(doc(db, "items", item.id));
      });

      // Delete all categories
      categories.forEach(cat => {
        batch.delete(doc(db, "categories", cat.id));
      });

      await batch.commit();
      setItems([]);
      setCategories([]);
      setActiveCategory("all");
      toast.success("Menu cleared successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear menu", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      let csvData = event.target?.result as string;
      
      if (csvData.startsWith("\ufeff")) {
        csvData = csvData.substring(1);
      }

      const lines = csvData.split(/\r?\n/).filter(line => line.trim());
      
      if (lines.length <= 1) {
        toast.error("CSV file is empty or only contains headers");
        return;
      }

      setIsSaving(true);
      const toastId = toast.loading("Processing bulk import...");

      try {
        // Detect delimiter by checking header and first data row
        const detect = (str: string) => ({
          commas: (str.match(/,/g) || []).length,
          semicolons: (str.match(/;/g) || []).length,
          tabs: (str.match(/\t/g) || []).length,
        });

        const hStats = detect(lines[0]);
        const dStats = detect(lines[1]);
        
        let delimiter = ",";
        if (hStats.semicolons > 0 && dStats.semicolons === hStats.semicolons) delimiter = ";";
        else if (hStats.tabs > 0 && dStats.tabs === hStats.tabs) delimiter = "\t";
        else if (hStats.commas > 0) delimiter = ",";

        // Advanced regex parser with recursive unwrapping for "wrapped" CSV lines
        const parseLine = (line: string, delim: string): string[] => {
          const pattern = new RegExp(
            `(${delim}|\\r?\\n|^)(?:"([^"]*(?:""[^"]*)*)"|([^"${delim}\\r\\n]*))`,
            "gi"
          );
          let result = [];
          let match;
          while ((match = pattern.exec(line))) {
            let val = match[2] !== undefined ? match[2].replace(/""/g, '"') : match[3];
            result.push(val ? val.trim() : "");
            if (match[1] === delim && line[pattern.lastIndex] === undefined) {
              result.push("");
            }
          }
          
          // Fix for "Wrapped" lines: If the entire line was one big quoted string
          // but contains our delimiter, it means we need to unwrap and re-parse.
          if (result.length === 1 && result[0].includes(delim)) {
            return parseLine(result[0], delim);
          }
          
          return result;
        };

        const headers = parseLine(lines[0], delimiter);
        const dataRows = lines.slice(1).map(line => parseLine(line, delimiter));

        const getIdx = (name: string) => {
          const lowerName = name.toLowerCase().trim();
          let idx = headers.findIndex(h => h.toLowerCase().trim() === lowerName);
          if (idx !== -1) return idx;
          return headers.findIndex(h => h.toLowerCase().includes(lowerName));
        };
        const catIdx = getIdx("Category");
        const nameIdx = getIdx("Name");
        const priceIdx = getIdx("Price");
        const descIdx = getIdx("Description");
        const imgIdx = getIdx("Image");
        const dietIdx = getIdx("Dietary");
        const popIdx = getIdx("Popular");

        if (catIdx === -1 || nameIdx === -1 || priceIdx === -1) {
          toast.error("CSV missing required headers: Category, Name, Price", { id: toastId });
          setIsSaving(false);
          return;
        }

        // 1. Identify unique categories and create missing ones in a batch
        const uniqueCatNames = Array.from(new Set(dataRows.map(row => row[catIdx]).filter(Boolean)));
        const existingCatMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

        const currentCategories = [...categories];
        let catBatch = writeBatch(db);
        let catCount = 0;
        
        for (const catName of uniqueCatNames) {
          if (!existingCatMap.has(catName.toLowerCase().trim())) {
            const newCatRef = doc(collection(db, "categories"));
            catBatch.set(newCatRef, {
              name: catName.trim(),
              restaurantId: user.uid,
              createdAt: new Date().toISOString(),
            });
            existingCatMap.set(catName.toLowerCase().trim(), newCatRef.id);
            currentCategories.push({ id: newCatRef.id, name: catName.trim() });
            catCount++;
          }
        }
        
        if (catCount > 0) {
          await catBatch.commit();
          setCategories(currentCategories);
        }

        // 2. Batch create items with real-time progress
        const batchSize = 500;
        let itemBatch = writeBatch(db);
        let itemCount = 0;
        let totalProcessed = 0;

        for (const row of dataRows) {
          const categoryId = existingCatMap.get(row[catIdx]?.toLowerCase().trim());
          if (!categoryId) continue;

          const rawDietary = row[dietIdx]?.toLowerCase().trim() || "none";
          const dietaryType = rawDietary === "none" ? detectDietaryType(row[nameIdx] || "") : rawDietary as any;
          
          const rawImageUrl = (row[imgIdx] || "").trim();
          const imageUrl = (rawImageUrl.startsWith("http") || rawImageUrl.startsWith("/")) 
            ? rawImageUrl 
            : "";

          const itemData = {
            restaurantId: user.uid,
            categoryId,
            name: (row[nameIdx] || "Unnamed Item").trim(),
            price: (row[priceIdx] || "0").trim(),
            description: (row[descIdx] || "").trim(),
            imageUrl,
            dietaryType,
            isPopular: row[popIdx]?.toLowerCase().trim() === "true",
            isAvailable: true,
            tags: [],
            createdAt: new Date().toISOString(),
          };

          const itemRef = doc(collection(db, "items"));
          itemBatch.set(itemRef, itemData);
          itemCount++;
          totalProcessed++;

          if (itemCount === batchSize) {
            await itemBatch.commit();
            itemBatch = writeBatch(db);
            itemCount = 0;
            toast.loading(`Imported ${totalProcessed} items...`, { id: toastId });
          }
        }

        if (itemCount > 0) {
          await itemBatch.commit();
        }

        toast.success(`Successfully imported ${totalProcessed} items!`, { id: toastId });
        fetchMenu();
      } catch (error) {
        console.error(error);
        toast.error("Import failed. Please check your CSV format.", { id: toastId });
      } finally {
        setIsSaving(false);
        if (e.target) e.target.value = ""; // Reset input
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    if (items.length === 0) {
      toast.error("No items to export");
      return;
    }

    const headers = ["Category", "Name", "Price", "Description", "Image", "Dietary", "Popular"];
    const csvRows = [headers.join(",")];

    items.forEach(item => {
      const categoryName = categories.find(c => c.id === item.categoryId)?.name || "";
      const row = [
        `"${categoryName.replace(/"/g, '""')}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.price.replace(/"/g, '""')}"`,
        `"${(item.description || "").replace(/"/g, '""')}"`,
        `"${(item.imageUrl || "").replace(/"/g, '""')}"`,
        `"${item.dietaryType || "none"}"`,
        item.isPopular ? "true" : "false"
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `menu_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Menu exported successfully!");
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

  const handleDeleteCategory = async (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure? This will delete the category and ALL items inside it.")) return;

    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, "categories", catId));
      const categoryItems = items.filter(i => i.categoryId === catId);
      categoryItems.forEach(item => {
        batch.delete(doc(db, "items", item.id));
      });
      await batch.commit();
      setCategories(categories.filter(c => c.id !== catId));
      setItems(items.filter(i => i.categoryId !== catId));
      if (activeCategory === catId) setActiveCategory("all");
      toast.success("Category and items removed");
    } catch (error) {
      toast.error("Deletion failed");
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
      setItemForm({ name: "", price: "", description: "", categoryId: "", imageUrl: "", tags: [], dietaryType: "none", isPopular: false, isAvailable: true });
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
      
      const matchesStock = stockFilter === "all" || 
        (stockFilter === "available" ? item.isAvailable : !item.isAvailable);

      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [items, activeCategory, searchQuery, stockFilter]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] font-sans overflow-hidden">
      <div className="p-4 md:p-10 pb-4">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">Menu Manager</h1>
        <p className="text-gray-400 font-medium mt-1">Found {items.length} items in your collection.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 px-4 md:px-10 pb-10 overflow-hidden lg:overflow-visible relative">
        {/* Sidebar Filter Panel */}
      <AnimatePresence>
        {isCatalogueVisible && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full lg:w-72 flex-shrink-0 lg:h-full lg:overflow-y-auto custom-scrollbar pr-2"
          >
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100/50 lg:min-h-full">
              <div className="flex items-center justify-between mb-2 md:mb-10">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-medium text-primary tracking-tight">Catalogue</h2>
                    <button 
                      onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                      className="lg:hidden p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors flex items-center gap-2"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest">{isCategoriesExpanded ? "Hide" : "Show"}</span>
                      {isCategoriesExpanded ? <ChevronRight className="h-5 w-5 rotate-90 transition-transform" /> : <ChevronRight className="h-5 w-5 transition-transform" />}
                    </button>
                  </div>
                  <p className="hidden md:block text-[10px] font-medium text-gray-300 uppercase tracking-widest mt-1">Manage Categories</p>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="p-3 bg-gray-100 text-[#196F03] rounded-2xl hover:bg-[#196F03] hover:text-white transition-all shadow-sm group"
                >
                  <FolderPlus className="h-5 w-5" />
                </button>
              </div>

          <AnimatePresence>
            {isCategoriesExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 mt-4">
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all group text-left",
                      activeCategory === "all" ? "bg-[#196F03] text-white shadow-xl shadow-brand-green/30" : "hover:bg-gray-50 text-gray-500"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl transition-colors", activeCategory === "all" ? "bg-white/20 text-white" : "bg-gray-100 group-hover:bg-white text-gray-400 group-hover:text-[#196F03]")}>
                        <LayoutGrid className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium">All Items</span>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 opacity-50", activeCategory === "all" ? "text-white" : "text-gray-300")} />
                  </button>

                  {categories.map((cat) => (
                    <div key={cat.id} className="relative group">
                      <button
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl transition-all group text-left pr-12",
                          activeCategory === cat.id ? "bg-[#196F03] text-white shadow-xl shadow-brand-green/30" : "hover:bg-gray-50 text-gray-500"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl transition-colors", activeCategory === cat.id ? "bg-white/20 text-white" : "bg-gray-100 group-hover:bg-white text-gray-400 group-hover:text-[#196F03]")}>
                            <Utensils className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-medium truncate max-w-[120px]">{cat.name}</span>
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleDeleteCategory(cat.id, e)}
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500",
                          activeCategory === cat.id ? "text-white/40 hover:bg-white/10 hover:text-white" : "text-gray-300"
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-gray-50">
            <div className="bg-primary/5 rounded-[2rem] p-6 text-center border border-primary/5">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="w-full py-3 bg-primary text-white font-medium text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:bg-[#196F03] hover:shadow-brand-green/20 transition-all flex items-center justify-center gap-2"
              >
                <Eye className="h-3 w-3" />
                View Live Menu
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-3">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="w-full flex items-center gap-3 p-4 bg-gray-50 text-[#196F03] rounded-2xl hover:bg-[#196F03] hover:text-white transition-all group font-medium text-xs"
            >
              <FolderPlus className="h-4 w-4" />
              Add New Section
            </button>
            <button
              onClick={handleClearEverything}
              disabled={categories.length === 0 && items.length === 0}
              className="w-full flex items-center gap-3 p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all group font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Clear Entire Menu
            </button>
          </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 space-y-8 min-w-0 lg:h-full lg:overflow-y-auto custom-scrollbar px-2">
        <div className="flex flex-col gap-8 mb-4">
          {/* Search Bar & Filters Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-[#196F03] transition-colors" />
              <input
                type="text"
                placeholder="Search anything in your menu..."
                className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] text-sm font-medium outline-none focus:ring-4 focus:ring-brand-green/5 focus:border-[#196F03] transition-all shadow-sm shadow-gray-100/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex bg-gray-100/50 p-1.5 rounded-[1.5rem] self-stretch md:self-auto">
              {[
                { id: "all", label: "All" },
                { id: "available", label: "In Stock" },
                { id: "out", label: "Out of Stock" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStockFilter(filter.id as any)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    stockFilter === filter.id 
                      ? "bg-white text-[#196F03] shadow-sm" 
                      : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons Row with Drag & Drop */}
          <div 
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-brand-green/5', 'border-brand-green'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('bg-brand-green/5', 'border-brand-green'); }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('bg-brand-green/5', 'border-brand-green');
              const file = e.dataTransfer.files?.[0];
              if (file && file.name.endsWith('.csv')) {
                const mockEvent = { target: { files: [file] } } as any;
                handleCSVImport(mockEvent);
              } else {
                toast.error("Please drop a valid CSV file");
              }
            }}
            className="flex flex-wrap items-center gap-2 w-full p-2 rounded-[2rem] border-2 border-transparent transition-all"
          >
            <input
              type="file"
              accept=".csv"
              id="csv-import"
              className="hidden"
              onChange={handleCSVImport}
            />
            <button
              onClick={() => document.getElementById("csv-import")?.click()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-100 text-primary text-xs font-semibold rounded-2xl hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
            >
              <FileUp className="h-4 w-4 text-[#196F03]" />
              Import CSV
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-100 text-primary text-xs font-semibold rounded-2xl hover:bg-gray-50 transition-all shadow-sm whitespace-nowrap"
            >
              <Download className="h-4 w-4 text-blue-500" />
              Export
            </button>
            <div className="w-full sm:w-auto sm:ml-auto">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setItemForm({ name: "", price: "", description: "", categoryId: categories[0]?.id || "", imageUrl: "", tags: [], dietaryType: "none", isPopular: false, isAvailable: true });
                  setIsItemModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#196F03] border border-transparent text-white text-xs font-bold rounded-2xl hover:bg-green-700 hover:scale-105 transition-all shadow-lg shadow-brand-green/20 whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                Add Dish
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex items-center gap-6">
            <button className="text-xs font-medium text-[#196F03] border-b-2 border-brand-green pb-6 -mb-[26px]">All Dishes</button>
            <button 
              onClick={handleClearEverything}
              disabled={categories.length === 0 && items.length === 0}
              className="text-xs font-bold text-red-500 hover:text-red-600 pb-6 -mb-[26px] disabled:opacity-50 transition-colors uppercase tracking-widest"
            >
              Clear Menu
            </button>
          </div>
          <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-white shadow-sm text-[#196F03]" : "text-gray-400")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-white shadow-sm text-[#196F03]" : "text-gray-400")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="h-12 w-12 animate-spin text-[#196F03] mb-4" />
            <p className="text-xs font-medium text-gray-300 uppercase tracking-widest">Loading your menu...</p>
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
                  setItemForm({
                    ...item,
                    dietaryType: item.dietaryType || "none",
                    isPopular: item.isPopular || false,
                    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
                  });
                  setIsItemModalOpen(true);
                }}
                onDelete={() => deleteItem(item.id)}
                onToggleAvailability={() => toggleAvailability(item)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-gray-50">
            <p className="text-gray-400 font-medium text-xl tracking-tight">No items found.</p>
          </div>
        )}
      </div>
    </div>

    {/* Modals */}
    <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-primary/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-12 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <h2 className="text-3xl font-medium text-primary mb-2 tracking-tight">New Section</h2>
              <form onSubmit={handleAddCategory} className="space-y-8 mt-6">
                <input
                  type="text"
                  placeholder="e.g. Signature Pizzas"
                  className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all text-sm font-medium outline-none text-primary"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-5 font-medium text-gray-400">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-5 bg-primary text-white font-medium rounded-2xl shadow-xl shadow-primary/10 flex items-center justify-center">
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
                <h2 className="text-4xl font-extrabold text-primary tracking-tight">{editingItem ? "Edit Dish" : "Create Dish"}</h2>
                <button onClick={() => setIsItemModalOpen(false)} className="p-4 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"><X className="h-6 w-6 text-gray-300" /></button>
              </div>

              <form onSubmit={handleItemSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-medium text-gray-300 uppercase tracking-widest ml-1 mb-3 block">Dish Category</label>
                    <select required className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white text-sm font-medium outline-none text-primary" value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}>
                      <option value="" disabled>Select a Section</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-medium text-gray-300 uppercase tracking-widest ml-1 mb-3 block">Dish Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Truffle Mushroom Pasta" 
                      className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white text-sm font-medium outline-none text-primary" 
                      value={itemForm.name} 
                      onChange={(e) => {
                        const newName = e.target.value;
                        const detectedType = detectDietaryType(newName);
                        setItemForm({ 
                          ...itemForm, 
                          name: newName,
                          dietaryType: itemForm.dietaryType === "none" ? detectedType : itemForm.dietaryType
                        });
                      }} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-medium text-gray-300 uppercase tracking-widest ml-1 mb-3 block">Price</label>
                    <input required type="text" placeholder="e.g. $18.50" className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white text-sm font-medium outline-none text-primary" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-medium text-gray-300 uppercase tracking-widest ml-1 mb-4 block">Dietary Type</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        {
                          id: "veg",
                          label: "Vegetarian",
                          icon: Leaf,
                          color: "text-[#196F03]",
                          bg: "bg-white"
                        },
                        {
                          id: "non-veg",
                          label: "Non-Veg",
                          icon: Flame,
                          color: "text-red-500",
                          bg: "bg-white"
                        },
                        {
                          id: "none",
                          label: "None",
                          icon: Circle,
                          color: "text-gray-400",
                          bg: "bg-white"
                        },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setItemForm({ ...itemForm, dietaryType: type.id as any })}
                          className={cn(
                            "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all shadow-sm",
                            itemForm.dietaryType === type.id
                              ? "border-[#196F03] bg-[#196F03]/5 ring-4 ring-[#196F03]/5"
                              : "border-gray-50 hover:border-gray-200"
                          )}
                        >
                          <div className={cn("p-3 rounded-2xl transition-all shadow-inner", type.bg, type.color)}>
                            <type.icon className="h-6 w-6" />
                          </div>
                          <span className={cn("text-[10px] font-medium uppercase tracking-widest", itemForm.dietaryType === type.id ? "text-[#196F03]" : "text-gray-400")}>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                    <div>
                      <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                        <Star className="h-4 w-4 text-brand-orange" /> Mark as Top Selling Product
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Display prominently at the top of your menu</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={itemForm.isPopular} onChange={(e) => setItemForm({ ...itemForm, isPopular: e.target.checked })} />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#196F03]"></div>
                    </label>
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                    <div>
                      <h3 className="text-sm font-medium text-primary flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-[#196F03]" /> Availability Status
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Toggle "Out of Stock" status for this item</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={itemForm.isAvailable} onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })} />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#196F03]"></div>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1 mb-4 block">Dish Image</label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsItemImageDragging(true); }}
                      onDragLeave={() => setIsItemImageDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsItemImageDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleItemImageUpload(file);
                      }}
                      className={cn(
                        "flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border-2 border-dashed transition-all group relative overflow-hidden",
                        isItemImageDragging ? "border-[#196F03] bg-[#196F03]/5 ring-8 ring-[#196F03]/5" : "border-gray-100 hover:border-gray-200"
                      )}
                    >
                      <div className="h-24 w-24 rounded-[1.5rem] bg-white shadow-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10 border border-gray-50">
                        {itemForm.imageUrl ? (
                          <img src={itemForm.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <Utensils className="h-10 w-10 text-gray-200" />
                        )}
                        {isItemImageDragging && (
                          <div className="absolute inset-0 bg-[#196F03]/80 flex items-center justify-center text-white">
                            <Plus className="h-8 w-8 animate-bounce" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1 relative z-10 text-center sm:text-left">
                        <h4 className="text-sm font-bold text-primary tracking-tight">Drop dish photo here</h4>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Or click to browse from device</p>
                      </div>
                      <input
                        type="file"
                        id="dish-image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleItemImageUpload(file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById("dish-image-upload")?.click()}
                        className="relative z-10 px-6 py-3 bg-white text-primary text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-sm border border-gray-100 hover:bg-primary hover:text-white transition-all"
                      >
                        Select Image
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2 px-2">
                      <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Or paste a direct image link below</p>
                    </div>
                    <div className="mt-2 relative">
                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                      <input
                        type="text"
                        value={itemForm.imageUrl}
                        onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-transparent rounded-xl focus:bg-white text-xs font-medium outline-none text-primary"
                        placeholder="Image URL"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1 mb-3 block">Description</label>
                    <textarea rows={4} placeholder="Describe the flavors and ingredients..." className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white text-sm font-bold outline-none resize-none text-primary" value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
                  </div>
                </div>

                <div className="flex gap-6 pt-10 border-t border-gray-50">
                  <button type="button" onClick={() => setIsItemModalOpen(false)} className="flex-1 py-5 font-bold text-gray-400">Discard</button>
                  <button type="submit" disabled={isSaving} className="flex-[2] py-5 bg-[#196F03] text-white font-bold rounded-[1.5rem] shadow-xl shadow-brand-green/20 flex items-center justify-center gap-3">
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : (editingItem ? "Save Changes" : "Create Item")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isPreviewOpen && (
          <div className="fixed inset-0 bg-primary/90 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center p-4 sm:p-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Globe className="h-5 w-5 text-brand-green" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Live Menu Preview</h2>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Interactive Dashboard Preview</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => window.open(`/menu/${user?.uid}`, '_blank')} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Maximize2 className="h-5 w-5" /></button>
                  <button onClick={() => setIsPreviewOpen(false)} className="p-3 bg-white/10 hover:bg-red-500 rounded-xl transition-all"><X className="h-5 w-5" /></button>
                </div>
              </div>
              <div className="flex-1 bg-white rounded-[3rem] overflow-hidden shadow-2xl relative">
                <iframe src={`/menu/${user?.uid}`} className="w-full h-full border-none" title="Menu Preview" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
