
import { format } from 'date-fns';
import { Note } from '@/types';
import { mockUsers } from '@/data/mockData';

interface DealNoteListProps {
  notes: Note[];
}

const DealNoteList = ({ notes }: DealNoteListProps) => {
  const getUser = (userId: string) => {
    return mockUsers.find(user => user.id === userId);
  };

  if (notes.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No notes found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map(note => {
        const user = getUser(note.userId);
        return (
          <div key={note.id} className="p-3 border rounded-md bg-background">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold">{user?.name.charAt(0)}</span>
                )}
              </div>
              <div className="ml-2">
                <div className="font-medium text-sm">{user?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </div>
            <div className="text-sm whitespace-pre-wrap">{note.content}</div>
          </div>
        );
      })}
    </div>
  );
};

export default DealNoteList;
