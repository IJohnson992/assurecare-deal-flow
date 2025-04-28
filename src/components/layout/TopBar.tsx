
import { useState } from "react";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import NewDealDialog from "@/components/deals/NewDealDialog";

const TopBar = () => {
  const { toast } = useToast();
  const [showNewDealDialog, setShowNewDealDialog] = useState(false);

  const handleNotificationClick = () => {
    toast({
      title: "No new notifications",
      description: "You're all caught up!",
    });
  };

  return (
    <div className="bg-background border-b border-border h-16 flex items-center px-4 sm:px-6">
      <div className="flex-1 flex">
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md pl-10 pr-3 py-2 border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            placeholder="Search deals, clients..."
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="default" 
          className="flex items-center gap-2"
          onClick={() => setShowNewDealDialog(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Deal</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleNotificationClick}>
              <Bell className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="py-4 px-2 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <NewDealDialog 
        open={showNewDealDialog} 
        onOpenChange={setShowNewDealDialog} 
      />
    </div>
  );
};

export default TopBar;
