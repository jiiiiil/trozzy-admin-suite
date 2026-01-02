import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Save, Plus, X, Upload, Package, Boxes, Tags, Search, Truck, Megaphone, Info, Percent } from 'lucide-react';
import { getProducts, setProducts, Product, generateId, addAuditLog, getCategories, setCategories as saveCategories, Category } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

// Extended interfaces
interface ProductMarketing {
  buyersToday: boolean;
  stockWarning: boolean;
  countdown: boolean;
  buy2get1: boolean;
  flatDiscount: boolean;
  couponCode: boolean;
  promoText: string;
  featured: boolean;
  upsellProducts: string[];
  crossSellProducts: string[];
  promoImage: string;
}

interface ProductAttribute {
  id: string;
  name: string;
  values: string;
}

interface ProductShipping {
  weight: number;
  weightUnit: string;
  length: number;
  width: number;
  height: number;
  shippingClass: string;
  freeShipping: boolean;
  shippingCost: number;
}

interface ProductSEO {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
  indexable: boolean;
}

interface ProductDetails {
  brand: string;
  manufacturer: string;
  warranty: string;
  additionalInfo: string;
}

interface ProductSale {
  enabled: boolean;
  salePrice: number;
  startDate: string;
  endDate: string;
}

interface ExtendedProduct {
  id?: string;
  name: string;
  description: string;
  category: string;
  sellingPrice: number;
  originalPrice: number;
  images: string[];
  sku: string;
  barcode: string;
  quantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  attributes: ProductAttribute[];
  seo: ProductSEO;
  shipping: ProductShipping;
  marketing: ProductMarketing;
  details: ProductDetails;
  sale: ProductSale;
  status: 'active' | 'inactive' | 'draft';
  createdAt?: string;
}

