import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProducts, Product } from "@/lib/mockData";
import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";

const ProductPage = () => {
  const { id } = useParams();
  const products = getProducts();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <StorefrontLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-2xl text-stone-900 mb-4">Product Not Found</h1>
            <Link to="/shop" className="text-stone-500 text-sm tracking-widest uppercase border-b border-stone-400 pb-1 hover:text-stone-900">
              Return to Shop
            </Link>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  const displayPrice = product.saleEnabled 
    ? product.price * (1 - product.saleDiscount / 100) 
    : product.price;

  const allImages = [product.image, ...(product.galleryImages || [])].filter(Boolean);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: product.image,
    });
    
    toast.success("Added to cart");
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id && p.status === 'active')
    .slice(0, 4);

  return (
    <StorefrontLayout>
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-sm text-stone-400">
          <Link to="/" className="hover:text-stone-700 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-stone-700 transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-stone-600">{product.name}</span>
        </div>
      </nav>

      {/* Product Detail */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-stone-100 overflow-hidden">
              <img
                src={allImages[activeImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square bg-stone-100 overflow-hidden border-2 transition-colors ${
                      activeImage === idx ? 'border-stone-900' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:pt-8">
            <p className="text-stone-400 text-xs tracking-widest uppercase mb-4">
              {product.category}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-stone-900 tracking-wide mb-6">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-8">
              {product.saleEnabled && (
                <span className="text-stone-400 text-lg line-through">
                  ${product.price.toFixed(2)}
                </span>
              )}
              <span className="text-stone-900 text-xl">
                ${displayPrice.toFixed(2)}
              </span>
            </div>

            <p className="text-stone-600 leading-relaxed mb-10">
              {product.description}
            </p>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <p className="text-stone-900 text-sm tracking-widest uppercase mb-4">Size</p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-12 px-4 border text-sm tracking-wide transition-colors ${
                        selectedSize === size
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-300 text-stone-700 hover:border-stone-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <p className="text-stone-900 text-sm tracking-widest uppercase mb-4">Color</p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 h-10 border text-sm tracking-wide transition-colors ${
                        selectedColor === color
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-300 text-stone-700 hover:border-stone-900'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-10">
              <p className="text-stone-900 text-sm tracking-widest uppercase mb-4">Quantity</p>
              <div className="inline-flex items-center border border-stone-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 text-sm tracking-widest uppercase transition-colors duration-300 ${
                product.stock === 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {/* Product Details Accordion */}
            <div className="mt-12 border-t border-stone-200">
              <ProductDetailSection title="Product Details">
                <ul className="space-y-2 text-stone-600 text-sm">
                  {product.keyFeatures?.map((feature, idx) => (
                    <li key={idx}>• {feature}</li>
                  ))}
                  {product.brand && <li>• Brand: {product.brand}</li>}
                  {product.sku && <li>• SKU: {product.sku}</li>}
                </ul>
              </ProductDetailSection>

              <ProductDetailSection title="Craft & Quality">
                <p className="text-stone-600 text-sm leading-relaxed">
                  Each piece is thoughtfully designed and crafted with attention to detail. 
                  We source only the finest materials to ensure lasting quality.
                </p>
              </ProductDetailSection>

              {product.warranty && (
                <ProductDetailSection title="Warranty">
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {product.warranty}{product.warrantyDetails ? ` - ${product.warrantyDetails}` : ''}
                  </p>
                </ProductDetailSection>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-stone-200 py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-normal text-stone-900 tracking-wide text-center mb-12">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="group block">
                  <div className="aspect-[3/4] bg-stone-100 mb-4 overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                  <h3 className="font-serif text-lg text-stone-900 text-center mb-2">{p.name}</h3>
                  <p className="text-stone-600 text-sm text-center">${p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </StorefrontLayout>
  );
};

const ProductDetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-stone-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="text-stone-900 text-sm tracking-widest uppercase">{title}</span>
        <span className="text-stone-400 text-xl">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="pb-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
