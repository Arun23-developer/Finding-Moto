import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Globe, Bell, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SettingsState {
  siteName: string;
  adminEmail: string;
  supportPhone: string;
  notifications: {
    newOrder: boolean;
    newShop: boolean;
    lowStock: boolean;
    contactForm: boolean;
  };
  security: {
    twoFactor: boolean;
  };
  currentPassword: string;
  newPassword: string;
}

const SETTINGS_STORAGE_KEY = "admin.settings.v1";

const defaultSettings: SettingsState = {
  siteName: "Finding Moto",
  adminEmail: "admin@findingmoto.com",
  supportPhone: "+1 234 567 8900",
  notifications: {
    newOrder: true,
    newShop: true,
    lowStock: true,
    contactForm: true,
  },
  security: {
    twoFactor: false,
  },
  currentPassword: "",
  newPassword: "",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<SettingsState>;
      setSettings((prev) => ({
        ...prev,
        ...parsed,
        notifications: {
          ...prev.notifications,
          ...(parsed.notifications || {}),
        },
        security: {
          ...prev.security,
          ...(parsed.security || {}),
        },
      }));
    } catch {
      // Keep defaults when local storage is invalid.
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setSettings((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      toast({
        title: "Settings saved",
        description: "Your admin settings were updated successfully.",
      });
    } catch {
      toast({
        title: "Save failed",
        description: "Unable to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
            <Input
              value={settings.siteName}
              onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Admin Email</Label>
            <Input
              value={settings.adminEmail}
              onChange={(e) => setSettings((prev) => ({ ...prev, adminEmail: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Support Phone</Label>
            <Input
              value={settings.supportPhone}
              onChange={(e) => setSettings((prev) => ({ ...prev, supportPhone: e.target.value }))}
            />
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
            { key: "newOrder", label: "New order notifications", desc: "Get notified when a new order is placed" },
            { key: "newShop", label: "New shop registrations", desc: "Get notified when a new shop registers" },
            { key: "lowStock", label: "Low stock alerts", desc: "Get alerts when products are running low" },
            { key: "contactForm", label: "Contact form submissions", desc: "Get notified for new contact messages" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={settings.notifications[item.key as keyof SettingsState["notifications"]]}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      [item.key]: checked,
                    },
                  }))
                }
              />
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
            <Switch
              checked={settings.security.twoFactor}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  security: {
                    ...prev.security,
                    twoFactor: checked,
                  },
                }))
              }
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Change Password</Label>
            <Input
              type="password"
              placeholder="Current password"
              value={settings.currentPassword}
              onChange={(e) => setSettings((prev) => ({ ...prev, currentPassword: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="New password"
              value={settings.newPassword}
              onChange={(e) => setSettings((prev) => ({ ...prev, newPassword: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Button className="gap-2" onClick={handleSave} disabled={saving}>
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
