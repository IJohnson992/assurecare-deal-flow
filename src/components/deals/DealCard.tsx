
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Deal, stageProbability } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { mockUsers } from '@/data/mockData';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import DealStageProgress from './DealStageProgress';

interface DealCardProps {
  deal: Deal;
}

// Helper function to get the appropriate color for the stage badge
const getStageBadgeClass = (stage: string): string => {
  switch (stage) {
    case 'Lead Identified':
      return 'bg-stage-lead text-white';
    case 'Discovery Call':
      return 'bg-stage-discovery text-white';
    case 'RFP/RFI Submitted':
      return 'bg-stage-rfp text-white';
    case 'Demo Presented':
      return 'bg-stage-demo text-white';
    case 'Contract Negotiation':
      return 'bg-stage-negotiation text-white';
    case 'Closed Won':
      return 'bg-stage-closedwon text-white';
    case 'Closed Lost':
      return 'bg-stage-closedlost text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const DealCard = ({ deal }: DealCardProps) => {
  // Find the deal owner
  const owner = mockUsers.find(user => user.id === deal.ownerId);
  
  // Get primary contact if available
  const primaryContact = deal.contacts.find(contact => contact.isPrimary);
  
  // Format the last updated date
  const updatedDate = format(new Date(deal.updatedAt), 'MMM d, yyyy');
  
  // Calculate weighted values based on stage probability
  const probability = stageProbability[deal.stage] / 100;
  const weightedValue = deal.dealValue * probability;
  const weightedARR = (deal.annualRecurringRevenue || 0) * probability;

  return (
    <Link to={`/deal/${deal.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{deal.clientName}</h3>
            <p className="text-sm text-muted-foreground">{deal.clientType}</p>
          </div>
          <Badge className={getStageBadgeClass(deal.stage)}>
            {deal.stage}
          </Badge>
        </CardHeader>
        
        <CardContent className="p-4 pt-2 space-y-4">
          <DealStageProgress deal={deal} />
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">SaaS Value</p>
              <p className="font-semibold">{formatCurrency(deal.dealValue)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ARR</p>
              <p className="font-semibold">
                {formatCurrency(deal.annualRecurringRevenue || 0)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Weighted Value</p>
              <div className="font-semibold flex items-center">
                {formatCurrency(weightedValue)}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({stageProbability[deal.stage]}%)
                </span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Weighted ARR</p>
              <div className="font-semibold flex items-center">
                {formatCurrency(weightedARR)}
              </div>
            </div>
          </div>
          
          {primaryContact && (
            <div className="text-sm">
              <p className="text-muted-foreground">Primary Contact</p>
              <p>{primaryContact.name}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-2 flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={owner?.avatar} alt={owner?.name} />
              <AvatarFallback>{owner?.name.substring(0, 2) || 'UN'}</AvatarFallback>
            </Avatar>
            <span>{owner?.name || 'Unassigned'}</span>
          </div>
          <div>Updated {updatedDate}</div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default DealCard;
