import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { initializeMockData, getProducts, setProducts, Product, generateId, addAuditLog } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const ProductsPage = () => {
  const { toast } = useToast();
  const [products, setProductsState] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    status: 'active' as Product['status'],
    image: '',
    category: '',
    description: '',
    featured: false,
    saleEnabled: false,
    salePrice: '',
  });

  useEffect(() => {
    initializeMockData();
    setProductsState(getProducts());
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.sku || !formData.price) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? { ...p, ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock) || 0 }
          : p
      );
      setProductsState(updated);
      setProducts(updated);
      addAuditLog({ user: 'Admin User', action: 'Updated product', module: 'Products', timestamp: new Date().toISOString(), details: `Updated product: ${formData.name}` });
      toast({ title: 'Success', description: 'Product updated successfully' });
    } else {
      const newProduct: Product = {
        id: generateId(),
        name: formData.name,
        sku: formData.sku,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        status: formData.status,
        image: formData.image || 'https://via.placeholder.com/100',
        category: formData.category,
        description: formData.description,
        featured: formData.featured,
        createdAt: new Date().toISOString().split('T')[0],
      };
      const updated = [newProduct, ...products];
      setProductsState(updated);
      setProducts(updated);
      addAuditLog({ user: 'Admin User', action: 'Created product', module: 'Products', timestamp: new Date().toISOString(), details: `Created product: ${formData.name}` });
      toast({ title: 'Success', description: 'Product created successfully' });
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      stock: product.stock.toString(),
      status: product.status,
      image: product.image,
      category: product.category,
      description: product.description,
      featured: product.featured,
      saleEnabled: false,
      salePrice: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const product = products.find((p) => p.id === id);
    const updated = products.filter((p) => p.id !== id);
    setProductsState(updated);
    setProducts(updated);
    addAuditLog({ user: 'Admin User', action: 'Deleted product', module: 'Products', timestamp: new Date().toISOString(), details: `Deleted product: ${product?.name}` });
    toast({ title: 'Success', description: 'Product deleted' });
  };

  const handleBulkStatus = (status: Product['status']) => {
    const updated = products.map((p) =>
      selectedIds.includes(p.id) ? { ...p, status } : p
    );
    setProductsState(updated);
    setProducts(updated);
    setSelectedIds([]);
    toast({ title: 'Success', description: `${selectedIds.length} products updated` });
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      price: '',
      stock: '',
      status: 'active',
      image: '',
      category: '',
      description: '',
      featured: false,
      saleEnabled: false,
      salePrice: '',
    });
  };

  const addStock = (amount: number) => {
    setFormData((prev) => ({ ...prev, stock: (parseInt(prev.stock) || 0 + amount).toString() }));
  };

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (product: Product) => (
        <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
      ),
    },
    { key: 'name', header: 'Name' },
    { key: 'sku', header: 'SKU' },
    {
      key: 'price',
      header: 'Price',
      render: (product: Product) => `$${product.price.toFixed(2)}`,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product: Product) => (
        <span className={product.stock <= 5 ? 'text-warning font-medium' : ''}>
          {product.stock}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (product: Product) => <StatusBadge status={product.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => handleEdit(product)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(product.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-5 lg:grid-cols-9 gap-1">
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

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter product name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Home">Home</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter product description" rows={4} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
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
              </TabsContent>

              <TabsContent value="images" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="mainImage">Main Image URL</Label>
                  <Input id="mainImage" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Gallery Images (0/10)</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">
                        +
                      </div>
                    ))}
                  </div>
                </div>
                {formData.image && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <img src={formData.image} alt="Preview" className="h-32 w-32 rounded-lg object-cover" />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <div className="flex gap-2">
                      <Input id="sku" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="PRD-001" />
                      <Button type="button" variant="outline" onClick={() => setFormData({ ...formData, sku: `SKU-${generateId().toUpperCase()}` })}>
                        Auto
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Label>Quick Add:</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => addStock(10)}>+10</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addStock(50)}>+50</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addStock(100)}>+100</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Featured Product</p>
                    <p className="text-sm text-muted-foreground">Show this product in featured sections</p>
                  </div>
                  <Switch checked={formData.featured} onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })} />
                </div>
              </TabsContent>

              <TabsContent value="attributes" className="space-y-4 mt-4">
                <p className="text-muted-foreground">Configure product attributes like size, color, material...</p>
                <div className="p-8 rounded-lg border-2 border-dashed border-border text-center text-muted-foreground">
                  Attribute configuration coming soon
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <p className="text-muted-foreground">SEO settings for better search visibility</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Meta Title</Label>
                    <Input placeholder="SEO optimized title..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea placeholder="SEO description..." rows={3} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" placeholder="0.0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Dimensions (cm)</Label>
                    <div className="flex gap-2">
                      <Input placeholder="L" />
                      <Input placeholder="W" />
                      <Input placeholder="H" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="marketing" className="space-y-4 mt-4">
                <p className="text-muted-foreground">Marketing and promotional settings</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Promotional Badge</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select badge" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="bestseller">Bestseller</SelectItem>
                        <SelectItem value="limited">Limited Edition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <p className="text-muted-foreground">Additional product details</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input placeholder="Enter brand name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Warranty</Label>
                    <Input placeholder="e.g., 1 Year Manufacturer Warranty" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sale" className="space-y-4 mt-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Enable Limited Sale</p>
                    <p className="text-sm text-muted-foreground">Create a time-limited discount</p>
                  </div>
                  <Switch checked={formData.saleEnabled} onCheckedChange={(checked) => setFormData({ ...formData, saleEnabled: checked })} />
                </div>
                {formData.saleEnabled && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Sale Price</Label>
                      <Input type="number" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })} placeholder="0.00" />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} className="gradient-primary text-primary-foreground">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleBulkStatus('active')}>Enable</Button>
            <Button variant="outline" onClick={() => handleBulkStatus('inactive')}>Disable</Button>
          </div>
        )}
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        selectable
        onSelectionChange={setSelectedIds}
        emptyMessage="No products found"
      />
    </div>
  );
};

export default ProductsPage;
