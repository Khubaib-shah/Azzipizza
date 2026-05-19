import React from "react";
import { Textarea } from "@shared/components/ui/textarea";
import { X, Upload, Pencil, Trash2, Plus, Save } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import Modal from "@shared/components/ui/Modal";
import { Input } from "@shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
const EditProductDialog = ({
  editDialogOpen,
  setEditDialogOpen,
  itemToEdit,
  handleEditChange,
  handleEditSubmit,
  categories,
  newIngredient,
  setNewIngredient,
  newIngredientPrice,
  setNewIngredientPrice,
  handleAddIngredient,
  handleRemoveIngredient,
  handleFileChange,
  imagePreview,
  loading,
}) => {
  return (
    <Modal
      isOpen={editDialogOpen}
      onClose={() => setEditDialogOpen(false)}
      className="max-w-2xl"
    >
      <div className="p-3 md:p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-black text-slate-900 mb-1">
            Edit Menu Item
          </h2>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Update the details of this menu item
          </p>
        </div>

        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name</label>
                <Input
                  placeholder="Item Name"
                  value={itemToEdit.name}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Description"
                  value={itemToEdit.description}
                  onChange={(e) =>
                    handleEditChange("description", e.target.value)
                  }
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  placeholder="Price"
                  value={itemToEdit.price}
                  onChange={(e) => handleEditChange("price", e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount (%)</label>
                <Input
                  type="number"
                  placeholder="Enter discount %"
                  value={itemToEdit.discount || ""}
                  onChange={(e) => handleEditChange("discount", e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              {itemToEdit.price && itemToEdit.discount > 0 && (
                <p className="text-sm text-green-600">
                  Discounted Price: €
                  {(
                    itemToEdit.price -
                    (itemToEdit.price * itemToEdit.discount) / 100
                  ).toFixed(2)}{" "}
                  ({itemToEdit.discount}% OFF)
                </p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={itemToEdit.category}
                  onValueChange={(value) => handleEditChange("category", value)}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="capitalize cursor-pointer"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ingredients</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="Ingredient name"
                  />
                  <Input
                    type="number"
                    value={newIngredientPrice}
                    onChange={(e) => setNewIngredientPrice(e.target.value)}
                    placeholder="Price"
                    min="0"
                    step="0.01"
                  />
                  <Button
                    type="button"
                    onClick={handleAddIngredient}
                    variant="outline"
                    size="sm"
                    className={`cursor-pointer font-bold flex items-center justify-center gap-1.5 px-3 sm:px-4 ${
                      newIngredient && newIngredientPrice && "cursor-pointer"
                    }`}
                    disabled={!newIngredient || !newIngredientPrice}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add</span>
                  </Button>
                </div>

                {itemToEdit.ingredients?.length > 0 && (
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {itemToEdit.ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div className="flex-1">{ingredient.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            €{ingredient.price.toFixed(2)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 p-1 h-6 w-6 cursor-pointer"
                            onClick={() => handleRemoveIngredient(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview || itemToEdit.image ? (
                    <div className="space-y-3">
                      <img
                        src={
                          imagePreview ||
                          (typeof itemToEdit.image === "string"
                            ? itemToEdit.image
                            : URL.createObjectURL(itemToEdit.image))
                        }
                        alt="Preview"
                        className="mx-auto h-40 object-contain rounded"
                      />
                      <div className="flex flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="cursor-pointer flex-1 flex items-center justify-center gap-1.5"
                          onClick={() =>
                            document.getElementById("editImageInput").click()
                          }
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="hidden sm:inline">Change Image</span>
                          <span className="inline sm:hidden">Change</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            setImagePreview(null);
                            handleEditChange("image", null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Remove Image</span>
                          <span className="inline sm:hidden">Remove</span>
                        </Button>
                      </div>
                      <Input
                        id="editImageInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        Upload an image
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full cursor-pointer flex items-center justify-center gap-1.5"
                        onClick={() =>
                          document.getElementById("editImageInput").click()
                        }
                      >
                        <Upload className="h-4 w-4" />
                        <span>Select Image</span>
                      </Button>
                      <Input
                        id="editImageInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Specials & Sorting Section */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Specials & Sorting Controls
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Special Offers */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Special Offers
                  </span>
                  <input
                    type="checkbox"
                    checked={itemToEdit.showInSpecialOffers || false}
                    onChange={(e) =>
                      handleEditChange("showInSpecialOffers", e.target.checked)
                    }
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>
                {itemToEdit.showInSpecialOffers && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      value={
                        itemToEdit.specialOffersOrder !== undefined
                          ? itemToEdit.specialOffersOrder
                          : "0"
                      }
                      onChange={(e) =>
                        handleEditChange("specialOffersOrder", e.target.value)
                      }
                      placeholder="0"
                      className="h-8 px-2 text-xs rounded-lg border-slate-100 bg-white focus-visible:ring-red-600/10 font-bold text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Chef's Specials */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Chef's Specials
                  </span>
                  <input
                    type="checkbox"
                    checked={itemToEdit.showInChefsSpecials || false}
                    onChange={(e) =>
                      handleEditChange("showInChefsSpecials", e.target.checked)
                    }
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>
                {itemToEdit.showInChefsSpecials && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      value={
                        itemToEdit.chefsSpecialsOrder !== undefined
                          ? itemToEdit.chefsSpecialsOrder
                          : "0"
                      }
                      onChange={(e) =>
                        handleEditChange("chefsSpecialsOrder", e.target.value)
                      }
                      placeholder="0"
                      className="h-8 px-2 text-xs rounded-lg border-slate-100 bg-white focus-visible:ring-red-600/10 font-bold text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Weekly Specials */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Weekly Specials
                  </span>
                  <input
                    type="checkbox"
                    checked={itemToEdit.showInWeeklySpecials || false}
                    onChange={(e) =>
                      handleEditChange("showInWeeklySpecials", e.target.checked)
                    }
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>
                {itemToEdit.showInWeeklySpecials && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      value={
                        itemToEdit.weeklySpecialsOrder !== undefined
                          ? itemToEdit.weeklySpecialsOrder
                          : "0"
                      }
                      onChange={(e) =>
                        handleEditChange("weeklySpecialsOrder", e.target.value)
                      }
                      placeholder="0"
                      className="h-8 px-2 text-xs rounded-lg border-slate-100 bg-white focus-visible:ring-red-600/10 font-bold text-slate-800"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100/50">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setEditDialogOpen(false);
                setImagePreview(null);
              }}
              className="cursor-pointer flex items-center gap-1.5 px-3 sm:px-4"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
            <Button
              type="submit"
              className="cursor-pointer flex items-center gap-1.5 px-3 sm:px-4"
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{loading ? "Saving..." : "Save Changes"}</span>
              <span className="inline sm:hidden">{loading ? "..." : "Save"}</span>
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditProductDialog;
