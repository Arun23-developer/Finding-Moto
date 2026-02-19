import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Globe, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your admin preferences</p>
      </div>

      {/* General */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input defaultValue="Finding Moto" />
          </div>
          <div className="space-y-2">
            <Label>Admin Email</Label>
            <Input defaultValue="admin@findingmoto.com" />
          </div>
          <div className="space-y-2">
            <Label>Support Phone</Label>
            <Input defaultValue="+1 234 567 8900" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "New order notifications", desc: "Get notified when a new order is placed" },
            { label: "New shop registrations", desc: "Get notified when a new shop registers" },
            { label: "Low stock alerts", desc: "Get alerts when products are running low" },
            { label: "Contact form submissions", desc: "Get notified for new contact messages" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Change Password</Label>
            <Input type="password" placeholder="Current password" />
            <Input type="password" placeholder="New password" />
          </div>
        </CardContent>
      </Card>

      <Button className="gap-2">
        <Save className="h-4 w-4" />
        Save Changes
      </Button>
    </div>
  );
}
