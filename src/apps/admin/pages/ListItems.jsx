import React, { useEffect, useState, useCallback } from "react";
import { menuService } from "@shared/services";
import { Trash2, Search, Filter, AlertCircle, Edit, Edit3, Loader2 } from "lucide-react";
import { Input } from "@shared/components/ui/input";
import { FaStar } from "react-icons/fa";
import { getOptimizedImageUrl } from "@shared/utils/cloudinary";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import { Card, CardContent } from "@shared/components/ui/card";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import EditProductDialog from "../components/EditProductDialog";
import DeleteProductDialog from "../components/DeleteProductDialog";

const ListItems = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("pizze rosse");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState({
    _id: "",
    name: "",
    description: "",
    price: "",
    category: "",
    ingredients: [],
    image: null,
  });
  const [newIngredient, setNewIngredient] = useState("");
  const [newIngredientPrice, setNewIngredientPrice] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      const response = await menuService.getAllItems();
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error("[ListItems Fetch Error]:", error);
      setError("Mamma Mia! Failed to retrieve the menu gallery.");
      toast.error("Could not load masterpieces.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    let result = items;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    if (categoryFilter) {
      result = result.filter(
        (item) => item.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    setFilteredItems(result);
  }, [searchTerm, categoryFilter, items]);

  const handleDelete = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      await menuService.deleteItem(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Item deleted.");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("[ListItems Delete Error]:", error);
      toast.error("Failed to delete item.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", itemToEdit.name);
      formData.append("description", itemToEdit.description);
      formData.append("price", itemToEdit.price);
      formData.append("discount", parseFloat(itemToEdit.discount) || 0);
      formData.append("category", itemToEdit.category);
      formData.append("ingredients", JSON.stringify(itemToEdit.ingredients));
      formData.append("showInSpecialOffers", itemToEdit.showInSpecialOffers || false);
      formData.append("showInChefsSpecials", itemToEdit.showInChefsSpecials || false);
      formData.append("showInWeeklySpecials", itemToEdit.showInWeeklySpecials || false);
      formData.append("specialOffersOrder", parseInt(itemToEdit.specialOffersOrder) || 0);
      formData.append("chefsSpecialsOrder", parseInt(itemToEdit.chefsSpecialsOrder) || 0);
      formData.append("weeklySpecialsOrder", parseInt(itemToEdit.weeklySpecialsOrder) || 0);

      if (itemToEdit.image && typeof itemToEdit.image !== "string") {
        formData.append("image", itemToEdit.image);
      }

      const response = await menuService.updateItem(itemToEdit._id, formData);
      setItems((prev) =>
        prev.map((item) => (item._id === response.data._id ? response.data : item))
      );
      toast.success("Item updated.");
      setEditDialogOpen(false);
      setImagePreview(null);
    } catch (err) {
      console.error("[ListItems Update Error]:", err);
      toast.error("Failed to update masterpiece.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["pizze rosse", "pizze bianche", "fritti", "dolci", "bibite", "birre"];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black !text-slate-900 tracking-tight">
              Menu <span className="text-red-600 italic underline underline-offset-8 decoration-amber-400/40">Items</span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm font-medium">
              Manage and edit your food menu.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="relative group flex-1 md:min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
              <Input
                type="search"
                placeholder="Find an item..."
                className="pl-12 w-full bg-slate-50 border-none rounded-xl focus-visible:ring-red-600/10 font-medium h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-none rounded-xl focus:ring-red-600/10 font-bold text-slate-700 h-12 px-6">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 capitalize z-50 bg-white">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="cursor-pointer font-medium h-10 px-4">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <AnimatePresence mode="popLayout">
          {loading && items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center h-80 bg-white/20 backdrop-blur-sm rounded-4xl border border-white"
            >
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Loading items...</p>
              </div>
            </motion.div>
          ) : filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-20 rounded-4xl text-center border border-slate-100 shadow-sm"
            >
              <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-serif font-black text-slate-900 mb-2">No items found</h3>
              <p className="text-slate-400 font-medium">
                Try a different search or filter.
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div
                    className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform-gpu hover:-translate-y-1 will-change-transform"
                    style={{ contain: "layout" }}
                  >
                    {/* Badges */}
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                      {item.discount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          -{item.discount}%
                        </span>
                      )}
                      {item.showInChefsSpecials && (
                        <span className="bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                          <FaStar size={8} /> Special
                        </span>
                      )}
                    </div>

                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={getOptimizedImageUrl(item.image, 400)}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          className="bg-white text-gray-800 text-xs font-bold px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-blue-600 hover:text-white flex items-center gap-1.5 cursor-pointer"
                          onClick={() => {
                            setItemToEdit(item);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit3 className="size-3.5" /> Edit
                        </button>
                        <button
                          className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-red-700 flex items-center gap-1.5 cursor-pointer"
                          onClick={() => {
                            setItemToDelete(item);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors capitalize">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          <FaStar className="text-amber-400" />
                          <span>{item.rating || 4.5}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-500 line-clamp-2 mb-3 leading-relaxed flex-grow">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                        <div className="flex flex-col">
                          {item.discount > 0 && (
                            <span className="text-[10px] text-gray-400 line-through">
                              €{parseFloat(item.price).toFixed(2)}
                            </span>
                          )}
                          <span className="font-bold text-base text-red-600">
                            €{(item.price - (item.price * (item.discount || 0)) / 100).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <div className={`h-1.5 w-1.5 rounded-full ${item.available ? "bg-emerald-400" : "bg-red-400"}`}></div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            {item.available ? "Active" : "Hidden"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DeleteProductDialog
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        itemToDelete={itemToDelete}
        handleDelete={handleDelete}
        loading={loading}
      />

      <EditProductDialog
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        itemToEdit={itemToEdit}
        handleEditChange={(field, value) => setItemToEdit(prev => ({ ...prev, [field]: value }))}
        handleEditSubmit={handleEditSubmit}
        categories={categories}
        newIngredient={newIngredient}
        setNewIngredient={setNewIngredient}
        newIngredientPrice={newIngredientPrice}
        setNewIngredientPrice={setNewIngredientPrice}
        handleAddIngredient={() => {
          if (newIngredient.trim() !== "" && newIngredientPrice.trim() !== "") {
            setItemToEdit(prev => ({
              ...prev,
              ingredients: [...prev.ingredients, { name: newIngredient.trim(), price: parseFloat(newIngredientPrice) || 0 }]
            }));
            setNewIngredient("");
            setNewIngredientPrice("");
          }
        }}
        handleRemoveIngredient={(i) => setItemToEdit(prev => ({
          ...prev,
          ingredients: prev.ingredients.filter((_, idx) => idx !== i)
        }))}
        handleFileChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setItemToEdit(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
          }
        }}
        imagePreview={imagePreview}
        loading={loading}
      />
    </div>
  );
};

export default ListItems;
