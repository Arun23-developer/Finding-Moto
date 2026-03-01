import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { AIChatPanel } from "./AIChatPanel";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <DashboardHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          onToggleChat={() => setChatOpen(!chatOpen)} 
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <AIChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
