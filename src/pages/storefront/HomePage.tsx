import { Link } from "react-router-dom";
import { getProducts, Product } from "@/lib/mockData";
import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";

const HomePage = () => {
  const products = getProducts();
  const featuredProducts = products.filter(p => p.featured && p.status === 'active').slice(0, 4);
  const newArrivals = products.filter(p => p.status === 'active').slice(0, 4);

  return (
    <StorefrontLayout>
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center bg-stone-100">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-50/50 to-stone-100/80" />
        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal tracking-wide text-stone-900 mb-6">
            Timeless Elegance
          </h1>
          <p className="text-stone-600 text-lg md:text-xl font-light tracking-wide mb-10">
            Curated essentials for the discerning individual
          </p>
          <Link
            to="/shop"
            className="inline-block border border-stone-900 text-stone-900 px-10 py-4 text-sm tracking-widest uppercase hover:bg-stone-900 hover:text-white transition-colors duration-300"
          >
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-stone-900 tracking-wide mb-4">
            Featured
          </h2>
          <div className="w-12 h-px bg-stone-300 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="bg-stone-50 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-stone-500 text-sm tracking-widest uppercase mb-6">Our Philosophy</p>
          <h3 className="font-serif text-2xl md:text-3xl font-normal text-stone-800 leading-relaxed mb-8">
            Quality over quantity. Timeless over trendy. 
            We believe in pieces that endure.
          </h3>
          <Link
            to="/about"
            className="text-stone-600 text-sm tracking-widest uppercase border-b border-stone-400 pb-1 hover:text-stone-900 hover:border-stone-900 transition-colors duration-300"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-stone-900 tracking-wide mb-4">
            New Arrivals
          </h2>
          <div className="w-12 h-px bg-stone-300 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-block border border-stone-900 text-stone-900 px-10 py-4 text-sm tracking-widest uppercase hover:bg-stone-900 hover:text-white transition-colors duration-300"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-t border-stone-200 py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <p className="text-stone-900 font-serif text-lg mb-2">Complimentary Shipping</p>
            <p className="text-stone-500 text-sm">On orders over $150</p>
          </div>
          <div>
            <p className="text-stone-900 font-serif text-lg mb-2">Quality Guarantee</p>
            <p className="text-stone-500 text-sm">Crafted to last</p>
          </div>
          <div>
            <p className="text-stone-900 font-serif text-lg mb-2">Easy Returns</p>
            <p className="text-stone-500 text-sm">30-day return policy</p>
          </div>
        </div>
      </section>
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
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>
      <div className="text-center">
        <h3 className="font-serif text-lg text-stone-900 mb-2 tracking-wide">
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

export default HomePage;
