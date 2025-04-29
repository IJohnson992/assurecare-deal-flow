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

// Updated interface to match how the component is used in both DealPage.tsx and NewDealDialog.tsx
interface ProductSelectProps {
  value?: string;
  dealId?: string;
  // Support props from NewDealDialog.tsx
  products?: Product[];
  selectedProductId?: string;
  onProductSelect?: (productId: string) => void;
  onProductAdd?: (productData: Omit<Product, "id">) => void;
}

const ProductSelect = ({ 
  value, 
  dealId,
  products: externalProducts,
  selectedProductId,
  onProductSelect,
  onProductAdd
}: ProductSelectProps) => {
  const { products: contextProducts, addProduct } = useDeal();
  const [showNewProductDialog, setShowNewProductDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '' });

  // Use external products if provided, otherwise use context products
  const displayProducts = externalProducts || contextProducts;

  const handleProductSelect = (productId: string) => {
    if (onProductSelect) {
      // If external handler provided, use it
      onProductSelect(productId);
    } else if (dealId) {
      // Otherwise use the context method if dealId is available
      // This is a compatibility check - we'll add this to DealContext.tsx
      const dealContext = useDeal();
      if (dealContext && typeof dealContext.assignProductToDeal === 'function') {
        dealContext.assignProductToDeal(dealId, productId === 'none' ? undefined : productId);
      }
    }
  };

  const handleAddNewProduct = () => {
    if (newProduct.name.trim()) {
      const productData = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim() || undefined
      };

      if (onProductAdd) {
        // If external handler provided, use it
        onProductAdd(productData);
      } else {
        // Otherwise use the context method
        const product = addProduct(productData);
        
        // Automatically assign the new product to the deal if dealId is available
        if (product && product.id && dealId) {
          const dealContext = useDeal();
          if (dealContext && typeof dealContext.assignProductToDeal === 'function') {
            dealContext.assignProductToDeal(dealId, product.id);
          }
        }
      }
      
      setNewProduct({ name: '', description: '' });
      setShowNewProductDialog(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select 
            value={value || selectedProductId || ''} 
            onValueChange={handleProductSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Product Selected</SelectItem>
              {displayProducts?.map((product) => (
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
