import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Download } from 'lucide-react';
import { initializeMockData, getProducts, setProducts, Product, addAuditLog, getCategories, exportToCSV } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProductsState] = useState<Product[]>([]);
  const [categories, setCategoriesState] = useState(getCategories());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    initializeMockData();
    setProductsState(getProducts());
    setCategoriesState(getCategories());
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = (id: string) => {
    const product = products.find((p) => p.id === id);
    const updated = products.filter((p) => p.id !== id);
    setProductsState(updated);
    setProducts(updated);
    addAuditLog({ user: 'Admin User', action: 'Deleted product', module: 'Products', timestamp: new Date().toISOString(), details: `Deleted: ${product?.name}` });
    toast({ title: 'Deleted', description: 'Product deleted successfully' });
  };

  const handleBulkStatus = (status: Product['status']) => {
    const updated = products.map((p) =>
      selectedIds.includes(p.id) ? { ...p, status } : p
    );
    setProductsState(updated);
    setProducts(updated);
    addAuditLog({ user: 'Admin User', action: 'Bulk status update', module: 'Products', timestamp: new Date().toISOString(), details: `Updated ${selectedIds.length} products to ${status}` });
    setSelectedIds([]);
    toast({ title: 'Updated', description: `${selectedIds.length} products updated to ${status}` });
  };

  const handleExport = () => {
    const dataToExport = filteredProducts.map(p => ({
      Name: p.name,
      SKU: p.sku,
      Category: p.category,
      Price: p.price,
      Stock: p.stock,
      Status: p.status,
      Featured: p.featured ? 'Yes' : 'No',
      CreatedAt: p.createdAt,
    }));
    exportToCSV(dataToExport, 'products');
    toast({ title: 'Exported', description: 'Products exported to CSV' });
  };

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (product: Product) => (
        <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
      ),
    },
    { 
      key: 'name', 
      header: 'Name',
      render: (product: Product) => (
        <div>
          <p className="font-medium">{product.name}</p>
          {product.badge && <Badge variant="outline" className="mt-1 text-xs">{product.badge}</Badge>}
        </div>
      ),
    },
    { key: 'sku', header: 'SKU' },
    { key: 'category', header: 'Category' },
    {
      key: 'price',
      header: 'Price',
      render: (product: Product) => (
        <div>
          {product.saleEnabled && product.saleDiscount > 0 ? (
            <>
              <span className="line-through text-muted-foreground mr-2">${product.price.toFixed(2)}</span>
              <span className="text-success font-medium">${(product.price * (1 - product.saleDiscount / 100)).toFixed(2)}</span>
            </>
          ) : (
            `$${product.price.toFixed(2)}`
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product: Product) => (
        <span className={product.stock === 0 ? 'text-destructive font-medium' : product.stock <= 5 ? 'text-warning font-medium' : ''}>
          {product.stock}
          {product.stock === 0 && <Badge variant="destructive" className="ml-2 text-xs">Out</Badge>}
          {product.stock > 0 && product.stock <= 5 && <Badge className="ml-2 text-xs bg-warning">Low</Badge>}
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
          <Button size="icon" variant="ghost" onClick={() => navigate(`/commerce/products/${product.id}`)}>
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
          <p className="text-muted-foreground">Manage your product catalog ({filteredProducts.length} products)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => navigate('/commerce/products/new')} className="gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
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
