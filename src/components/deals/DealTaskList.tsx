
import { format } from 'date-fns';
import { useDeal } from '@/context/DealContext';
import { Task } from '@/types';
import { AlertTriangle, Calendar, Check, CheckCircle, Clock } from 'lucide-react';
import { mockUsers } from '@/data/mockData';
import { Checkbox } from '@/components/ui/checkbox';

interface DealTaskListProps {
  tasks: Task[];
}

const DealTaskList = ({ tasks }: DealTaskListProps) => {
  const { completeTask } = useDeal();

  const getAssignedUser = (userId: string) => {
    return mockUsers.find(user => user.id === userId);
  };

  const isTaskOverdue = (task: Task) => {
    return !task.completed && new Date(task.dueDate) < new Date();
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No tasks found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div 
          key={task.id} 
          className={`p-3 border rounded-md ${task.completed ? 'bg-muted/30' : 'bg-background'}`}
        >
          <div className="flex items-start gap-3">
            <div>
              <Checkbox 
                checked={task.completed} 
                onCheckedChange={() => completeTask(task.id)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </div>
              {task.description && (
                <div className={`text-sm ${task.completed ? 'text-muted-foreground' : ''}`}>
                  {task.description}
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </div>
                
                {task.completed ? (
                  <div className="flex items-center text-stage-closedwon">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed {task.completedAt && format(new Date(task.completedAt), 'MMM d')}
                  </div>
                ) : isTaskOverdue(task) ? (
                  <div className="flex items-center text-destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </div>
                ) : null}
                
                <div className="flex items-center ml-auto">
                  {getAssignedUser(task.assignedTo)?.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DealTaskList;
