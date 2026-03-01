import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, MapPin, Phone, Mail, Store } from "lucide-react";

export default function ProfileManagement() {
  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your shop/garage information</p>
      </div>

      {/* Shop Info */}
      <div className="bg-card rounded-xl card-shadow p-6 space-y-5">
        <h3 className="font-display font-semibold flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> Shop Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Shop/Garage Name</Label>
            <Input defaultValue="John's Auto Garage" />
          </div>
          <div className="space-y-2">
            <Label>Seller Type</Label>
            <Select defaultValue="both">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mechanic">Mechanic Only</SelectItem>
                <SelectItem value="parts">Spare Parts Only</SelectItem>
                <SelectItem value="both">Mechanic + Spare Parts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea defaultValue="Full-service auto garage specializing in diagnostics, brake services, and quality spare parts." rows={3} />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-card rounded-xl card-shadow p-6 space-y-5">
        <h3 className="font-display font-semibold flex items-center gap-2"><Phone className="h-5 w-5 text-primary" /> Contact Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input defaultValue="+1 (555) 123-4567" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue="john@autogarage.com" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-card rounded-xl card-shadow p-6 space-y-5">
        <h3 className="font-display font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Location</h3>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input defaultValue="123 Main Street" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input defaultValue="Springfield" />
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input defaultValue="IL" />
          </div>
          <div className="space-y-2">
            <Label>ZIP Code</Label>
            <Input defaultValue="62701" />
          </div>
        </div>
      </div>

      <Button className="gradient-primary text-primary-foreground shadow-primary">
        <Save className="h-4 w-4 mr-2" /> Save Changes
      </Button>
    </div>
  );
}
