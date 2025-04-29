
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useDeal } from '@/context/DealContext';

// Updated interface to match how the component is used in DealPage.tsx
interface ProductSelectProps {
  value?: string;
  dealId: string;
}

const ProductSelect = ({ value, dealId }: ProductSelectProps) => {
  const { products, addProduct, assignProductToDeal } = useDeal();
  const [showNewProductDialog, setShowNewProductDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '' });

  const handleProductSelect = (productId: string) => {
    assignProductToDeal(dealId, productId === 'none' ? undefined : productId);
  };

  const handleAddNewProduct = () => {
    if (newProduct.name.trim()) {
      const product = addProduct({
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || undefined
      });
      setNewProduct({ name: '', description: '' });
      setShowNewProductDialog(false);
      
      // Automatically assign the new product to the deal
      if (product && product.id) {
        assignProductToDeal(dealId, product.id);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select 
            value={value || ''} 
            onValueChange={handleProductSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Product Selected</SelectItem>
              {products?.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          onClick={() => setShowNewProductDialog(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Enter product name"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Enter product description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProductDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewProduct} disabled={!newProduct.name.trim()}>
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductSelect;
