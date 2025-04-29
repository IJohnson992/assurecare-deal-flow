
import { useNavigate } from 'react-router-dom';
import { Contact } from '@/types';
import { format } from 'date-fns';
import { Mail, Phone, Briefcase, User } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ContactCardProps {
  contact: Contact;
}

const ContactCard = ({ contact }: ContactCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-1">
              {contact.name}
            </CardTitle>
            <CardDescription>
              {contact.title}
              {contact.company && ` at ${contact.company}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <a 
            href={`mailto:${contact.email}`}
            className="text-primary hover:underline"
          >
            {contact.email}
          </a>
        </div>
        
        {contact.phone && (
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <a 
              href={`tel:${contact.phone}`}
              className="text-primary hover:underline"
            >
              {contact.phone}
            </a>
          </div>
        )}
        
        {contact.company && (
          <div className="flex items-center text-sm">
            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{contact.company}</span>
          </div>
        )}
        
        <div className="flex items-center text-sm text-muted-foreground pt-2">
          <User className="h-4 w-4 mr-2" />
          <span>{contact.dealIds && contact.dealIds.length ? contact.dealIds.length : 0} associated deals</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`/contact/${contact.id}`)}
        >
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContactCard;
