
import { Contact } from '@/types';
import { useDeal } from '@/context/DealContext';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Star, Trash } from 'lucide-react';

interface DealContactListProps {
  contacts: Contact[];
  dealId?: string; // Made dealId optional to match usage in DealPage.tsx
}

const DealContactList = ({ contacts, dealId }: DealContactListProps) => {
  const { updateContact, deleteContact } = useDeal();

  const handleSetPrimary = (contactId: string) => {
    updateContact(contactId, { isPrimary: true });
  };

  if (contacts.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No contacts found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map(contact => (
        <div key={contact.id} className="p-3 border rounded-md bg-background">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium flex items-center">
                {contact.name}
                {contact.isPrimary && (
                  <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                    Primary
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{contact.title}</div>
            </div>
            
            <div className="flex space-x-2">
              {!contact.isPrimary && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSetPrimary(contact.id)}
                  title="Set as primary"
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteContact(contact.id)}
                className="text-destructive hover:text-destructive"
                title="Delete contact"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
              <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                {contact.email}
              </a>
            </div>
            
            {contact.phone && (
              <div className="flex items-center">
                <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                  {contact.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DealContactList;
