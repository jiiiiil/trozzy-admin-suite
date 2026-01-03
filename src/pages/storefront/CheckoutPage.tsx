import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    country: "United States",
    state: "",
    zipCode: "",
    phone: "",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address || !formData.city) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Mock order creation
    const order = {
      id: `ORD-${Date.now()}`,
      items: cart,
      total,
      shipping: formData,
      date: new Date().toISOString(),
    };

    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('trozzy_customer_orders') || '[]');
    orders.push(order);
    localStorage.setItem('trozzy_customer_orders', JSON.stringify(orders));

    clearCart();
    toast.success("Order placed successfully");
    navigate('/account/orders');
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <StorefrontLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl md:text-4xl font-normal text-stone-900 tracking-wide text-center mb-12">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="space-y-10">
              {/* Contact */}
              <section>
                <h2 className="font-serif text-xl text-stone-900 mb-6">Contact</h2>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                  required
                />
              </section>

              {/* Shipping */}
              <section>
                <h2 className="font-serif text-xl text-stone-900 mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                      required
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                    required
                  />
                  <input
                    type="text"
                    name="apartment"
                    placeholder="Apartment, suite, etc. (optional)"
                    value={formData.apartment}
                    onChange={handleChange}
                    className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className="border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                      required
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      className="border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 bg-white"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                    </select>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="ZIP code"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone (optional)"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                  />
                </div>
              </section>

              {/* Payment */}
              <section>
                <h2 className="font-serif text-xl text-stone-900 mb-6">Payment</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card number"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                  />
                  <input
                    type="text"
                    name="cardName"
                    placeholder="Name on card"
                    value={formData.cardName}
                    onChange={handleChange}
                    className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM / YY"
                      value={formData.expiry}
                      onChange={handleChange}
                      className="border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                    />
                    <input
                      type="text"
                      name="cvv"
                      placeholder="CVV"
                      value={formData.cvv}
                      onChange={handleChange}
                      className="border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-stone-50 p-8 sticky top-8">
                <h2 className="font-serif text-xl text-stone-900 mb-8">Order Summary</h2>
                
                <div className="space-y-6 mb-8">
                  {cart.map((item) => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4">
                      <div className="w-16 h-20 bg-stone-200 flex-shrink-0 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-stone-500 text-white text-xs flex items-center justify-center rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-stone-900 text-sm">{item.name}</h4>
                        {item.size && <p className="text-stone-500 text-xs">Size: {item.size}</p>}
                        {item.color && <p className="text-stone-500 text-xs">Color: {item.color}</p>}
                      </div>
                      <div className="text-stone-900 text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-6 space-y-4 mb-8">
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
                </div>

                <div className="border-t border-stone-200 pt-6 mb-8">
                  <div className="flex justify-between">
                    <span className="text-stone-900 font-serif text-lg">Total</span>
                    <span className="text-stone-900 font-serif text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-stone-900 text-white text-sm tracking-widest uppercase hover:bg-stone-800 transition-colors"
                >
                  Place Order
                </button>

                <p className="text-stone-400 text-xs text-center mt-6">
                  Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </StorefrontLayout>
  );
};

export default CheckoutPage;
