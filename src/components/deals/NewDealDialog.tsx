
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDeal } from '@/context/DealContext';
import { ClientType, DealStage, LeadSource, Product } from '@/types';
import { 
  Dialog, 
  DialogContent,
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductSelect from '@/components/products/ProductSelect';
import { format } from 'date-fns';
import { mockUsers } from '@/data/mockData';

interface NewDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewDealDialog = ({ open, onOpenChange }: NewDealDialogProps) => {
  const { currentUser } = useAuth();
  const { addDeal, addProduct } = useDeal();

  const initialState = {
    clientName: '',
    dealValue: 0,
    annualRecurringRevenue: 0,
    arrYear1: 0,
    implementationRevenue: 0,
    implementationMonths: 3,
    clientType: 'Commercial' as ClientType,
    leadSource: 'Website' as LeadSource,
    stage: 'Lead Identified' as DealStage,
    ownerId: currentUser?.id || '',
    productId: '',
    expectedCloseDate: format(new Date(), 'yyyy-MM-dd'),
  };

  const [formState, setFormState] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (currentUser && !formState.ownerId) {
      setFormState(prev => ({
        ...prev,
        ownerId: currentUser.id
      }));
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormState(prev => ({
      ...prev,
      [name]: name === 'dealValue' || name === 'annualRecurringRevenue' || 
              name === 'arrYear1' || name === 'implementationRevenue' || name === 'implementationMonths'
                ? parseFloat(value) || 0 
                : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductSelect = (productId: string | undefined) => {
    setFormState(prev => ({ ...prev, productId: productId || '' }));
  };

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct = addProduct(productData);
    setProducts(prev => [...prev, newProduct]);
    setFormState(prev => ({ ...prev, productId: newProduct.id }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    
    if (formState.dealValue <= 0) {
      newErrors.dealValue = 'SaaS Contract Value must be greater than 0';
    }
    
    if (!formState.ownerId) {
      newErrors.ownerId = 'Deal owner is required';
    }

    if (!formState.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required';
    }

    if (formState.implementationMonths < 1 || formState.implementationMonths > 99) {
      newErrors.implementationMonths = 'Implementation timeline must be between 1-99 months';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentUser) return;
    
    // Create implementation timeline from months
    const startDate = new Date();
    const goLiveDate = new Date();
    goLiveDate.setMonth(goLiveDate.getMonth() + formState.implementationMonths);
    
    addDeal({
      ...formState,
      implementationTimeline: {
        startDate,
        goLiveDate,
        durationMonths: formState.implementationMonths
      },
      ownerId: formState.ownerId || currentUser.id,
      product: formState.productId ? products.find(p => p.id === formState.productId) : undefined,
      expectedCloseDate: new Date(formState.expectedCloseDate),
      contacts: [],
      notes: [],
      tasks: [],
      isActive: true,
    });
    
    // Reset form and close dialog
    setFormState(initialState);
    onOpenChange(false);
  };

  const clientTypes: ClientType[] = ['Commercial', 'Medicaid', 'Medicare'];
  const leadSources: LeadSource[] = ['Referral', 'Website', 'Event', 'LinkedIn', 'Direct', 'Other'];
  const dealStages: DealStage[] = [
    'Lead Identified', 
    'Discovery Call', 
    'RFP/RFI Submitted', 
    'Demo Presented', 
    'Contract Negotiation',
    'Closed Won',
    'Closed Lost'
  ];

  // Get all products from the DealContext
  useEffect(() => {
    import('@/data/mockData').then((data) => {
      // Get products from mock data or create an empty array if none exist
      const mockProducts = (data as any).mockProducts || [];
      setProducts(mockProducts);
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
          <DialogDescription>
            Enter the details for the new deal opportunity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                name="clientName"
                value={formState.clientName}
                onChange={handleChange}
                className={errors.clientName ? 'border-destructive' : ''}
              />
              {errors.clientName && <p className="text-xs text-destructive">{errors.clientName}</p>}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dealValue">SaaS Contract Value ($)</Label>
                <Input
                  id="dealValue"
                  name="dealValue"
                  type="number"
                  value={formState.dealValue || ''}
                  onChange={handleChange}
                  className={errors.dealValue ? 'border-destructive' : ''}
                />
                {errors.dealValue && <p className="text-xs text-destructive">{errors.dealValue}</p>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientType">Client Type</Label>
                <Select 
                  value={formState.clientType} 
                  onValueChange={handleSelectChange('clientType')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ownerId">Deal Owner</Label>
                <Select 
                  value={formState.ownerId} 
                  onValueChange={handleSelectChange('ownerId')}
                >
                  <SelectTrigger className={errors.ownerId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select deal owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ownerId && <p className="text-xs text-destructive">{errors.ownerId}</p>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                <Input
                  id="expectedCloseDate"
                  name="expectedCloseDate"
                  type="date"
                  value={formState.expectedCloseDate}
                  onChange={handleChange}
                  className={errors.expectedCloseDate ? 'border-destructive' : ''}
                />
                {errors.expectedCloseDate && <p className="text-xs text-destructive">{errors.expectedCloseDate}</p>}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="leadSource">Lead Source</Label>
                <Select 
                  value={formState.leadSource} 
                  onValueChange={handleSelectChange('leadSource')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="stage">Initial Stage</Label>
                <Select 
                  value={formState.stage} 
                  onValueChange={handleSelectChange('stage')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="productId">Product</Label>
              <ProductSelect
                products={products}
                selectedProductId={formState.productId}
                onProductSelect={handleProductSelect}
                onProductAdd={handleAddProduct}
              />
            </div>
            
            <div className="border-t pt-4 mt-2">
              <h3 className="font-medium mb-4">Financial Details</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="annualRecurringRevenue">Annual Recurring Revenue (ARR)</Label>
                  <Input
                    id="annualRecurringRevenue"
                    name="annualRecurringRevenue"
                    type="number"
                    value={formState.annualRecurringRevenue || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="arrYear1">ARR Year 1</Label>
                  <Input
                    id="arrYear1"
                    name="arrYear1"
                    type="number"
                    value={formState.arrYear1 || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="implementationRevenue">Implementation Revenue</Label>
                  <Input
                    id="implementationRevenue"
                    name="implementationRevenue"
                    type="number"
                    value={formState.implementationRevenue || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="implementationMonths">Implementation Timeline (Months)</Label>
                  <Input
                    id="implementationMonths"
                    name="implementationMonths"
                    type="number"
                    min="1"
                    max="99"
                    value={formState.implementationMonths || ''}
                    onChange={handleChange}
                    className={errors.implementationMonths ? 'border-destructive' : ''}
                  />
                  {errors.implementationMonths && <p className="text-xs text-destructive">{errors.implementationMonths}</p>}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Deal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDealDialog;
