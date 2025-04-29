
import { useState } from 'react';
import { useContact } from '@/context/ContactContext';
import { useDeal } from '@/context/DealContext';
import { ActivityType } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface LogActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  dealId?: string;
}

const LogActivityDialog = ({ 
  open, 
  onOpenChange, 
  contactId,
  dealId 
}: LogActivityDialogProps) => {
  const { addActivity } = useContact();
  const { deals } = useDeal();
  
  const [formData, setFormData] = useState({
    type: 'call' as ActivityType,
    title: '',
    description: '',
    selectedDealId: dealId || ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTypeChange = (value: ActivityType) => {
    setFormData(prev => ({ ...prev, type: value }));
  };
  
  const handleDealChange = (value: string) => {
    setFormData(prev => ({ ...prev, selectedDealId: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addActivity({
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      contactId,
      dealId: formData.selectedDealId || undefined,
      createdById: 'user-1', // Hardcoded for now
    });
    
    // Reset form and close dialog
    setFormData({
      type: 'call',
      title: '',
      description: '',
      selectedDealId: dealId || ''
    });
    
    onOpenChange(false);
  };
  
  // Get activity title placeholder based on type
  const getTitlePlaceholder = () => {
    switch (formData.type) {
      case 'call':
        return 'e.g., Introductory Call, Follow-up Call';
      case 'email':
        return 'e.g., Product Information, Proposal Follow-up';
      case 'meeting':
        return 'e.g., Product Demo, Kickoff Meeting';
      case 'note':
        return 'e.g., Contact Preferences, Key Information';
      default:
        return 'Enter activity title';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
            <DialogDescription>
              Record an interaction or note about this contact.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Activity Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleTypeChange(value as ActivityType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={getTitlePlaceholder()}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Details</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter details about this activity..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dealId">Related Deal (optional)</Label>
              <Select 
                value={formData.selectedDealId} 
                onValueChange={handleDealChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a deal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Deal</SelectItem>
                  {deals.map(deal => (
                    <SelectItem key={deal.id} value={deal.id}>
                      {deal.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              Log Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogActivityDialog;
