
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Deal, Task } from '@/types';
import { mockUsers } from '@/data/mockData';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ActivityFeedProps {
  deals: Deal[];
}

interface ActivityItem {
  id: string;
  type: 'stage_change' | 'note' | 'task';
  timestamp: Date;
  dealId: string;
  dealName: string;
  content: string;
  userId?: string;
}

const ActivityFeed = ({ deals }: ActivityFeedProps) => {
  const activityItems = useMemo(() => {
    const items: ActivityItem[] = [];

    // Process stage changes
    deals.forEach(deal => {
      deal.stageHistory.forEach((stageChange, index) => {
        // Skip the first stage (creation)
        if (index === 0) return;
        
        items.push({
          id: `stage-${deal.id}-${index}`,
          type: 'stage_change',
          timestamp: new Date(stageChange.timestamp),
          dealId: deal.id,
          dealName: deal.clientName,
          content: `Deal moved to ${stageChange.stage}`,
        });
      });
      
      // Process notes
      deal.notes.forEach(note => {
        items.push({
          id: note.id,
          type: 'note',
          timestamp: new Date(note.createdAt),
          dealId: deal.id,
          dealName: deal.clientName,
          content: note.content.length > 60 ? `${note.content.substring(0, 60)}...` : note.content,
          userId: note.userId,
        });
      });
      
      // Process tasks
      deal.tasks.forEach(task => {
        if (task.completed && task.completedAt) {
          items.push({
            id: task.id,
            type: 'task',
            timestamp: new Date(task.completedAt),
            dealId: deal.id,
            dealName: deal.clientName,
            content: `Task "${task.title}" completed`,
            userId: task.assignedTo,
          });
        }
      });
    });

    // Sort by timestamp (most recent first)
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [deals]);

  const getUserName = (userId?: string) => {
    if (!userId) return "Unknown";
    const user = mockUsers.find(user => user.id === userId);
    return user?.name || "Unknown";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your deals</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] overflow-y-auto">
        {activityItems.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No recent activity found
          </div>
        ) : (
          <div className="space-y-4">
            {activityItems.slice(0, 10).map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary"></div>
                <div>
                  <div className="text-sm font-medium">{item.dealName}</div>
                  <div className="text-sm">{item.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.userId && `${getUserName(item.userId)} • `}
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
