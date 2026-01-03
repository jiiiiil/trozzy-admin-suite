import { Link } from "react-router-dom";
import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, X } from "lucide-react";

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <StorefrontLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-3xl text-stone-900 mb-4">Your Cart is Empty</h1>
            <p className="text-stone-500 mb-8">Add some items to get started</p>
            <Link
              to="/shop"
              className="inline-block border border-stone-900 text-stone-900 px-10 py-4 text-sm tracking-widest uppercase hover:bg-stone-900 hover:text-white transition-colors duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <StorefrontLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-stone-900 tracking-wide text-center mb-12">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="border-b border-stone-200 pb-4 mb-6 hidden md:grid grid-cols-12 gap-4 text-stone-400 text-xs tracking-widest uppercase">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="space-y-8">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="grid grid-cols-12 gap-4 items-center pb-8 border-b border-stone-100">
                  {/* Product */}
                  <div className="col-span-12 md:col-span-6 flex gap-4">
                    <div className="w-24 h-32 bg-stone-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg text-stone-900 mb-1">{item.name}</h3>
                      {item.size && <p className="text-stone-500 text-sm">Size: {item.size}</p>}
                      {item.color && <p className="text-stone-500 text-sm">Color: {item.color}</p>}
                      <p className="text-stone-600 text-sm mt-2 md:hidden">${item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-6 md:col-span-2 flex justify-start md:justify-center">
                    <div className="inline-flex items-center border border-stone-200">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, Math.max(0, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-stone-900 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="hidden md:block col-span-2 text-right text-stone-600 text-sm">
                    ${item.price.toFixed(2)}
                  </div>

                  {/* Total */}
                  <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-4">
                    <span className="text-stone-900 text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.productId, item.size, item.color)}
                      className="text-stone-400 hover:text-stone-900 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/shop" className="text-stone-600 text-sm tracking-widest uppercase border-b border-stone-400 pb-1 hover:text-stone-900 hover:border-stone-900 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-stone-50 p-8">
              <h2 className="font-serif text-xl text-stone-900 mb-8">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Shipping</span>
                  <span className="text-stone-900">
                    {shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-stone-400 text-xs">
                    Free shipping on orders over $150
                  </p>
                )}
              </div>

              <div className="border-t border-stone-200 pt-6 mb-8">
                <div className="flex justify-between">
                  <span className="text-stone-900 font-serif text-lg">Total</span>
                  <span className="text-stone-900 font-serif text-lg">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full py-4 bg-stone-900 text-white text-center text-sm tracking-widest uppercase hover:bg-stone-800 transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default CartPage;
