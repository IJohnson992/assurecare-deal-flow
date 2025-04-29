
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useContact } from '@/context/ContactContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ContactCard from '@/components/contacts/ContactCard';
import NewContactDialog from '@/components/contacts/NewContactDialog';

const Contacts = () => {
  const { contacts, isLoading } = useContact();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewContactDialog, setShowNewContactDialog] = useState(false);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          
          <Button onClick={() => setShowNewContactDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search contacts..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>No contacts found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {searchQuery ? 
                  "No contacts match your search criteria" : 
                  "You haven't added any contacts yet"
                }
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={() => setShowNewContactDialog(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map(contact => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </div>
      
      <NewContactDialog
        open={showNewContactDialog}
        onOpenChange={setShowNewContactDialog}
      />
    </Layout>
  );
};

export default Contacts;
