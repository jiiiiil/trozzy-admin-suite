import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';
import { initializeMockData, getCategories, setCategories, Category, generateId } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const CategoriesPage = () => {
  const { toast } = useToast();
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', order: 0, active: true });

  useEffect(() => { initializeMockData(); setCategoriesState(getCategories()); }, []);

  const handleSubmit = () => {
    if (!formData.name) { toast({ title: 'Error', description: 'Please enter a name', variant: 'destructive' }); return; }
    if (editingCategory) {
      const updated = categories.map((c) => c.id === editingCategory.id ? { ...c, ...formData } : c);
      setCategoriesState(updated); setCategories(updated);
    } else {
      const newCat: Category = { id: generateId(), ...formData, parentId: null, productCount: 0 };
      const updated = [...categories, newCat]; setCategoriesState(updated); setCategories(updated);
    }
    toast({ title: 'Success', description: editingCategory ? 'Category updated' : 'Category created' });
    resetForm(); setIsModalOpen(false);
  };

  const handleDelete = (id: string) => { const updated = categories.filter((c) => c.id !== id); setCategoriesState(updated); setCategories(updated); toast({ title: 'Deleted' }); };
  const resetForm = () => { setEditingCategory(null); setFormData({ name: '', description: '', order: 0, active: true }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">Product Categories</h1><p className="text-muted-foreground">Organize your product catalog.</p></div>
        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild><Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" />Add Category</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Description</Label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>Order</Label><Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex items-center gap-2"><Switch checked={formData.active} onCheckedChange={(checked) => setFormData({ ...formData, active: checked })} /><Label>Active</Label></div>
              <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground">{editingCategory ? 'Update' : 'Add'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.id} className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><FolderTree className="h-5 w-5 text-primary" />{cat.name}</CardTitle>
              <StatusBadge status={cat.active ? 'active' : 'inactive'} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">Order: {cat.order} • {cat.productCount} products</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingCategory(cat); setFormData({ name: cat.name, description: cat.description, order: cat.order, active: cat.active }); setIsModalOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
