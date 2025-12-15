import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Image, Upload, Trash2, Eye } from 'lucide-react';
import { initializeMockData, getMediaItems, setMediaItems, MediaItem, generateId } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const MediaLibraryPage = () => {
  const { toast } = useToast();
  const [media, setMediaState] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  useEffect(() => { initializeMockData(); setMediaState(getMediaItems()); }, []);

  const handleUpload = () => {
    const newItem: MediaItem = { id: generateId(), name: `image-${Date.now()}.jpg`, url: `https://picsum.photos/400?random=${Date.now()}`, type: 'image/jpeg', size: Math.floor(Math.random() * 500000), usageCount: 0, uploadedAt: new Date().toISOString().split('T')[0] };
    const updated = [newItem, ...media]; setMediaState(updated); setMediaItems(updated);
    toast({ title: 'Uploaded', description: 'Image uploaded successfully' });
  };

  const handleDelete = (id: string) => { const updated = media.filter((m) => m.id !== id); setMediaState(updated); setMediaItems(updated); toast({ title: 'Deleted' }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">Media Library</h1><p className="text-muted-foreground">Manage your images and files.</p></div>
        <Button onClick={handleUpload} className="gradient-primary text-primary-foreground"><Upload className="mr-2 h-4 w-4" />Upload Image</Button>
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {media.map((item) => (
          <Card key={item.id} className="glass group overflow-hidden">
            <div className="aspect-square relative">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" onClick={() => setSelectedItem(item)}><Eye className="h-4 w-4" /></Button>
                <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <CardContent className="p-2">
              <p className="text-xs truncate">{item.name}</p>
              <Badge variant="secondary" className="text-xs mt-1">{item.usageCount} uses</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Image Preview</DialogTitle></DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <img src={selectedItem.url} alt={selectedItem.name} className="w-full rounded-lg" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Name:</span> {selectedItem.name}</div>
                <div><span className="text-muted-foreground">Size:</span> {(selectedItem.size / 1024).toFixed(0)} KB</div>
                <div><span className="text-muted-foreground">Type:</span> {selectedItem.type}</div>
                <div><span className="text-muted-foreground">Uploaded:</span> {selectedItem.uploadedAt}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaLibraryPage;
