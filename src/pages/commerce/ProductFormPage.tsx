import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Save, Plus, X, Image as ImageIcon, Upload } from 'lucide-react';
import { getProducts, setProducts, Product, generateId, addAuditLog, getCategories, setCategories as saveCategories, Category } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

interface ProductMarketing {
  buyersToday: boolean;
  stockWarning: boolean;
  countdown: boolean;
  buy2get1: boolean;
  flatDiscount: boolean;
  couponCode: boolean;
}

const defaultMarketing: ProductMarketing = {
  buyersToday: false,
  stockWarning: false,
  countdown: false,
  buy2get1: false,
  flatDiscount: false,
  couponCode: false,
};

const defaultProduct: Omit<Product, 'id' | 'createdAt'> & { marketing: ProductMarketing } = {
  name: '',
  sku: '',
  price: 0,
  stock: 0,
  status: 'draft',
  image: '',
  galleryImages: [],
  category: '',
  description: '',
  featured: false,
  sizes: [],
  colors: [],
  variants: [],
  tags: [],
  keyFeatures: [],
  warranty: '',
  warrantyDetails: '',
  saleEnabled: false,
  saleDiscount: 0,
  saleStartDate: '',
  saleEndDate: '',
  metaTitle: '',
  metaDescription: '',
  weight: 0,
  dimensions: { length: 0, width: 0, height: 0 },
  badge: '',
  brand: '',
  marketing: defaultMarketing,
};

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState(defaultProduct);
  const [categories, setCategoriesState] = useState(getCategories());
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      const products = getProducts();
      const product = products.find(p => p.id === id);
      if (product) {
        setFormData({
          name: product.name,
          sku: product.sku,
          price: product.price,
          stock: product.stock,
          status: product.status,
          image: product.image,
          galleryImages: product.galleryImages || [],
          category: product.category,
          description: product.description,
          featured: product.featured,
          sizes: product.sizes || [],
          colors: product.colors || [],
          variants: product.variants || [],
          tags: product.tags || [],
          keyFeatures: product.keyFeatures || [],
          warranty: product.warranty || '',
          warrantyDetails: product.warrantyDetails || '',
          saleEnabled: product.saleEnabled || false,
          saleDiscount: product.saleDiscount || 0,
          saleStartDate: product.saleStartDate || '',
          saleEndDate: product.saleEndDate || '',
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          weight: product.weight || 0,
          dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
          badge: product.badge || '',
          brand: product.brand || '',
          marketing: (product as any).marketing || defaultMarketing,
        });
      }
    }
  }, [id, isEditing]);

  const handleSubmit = () => {
    if (!formData.name || !formData.sku || formData.price <= 0) {
      toast({ title: 'Error', description: 'Please fill in name, SKU, and price', variant: 'destructive' });
      return;
    }

    const products = getProducts();
    
    if (isEditing) {
      const updated = products.map(p => 
        p.id === id ? { ...p, ...formData } : p
      );
      setProducts(updated);
      addAuditLog({ user: 'Admin User', action: 'Updated product', module: 'Products', timestamp: new Date().toISOString(), details: `Updated: ${formData.name}` });
      toast({ title: 'Success', description: 'Product updated successfully' });
    } else {
      const newProduct: Product = {
        ...formData,
        id: generateId(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setProducts([newProduct, ...products]);
      addAuditLog({ user: 'Admin User', action: 'Created product', module: 'Products', timestamp: new Date().toISOString(), details: `Created: ${formData.name}` });
      toast({ title: 'Success', description: 'Product created successfully' });
    }

    navigate('/commerce/products');
  };

  const addItem = (field: 'sizes' | 'colors' | 'tags' | 'keyFeatures', value: string, setter: (v: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
      setter('');
    }
  };

  const removeItem = (field: 'sizes' | 'colors' | 'tags' | 'keyFeatures', index: number) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const addGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setFormData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, newGalleryUrl.trim()] }));
      setNewGalleryUrl('');
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== index) }));
  };

  const generateVariants = () => {
    if (formData.sizes.length === 0 || formData.colors.length === 0) {
      toast({ title: 'Info', description: 'Add sizes and colors first to generate variants' });
      return;
    }
    const variants = formData.sizes.flatMap(size => 
      formData.colors.map(color => ({
        id: generateId(),
        size,
        color,
        price: formData.price,
        stock: 0,
        sku: `${formData.sku}-${size}-${color}`.toUpperCase().replace(/\s/g, ''),
      }))
    );
    setFormData(prev => ({ ...prev, variants }));
    toast({ title: 'Generated', description: `Created ${variants.length} variants` });
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

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, image: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || formData.galleryImages.length >= 10) return;
    
    Array.from(files).slice(0, 10 - formData.galleryImages.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ 
          ...prev, 
          galleryImages: [...prev.galleryImages, event.target?.result as string].slice(0, 10) 
        }));
      };
      reader.readAsDataURL(file);
    });
    if (galleryImageRef.current) galleryImageRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
        <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground">
          <Save className="mr-2 h-4 w-4" />
          {isEditing ? 'Update Product' : 'Save Product'}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="glass grid grid-cols-5 lg:grid-cols-9 w-full">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="sale">Sale</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <Card className="glass">
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter product name" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="flex gap-2">
                    <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.active).map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={() => setShowAddCategory(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Product description" rows={4} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} placeholder="Brand name" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v: Product['status']) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <Card className="glass">
            <CardHeader><CardTitle>Product Images</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <input ref={mainImageRef} type="file" accept="image/*" onChange={handleMainImageUpload} className="hidden" />
              <input ref={galleryImageRef} type="file" accept="image/*" multiple onChange={handleGalleryImageUpload} className="hidden" />
              
              <div className="space-y-2">
                <Label>Main Image</Label>
                <div className="flex gap-2">
                  <Input value={typeof formData.image === 'string' && !formData.image.startsWith('data:') ? formData.image : ''} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="Image URL or upload file" className="flex-1" />
                  <Button type="button" variant="outline" onClick={() => mainImageRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />Upload
                  </Button>
                </div>
                {formData.image && (
                  <div className="mt-2 relative inline-block">
                    <img src={formData.image} alt="Preview" className="h-32 w-32 rounded-lg object-cover border" />
                    <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => setFormData({ ...formData, image: '' })}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Gallery Images ({formData.galleryImages.length}/10)</Label>
                <div className="flex gap-2">
                  <Input value={newGalleryUrl} onChange={e => setNewGalleryUrl(e.target.value)} placeholder="Image URL" className="flex-1" />
                  <Button onClick={addGalleryImage} variant="outline"><Plus className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" onClick={() => galleryImageRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />Upload
                  </Button>
                </div>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {formData.galleryImages.map((url, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={url} alt={`Gallery ${i}`} className="w-full h-full rounded-lg object-cover border" />
                      <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => removeGalleryImage(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {formData.galleryImages.length < 10 && (
                    <div 
                      className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50"
                      onClick={() => galleryImageRef.current?.click()}
                    >
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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

        <TabsContent value="inventory" className="mt-6">
          <Card className="glass">
            <CardHeader><CardTitle>Inventory Management</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>SKU *</Label>
                  <div className="flex gap-2">
                    <Input value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="PRD-001" />
                    <Button variant="outline" onClick={() => setFormData({ ...formData, sku: `SKU-${generateId().toUpperCase()}` })}>Auto</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Stock Quantity</Label>
                  <div className="flex gap-2">
                    <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} placeholder="0" />
                    <Button variant="outline" onClick={() => setFormData(p => ({ ...p, stock: p.stock + 10 }))}>+10</Button>
                    <Button variant="outline" onClick={() => setFormData(p => ({ ...p, stock: p.stock + 50 }))}>+50</Button>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                <div>
                  <p className="font-medium">Featured Product</p>
                  <p className="text-sm text-muted-foreground">Show in featured sections</p>
                </div>
                <Switch checked={formData.featured} onCheckedChange={checked => setFormData({ ...formData, featured: checked })} />
              </div>
              {formData.stock > 0 && formData.stock <= 10 && (
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-warning font-medium">Low Stock Warning</p>
                  <p className="text-sm text-muted-foreground">This product has low stock ({formData.stock} remaining)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attributes" className="mt-6">
          <Card className="glass">
            <CardHeader><CardTitle>Product Attributes</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="sizes" className="w-full">
                <TabsList className="grid grid-cols-4 w-full mb-6">
                  <TabsTrigger value="sizes">Sizes</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>

                <TabsContent value="sizes" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Add Sizes</Label>
                    <p className="text-sm text-muted-foreground">Add available sizes for this product (e.g., S, M, L, XL)</p>
                    <div className="flex gap-2 mt-2">
                      <Input value={newSize} onChange={e => setNewSize(e.target.value)} placeholder="Enter size (e.g., S, M, L)" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('sizes', newSize, setNewSize))} />
                      <Button variant="outline" onClick={() => addItem('sizes', newSize, setNewSize)}><Plus className="h-4 w-4 mr-2" />Add</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Added Sizes ({formData.sizes.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.sizes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No sizes added yet</p>
                      ) : (
                        formData.sizes.map((size, i) => (
                          <Badge key={i} variant="secondary" className="cursor-pointer px-3 py-1.5 text-sm" onClick={() => removeItem('sizes', i)}>
                            {size} <X className="h-3 w-3 ml-2" />
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Add Colors</Label>
                    <p className="text-sm text-muted-foreground">Add available colors for this product (e.g., Red, Blue, Black)</p>
                    <div className="flex gap-2 mt-2">
                      <Input value={newColor} onChange={e => setNewColor(e.target.value)} placeholder="Enter color (e.g., Red, Blue)" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('colors', newColor, setNewColor))} />
                      <Button variant="outline" onClick={() => addItem('colors', newColor, setNewColor)}><Plus className="h-4 w-4 mr-2" />Add</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Added Colors ({formData.colors.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.colors.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No colors added yet</p>
                      ) : (
                        formData.colors.map((color, i) => (
                          <Badge key={i} variant="secondary" className="cursor-pointer px-3 py-1.5 text-sm" onClick={() => removeItem('colors', i)}>
                            {color} <X className="h-3 w-3 ml-2" />
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="variants" className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      Add sizes and/or colors to create variants automatically. Variants will be generated from all size × color combinations.
                    </p>
                    <Button onClick={generateVariants} disabled={formData.sizes.length === 0 && formData.colors.length === 0}>
                      <Plus className="h-4 w-4 mr-2" />Create Variant Group
                    </Button>
                  </div>
                  
                  {formData.variants.length > 0 && (
                    <div className="space-y-3">
                      <Label>Generated Variants ({formData.variants.length})</Label>
                      <div className="space-y-2 max-h-80 overflow-auto pr-2">
                        {formData.variants.map((variant, i) => (
                          <div key={variant.id} className="grid grid-cols-5 gap-3 p-3 rounded-lg bg-muted/50 items-center">
                            <div>
                              <Label className="text-xs text-muted-foreground">Variant</Label>
                              <p className="font-medium text-sm">{variant.size} / {variant.color}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">SKU</Label>
                              <Input 
                                value={variant.sku} 
                                onChange={e => {
                                  const updated = [...formData.variants];
                                  updated[i].sku = e.target.value;
                                  setFormData({ ...formData, variants: updated });
                                }} 
                                className="h-8 text-sm" 
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Price</Label>
                              <Input 
                                type="number" 
                                value={variant.price} 
                                onChange={e => {
                                  const updated = [...formData.variants];
                                  updated[i].price = parseFloat(e.target.value) || 0;
                                  setFormData({ ...formData, variants: updated });
                                }} 
                                className="h-8 text-sm" 
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Stock</Label>
                              <Input 
                                type="number" 
                                value={variant.stock} 
                                onChange={e => {
                                  const updated = [...formData.variants];
                                  updated[i].stock = parseInt(e.target.value) || 0;
                                  setFormData({ ...formData, variants: updated });
                                }} 
                                className="h-8 text-sm" 
                              />
                            </div>
                            <div className="flex justify-end">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  const updated = formData.variants.filter((_, idx) => idx !== i);
                                  setFormData({ ...formData, variants: updated });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {formData.variants.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No variants created yet</p>
                      <p className="text-sm mt-1">Add sizes and colors first, then click "Create Variant Group"</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="other" className="space-y-4">
                  <div className="p-6 rounded-lg bg-muted/50 border border-border text-center">
                    <p className="text-muted-foreground">Additional attributes coming soon</p>
                    <p className="text-sm text-muted-foreground mt-1">Custom attributes like material, style, etc. will be available here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <Card className="glass">
            <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={formData.metaTitle} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} placeholder="SEO optimized title" />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={formData.metaDescription} onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} placeholder="SEO description (max 160 chars)" rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <Card className="glass">
            <CardHeader><CardTitle>Shipping Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })} placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label>Dimensions (cm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input type="number" value={formData.dimensions.length} onChange={e => setFormData({ ...formData, dimensions: { ...formData.dimensions, length: parseFloat(e.target.value) || 0 } })} placeholder="L" />
                    <Input type="number" value={formData.dimensions.width} onChange={e => setFormData({ ...formData, dimensions: { ...formData.dimensions, width: parseFloat(e.target.value) || 0 } })} placeholder="W" />
                    <Input type="number" value={formData.dimensions.height} onChange={e => setFormData({ ...formData, dimensions: { ...formData.dimensions, height: parseFloat(e.target.value) || 0 } })} placeholder="H" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing" className="mt-6">
          <div className="space-y-6">
            <Card className="glass">
              <CardHeader><CardTitle>Promotional Badge</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Select Badge</Label>
                  <Select value={formData.badge} onValueChange={v => setFormData({ ...formData, badge: v })}>
                    <SelectTrigger><SelectValue placeholder="Select badge" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="bestseller">Bestseller</SelectItem>
                      <SelectItem value="limited">Limited Edition</SelectItem>
                      <SelectItem value="sale">On Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader><CardTitle>Urgency Indicators</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show "Buyers Today" Count</p>
                    <p className="text-sm text-muted-foreground">Display simulated buyer activity to create urgency</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.buyersToday} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, buyersToday: checked } })} 
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show "Stock Left" Warning</p>
                    <p className="text-sm text-muted-foreground">Display low stock warning to encourage quick purchase</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.stockWarning} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, stockWarning: checked } })} 
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Daily Sale Countdown</p>
                    <p className="text-sm text-muted-foreground">Display countdown timer for daily deals</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.countdown} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, countdown: checked } })} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader><CardTitle>Special Offers</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Buy 2 Get 1 Free</p>
                    <p className="text-sm text-muted-foreground">Enable bundle offer on this product</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.buy2get1} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, buy2get1: checked } })} 
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Flat Discount</p>
                    <p className="text-sm text-muted-foreground">Show flat discount badge on product</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.flatDiscount} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, flatDiscount: checked } })} 
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Coupon Code</p>
                    <p className="text-sm text-muted-foreground">Enable coupon code for this product</p>
                  </div>
                  <Switch 
                    checked={formData.marketing.couponCode} 
                    onCheckedChange={checked => setFormData({ ...formData, marketing: { ...formData.marketing, couponCode: checked } })} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <Card className="glass">
            <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add tag" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('tags', newTag, setNewTag))} />
                  <Button variant="outline" onClick={() => addItem('tags', newTag, setNewTag)}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="cursor-pointer" onClick={() => removeItem('tags', i)}>{tag} <X className="h-3 w-3 ml-1" /></Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Key Features</Label>
                <div className="flex gap-2">
                  <Input value={newFeature} onChange={e => setNewFeature(e.target.value)} placeholder="Add feature" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('keyFeatures', newFeature, setNewFeature))} />
                  <Button variant="outline" onClick={() => addItem('keyFeatures', newFeature, setNewFeature)}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-2 mt-2">
                  {formData.keyFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                      <span className="flex-1">{feature}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeItem('keyFeatures', i)}><X className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Warranty</Label>
                  <Input value={formData.warranty} onChange={e => setFormData({ ...formData, warranty: e.target.value })} placeholder="e.g., 1 Year" />
                </div>
                <div className="space-y-2">
                  <Label>Warranty Details</Label>
                  <Input value={formData.warrantyDetails} onChange={e => setFormData({ ...formData, warrantyDetails: e.target.value })} placeholder="Coverage details" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sale" className="mt-6">
          <Card className="glass">
            <CardHeader><CardTitle>Sale Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Limited Sale</p>
                  <p className="text-sm text-muted-foreground">Create a time-limited discount</p>
                </div>
                <Switch checked={formData.saleEnabled} onCheckedChange={checked => setFormData({ ...formData, saleEnabled: checked })} />
              </div>
              {formData.saleEnabled && (
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Discount %</Label>
                    <Input type="number" value={formData.saleDiscount} onChange={e => setFormData({ ...formData, saleDiscount: parseInt(e.target.value) || 0 })} placeholder="0" min={0} max={100} />
                    {formData.saleDiscount > 0 && formData.price > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Sale price: ${(formData.price * (1 - formData.saleDiscount / 100)).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" value={formData.saleStartDate} onChange={e => setFormData({ ...formData, saleStartDate: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" value={formData.saleEndDate} onChange={e => setFormData({ ...formData, saleEndDate: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductFormPage;
