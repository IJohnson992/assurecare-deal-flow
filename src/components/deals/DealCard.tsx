
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Deal } from '@/types';
import { BadgeCheck, Calendar, Clipboard, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import DealStageDropdown from './DealStageDropdown';
import { useDeal } from '@/context/DealContext';
import DealModal from './DealModal';

interface DealCardProps {
  deal: Deal;
}

const DealCard = ({ deal }: DealCardProps) => {
  const { toast } = useToast();
  const { updateDealStage } = useDeal();
  const [showDealModal, setShowDealModal] = useState(false);

  const getPrimaryContact = () => {
    return deal.contacts.find(contact => contact.isPrimary);
  };

  const primaryContact = getPrimaryContact();
  const upcomingTasks = deal.tasks.filter(task => !task.completed).length;
  const latestStageChange = deal.stageHistory[deal.stageHistory.length - 1];
  
  const getStageClassName = () => {
    const stageMap: Record<string, string> = {
      'Lead Identified': 'stage-lead',
      'Discovery Call': 'stage-discovery',
      'RFP/RFI Submitted': 'stage-rfp',
      'Demo Presented': 'stage-demo',
      'Contract Negotiation': 'stage-negotiation',
      'Closed Won': 'stage-closedwon',
      'Closed Lost': 'stage-closedlost',
    };
    
    return stageMap[deal.stage] || '';
  };

  const copyDealInfo = () => {
    const info = `
Deal: ${deal.clientName}
Value: ${formatCurrency(deal.dealValue)}
Stage: ${deal.stage}
Type: ${deal.clientType}
${primaryContact ? `Contact: ${primaryContact.name}, ${primaryContact.email}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(info);
    
    toast({
      title: "Copied to clipboard",
      description: "Deal information has been copied.",
    });
  };

  return (
    <>
      <Card className="deal-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">{deal.clientName}</CardTitle>
            <div className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStageClassName()}`}>
              {deal.stage}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{deal.clientType}</div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-xl font-semibold">{formatCurrency(deal.dealValue)}</div>
            {primaryContact && (
              <div className="text-sm">
                {primaryContact.name}, <span className="text-muted-foreground">{primaryContact.title}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              <span>
                In stage for{" "}
                {formatDistanceToNow(new Date(latestStageChange.timestamp), { addSuffix: false })}
              </span>
            </div>
            
            {upcomingTasks > 0 && (
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span>{upcomingTasks} upcoming {upcomingTasks === 1 ? 'task' : 'tasks'}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <DealStageDropdown 
            currentStage={deal.stage} 
            onStageChange={(stage) => updateDealStage(deal.id, stage)} 
          />
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={copyDealInfo}>
              <Clipboard className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowDealModal(true)}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <DealModal 
        deal={deal} 
        open={showDealModal} 
        onOpenChange={setShowDealModal} 
      />
    </>
  );
};

export default DealCard;
