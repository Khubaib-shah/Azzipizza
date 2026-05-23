import { useState, useRef, useContext, useMemo, useEffect, Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
  Portal,
} from "@headlessui/react";
import { motion } from "framer-motion";
import ProductCard from "../components/cards/ProductsCard";
import Context from "@shared/context/dataContext";
import ProductsListSkeleton from "../components/ProductsListSkeleton";
import SectionHeader from "../components/SectionHeader";
import {
  FaSearch,
  FaFilter,
  FaTh,
  FaList,
  FaCheck,
  FaBars,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";

function Menu() {
  const { items, isLoading } = useContext(Context);
  const categoryRefs = useRef({});
  const intersectingSectionsRef = useRef(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const categoriesContainerRef = useRef(null);
  const filterBlockRef = useRef(null);
  const stickySentinelRef = useRef(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const sortOptions = [
    { id: "discount", label: "Best Offers" },
    { id: "default", label: "Sort By: Default" },
    { id: "price-low", label: "Price: Low to High" },
    { id: "price-high", label: "Price: High to Low" },
    { id: "name", label: "Name: A-Z" },
  ];

  const currentSortLabel =
    sortOptions.find((o) => o.id === sortBy)?.label || "Sort By: Default";

  const menuItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const uniqueCategories = [...new Set(items.map((item) => item.category))];
    const order = ["pizze bianche", "pizze rosse", "fritti", "bibite"];
    
    return uniqueCategories.sort((a, b) => {
      const indexA = order.indexOf(a.toLowerCase());
      const indexB = order.indexOf(b.toLowerCase());
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (!items) return [];

    let filtered = items;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [items, searchQuery]);

  // Sort items
  const sortedItems = useMemo(() => {
    let sorted = [...filteredItems];

    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "discount":
        sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      default:
        break;
    }

    return sorted;
  }, [filteredItems, sortBy]);

  // Separate offers
  const offerItems = useMemo(() => {
    if (!items) return [];
    return [...items]
      .filter((item) => item.showInWeeklySpecials)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  }, [items]);

  // Group by category (Optimized single-pass grouping)
  const listing = useMemo(() => {
    const result = {};
    sortedItems.forEach((item) => {
      if (!result[item.category]) {
        result[item.category] = [];
      }
      result[item.category].push(item);
    });
    return result;
  }, [sortedItems]);

  const visibleCategories = useMemo(() => {
    const active = Object.keys(listing);
    return active.sort((a, b) => {
      const indexA = menuItems.indexOf(a);
      const indexB = menuItems.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      return 0;
    });
  }, [listing, menuItems]);

  useEffect(() => {
    const sentinel = stickySentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsFilterSticky(!entry.isIntersecting),
      { root: null, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (searchQuery || visibleCategories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        entries.forEach((entry) => {
          const category = entry.target.dataset.category;
          if (entry.isIntersecting) {
            intersectingSectionsRef.current.set(category, entry.intersectionRect.height);
            changed = true;
          } else {
            intersectingSectionsRef.current.delete(category);
            changed = true;
          }
        });

        if (changed) {
          let maxCategory = null;
          let maxHeight = -1;
          
          intersectingSectionsRef.current.forEach((height, category) => {
             if (height > maxHeight) {
                maxHeight = height;
                maxCategory = category;
             }
          });
          
          if (maxCategory) {
             setActiveCategory((prev) => (prev !== maxCategory ? maxCategory : prev));
          }
        }
      },
      {
        root: null,
        rootMargin: "-25% 0px -25% 0px",
        threshold: Array.from({ length: 21 }, (_, i) => i * 0.05),
      },
    );

    visibleCategories.forEach((category) => {
      const section = categoryRefs.current[category];
      if (section) observer.observe(section);
    });

    return () => {
      observer.disconnect();
      intersectingSectionsRef.current.clear();
    };
  }, [searchQuery, visibleCategories]);

  useEffect(() => {
    if (activeCategory && categoriesContainerRef.current) {
      const activeTab = document.getElementById(`category-tab-${activeCategory}`);
      if (activeTab) {
        const container = categoriesContainerRef.current;
        const scrollLeft =
          activeTab.getBoundingClientRect().left -
          container.getBoundingClientRect().left +
          container.scrollLeft -
          12;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [activeCategory]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    const offset = 96;

    if (category === "all") {
      const topPos =
        (filterBlockRef.current?.getBoundingClientRect().top || 0) +
        window.scrollY -
        offset;
      window.scrollTo({ top: topPos, behavior: "smooth" });
      return;
    }

    const el = categoryRefs.current[category];
    if (el) {
      const topPos = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: topPos, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white!">
            Our Menu
          </h1>
          <p className="text-xl text-amber-200">
            Explore our delicious selection of authentic Italian pizzas
          </p>
        </div>
      </div>

      <div className="sm:container mx-auto sm:px-4 md:pt-8 pb-12" id="menu">
        {isLoading ? (
          <ProductsListSkeleton />
        ) : items.length > 0 ? (
          <>
            {/* Special Offers Section */}
            {offerItems.length > 0 && (
              <section className="mb-12 px-2">
                <SectionHeader
                  title="Weekly Specials"
                  subtitle="Limited time offers – grab them before they're gone!"
                />

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6">
                  {offerItems.slice(0, 8).map((item) => (
                    <ProductCard key={item._id} product={item} />
                  ))}
                  </div>
              </section>
            )}

            {/* Search and Filters */}
            <div ref={stickySentinelRef} className="h-0 w-full" />
            <section className="sticky top-[48px] md:top-[78px] z-40">
              <div
                ref={filterBlockRef}
                className={`backdrop-blur-md pointer-events-auto w-full max-w-full transition-all duration-300 `}
              >
                <div className="px-2 sm:px-6 py-2 sm:py-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4">
                    {/* Search Bar */}
                    <div className="md:col-span-5 relative group">
                      <FaSearch
                        size={20}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500 group-focus-within:text-red-600 transition-colors z-10"
                      />
                      <input
                        type="text"
                        placeholder="Search for your favorite pizza..."
                        className="pl-10 sm:pl-12  pr-4 py-2 sm:py-3.5 w-full border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all bg-gray-50/50 hover:bg-white hover:border-red-200 md:font-semibold text-gray-700 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="md:col-span-3 relative">
                      <Listbox value={sortBy} onChange={setSortBy}>
                        <div className="relative group">
                          <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500 group-focus-within:text-red-600 transition-colors z-10" />
                          <ListboxButton className="relative pl-10 sm:pl-12 pr-10 py-2 sm:py-3.5 w-full border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all bg-gray-50/50 hover:bg-white hover:border-red-200 md:font-semibold text-gray-700 shadow-sm text-left truncate">
                            {currentSortLabel}
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors z-10">
                              <FaChevronDown size={14} />
                            </span>
                          </ListboxButton>

                          <Portal>
                            <Transition as={Fragment}>
                              <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                                <Transition.Child
                                  as={Fragment}
                                  enter="transition-opacity duration-300"
                                  enterFrom="opacity-0"
                                  enterTo="opacity-100"
                                  leave="transition-opacity duration-200"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                                </Transition.Child>

                                <Transition.Child
                                  as={Fragment}
                                  enter="transition ease-out duration-300 transform"
                                  enterFrom="translate-y-full sm:translate-y-4 sm:scale-95 opacity-0"
                                  enterTo="translate-y-0 sm:scale-100 opacity-100"
                                  leave="transition ease-in duration-200 transform"
                                  leaveFrom="translate-y-0 sm:scale-100 opacity-100"
                                  leaveTo="translate-y-full sm:translate-y-4 sm:scale-95 opacity-0"
                                >
                                  <ListboxOptions className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative z-10 focus:outline-none flex flex-col max-h-[85vh]">
                                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                                      <h3 className="font-bold text-lg text-gray-900 text-center">Sort Menu By</h3>
                                    </div>
                                    <div className="p-4 flex flex-col gap-2 overflow-y-auto pb-8">
                                      {sortOptions.map((option) => (
                                        <ListboxOption
                                          key={option.id}
                                          value={option.id}
                                          className={({ active }) =>
                                            `relative cursor-pointer select-none py-3 pl-10 pr-4 rounded-xl font-medium transition-colors ${
                                              active
                                                ? "bg-red-50 text-red-600 border border-red-100"
                                                : "text-gray-700 bg-white border border-gray-100 hover:bg-gray-50 hover:border-gray-300"
                                            }`
                                          }
                                        >
                                          {({ selected }) => (
                                            <>
                                              <span className={`block truncate ${selected ? "font-bold text-red-600" : ""}`}>
                                                {option.label}
                                              </span>
                                              {selected && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-red-600">
                                                  <FaCheck size={14} aria-hidden="true" />
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </ListboxOption>
                                      ))}
                                    </div>
                                  </ListboxOptions>
                                </Transition.Child>
                              </div>
                            </Transition>
                          </Portal>
                        </div>
                      </Listbox>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="col-span-1 md:col-span-4 gap-2 hidden md:flex">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`flex-1 py-3.5 px-4 rounded-2xl font-semibold transition-all ${
                          viewMode === "grid"
                            ? "bg-red-600 text-white shadow-md shadow-red-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <FaTh className="inline mr-2" />
                        Grid
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`flex-1 py-3.5 px-4 rounded-2xl font-semibold transition-all ${
                          viewMode === "list"
                            ? "bg-red-600 text-white shadow-md shadow-red-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <FaList className="inline mr-2" />
                        List
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-4 flex items-center gap-2">
                    <style>{`
                      .no-scrollbar::-webkit-scrollbar { display: none; }
                      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                    <div 
                      ref={categoriesContainerRef}
                      className="flex-1 overflow-x-auto no-scrollbar scroll-smooth"
                    >
                      <div className="flex gap-3 whitespace-nowrap p-1">
                      
                        {menuItems?.map((item) => (
                          <button
                            key={item}
                            id={`category-tab-${item}`}
                            className={`relative px-3 sm:px-5 py-2 text-xs sm:text-sm rounded-full uppercase whitespace-nowrap transition-colors outline-none ${
                              activeCategory === item
                                ? "text-white border border-transparent"
                                : "bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:text-red-600"
                            }`}
                            style={{ WebkitTapHighlightColor: "transparent" }}
                            onClick={() => handleCategoryClick(item)}
                          >
                            {activeCategory === item && (
                              <motion.div
                                layoutId="menu-active-pill"
                                className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-lg -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative z-10">{item}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="p-2.5 sm:p-3 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm shrink-0 hover:text-red-600 hover:border-red-300 transition-colors"
                      aria-label="View all categories"
                    >
                      <FaBars size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Products Display */}
            {searchQuery ? (
              // Search/Filter Results
              <div className="mt-6">
                <div className="flex items-center justify-between mb-6 px-2">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {searchQuery
                      ? `Search Results for "${searchQuery}"`
                      : `${activeCategory}`}
                  </h2>
                  <p className="text-gray-600">
                    {sortedItems.length}{" "}
                    {sortedItems.length === 1 ? "item" : "items"} found
                  </p>
                </div>
                {sortedItems.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6"
                        : "space-y-4"
                    }
                  >
                    {sortedItems.map((item) => (
                      <ProductCard key={item._id} product={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-500">
                      No items found. Try adjusting your search or filters.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Category View
              visibleCategories.map((category) => (
                <div
                  key={category}
                  ref={(el) => (categoryRefs.current[category] = el)}
                  data-category={category}
                  className="mt-10 mb-8"
                >
                  <SectionHeader
                    title={category}
                    subtitle={
                      {
                        "pizze rosse": "Classic tomato-based pizzas with rich, authentic flavors",
                        "pizze bianche": "Delicate white pizzas without tomato sauce",
                        "dolci": "Sweet Italian desserts to end your meal perfectly",
                        "bibite": "Refreshing drinks to complement your pizza",
                        "birre": "Craft and classic beers to pair with your meal",
                        "fritti": "Crispy golden fried bites, perfect for sharing",
                        
                      }[category] || "Handcrafted with love and authentic Italian ingredients"
                    }
                  />
                  {listing[category]?.length > 0 && (
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 px-2"
                          : "space-y-4"
                      }
                    >
                      {listing[category].map((item) => (
                        <ProductCard key={item._id} product={item} />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h1 className="font-mono text-gray-500 tracking-tight text-xl">
              No items available. Please check back later.
            </h1>
          </div>
        )}
      </div>
      {/* Categories Bottom Sheet / Modal */}
      <Transition show={isCategoryModalOpen} as={Fragment}>
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-300 transform"
            enterFrom="translate-y-full sm:translate-y-4 sm:scale-95 opacity-0"
            enterTo="translate-y-0 sm:scale-100 opacity-100"
            leave="transition ease-in duration-200 transform"
            leaveFrom="translate-y-0 sm:scale-100 opacity-100"
            leaveTo="translate-y-full sm:translate-y-4 sm:scale-95 opacity-0"
          >
            <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <h3 className="font-bold text-lg text-gray-900">Menu Categories</h3>
                <button 
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              <div className="overflow-y-auto p-4 flex flex-col gap-2 pb-8">
                {menuItems?.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      handleCategoryClick(tab);
                      setIsCategoryModalOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                      activeCategory === tab
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-white text-gray-700 border border-gray-100 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>
    </div>
  );
}

export default Menu;
