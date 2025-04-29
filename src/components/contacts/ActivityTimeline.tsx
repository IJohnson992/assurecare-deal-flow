
import { format } from 'date-fns';
import { Activity } from '@/types';
import { mockUsers } from '@/data/mockData';
import { useDeal } from '@/context/DealContext';
import { 
  Phone, 
  Mail, 
  Calendar, 
  MessageCircle, 
  CheckCircle,
  ArrowRightCircle
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
  showDealInfo?: boolean;
}

const ActivityTimeline = ({ activities, showDealInfo = false }: ActivityTimelineProps) => {
  const { deals } = useDeal();
  
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'note':
        return <MessageCircle className="h-4 w-4" />;
      case 'task':
        return <CheckCircle className="h-4 w-4" />;
      case 'stage_change':
        return <ArrowRightCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };
  
  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'call':
        return 'bg-blue-500 text-white';
      case 'email':
        return 'bg-green-500 text-white';
      case 'meeting':
        return 'bg-purple-500 text-white';
      case 'note':
        return 'bg-gray-500 text-white';
      case 'task':
        return 'bg-stage-closedwon text-white';
      case 'stage_change':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };
  
  const getDealName = (dealId?: string) => {
    if (!dealId) return null;
    
    const deal = deals.find(d => d.id === dealId);
    return deal?.clientName || 'Unknown Deal';
  };
  
  if (activities.length === 0) {
    return null;
  }
  
  return (
    <div className="relative space-y-4 ml-2">
      {/* Vertical timeline line */}
      <div className="absolute left-4 top-5 bottom-5 w-px bg-gray-200 -ml-px"></div>
      
      {activities.map(activity => (
        <div key={activity.id} className="flex gap-4 relative">
          {/* Activity icon */}
          <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          
          {/* Activity content */}
          <div className="flex-1">
            <div className="bg-white p-3 border rounded-md">
              <div className="font-medium">{activity.title}</div>
              {activity.description && (
                <p className="text-sm mt-1">{activity.description}</p>
              )}
              
              {showDealInfo && activity.dealId && (
                <p className="text-sm mt-1 text-muted-foreground">
                  Related to deal: {getDealName(activity.dealId)}
                </p>
              )}
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground mt-1 mx-1">
              <div>{getUserName(activity.createdById)}</div>
              <div>{format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
