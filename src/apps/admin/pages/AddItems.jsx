import React, { useState, useRef } from "react";
import { menuService } from "@shared/services";
import { validateMenuItem } from "@shared/lib/validation";
import { sanitizeMenuItem } from "@shared/lib/sanitization";
import { PlusCircle, X, Upload, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const AddItems = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    category: "",
    ingredients: [],
    image: null,
    showInSpecialOffers: false,
    showInChefsSpecials: false,
    showInWeeklySpecials: false,
    specialOffersOrder: "0",
    chefsSpecialsOrder: "0",
    weeklySpecialsOrder: "0",
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [newIngredient, setNewIngredient] = useState("");
  const [newIngredientPrice, setNewIngredientPrice] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const imageInputRef = useRef(null);

  // Add ingredient to the list
  const handleAddIngredient = () => {
    if (newIngredient.trim() !== "" && newIngredientPrice.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        ingredients: [
          ...prev.ingredients,
          {
            name: newIngredient.trim(),
            price: parseFloat(newIngredientPrice) || 0,
          },
        ],
      }));
      setNewIngredient("");
      setNewIngredientPrice("");
      toast.info("Ingredient added to the recipe", { autoClose: 1500 });
    }
  };

  // Remove ingredient
  const handleRemoveIngredient = (index) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // 1. Validation
    const { isValid, errors } = validateMenuItem(formData);
    if (!isValid) {
      setFormErrors(errors);
      toast.error("Please refine your masterpiece details.");
      return;
    }

    if (!formData.image) {
      setFormErrors(prev => ({ ...prev, image: "Visual appearance is mandatory." }));
      toast.error("Don't forget the photo!");
      return;
    }

    setLoading(true);

    try {
      // 2. Sanitization
      const cleanData = sanitizeMenuItem(formData);

      // 3. Prepare FormData
      const formDataToSend = new FormData();
      Object.entries(cleanData).forEach(([key, value]) => {
        if (key === "ingredients") {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
      });

      // 4. API Call via Service
      const response = await menuService.addItem(formDataToSend);

      if (response.status === 201) {
        toast.success("Succulento! Item added to the menu.");
        handleReset();
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to add item to the menu.";
      toast.error(errorMsg);
      console.error("[AddItems Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      discount: "",
      category: "",
      ingredients: [],
      image: null,
      showInSpecialOffers: false,
      showInChefsSpecials: false,
      showInWeeklySpecials: false,
      specialOffersOrder: "0",
      chefsSpecialsOrder: "0",
      weeklySpecialsOrder: "0",
    });
    setImagePreview(null);
    setFormErrors({});
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      if (formErrors.image) setFormErrors(prev => ({ ...prev, image: null }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black !text-slate-900 tracking-tight flex items-center gap-3">
              Add <span className="text-red-600 italic underline underline-offset-8 decoration-amber-400/40">New Item</span>
              <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
            </h1>
            <p className="text-slate-500 font-medium max-w-md">
              Add a new dish to your menu.
            </p>
          </div>
        </header>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden bg-white">
          <form onSubmit={handleSubmit}>
            <CardHeader className="bg-linear-to-br from-red-600 to-red-700 pt-10 pb-20 px-10 text-white relative">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                <PlusCircle className="h-40 w-40" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-serif font-bold mb-2">Item Details</CardTitle>
              <CardDescription className="text-red-100/80 font-medium max-w-sm">
                Enter the name, price, and photo.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-10 -mt-10 bg-white rounded-t-[3rem] pt-12 px-6 md:px-10">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Item Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Diavola Deluxe"
                    className={`h-14 px-6 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-red-600/10 font-bold text-slate-800 transition-all ${formErrors.name ? "border-red-300 bg-red-50/30" : "hover:border-slate-200"
                      }`}
                  />
                  <AnimatePresence>
                    {formErrors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] font-bold text-red-500 ml-2"
                      >
                        {formErrors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Base Price (€)
                    </label>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      className={`h-14 px-6 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-red-600/10 font-serif italic text-lg font-bold ${formErrors.price ? "border-red-300 bg-red-50/30" : "hover:border-slate-200"
                        }`}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                      Discount (%)
                    </label>
                    <Input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="h-14 px-6 rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-amber-500/10 font-bold text-amber-600 hover:border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Logic Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Category Selection
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className={`h-14 px-6 rounded-2xl border-slate-100 bg-slate-50/50 focus:ring-red-600/10 font-bold text-slate-700 capitalize ${formErrors.category ? "border-red-300" : ""
                      }`}>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      {["pizze rosse", "pizze bianche", "fritti", "dolci", "bibite", "birre"].map((cat) => (
                        <SelectItem key={cat} value={cat} className="font-medium cursor-pointer py-3 capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-14 flex items-center">
                  <AnimatePresence mode="wait">
                    {formData.price && formData.discount ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-amber-50/50 border border-amber-100/50 p-4 rounded-2xl w-full flex items-center justify-between"
                      >
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Final Price</span>
                        <p className="text-xl font-serif font-black text-amber-700">
                          €{(formData.price - (formData.price * formData.discount) / 100).toFixed(2)}
                        </p>
                      </motion.div>
                    ) : (
                      <p className="text-slate-300 italic text-xs font-medium ml-2">Fill price to calculate offer...</p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about this dish..."
                  className={`min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-red-600/10 font-medium p-6 resize-none transition-all ${formErrors.description ? "border-red-300 bg-red-50/30" : "hover:border-slate-200"
                    }`}
                />
              </div>

              {/* Specials & Sorting Section */}
              <div className="space-y-6 pt-4 border-t border-slate-100/50">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Specials & Sorting Controls
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/40 p-6 rounded-4xl border border-slate-100/50">
                  {/* Special Offers toggle & order */}
                  <div className="space-y-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">Special Offers</span>
                      <input
                        type="checkbox"
                        name="showInSpecialOffers"
                        checked={formData.showInSpecialOffers}
                        onChange={(e) => setFormData(prev => ({ ...prev, showInSpecialOffers: e.target.checked }))}
                        className="w-5 h-5 accent-red-600 rounded-md cursor-pointer"
                      />
                    </div>
                    {formData.showInSpecialOffers && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sort Order</label>
                        <Input
                          type="number"
                          name="specialOffersOrder"
                          value={formData.specialOffersOrder}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="h-10 px-4 rounded-xl border-slate-100 bg-slate-50/50 focus-visible:ring-red-600/10 font-bold text-slate-800"
                        />
                      </div>
                    )}
                  </div>

                  {/* Chef's Specials toggle & order */}
                  <div className="space-y-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">Chef's Specials</span>
                      <input
                        type="checkbox"
                        name="showInChefsSpecials"
                        checked={formData.showInChefsSpecials}
                        onChange={(e) => setFormData(prev => ({ ...prev, showInChefsSpecials: e.target.checked }))}
                        className="w-5 h-5 accent-red-600 rounded-md cursor-pointer"
                      />
                    </div>
                    {formData.showInChefsSpecials && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sort Order</label>
                        <Input
                          type="number"
                          name="chefsSpecialsOrder"
                          value={formData.chefsSpecialsOrder}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="h-10 px-4 rounded-xl border-slate-100 bg-slate-50/50 focus-visible:ring-red-600/10 font-bold text-slate-800"
                        />
                      </div>
                    )}
                  </div>

                  {/* Weekly Specials toggle & order */}
                  <div className="space-y-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700">Weekly Specials</span>
                      <input
                        type="checkbox"
                        name="showInWeeklySpecials"
                        checked={formData.showInWeeklySpecials}
                        onChange={(e) => setFormData(prev => ({ ...prev, showInWeeklySpecials: e.target.checked }))}
                        className="w-5 h-5 accent-red-600 rounded-md cursor-pointer"
                      />
                    </div>
                    {formData.showInWeeklySpecials && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sort Order</label>
                        <Input
                          type="number"
                          name="weeklySpecialsOrder"
                          value={formData.weeklySpecialsOrder}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="h-10 px-4 rounded-xl border-slate-100 bg-slate-50/50 focus-visible:ring-red-600/10 font-bold text-slate-800"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Extra Ingredients (Optional)
                </label>
                <div className="flex flex-col sm:flex-row gap-4 bg-slate-50/40 p-4 rounded-4xl border border-slate-100/50">
                  <Input
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="Name (e.g. Extra Cheese)"
                    className="h-12 bg-white border-slate-100 rounded-xl px-4 font-medium flex-1 outline-none shadow-sm"
                  />
                  <Input
                    type="number"
                    value={newIngredientPrice}
                    onChange={(e) => setNewIngredientPrice(e.target.value)}
                    placeholder="Price €"
                    step="0.01"
                    className="h-12 bg-white border-slate-100 rounded-xl px-4 font-bold w-full sm:w-32 outline-none shadow-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleAddIngredient}
                    className="h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 sm:px-6 font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                    disabled={!newIngredient || !newIngredientPrice}
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span className="hidden sm:inline">Add Ingredient</span>
                    <span className="inline sm:hidden">Add</span>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2.5 mt-4 min-h-[40px]">
                  <AnimatePresence>
                    {formData.ingredients.map((ingredient, index) => (
                      <motion.div
                        key={`${ingredient.name}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm hover:border-red-100 group transition-colors"
                      >
                        <span className="text-sm font-bold text-slate-700">{ingredient.name}</span>
                        <span className="text-xs font-serif italic text-red-600 font-bold">€{ingredient.price.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(index)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4 pt-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Item Photo
                </label>
                <div
                  className={`border-2 border-dashed rounded-[3rem] p-4 text-center transition-all relative min-h-[300px] flex items-center justify-center ${imagePreview ? "border-emerald-200 bg-emerald-50/10" : "border-slate-100 hover:border-red-200 hover:bg-red-50/10"
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {imagePreview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="relative group w-full h-full p-4"
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-[350px] w-full object-cover rounded-[2.5rem] shadow-2xl transition-transform group-hover:scale-[1.01]"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all rounded-[2.5rem] flex items-center justify-center backdrop-blur-[2px]">
                          <Button
                            type="button"
                            variant="destructive"
                            className="rounded-2xl font-black px-4 sm:px-8 h-12 shadow-2xl scale-110 flex items-center justify-center gap-1.5"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData((prev) => ({ ...prev, image: null }));
                              if (imageInputRef.current) imageInputRef.current.value = "";
                            }}
                          >
                            <X className="h-5 w-5" />
                            <span className="hidden sm:inline">Replace Masterpiece</span>
                            <span className="inline sm:hidden">Replace</span>
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="uploader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-16 w-full cursor-pointer flex flex-col items-center"
                        onClick={() => imageInputRef.current.click()}
                      >
                        <div className="h-20 w-20 flex items-center justify-center bg-slate-50 rounded-full mb-6 border border-slate-100 shadow-inner">
                          <Upload className="h-8 w-8 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xl font-serif font-black text-slate-800">Photo</p>
                          <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">
                            Add a photo of the dish.
                          </p>
                        </div>
                        <Input
                          type="file"
                          ref={imageInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-8 rounded-2xl border-slate-200 font-bold px-4 sm:px-8 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="hidden sm:inline">Select Photo</span>
                          <span className="inline sm:hidden">Select</span>
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {formErrors.image && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[11px] font-bold text-red-500 text-center"
                    >
                      {formErrors.image}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-8 bg-slate-50/30 p-10 border-t border-slate-50">
              <button
                type="button"
                className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                onClick={handleReset}
              >
                Clear Form
              </button>

              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-[240px] h-16 bg-red-600 hover:bg-red-700 text-white rounded-4xl font-black text-lg shadow-2xl shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:grayscale flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-6 w-6" />
                    <span className="hidden sm:inline">Add to Menu</span>
                    <span className="inline sm:hidden">Add Item</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddItems;
