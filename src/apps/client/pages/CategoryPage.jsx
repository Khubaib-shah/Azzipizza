import { useContext, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Context from "@shared/context/dataContext";
import ProductCard from "../components/cards/ProductsCard";
import ProductCardSkeleton from "../components/cards/ProductCardSkeleton";
import SectionHeader from "../components/SectionHeader";
import { RestaurantSchema, MenuSchema } from "../components/SchemaMarkup";

export default function CategoryPage({ defaultCategory, title, description, keywords }) {
  const { categoryId } = useParams();
  const { items, isLoading } = useContext(Context);
  
  const category = defaultCategory || categoryId;

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!category || category === 'menu') return items;
    return items.filter(item => item.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase());
  }, [items, category]);

  const pageTitle = title || (category === 'menu' ? "Menu Completo" : `${category.charAt(0).toUpperCase() + category.slice(1)} - Menu`);
  const pageDescription = description || `Scopri i nostri ${category} preparati con ingredienti freschi. Ordina online da Azzipizza a Bologna.`;
  const pageKeywords = keywords || `${category}, asporto, bologna, cibo, ristorante`;

  useEffect(() => {
    document.title = `${pageTitle} | Azzipizza`;
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };
    updateMeta("description", pageDescription);
    updateMeta("keywords", pageKeywords);
  }, [pageTitle, pageDescription, pageKeywords]);

  return (
    <div className="min-h-screen bg-gray-50 pt-6 sm:pt-12 pb-12 sm:pb-16">
      <RestaurantSchema />
      <MenuSchema items={filteredItems} />
      
      <div className="mx-auto w-full max-w-7xl px-2 sm:px-6">
        <h1 className="!text-2xl sm:!text-4xl font-bold text-center mb-4 sm:mb-8 font-serif !text-gray-900">{pageTitle}</h1>
        {description && <p className="text-center text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-12">{description}</p>}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {isLoading ? (
            [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
          ) : filteredItems.length > 0 ? (
            filteredItems.map(item => <ProductCard key={item._id} product={item} />)
          ) : (
            <p className="col-span-full text-center text-gray-500 py-12">Nessun prodotto trovato per questa categoria.</p>
          )}
        </div>
      </div>
    </div>
  );
}
