import { useState } from "react";
import { Menu, Bell, MessageSquare, Search, ChevronDown, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsPanel } from "./NotificationsPanel";

interface Props {
  onToggleSidebar: () => void;
  onToggleChat: () => void;
}

export function DashboardHeader({ onToggleSidebar, onToggleChat }: Props) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-card px-4 md:px-6 flex items-center gap-4 sticky top-0 z-30">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="shrink-0">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden md:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products, orders..." className="pl-9 bg-muted border-0" />
        </div>
      </div>

      <div className="flex-1 md:flex-none" />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onToggleChat} className="relative text-muted-foreground hover:text-primary">
          <MessageSquare className="h-5 w-5" />
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setNotifOpen(!notifOpen)} className="relative text-muted-foreground hover:text-primary">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-card" />
          </Button>
          <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                JD
              </div>
              <span className="hidden md:inline text-sm font-medium">John's Garage</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem><Settings className="h-4 w-4 mr-2" /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive"><LogOut className="h-4 w-4 mr-2" /> Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
