import { useState, useEffect, useRef, DragEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Plus, X, Upload, Download, Eye, GripVertical, Sparkles, Link as LinkIcon, Package } from 'lucide-react';
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
  warrantyDetails: string;
  additionalInfo: string;
  highlights: string[];
  codEnabled: boolean;
  freeDelivery: boolean;
  estimatedDeliveryDays: number;
  returnPolicy: string;
  faqs: { question: string; answer: string }[];
}

interface ProductSale {
  enabled: boolean;
  salePrice: number;
  startDate: string;
  endDate: string;
}

interface ProductInventory {
  sku: string;
  barcode: string;
  quantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  packOptions: { quantity: number; price: number; label: string }[];
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
}

interface ExtendedProduct {
  id?: string;
  name: string;
  description: string;
  category: string;
  sellingPrice: number;
  originalPrice: number;
  images: string[];
  galleryImages: string[];
  inventory: ProductInventory;
  attributes: ProductAttribute[];
  sizes: string[];
  colors: string[];
  variants: ProductVariant[];
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
  galleryImages: [],
  inventory: {
    sku: '',
    barcode: '',
    quantity: 0,
    lowStockThreshold: 10,
    trackInventory: true,
    packOptions: [],
  },
  attributes: [],
  sizes: [],
  colors: [],
  variants: [],
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
    warrantyDetails: '',
    additionalInfo: '',
    highlights: [],
    codEnabled: true,
    freeDelivery: false,
    estimatedDeliveryDays: 5,
    returnPolicy: '',
    faqs: [],
  },
  sale: {
    enabled: false,
    salePrice: 0,
    startDate: '',
    endDate: '',
  },
  status: 'draft',
};

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState<ExtendedProduct>(defaultProduct);
  const [categories, setCategoriesState] = useState(getCategories());
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [newHighlight, setNewHighlight] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [newPackOption, setNewPackOption] = useState({ quantity: 1, price: 0, label: '' });
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const promoImageRef = useRef<HTMLInputElement>(null);
  const bulkImportRef = useRef<HTMLInputElement>(null);
  const [existingProducts, setExistingProducts] = useState<Product[]>([]);

  useEffect(() => {
    const products = getProducts();
    setExistingProducts(products);
    
    if (isEditing && id) {
      const product = products.find(p => p.id === id);
      if (product) {
        setFormData({
          id: product.id,
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          sellingPrice: product.price || 0,
          originalPrice: (product as any).originalPrice || product.price || 0,
          images: product.image ? [product.image] : [],
          galleryImages: product.galleryImages || [],
          inventory: {
            sku: product.sku || '',
            barcode: (product as any).barcode || '',
            quantity: product.stock || 0,
            lowStockThreshold: (product as any).lowStockThreshold || 10,
            trackInventory: (product as any).trackInventory !== false,
            packOptions: (product as any).packOptions || [],
          },
          attributes: (product as any).attributes || [],
          sizes: product.sizes || [],
          colors: product.colors || [],
          variants: product.variants || [],
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
            warrantyDetails: (product as any).warrantyDetails || '',
            additionalInfo: (product as any).additionalInfo || '',
            highlights: (product as any).highlights || [],
            codEnabled: (product as any).codEnabled !== false,
            freeDelivery: (product as any).freeDelivery || false,
            estimatedDeliveryDays: (product as any).estimatedDeliveryDays || 5,
            returnPolicy: (product as any).returnPolicy || '',
            faqs: (product as any).faqs || [],
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
    if (formData.name) {
      setFormData(prev => ({
        ...prev,
        seo: { ...prev.seo, slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }
      }));
    }
  }, [formData.name]);

  // Auto-generate SKU
  const generateSKU = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRD';
    const brand = formData.details.brand ? formData.details.brand.substring(0, 2).toUpperCase() : '';
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${brand}${random}`;
  };

  const calculateDiscount = () => {
    if (formData.originalPrice > 0 && formData.sellingPrice > 0 && formData.originalPrice > formData.sellingPrice) {
      return Math.round(((formData.originalPrice - formData.sellingPrice) / formData.originalPrice) * 100);
    }
    return 0;
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Product Name is required', variant: 'destructive' });
      setActiveTab('basic');
      return;
    }
    if (formData.sellingPrice <= 0) {
      toast({ title: 'Error', description: 'Price must be greater than 0', variant: 'destructive' });
      setActiveTab('basic');
      return;
    }

    const products = getProducts();
    
    const productToSave: Product = {
      id: formData.id || generateId(),
      name: formData.name,
      sku: formData.inventory.sku || generateSKU(),
      price: formData.sale.enabled && formData.sale.salePrice > 0 ? formData.sale.salePrice : formData.sellingPrice,
      stock: formData.inventory.quantity,
      status: formData.status,
      image: formData.images[0] || '',
      galleryImages: [...formData.galleryImages],
      category: formData.category,
      description: formData.description,
      featured: formData.marketing.featured,
      sizes: formData.sizes,
      colors: formData.colors,
      variants: formData.variants,
      tags: formData.seo.keywords,
      keyFeatures: formData.details.highlights,
      warranty: formData.details.warranty,
      warrantyDetails: formData.details.warrantyDetails,
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

  // Image handling
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, images: [event.target?.result as string] }));
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ 
          ...prev, 
          galleryImages: [...prev.galleryImages, event.target?.result as string].slice(0, 10)
        }));
      };
      reader.readAsDataURL(file);
    });
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handlePromoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, marketing: { ...prev.marketing, promoImage: event.target?.result as string } }));
    };
    reader.readAsDataURL(file);
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
  };

  // Drag and drop for images
  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedImageIndex === null) return;
    const newImages = [...formData.galleryImages];
    const [draggedImage] = newImages.splice(draggedImageIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);
    setFormData(prev => ({ ...prev, galleryImages: newImages }));
    setDraggedImageIndex(null);
  };

  // Attributes
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

  // Sizes
  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  // Generate variants from sizes and colors
  const generateVariants = () => {
    const variants: ProductVariant[] = [];
    if (formData.sizes.length === 0 && formData.colors.length === 0) {
      toast({ title: 'Info', description: 'Add sizes or colors first to generate variants' });
      return;
    }
    
    const sizes = formData.sizes.length > 0 ? formData.sizes : ['Default'];
    const colors = formData.colors.length > 0 ? formData.colors : ['Default'];
    
    sizes.forEach(size => {
      colors.forEach(color => {
        variants.push({
          id: generateId(),
          size,
          color,
          sku: `${formData.inventory.sku || 'SKU'}-${size}-${color}`.replace(/\s+/g, '-').toUpperCase(),
          price: formData.sellingPrice,
          stock: 0,
        });
      });
    });
    
    setFormData(prev => ({ ...prev, variants }));
    toast({ title: 'Success', description: `Generated ${variants.length} variants` });
  };

  // SEO auto-generate
  const autoGenerateSEO = () => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        metaTitle: prev.name.substring(0, 60),
        metaDescription: prev.description.substring(0, 160),
        slug: prev.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }
    }));
    toast({ title: 'Success', description: 'SEO fields auto-generated' });
  };

  // Add keyword
  const [newKeyword, setNewKeyword] = useState('');
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

  // Highlights
  const addHighlight = () => {
    if (newHighlight.trim()) {
      setFormData(prev => ({
        ...prev,
        details: { ...prev.details, highlights: [...prev.details.highlights, newHighlight.trim()] }
      }));
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details, highlights: prev.details.highlights.filter((_, i) => i !== index) }
    }));
  };

  // FAQs
  const addFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      setFormData(prev => ({
        ...prev,
        details: { ...prev.details, faqs: [...prev.details.faqs, { ...newFaq }] }
      }));
      setNewFaq({ question: '', answer: '' });
    }
  };

  const removeFaq = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details, faqs: prev.details.faqs.filter((_, i) => i !== index) }
    }));
  };

  // Pack options
  const addPackOption = () => {
    if (newPackOption.quantity > 0) {
      setFormData(prev => ({
        ...prev,
        inventory: { ...prev.inventory, packOptions: [...prev.inventory.packOptions, { ...newPackOption }] }
      }));
      setNewPackOption({ quantity: 1, price: 0, label: '' });
    }
  };

  const removePackOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inventory: { ...prev.inventory, packOptions: prev.inventory.packOptions.filter((_, i) => i !== index) }
    }));
  };

  // Quick stock adjustment
  const adjustStock = (amount: number) => {
    setFormData(prev => ({
      ...prev,
      inventory: { ...prev.inventory, quantity: Math.max(0, prev.inventory.quantity + amount) }
    }));
  };

  // Bulk export
  const handleBulkExport = () => {
    const products = getProducts();
    const csvContent = [
      ['ID', 'Name', 'SKU', 'Price', 'Stock', 'Category', 'Status'].join(','),
      ...products.map(p => [p.id, p.name, p.sku, p.price, p.stock, p.category, p.status].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Success', description: 'Products exported successfully' });
  };

  // Bulk import
  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const products = getProducts();
          const newProducts = json.map((p: any) => ({
            id: generateId(),
            name: p.name || 'Imported Product',
            sku: p.sku || generateSKU(),
            price: p.price || 0,
            stock: p.stock || 0,
            status: p.status || 'draft',
            image: p.image || '',
            galleryImages: p.galleryImages || [],
            category: p.category || '',
            description: p.description || '',
            featured: p.featured || false,
            sizes: p.sizes || [],
            colors: p.colors || [],
            variants: p.variants || [],
            tags: p.tags || [],
            keyFeatures: p.keyFeatures || [],
            warranty: p.warranty || '',
            warrantyDetails: p.warrantyDetails || '',
            saleEnabled: p.saleEnabled || false,
            saleDiscount: p.saleDiscount || 0,
            saleStartDate: p.saleStartDate || '',
            saleEndDate: p.saleEndDate || '',
            metaTitle: p.metaTitle || '',
            metaDescription: p.metaDescription || '',
            weight: p.weight || 0,
            dimensions: p.dimensions || { length: 0, width: 0, height: 0 },
            badge: p.badge || 'none',
            brand: p.brand || '',
            createdAt: new Date().toISOString().split('T')[0],
          }));
          setProducts([...newProducts, ...products]);
          toast({ title: 'Success', description: `Imported ${newProducts.length} products` });
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Invalid JSON file', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    setShowBulkImport(false);
  };

  // Sale countdown
  const getSaleCountdown = () => {
    if (!formData.sale.enabled || !formData.sale.endDate) return null;
    const endDate = new Date(formData.sale.endDate);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    if (diff <= 0) return 'Sale ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m remaining`;
  };

  // Shipping cost calculation
  const calculateShippingCost = () => {
    if (formData.shipping.freeShipping) return 0;
    const baseCost = formData.shipping.weight * 10; // ₹10 per kg
    const volumeFactor = (formData.shipping.length * formData.shipping.width * formData.shipping.height) / 5000;
    return Math.max(baseCost, volumeFactor * 5, formData.shipping.shippingCost);
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
            <h1 className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-muted-foreground text-sm">Fill in the product details below to add a new item to your inventory.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleBulkExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowBulkImport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
      <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
      <input ref={promoImageRef} type="file" accept="image/*" onChange={handlePromoImageUpload} className="hidden" />
      <input ref={bulkImportRef} type="file" accept=".json" onChange={handleBulkImport} className="hidden" />

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-muted/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="basic" className="data-[state=active]:bg-background">Basic Info</TabsTrigger>
          <TabsTrigger value="images" className="data-[state=active]:bg-background">Images</TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-background">Inventory</TabsTrigger>
          <TabsTrigger value="attributes" className="data-[state=active]:bg-background">Attributes</TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-background">SEO</TabsTrigger>
          <TabsTrigger value="shipping" className="data-[state=active]:bg-background">Shipping</TabsTrigger>
          <TabsTrigger value="marketing" className="data-[state=active]:bg-background">Marketing</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-background">Details</TabsTrigger>
          <TabsTrigger value="sale" className="data-[state=active]:bg-background">Sale</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Enter product name" 
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
                    <Button type="button" variant="outline" size="icon" onClick={() => setShowAddCategory(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input 
                    type="number" 
                    value={formData.sellingPrice || ''} 
                    onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })} 
                    placeholder="0" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input 
                    value={formData.details.brand} 
                    onChange={e => setFormData({ ...formData, details: { ...formData.details, brand: e.target.value } })} 
                    placeholder="Brand name" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v: 'active' | 'inactive' | 'draft') => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Main Product Image *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                {formData.images[0] ? (
                  <div className="relative w-48 h-48 mx-auto">
                    <img src={formData.images[0]} alt="Main" className="w-full h-full object-cover rounded-lg border" />
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-6 w-6" 
                      onClick={() => setFormData(prev => ({ ...prev, images: [] }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="w-48 h-48 mx-auto rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Click to upload</p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground text-center">Paste an image URL and it will be automatically validated</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Gallery Images ({formData.galleryImages.length}/10)</CardTitle>
                  <Button variant="outline" onClick={() => galleryInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Add Images
                  </Button>
                </div>
                
                {formData.galleryImages.length > 0 ? (
                  <div className="grid grid-cols-5 gap-4">
                    {formData.galleryImages.map((img, i) => (
                      <div 
                        key={i} 
                        className="relative w-full aspect-square cursor-move"
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(i)}
                      >
                        <div className="absolute top-1 left-1 z-10 bg-background/80 rounded p-1">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover rounded-lg border" />
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-6 w-6" 
                          onClick={() => removeGalleryImage(i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>No gallery images added</p>
                    <p className="text-sm mt-1">Click "Add Images" to upload gallery photos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>SKU (Stock Keeping Unit)</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={formData.inventory.sku} 
                      onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory, sku: e.target.value } })} 
                      placeholder="Auto-generated or manual" 
                    />
                    <Button variant="outline" onClick={() => setFormData({ ...formData, inventory: { ...formData.inventory, sku: generateSKU() } })}>
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Unique identifier for inventory tracking</p>
                </div>
                <div className="space-y-2">
                  <Label>Stock Quantity *</Label>
                  <Input 
                    type="number" 
                    value={formData.inventory.quantity || ''} 
                    onChange={e => setFormData({ ...formData, inventory: { ...formData.inventory, quantity: parseInt(e.target.value) || 0 } })} 
                    placeholder="0" 
                  />
                  {formData.inventory.quantity === 0 && <p className="text-xs text-destructive">Out of stock</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Status</Label>
                  <Select value={formData.status} onValueChange={(v: 'active' | 'inactive' | 'draft') => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <Checkbox 
                    checked={formData.marketing.featured}
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, featured: !!checked } })}
                  />
                  <Label>Featured Product</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quick Stock Adjustment</Label>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => adjustStock(10)}>+10</Button>
                  <Button variant="outline" onClick={() => adjustStock(50)}>+50</Button>
                  <Button variant="outline" onClick={() => adjustStock(100)}>+100</Button>
                  <Button variant="outline" onClick={() => adjustStock(-10)}>-10</Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <Label className="font-medium">Pack Options (Buy in Bulk)</Label>
                <div className="grid gap-4 md:grid-cols-4 mt-4">
                  <Input 
                    type="number" 
                    value={newPackOption.quantity || ''} 
                    onChange={e => setNewPackOption({ ...newPackOption, quantity: parseInt(e.target.value) || 0 })} 
                    placeholder="Quantity" 
                  />
                  <Input 
                    type="number" 
                    value={newPackOption.price || ''} 
                    onChange={e => setNewPackOption({ ...newPackOption, price: parseFloat(e.target.value) || 0 })} 
                    placeholder="Price" 
                  />
                  <Input 
                    value={newPackOption.label} 
                    onChange={e => setNewPackOption({ ...newPackOption, label: e.target.value })} 
                    placeholder="Label (optional)" 
                  />
                  <Button onClick={addPackOption}>Add Pack</Button>
                </div>
                {formData.inventory.packOptions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.inventory.packOptions.map((pack, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-background rounded">
                        <span>{pack.quantity} units @ ₹{pack.price} {pack.label && `(${pack.label})`}</span>
                        <Button size="icon" variant="ghost" onClick={() => removePackOption(i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border">
                <p className="font-medium mb-2">Inventory Tips</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• SKU is auto-generated based on category and brand</li>
                  <li>• Low stock alert triggers when quantity &lt; 10</li>
                  <li>• Featured products appear on homepage</li>
                  <li>• Draft products are not visible to customers</li>
                  <li>• Pack options increase average order value</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attributes Tab */}
        <TabsContent value="attributes" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="sizes" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="sizes">Sizes</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>

                <TabsContent value="sizes" className="mt-6 space-y-4">
                  <Label>Available Sizes</Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SIZES.map(size => (
                      <Button 
                        key={size} 
                        variant={formData.sizes.includes(size) ? 'default' : 'outline'} 
                        onClick={() => toggleSize(size)}
                        className="min-w-16"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                  {formData.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.sizes.map(size => (
                        <Badge key={size} variant="secondary">{size}</Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="colors" className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Color Variants</Label>
                      <p className="text-sm text-muted-foreground">Link products as color variants</p>
                    </div>
                    <LinkIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter color name" 
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            setFormData(prev => ({ ...prev, colors: [...prev.colors, input.value.trim()] }));
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <Button variant="outline" onClick={() => {
                      const input = document.querySelector('input[placeholder="Enter color name"]') as HTMLInputElement;
                      if (input?.value.trim()) {
                        setFormData(prev => ({ ...prev, colors: [...prev.colors, input.value.trim()] }));
                        input.value = '';
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.colors.map((color, i) => (
                        <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, idx) => idx !== i) }))}>
                          {color} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="variants" className="mt-6 space-y-4">
                  <div className="text-center py-4">
                    <Button onClick={generateVariants} className="gradient-primary text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Variant Group
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">Add sizes and/or colors first to generate variants automatically</p>
                  </div>
                  
                  {formData.variants.length > 0 && (
                    <div className="space-y-2">
                      <Label>Generated Variants ({formData.variants.length})</Label>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="p-2 text-left">Size</th>
                              <th className="p-2 text-left">Color</th>
                              <th className="p-2 text-left">SKU</th>
                              <th className="p-2 text-left">Price</th>
                              <th className="p-2 text-left">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.variants.map((variant, i) => (
                              <tr key={variant.id} className="border-t">
                                <td className="p-2">{variant.size}</td>
                                <td className="p-2">{variant.color}</td>
                                <td className="p-2">
                                  <Input 
                                    value={variant.sku} 
                                    onChange={e => {
                                      const newVariants = [...formData.variants];
                                      newVariants[i].sku = e.target.value;
                                      setFormData(prev => ({ ...prev, variants: newVariants }));
                                    }}
                                    className="h-8"
                                  />
                                </td>
                                <td className="p-2">
                                  <Input 
                                    type="number"
                                    value={variant.price || ''} 
                                    onChange={e => {
                                      const newVariants = [...formData.variants];
                                      newVariants[i].price = parseFloat(e.target.value) || 0;
                                      setFormData(prev => ({ ...prev, variants: newVariants }));
                                    }}
                                    className="h-8 w-24"
                                  />
                                </td>
                                <td className="p-2">
                                  <Input 
                                    type="number"
                                    value={variant.stock || ''} 
                                    onChange={e => {
                                      const newVariants = [...formData.variants];
                                      newVariants[i].stock = parseInt(e.target.value) || 0;
                                      setFormData(prev => ({ ...prev, variants: newVariants }));
                                    }}
                                    className="h-8 w-20"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="other" className="mt-6 space-y-4">
                  <p className="text-sm text-muted-foreground">Add custom attributes like Size, Color, Material, etc.</p>
                  
                  {formData.attributes.map(attr => (
                    <div key={attr.id} className="flex gap-3 items-start p-4 rounded-lg bg-muted/30 border">
                      <div className="flex-1 space-y-2">
                        <Input 
                          value={attr.name} 
                          onChange={e => updateAttribute(attr.id, 'name', e.target.value)} 
                          placeholder="Attribute name (e.g., Material)" 
                        />
                      </div>
                      <div className="flex-[2] space-y-2">
                        <Input 
                          value={attr.values} 
                          onChange={e => updateAttribute(attr.id, 'values', e.target.value)} 
                          placeholder="Value (e.g., Cotton)" 
                        />
                      </div>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeAttribute(attr.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" onClick={addAttribute} className="text-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Attribute
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="mt-6">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Optimize your product for search engines</p>
                <Button variant="outline" onClick={autoGenerateSEO}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-Generate
                </Button>
              </div>

              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input 
                  value={formData.seo.metaTitle} 
                  onChange={e => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value.substring(0, 60) } })} 
                  placeholder="Enter SEO optimized title (60 characters)" 
                />
                <p className="text-xs text-muted-foreground">{formData.seo.metaTitle.length}/60 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea 
                  value={formData.seo.metaDescription} 
                  onChange={e => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value.substring(0, 160) } })} 
                  placeholder="Enter meta description (150-160 characters)" 
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">{formData.seo.metaDescription.length}/160 characters</p>
              </div>

              <div className="space-y-2">
                <Label>SEO Keywords</Label>
                <div className="flex gap-2">
                  <Input 
                    value={newKeyword}
                    onChange={e => setNewKeyword(e.target.value)}
                    placeholder="keyword1, keyword2, keyword3" 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button variant="outline" onClick={addKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Comma-separated keywords for search optimization</p>
                {formData.seo.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.seo.keywords.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(i)}>
                        {kw} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border">
                <p className="font-medium mb-2">SEO Best Practices</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Include target keywords naturally in title and description</li>
                  <li>• Keep title under 60 characters to avoid truncation</li>
                  <li>• Meta description should be 150-160 characters</li>
                  <li>• Focus on benefits and unique selling points</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Tab */}
        <TabsContent value="shipping" className="mt-6">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Weight</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      value={formData.shipping.weight || ''} 
                      onChange={e => setFormData({ ...formData, shipping: { ...formData.shipping, weight: parseFloat(e.target.value) || 0 } })} 
                      placeholder="0.00" 
                    />
                    <Select 
                      value={formData.shipping.weightUnit} 
                      onValueChange={v => setFormData({ ...formData, shipping: { ...formData.shipping, weightUnit: v } })}
                    >
                      <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Package Dimensions</Label>
                <div className="grid grid-cols-4 gap-2">
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
                  <div className="flex items-center justify-center text-muted-foreground">cm</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border flex items-center justify-between">
                <div>
                  <p className="font-medium">Free Delivery Available</p>
                  <p className="text-sm text-muted-foreground">Product qualifies for free shipping</p>
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
                  <p className="text-xs text-muted-foreground">Estimated shipping: ₹{calculateShippingCost().toFixed(2)}</p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-muted/30 border">
                <p className="font-medium mb-2">Shipping Information</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Accurate weight and dimensions help calculate shipping costs</li>
                  <li>• Free delivery option increases conversion rates</li>
                  <li>• Dimensions should include packaging material</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing Tab */}
        <TabsContent value="marketing" className="mt-6">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Urgency Indicators</Label>
                
                <div className="p-4 rounded-lg bg-muted/30 border flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show "Buyers Today" Count</p>
                    <p className="text-sm text-muted-foreground">Display social proof indicator</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.buyersToday} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, buyersToday: checked } })} 
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show "Stock Left" Warning</p>
                    <p className="text-sm text-muted-foreground">Display low stock urgency</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.stockWarning} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, stockWarning: checked } })} 
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border flex items-center justify-between">
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

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Special Offers</Label>
                
                <div className="p-4 rounded-lg bg-muted/30 border flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show "Buy 2 Get 1 Free" Offer</p>
                    <p className="text-sm text-muted-foreground">Display promotional badge</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.buy2get1} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, buy2get1: checked } })} 
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Flat Discount</p>
                    <p className="text-sm text-muted-foreground">Display flat discount amount</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.flatDiscount} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, flatDiscount: checked } })} 
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Coupon Code</p>
                    <p className="text-sm text-muted-foreground">Display discount coupon</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.couponCode} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, couponCode: checked } })} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Product Highlights</Label>
                <p className="text-sm text-muted-foreground">Key features that appear prominently on the product page</p>
                <div className="flex gap-2">
                  <Input 
                    value={newHighlight}
                    onChange={e => setNewHighlight(e.target.value)}
                    placeholder="e.g., Premium Quality Material" 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  />
                  <Button variant="outline" onClick={addHighlight}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {formData.details.highlights.length > 0 && (
                  <div className="space-y-2">
                    {formData.details.highlights.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span>• {h}</span>
                        <Button size="icon" variant="ghost" onClick={() => removeHighlight(i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Delivery Settings</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={formData.details.codEnabled}
                      onCheckedChange={checked => setFormData({ ...formData, details: { ...formData.details, codEnabled: !!checked } })}
                    />
                    <Label>Cash on Delivery (COD)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={formData.details.freeDelivery}
                      onCheckedChange={checked => setFormData({ ...formData, details: { ...formData.details, freeDelivery: !!checked } })}
                    />
                    <Label>Free Delivery</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Delivery (Days)</Label>
                    <Input 
                      type="number"
                      value={formData.details.estimatedDeliveryDays || ''}
                      onChange={e => setFormData({ ...formData, details: { ...formData.details, estimatedDeliveryDays: parseInt(e.target.value) || 0 } })}
                      placeholder="3-5"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Warranty Information</Label>
                <div className="space-y-2">
                  <Label>Warranty Period</Label>
                  <Input 
                    value={formData.details.warranty}
                    onChange={e => setFormData({ ...formData, details: { ...formData.details, warranty: e.target.value } })}
                    placeholder="e.g., 1 Year Manufacturer Warranty"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Warranty Details</Label>
                  <Textarea 
                    value={formData.details.warrantyDetails}
                    onChange={e => setFormData({ ...formData, details: { ...formData.details, warrantyDetails: e.target.value } })}
                    placeholder="Describe warranty coverage, terms, and conditions."
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Return Policy</Label>
                <Textarea 
                  value={formData.details.returnPolicy}
                  onChange={e => setFormData({ ...formData, details: { ...formData.details, returnPolicy: e.target.value } })}
                  placeholder="e.g., 7-day return policy. Items must be unused and in original packaging."
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Frequently Asked Questions</Label>
                <div className="space-y-2">
                  <Input 
                    value={newFaq.question}
                    onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
                    placeholder="e.g., What is the return policy?"
                  />
                  <Textarea 
                    value={newFaq.answer}
                    onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
                    placeholder="Provide a detailed answer."
                    rows={2}
                  />
                  <Button variant="outline" onClick={addFaq}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>
                {formData.details.faqs.length > 0 && (
                  <div className="space-y-2">
                    {formData.details.faqs.map((faq, i) => (
                      <div key={i} className="p-4 bg-muted/30 rounded border">
                        <div className="flex justify-between">
                          <p className="font-medium">Q: {faq.question}</p>
                          <Button size="icon" variant="ghost" onClick={() => removeFaq(i)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sale Tab */}
        <TabsContent value="sale" className="mt-6">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="p-4 rounded-lg bg-muted/30 border flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Limited Sale</p>
                  <p className="text-sm text-muted-foreground">Create urgency with time-limited discounts</p>
                </div>
                <Switch 
                  checked={formData.sale.enabled} 
                  onCheckedChange={checked => setFormData({ ...formData, sale: { ...formData.sale, enabled: checked } })} 
                />
              </div>

              {formData.sale.enabled && (
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label>Sale Price</Label>
                    <Input 
                      type="number" 
                      value={formData.sale.salePrice || ''} 
                      onChange={e => setFormData({ ...formData, sale: { ...formData.sale, salePrice: parseFloat(e.target.value) || 0 } })} 
                      placeholder="0.00" 
                    />
                    {formData.sale.salePrice > 0 && formData.sellingPrice > 0 && (
                      <p className="text-sm text-primary font-medium">
                        {Math.round(((formData.sellingPrice - formData.sale.salePrice) / formData.sellingPrice) * 100)}% off (Save ₹{(formData.sellingPrice - formData.sale.salePrice).toFixed(2)})
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

                  {formData.sale.endDate && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                      <p className="text-sm text-muted-foreground">Sale Countdown</p>
                      <p className="text-2xl font-bold text-primary mt-1">{getSaleCountdown()}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">Upload a JSON file containing an array of product objects.</p>
            <Button onClick={() => bulkImportRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Select JSON File
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkImport(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {formData.images[0] && (
              <img src={formData.images[0]} alt={formData.name} className="w-full h-64 object-cover rounded-lg" />
            )}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{formData.name || 'Product Name'}</h2>
              <div className="flex items-center gap-2">
                {formData.sale.enabled && formData.sale.salePrice > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-primary">₹{formData.sale.salePrice}</span>
                    <span className="text-lg text-muted-foreground line-through">₹{formData.sellingPrice}</span>
                    <Badge variant="destructive">{Math.round(((formData.sellingPrice - formData.sale.salePrice) / formData.sellingPrice) * 100)}% OFF</Badge>
                  </>
                ) : (
                  <span className="text-2xl font-bold">₹{formData.sellingPrice}</span>
                )}
              </div>
              {formData.marketing.promoText && <Badge>{formData.marketing.promoText}</Badge>}
              {formData.marketing.featured && <Badge variant="secondary">Featured</Badge>}
            </div>
            <p className="text-muted-foreground">{formData.description || 'No description'}</p>
            
            {formData.sizes.length > 0 && (
              <div className="space-y-2">
                <Label>Sizes</Label>
                <div className="flex gap-2">{formData.sizes.map(s => <Badge key={s} variant="outline">{s}</Badge>)}</div>
              </div>
            )}
            
            {formData.colors.length > 0 && (
              <div className="space-y-2">
                <Label>Colors</Label>
                <div className="flex gap-2">{formData.colors.map(c => <Badge key={c} variant="outline">{c}</Badge>)}</div>
              </div>
            )}

            {formData.details.highlights.length > 0 && (
              <div className="space-y-2">
                <Label>Highlights</Label>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {formData.details.highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              {formData.shipping.freeShipping && <Badge variant="secondary">Free Shipping</Badge>}
              {formData.details.codEnabled && <Badge variant="secondary">COD Available</Badge>}
              {formData.details.warranty && <span className="text-muted-foreground">Warranty: {formData.details.warranty}</span>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-end gap-4 z-50">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground">
          <Package className="mr-2 h-4 w-4" />
          {isEditing ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </div>
  );
};

export default ProductFormPage;