const defaultProduct: ExtendedProduct = {
  name: '',
  description: '',
  category: '',
  sellingPrice: 0,
  originalPrice: 0,
  images: [],
  sku: '',
  barcode: '',
  quantity: 0,
  lowStockThreshold: 5,
  trackInventory: true,
  attributes: [],
  seo: {
    metaTitle: '',
    metaDescription: '',
    slug: '',
    keywords: [],
    indexable: true,
  },
  shipping: {
    weight: 0,
    weightUnit: 'kg',
    length: 0,
    width: 0,
    height: 0,
    shippingClass: 'standard',
    freeShipping: false,
    shippingCost: 0,
  },
  marketing: {
    buyersToday: false,
    stockWarning: false,
    countdown: false,
    buy2get1: false,
    flatDiscount: false,
    couponCode: false,
    promoText: '',
    featured: false,
    upsellProducts: [],
    crossSellProducts: [],
    promoImage: '',
  },
  details: {
    brand: '',
    manufacturer: '',
    warranty: '',
    additionalInfo: '',
  },
  sale: {
    enabled: false,
    salePrice: 0,
    startDate: '',
    endDate: '',
  },
  status: 'draft',
};

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState<ExtendedProduct>(defaultProduct);
  const [categories, setCategoriesState] = useState(getCategories());
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const promoImageRef = useRef<HTMLInputElement>(null);
  const [existingProducts, setExistingProducts] = useState<Product[]>([]);

  useEffect(() => {
    const products = getProducts();
    setExistingProducts(products);
    
    if (isEditing && id) {
      const product = products.find(p => p.id === id);
      if (product) {
        // Map old product structure to new extended structure
        setFormData({
          id: product.id,
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          sellingPrice: product.price || 0,
          originalPrice: (product as any).originalPrice || product.price || 0,
          images: product.image ? [product.image, ...(product.galleryImages || [])] : [],
          sku: product.sku || '',
          barcode: (product as any).barcode || '',
          quantity: product.stock || 0,
          lowStockThreshold: (product as any).lowStockThreshold || 5,
          trackInventory: (product as any).trackInventory !== false,
          attributes: (product as any).attributes || [],
          seo: {
            metaTitle: product.metaTitle || '',
            metaDescription: product.metaDescription || '',
            slug: (product as any).slug || product.name?.toLowerCase().replace(/\s+/g, '-') || '',
            keywords: (product as any).keywords || [],
            indexable: (product as any).indexable !== false,
          },
          shipping: {
            weight: product.weight || 0,
            weightUnit: (product as any).weightUnit || 'kg',
            length: product.dimensions?.length || 0,
            width: product.dimensions?.width || 0,
            height: product.dimensions?.height || 0,
            shippingClass: (product as any).shippingClass || 'standard',
            freeShipping: (product as any).freeShipping || false,
            shippingCost: (product as any).shippingCost || 0,
          },
          marketing: {
            buyersToday: (product as any).marketing?.buyersToday || false,
            stockWarning: (product as any).marketing?.stockWarning || false,
            countdown: (product as any).marketing?.countdown || false,
            buy2get1: (product as any).marketing?.buy2get1 || false,
            flatDiscount: (product as any).marketing?.flatDiscount || false,
            couponCode: (product as any).marketing?.couponCode || false,
            promoText: (product as any).promoText || product.badge || '',
            featured: product.featured || false,
            upsellProducts: (product as any).upsellProducts || [],
            crossSellProducts: (product as any).crossSellProducts || [],
            promoImage: (product as any).promoImage || '',
          },
          details: {
            brand: product.brand || '',
            manufacturer: (product as any).manufacturer || '',
            warranty: product.warranty || '',
            additionalInfo: (product as any).additionalInfo || '',
          },
          sale: {
            enabled: product.saleEnabled || false,
            salePrice: (product as any).salePrice || 0,
            startDate: product.saleStartDate || '',
            endDate: product.saleEndDate || '',
          },
          status: product.status || 'draft',
          createdAt: product.createdAt,
        });
      }
    }
  }, [id, isEditing]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && formData.name) {
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }
      }));
    }
  }, [formData.name, isEditing]);

  const calculateDiscount = () => {
    if (formData.originalPrice > 0 && formData.sellingPrice > 0 && formData.originalPrice > formData.sellingPrice) {
      return Math.round(((formData.originalPrice - formData.sellingPrice) / formData.originalPrice) * 100);
    }
    return 0;
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Product Title is required', variant: 'destructive' });
      return;
    }
    if (formData.sellingPrice <= 0) {
      toast({ title: 'Error', description: 'Selling Price must be greater than 0', variant: 'destructive' });
      return;
    }

    const products = getProducts();
    
    // Map extended product back to storage format
    const productToSave: Product = {
      id: formData.id || generateId(),
      name: formData.name,
      sku: formData.sku || `SKU-${generateId().toUpperCase()}`,
      price: formData.sellingPrice,
      stock: formData.quantity,
      status: formData.status,
      image: formData.images[0] || '',
      galleryImages: formData.images.slice(1),
      category: formData.category,
      description: formData.description,
      featured: formData.marketing.featured,
      sizes: [],
      colors: [],
      variants: [],
      tags: formData.seo.keywords,
      keyFeatures: [],
      warranty: formData.details.warranty,
      warrantyDetails: '',
      saleEnabled: formData.sale.enabled,
      saleDiscount: formData.sale.salePrice > 0 ? Math.round(((formData.sellingPrice - formData.sale.salePrice) / formData.sellingPrice) * 100) : 0,
      saleStartDate: formData.sale.startDate,
      saleEndDate: formData.sale.endDate,
      metaTitle: formData.seo.metaTitle,
      metaDescription: formData.seo.metaDescription,
      weight: formData.shipping.weight,
      dimensions: { length: formData.shipping.length, width: formData.shipping.width, height: formData.shipping.height },
      badge: formData.marketing.promoText || 'none',
      brand: formData.details.brand,
      createdAt: formData.createdAt || new Date().toISOString().split('T')[0],
      // Extended fields
      ...(formData as any),
    };
    
    if (isEditing) {
      const updated = products.map(p => p.id === id ? productToSave : p);
      setProducts(updated);
      addAuditLog({ user: 'Admin User', action: 'Updated product', module: 'Products', timestamp: new Date().toISOString(), details: `Updated: ${formData.name}` });
      toast({ title: 'Success', description: 'Product updated successfully' });
    } else {
      setProducts([productToSave, ...products]);
      addAuditLog({ user: 'Admin User', action: 'Created product', module: 'Products', timestamp: new Date().toISOString(), details: `Created: ${formData.name}` });
      toast({ title: 'Success', description: 'Product created successfully' });
    }

    navigate('/commerce/products');
  };

  const handleCancel = () => {
    setFormData(defaultProduct);
    navigate('/commerce/products');
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: generateId(),
      name: newCategoryName.trim(),
      description: '',
      productCount: 0,
      active: true,
      parentId: null,
      order: categories.length,
    };
    const updated = [...categories, newCat];
    setCategoriesState(updated);
    saveCategories(updated);
    setFormData(prev => ({ ...prev, category: newCat.name }));
    setNewCategoryName('');
    setShowAddCategory(false);
    toast({ title: 'Success', description: 'Category created' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, event.target?.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handlePromoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ 
        ...prev, 
        marketing: { ...prev.marketing, promoImage: event.target?.result as string }
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { id: generateId(), name: '', values: '' }]
    }));
  };

  const updateAttribute = (id: string, field: 'name' | 'values', value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map(attr => attr.id === id ? { ...attr, [field]: value } : attr)
    }));
  };

  const removeAttribute = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter(attr => attr.id !== id)
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, keywords: [...prev.seo.keywords, newKeyword.trim()] }
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, keywords: prev.seo.keywords.filter((_, i) => i !== index) }
    }));
  };

  const getSaleCountdown = () => {
    if (!formData.sale.enabled || !formData.sale.endDate) return null;
    const endDate = new Date(formData.sale.endDate);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    if (diff <= 0) return 'Sale ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h remaining`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/commerce/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-muted-foreground">Fill in the product details below</p>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
      <input ref={promoImageRef} type="file" accept="image/*" onChange={handlePromoImageUpload} className="hidden" />

      {/* Accordion Sections */}
      <Accordion type="multiple" defaultValue={['basic']} className="space-y-4">
        
        {/* 1. Basic Section */}
        <AccordionItem value="basic" className="border rounded-lg bg-card px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Basic</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product Title *</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="Enter product title" 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  placeholder="Product description" 
                  rows={4} 
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="flex gap-2">
                  <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.active && c.name?.trim()).map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setShowAddCategory(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Selling Price *</Label>
                  <Input 
                    type="number" 
                    value={formData.sellingPrice || ''} 
                    onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })} 
                    placeholder="0.00" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price</Label>
                  <Input 
                    type="number" 
                    value={formData.originalPrice || ''} 
                    onChange={e => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })} 
                    placeholder="0.00" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount</Label>
                  <div className="h-10 px-3 flex items-center rounded-md border bg-muted/50 text-muted-foreground">
                    {calculateDiscount()}% off
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <div className="space-y-2">
                <Label>Product Images</Label>
                <div className="flex flex-wrap gap-3">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative w-24 h-24">
                      <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover rounded-lg border" />
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-6 w-6" 
                        onClick={() => removeImage(i)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div 
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Upload multiple images. First image will be the main image.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Inventory Section */}
        <AccordionItem value="inventory" className="border rounded-lg bg-card px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Boxes className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Inventory</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={formData.sku} 
                      onChange={e => setFormData({ ...formData, sku: e.target.value })} 
                      placeholder="PRD-001" 
                    />
                    <Button variant="outline" onClick={() => setFormData({ ...formData, sku: `SKU-${generateId().toUpperCase()}` })}>
                      Auto
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Barcode</Label>
                  <Input 
                    value={formData.barcode} 
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })} 
                    placeholder="Enter barcode" 
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Quantity in Stock</Label>
                  <Input 
                    type="number" 
                    value={formData.quantity || ''} 
                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} 
                    placeholder="0" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Low Stock Threshold</Label>
                  <Input 
                    type="number" 
                    value={formData.lowStockThreshold || ''} 
                    onChange={e => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })} 
                    placeholder="5" 
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                <div>
                  <p className="font-medium">Track Inventory</p>
                  <p className="text-sm text-muted-foreground">Enable inventory tracking for this product</p>
                </div>
                <Switch 
                  checked={formData.trackInventory} 
                  onCheckedChange={checked => setFormData({ ...formData, trackInventory: checked })} 
                />
              </div>

              {formData.quantity > 0 && formData.quantity <= formData.lowStockThreshold && (
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-warning font-medium">Low Stock Warning</p>
                  <p className="text-sm text-muted-foreground">This product has low stock ({formData.quantity} remaining)</p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Attributes Section */}
        <AccordionItem value="attributes" className="border rounded-lg bg-card px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Tags className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Attributes</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Add custom attributes like Size, Color, Material, etc.</p>
              
              {formData.attributes.map(attr => (
                <div key={attr.id} className="flex gap-3 items-start p-4 rounded-lg bg-muted/50">
                  <div className="flex-1 space-y-2">
                    <Label>Attribute Name</Label>
                    <Input 
                      value={attr.name} 
                      onChange={e => updateAttribute(attr.id, 'name', e.target.value)} 
                      placeholder="e.g., Size, Color" 
                    />
                  </div>
                  <div className="flex-[2] space-y-2">
                    <Label>Values (comma-separated)</Label>
                    <Input 
                      value={attr.values} 
                      onChange={e => updateAttribute(attr.id, 'values', e.target.value)} 
                      placeholder="e.g., Small, Medium, Large" 
                    />
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="mt-8 text-destructive hover:text-destructive" 
                    onClick={() => removeAttribute(attr.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" onClick={addAttribute}>
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>

              {formData.attributes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No attributes added yet</p>
                  <p className="text-sm mt-1">Click "Add Attribute" to create custom product attributes</p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. SEO Section */}
        <AccordionItem value="seo" className="border rounded-lg bg-card px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">SEO</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input 
                  value={formData.seo.metaTitle} 
                  onChange={e => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })} 
                  placeholder="SEO optimized title" 
                />
                <p className="text-sm text-muted-foreground">{formData.seo.metaTitle.length}/60 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea 
                  value={formData.seo.metaDescription} 
                  onChange={e => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })} 
                  placeholder="SEO description" 
                  rows={3} 
                />
                <p className="text-sm text-muted-foreground">{formData.seo.metaDescription.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input 
                  value={formData.seo.slug} 
                  onChange={e => setFormData({ ...formData, seo: { ...formData.seo, slug: e.target.value } })} 
                  placeholder="product-url-slug" 
                />
                <p className="text-sm text-muted-foreground">Auto-generated from title. Edit if needed.</p>
              </div>

              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newKeyword} 
                    onChange={e => setNewKeyword(e.target.value)} 
                    placeholder="Add keyword" 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button variant="outline" onClick={addKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.seo.keywords.map((keyword, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(i)}>
                      {keyword} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                <div>
                  <p className="font-medium">Index by Search Engines</p>
                  <p className="text-sm text-muted-foreground">Allow search engines to index this product</p>
                </div>
                <Switch 
                  checked={formData.seo.indexable} 
                  onCheckedChange={checked => setFormData({ ...formData, seo: { ...formData.seo, indexable: checked } })} 
                />
              </div>

              {/* Search Preview */}
              <div className="p-4 rounded-lg border bg-background">
                <p className="text-xs text-muted-foreground mb-2">Search Result Preview</p>
                <p className="text-primary font-medium truncate">{formData.seo.metaTitle || formData.name || 'Product Title'}</p>
                <p className="text-sm text-green-600 truncate">trozzy.com/products/{formData.seo.slug || 'product-slug'}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{formData.seo.metaDescription || formData.description || 'Product description will appear here...'}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Shipping Section */}
        <AccordionItem value="shipping" className="border rounded-lg bg-card px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Shipping</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Weight</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={formData.shipping.weight || ''} 
                      onChange={e => setFormData({ ...formData, shipping: { ...formData.shipping, weight: parseFloat(e.target.value) || 0 } })} 
                      placeholder="0" 
                      className="flex-1"
                    />
                    <Select 
                      value={formData.shipping.weightUnit} 
                      onValueChange={v => setFormData({ ...formData, shipping: { ...formData.shipping, weightUnit: v } })}
                    >
                      <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="lb">lb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Shipping Class</Label>
                  <Select 
                    value={formData.shipping.shippingClass} 
                    onValueChange={v => setFormData({ ...formData, shipping: { ...formData.shipping, shippingClass: v } })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="overnight">Overnight</SelectItem>
                      <SelectItem value="fragile">Fragile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dimensions (L × W × H)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input 
                    type="number" 
                    value={formData.shipping.length || ''} 
                    onChange={e => setFormData({ ...formData, shipping: { ...formData.shipping, length: parseFloat(e.target.value) || 0 } })} 
                    placeholder="Length" 
                  />
                  <Input 
                    type="number" 
                    value={formData.shipping.width || ''} 
                    onChange={e => setFormData({ ...formData, shipping: { ...formData.shipping, width: parseFloat(e.target.value) || 0 } })} 
                    placeholder="Width" 
                  />
                  <Input 
                    type="number" 
                    value={formData.shipping.height || ''} 
                    onChange={e => setFormData({ ...formData, shipping: { ...formData.shipping, height: parseFloat(e.target.value) || 0 } })} 
                    placeholder="Height" 
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">Offer free shipping for this product</p>
                </div>
                <Switch 
                  checked={formData.shipping.freeShipping} 
                  onCheckedChange={checked => setFormData({ ...formData, shipping: { ...formData.shipping, freeShipping: checked } })} 
                />
              </div>

              {!formData.shipping.freeShipping && (
                <div className="space-y-2">
                  <Label>Shipping Cost</Label>
                  <Input 
                    type="number" 
                    value={formData.shipping.shippingCost || ''} 
                    onChange={e => setFormData({ ...formData, shipping: { ...formData.shipping, shippingCost: parseFloat(e.target.value) || 0 } })} 
                    placeholder="0.00" 
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 6. Marketing Section */}
        <AccordionItem value="marketing" className="border rounded-lg bg-card px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Marketing</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="space-y-6">
              {/* Promo Text/Badge */}
              <div className="space-y-2">
                <Label>Promo Text / Badge</Label>
                <Input 
                  value={formData.marketing.promoText} 
                  onChange={e => setFormData({ ...formData, marketing: { ...formData.marketing, promoText: e.target.value } })} 
                  placeholder="e.g., New Arrival, Best Seller" 
                />
              </div>

              {/* Featured Toggle */}
              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                <div>
                  <p className="font-medium">Featured Product</p>
                  <p className="text-sm text-muted-foreground">Show in featured sections</p>
                </div>
                <Switch 
                  checked={formData.marketing.featured} 
                  onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, featured: checked } })} 
                />
              </div>

              {/* Urgency Indicators */}
              <div className="space-y-3">
                <h4 className="font-medium">Urgency Indicators</h4>
                
                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show "Buyers Today" Count</p>
                    <p className="text-sm text-muted-foreground">Display social proof indicator</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.buyersToday} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, buyersToday: checked } })} 
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show "Stock Left" Warning</p>
                    <p className="text-sm text-muted-foreground">Display low stock urgency</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.stockWarning} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, stockWarning: checked } })} 
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Daily Sale Countdown</p>
                    <p className="text-sm text-muted-foreground">Display countdown timer</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.countdown} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, countdown: checked } })} 
                  />
                </div>
              </div>

              {/* Special Offers */}
              <div className="space-y-3">
                <h4 className="font-medium">Special Offers</h4>
                
                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Buy 2 Get 1 Free Offer</p>
                    <p className="text-sm text-muted-foreground">Display promotional badge</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.buy2get1} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, buy2get1: checked } })} 
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Flat Discount</p>
                    <p className="text-sm text-muted-foreground">Display flat discount amount</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.flatDiscount} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, flatDiscount: checked } })} 
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Coupon Code</p>
                    <p className="text-sm text-muted-foreground">Display discount coupon</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.couponCode} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, couponCode: checked } })} 
                  />
                </div>
              </div>

              {/* Upsell & Cross-sell */}
              <div className="space-y-2">
                <Label>Upsell Products</Label>
                <Select onValueChange={v => {
                  if (v && !formData.marketing.upsellProducts.includes(v)) {
                    setFormData({ ...formData, marketing: { ...formData.marketing, upsellProducts: [...formData.marketing.upsellProducts, v] } });
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="Select products to upsell" /></SelectTrigger>
                  <SelectContent>
                    {existingProducts.filter(p => p.id !== id && !formData.marketing.upsellProducts.includes(p.id)).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.marketing.upsellProducts.map(pid => {
                    const product = existingProducts.find(p => p.id === pid);
                    return product ? (
                      <Badge key={pid} variant="secondary" className="cursor-pointer" onClick={() => {
                        setFormData({ ...formData, marketing: { ...formData.marketing, upsellProducts: formData.marketing.upsellProducts.filter(id => id !== pid) } });
                      }}>
                        {product.name} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Promo Image */}
              <div className="space-y-2">
                <Label>Promo Image</Label>
                <div className="flex items-center gap-4">
                  {formData.marketing.promoImage && (
                    <div className="relative w-24 h-24">
                      <img src={formData.marketing.promoImage} alt="Promo" className="w-full h-full object-cover rounded-lg border" />
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-6 w-6" 
                        onClick={() => setFormData({ ...formData, marketing: { ...formData.marketing, promoImage: '' } })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => promoImageRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Promo Image
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 7. Details Section */}
        <AccordionItem value="details" className="border rounded-lg bg-card px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Details</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input 
                    value={formData.details.brand} 
                    onChange={e => setFormData({ ...formData, details: { ...formData.details, brand: e.target.value } })} 
                    placeholder="Brand name" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Manufacturer</Label>
                  <Input 
                    value={formData.details.manufacturer} 
                    onChange={e => setFormData({ ...formData, details: { ...formData.details, manufacturer: e.target.value } })} 
                    placeholder="Manufacturer name" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Warranty</Label>
                <Input 
                  value={formData.details.warranty} 
                  onChange={e => setFormData({ ...formData, details: { ...formData.details, warranty: e.target.value } })} 
                  placeholder="e.g., 1 Year Manufacturer Warranty" 
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Information</Label>
                <div className="flex gap-2 mb-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFormData({ ...formData, details: { ...formData.details, additionalInfo: formData.details.additionalInfo + '**bold**' } })}
                  >
                    <strong>B</strong>
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFormData({ ...formData, details: { ...formData.details, additionalInfo: formData.details.additionalInfo + '_italic_' } })}
                  >
                    <em>I</em>
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFormData({ ...formData, details: { ...formData.details, additionalInfo: formData.details.additionalInfo + '\n• ' } })}
                  >
                    • List
                  </Button>
                </div>
                <Textarea 
                  value={formData.details.additionalInfo} 
                  onChange={e => setFormData({ ...formData, details: { ...formData.details, additionalInfo: e.target.value } })} 
                  placeholder="Additional product information..." 
                  rows={5} 
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 8. Sale Section */}
        <AccordionItem value="sale" className="border rounded-lg bg-card px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <Percent className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Sale</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Sale</p>
                  <p className="text-sm text-muted-foreground">Create a time-limited sale for this product</p>
                </div>
                <Switch 
                  checked={formData.sale.enabled} 
                  onCheckedChange={checked => setFormData({ ...formData, sale: { ...formData.sale, enabled: checked } })} 
                />
              </div>

              {formData.sale.enabled && (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Sale Price</Label>
                    <Input 
                      type="number" 
                      value={formData.sale.salePrice || ''} 
                      onChange={e => setFormData({ ...formData, sale: { ...formData.sale, salePrice: parseFloat(e.target.value) || 0 } })} 
                      placeholder="0.00" 
                    />
                    {formData.sale.salePrice > 0 && formData.sellingPrice > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Discount: {Math.round(((formData.sellingPrice - formData.sale.salePrice) / formData.sellingPrice) * 100)}% off
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input 
                        type="date" 
                        value={formData.sale.startDate} 
                        onChange={e => setFormData({ ...formData, sale: { ...formData.sale, startDate: e.target.value } })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input 
                        type="date" 
                        value={formData.sale.endDate} 
                        onChange={e => setFormData({ ...formData, sale: { ...formData.sale, endDate: e.target.value } })} 
                      />
                    </div>
                  </div>

                  {/* Sale Countdown Preview */}
                  {formData.sale.endDate && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="font-medium text-primary">Sale Countdown Preview</p>
                      <p className="text-2xl font-bold mt-2">{getSaleCountdown()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Category Name</Label>
            <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Enter category name" className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCategory(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-end gap-4 z-50">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground">
          <Save className="mr-2 h-4 w-4" />
          {isEditing ? 'Update Product' : 'Save Product'}
        </Button>
      </div>
    </div>
  );
};

export default ProductFormPage;
