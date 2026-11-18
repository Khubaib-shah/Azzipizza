import { useEffect, useState, useCallback } from "react";
import { menuService } from "@shared/services";
import { Filter, Loader2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import ProductFormDialog from "../components/ProductFormDialog";
import DeleteProductDialog from "../components/DeleteProductDialog";
import ProductCard from "../components/ProductCard";
import FilterBar from "../components/FilterBar";
import PageHeader from "@shared/components/ui/PageHeader";
import { Button } from "@shared/components/ui/button";
import { useAdminData } from "../context/AdminDataContext";

const ListItems = () => {
  const {
    menuItems: items,
    setMenuItems: setItems,
    menuLoading: loading,
    menuError: error,
    fetchMenuItems,
  } = useAdminData();
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [specialsFilter, setSpecialsFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("edit"); // "edit" or "create"
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

  useEffect(() => {
    fetchMenuItems().catch(() => {
      toast.error("Could not load menu items.");
    });
  }, [fetchMenuItems]);

  useEffect(() => {
    let result = items;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower),
      );
    }

    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter(
        (item) => item.category.toLowerCase() === categoryFilter.toLowerCase(),
      );
    }

    if (specialsFilter && specialsFilter !== "all") {
      if (specialsFilter === "specialOffers") {
        result = result.filter((item) => item.showInSpecialOffers);
      } else if (specialsFilter === "chefsSpecials") {
        result = result.filter((item) => item.showInChefsSpecials);
      } else if (specialsFilter === "weeklySpecials") {
        result = result.filter((item) => item.showInWeeklySpecials);
      }
    }

    setFilteredItems(result);
  }, [searchTerm, categoryFilter, specialsFilter, items]);

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

  const executeCreateSubmit = async () => {
    if (
      !itemToEdit.name ||
      !itemToEdit.price ||
      !itemToEdit.category ||
      !itemToEdit.description
    ) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }
    if (!itemToEdit.image) {
      toast.error("Visual appearance is mandatory. Don't forget the photo!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", itemToEdit.name);
      formData.append("description", itemToEdit.description);
      formData.append("price", itemToEdit.price);
      formData.append("discount", parseFloat(itemToEdit.discount) || 0);
      formData.append("category", itemToEdit.category);
      formData.append("ingredients", JSON.stringify(itemToEdit.ingredients));
      formData.append(
        "showInSpecialOffers",
        itemToEdit.showInSpecialOffers || false,
      );
      formData.append(
        "showInChefsSpecials",
        itemToEdit.showInChefsSpecials || false,
      );
      formData.append(
        "showInWeeklySpecials",
        itemToEdit.showInWeeklySpecials || false,
      );

      if (itemToEdit.image) {
        formData.append("image", itemToEdit.image);
      }

      const response = await menuService.addItem(formData);
      setItems((prev) => [response.data, ...prev]);
      toast.success("Succulento! Item added to the menu.");
      setEditDialogOpen(false);
      setImagePreview(null);
    } catch (err) {
      console.error("[ListItems Create Error]:", err);
      toast.error(err.message || "Failed to create masterpiece.");
    } finally {
      setLoading(false);
    }
  };

  const executeEditSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", itemToEdit.name);
      formData.append("description", itemToEdit.description);
      formData.append("price", itemToEdit.price);
      formData.append("discount", parseFloat(itemToEdit.discount) || 0);
      formData.append("category", itemToEdit.category);
      formData.append("ingredients", JSON.stringify(itemToEdit.ingredients));
      formData.append(
        "showInSpecialOffers",
        itemToEdit.showInSpecialOffers || false,
      );
      formData.append(
        "showInChefsSpecials",
        itemToEdit.showInChefsSpecials || false,
      );
      formData.append(
        "showInWeeklySpecials",
        itemToEdit.showInWeeklySpecials || false,
      );

      if (itemToEdit.image && typeof itemToEdit.image !== "string") {
        formData.append("image", itemToEdit.image);
      }

      const response = await menuService.updateItem(itemToEdit._id, formData);
      setItems((prev) =>
        prev.map((item) =>
          item._id === response.data._id ? response.data : item,
        ),
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (dialogMode === "create") {
      await executeCreateSubmit();
    } else {
      await executeEditSubmit();
    }
  };

  const categories = [
    "pizze rosse",
    "pizze bianche",
    "fritti",
    "dolci",
    "bibite",
    "birre",
  ];

  const handleAddItemClick = () => {
    setDialogMode("create");
    setItemToEdit({
      _id: "",
      name: "",
      description: "",
      price: "",
      discount: "0",
      category: "",
      ingredients: [],
      image: null,
      showInSpecialOffers: false,
      showInChefsSpecials: false,
      showInWeeklySpecials: false,
    });
    setImagePreview(null);
    setNewIngredient("");
    setNewIngredientPrice("");
    setEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="">
        <PageHeader
          title="Menu Master"
          subtitle="Manage your kitchen's masterpieces and promotional deals."
          actions={
            <Button
              onClick={handleAddItemClick}
              className="h-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 px-4 font-bold shadow-lg shadow-red-500/10 transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </Button>
          }
        />

        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          specialsFilter={specialsFilter}
          setSpecialsFilter={setSpecialsFilter}
          categories={categories}
        />

        {loading && items.length === 0 ? (
          <div className="flex justify-center items-center h-80 bg-white/60 rounded-xl border border-slate-200">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
              <p className="text-slate-500 font-medium text-xs">
                Loading items...
              </p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-16 rounded-xl text-center border border-slate-200 shadow-xs">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              No items found
            </h3>
            <p className="text-slate-500 text-xs">
              Try a different search or filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <ProductCard
                key={item._id}
                item={item}
                onEdit={(selectedItem) => {
                  setDialogMode("edit");
                  setItemToEdit(selectedItem);
                  setImagePreview(selectedItem.image);
                  setEditDialogOpen(true);
                }}
                onDelete={(selectedItem) => {
                  setItemToDelete(selectedItem);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteProductDialog
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        itemToDelete={itemToDelete}
        handleDelete={handleDelete}
        loading={loading}
      />

      <ProductFormDialog
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        itemToEdit={itemToEdit}
        handleEditChange={(field, value) =>
          setItemToEdit((prev) => ({ ...prev, [field]: value }))
        }
        handleEditSubmit={handleEditSubmit}
        categories={categories}
        newIngredient={newIngredient}
        setNewIngredient={setNewIngredient}
        newIngredientPrice={newIngredientPrice}
        setNewIngredientPrice={setNewIngredientPrice}
        handleAddIngredient={() => {
          if (newIngredient.trim() !== "" && newIngredientPrice.trim() !== "") {
            setItemToEdit((prev) => ({
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
          }
        }}
        handleRemoveIngredient={(i) =>
          setItemToEdit((prev) => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, idx) => idx !== i),
          }))
        }
        handleFileChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setItemToEdit((prev) => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
          }
        }}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        loading={loading}
        mode={dialogMode}
      />
    </div>
  );
};

export default ListItems;
