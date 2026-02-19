import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MoreVertical, UserPlus, Store, Shield, User } from "lucide-react";

const users = [
  { id: 1, name: "Ahmed's Auto Parts", email: "ahmed@autoparts.com", role: "Shop Owner", status: "Active", joined: "Jan 12, 2025", orders: 145 },
  { id: 2, name: "Quick Fix Motors", email: "quickfix@motors.com", role: "Shop Owner", status: "Active", joined: "Feb 3, 2025", orders: 89 },
  { id: 3, name: "Sara Mechanic", email: "sara@mechanic.com", role: "Mechanic", status: "Active", joined: "Mar 15, 2025", orders: 67 },
  { id: 4, name: "Ali Garage", email: "ali@garage.com", role: "Shop Owner", status: "Suspended", joined: "Apr 20, 2025", orders: 12 },
  { id: 5, name: "Pro Auto Center", email: "pro@autocenter.com", role: "Shop Owner", status: "Pending", joined: "May 1, 2025", orders: 0 },
  { id: 6, name: "John's Workshop", email: "john@workshop.com", role: "Mechanic", status: "Active", joined: "May 10, 2025", orders: 34 },
];

const roleIcons: Record<string, React.ReactNode> = {
  "Shop Owner": <Store className="h-3.5 w-3.5" />,
  "Mechanic": <User className="h-3.5 w-3.5" />,
  "Admin": <Shield className="h-3.5 w-3.5" />,
};

const statusStyles: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/20",
  Suspended: "bg-destructive/15 text-destructive border-destructive/20",
  Pending: "bg-warning/15 text-warning border-warning/20",
};

export default function UsersManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage shops, mechanics, and users</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left py-3 font-medium">User</th>
                  <th className="text-left py-3 font-medium">Role</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-left py-3 font-medium">Joined</th>
                  <th className="text-left py-3 font-medium">Orders</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {roleIcons[user.role]}
                        <span>{user.role}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{user.joined}</td>
                    <td className="py-3 font-medium">{user.orders}</td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
