import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StorefrontLayout } from "@/components/storefront/StorefrontLayout";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isLogin) {
      // Mock login - check localStorage
      const customers = JSON.parse(localStorage.getItem('trozzy_customers') || '[]');
      const customer = customers.find((c: any) => c.email === formData.email);
      
      if (customer && customer.password === formData.password) {
        localStorage.setItem('trozzy_customer', JSON.stringify(customer));
        toast.success("Welcome back");
        navigate('/account');
      } else {
        // For demo, create account on first login attempt
        const newCustomer = {
          id: `CUST-${Date.now()}`,
          email: formData.email,
          password: formData.password,
          firstName: "Guest",
          lastName: "User",
        };
        customers.push(newCustomer);
        localStorage.setItem('trozzy_customers', JSON.stringify(customers));
        localStorage.setItem('trozzy_customer', JSON.stringify(newCustomer));
        toast.success("Account created and logged in");
        navigate('/account');
      }
    } else {
      // Register
      if (!formData.firstName || !formData.lastName) {
        toast.error("Please fill in all required fields");
        return;
      }

      const customers = JSON.parse(localStorage.getItem('trozzy_customers') || '[]');
      const exists = customers.find((c: any) => c.email === formData.email);
      
      if (exists) {
        toast.error("An account with this email already exists");
        return;
      }

      const newCustomer = {
        id: `CUST-${Date.now()}`,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      customers.push(newCustomer);
      localStorage.setItem('trozzy_customers', JSON.stringify(customers));
      localStorage.setItem('trozzy_customer', JSON.stringify(newCustomer));
      toast.success("Account created successfully");
      navigate('/account');
    }
  };

  return (
    <StorefrontLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-stone-900 tracking-wide text-center mb-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="text-stone-500 text-center mb-10">
            {isLogin ? 'Welcome back' : 'Join us today'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-500 text-xs tracking-widest uppercase mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label className="block text-stone-500 text-xs tracking-widest uppercase mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-stone-500 text-xs tracking-widest uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                required
              />
            </div>

            <div>
              <label className="block text-stone-500 text-xs tracking-widest uppercase mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:border-stone-900"
                required
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-stone-500 text-sm hover:text-stone-900 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-stone-900 text-white text-sm tracking-widest uppercase hover:bg-stone-800 transition-colors"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-8">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-stone-600 text-sm tracking-wide hover:text-stone-900 transition-colors"
            >
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default LoginPage;
