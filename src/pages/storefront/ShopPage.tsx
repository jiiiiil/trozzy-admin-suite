import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getProducts, getCategories, Product } from "@/lib/mockData";
import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";

const ShopPage = () => {
  const products = getProducts().filter(p => p.status === 'active');
  const categories = getCategories().filter(c => c.active);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (selectedCategory !== "all") {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return result;
  }, [products, selectedCategory, sortBy]);

  return (
    <StorefrontLayout>
      {/* Page Header */}
      <section className="py-16 px-6 text-center border-b border-stone-200">
        <h1 className="font-serif text-4xl md:text-5xl font-normal text-stone-900 tracking-wide mb-4">
          Shop
        </h1>
        <p className="text-stone-500 text-sm tracking-wide">
          {filteredProducts.length} products
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-stone-200">
          {/* Categories */}
          <div className="flex flex-wrap gap-6">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`text-sm tracking-widest uppercase transition-colors duration-300 ${
                selectedCategory === "all" 
                  ? "text-stone-900 border-b border-stone-900" 
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`text-sm tracking-widest uppercase transition-colors duration-300 ${
                  selectedCategory === category.name 
                    ? "text-stone-900 border-b border-stone-900" 
                    : "text-stone-400 hover:text-stone-700"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm text-stone-600 bg-transparent border-b border-stone-300 pb-1 focus:outline-none focus:border-stone-900 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const displayPrice = product.saleEnabled 
    ? product.price * (1 - product.saleDiscount / 100) 
    : product.price;

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="aspect-[3/4] bg-stone-100 mb-6 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
      </div>
      <div className="text-center">
        <p className="text-stone-400 text-xs tracking-widest uppercase mb-2">
          {product.category}
        </p>
        <h3 className="font-serif text-lg text-stone-900 mb-3 tracking-wide">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-3">
          {product.saleEnabled && (
            <span className="text-stone-400 text-sm line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
          <span className="text-stone-700 text-sm">
            ${displayPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ShopPage;
