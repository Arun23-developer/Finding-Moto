import { useState } from "react";
import { Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const mockServices = [
  { id: 1, name: "Engine Diagnostics", price: 75, duration: "1 hour", available: true, slots: ["9:00 AM", "11:00 AM", "2:00 PM"] },
  { id: 2, name: "Oil Change", price: 45, duration: "30 min", available: true, slots: ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"] },
  { id: 3, name: "Brake Inspection", price: 50, duration: "45 min", available: true, slots: ["10:00 AM", "2:00 PM"] },
  { id: 4, name: "Tire Rotation", price: 35, duration: "30 min", available: false, slots: [] },
  { id: 5, name: "Full Service Package", price: 199, duration: "3 hours", available: true, slots: ["9:00 AM"] },
];

export default function ServiceManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Services</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your garage services and availability</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground shadow-primary">
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Add New Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input placeholder="e.g. Engine Diagnostics" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input placeholder="e.g. 1 hour" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                <Input placeholder="e.g. 9:00 AM, 11:00 AM, 2:00 PM" />
              </div>
              <Button className="w-full gradient-primary text-primary-foreground" onClick={() => setDialogOpen(false)}>
                Add Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {mockServices.map((s) => (
          <div key={s.id} className="bg-card rounded-xl card-shadow hover:card-shadow-hover transition-shadow p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{s.name}</h3>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.available ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {s.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />${s.price}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{s.duration}</span>
                </div>
                {s.slots.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {s.slots.map((slot) => (
                      <span key={slot} className="text-xs bg-accent text-accent-foreground px-2.5 py-1 rounded-md font-medium">
                        {slot}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={s.available} />
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
