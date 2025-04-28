
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDeal } from '@/context/DealContext';
import { ClientType, DealStage, LeadSource } from '@/types';
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

interface NewDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewDealDialog = ({ open, onOpenChange }: NewDealDialogProps) => {
  const { currentUser } = useAuth();
  const { addDeal } = useDeal();

  const initialState = {
    clientName: '',
    dealValue: 0,
    clientType: 'Commercial' as ClientType,
    leadSource: 'Website' as LeadSource,
    stage: 'Lead Identified' as DealStage,
  };

  const [formState, setFormState] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormState(prev => ({
      ...prev,
      [name]: name === 'dealValue' ? parseFloat(value) || 0 : value
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    
    if (formState.dealValue <= 0) {
      newErrors.dealValue = 'Deal value must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentUser) return;
    
    addDeal({
      ...formState,
      ownerId: currentUser.id,
      contacts: [],
      notes: [],
      tasks: [],
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
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
            
            <div className="grid gap-2">
              <Label htmlFor="dealValue">Deal Value ($)</Label>
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
          <DialogFooter>
            <Button type="submit">Create Deal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDealDialog;
